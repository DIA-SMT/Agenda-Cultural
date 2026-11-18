import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { MEDIA_TYPES, mediaDir } from "@/lib/media";

const notFound = () => new Response("Archivo no encontrado", { status: 404 });

// En la VPS nginx sirve /media/ directo del disco; esta ruta hace falta igual porque el optimizador
// de next/image le pide el original al propio Next, no a nginx. También es la que se usa en desarrollo.
export async function GET(_: Request, { params }: { params: Promise<{ ruta: string[] }> }) {
  const { ruta } = await params;
  const base = resolve(mediaDir());
  const file = resolve(base, ...ruta);
  // Nada fuera de la carpeta de medios, aunque la ruta traiga "..".
  if (!file.startsWith(base + sep)) return notFound();

  const type = MEDIA_TYPES[extname(file).toLowerCase()];
  if (!type) return notFound();

  try {
    const data = await readFile(file);
    return new Response(data, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return notFound();
  }
}
