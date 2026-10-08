"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { href: "/agenda", label: "Qué hacer" },
  { href: "/lugares", label: "Dónde ir" },
  { href: "/bus-turistico", label: "Bus Turístico" },
  { href: "/planifica-tu-viaje", label: "Info útil" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="skip-link" href="#contenido">Ir al contenido</a>
      <div className="shell header-inner">
        <Link href="/" className="brand" aria-label="Agenda Cultural SMT, inicio">
          <Image src="/brand/ciudad-smt.png" width={154} height={72} alt="Ciudad SMT" priority />
          <span className="brand-divider" aria-hidden="true" />
          <span>Agenda<br />Cultural</span>
        </Link>
        <nav className="desktop-nav" aria-label="Navegación principal">
          {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          <Link href="/agenda" className="header-search" aria-label="Buscar en la agenda"><Search size={20} /></Link>
        </nav>
        <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-menu">
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
        </button>
      </div>
      {open && (
        <nav id="mobile-menu" className="mobile-nav" aria-label="Navegación móvil">
          {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}
          <Link href="/nuestra-ciudad" onClick={() => setOpen(false)}>Nuestra ciudad</Link>
          <Link href="/preguntas-frecuentes" onClick={() => setOpen(false)}>Preguntas frecuentes</Link>
        </nav>
      )}
    </header>
  );
}
