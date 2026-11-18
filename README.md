# Agenda Cultural SMT

Reconstrucción independiente de la Agenda Cultural de la Municipalidad de San Miguel de Tucumán con Next.js, TypeScript, Tailwind CSS y PostgreSQL. Se despliega en la VPS de la Dirección con `next start`, pm2 y nginx; el proyecto no usa Docker.

## Ejecutar localmente

Requisitos: Node.js 22.9 o posterior y npm.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Abrir `http://localhost:3000`. Sin `DATABASE_URL`, la aplicación funciona con fixtures claramente señalados como demostración.

## Variables de entorno

- `NEXT_PUBLIC_SITE_URL`: origen público del sitio. Se fija al compilar, así que tiene que estar definida antes de `npm run build`.
- `DATABASE_URL`: conexión a PostgreSQL, por ejemplo `postgresql://agenda:CLAVE@127.0.0.1:5432/agenda`. Sólo la lee el servidor; nunca debe llevar el prefijo `NEXT_PUBLIC_`.
- `MEDIA_DIR`: carpeta de fotos y archivos del contenido, publicada en `/media`. Sin valor usa `./media`. En la VPS va fuera de las versiones (`/srv/agenda/media`) para sobrevivir a cada despliegue.

Copiar estos nombres desde `.env.example`. No guardar valores reales en el repositorio.

## Calidad

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

`npm test` incluye pruebas del SQL contra un PostgreSQL embebido (PGlite) con las migraciones y el seed reales; no hace falta un servidor de base de datos.

## Base de datos

Las migraciones están en `db/migrations` y el seed exclusivo de desarrollo en `db/seed.sql`.

```bash
npm run db:migrate   # aplica las migraciones pendientes, cada una en su transacción
npm run db:seed      # además carga contenido de demostración (sólo desarrollo)
```

Los scripts leen `DATABASE_URL` de `.env` o `.env.local`. Las migraciones aplicadas quedan registradas en la tabla `schema_migrations`.

### Contenido del sitio anterior

`db/contenido/espacios-culturales.json` tiene los 11 espacios culturales relevados de agendaculturalsmt.com (textos, horarios, contacto y las URLs de sus fotos). Sin base de datos, el sitio los muestra desde ese archivo. Para cargarlos en la base y bajar las fotos a `MEDIA_DIR`:

```bash
npm run db:espacios                  # agrega los que falten; no pisa lugares ya cargados
npm run db:espacios -- --actualizar  # reemplaza los datos de los que ya existen
```

Las URLs viejas (`/casa-historica/`) redirigen a `/lugares/<slug>`.

La aplicación es la única que se conecta a la base: el sitio público sólo consulta contenido publicado y los permisos de edición se resolverán en el servidor cuando se habilite la autenticación del panel.

No ejecutar las migraciones contra producción sin revisar primero la base destino y el impacto.

## Importación desde WordPress/EventON

El importador inicial sólo acepta JSON y opera obligatoriamente en modo seguro:

```bash
node scripts/import-wordpress.mjs --input export.json --report migration-report.json --mode dry-run
```

Para la migración real se necesitarán: exportación REST o SQL sanitizada, XML de WordPress, metadatos completos de EventON, manifiesto/carpeta de medios, taxonomías, lugares, recurrencias y mapa de URLs anteriores.

## Despliegue

Se sigue la guía de migración a la VPS de la Dirección: usuario de sistema propio, base PostgreSQL local, `.env` compartido entre versiones, `npm ci`, `npm run db:migrate`, `npm run build` y `next start` bajo pm2 detrás de nginx.

La portada, los listados de lugares y el sitemap se prerenderizan durante `npm run build` y consultan la base, así que `DATABASE_URL` tiene que apuntar a una base accesible y migrada al compilar. Después se regeneran solos (la portada cada 5 minutos, los lugares cada 10, el sitemap cada hora).

nginx sirve `/media/` directo desde `MEDIA_DIR`. La ruta `/media/[...ruta]` de la aplicación también hace falta: el optimizador de `next/image` le pide los originales al propio Next, no a nginx.
