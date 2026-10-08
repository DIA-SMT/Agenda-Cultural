import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Acceso administrativo", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <div className="admin-page">
      <div className="login-card">
        <span className="admin-icon"><ShieldCheck /></span>
        <p className="section-kicker">Gestión municipal</p>
        <h1>Acceso administrativo</h1>
        <p>Ingresá con tu cuenta autorizada para gestionar la Agenda Cultural.</p>
        <LoginForm />
      </div>
    </div>
  );
}
