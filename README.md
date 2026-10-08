# Agenda Cultural SMT

Reconstrucción independiente de la Agenda Cultural de la Municipalidad de San Miguel de Tucumán con Next.js, TypeScript, Tailwind CSS y Supabase. El despliegue previsto es Vercel; el proyecto no usa Docker.

## Ejecutar localmente

Requisitos: Node.js 24 o una versión LTS compatible y npm.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Abrir `http://localhost:3000`. Sin variables de Supabase, la aplicación funciona con fixtures claramente señalados como demostración.

## Variables de entorno

- `NEXT_PUBLIC_SITE_URL`: origen público del sitio, por ejemplo la URL de Vercel.
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: clave pública/anon de Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: sólo para procesos seguros del servidor o importación; nunca debe llegar al navegador.

Copiar estos nombres desde `.env.example`. No guardar valores reales en el repositorio.

## Calidad

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

## Supabase

Las migraciones están en `supabase/migrations` y el seed exclusivo de desarrollo en `supabase/seed.sql`. Las políticas RLS permiten lectura pública sólo de contenido publicado, edición a perfiles activos con rol editor o admin y administración de usuarios/configuración sólo a admins.

No ejecutar las migraciones contra producción sin revisar primero el proyecto destino y el impacto.

## Importación desde WordPress/EventON

El importador inicial sólo acepta JSON y opera obligatoriamente en modo seguro:

```bash
node scripts/import-wordpress.mjs --input export.json --report migration-report.json --mode dry-run
```

Para la migración real se necesitarán: exportación REST o SQL sanitizada, XML de WordPress, metadatos completos de EventON, manifiesto/carpeta de medios, taxonomías, lugares, recurrencias y mapa de URLs anteriores.

## Vercel

Importar este directorio como proyecto Next.js, configurar las variables anteriores para cada entorno y usar el comando de build estándar `npm run build`. No se requiere configuración Docker.
