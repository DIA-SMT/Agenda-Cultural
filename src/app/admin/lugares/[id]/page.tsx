import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PlaceForm } from "@/components/admin/place-form";
import { requireStaff } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { getPlaceAdmin } from "@/services/admin/places";

export const metadata: Metadata = { title: "Editar lugar" };

// Los lugares no se borran desde el panel: los eventos que los usan se quedarían sin lugar. Se archivan.
export default async function EditPlacePage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const place = /^[0-9a-f-]{36}$/i.test(id) ? await getPlaceAdmin(query, id) : null;
  if (!place) notFound();

  return (
    <div className="shell admin-main">
      <Link className="admin-back" href="/admin/lugares"><ArrowLeft size={17} /> Lugares</Link>
      <div className="admin-heading">
        <div><h1>{place.name}</h1><p>Para sacarlo del sitio, cambiá el estado a Borrador o Archivado.</p></div>
        {place.status === "published" && <Link className="button button-secondary" href={`/lugares/${place.slug}`} target="_blank"><ExternalLink size={17} /> Ver en el sitio</Link>}
      </div>
      <PlaceForm place={place} />
    </div>
  );
}
