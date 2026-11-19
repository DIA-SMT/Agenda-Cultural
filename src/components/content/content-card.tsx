import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

interface ContentCardProps {
  title: string;
  text: string;
  image?: string;
  /** Rótulo sobre la foto, p. ej. "Parque" o "Guía". */
  badge?: string;
  /** Si empieza con http, se abre en otra pestaña. */
  href?: string;
  cta?: string;
  /** Datos extra debajo del texto (dirección, horario…). */
  children?: ReactNode;
}

export function ContentCard({ title, text, image, badge, href, cta = "Conocé más", children }: ContentCardProps) {
  const external = href?.startsWith("http");
  const label = <span className="sr-only">{cta}: {title}</span>;
  return (
    <article className="event-card content-card">
      {href && (external
        ? <a className="card-link" href={href} target="_blank" rel="noreferrer">{label}</a>
        : <Link className="card-link" href={href}>{label}</Link>)}
      {image && (
        <div className="event-image place-image">
          <Image src={image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw" />
          {badge && <span className="access-badge">{badge}</span>}
        </div>
      )}
      <div className="event-body">
        <h3>{title}</h3>
        <p className="place-summary">{text}</p>
        {children}
        {href && <span className="event-cta">{cta} {external ? <ExternalLink size={17} /> : <ArrowUpRight size={18} />}</span>}
      </div>
    </article>
  );
}
