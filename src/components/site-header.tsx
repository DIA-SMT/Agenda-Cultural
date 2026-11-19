"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BUS_TURISTICO_URL } from "@/lib/links";

interface NavLink { href: string; label: string }
interface NavGroup { id: string; label: string; items: NavLink[] }
type NavItem = NavLink | NavGroup;

// Mismo menú que el sitio anterior, con el Bus Turístico a mano en el primer nivel.
const navigation: NavItem[] = [
  { href: "/agenda", label: "Qué hacer" },
  {
    id: "donde-ir",
    label: "Dónde ir",
    items: [
      { href: "/espacios-culturales", label: "Espacios culturales" },
      { href: "/espacios-al-aire-libre", label: "Espacios al aire libre" },
      { href: "/patrimonio-historico", label: "Patrimonio histórico" },
      { href: "/gastronomia", label: "Gastronomía" },
      { href: "/ferias-municipales", label: "Ferias municipales" },
    ],
  },
  { href: BUS_TURISTICO_URL, label: "Bus Turístico" },
  {
    id: "info-util",
    label: "Info útil",
    items: [
      { href: "/planifica-tu-viaje", label: "Planificá tu viaje" },
      { href: "/nuestra-ciudad", label: "Nuestra ciudad" },
      { href: "/guias", label: "Guías y mapas" },
      { href: "/oficinas", label: "Oficinas" },
      { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
    ],
  },
];

const isGroup = (item: NavItem): item is NavGroup => "items" in item;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  // Submenú abierto con clic o teclado (con el mouse también se abre al pasar por encima, por CSS).
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!openGroup) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !navRef.current?.contains(event.target as Node)) setOpenGroup(null);
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, [openGroup]);

  return (
    <header className="site-header">
      <a className="skip-link" href="#contenido">Ir al contenido</a>
      <div className="shell header-inner">
        <Link href="/" className="brand" aria-label="Agenda Cultural SMT, inicio">
          <Image src="/brand/ciudad-smt.png" width={154} height={72} alt="Ciudad SMT" priority />
          <span className="brand-divider" aria-hidden="true" />
          <span>Agenda<br />Cultural</span>
        </Link>
        <nav ref={navRef} className="desktop-nav" aria-label="Navegación principal">
          {navigation.map((item) => isGroup(item) ? (
            <div key={item.label} className={openGroup === item.label ? "nav-group open" : "nav-group"}>
              <button
                type="button"
                aria-expanded={openGroup === item.label}
                aria-controls={`submenu-${item.id}`}
                onClick={() => setOpenGroup((current) => (current === item.label ? null : item.label))}
              >
                {item.label} <ChevronDown size={16} aria-hidden="true" />
              </button>
              <div id={`submenu-${item.id}`} className="nav-dropdown">
                {item.items.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpenGroup(null)}>{link.label}</Link>)}
              </div>
            </div>
          ) : (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
          <Link href="/agenda" className="header-search" aria-label="Buscar en la agenda"><Search size={20} /></Link>
        </nav>
        <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-menu">
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
        </button>
      </div>
      {open && (
        <nav id="mobile-menu" className="mobile-nav" aria-label="Navegación móvil">
          {/* En el celular van primero los accesos sueltos y después cada grupo con su título. */}
          {navigation.filter((item): item is NavLink => !isGroup(item)).map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
          {navigation.filter(isGroup).map((group) => (
            <div key={group.id} className="mobile-nav-group">
              <p>{group.label}</p>
              {group.items.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
