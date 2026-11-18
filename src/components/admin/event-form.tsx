"use client";

import { useActionState, useState } from "react";
import { saveEventAction } from "@/app/admin/eventos/actions";
import { pick, SubmitButton } from "@/components/admin/form-parts";
import { ACCESS_LABELS, STATUS_LABELS } from "@/components/admin/labels";
import { OccurrencesEditor, type OccurrenceRow } from "@/components/admin/occurrences-editor";
import type { FormState } from "@/lib/form-state";
import type { EventAdmin } from "@/services/admin/events";

interface Option { id: string; name: string; status?: string }

const asList = (value: string | string[] | undefined) => (Array.isArray(value) ? value : value ? [value] : []);

// Si el guardado falla, las fechas vuelven como se enviaron (React limpia el formulario al enviarlo).
function rowsFromValues(values: Record<string, string | string[]>): OccurrenceRow[] {
  const dates = asList(values.occ_date);
  return dates.map((date, index) => ({
    key: `enviada-${index}`,
    id: asList(values.occ_id)[index] ?? "",
    date,
    start: asList(values.occ_start)[index] ?? "",
    end: asList(values.occ_end)[index] ?? "",
    status: asList(values.occ_status)[index] ?? "scheduled",
  }));
}

export function EventForm({ event, occurrences, places, categories }: {
  event?: EventAdmin;
  occurrences: OccurrenceRow[];
  places: Option[];
  categories: Option[];
}) {
  const [state, action] = useActionState<FormState, FormData>(saveEventAction, {});
  const v = state.values;
  const initialPlace = event ? (event.place_id ?? "otro") : "";
  const [placeChoice, setPlaceChoice] = useState(pick(v, "place_id", initialPlace));
  const checkedCategories = v ? asList(v.category_ids) : event?.category_ids ?? [];

  return (
    <form action={action} className="admin-form">
      {event && <input type="hidden" name="id" value={event.id} />}
      {state.error && <p className="form-error" role="alert">{state.error}</p>}

      <fieldset className="admin-fieldset">
        <legend>La actividad</legend>
        <div className="admin-fields">
          <label className="field wide"><span>Título</span><input id="event-title" name="title" required minLength={2} maxLength={180} defaultValue={pick(v, "title", event?.title)} /></label>
          <label className="field"><span>Dirección en el sitio (slug)</span><input id="event-slug" name="slug" placeholder="Se arma con el título" defaultValue={pick(v, "slug", event?.slug)} /><small className="field-help">/eventos/…</small></label>
          <label className="field"><span>Estado</span>
            <select id="event-status" name="status" defaultValue={pick(v, "status", event?.status ?? "draft")}>
              {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <small className="field-help">Sólo los publicados aparecen en el sitio.</small>
          </label>
          <label className="check-field"><input id="event-featured" type="checkbox" name="featured" defaultChecked={v ? v.featured === "on" : event?.featured} /><span>Destacado</span></label>
          <label className="field wide"><span>Resumen</span><textarea id="event-summary" name="summary" rows={2} maxLength={400} defaultValue={pick(v, "summary", event?.summary)} /><small className="field-help">Una o dos oraciones. Aparece en las tarjetas.</small></label>
          <label className="field wide"><span>Descripción</span><textarea id="event-description" name="description" rows={7} defaultValue={pick(v, "description", event?.description)} /></label>
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Fechas</legend>
        <OccurrencesEditor key={v ? JSON.stringify([v.occ_date, v.occ_start, v.occ_end]) : "guardadas"} initial={v ? rowsFromValues(v) : occurrences} />
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Dónde</legend>
        <div className="admin-fields">
          <label className="field wide"><span>Lugar</span>
            <select id="event-place" name="place_id" value={placeChoice} onChange={(change) => setPlaceChoice(change.target.value)} required>
              <option value="" disabled>Elegí un lugar</option>
              {places.map((place) => <option key={place.id} value={place.id}>{place.name}{place.status !== "published" ? " (no publicado)" : ""}</option>)}
              <option value="otro">Otro lugar (escribirlo)</option>
            </select>
          </label>
          {placeChoice === "otro" && <>
            <label className="field"><span>Nombre del lugar</span><input id="event-custom-place" name="custom_place_name" required maxLength={160} defaultValue={pick(v, "custom_place_name", event?.custom_place_name)} /></label>
            <label className="field"><span>Dirección del lugar</span><input id="event-custom-address" name="custom_address" maxLength={200} defaultValue={pick(v, "custom_address", event?.custom_address)} /></label>
          </>}
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Categorías</legend>
        {categories.length > 0 ? (
          <div className="admin-checks">
            {categories.map((category) => (
              <label key={category.id} className="check-field"><input type="checkbox" name="category_ids" value={category.id} defaultChecked={checkedCategories.includes(category.id)} /><span>{category.name}</span></label>
            ))}
          </div>
        ) : <p className="field-help">Todavía no hay categorías: se cargan en la sección Categorías.</p>}
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Entrada y datos útiles</legend>
        <div className="admin-fields">
          <label className="field"><span>Entrada</span>
            <select id="event-access" name="access_type" defaultValue={pick(v, "access_type", event?.access_type ?? "free")}>
              {Object.entries(ACCESS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="field"><span>Precio</span><input id="event-price" name="price" maxLength={120} placeholder="Ej.: $5.000 general" defaultValue={pick(v, "price", event?.price)} /></label>
          <label className="field"><span>Venta de entradas</span><input id="event-tickets" name="ticket_url" type="url" placeholder="https://" defaultValue={pick(v, "ticket_url", event?.ticket_url)} /></label>
          <label className="field"><span>Inscripción</span><input id="event-registration" name="registration_url" type="url" placeholder="https://" defaultValue={pick(v, "registration_url", event?.registration_url)} /></label>
          <label className="field"><span>Organiza</span><input id="event-organizer" name="organizer" maxLength={160} defaultValue={pick(v, "organizer", event?.organizer)} /></label>
          <label className="field wide"><span>Accesibilidad</span><textarea id="event-accessibility" name="accessibility" rows={2} maxLength={1000} defaultValue={pick(v, "accessibility", event?.accessibility)} /></label>
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Imagen</legend>
        {event?.main_image_path
          // eslint-disable-next-line @next/next/no-img-element -- miniatura del panel, sin optimizar a propósito
          ? <div className="admin-thumb"><img src={event.main_image_path} alt="" /><label className="check-field"><input id="event-remove-image" type="checkbox" name="remove_image" /><span>Quitar</span></label></div>
          : <p className="field-help">Sin imagen: se usa la foto del lugar o la imagen general del sitio.</p>}
        <label className="field"><span>{event?.main_image_path ? "Reemplazar por" : "Subir"}</span><input id="event-image" type="file" name="image" accept="image/jpeg,image/png,image/webp,image/avif" /></label>
        <p className="field-help">JPG, PNG, WebP o AVIF, hasta 10 MB.</p>
      </fieldset>

      <div className="admin-actions"><SubmitButton>Guardar evento</SubmitButton></div>
    </form>
  );
}
