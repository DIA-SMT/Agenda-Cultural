import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PlaceForm } from "@/components/admin/place-form";
import { requireStaff } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Nuevo lugar" };

export default async function NewPlacePage() {
  await requireStaff();
  return (
    <div className="shell admin-main">
      <Link className="admin-back" href="/admin/lugares"><ArrowLeft size={17} /> Lugares</Link>
      <div className="admin-heading"><div><h1>Nuevo lugar</h1></div></div>
      <PlaceForm />
    </div>
  );
}
