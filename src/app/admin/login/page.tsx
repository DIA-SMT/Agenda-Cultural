import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { currentStaff } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Acceso administrativo", robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  if (await currentStaff()) redirect("/admin");
  const { next } = await searchParams;

  return (
    <div className="admin-page">
      <div className="login-card">
        <span className="admin-icon"><ShieldCheck /></span>
        <p className="section-kicker">Gestión municipal</p>
        <h1>Acceso administrativo</h1>
        <p>Ingresá con tu cuenta del equipo para gestionar la Agenda Cultural.</p>
        <LoginForm next={Array.isArray(next) ? next[0] : next} />
      </div>
    </div>
  );
}
