import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { currentStaff } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s | Panel de la Agenda Cultural" },
  robots: { index: false, follow: false },
};

// La banda oscura deja legible el encabezado del sitio (blanco, pensado para las portadas oscuras).
// El layout no protege nada: cada página y acción llama a requireStaff().
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await currentStaff();
  return (
    <div className="admin-area">
      <div className="admin-band">
        <div className="shell">{staff && <AdminNav staff={staff} />}</div>
      </div>
      {children}
    </div>
  );
}
