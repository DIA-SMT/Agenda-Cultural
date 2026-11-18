"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingLabel = "Guardando…" }: { children: React.ReactNode; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return <button className="button button-primary" type="submit" disabled={pending}>{pending ? pendingLabel : children}</button>;
}

/** Botón de borrar con confirmación del navegador. */
export function DeleteButton({ action, id, what }: { action: (form: FormData) => Promise<void>; id: string; what: string }) {
  return (
    <form action={action} onSubmit={(event) => { if (!window.confirm(`¿Borrar ${what}? No se puede deshacer.`)) event.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <button className="button button-danger" type="submit"><Trash2 size={17} /> Borrar</button>
    </form>
  );
}

/** Valor a mostrar: lo recién enviado si el guardado falló, o lo guardado. */
export function pick(values: Record<string, string | string[]> | undefined, name: string, fallback: string | null | undefined) {
  const value = values?.[name];
  if (value === undefined) return fallback ?? "";
  return Array.isArray(value) ? value.join("\n") : value;
}
