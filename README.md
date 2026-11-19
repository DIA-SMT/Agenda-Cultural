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
- `SESION_SECRETO`: firma de las sesiones del panel, 32 caracteres o más (`openssl rand -base64 48`). Obligatoria en producción; cambiarla cierra todas las sesiones.

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

## Panel de gestión

`/admin` permite cargar y publicar eventos (con sus fechas, lugar, categorías e imagen), editar lugares (textos, horarios, contacto, foto principal y galería) y administrar categorías. Las imágenes se guardan en `MEDIA_DIR` con un nombre nuevo; se aceptan JPG, PNG, WebP y AVIF de hasta 10 MB.

El equipo entra con correo y contraseña. Las cuentas se manejan por consola (las contraseñas se piden por teclado y no se muestran):

```bash
npm run equipo -- crear correo@smt.gob.ar "Nombre Apellido" admin   # o editor
npm run equipo -- clave correo@smt.gob.ar                            # contraseña nueva; cierra sus sesiones
npm run equipo -- listar
npm run equipo -- desactivar correo@smt.gob.ar
```

Editores y administradores cargan y publican; sólo administración borra eventos y categorías. Los lugares no se borran: se pasan a Borrador o Archivado.

La sesión es una cookie firmada de tres días que se renueva sola mientras se usa. `src/proxy.ts` sólo revisa la firma; cada página y acción del panel vuelve a verificar contra la base que la cuenta siga activa y que sus sesiones no se hayan cortado. Después de 5 intentos fallidos para un correo (o 20 desde una IP) el ingreso se bloquea 15 minutos.

## Importación desde WordPress/EventON

`npm run db:eventos` trae los eventos de agendaculturalsmt.com sin necesidad de acceso al WordPress: lee la API REST pública (título, slug, descripción, categorías) y el mismo pedido que hace el calendario de `/que-hacer/` (`?evo-ajax=eventon_init_load`), que devuelve cada función con su horario, los metadatos de EventON y el lugar en microdatos schema.org.

```bash
npm run db:eventos                                  # prueba en seco: no escribe; deja importacion-eventos.json
npm run db:eventos -- --escribir                    # carga en la base y baja las fotos a MEDIA_DIR
npm run db:eventos -- --escribir --actualizar       # reemplaza los ya importados (pisa lo editado en el panel)
```

- `--actualizar` reemplaza datos, lugar, categorías y fechas, pero no toca el destacado ni el estado
  (publicado, suspendido, archivado…): eso se decide en el panel. Así se puede correr todas las noches mientras el
  equipo siga cargando en el sitio viejo.

- Cada evento se identifica por su id de WordPress (`legacy_id`): correrlo de nuevo no duplica nada.
- Se conservan los slugs, y las URLs viejas (`/www.agendaculturalsmt.com/events/<slug>/` y `/events/<slug>/`) redirigen a `/eventos/<slug>`.
- Los horarios salen de `unix_start` de EventON, en hora de Tucumán; los eventos que quedaron con zona UTC por error se corrigen. Si el cierre estaba oculto, no se importa la hora de cierre de relleno.
- Los lugares se vinculan a los ya cargados por nombre o por la tabla `PLACE_ALIASES` de `src/lib/importacion/eventon.mjs`; el resto queda como lugar escrito a mano.
- Las categorías de las tres taxonomías de EventON se unen por slug. La entrada se marca gratis si la descripción lo dice; si no, "Consultar". El destacado del sitio anterior no se importa.

## Despliegue

Se sigue la guía de migración a la VPS de la Dirección: usuario de sistema propio, base PostgreSQL local, `.env` compartido entre versiones, `npm ci`, `npm run db:migrate`, `npm run build` y `next start` bajo pm2 detrás de nginx.

La portada, los listados de lugares y el sitemap se prerenderizan durante `npm run build` y consultan la base, así que `DATABASE_URL` tiene que apuntar a una base accesible y migrada al compilar. Después se regeneran solos (la portada cada 5 minutos, los lugares cada 10, el sitemap cada hora).

nginx tiene que aceptar subidas de hasta 32 MB (`client_max_body_size 32M`), el mismo límite que `serverActions.bodySizeLimit` en `next.config.ts`.

nginx sirve `/media/` directo desde `MEDIA_DIR`. La ruta `/media/[...ruta]` de la aplicación también hace falta: el optimizador de `next/image` le pide los originales al propio Next, no a nginx.
