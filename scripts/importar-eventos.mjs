#!/usr/bin/env node
// Importa los eventos del sitio anterior (WordPress + EventON en agendaculturalsmt.com).
//
//   npm run db:eventos                       prueba en seco: baja todo, arma el plan y escribe el informe
//   npm run db:eventos -- --escribir         además carga en la base y baja las imágenes a MEDIA_DIR
//   npm run db:eventos -- --escribir --actualizar   reemplaza los eventos ya importados (pisa lo editado,
//                                                   salvo el destacado y el estado, que se deciden en el panel)
//   --reporte archivo.json                   dónde dejar el informe (por defecto importacion-eventos.json)
//
// Cada evento se identifica por su id de WordPress (legacy_id): correrlo de nuevo no duplica nada.
// El mapeo está en src/lib/importacion/eventon.mjs; la escritura, en src/lib/importacion/escribir.mjs.
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { buildPlan, summarize } from "../src/lib/importacion/eventon.mjs";
import { writePlan } from "../src/lib/importacion/escribir.mjs";

const SITE = "https://agendaculturalsmt.com";
const HEADERS = { "User-Agent": "AgendaCulturalSMT-importador/1.0" };
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const write = args.includes("--escribir");
const update = args.includes("--actualizar");
const reportIndex = args.indexOf("--reporte");
const reportPath = resolve(reportIndex >= 0 && args[reportIndex + 1] ? args[reportIndex + 1] : "importacion-eventos.json");
const mediaDir = process.env.MEDIA_DIR || join(root, "media");

if (write && !process.env.DATABASE_URL) {
  console.error("Para escribir hace falta DATABASE_URL (en .env o .env.local).");
  process.exit(1);
}

async function getJson(url, init) {
  const response = await fetch(url, { ...init, headers: { ...HEADERS, ...init?.headers } });
  if (!response.ok) throw new Error(`${url} respondió ${response.status}`);
  return response.json();
}

