"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { firstError, revalidatePublicSite, type FormState } from "@/lib/form-state";
import { all, checkbox, files, isUniqueViolation, lines, optionalText, SLUG_PATTERN, slugFrom, submittedValues, text } from "@/lib/forms";
import { saveImage, UploadError } from "@/lib/media-upload";
import { getPlaceAdmin, savePlace } from "@/services/admin/places";
import type { SocialLinks } from "@/types/domain";

const url = z.url({ message: "tiene que ser una dirección web completa (https://…)" }).nullable();
const schema = z.object({
  name: z.string().min(2, "tiene que tener al menos 2 letras").max(160, "puede tener hasta 160 caracteres"),
  slug: z.string().regex(SLUG_PATTERN, "usá sólo minúsculas, números y guiones"),
  type: z.enum(["museum", "theater", "cultural_house", "heritage", "square", "park", "gastronomy", "office", "other"]),
  status: z.enum(["draft", "published", "archived"]),
  summary: z.string().max(400, "puede tener hasta 400 caracteres").nullable(),
  description: z.string().max(10000, "es demasiado larga").nullable(),
  address: z.string().max(200).nullable(),
  phone: z.string().max(60).nullable(),
  email: z.email({ message: "no parece un correo" }).nullable(),
  website: url,
  instagram: url,
  facebook: url,
  entradas: url,
});
const labels = {
  name: "Nombre", slug: "Dirección", type: "Tipo", status: "Estado", summary: "Resumen", description: "Descripción",
  address: "Dirección postal", phone: "Teléfono", email: "Correo", website: "Sitio web", instagram: "Instagram",
  facebook: "Facebook", entradas: "Venta de entradas",
};

export async function savePlaceAction(_: FormState, form: FormData): Promise<FormState> {
  await requireStaff();
  const values = submittedValues(form);
  const id = optionalText(form, "id");
  const parsed = schema.safeParse({
    name: text(form, "name"), slug: slugFrom(form, text(form, "name")), type: text(form, "type"), status: text(form, "status"),
    summary: optionalText(form, "summary"), description: optionalText(form, "description"),
    address: optionalText(form, "address"), phone: optionalText(form, "phone"), email: optionalText(form, "email"),
    website: optionalText(form, "website"), instagram: optionalText(form, "instagram"),
    facebook: optionalText(form, "facebook"), entradas: optionalText(form, "entradas"),
  });
  if (!parsed.success) return { error: firstError(parsed.error, labels), values };

  const current = id ? await getPlaceAdmin(query, id) : null;
  if (id && !current) return { error: "Ese lugar ya no existe.", values };

  // Sólo se conservan fotos que ya eran del lugar: el formulario no puede apuntar a archivos ajenos.
  const keptGallery = all(form, "gallery_keep").filter((path) => current?.gallery_paths?.includes(path));
  let mainImagePath = checkbox(form, "remove_image") ? null : current?.main_image_path ?? null;
  const galleryPaths = [...keptGallery];
  try {
    const [newMain] = files(form, "image");
    if (newMain) mainImagePath = await saveImage(newMain, "lugares");
    for (const file of files(form, "gallery")) galleryPaths.push(await saveImage(file, "lugares"));
  } catch (error) {
    if (error instanceof UploadError) return { error: error.message, values };
    throw error;
  }

  const { instagram, facebook, entradas, ...data } = parsed.data;
  const socialLinks: SocialLinks = Object.fromEntries(
    Object.entries({ instagram, facebook, entradas }).filter(([, value]) => Boolean(value)),
  );
  try {
    await savePlace(query, {
      ...data,
      featured: checkbox(form, "featured"),
      openingHours: lines(form, "opening_hours"),
      services: lines(form, "services"),
      socialLinks,
      mainImagePath,
      galleryPaths,
    }, id ?? undefined);
  } catch (error) {
    if (isUniqueViolation(error)) return { error: `Ya hay un lugar con la dirección "${parsed.data.slug}".`, values };
    throw error;
  }
  revalidatePublicSite();
  redirect("/admin/lugares?ok=guardado");
}
