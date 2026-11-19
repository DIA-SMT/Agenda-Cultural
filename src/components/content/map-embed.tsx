/** Mapa de Google embebido en un punto exacto, como tenía el sitio anterior. Carga recién al acercarse. */
export function MapEmbed({ latitude, longitude, title }: { latitude: number; longitude: number; title: string }) {
  return (
    <div className="place-map">
      <iframe
        title={`Mapa: ${title}`}
        src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
