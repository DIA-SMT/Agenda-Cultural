# Arquitectura

La Agenda Cultural SMT se implementa como una aplicación Next.js con App Router y TypeScript estricto. La interfaz pública usa Server Components por defecto; la interactividad se limita al menú, el hero, formularios y acciones de compartir.

## Capas

- `src/app`: rutas públicas, administrativas y endpoints.
- `src/components`: componentes compartidos y componentes por funcionalidad.
- `src/services`: consultas SQL y reglas de acceso a datos.
- `src/lib/db.ts`: conexión a PostgreSQL, sólo para código de servidor.
- `src/types`: contratos de dominio.
- `src/data`: fixtures exclusivos de desarrollo, usados cuando no hay `DATABASE_URL`.
- `db/migrations`: esquema PostgreSQL versionado.
- `scripts`: migraciones e importación repetible desde exportaciones de WordPress/EventON.
- `tests`: pruebas end-to-end.

## Despliegue

El destino es la VPS de la Dirección: Next.js con `next start` bajo pm2, nginx como proxy inverso y PostgreSQL 16 local. No se utiliza Docker. Sólo la aplicación se conecta a la base y `DATABASE_URL` nunca se expone con el prefijo `NEXT_PUBLIC_`.

Las fotos del contenido viven en `MEDIA_DIR` (en la VPS, `/srv/agenda/media`) y se publican en `/media/…`: nginx las sirve directo y la ruta `src/app/media/[...ruta]` las sirve al optimizador de imágenes y en desarrollo. El panel (`src/app/admin`) usa cuentas propias en `public.profiles` (contraseña con scrypt y sesión en una cookie firmada con `SESION_SECRETO`), sin servicios externos, igual que FerIA y la Subasta. Dos barreras: `src/proxy.ts` revisa la firma sin ir a la base, y `requireStaff()` vuelve a verificar la cuenta en cada página y Server Action. Las cuentas se crean por consola con `scripts/equipo.mjs`.

## Migración

WordPress es únicamente una fuente temporal. La importación comienza siempre en modo `dry-run`, conserva identificadores y URLs anteriores, detecta duplicados y genera un reporte de revisión. La escritura quedará habilitada únicamente contra una base PostgreSQL de desarrollo autorizada.
