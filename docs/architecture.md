# Arquitectura

La Agenda Cultural SMT se implementa como una aplicación Next.js con App Router y TypeScript estricto. La interfaz pública usa Server Components por defecto; la interactividad se limita al menú, el hero, formularios y acciones de compartir.

## Capas

- `src/app`: rutas públicas, administrativas y endpoints.
- `src/components`: componentes compartidos y componentes por funcionalidad.
- `src/services`: consultas y reglas de acceso a datos.
- `src/lib/supabase`: clientes separados para navegador y servidor.
- `src/types`: contratos de dominio.
- `src/data`: fixtures exclusivos de desarrollo.
- `supabase/migrations`: esquema PostgreSQL y políticas RLS versionadas.
- `scripts`: importación repetible desde exportaciones de WordPress/EventON.
- `tests`: pruebas end-to-end.

## Despliegue

El destino previsto es Vercel. No se utiliza Docker. Supabase aloja PostgreSQL, Auth y Storage; la service role key sólo podrá usarse en tareas administrativas del servidor y nunca se expone con el prefijo `NEXT_PUBLIC_`.

## Migración

WordPress es únicamente una fuente temporal. La importación comienza siempre en modo `dry-run`, conserva identificadores y URLs anteriores, detecta duplicados y genera un reporte de revisión. La escritura quedará habilitada únicamente contra un proyecto Supabase de desarrollo autorizado.
