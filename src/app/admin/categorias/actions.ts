"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireStaff } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { firstError, revalidatePublicSite, type FormState } from "@/lib/form-state";
import { isUniqueViolation, optionalText, SLUG_PATTERN, slugFrom, submittedValues, text } from "@/lib/forms";
import { deleteCategory, saveCategory } from "@/services/admin/categories";

const schema = z.object({
  name: z.string().min(2, "tiene que tener al menos 2 letras").max(80, "puede tener hasta 80 caracteres"),
  slug: z.string().regex(SLUG_PATTERN, "usá sólo minúsculas, números y guiones"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "elegí un color").nullable(),
  description: z.string().max(500, "puede tener hasta 500 caracteres").nullable(),
  status: z.enum(["draft", "published", "archived"]),
});
const labels = { name: "Nombre", slug: "Dirección", color: "Color", description: "Descripción", status: "Estado" };

export async function saveCategoryAction(_: FormState, form: FormData): Promise<FormState> {
  await requireStaff();
  const values = submittedValues(form);
  const parsed = schema.safeParse({
    name: text(form, "name"),
    slug: slugFrom(form, text(form, "name")),
    color: optionalText(form, "color"),
    description: optionalText(form, "description"),
    status: text(form, "status"),
  });
  if (!parsed.success) return { error: firstError(parsed.error, labels), values };

  try {
    await saveCategory(query, parsed.data, optionalText(form, "id") ?? undefined);
  } catch (error) {
    if (isUniqueViolation(error)) return { error: `Ya hay una categoría con la dirección "${parsed.data.slug}".`, values };
    throw error;
  }
  revalidatePublicSite();
  redirect("/admin/categorias?ok=guardada");
}

export async function deleteCategoryAction(form: FormData) {
  await requireAdmin();
  await deleteCategory(query, text(form, "id"));
  revalidatePublicSite();
  redirect("/admin/categorias?ok=borrada");
}
