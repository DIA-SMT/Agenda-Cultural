# Procedencia de recursos visuales

Recursos descargados el 14 de septiembre de 2026 desde el sitio público oficial de la Agenda Cultural SMT para uso en esta reconstrucción municipal:

- `public/brand/ciudad-smt.png`: `https://agendaculturalsmt.com/wp-content/uploads/2025/11/smt_.png`
- `public/images/hero-cultura-smt.jpg`: `https://agendaculturalsmt.com/wp-content/uploads/2025/12/DSC8500-copia.jpg`
- `public/images/circuito-smt.jpg`: `https://agendaculturalsmt.com/wp-content/uploads/2025/11/circuito-03.jpg`

El 18 de noviembre de 2026 se relevaron los 11 espacios culturales de `https://agendaculturalsmt.com/espacios-culturales/` y sus páginas (por la API REST de WordPress): textos, horarios y datos de contacto quedaron en `db/contenido/espacios-culturales.json` con la URL de origen de cada foto. Las fotos no se versionan: `npm run db:espacios` las baja a `MEDIA_DIR` al importar.

No se incorporaron imágenes de terceros. Antes de producción se debe confirmar el archivo maestro del logo y sus variantes cromáticas.
