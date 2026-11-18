"use client";

import { useActionState } from "react";
import { savePlaceAction } from "@/app/admin/lugares/actions";
import { pick, SubmitButton } from "@/components/admin/form-parts";
import type { FormState } from "@/lib/form-state";
import type { PlaceAdmin } from "@/services/admin/places";
import { PLACE_TYPE_LABELS } from "@/services/place-rows";

export function PlaceForm({ place }: { place?: PlaceAdmin }) {
  const [state, action] = useActionState<FormState, FormData>(savePlaceAction, {});
  const v = state.values;
  const social = place?.social_links ?? {};

  return (
    <form action={action} className="admin-form">
      {place && <input type="hidden" name="id" value={place.id} />}
      {state.error && <p className="form-error" role="alert">{state.error}</p>}

      <fieldset className="admin-fieldset">
        <legend>Datos principales</legend>
        <div className="admin-fields">
          <label className="field wide"><span>Nombre</span><input id="place-name" name="name" required minLength={2} maxLength={160} defaultValue={pick(v, "name", place?.name)} /></label>
          <label className="field"><span>Dirección en el sitio (slug)</span><input id="place-slug" name="slug" placeholder="Se arma con el nombre" defaultValue={pick(v, "slug", place?.slug)} /><small className="field-help">/lugares/…</small></label>
          <label className="field"><span>Tipo</span>
            <select id="place-type" name="type" defaultValue={pick(v, "type", place?.type ?? "cultural_house")}>
              {Object.entries(PLACE_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label.one}</option>)}
            </select>
          </label>
          <label className="field"><span>Estado</span>
            <select id="place-status" name="status" defaultValue={pick(v, "status", place?.status ?? "draft")}>
              <option value="published">Publicado</option><option value="draft">Borrador</option><option value="archived">Archivado</option>
            </select>
          </label>
          <label className="check-field"><input id="place-featured" type="checkbox" name="featured" defaultChecked={v ? v.featured === "on" : place?.featured} /><span>Destacado</span></label>
          <label className="field wide"><span>Resumen</span><textarea id="place-summary" name="summary" rows={2} maxLength={400} defaultValue={pick(v, "summary", place?.summary)} /><small className="field-help">Aparece en las tarjetas y debajo del nombre.</small></label>
          <label className="field wide"><span>Descripción</span><textarea id="place-description" name="description" rows={8} defaultValue={pick(v, "description", place?.description)} /><small className="field-help">Dejá un renglón en blanco entre párrafos.</small></label>
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Visita y contacto</legend>
        <div className="admin-fields">
          <label className="field wide"><span>Dirección postal</span><input id="place-address" name="address" maxLength={200} defaultValue={pick(v, "address", place?.address)} /></label>
          <label className="field"><span>Teléfono</span><input id="place-phone" name="phone" maxLength={60} defaultValue={pick(v, "phone", place?.phone)} /></label>
          <label className="field"><span>Correo</span><input id="place-email" name="email" type="email" defaultValue={pick(v, "email", place?.email)} /></label>
          <label className="field wide"><span>Horarios</span><textarea id="place-hours" name="opening_hours" rows={3} defaultValue={pick(v, "opening_hours", place?.opening_hours?.lineas?.join("\n"))} /><small className="field-help">Un renglón por día o franja, como se quiere mostrar.</small></label>
          <label className="field wide"><span>Datos del espacio</span><textarea id="place-services" name="services" rows={3} defaultValue={pick(v, "services", place?.services?.join("\n"))} /><small className="field-help">Opcional. Un dato por renglón (capacidad, accesibilidad, servicios).</small></label>
          <label className="field"><span>Sitio web</span><input id="place-website" name="website" type="url" placeholder="https://" defaultValue={pick(v, "website", place?.website)} /></label>
          <label className="field"><span>Venta de entradas</span><input id="place-tickets" name="entradas" type="url" placeholder="https://" defaultValue={pick(v, "entradas", social.entradas)} /></label>
          <label className="field"><span>Instagram</span><input id="place-instagram" name="instagram" type="url" placeholder="https://www.instagram.com/…" defaultValue={pick(v, "instagram", social.instagram)} /></label>
          <label className="field"><span>Facebook</span><input id="place-facebook" name="facebook" type="url" placeholder="https://www.facebook.com/…" defaultValue={pick(v, "facebook", social.facebook)} /></label>
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend>Fotos</legend>
        <div className="admin-images">
          <div>
            <p className="admin-label">Foto principal</p>
            {place?.main_image_path
              // eslint-disable-next-line @next/next/no-img-element -- miniatura del panel, sin optimizar a propósito
              ? <div className="admin-thumb"><img src={place.main_image_path} alt="" /><label className="check-field"><input id="place-remove-image" type="checkbox" name="remove_image" /><span>Quitar</span></label></div>
              : <p className="field-help">Sin foto principal.</p>}
            <label className="field"><span>{place?.main_image_path ? "Reemplazar por" : "Subir"}</span><input id="place-image" type="file" name="image" accept="image/jpeg,image/png,image/webp,image/avif" /></label>
          </div>
          <div>
            <p className="admin-label">Galería</p>
            {(place?.gallery_paths ?? []).length > 0 ? (
              <div className="admin-thumbs">
                {(place?.gallery_paths ?? []).map((path) => (
                  <label key={path} className="admin-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element -- miniatura del panel */}
                    <img src={path} alt="" />
                    <span className="check-field"><input type="checkbox" name="gallery_keep" value={path} defaultChecked /> <span>Mantener</span></span>
                  </label>
                ))}
              </div>
            ) : <p className="field-help">Sin fotos en la galería.</p>}
            <label className="field"><span>Agregar fotos</span><input id="place-gallery" type="file" name="gallery" multiple accept="image/jpeg,image/png,image/webp,image/avif" /></label>
          </div>
        </div>
        <p className="field-help">JPG, PNG, WebP o AVIF, hasta 10 MB cada una.</p>
      </fieldset>

      <div className="admin-actions"><SubmitButton>Guardar lugar</SubmitButton></div>
    </form>
  );
}
