import Image from "next/image";
import Link from "next/link";
import { BUS_TURISTICO_URL, REDES_MUNICIPIO } from "@/lib/links";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Image src="/brand/ciudad-smt.png" width={170} height={80} alt="Municipalidad de San Miguel de Tucumán" />
          <p className="footer-note">Agenda Cultural de la Municipalidad de San Miguel de Tucumán.</p>
          <nav className="footer-social" aria-label="Redes de la Municipalidad">
            {REDES_MUNICIPIO.map((red) => <a key={red.href} href={red.href} target="_blank" rel="noreferrer">{red.label}</a>)}
          </nav>
        </div>
        <div>
          <h2>Agenda</h2>
          <Link href="/agenda">Todos los eventos</Link>
          <Link href="/agenda?free=1">Actividades gratuitas</Link>
          <Link href="/agenda?range=weekend">Este fin de semana</Link>
          <Link href="/ferias-municipales">Ferias municipales</Link>
        </div>
        <div>
          <h2>Dónde ir</h2>
          <Link href="/espacios-culturales">Espacios culturales</Link>
          <Link href="/espacios-al-aire-libre">Plazas y parques</Link>
          <Link href="/patrimonio-historico">Patrimonio histórico</Link>
          <Link href="/gastronomia">Gastronomía</Link>
          <a href={BUS_TURISTICO_URL}>Bus Turístico</a>
        </div>
        <div>
          <h2>Info útil</h2>
          <Link href="/planifica-tu-viaje">Planificá tu viaje</Link>
          <Link href="/nuestra-ciudad">Nuestra ciudad</Link>
          <Link href="/guias">Guías y mapas</Link>
          <Link href="/oficinas">Oficinas</Link>
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
