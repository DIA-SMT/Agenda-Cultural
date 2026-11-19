import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronDown, ExternalLink } from "lucide-react";
import { ContentHero } from "@/components/content/content-hero";
import { APP_CIUDAD_SMT } from "@/lib/links";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Clima, cómo llegar, transporte, comidas típicas, trámites, reclamos y emergencias: respuestas para vecinos y visitantes de San Miguel de Tucumán.",
  alternates: { canonical: "/preguntas-frecuentes" },
};

type Parte = string | { lista: string[] } | { enlaces: { label: string; href: string }[] };
interface Pregunta { q: string; a: Parte[] }

const grupos: { id: string; title: string; preguntas: Pregunta[] }[] = [
  {
    id: "visitantes",
    title: "Para visitantes",
    preguntas: [
      { q: "¿Cómo es el clima en San Miguel de Tucumán?", a: ["La ciudad tiene clima subtropical con estación seca: veranos muy calurosos y húmedos (las máximas pueden superar los 35 °C) e inviernos templados y secos. La media anual ronda los 25 °C, con pocas lluvias en los meses fríos."] },
      { q: "¿Cuál es la mejor época del año para visitar la ciudad?", a: ["San Miguel de Tucumán se puede visitar todo el año. El invierno (junio a agosto) ofrece días templados y cielos despejados, ideales para caminar y recorrer. El verano (diciembre a febrero) es más caluroso y lluvioso, con la vegetación muy verde. Depende de tus preferencias de clima y actividades."] },
      { q: "¿Cómo puedo llegar a San Miguel de Tucumán?", a: ["La ciudad cuenta con el Aeropuerto Internacional Teniente Benjamín Matienzo, a 9 km del centro, con vuelos desde las principales ciudades argentinas. También se puede llegar por ruta (RN 9, RN 38 y otras rutas nacionales), en ómnibus de larga distancia o en tren desde la Ciudad de Buenos Aires.", { enlaces: [{ label: "Planificá tu viaje", href: "/planifica-tu-viaje" }] }] },
      { q: "¿Cuáles son los principales atractivos turísticos?", a: ["Entre los lugares más visitados se destacan:", { lista: ["Casa Histórica de la Independencia", "Plaza Independencia y su entorno histórico", "Catedral de Tucumán e iglesias del casco céntrico", "Parque 9 de Julio y los museos a su alrededor", "Cerro San Javier y miradores cercanos"] }, "Otros puntos de interés: Museo Folklórico, Casa de Gobierno y Museo de la Industria Azucarera."] },
      { q: "¿Cómo es el transporte público dentro de la ciudad?", a: ["El sistema se basa principalmente en colectivos urbanos, que se pagan con tarjeta SUBE. El centro es caminable y se complementa con taxis, radiotaxis y remises habilitados. La Municipalidad ofrece mapas y herramientas digitales para consultar recorridos y horarios."] },
      { q: "¿Hay visitas guiadas o bus turístico?", a: ["Sí. Funciona un Bus Turístico gratuito que recorre los principales puntos históricos y culturales, con guías especializados. Los circuitos suelen salir desde Plaza Independencia en días y horarios determinados, con inscripción previa y cupos limitados. También se organizan visitas guiadas a pie en fechas especiales.", { enlaces: [{ label: "Bus Turístico", href: "https://busturistico.smt.gob.ar/" }] }] },
      { q: "¿Dónde puedo obtener información turística?", a: ["Podés acercarte a las oficinas de información turística del centro, donde se entregan mapas, folletos y asesoramiento. Además, el Ente Tucumán Turismo brinda información sobre toda la provincia y hay puntos de informes en Plaza Independencia en las temporadas de mayor afluencia.", { enlaces: [{ label: "Oficinas", href: "/oficinas" }, { label: "Guías y mapas", href: "/guias" }] }] },
      { q: "¿Es una ciudad segura para los turistas?", a: ["En general, San Miguel de Tucumán es un destino seguro, pero se recomiendan las mismas precauciones básicas que en cualquier ciudad: cuidar las pertenencias, evitar exhibir objetos de valor y usar taxis o remises oficiales de noche. Ante emergencias:", { lista: ["911: seguridad", "107: emergencias médicas", "100: bomberos", "103: Defensa Civil"] }] },
      { q: "¿Qué comidas típicas debería probar?", a: ["La estrella es la empanada tucumana, emblema gastronómico de la provincia. También se recomiendan el locro, las humitas y los tamales, además de postres como el quesillo con miel de caña, la mazamorra y las confituras regionales.", { enlaces: [{ label: "Gastronomía tucumana", href: "/gastronomia" }] }] },
      { q: "¿Qué lugares naturales cercanos puedo visitar?", a: ["A poca distancia de la ciudad se encuentran:", { lista: ["Dique El Cadillal (deportes náuticos y miradores)", "San Javier, Raco y El Siambón (yungas, senderos y turismo rural)", "Villa Nougués (pueblo de montaña con vistas panorámicas)"] }, "En excursiones de día completo también se pueden visitar Tafí del Valle, Amaicha y Quilmes, entre otros destinos."] },
    ],
  },
  {
    id: "vecinos",
    title: "Para vecinos",
    preguntas: [
      { q: "¿Cómo puedo comunicarme con la Municipalidad?", a: ["La sede central está en 9 de Julio 570, San Miguel de Tucumán. El conmutador telefónico es (0381) 451-6500. También se puede contactar a través del sitio oficial smt.gob.ar y de las redes sociales verificadas del municipio.", { enlaces: [{ label: "smt.gob.ar", href: "https://smt.gob.ar/" }] }] },
      { q: "¿Existe una app oficial para gestiones y reclamos?", a: ["Sí. La app “Ciudad SMT” permite sacar turnos, hacer reclamos, pagar algunos tributos, consultar la agenda de la ciudad y acceder a información útil desde el celular. Es gratuita.", { enlaces: [{ label: "Google Play", href: APP_CIUDAD_SMT.googlePlay }, { label: "App Store", href: APP_CIUDAD_SMT.appStore }] }] },
      { q: "¿Cómo funciona la recolección de residuos?", a: ["La recolección domiciliaria se hace de lunes a sábado, generalmente de noche. Se recomienda sacar la basura poco antes del paso del camión. Para residuos voluminosos (poda, escombros, muebles) hay que pedir un retiro especial al municipio o desde la app Ciudad SMT. Para los reciclables hay EcoPuntos en plazas y espacios públicos."] },
      { q: "¿Qué servicios de salud y emergencias hay?", a: ["La ciudad cuenta con hospitales y centros de salud públicos provinciales y con la Asistencia Pública Municipal para atención primaria y urgencias menores. En emergencias:", { lista: ["107: ambulancias y emergencias médicas", "911: seguridad", "100 / 103: bomberos y Defensa Civil"] }] },
      { q: "¿Cuáles son los trámites municipales más comunes?", a: ["Algunos de los trámites más frecuentes son:", { lista: ["Pago de tasas municipales (CISI, Higiene, Cementerio)", "Licencia de conducir", "Habilitación comercial", "Carnet de sanidad", "Turnos para castración de mascotas y otros servicios"] }, "Muchos pueden iniciarse online desde Ciudad SMT o CiDiTuc."] },
      { q: "¿Qué es Ciudad Digital Tucumán (CiDiTuc)?", a: ["Es la plataforma digital de trámites del municipio. Ahí se pueden pagar tasas, pedir turnos, consultar expedientes, descargar credenciales digitales y gestionar distintos servicios sin ir a las oficinas.", { enlaces: [{ label: "ciudaddigital.smt.gob.ar", href: "https://ciudaddigital.smt.gob.ar/" }] }] },
      { q: "¿Cómo presento un reclamo al Municipio?", a: ["La vía más ágil es la app Ciudad SMT, en la sección Atención Ciudadana, donde se puede reportar un problema y ubicarlo en el mapa. También se reciben reclamos por teléfono, en la Oficina de Reclamos y por las redes oficiales."] },
      { q: "¿Qué es la Asistencia Pública?", a: ["Es el centro de salud municipal de atención primaria y urgencias menores, abierto las 24 horas. Ofrece curaciones, primeros auxilios, consultas clínicas y derivaciones. Teléfonos: (0381) 430-8393 y 421-2329."] },
      { q: "¿Cómo puedo participar en la gestión municipal?", a: ["El municipio promueve la participación con encuestas, audiencias públicas, reuniones barriales, consultas en la app Ciudad SMT y la “Banca del Vecino” en el Concejo Deliberante: espacios para proponer ideas, expresar necesidades y acceder a información de gestión."] },
      { q: "¿Cómo obtengo la tarjeta SUBE?", a: ["La SUBE es el medio de pago de los colectivos urbanos. Se compra en kioscos y puntos habilitados; los beneficiarios de programas sociales pueden obtenerla sin costo en los puntos que informa el municipio. Conviene registrarla en MiSUBE para proteger el saldo y poder recuperarlo si se pierde."] },
    ],
  },
];

