import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import sharp, { type Sharp } from 'sharp'

const IMAGE_MIME = /^image\/(jpeg|png|gif|tiff|bmp|webp|avif)$/i
const VIDEO_MIME = /^video\//i

/** Default path keeps WebP (images) / WebM (video). Explicit values force that format. */
export type ConvertFormat =
  | 'optimized'
  | 'original'
  | 'webp'
  | 'avif'
  | 'jpeg'
  | 'png'
  | 'webm'
  | 'mp4'

export type CompressOptions = {
  convertFormat?: string | null
  /** Longest edge in px, or `'none'`. Named presets and custom numbers both work. */
  maxDimension?: string | null
  /** Named preset (`balanced`/`high`/`small`) or a numeric 1–100 string. */
  imageQuality?: string | null
}

type UploadFile = {
  data: Buffer
  mimetype: string
  name: string
  size: number
}

type ImageTarget = 'webp' | 'avif' | 'jpeg' | 'png'
type VideoTarget = 'webm' | 'mp4'

const QUALITY_PRESETS: Record<string, number> = {
  high: 90,
  balanced: 82,
  small: 70,
}

const IMAGE_TARGETS = new Set<ImageTarget>(['webp', 'avif', 'jpeg', 'png'])
const VIDEO_TARGETS = new Set<VideoTarget>(['webm', 'mp4'])

function replaceExtension(filename: string, ext: string): string {
  const base = filename.includes('.') ? filename.replace(/\.[^.]+$/, '') : filename
  return `${base}.${ext}`
}

/** Longest edge kept on the stored original. Big enough for a full-bleed hero on a 2x
 * display, small enough that a 4000x3000 phone photo can't be served as-is. Downscale
 * only: `withoutEnlargement` leaves anything smaller untouched.
 *
 * This is the **default**, not a ceiling: the media library's "Maks. rozmiar" field
 * overrides it per upload, and `'none'` opts out entirely. See `resolveMaxEdge`. */
export const MAX_IMAGE_EDGE = 2560

export function resolveQuality(quality: string | null | undefined): number {
  if (!quality) return QUALITY_PRESETS.balanced
  if (quality in QUALITY_PRESETS) return QUALITY_PRESETS[quality]!
  const n = Number(quality)
  if (Number.isFinite(n) && n >= 1 && n <= 100) return Math.round(n)
  return QUALITY_PRESETS.balanced
}

export function resolveMaxEdge(maxDimension: string | null | undefined): number | null {
  // Unset means "apply the default guard", not "leave it alone": `'none'` is how an
  // opt-out is expressed. The media-library branch returned null for both, which would let
  // any upload that never touched the field through at full size; that is precisely the
  // case MAX_IMAGE_EDGE exists to stop.
  if (maxDimension === 'none') return null
  if (!maxDimension) return MAX_IMAGE_EDGE
  const n = Number(maxDimension)
  return Number.isFinite(n) && n > 0 ? n : MAX_IMAGE_EDGE
}

function resolveImageTarget(format: string | null | undefined): ImageTarget | 'original' {
  const value = format ?? 'optimized'
  if (value === 'original') return 'original'
  if (value === 'optimized') return 'webp'
  if (IMAGE_TARGETS.has(value as ImageTarget)) return value as ImageTarget
  // Video-only targets on an image upload → keep the default optimized path.
  return 'webp'
}

function resolveVideoTarget(format: string | null | undefined): VideoTarget | 'original' {
  const value = format ?? 'optimized'
  if (value === 'original') return 'original'
  if (value === 'optimized') return 'webm'
  if (VIDEO_TARGETS.has(value as VideoTarget)) return value as VideoTarget
  // Image-only targets on a video upload → keep the default optimized path.
  return 'webm'
}

async function resizeIfNeeded(pipeline: Sharp, maxEdge: number | null): Promise<Sharp> {
  if (!maxEdge) return pipeline

  const meta = await pipeline.metadata()
  const width = meta.width ?? 0
  const height = meta.height ?? 0
  if (!width || !height) return pipeline
  if (width <= maxEdge && height <= maxEdge) return pipeline

  return pipeline.resize({
    width: maxEdge,
    height: maxEdge,
    fit: 'inside',
    withoutEnlargement: true,
  })
}

