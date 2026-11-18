-- Datos exclusivos de desarrollo. No ejecutar en producción.
insert into public.categories (id, name, slug, color, status) values
  ('10000000-0000-0000-0000-000000000001', 'Música · Demo', 'musica', '#0274BE', 'published'),
  ('10000000-0000-0000-0000-000000000002', 'Teatro · Demo', 'teatro', '#6046A8', 'published'),
  ('10000000-0000-0000-0000-000000000003', 'Talleres · Demo', 'talleres', '#B96A12', 'published')
on conflict (id) do nothing;

insert into public.places (id, name, slug, type, summary, address, status) values
  ('20000000-0000-0000-0000-000000000001', 'Espacio cultural de demostración', 'espacio-cultural-demo', 'cultural_house', 'Registro de desarrollo.', 'Ubicación pendiente de importar', 'published')
on conflict (id) do nothing;

insert into public.events (id, title, slug, summary, description, place_id, access_type, featured, status, legacy_id) values
  ('30000000-0000-0000-0000-000000000001', 'Encuentro cultural · Demostración', 'encuentro-cultural-demo', 'Evento para validar la nueva plataforma.', 'Contenido no oficial, exclusivo del entorno de desarrollo.', '20000000-0000-0000-0000-000000000001', 'free', true, 'published', 'demo-1')
on conflict (id) do nothing;

insert into public.event_categories (event_id, category_id) values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001')
on conflict do nothing;

-- Fechas relativas al día en que se corre el seed, para que la agenda (que oculta lo pasado) muestre algo.
insert into public.event_occurrences (id, event_id, starts_at, ends_at) values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', (current_date + 3 + time '20:00') at time zone 'America/Argentina/Tucuman', (current_date + 3 + time '22:00') at time zone 'America/Argentina/Tucuman'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', (current_date + 10 + time '20:00') at time zone 'America/Argentina/Tucuman', (current_date + 10 + time '22:00') at time zone 'America/Argentina/Tucuman')
on conflict (id) do nothing;
