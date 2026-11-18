import Link from "next/link";
import { CalendarDays, ExternalLink, LayoutGrid, LogOut, MapPinned, Tags } from "lucide-react";
import { logout } from "@/app/admin/login/actions";
import type { StaffMember } from "@/lib/auth/session";

const links = [
  { href: "/admin", label: "Inicio", icon: LayoutGrid },
  { href: "/admin/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/admin/lugares", label: "Lugares", icon: MapPinned },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
];

export function AdminNav({ staff }: { staff: StaffMember }) {
  return (
    <nav className="admin-nav" aria-label="Panel">
      <ul>
        {links.map(({ href, label, icon: Icon }) => <li key={href}><Link href={href}><Icon size={17} /> {label}</Link></li>)}
        <li><Link href="/" target="_blank"><ExternalLink size={17} /> Ver sitio</Link></li>
      </ul>
      <form action={logout} className="admin-user">
        <span><strong>{staff.name}</strong><small>{staff.role === "admin" ? "Administración" : "Edición"}</small></span>
        <button type="submit" className="button button-outline-light"><LogOut size={16} /> Salir</button>
      </form>
    </nav>
  );
}
