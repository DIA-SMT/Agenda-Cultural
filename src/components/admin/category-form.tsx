"use client";

import { useActionState } from "react";
import { saveCategoryAction } from "@/app/admin/categorias/actions";
import { pick, SubmitButton } from "@/components/admin/form-parts";
import type { FormState } from "@/lib/form-state";
import type { CategoryAdmin } from "@/services/admin/categories";

export function CategoryForm({ category }: { category?: CategoryAdmin }) {
  const [state, action] = useActionState<FormState, FormData>(saveCategoryAction, {});
  const v = state.values;

  return (
    <form action={action} className="admin-form">
      {category && <input type="hidden" name="id" value={category.id} />}
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <div className="admin-fields">
        <label className="field"><span>Nombre</span><input id="category-name" name="name" required minLength={2} maxLength={80} defaultValue={pick(v, "name", category?.name)} /></label>
        <label className="field"><span>Dirección (slug)</span><input id="category-slug" name="slug" placeholder="Se arma con el nombre" defaultValue={pick(v, "slug", category?.slug)} /><small className="field-help">Es la que usa la agenda para filtrar: /agenda?category=…</small></label>
        <label className="field"><span>Color</span><input id="category-color" name="color" type="color" defaultValue={pick(v, "color", category?.color ?? "#0274be")} /></label>
        <label className="field"><span>Estado</span>
          <select id="category-status" name="status" defaultValue={pick(v, "status", category?.status ?? "published")}>
            <option value="published">Publicada</option><option value="draft">Borrador</option><option value="archived">Archivada</option>
          </select>
        </label>
        <label className="field wide"><span>Descripción</span><textarea id="category-description" name="description" rows={3} maxLength={500} defaultValue={pick(v, "description", category?.description)} /></label>
      </div>
      <div className="admin-actions"><SubmitButton>Guardar categoría</SubmitButton></div>
    </form>
  );
}
