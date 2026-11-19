import { describe, expect, it } from "vitest";
import { demoEvents, demoPlaces } from "@/data/demo";
import { formatearFecha, PAGINAS_GENERALES, paraMigue } from "@/lib/migue";
import type { CulturalEvent, EventOccurrence } from "@/types/domain";

const AHORA = Date.parse("2026-11-19T12:00:00-03:00");

function ocurrencia(startsAt: string, extra: Partial<EventOccurrence> = {}): EventOccurrence {
  return { id: startsAt, eventId: "e1", startsAt, allDay: false, timezone: "America/Argentina/Tucuman", status: "scheduled", ...extra };
}

function evento(extra: Partial<CulturalEvent> = {}): CulturalEvent {
  return {
    ...demoEvents[0],
    id: "e1",
    slug: "concierto-de-la-banda",
    title: "Concierto de la Banda Municipal",
    summary: "La Banda Municipal toca en la plaza.",
    isDemo: false,
    accessType: "free",
    occurrences: [ocurrencia("2026-11-22T20:00:00-03:00", { endsAt: "2026-11-22T22:00:00-03:00" })],
    ...extra,
  };
}

describe("paraMigue", () => {
  it("arma el formato que lee Migue, con los eventos por venir y sus fechas en hora de Tucumán", () => {
    const c = paraMigue([evento()], demoPlaces, AHORA);
    expect(c.version).toBe(1);
    const f = c.fichas.find((x) => x.tipo === "evento");
    expect(f?.url).toBe("/eventos/concierto-de-la-banda");
    expect(f?.texto).toContain("domingo, 22 de noviembre de 2026, 20:00 a 22:00 h");
    expect(f?.texto).toContain("Entrada: Gratis");
    expect(c.general).toContain("Eventos por venir publicados: 1");
  });

  it("deja afuera lo que ya pasó, lo muy lejano, los borradores y los eventos de demostración", () => {
    const pasado = evento({ slug: "pasado", occurrences: [ocurrencia("2026-11-10T20:00:00-03:00")] });
    const lejano = evento({ slug: "lejano", occurrences: [ocurrencia("2027-08-01T20:00:00-03:00")] });
    const borrador = evento({ slug: "borrador", status: "draft" });
    const demo = { ...evento({ slug: "demo" }), isDemo: true };
    const c = paraMigue([pasado, lejano, borrador, demo], [], AHORA);
    expect(c.fichas.filter((x) => x.tipo === "evento")).toHaveLength(0);
  });

  it("marca las fechas suspendidas o reprogramadas y limita cuántas manda", () => {
    const muchas = Array.from({ length: 10 }, (_, i) => ocurrencia(`2026-11-${20 + i}T19:00:00-03:00`));
    muchas[0] = ocurrencia("2026-11-20T19:00:00-03:00", { status: "suspended" });
    const f = paraMigue([evento({ occurrences: muchas })], [], AHORA).fichas[0];
    expect(f.texto).toContain("(SUSPENDIDA)");
    expect(f.texto.match(/de 2026/g)).toHaveLength(6);
  });

  it("incluye los lugares publicados con su tipo y las páginas generales", () => {
    const c = paraMigue([], demoPlaces, AHORA);
    const lugar = c.fichas.find((x) => x.url === `/lugares/${demoPlaces[0].slug}`);
    expect(lugar?.tipo).toBe("centro cultural");
    for (const p of PAGINAS_GENERALES) expect(c.fichas.some((x) => x.url === p.url)).toBe(true);
  });

  it("formatea un evento de todo el día", () => {
    expect(formatearFecha(ocurrencia("2026-11-22T00:00:00-03:00", { allDay: true }))).toBe("domingo, 22 de noviembre de 2026, todo el día");
  });
});
