import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import sharp, { type Sharp } from 'sharp'

const IMAGE_MIME = /^image\/(jpeg|png|gif|tiff|bmp|webp|avif)$/i
const VIDEO_MIME = /^video\//i

export type ConvertFormat = 'optimized' | 'original' | 'avif'
export type MaxDimension = 'none' | '1280' | '1920' | '2560'
export type ImageQuality = 'high' | 'balanced' | 'small'

export type CompressOptions = {
  convertFormat?: ConvertFormat | null
  maxDimension?: MaxDimension | null
  imageQuality?: ImageQuality | null
}

type UploadFile = {
  data: Buffer
  mimetype: string
  name: string
  size: number
}

const QUALITY: Record<ImageQuality, number> = {
  high: 90,
  balanced: 82,
  small: 70,
}

function replaceExtension(filename: string, ext: string): string {
  const base = filename.includes('.') ? filename.replace(/\.[^.]+$/, '') : filename
  return `${base}.${ext}`
}

function resolveQuality(quality: ImageQuality | null | undefined): number {
  return QUALITY[quality ?? 'balanced']
}

function resolveMaxEdge(maxDimension: MaxDimension | null | undefined): number | null {
  if (!maxDimension || maxDimension === 'none') return null
  const n = Number(maxDimension)
  return Number.isFinite(n) && n > 0 ? n : null
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

async function convertImage(
  file: UploadFile,
  options: CompressOptions,
): Promise<UploadFile> {
  const format = options.convertFormat ?? 'optimized'
  if (format === 'original') {
    const maxEdge = resolveMaxEdge(options.maxDimension)
    if (!maxEdge) return file

    const data = await resizeIfNeeded(sharp(file.data).rotate(), maxEdge).then((p) =>
      p.toBuffer(),
    )
    return { ...file, data, size: data.length }
  }

  const targetFormat = format === 'avif' ? 'avif' : 'webp'
  const mimetype = targetFormat === 'avif' ? 'image/avif' : 'image/webp'
  const quality = resolveQuality(options.imageQuality)
  const maxEdge = resolveMaxEdge(options.maxDimension)

  let pipeline = sharp(file.data).rotate()
  pipeline = await resizeIfNeeded(pipeline, maxEdge)

  const data =
    targetFormat === 'avif'
      ? await pipeline.avif({ quality, effort: 4 }).toBuffer()
      : await pipeline.webp({ quality, effort: 4 }).toBuffer()

  return {
    data,
    mimetype,
    name: replaceExtension(file.name, targetFormat),
    size: data.length,
  }
}

async function convertVideoToWebm(file: UploadFile): Promise<UploadFile> {
  if (file.mimetype === 'video/webm') return file

  const [{ default: ffmpegInstaller }, { default: ffmpeg }] = await Promise.all([
    import('@ffmpeg-installer/ffmpeg'),
    import('fluent-ffmpeg'),
  ])

  ffmpeg.setFfmpegPath(ffmpegInstaller.path)

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bw-media-'))
  const inputPath = path.join(tmpDir, `in-${randomUUID()}${path.extname(file.name) || '.bin'}`)
  const outputPath = path.join(tmpDir, `out-${randomUUID()}.webm`)

  try {
    await fs.writeFile(inputPath, file.data)

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
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
        ])
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .save(outputPath)
    })

    const data = await fs.readFile(outputPath)
    return {
      data,
      mimetype: 'video/webm',
      name: replaceExtension(file.name, 'webm'),
      size: data.length,
    }
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => undefined)
  }
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
    const format = options.convertFormat ?? 'optimized'
    if (format === 'original') return file
    return convertVideoToWebm(file)
  }

  return file
}
