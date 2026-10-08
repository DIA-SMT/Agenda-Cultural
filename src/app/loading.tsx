export default function Loading() {
  return (
    <div className="shell section" aria-busy="true" aria-label="Cargando contenido">
      <div className="skeleton skeleton-title" />
      <div className="event-grid">
        {[1, 2, 3].map((item) => <div className="skeleton skeleton-card" key={item} />)}
      </div>
    </div>
  );
}
