import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/admin/category-form";
import { requireStaff } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Nueva categoría" };

export default async function NewCategoryPage() {
  await requireStaff();
  return (
    <div className="shell admin-main">
      <Link className="admin-back" href="/admin/categorias"><ArrowLeft size={17} /> Categorías</Link>
      <div className="admin-heading"><div><h1>Nueva categoría</h1></div></div>
      <CategoryForm />
    </div>
  );
}
