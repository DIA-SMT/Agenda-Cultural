import type { EventOccurrence, EventStatus } from "@/types/domain";

export const STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
  suspended: "Suspendido",
  rescheduled: "Reprogramado",
  finished: "Finalizado",
};

export const OCCURRENCE_STATUS_LABELS: Record<EventOccurrence["status"], string> = {
  scheduled: "Confirmada",
  suspended: "Suspendida",
  rescheduled: "Reprogramada",
  cancelled: "Cancelada",
};

export const ACCESS_LABELS = { free: "Gratis", paid: "Paga", check: "Consultar" } as const;
