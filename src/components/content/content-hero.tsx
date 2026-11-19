import Image from "next/image";
import type { ReactNode } from "react";

interface ContentHeroProps {
  kicker: string;
  title: string;
  intro: string;
  /** Con foto, la portada ocupa más alto y la foto va de fondo; sin foto queda la franja azul. */
  image?: string;
  children?: ReactNode;
}

export function ContentHero({ kicker, title, intro, image, children }: ContentHeroProps) {
  if (!image) {
    return (
      <div className="page-hero">
        <div className="shell"><p className="section-kicker">{kicker}</p><h1>{title}</h1><p>{intro}</p>{children}</div>
      </div>
    );
  }
  return (
    <div className="place-detail-hero content-hero">
      <Image src={image} alt="" fill preload sizes="100vw" />
      <div className="detail-overlay" />
      <div className="shell detail-heading">
        <p className="section-kicker">{kicker}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
        {children}
      </div>
    </div>
  );
}
