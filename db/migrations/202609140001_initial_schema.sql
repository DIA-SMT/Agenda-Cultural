-- Esquema para PostgreSQL 16 sin servicios de Supabase. Sólo la aplicación se conecta a la base,
-- así que los permisos de edición se controlan en el servidor y no con RLS.
-- scripts/migrate.mjs ejecuta cada archivo dentro de una transacción.

create type public.user_role as enum ('admin', 'editor');
create type public.profile_status as enum ('active', 'inactive');
create type public.publication_status as enum ('draft', 'published', 'archived');
create type public.event_status as enum ('draft', 'published', 'suspended', 'rescheduled', 'finished', 'archived');
create type public.occurrence_status as enum ('scheduled', 'suspended', 'rescheduled', 'cancelled');
create type public.access_type as enum ('free', 'paid', 'check');
create type public.place_type as enum ('museum', 'theater', 'cultural_house', 'square', 'park', 'gastronomy', 'heritage', 'office', 'other');
create type public.tour_status as enum ('draft', 'available', 'unavailable', 'archived');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  full_name text not null check (char_length(full_name) between 2 and 120),
  role public.user_role not null default 'editor',
  status public.profile_status not null default 'inactive',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  color text check (color is null or color ~ '^#[0-9A-Fa-f]{6}$'),
  icon text,
  status public.publication_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  type public.place_type not null default 'other',
  summary text,
  description text,
  address text,
  latitude numeric(9,6) check (latitude between -90 and 90),
  longitude numeric(9,6) check (longitude between -180 and 180),
  opening_hours jsonb not null default '{}'::jsonb,
  phone text,
  email text check (email is null or email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  website text,
  social_links jsonb not null default '{}'::jsonb,
  accessibility text,
  services text[] not null default '{}',
  price text,
  main_image_path text,
  gallery_paths text[] not null default '{}',
  featured boolean not null default false,
  status public.publication_status not null default 'draft',
  seo_title text,
  seo_description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((latitude is null and longitude is null) or (latitude is not null and longitude is not null))
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 180),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  summary text,
  description text,
  main_image_path text,
  gallery_paths text[] not null default '{}',
  place_id uuid references public.places(id) on delete set null,
  custom_place_name text,
  custom_address text,
  custom_latitude numeric(9,6) check (custom_latitude between -90 and 90),
  custom_longitude numeric(9,6) check (custom_longitude between -180 and 180),
  organizer text,
  contact_info jsonb not null default '{}'::jsonb,
  price text,
  access_type public.access_type not null default 'check',
  registration_url text,
  ticket_url text,
  capacity integer check (capacity is null or capacity > 0),
  accessibility text,
  requirements text,
  featured boolean not null default false,
  status public.event_status not null default 'draft',
  published_at timestamptz,
  scheduled_publish_at timestamptz,
  seo_title text,
  seo_description text,
  legacy_id text,
  legacy_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (place_id is not null or custom_place_name is not null),
  check ((custom_latitude is null and custom_longitude is null) or (custom_latitude is not null and custom_longitude is not null))
);

create table public.event_categories (
  event_id uuid not null references public.events(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, category_id)
);

create table public.event_occurrences (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz,
  all_day boolean not null default false,
  timezone text not null default 'America/Argentina/Tucuman' check (timezone = 'America/Argentina/Tucuman'),
  status public.occurrence_status not null default 'scheduled',
  is_exception boolean not null default false,
  original_starts_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at),
  unique (event_id, starts_at)
);

create table public.event_recurrence_rules (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references public.events(id) on delete cascade,
  frequency text not null check (frequency in ('weekly', 'monthly', 'custom')),
  interval_value smallint not null default 1 check (interval_value between 1 and 52),
  weekdays smallint[] not null default '{}',
  month_days smallint[] not null default '{}',
  until_date date,
  rrule text,
  exceptions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (weekdays <@ array[0,1,2,3,4,5,6]::smallint[]),
  check (month_days <@ array[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]::smallint[])
);

create table public.tours (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  schedule jsonb not null default '{}'::jsonb,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  meeting_place_id uuid references public.places(id) on delete set null,
  custom_meeting_point text,
  recommendations text,
  registration_url text,
  status public.tour_status not null default 'draft',
  image_path text,
  featured boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tour_stops (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  place_id uuid references public.places(id) on delete set null,
  stop_order integer not null check (stop_order > 0),
  description text,
  latitude numeric(9,6) check (latitude between -90 and 90),
  longitude numeric(9,6) check (longitude between -180 and 180),
  created_at timestamptz not null default now(),
  unique (tour_id, stop_order),
  check ((latitude is null and longitude is null) or (latitude is not null and longitude is not null))
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  content jsonb not null default '{}'::jsonb,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  display_order integer not null default 0,
  status public.publication_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guides (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  document_path text,
  image_path text,
  status public.publication_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id boolean primary key default true check (id),
  site_name text not null default 'Agenda Cultural SMT',
  contact_info jsonb not null default '{}'::jsonb,
  social_links jsonb not null default '{}'::jsonb,
  app_links jsonb not null default '{}'::jsonb,
  general_settings jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.legacy_redirects (
  id uuid primary key default gen_random_uuid(),
  old_path text not null unique check (old_path like '/%'),
  new_path text not null check (new_path like '/%'),
  status_code smallint not null default 308 check (status_code in (301, 308)),
  legacy_id text,
  created_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  object_path text not null unique,
  alt_text text,
  mime_type text not null,
  byte_size bigint not null check (byte_size > 0),
  width integer,
  height integer,
  status public.publication_status not null default 'draft',
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'))
);

create index events_status_publish_idx on public.events (status, published_at desc);
create index events_featured_idx on public.events (featured) where featured;
create index events_legacy_id_idx on public.events (legacy_id) where legacy_id is not null;
create index event_occurrences_start_idx on public.event_occurrences (starts_at, event_id);
create index event_occurrences_event_idx on public.event_occurrences (event_id, starts_at);
create index places_type_status_idx on public.places (type, status);
create index places_featured_idx on public.places (featured) where featured;
create index tours_status_idx on public.tours (status);
create index faqs_status_order_idx on public.faqs (status, display_order);
create index pages_status_idx on public.pages (status);
create index media_assets_status_idx on public.media_assets (status);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger places_updated_at before update on public.places for each row execute function public.set_updated_at();
create trigger events_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger occurrences_updated_at before update on public.event_occurrences for each row execute function public.set_updated_at();
create trigger recurrence_updated_at before update on public.event_recurrence_rules for each row execute function public.set_updated_at();
create trigger tours_updated_at before update on public.tours for each row execute function public.set_updated_at();
create trigger pages_updated_at before update on public.pages for each row execute function public.set_updated_at();
create trigger faqs_updated_at before update on public.faqs for each row execute function public.set_updated_at();
create trigger guides_updated_at before update on public.guides for each row execute function public.set_updated_at();
create trigger settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

insert into public.site_settings (id) values (true) on conflict (id) do nothing;
