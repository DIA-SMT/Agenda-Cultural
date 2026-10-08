import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell section empty-state">
      <p className="section-kicker">Error 404</p>
      <h1>Esta página no está disponible</h1>
      <p>Podés volver al inicio o consultar la agenda vigente.</p>
      <div className="hero-actions">
        <Link className="button button-primary" href="/">Ir al inicio</Link>
        <Link className="button button-secondary" href="/agenda">Ver agenda</Link>
      </div>
    </div>
  );
}
