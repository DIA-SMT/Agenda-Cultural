import { revalidatePath } from "next/cache";
import type { z } from "zod";

/** Resultado de una acción de guardado del panel: un mensaje y lo enviado, para no perder lo cargado. */
export interface FormState {
  error?: string;
  values?: Record<string, string | string[]>;
}

/** El primer error de validación, con el nombre del campo como lo ve la persona. */
export function firstError(error: z.ZodError, labels: Record<string, string>) {
  const issue = error.issues[0];
  const field = String(issue?.path[0] ?? "");
  return `Revisá el campo "${labels[field] ?? field}": ${issue?.message ?? "no es válido"}.`;
}

/** Lo publicado cambia poco y el sitio es chico: ante cualquier cambio se regeneran todas las páginas. */
export function revalidatePublicSite() {
  revalidatePath("/", "layout");
}
