export type PublicationStatus = "draft" | "published" | "archived";
export type EventStatus = PublicationStatus | "suspended" | "rescheduled" | "finished";
export type AccessType = "free" | "paid" | "check";

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
}

export interface Place {
  id: string;
  name: string;
  slug: string;
  type: "museum" | "theater" | "cultural_house" | "square" | "park" | "gastronomy" | "heritage" | "office" | "other";
  summary: string;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  /** Líneas tal como se publican, p. ej. "Lunes a viernes de 9 a 13 h". */
  openingHours?: string[];
  phone?: string;
  email?: string;
  website?: string;
  socialLinks?: SocialLinks;
  accessibility?: string;
  services?: string[];
  imageUrl?: string;
  gallery?: string[];
  featured: boolean;
  status: PublicationStatus;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  /** Boletería o venta de entradas. */
  entradas?: string;
}

export interface EventOccurrence {
  id: string;
  eventId: string;
  startsAt: string;
  endsAt?: string;
  allDay: boolean;
  timezone: "America/Argentina/Tucuman";
  status: "scheduled" | "suspended" | "rescheduled" | "cancelled";
}

export interface CulturalEvent {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  imageUrl: string;
  place: Place;
  categories: Category[];
  occurrences: EventOccurrence[];
  organizer?: string;
  contact?: string;
  price?: string;
  accessType: AccessType;
  registrationUrl?: string;
  ticketUrl?: string;
  accessibility?: string;
  featured: boolean;
  status: EventStatus;
  legacyUrl?: string;
  isDemo?: boolean;
}

export interface EventFilters {
  query?: string;
  category?: string;
  place?: string;
  from?: string;
  to?: string;
  free?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedEvents {
  items: CulturalEvent[];
  total: number;
  page: number;
  pageSize: number;
}
