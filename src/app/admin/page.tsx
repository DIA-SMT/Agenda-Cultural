import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CirclePlus, MapPinned, Tags } from "lucide-react";
import { requireStaff } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { adminCounts } from "@/services/admin/events";

// La plantilla de título del layout no alcanza a la página de su misma carpeta.
export const metadata: Metadata = { title: { absolute: "Inicio | Panel de la Agenda Cultural" } };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  const staff = await requireStaff();
  const [{ aviso }, counts] = await Promise.all([searchParams, adminCounts(query)]);

  return (
    <div className="shell admin-main">
      {aviso === "solo-admin" && <p className="form-error" role="alert">Esa acción sólo la puede hacer una cuenta de administración.</p>}
      <div className="admin-heading">
        <div><p className="section-kicker">Hola, {staff.name.split(" ")[0]}</p><h1>Panel de gestión</h1><p>Cargá y publicá lo que aparece en la Agenda Cultural.</p></div>
        <Link className="button button-primary" href="/admin/eventos/nuevo"><CirclePlus size={19} /> Nuevo evento</Link>
      </div>
      <div className="admin-modules">
        <Link href="/admin/eventos"><CalendarDays /><strong>Eventos</strong><span>{counts.upcoming} con fechas por venir · {counts.published} publicados · {counts.drafts} en borrador</span></Link>
        <Link href="/admin/lugares"><MapPinned /><strong>Lugares</strong><span>{counts.places} publicados</span></Link>
        <Link href="/admin/categorias"><Tags /><strong>Categorías</strong><span>{counts.categories} publicadas</span></Link>
      </div>
    </div>
  );
}
