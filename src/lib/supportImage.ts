import { SUPPORT_IMAGE_MAX_BYTES, SUPPORT_IMAGE_TYPES } from '@/lib/supportValidation';

type SupportImageType = (typeof SUPPORT_IMAGE_TYPES)[number];

const MAX_EDGE_STEPS = [1600, 1280];
const QUALITY_STEPS = [0.85, 0.75];

export async function detectImageType(file: File): Promise<SupportImageType | null> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const startsWith = (signature: number[], offset = 0) =>
    signature.every((byte, index) => bytes[offset + index] === byte);

  if (startsWith([0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) return 'image/webp';
  return null;
}

function encode(
  canvas: HTMLCanvasElement,
  type: 'image/webp' | 'image/jpeg',
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function drawScaled(source: ImageBitmap, maxEdge: number): Promise<HTMLCanvasElement> {
  const scale = Math.min(1, maxEdge / Math.max(source.width, source.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not process this image.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function compressImageForUpload(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('This image could not be read. Please try another file.');
  }

  try {
    for (const maxEdge of MAX_EDGE_STEPS) {
      const canvas = await drawScaled(bitmap, maxEdge);
      for (const quality of QUALITY_STEPS) {
        const webp = await encode(canvas, 'image/webp', quality);
        const blob = webp && webp.type === 'image/webp' ? webp : await encode(canvas, 'image/jpeg', quality);
        if (!blob) continue;
        if (blob.size <= SUPPORT_IMAGE_MAX_BYTES) {
          const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
          return new File([blob], `photo.${extension}`, { type: blob.type });
        }
      }
    }
  } finally {
    bitmap.close();
  }

  throw new Error('This image is too large. Please choose a smaller photo.');
}
