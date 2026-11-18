import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CirclePlus, FileText, Images, MapPinned, Settings, Tags } from "lucide-react";
import { isDatabaseConfigured } from "@/lib/db";

export const metadata: Metadata = { title: "Panel administrativo", robots: { index: false, follow: false } };

const modules = [
  { label: "Eventos", description: "Crear, editar y programar actividades", href: "/admin/eventos", icon: CalendarDays },
  { label: "Lugares", description: "Espacios culturales y puntos de interés", href: "/admin/lugares", icon: MapPinned },
  { label: "Categorías", description: "Organizar la agenda", href: "/admin/categorias", icon: Tags },
  { label: "Páginas", description: "Contenido institucional", href: "/admin/paginas", icon: FileText },
  { label: "Biblioteca", description: "Imágenes y documentos", href: "/admin/medios", icon: Images },
  { label: "Configuración", description: "Enlaces y datos generales", href: "/admin/configuracion", icon: Settings },
];

export default function AdminPage() {
  return (
    <div className="admin-page dashboard-page">
      <div className="shell admin-shell">
        <div className="demo-notice">Modo de estructura: la autenticación y la edición de contenidos todavía no están habilitadas.</div>
        <div className="admin-heading"><div><p className="section-kicker">Agenda Cultural SMT</p><h1>Panel de gestión</h1><p>Administrá los contenidos que se publican en el sitio.</p></div><Link className="button button-primary" href="/admin/eventos/nuevo"><CirclePlus size={19} /> Nuevo evento</Link></div>
        <div className="admin-modules">{modules.map(({ icon: Icon, ...item }) => <Link key={item.href} href={item.href}><Icon /><strong>{item.label}</strong><span>{item.description}</span></Link>)}</div>
        <section className="admin-status"><h2>Estado del sistema</h2><dl><div><dt>Base de datos</dt><dd>{isDatabaseConfigured ? "Configurada" : "Pendiente"}</dd></div><div><dt>Contenido</dt><dd>{isDatabaseConfigured ? "PostgreSQL" : "Datos demo"}</dd></div><div><dt>Zona horaria</dt><dd>America/Argentina/Tucuman</dd></div></dl></section>
      </div>
    </div>
  );
}
