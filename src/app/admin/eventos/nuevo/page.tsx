import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/admin/event-form";
import { requireStaff } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { listCategories } from "@/services/admin/categories";
import { placeOptions } from "@/services/admin/places";

export const metadata: Metadata = { title: "Nuevo evento" };

export default async function NewEventPage() {
  await requireStaff();
  const [places, categories] = await Promise.all([placeOptions(query), listCategories(query)]);
  return (
    <div className="shell admin-main">
      <Link className="admin-back" href="/admin/eventos"><ArrowLeft size={17} /> Eventos</Link>
      <div className="admin-heading"><div><h1>Nuevo evento</h1><p>Se guarda como borrador hasta que cambies el estado a Publicado.</p></div></div>
      <EventForm occurrences={[]} places={places} categories={categories.filter((category) => category.status !== "archived")} />
    </div>
  );
}
