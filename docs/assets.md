# Procedencia de recursos visuales

Recursos descargados el 14 de septiembre de 2026 desde el sitio público oficial de la Agenda Cultural SMT para uso en esta reconstrucción municipal:

- `public/brand/ciudad-smt.png`: `https://agendaculturalsmt.com/wp-content/uploads/2025/11/smt_.png`
- `public/images/hero-cultura-smt.jpg`: `https://agendaculturalsmt.com/wp-content/uploads/2025/12/DSC8500-copia.jpg`
- `public/images/circuito-smt.jpg`: `https://agendaculturalsmt.com/wp-content/uploads/2025/11/circuito-03.jpg`

El 18 de noviembre de 2026 se relevaron los 11 espacios culturales de `https://agendaculturalsmt.com/espacios-culturales/` y sus páginas (por la API REST de WordPress): textos, horarios y datos de contacto quedaron en `db/contenido/espacios-culturales.json` con la URL de origen de cada foto. Las fotos no se versionan: `npm run db:espacios` las baja a `MEDIA_DIR` al importar.

El 19 de noviembre de 2026 se relevó el resto del sitio anterior:

- Parques y plazas (`/parques/`, `/plazas/` y la página de cada parque) quedaron en `db/contenido/espacios-al-aire-libre.json`, igual que los espacios culturales: textos, coordenadas de sus mapas y la URL de origen de cada foto. `npm run db:espacios` los carga y baja esas fotos a `MEDIA_DIR`.
- Las fotos de las páginas de contenido fijo (gastronomía, patrimonio, nuestra ciudad, planificá tu viaje, guías, ferias, murales y museo a cielo abierto) sí se versionan, en `public/images/contenido/<sección>/`, porque son parte del diseño de esas páginas y no se editan desde el panel. Se bajaron de `https://agendaculturalsmt.com/wp-content/uploads/` y se pasaron a WebP de hasta 1280 px (unos 6 MB en total).

No se incorporaron imágenes de terceros. Antes de producción se debe confirmar el archivo maestro del logo y sus variantes cromáticas.
