#!/usr/bin/env node
// Carga en la base los espacios culturales relevados del sitio anterior (db/contenido/espacios-culturales.json)
// y baja sus fotos a la carpeta de medios (MEDIA_DIR, por defecto ./media), que se publica en /media.
//
// Por defecto sólo agrega los lugares que faltan: si un lugar ya existe (por slug) no lo toca, así no pisa
// lo que se haya editado después. Con --actualizar reemplaza los datos de los que ya existen.
// Las fotos que ya están en disco no se vuelven a bajar.
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const actualizar = process.argv.includes("--actualizar");
const mediaDir = process.env.MEDIA_DIR || join(root, "media");

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL. Definila en .env o .env.local.");
  process.exit(1);
}

const { espacios } = JSON.parse(await readFile(join(root, "db", "contenido", "espacios-culturales.json"), "utf8"));
const sql = postgres(process.env.DATABASE_URL, { max: 1, onnotice: () => {} });

// Devuelve la ruta pública (/media/lugares/<slug>/<archivo>) de la foto, bajándola si hace falta.
async function bajar(url, slug) {
  const archivo = decodeURIComponent(basename(new URL(url).pathname));
  const destino = join(mediaDir, "lugares", slug, archivo);
  const publica = `/media/lugares/${slug}/${archivo}`;
  if ((await stat(destino).catch(() => null))?.size) return { publica, bajada: false };

  const respuesta = await fetch(url);
  const tipo = respuesta.headers.get("content-type") ?? "";
  if (!respuesta.ok || !tipo.startsWith("image/")) throw new Error(`${url} respondió ${respuesta.status} (${tipo})`);
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, Buffer.from(await respuesta.arrayBuffer()));
  return { publica, bajada: true };
}

let fotosBajadas = 0;
try {
  for (const espacio of espacios) {
    const imagen = await bajar(espacio.image, espacio.slug);
    const galeria = [];
    for (const url of espacio.gallery) galeria.push(await bajar(url, espacio.slug));
    fotosBajadas += [imagen, ...galeria].filter((foto) => foto.bajada).length;

    const datos = {
      slug: espacio.slug,
      name: espacio.name,
      type: espacio.type,
      summary: espacio.summary,
      description: espacio.description.join("\n\n"),
      address: espacio.address,
      phone: espacio.phone,
      opening_hours: sql.json({ lineas: espacio.opening_hours }),
      social_links: sql.json(espacio.social_links),
      services: espacio.services,
      main_image_path: imagen.publica,
      gallery_paths: galeria.map((foto) => foto.publica),
      status: "published",
    };
    const columnas = Object.keys(datos);
    const [fila] = actualizar
      ? await sql`insert into public.places ${sql(datos, columnas)}
          on conflict (slug) do update set ${sql(datos, columnas.filter((c) => c !== "slug"))}
          returning (xmax = 0) as nuevo`
      : await sql`insert into public.places ${sql(datos, columnas)}
          on conflict (slug) do nothing
          returning true as nuevo`;
    const estado = !fila ? "ya existía, sin cambios" : fila.nuevo ? "agregado" : "actualizado";
    console.log(`${espacio.slug}: ${estado} (${galeria.length} fotos de galería)`);
  }
  console.log(`Listo: ${espacios.length} espacios, ${fotosBajadas} fotos nuevas en ${mediaDir}.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
