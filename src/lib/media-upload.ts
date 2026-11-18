import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { mediaDir } from "@/lib/media";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// El tipo se decide por los primeros bytes, no por el nombre ni por lo que dice el navegador.
function sniffImage(bytes: Uint8Array): string | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return ".jpg";
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return ".png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return ".webp";
  if (ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) return ".avif";
  return null;
}

export class UploadError extends Error {}

/**
 * Guarda una imagen subida desde el panel en MEDIA_DIR/<carpeta>/<año>/<uuid>.<ext> y devuelve su ruta pública.
 * El nombre es nuevo siempre: así nginx y los navegadores pueden guardar las fotos en caché sin miedo.
 */
export async function saveImage(file: File, folder: "eventos" | "lugares") {
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`"${file.name}" pesa más de 10 MB.`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const extension = sniffImage(bytes);
  if (!extension) throw new UploadError(`"${file.name}" no es una imagen JPG, PNG, WebP o AVIF.`);

  const year = String(new Date().getFullYear());
  const name = `${randomUUID()}${extension}`;
  await mkdir(join(mediaDir(), folder, year), { recursive: true });
  await writeFile(join(mediaDir(), folder, year, name), bytes);
  return `/media/${folder}/${year}/${name}`;
}
