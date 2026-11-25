import { supabase } from '../lib/config';

const BUCKET = 'product-images';
const MAX_SIDE = 1400;
const TYPES: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/avif': 'avif' };

/** Shrinks phone photos before upload so pages stay fast and free storage lasts. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error(`${file.name} isn't a photo this browser can open. Use JPG, PNG or WebP.`);
  });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    // Safari may return PNG here instead of WebP; both are accepted.
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error(`${file.name} couldn't be prepared.`))), 'image/webp', 0.85));
}

export async function uploadPhoto(file: File): Promise<string> {
  const blob = await shrink(file);
  const path = `${crypto.randomUUID()}.${TYPES[blob.type] ?? 'png'}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: '31536000' });
  if (error) throw new Error(`${file.name} didn't upload: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Removes uploaded files. Bundled sample images and outside links are ignored. */
export async function deletePhotos(urls: string[]) {
  const marker = `/object/public/${BUCKET}/`;
  const paths = urls.filter((u) => u.includes(marker)).map((u) => decodeURIComponent(u.split(marker)[1]));
  if (!paths.length) return;
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) console.error('Photo cleanup failed', error);
}
