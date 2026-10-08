"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="shell section empty-state">
      <h1>No pudimos cargar esta página</h1>
      <p>Reintentá en unos instantes.</p>
      <button className="button button-primary" onClick={reset}>Volver a intentar</button>
    </div>
  );
}