async function allPages(path) {
  const items = [];
  for (let page = 1; ; page++) {
    const batch = await getJson(`${SITE}/wp-json/wp/v2/${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
    items.push(...batch);
    if (batch.length < 100) return items;
  }
}

// Mismos parámetros que manda el calendario de /que-hacer/ (EventON 5.0.2), con un rango que cubre todo.
const CALENDAR = {"accord":"no","bottom_nav":"no","cal_id":"","cal_init_nonajax":"no","calendar_type":"default","day_incre":"0","ep_fields":"","etc_override":"no","evc_open":"no","event_count":"0","event_location":"all","event_order":"ASC","event_organizer":"all","event_parts":"no","event_past_future":"all","event_status":"all","event_tag":"all","event_type":"all","event_type_2":"all","event_type_3":"all","event_virtual":"all","eventtop_date_style":"0","eventtop_style":"2","exp_jumper":"no","exp_so":"no","filter_relationship":"AND","filter_show_set_only":"no","filter_style":"default","filter_type":"default","filters":"yes","fixed_day":"1","fixed_month":"1","fixed_year":"2020","focusmap":"no","ft_event_priority":"no","grid_ux":"0","heat":"no","hide_arrows":"no","hide_cancels":"no","hide_empty_months":"no","hide_end_time":"no","hide_et_dn":"no","hide_et_extra":"no","hide_et_tags":"no","hide_et_tl":"no","hide_ft":"no","hide_ft_img":"no","hide_month_headers":"no","hide_mult_occur":"no","hide_past":"no","hide_past_by":"ee","hide_so":"no","hide_sort_options":"no","hover":"number","ics":"no","jumper":"no","jumper_count":"5","jumper_offset":"0","lang":"L1","layout_changer":"no","lightbox":"no","livenow_bar":"yes","load_fullmonth":"no","loc_page":"no","map_height":"400","map_title":"","map_type":"monthly","mapformat":"roadmap","mapiconurl":"","maps_load":"yes","mapscroll":"true","mapzoom":"18","members_only":"no","ml_priority":"no","ml_toend":"no","mo1st":"","month_incre":"0","nexttogrid":"no","number_of_months":"1","only_ft":"no","pec":"","s":"","search":"","search_all":"no","sep_month":"no","show_alle":"no","show_et_ft_img":"no","show_limit":"no","show_limit_ajax":"no","show_limit_paged":"1","show_limit_redir":"","show_repeats":"no","show_search":"no","show_upcoming":"0","show_year":"no","social_share":"no","sort_by":"sort_date","style":"","tile_bg":"0","tile_bg_size":"full","tile_count":"2","tile_height":"0","tile_style":"0","tiles":"no","ux_val":"0","view_switcher":"no","wpml_l1":"","wpml_l2":"","wpml_l3":"","x_ids":"","yl_priority":"no","yl_toend":"no","_cver":"5.0.2"};

async function eventOnCalendar() {
  // El calendario exige el nonce que la página publica para visitantes.
  const page = await (await fetch(`${SITE}/que-hacer/`, { headers: HEADERS })).text();
  const nonce = JSON.parse(page.match(/evo_general_params\s*=\s*(\{.*?\});/s)?.[1] ?? "{}").n;
  if (!nonce) throw new Error("No encontré el nonce de EventON en /que-hacer/.");
  const body = new URLSearchParams();
  const sc = { ...CALENDAR, focus_start_date_range: String(Date.UTC(2015, 0, 1) / 1000), focus_end_date_range: String(Date.UTC(2035, 0, 1) / 1000) };
  for (const [key, value] of Object.entries(sc)) body.append(`cals[c][sc][${key}]`, value);
  body.append("nonce", nonce);
  const data = await getJson(`${SITE}/?evo-ajax=eventon_init_load`, { method: "POST", body });
  const calendar = Object.values(data.cals ?? {})[0];
  if (!calendar?.json) throw new Error(`EventON no devolvió eventos: ${JSON.stringify(data).slice(0, 200)}`);
  return { instances: calendar.json, cardsHtml: calendar.html ?? "" };
}

async function knownPlaces(sql) {
  if (sql) return sql`select slug, name from public.places`;
  // Sin base (prueba en seco local): los espacios relevados del sitio anterior.
  const { espacios } = JSON.parse(await readFile(join(root, "db", "contenido", "espacios-culturales.json"), "utf8"));
  return espacios.map(({ slug, name }) => ({ slug, name }));
}

// Las fotos van a MEDIA_DIR/eventos/wordpress/<año>/<mes>/ con su nombre original (WordPress repite nombres
// entre meses: sólo el nombre pisaría la foto de otro evento). Si ya están, no se vuelven a bajar.
async function saveImage(url) {
  const relative = decodeURIComponent(new URL(url).pathname.split("/wp-content/uploads/")[1] ?? basename(new URL(url).pathname));
  if (relative.split("/").some((part) => !part || part === "." || part === "..")) throw new Error(`ruta de imagen inesperada: ${relative}`);
  const target = join(mediaDir, "eventos", "wordpress", ...relative.split("/"));
  const publicPath = `/media/eventos/wordpress/${relative.split("/").map(encodeURIComponent).join("/")}`;
  if ((await stat(target).catch(() => null))?.size) return publicPath;
  const response = await fetch(url, { headers: HEADERS });
  const type = response.headers.get("content-type") ?? "";
  if (!response.ok || !type.startsWith("image/")) throw new Error(`la imagen respondió ${response.status} (${type})`);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await response.arrayBuffer()));
  return publicPath;
}

const sql = process.env.DATABASE_URL ? postgres(process.env.DATABASE_URL, { max: 1, onnotice: () => {} }) : null;
try {
  console.log("Bajando eventos del sitio anterior…");
  const [{ instances, cardsHtml }, wpEvents, ...termLists] = await Promise.all([
    eventOnCalendar(),
    allPages("ajde_events?_fields=id,slug,link,title,content,event_type,event_type_2,event_type_3"),
    allPages("event_type?_fields=id,slug,name"),
    allPages("event_type_2?_fields=id,slug,name"),
    allPages("event_type_3?_fields=id,slug,name"),
  ]);
  const plan = buildPlan({ wpEvents, instances, cardsHtml, terms: termLists.flat(), places: await knownPlaces(sql) });
  const summary = summarize(plan);

  console.log(`Eventos: ${summary.events} (${summary.withPendingDates} con fechas por venir), funciones: ${summary.occurrences}`);
  console.log(`Con entrada gratuita: ${summary.free} · categorías: ${summary.categories} · imágenes: ${summary.images}`);
  console.log(`Vinculados a lugares cargados: ${Object.values(summary.linkedPlaces).reduce((a, b) => a + b, 0)} ` +
    `(${Object.entries(summary.linkedPlaces).map(([slug, n]) => `${slug} ${n}`).join(", ")})`);
  console.log(`Con lugar escrito a mano: ${Object.values(summary.customPlaces).reduce((a, b) => a + b, 0)} en ${Object.keys(summary.customPlaces).length} lugares distintos`);
  for (const warning of summary.warnings) console.log(`Aviso: ${warning}`);

  const report = {
    generado: new Date().toISOString(),
    modo: write ? (update ? "escritura con actualización" : "escritura") : "prueba en seco",
    resumen: summary,
    categorias: plan.categories,
    eventos: plan.events.map((event) => ({
      wordpress: event.legacyId, slug: event.slug, titulo: event.title,
      lugar: event.placeSlug ? `→ ${event.placeSlug}` : event.customPlaceName, entrada: event.accessType,
      fechas: event.occurrences.length, primera: event.occurrences[0]?.startsAt ?? null, ultima: event.occurrences.at(-1)?.startsAt ?? null,
      categorias: event.categorySlugs,
    })),
  };

  if (write) {
    const db = {
      query: (text, params = []) => sql.unsafe(text, params),
      transaction: (work) => sql.begin((tx) => work((text, params = []) => tx.unsafe(text, params))),
    };
    console.log(`Escribiendo en la base${update ? " (actualizando los ya importados)" : ""}…`);
    const result = await writePlan(db, plan, { update, saveImage });
    report.resultado = result;
    console.log(`Listo: ${result.created} nuevos, ${result.updated} actualizados, ${result.skipped} ya estaban, ` +
      `${result.categoriesCreated} categorías nuevas, ${result.withoutDates} sin fechas (no se cargan).`);
    for (const line of result.renamed) console.log(`Slug ocupado, se renombró: ${line}`);
    for (const line of result.imageErrors) console.log(`Sin foto: ${line}`);
  } else {
    console.log("Prueba en seco: no se escribió nada. Para cargar: npm run db:eventos -- --escribir");
  }
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Informe: ${reportPath}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await sql?.end();
}
