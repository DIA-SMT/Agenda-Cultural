import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Image src="/brand/ciudad-smt.png" width={170} height={80} alt="Municipalidad de San Miguel de Tucumán" />
          <p className="footer-note">Agenda Cultural de la Municipalidad de San Miguel de Tucumán.</p>
        </div>
        <div>
          <h2>Agenda</h2>
          <Link href="/agenda">Todos los eventos</Link>
          <Link href="/agenda?free=1">Actividades gratuitas</Link>
          <Link href="/bus-turistico">Bus Turístico</Link>
        </div>
        <div>
          <h2>Visitá la ciudad</h2>
          <Link href="/lugares">Lugares</Link>
          <Link href="/gastronomia">Gastronomía</Link>
          <Link href="/patrimonio-historico">Patrimonio histórico</Link>
        </div>
        <div>
          <h2>Información</h2>
          <Link href="/oficinas">Oficinas</Link>
          <Link href="/guias">Guías</Link>
          <Link href="/preguntas-frecuentes">Preguntas frecuentes</Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>Municipalidad de San Miguel de Tucumán</span>
        <Link href="/admin/login">Acceso administrativo</Link>
      </div>
    </footer>
  );
}
