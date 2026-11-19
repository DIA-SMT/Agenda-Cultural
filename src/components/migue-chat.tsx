"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Migue, el asistente de la Municipalidad, en la Agenda Cultural: un botón en la esquina
 * inferior derecha que abre un chat.
 *
 * Habla con el backend de Migue (POST /api/agenda/chat). Migue contesta con lo que la Agenda
 * publica, que lee de /api/migue/contenido (ver src/lib/migue.ts). Las respuestas pueden traer
 * botones que llevan a una página del sitio; Migue ya los controla contra las que existen.
 *
 * Es público: no hay login. La charla se identifica con un id anónimo que vive en la pestaña
 * (sessionStorage) y se pierde al cerrarla.
 *
 * Dónde está Migue: NEXT_PUBLIC_MIGUE_URL al compilar. Sin definirla, una compilación de
 * producción usa el de la Municipalidad, así el chat aparece sin configurar nada; en desarrollo
 * no hay chat salvo que se defina. NEXT_PUBLIC_MIGUE_URL=no lo apaga.
 */

const CONFIGURADA = process.env.NEXT_PUBLIC_MIGUE_URL;
const MIGUE_URL = (
  CONFIGURADA === "no" ? ""
  : CONFIGURADA ? CONFIGURADA
  : process.env.NODE_ENV === "production" ? "https://migue.smt.gob.ar"
  : ""
).replace(/\/+$/, "");

type Accion = { tipo: "navegar"; ruta: string; etiqueta: string };
type Mensaje = { rol: "usuario" | "migue"; texto: string; acciones?: Accion[]; error?: boolean };

const CLAVE_SESION = "migue-agenda-sesion";
const CLAVE_CHARLA = "migue-agenda-charla";
const SUGERENCIAS = ["¿Qué hay para hacer este fin de semana?", "¿Qué eventos gratis hay?", "¿Qué museos puedo visitar?"];

function nuevoId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

function leer<T>(clave: string, porDefecto: T): T {
  try {
    const v = sessionStorage.getItem(clave);
    return v ? (JSON.parse(v) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

function guardar(clave: string, valor: unknown) {
  try {
    sessionStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* sin almacenamiento la charla dura lo que la página */
  }
}

/** Convierte las direcciones web del texto en enlaces, sin inyectar HTML. */
function ConEnlaces({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/(https?:\/\/[^\s]+)/g).map((parte, i) => {
        if (!/^https?:\/\//.test(parte)) return <span key={i}>{parte}</span>;
        const url = parte.replace(/[.,;:!?)\]]+$/, "");
        return (
          <span key={i}>
            <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
            {parte.slice(url.length)}
          </span>
        );
      })}
    </>
  );
}

