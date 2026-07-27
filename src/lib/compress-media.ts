import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import sharp from 'sharp'

const IMAGE_MIME = /^image\/(jpeg|png|gif|tiff|bmp|webp|avif)$/i
const VIDEO_MIME = /^video\//i

type UploadFile = {
  data: Buffer
  mimetype: string
  name: string
  size: number
}

function replaceExtension(filename: string, ext: string): string {
  const base = filename.includes('.') ? filename.replace(/\.[^.]+$/, '') : filename
  return `${base}.${ext}`
}

/** Longest edge kept on the stored original. Big enough for a full-bleed hero on a
 * 2x display, small enough that a 4000x3000 phone photo can't be served as-is.
 * Downscale only — `withoutEnlargement` leaves anything smaller untouched. */
export const MAX_IMAGE_EDGE = 2560

async function convertImageToWebp(file: UploadFile): Promise<UploadFile> {
  // Note: no early return for files that are already WebP. They still need the resize
  // pass — otherwise a 4000x3000 WebP sails straight through untouched, which is
  // exactly the case this is here to prevent.
  const data = await sharp(file.data)
    .rotate()
    .resize({
      width: MAX_IMAGE_EDGE,
      height: MAX_IMAGE_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 82, effort: 4 })
    .toBuffer()

  return {
    data,
    mimetype: 'image/webp',
    name: replaceExtension(file.name, 'webp'),
    size: data.length,
  }
}

async function convertVideoToWebm(file: UploadFile): Promise<UploadFile> {
  if (file.mimetype === 'video/webm') return file

  // Lazy-load so Turbopack / Payload RSC graph does not bundle native ffmpeg paths
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

/** Convert uploaded images to WebP and videos to WebM before Payload stores them. */
export async function compressUploadFile(file: UploadFile): Promise<UploadFile> {
  if (IMAGE_MIME.test(file.mimetype)) {
    return convertImageToWebp(file)
  }
  if (VIDEO_MIME.test(file.mimetype)) {
    return convertVideoToWebm(file)
  }
  return file
}