const textoPlano = (partes: Parte[]) =>
  partes.map((parte) => (typeof parte === "string" ? parte : "lista" in parte ? parte.lista.join(". ") : "")).filter(Boolean).join(" ");

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: grupos.flatMap((grupo) => grupo.preguntas).map((pregunta) => ({
      "@type": "Question",
      name: pregunta.q,
      acceptedAnswer: { "@type": "Answer", text: textoPlano(pregunta.a) },
    })),
  };

  return (
    <div className="page-surface">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ContentHero
        kicker="Info útil"
        title="Preguntas frecuentes"
        intro="Respuestas simples a las consultas más comunes de vecinos y visitantes: recorridos, servicios, trámites y experiencias en la ciudad."
      >
        <nav className="faq-jump" aria-label="Grupos de preguntas">
          {grupos.map((grupo) => <a key={grupo.id} href={`#${grupo.id}`}>{grupo.title}</a>)}
        </nav>
      </ContentHero>
      <div className="shell faq-groups">
        {grupos.map((grupo) => (
          <section key={grupo.id} id={grupo.id} aria-labelledby={`${grupo.id}-title`}>
            <h2 id={`${grupo.id}-title`}>{grupo.title}</h2>
            <div className="faq-list">
              {grupo.preguntas.map((pregunta) => (
                <details key={pregunta.q} className="faq-item">
                  <summary>{pregunta.q}<ChevronDown aria-hidden="true" /></summary>
                  <div className="faq-answer">
                    {pregunta.a.map((parte, i) => {
                      if (typeof parte === "string") return <p key={i}>{parte}</p>;
                      if ("lista" in parte) return <ul key={i}>{parte.lista.map((item) => <li key={item}>{item}</li>)}</ul>;
                      return (
                        <p key={i} className="faq-links">
                          {parte.enlaces.map((enlace) => enlace.href.startsWith("http")
                            ? <a key={enlace.href} href={enlace.href} target="_blank" rel="noreferrer">{enlace.label}<ExternalLink size={15} aria-hidden="true" /></a>
                            : <Link key={enlace.href} href={enlace.href}>{enlace.label}<ArrowRight size={15} aria-hidden="true" /></Link>)}
                        </p>
                      );
                    })}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