async function encodeImage(
  pipeline: Sharp,
  target: ImageTarget,
  quality: number,
): Promise<{ data: Buffer; mimetype: string; ext: string }> {
  switch (target) {
    case 'avif':
      return {
        data: await pipeline.avif({ quality, effort: 4 }).toBuffer(),
        mimetype: 'image/avif',
        ext: 'avif',
      }
    case 'jpeg':
      return {
        data: await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer(),
        mimetype: 'image/jpeg',
        ext: 'jpg',
      }
    case 'png':
      return {
        data: await pipeline.png({ compressionLevel: 9 }).toBuffer(),
        mimetype: 'image/png',
        ext: 'png',
      }
    case 'webp':
    default:
      return {
        data: await pipeline.webp({ quality, effort: 4 }).toBuffer(),
        mimetype: 'image/webp',
        ext: 'webp',
      }
  }
}

async function convertImage(file: UploadFile, options: CompressOptions): Promise<UploadFile> {
  const target = resolveImageTarget(options.convertFormat)
  const maxEdge = resolveMaxEdge(options.maxDimension)

  if (target === 'original') {
    if (!maxEdge) return file
    const data = await resizeIfNeeded(sharp(file.data).rotate(), maxEdge).then((p) => p.toBuffer())
    return { ...file, data, size: data.length }
  }

  const quality = resolveQuality(options.imageQuality)
  let pipeline = sharp(file.data).rotate()
  pipeline = await resizeIfNeeded(pipeline, maxEdge)
  const encoded = await encodeImage(pipeline, target, quality)

  return {
    data: encoded.data,
    mimetype: encoded.mimetype,
    name: replaceExtension(file.name, encoded.ext),
    size: encoded.data.length,
  }
}

async function runFfmpeg(
  file: UploadFile,
  outputExt: string,
  outputOptions: string[],
  mimetype: string,
): Promise<UploadFile> {
  const [{ default: ffmpegInstaller }, { default: ffmpeg }] = await Promise.all([
    import('@ffmpeg-installer/ffmpeg'),
    import('fluent-ffmpeg'),
  ])

  ffmpeg.setFfmpegPath(ffmpegInstaller.path)

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bw-media-'))
  const inputPath = path.join(tmpDir, `in-${randomUUID()}${path.extname(file.name) || '.bin'}`)
  const outputPath = path.join(tmpDir, `out-${randomUUID()}.${outputExt}`)

  try {
    await fs.writeFile(inputPath, file.data)

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions(outputOptions)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .save(outputPath)
    })

    const data = await fs.readFile(outputPath)
    return {
      data,
      mimetype,
      name: replaceExtension(file.name, outputExt),
      size: data.length,
    }
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined)
  }
}

async function convertVideo(file: UploadFile, options: CompressOptions): Promise<UploadFile> {
  const target = resolveVideoTarget(options.convertFormat)
  if (target === 'original') return file

  if (target === 'webm') {
    if (file.mimetype === 'video/webm') return file
    return runFfmpeg(
      file,
      'webm',
      [
        '-c:v',
        'libvpx-vp9',
        '-b:v',
        '0',
        '-crf',
        '32',
        '-c:a',
        'libopus',
        '-b:a',
        '128k',
        '-row-mt',
        '1',
      ],
      'video/webm',
    )
  }

  if (file.mimetype === 'video/mp4') return file
  return runFfmpeg(
    file,
    'mp4',
    ['-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart'],
    'video/mp4',
  )
}

/** Convert / resize uploads before Payload stores them. */
export async function compressUploadFile(
  file: UploadFile,
  options: CompressOptions = {},
): Promise<UploadFile> {
  if (IMAGE_MIME.test(file.mimetype)) {
    return convertImage(file, options)
  }

  if (VIDEO_MIME.test(file.mimetype)) {
    return convertVideo(file, options)
  }

  return file
}
