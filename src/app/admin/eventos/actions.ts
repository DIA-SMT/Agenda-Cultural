"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireStaff } from "@/lib/auth/session";
import { db, query } from "@/lib/db";
import { firstError, revalidatePublicSite, type FormState } from "@/lib/form-state";
import { all, checkbox, files, isUniqueViolation, optionalText, SLUG_PATTERN, slugFrom, submittedValues, text } from "@/lib/forms";
import { saveImage, UploadError } from "@/lib/media-upload";
import { readOccurrences, UUID } from "@/lib/occurrences-form";
import { deleteEvent, getEventAdmin, saveEvent } from "@/services/admin/events";

const url = z.url({ message: "tiene que ser una dirección web completa (https://…)" }).nullable();

const schema = z.object({
  title: z.string().min(2, "tiene que tener al menos 2 letras").max(180, "puede tener hasta 180 caracteres"),
  slug: z.string().regex(SLUG_PATTERN, "usá sólo minúsculas, números y guiones"),
  status: z.enum(["draft", "published", "suspended", "rescheduled", "finished", "archived"]),
  summary: z.string().max(400, "puede tener hasta 400 caracteres").nullable(),
  description: z.string().max(10000, "es demasiado larga").nullable(),
  placeId: z.string().regex(UUID).nullable(),
  customPlaceName: z.string().max(160).nullable(),
  customAddress: z.string().max(200).nullable(),
  organizer: z.string().max(160).nullable(),
  price: z.string().max(120).nullable(),
  accessType: z.enum(["free", "paid", "check"]),
  registrationUrl: url,
  ticketUrl: url,
  accessibility: z.string().max(1000).nullable(),
});
const labels = {
  title: "Título", slug: "Dirección", status: "Estado", summary: "Resumen", description: "Descripción",
  placeId: "Lugar", customPlaceName: "Nombre del lugar", customAddress: "Dirección del lugar", organizer: "Organiza",
  price: "Precio", accessType: "Entrada", registrationUrl: "Inscripción", ticketUrl: "Venta de entradas",
  accessibility: "Accesibilidad",
};

export async function saveEventAction(_: FormState, form: FormData): Promise<FormState> {
  await requireStaff();
  const values = submittedValues(form);
  const id = optionalText(form, "id");
  const placeChoice = text(form, "place_id");
  const parsed = schema.safeParse({
    title: text(form, "title"), slug: slugFrom(form, text(form, "title")), status: text(form, "status"),
    summary: optionalText(form, "summary"), description: optionalText(form, "description"),
    placeId: placeChoice && placeChoice !== "otro" ? placeChoice : null,
    customPlaceName: placeChoice === "otro" ? optionalText(form, "custom_place_name") : null,
    customAddress: placeChoice === "otro" ? optionalText(form, "custom_address") : null,
    organizer: optionalText(form, "organizer"), price: optionalText(form, "price"), accessType: text(form, "access_type"),
    registrationUrl: optionalText(form, "registration_url"), ticketUrl: optionalText(form, "ticket_url"),
    accessibility: optionalText(form, "accessibility"),
  });
  if (!parsed.success) return { error: firstError(parsed.error, labels), values };
  if (!parsed.data.placeId && !parsed.data.customPlaceName) {
    return { error: "Elegí un lugar de la lista o escribí el nombre del lugar.", values };
  }

  const occurrences = readOccurrences(form);
  if (typeof occurrences === "string") return { error: occurrences, values };
  if (parsed.data.status === "published" && !occurrences.some((occurrence) => occurrence.status !== "cancelled")) {
    return { error: "Para publicar el evento cargá al menos una fecha que no esté cancelada.", values };
  }

  const current = id ? await getEventAdmin(query, id) : null;
  if (id && !current) return { error: "Ese evento ya no existe.", values };
  // Las fechas que se editan tienen que ser de este evento.
  const ownIds = new Set(current?.occurrences.map((occurrence) => occurrence.id));
  for (const occurrence of occurrences) if (occurrence.id && !ownIds.has(occurrence.id)) occurrence.id = null;

  let mainImagePath = checkbox(form, "remove_image") ? null : current?.main_image_path ?? null;
  try {
    const [newImage] = files(form, "image");
    if (newImage) mainImagePath = await saveImage(newImage, "eventos");
  } catch (error) {
    if (error instanceof UploadError) return { error: error.message, values };
    throw error;
  }

  try {
    await saveEvent(db, {
      ...parsed.data,
      featured: checkbox(form, "featured"),
      mainImagePath,
      categoryIds: all(form, "category_ids").filter((value) => UUID.test(value)),
      occurrences,
    }, id ?? undefined);
  } catch (error) {
    if (isUniqueViolation(error)) return { error: `Ya hay un evento con la dirección "${parsed.data.slug}".`, values };
    throw error;
  }
  revalidatePublicSite();
  redirect("/admin/eventos?ok=guardado");
}

export async function deleteEventAction(form: FormData) {
  await requireAdmin();
  await deleteEvent(query, text(form, "id"));
  revalidatePublicSite();
  redirect("/admin/eventos?ok=borrado");
}
