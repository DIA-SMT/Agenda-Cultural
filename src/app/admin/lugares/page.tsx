import type { Metadata } from "next";
import Link from "next/link";
import { CirclePlus, ExternalLink } from "lucide-react";
import { STATUS_LABELS } from "@/components/admin/labels";
import { requireStaff } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { listPlacesAdmin } from "@/services/admin/places";
import { PLACE_TYPE_LABELS } from "@/services/place-rows";

export const metadata: Metadata = { title: "Lugares" };

export default async function PlacesAdminPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireStaff();
  const [{ ok }, places] = await Promise.all([searchParams, listPlacesAdmin(query)]);

  return (
    <div className="shell admin-main">
      <div className="admin-heading">
        <div><p className="section-kicker">Dónde ir</p><h1>Lugares</h1><p>Museos, teatros y espacios. Los publicados aparecen en /lugares y en los eventos.</p></div>
        <Link className="button button-primary" href="/admin/lugares/nuevo"><CirclePlus size={19} /> Nuevo lugar</Link>
      </div>
      {ok === "guardado" && <p className="form-ok" role="status">Lugar guardado.</p>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Nombre</th><th>Tipo</th><th>Dirección</th><th>Eventos</th><th>Estado</th><th><span className="sr-only">Ver</span></th></tr></thead>
          <tbody>
            {places.map((place) => (
              <tr key={place.id}>
                <td><Link href={`/admin/lugares/${place.id}`}>{place.name}</Link></td>
                <td>{PLACE_TYPE_LABELS[place.type].one}</td>
                <td>{place.address}</td>
                <td>{place.events}</td>
                <td><span className={`status status-${place.status}`}>{STATUS_LABELS[place.status]}</span></td>
                <td>{place.status === "published" && <Link href={`/lugares/${place.slug}`} target="_blank" aria-label={`Ver ${place.name} en el sitio`}><ExternalLink size={16} /></Link>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {places.length === 0 && <p className="admin-empty">Todavía no hay lugares.</p>}
      </div>
    </div>
  );
}