export function MigueChat() {
  const ruta = usePathname() ?? "";
  const [abierto, setAbierto] = useState(false);
  // La charla de esta pestaña sobrevive a una recarga. Se lee al crear el estado: el panel
  // arranca cerrado, así que no cambia lo que se ve al hidratar.
  const [mensajes, setMensajes] = useState<Mensaje[]>(() =>
    typeof window === "undefined" ? [] : leer<Mensaje[]>(CLAVE_CHARLA, []));
  const [texto, setTexto] = useState("");
  const [esperando, setEsperando] = useState(false);
  const sesion = useRef("");
  const lista = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLTextAreaElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    sesion.current = leer(CLAVE_SESION, "") || nuevoId();
    guardar(CLAVE_SESION, sesion.current);
  }, []);

  useEffect(() => {
    guardar(CLAVE_CHARLA, mensajes.filter((m) => !m.error).slice(-30));
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: "smooth" });
  }, [mensajes, esperando]);

  useEffect(() => {
    if (abierto) campo.current?.focus();
  }, [abierto]);

  const cerrar = useCallback(() => {
    setAbierto(false);
    boton.current?.focus();
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierto, cerrar]);

  const enviar = useCallback(async (consulta: string) => {
    const limpio = consulta.trim();
    if (!limpio || esperando) return;
    setTexto("");
    setMensajes((m) => [...m, { rol: "usuario", texto: limpio }]);
    setEsperando(true);
    try {
      const r = await fetch(`${MIGUE_URL}/api/agenda/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: limpio, sessionId: sesion.current }),
      });
      const datos = await r.json().catch(() => ({}));
      if (!r.ok || typeof datos.respuesta !== "string") throw new Error("sin respuesta");
      setMensajes((m) => [...m, { rol: "migue", texto: datos.respuesta, acciones: Array.isArray(datos.acciones) ? datos.acciones : [] }]);
    } catch (e) {
      const aviso = e instanceof TypeError
        ? "No pude conectarme. Revisá tu conexión y probá de nuevo."
        : "Perdón, justo ahora no puedo responder. Probá de nuevo en unos minutos.";
      setMensajes((m) => [...m, { rol: "migue", texto: aviso, error: true }]);
    } finally {
      setEsperando(false);
    }
  }, [esperando]);

  const reiniciar = () => {
    sesion.current = nuevoId();
    guardar(CLAVE_SESION, sesion.current);
    setMensajes([]);
    campo.current?.focus();
  };

  // El panel del equipo no es para el público: ahí no va el chat.
  if (!MIGUE_URL || ruta.startsWith("/admin")) return null;

  return (
    <div className="migue">
      {abierto && (
        <section id="migue-panel" className="migue__panel" role="dialog" aria-label="Chat con Migue">
          <header className="migue__cabecera">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="migue__avatar" src="/migue/migue-avatar.webp" alt="" width={40} height={40} />
            <div className="migue__titulo">
              <strong>Migue</strong>
              <span>Asistente de la Municipalidad</span>
            </div>
            {mensajes.length > 0 && (
              <button type="button" className="migue__icono" onClick={reiniciar} aria-label="Empezar una charla nueva" title="Charla nueva">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2L8 6l4 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" /></svg>
              </button>
            )}
            <button type="button" className="migue__icono" onClick={cerrar} aria-label="Cerrar el chat" title="Cerrar">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z" /></svg>
            </button>
          </header>

          <div className="migue__mensajes" ref={lista} aria-live="polite">
            {mensajes.length === 0 && (
              <div className="migue__bienvenida">
                <p>¡Hola! Soy Migue. Te ayudo a encontrar qué hacer en la ciudad: eventos, fechas, museos y espacios culturales.</p>
                <p className="migue__aviso">Soy un asistente automático: respondo con lo que publica la Agenda Cultural y puedo equivocarme. No compartas datos personales.</p>
                <div className="migue__sugerencias">
                  {SUGERENCIAS.map((s) => (
                    <button type="button" key={s} onClick={() => enviar(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {mensajes.map((m, i) => (
              <div key={i} className={`migue__msj migue__msj--${m.rol}${m.error ? " migue__msj--error" : ""}`}>
                <p><ConEnlaces texto={m.texto} /></p>
                {m.acciones && m.acciones.length > 0 && (
                  <div className="migue__acciones">
                    {m.acciones.map((a) => (
                      <Link key={a.ruta} href={a.ruta} onClick={() => { if (window.matchMedia("(max-width: 560px)").matches) setAbierto(false); }}>
                        {a.etiqueta}
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 5.3 19.9 12l-6.7 6.7-1.4-1.4 4.3-4.3H4v-2h12.1l-4.3-4.3z" /></svg>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {esperando && (
              <div className="migue__msj migue__msj--migue migue__escribiendo" aria-label="Migue está escribiendo">
                <span /><span /><span />
              </div>
            )}
          </div>

          <form className="migue__form" onSubmit={(e) => { e.preventDefault(); enviar(texto); }}>
            <label className="sr-only" htmlFor="migue-campo">Escribile a Migue</label>
            <textarea
              id="migue-campo"
              ref={campo}
              rows={1}
              maxLength={1000}
              value={texto}
              placeholder="Escribí tu consulta…"
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviar(texto);
                }
              }}
            />
            <button type="submit" className="migue__enviar" disabled={!texto.trim() || esperando} aria-label="Enviar">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.4 20.4 21 12 3.4 3.6l-.01 6.53L15 12 3.39 13.87z" /></svg>
            </button>
          </form>
        </section>
      )}

      <button
        ref={boton}
        type="button"
        className={`migue__boton${abierto ? " migue__boton--abierto" : ""}`}
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
        aria-expanded={abierto}
        aria-controls="migue-panel"
        aria-label={abierto ? "Cerrar el chat con Migue" : "Abrir el chat con Migue"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/migue/migue-avatar.webp" alt="" width={56} height={56} />
        {!abierto && <span className="migue__globo">¿Qué hacemos hoy?</span>}
      </button>
    </div>
  );
}
