begin;

create or replace function public.current_user_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and status = 'active';
$$;

create or replace function public.can_edit()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.current_user_role() in ('admin', 'editor'), false); $$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.current_user_role() = 'admin', false); $$;

revoke all on function public.current_user_role() from public;
revoke all on function public.can_edit() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.can_edit() to authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.places enable row level security;
alter table public.events enable row level security;
alter table public.event_categories enable row level security;
alter table public.event_occurrences enable row level security;
alter table public.event_recurrence_rules enable row level security;
alter table public.tours enable row level security;
alter table public.tour_stops enable row level security;
alter table public.pages enable row level security;
alter table public.faqs enable row level security;
alter table public.guides enable row level security;
alter table public.site_settings enable row level security;
alter table public.legacy_redirects enable row level security;
alter table public.media_assets enable row level security;

create policy "profiles_read_self" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles_update_self" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role = public.current_user_role());
create policy "profiles_admin_all" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "categories_public_read" on public.categories for select to anon, authenticated using (status = 'published' or public.can_edit());
create policy "categories_editor_insert" on public.categories for insert to authenticated with check (public.can_edit());
create policy "categories_editor_update" on public.categories for update to authenticated using (public.can_edit()) with check (public.can_edit());
create policy "categories_admin_delete" on public.categories for delete to authenticated using (public.is_admin());

create policy "places_public_read" on public.places for select to anon, authenticated using (status = 'published' or public.can_edit());
create policy "places_editor_insert" on public.places for insert to authenticated with check (public.can_edit());
create policy "places_editor_update" on public.places for update to authenticated using (public.can_edit()) with check (public.can_edit());
create policy "places_admin_delete" on public.places for delete to authenticated using (public.is_admin());

create policy "events_public_read" on public.events for select to anon, authenticated using (status in ('published', 'suspended', 'rescheduled', 'finished') or public.can_edit());
create policy "events_editor_insert" on public.events for insert to authenticated with check (public.can_edit());
create policy "events_editor_update" on public.events for update to authenticated using (public.can_edit()) with check (public.can_edit());
create policy "events_admin_delete" on public.events for delete to authenticated using (public.is_admin());

create policy "event_categories_public_read" on public.event_categories for select to anon, authenticated using (exists (select 1 from public.events e where e.id = event_id and (e.status in ('published', 'suspended', 'rescheduled', 'finished') or public.can_edit())));
create policy "event_categories_editor_insert" on public.event_categories for insert to authenticated with check (public.can_edit());
create policy "event_categories_editor_update" on public.event_categories for update to authenticated using (public.can_edit()) with check (public.can_edit());
create policy "event_categories_editor_delete" on public.event_categories for delete to authenticated using (public.can_edit());

create policy "occurrences_public_read" on public.event_occurrences for select to anon, authenticated using (exists (select 1 from public.events e where e.id = event_id and (e.status in ('published', 'suspended', 'rescheduled', 'finished') or public.can_edit())));
create policy "occurrences_editor_insert" on public.event_occurrences for insert to authenticated with check (public.can_edit());
create policy "occurrences_editor_update" on public.event_occurrences for update to authenticated using (public.can_edit()) with check (public.can_edit());
create policy "occurrences_editor_delete" on public.event_occurrences for delete to authenticated using (public.can_edit());

create policy "recurrence_editor_read" on public.event_recurrence_rules for select to authenticated using (public.can_edit());
create policy "recurrence_editor_insert" on public.event_recurrence_rules for insert to authenticated with check (public.can_edit());
create policy "recurrence_editor_update" on public.event_recurrence_rules for update to authenticated using (public.can_edit()) with check (public.can_edit());
create policy "recurrence_editor_delete" on public.event_recurrence_rules for delete to authenticated using (public.can_edit());

create policy "tours_public_read" on public.tours for select to anon, authenticated using (status in ('available', 'unavailable') or public.can_edit());
create policy "tours_editor_insert" on public.tours for insert to authenticated with check (public.can_edit());
create policy "tours_editor_update" on public.tours for update to authenticated using (public.can_edit()) with check (public.can_edit());
create policy "tours_admin_delete" on public.tours for delete to authenticated using (public.is_admin());

create policy "tour_stops_public_read" on public.tour_stops for select to anon, authenticated using (exists (select 1 from public.tours t where t.id = tour_id and (t.status in ('available', 'unavailable') or public.can_edit())));
create policy "tour_stops_editor_insert" on public.tour_stops for insert to authenticated with check (public.can_edit());
create policy "tour_stops_editor_update" on public.tour_stops for update to authenticated using (public.can_edit()) with check (public.can_edit());
create policy "tour_stops_editor_delete" on public.tour_stops for delete to authenticated using (public.can_edit());

create policy "pages_public_read" on public.pages for select to anon, authenticated using (status = 'published' or public.can_edit());
create policy "pages_editor_insert" on public.pages for insert to authenticated with check (public.can_edit());
create policy "pages_editor_update" on public.pages for update to authenticated using (public.can_edit()) with check (public.can_edit());
create policy "pages_admin_delete" on public.pages for delete to authenticated using (public.is_admin());

create policy "faqs_public_read" on public.faqs for select to anon, authenticated using (status = 'published' or public.can_edit());
create policy "faqs_editor_insert" on public.faqs for insert to authenticated with check (public.can_edit());
create policy "faqs_editor_update" on public.faqs for update to authenticated using (public.can_edit()) with check (public.can_edit());
create policy "faqs_admin_delete" on public.faqs for delete to authenticated using (public.is_admin());

create policy "guides_public_read" on public.guides for select to anon, authenticated using (status = 'published' or public.can_edit());
create policy "guides_editor_insert" on public.guides for insert to authenticated with check (public.can_edit());
create policy "guides_editor_update" on public.guides for update to authenticated using (public.can_edit()) with check (public.can_edit());
create policy "guides_admin_delete" on public.guides for delete to authenticated using (public.is_admin());

create policy "settings_public_read" on public.site_settings for select to anon, authenticated using (true);
create policy "settings_admin_insert" on public.site_settings for insert to authenticated with check (public.is_admin());
create policy "settings_admin_update" on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "redirects_public_read" on public.legacy_redirects for select to anon, authenticated using (true);
create policy "redirects_admin_all" on public.legacy_redirects for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "media_public_read" on public.media_assets for select to anon, authenticated using (status = 'published' or public.can_edit());
create policy "media_editor_insert" on public.media_assets for insert to authenticated with check (public.can_edit());
create policy "media_editor_update" on public.media_assets for update to authenticated using (public.can_edit()) with check (public.can_edit());
create policy "media_admin_delete" on public.media_assets for delete to authenticated using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cultural-media', 'cultural-media', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "published_media_objects_read" on storage.objects for select to anon, authenticated using (
  bucket_id = 'cultural-media' and exists (
    select 1 from public.media_assets m where m.object_path = name and (m.status = 'published' or public.can_edit())
  )
);
create policy "authorized_media_objects_insert" on storage.objects for insert to authenticated with check (bucket_id = 'cultural-media' and public.can_edit());
create policy "authorized_media_objects_update" on storage.objects for update to authenticated using (bucket_id = 'cultural-media' and public.can_edit()) with check (bucket_id = 'cultural-media' and public.can_edit());
create policy "admin_media_objects_delete" on storage.objects for delete to authenticated using (bucket_id = 'cultural-media' and public.is_admin());

commit;
