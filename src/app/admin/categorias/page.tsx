import type { Metadata } from "next";
import Link from "next/link";
import { CirclePlus } from "lucide-react";
import { requireStaff } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { listCategories } from "@/services/admin/categories";
import { STATUS_LABELS } from "@/components/admin/labels";

export const metadata: Metadata = { title: "Categorías" };

const notices: Record<string, string> = { guardada: "Categoría guardada.", borrada: "Categoría borrada." };

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireStaff();
  const [{ ok }, categories] = await Promise.all([searchParams, listCategories(query)]);

  return (
    <div className="shell admin-main">
      <div className="admin-heading">
        <div><p className="section-kicker">Agenda</p><h1>Categorías</h1><p>Agrupan las actividades y arman los filtros de la agenda.</p></div>
        <Link className="button button-primary" href="/admin/categorias/nueva"><CirclePlus size={19} /> Nueva categoría</Link>
      </div>
      {ok && notices[ok] && <p className="form-ok" role="status">{notices[ok]}</p>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Nombre</th><th>Dirección</th><th>Eventos</th><th>Estado</th></tr></thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td><Link href={`/admin/categorias/${category.id}`}><span className="color-dot" style={{ background: category.color ?? undefined }} />{category.name}</Link></td>
                <td className="mono">{category.slug}</td>
                <td>{category.events}</td>
                <td><span className={`status status-${category.status}`}>{STATUS_LABELS[category.status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <p className="admin-empty">Todavía no hay categorías.</p>}
      </div>
    </div>
  );
}
