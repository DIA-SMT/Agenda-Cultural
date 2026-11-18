import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { deleteCategoryAction } from "@/app/admin/categorias/actions";
import { CategoryForm } from "@/components/admin/category-form";
import { DeleteButton } from "@/components/admin/form-parts";
import { requireStaff } from "@/lib/auth/session";
import { query } from "@/lib/db";
import { getCategory } from "@/services/admin/categories";

export const metadata: Metadata = { title: "Editar categoría" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const staff = await requireStaff();
  const { id } = await params;
  const category = /^[0-9a-f-]{36}$/i.test(id) ? await getCategory(query, id) : null;
  if (!category) notFound();

  return (
    <div className="shell admin-main">
      <Link className="admin-back" href="/admin/categorias"><ArrowLeft size={17} /> Categorías</Link>
      <div className="admin-heading">
        <div><h1>{category.name}</h1><p>{category.events} {category.events === 1 ? "evento la usa" : "eventos la usan"}.</p></div>
        {staff.role === "admin" && <DeleteButton action={deleteCategoryAction} id={category.id} what={`la categoría "${category.name}" (los eventos la pierden, no se borran)`} />}
      </div>
      <CategoryForm category={category} />
    </div>
  );
}
