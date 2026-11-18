// Escritura del plan de importación de eventos (ver eventon.mjs) en la base.
// `db` es { query(texto, parámetros) → filas, transaction(trabajo) }: el script le pasa postgres.js y los
// tests, PGlite. Los parámetros JSON van como ::text::jsonb (ver src/services/sql-params.test.ts).

/**
 * Carga categorías y eventos. Cada evento se identifica por su id de WordPress (legacy_id): si ya está, se
 * saltea, salvo con `update`, que reemplaza sus datos, categorías y fechas. Así se puede correr más de una vez.
 * `saveImage(url)` baja la foto y devuelve su ruta pública; si falla, el evento se carga igual, sin foto.
 */
export async function writePlan(db, plan, { update = false, saveImage = async () => null } = {}) {
  const result = { created: 0, updated: 0, skipped: 0, withoutDates: 0, categoriesCreated: 0, renamed: [], imageErrors: [] };

  for (const category of plan.categories) {
    const rows = await db.query(
      "insert into public.categories (name, slug, status) values ($1, $2, 'published') on conflict (slug) do nothing returning id",
      [category.name, category.slug],
    );
    result.categoriesCreated += rows.length;
  }
  const categoryIds = new Map((await db.query("select id, slug from public.categories")).map((row) => [row.slug, row.id]));
  const placeIds = new Map((await db.query("select id, slug from public.places")).map((row) => [row.slug, row.id]));

  for (const event of plan.events) {
    if (!event.occurrences.length) { result.withoutDates++; continue; }
    const [existing] = await db.query("select id, main_image_path from public.events where legacy_id = $1", [event.legacyId]);
    if (existing && !update) { result.skipped++; continue; }

    let image = existing?.main_image_path ?? null;
    if (event.image && (!existing || update)) {
      try {
        image = (await saveImage(event.image)) ?? image;
      } catch (error) {
        result.imageErrors.push(`${event.slug}: ${error.message}`);
      }
    }

    // Un evento cargado desde el panel puede haber tomado el mismo slug: el importado lleva su id al final.
    let slug = event.slug;
    const [taken] = await db.query("select id from public.events where slug = $1 and legacy_id is distinct from $2", [slug, event.legacyId]);
    if (taken) {
      slug = `${slug}-${event.legacyId}`;
      result.renamed.push(`${event.slug} → ${slug}`);
    }

    const placeId = event.placeSlug ? placeIds.get(event.placeSlug) ?? null : null;
    const values = [
      event.title, slug, event.summary, event.description, image, placeId,
      placeId ? null : event.customPlaceName ?? "Lugar a confirmar", placeId ? null : event.customAddress,
      event.accessType, event.featured, event.legacyId, event.legacyUrl,
    ];
    await db.transaction(async (query) => {
      let id = existing?.id;
      if (id) {
        await query(`
          update public.events set title = $1, slug = $2, summary = $3, description = $4, main_image_path = $5,
            place_id = $6, custom_place_name = $7, custom_address = $8, access_type = $9::public.access_type,
            featured = $10, legacy_id = $11, legacy_url = $12, status = 'published',
            published_at = coalesce(published_at, now())
          where id = $13`, [...values, id]);
        await query("delete from public.event_categories where event_id = $1", [id]);
        await query("delete from public.event_occurrences where event_id = $1", [id]);
      } else {
        [{ id }] = await query(`
          insert into public.events (title, slug, summary, description, main_image_path, place_id, custom_place_name,
            custom_address, access_type, featured, legacy_id, legacy_url, status, published_at)
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9::public.access_type, $10, $11, $12, 'published', now())
          returning id`, values);
      }
      const ids = event.categorySlugs.map((categorySlug) => categoryIds.get(categorySlug)).filter(Boolean);
      await query(`
        insert into public.event_categories (event_id, category_id)
        select $1, value::uuid from jsonb_array_elements_text($2::text::jsonb)`, [id, JSON.stringify(ids)]);
      for (const occurrence of event.occurrences) {
        await query(`
          insert into public.event_occurrences (event_id, starts_at, ends_at) values ($1, $2, $3)
          on conflict (event_id, starts_at) do nothing`, [id, occurrence.startsAt, occurrence.endsAt]);
      }
    });
    if (existing) result.updated++;
    else result.created++;
  }
  return result;
}
