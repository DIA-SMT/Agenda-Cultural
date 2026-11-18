import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { deleteEventAction } from "@/app/admin/eventos/actions";
import { EventForm } from "@/components/admin/event-form";
import { DeleteButton } from "@/components/admin/form-parts";
import { requireStaff } from "@/lib/auth/session";
import { toTucumanParts } from "@/lib/dates";
import { query } from "@/lib/db";
import { listCategories } from "@/services/admin/categories";
import { getEventAdmin } from "@/services/admin/events";
import { placeOptions } from "@/services/admin/places";

export const metadata: Metadata = { title: "Editar evento" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const staff = await requireStaff();
  const { id } = await params;
  const event = /^[0-9a-f-]{36}$/i.test(id) ? await getEventAdmin(query, id) : null;
  if (!event) notFound();
  const [places, categories] = await Promise.all([placeOptions(query), listCategories(query)]);

  const occurrences = event.occurrences.map((occurrence) => {
    const start = toTucumanParts(occurrence.starts_at);
    return {
      key: occurrence.id, id: occurrence.id, date: start.date, start: start.time,
      end: occurrence.ends_at ? toTucumanParts(occurrence.ends_at).time : "", status: occurrence.status,
    };
  });

  return (
    <div className="shell admin-main">
      <Link className="admin-back" href="/admin/eventos"><ArrowLeft size={17} /> Eventos</Link>
      <div className="admin-heading">
        <div><h1>{event.title}</h1></div>
        <div className="admin-heading-actions">
          {event.status === "published" && <Link className="button button-secondary" href={`/eventos/${event.slug}`} target="_blank"><ExternalLink size={17} /> Ver en el sitio</Link>}
          {staff.role === "admin" && <DeleteButton action={deleteEventAction} id={event.id} what={`el evento "${event.title}" con todas sus fechas`} />}
        </div>
      </div>
      <EventForm
        event={event}
        occurrences={occurrences}
        places={places}
        categories={categories.filter((category) => category.status !== "archived" || event.category_ids.includes(category.id))}
      />
    </div>
  );
}
