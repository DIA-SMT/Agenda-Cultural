import { join } from "node:path";

// Fotos y archivos del contenido (lugares, eventos y lo que se suba desde el panel). En la VPS vive
// fuera de las versiones (MEDIA_DIR=/srv/agenda/media) para sobrevivir a cada despliegue.
export function mediaDir() {
  return process.env.MEDIA_DIR || join(process.cwd(), "media");
}

export const MEDIA_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};
