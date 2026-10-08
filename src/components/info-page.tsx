import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function InfoPage({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="page-surface">
      <div className="page-hero"><div className="shell"><p className="section-kicker">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div></div>
      <div className="shell section">
        <div className="content-pending"><p className="section-kicker">Contenido en preparación</p><h2>Esta sección está lista para recibir la información oficial</h2><p>La estructura definitiva se completará mediante la importación controlada desde el sistema anterior. No mostramos horarios, teléfonos ni datos ficticios.</p><Link href="/agenda">Explorar la agenda de desarrollo <ArrowRight size={18} /></Link></div>
      </div>
    </div>
  );
}
