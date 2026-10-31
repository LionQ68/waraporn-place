create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'staff' check (role in ('owner', 'admin', 'staff')),
  is_active boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.rooms (
  id text primary key default gen_random_uuid()::text,
  room_number text not null unique,
  floor integer not null default 1,
  status text not null default 'vacant' check (status in ('vacant', 'occupied', 'booked', 'maintenance')),
  room_type text,
  max_occupants integer not null default 2 check (max_occupants > 0),
  rent_price numeric(12, 2) not null default 0 check (rent_price >= 0),
  image_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.tenants (
  id text primary key default gen_random_uuid()::text,
  room_id text references public.rooms(id) on delete set null,
  name text not null,
  phone text,
  is_active boolean not null default true,
  move_in_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.bookings (
  id text primary key default gen_random_uuid()::text,
  room_id text references public.rooms(id) on delete set null,
  room_number text,
  guest_name text not null,
  guest_phone text,
  notes text,
  status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.invoices (
  id text primary key default gen_random_uuid()::text,
  room_id text,
  billing_month text not null,
  rent_amount numeric(12, 2) not null default 0,
  water_amount numeric(12, 2) not null default 0,
  occupant_count integer not null default 0,
  electricity_start numeric(12, 2) not null default 0,
  electricity_end numeric(12, 2) not null default 0,
  electricity_units numeric(12, 2) not null default 0,
  electricity_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  status text not null default 'pending',
  room_number text,
  metadata jsonb not null default '{}'::jsonb,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists tenants_room_id_idx on public.tenants(room_id);
create index if not exists tenants_is_active_idx on public.tenants(is_active);
create index if not exists bookings_room_id_idx on public.bookings(room_id);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists invoices_room_id_idx on public.invoices(room_id);
create index if not exists invoices_billing_month_idx on public.invoices(billing_month);

create or replace function private.is_active_staff()
returns boolean language sql security definer set search_path = '' stable
as $$
  select exists (select 1 from public.profiles where user_id = (select auth.uid()) and is_active = true);
$$;

create or replace function private.is_owner()
returns boolean language sql security definer set search_path = '' stable
as $$
  select exists (select 1 from public.profiles where user_id = (select auth.uid()) and role = 'owner' and is_active = true);
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare is_first_user boolean;
begin
  select not exists(select 1 from public.profiles) into is_first_user;
  insert into public.profiles (user_id, full_name, role, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case when is_first_user then 'owner' else 'staff' end,
    is_first_user
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.tenants enable row level security;
alter table public.bookings enable row level security;
alter table public.invoices enable row level security;

revoke all on table public.profiles, public.rooms, public.tenants, public.bookings, public.invoices from anon, authenticated;
grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.rooms, public.tenants, public.bookings, public.invoices to authenticated;

revoke all on function private.is_active_staff() from public;
revoke all on function private.is_owner() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_active_staff() to authenticated;
grant execute on function private.is_owner() to authenticated;

drop policy if exists "Users can read own profile or owners can read all" on public.profiles;
create policy "Users can read own profile or owners can read all" on public.profiles
for select to authenticated using (user_id = (select auth.uid()) or (select private.is_owner()));
drop policy if exists "Owners can update profiles" on public.profiles;
create policy "Owners can update profiles" on public.profiles
for update to authenticated using ((select private.is_owner())) with check ((select private.is_owner()));

drop policy if exists "Active staff can read rooms" on public.rooms;
create policy "Active staff can read rooms" on public.rooms for select to authenticated using ((select private.is_active_staff()));
drop policy if exists "Active staff can insert rooms" on public.rooms;
create policy "Active staff can insert rooms" on public.rooms for insert to authenticated with check ((select private.is_active_staff()));
drop policy if exists "Active staff can update rooms" on public.rooms;
create policy "Active staff can update rooms" on public.rooms for update to authenticated using ((select private.is_active_staff())) with check ((select private.is_active_staff()));
drop policy if exists "Active staff can delete rooms" on public.rooms;
create policy "Active staff can delete rooms" on public.rooms for delete to authenticated using ((select private.is_active_staff()));

drop policy if exists "Active staff can read tenants" on public.tenants;
create policy "Active staff can read tenants" on public.tenants for select to authenticated using ((select private.is_active_staff()));
drop policy if exists "Active staff can insert tenants" on public.tenants;
create policy "Active staff can insert tenants" on public.tenants for insert to authenticated with check ((select private.is_active_staff()));
drop policy if exists "Active staff can update tenants" on public.tenants;
create policy "Active staff can update tenants" on public.tenants for update to authenticated using ((select private.is_active_staff())) with check ((select private.is_active_staff()));
drop policy if exists "Active staff can delete tenants" on public.tenants;
create policy "Active staff can delete tenants" on public.tenants for delete to authenticated using ((select private.is_active_staff()));

drop policy if exists "Active staff can read bookings" on public.bookings;
create policy "Active staff can read bookings" on public.bookings for select to authenticated using ((select private.is_active_staff()));
drop policy if exists "Active staff can insert bookings" on public.bookings;
create policy "Active staff can insert bookings" on public.bookings for insert to authenticated with check ((select private.is_active_staff()));
drop policy if exists "Active staff can update bookings" on public.bookings;
create policy "Active staff can update bookings" on public.bookings for update to authenticated using ((select private.is_active_staff())) with check ((select private.is_active_staff()));
drop policy if exists "Active staff can delete bookings" on public.bookings;
create policy "Active staff can delete bookings" on public.bookings for delete to authenticated using ((select private.is_active_staff()));

drop policy if exists "Active staff can read invoices" on public.invoices;
create policy "Active staff can read invoices" on public.invoices for select to authenticated using ((select private.is_active_staff()));
drop policy if exists "Active staff can insert invoices" on public.invoices;
create policy "Active staff can insert invoices" on public.invoices for insert to authenticated with check ((select private.is_active_staff()));
drop policy if exists "Active staff can update invoices" on public.invoices;
create policy "Active staff can update invoices" on public.invoices for update to authenticated using ((select private.is_active_staff())) with check ((select private.is_active_staff()));
drop policy if exists "Active staff can delete invoices" on public.invoices;
create policy "Active staff can delete invoices" on public.invoices for delete to authenticated using ((select private.is_active_staff()));

insert into storage.buckets (id, name, public)
values ('room-images', 'room-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Room images are publicly readable" on storage.objects;
create policy "Room images are publicly readable" on storage.objects
for select to public using (bucket_id = 'room-images');
drop policy if exists "Active staff can upload room images" on storage.objects;
create policy "Active staff can upload room images" on storage.objects
for insert to authenticated with check (bucket_id = 'room-images' and (select private.is_active_staff()));
drop policy if exists "Active staff can update room images" on storage.objects;
create policy "Active staff can update room images" on storage.objects
for update to authenticated using (bucket_id = 'room-images' and (select private.is_active_staff()))
with check (bucket_id = 'room-images' and (select private.is_active_staff()));
drop policy if exists "Active staff can delete room images" on storage.objects;
create policy "Active staff can delete room images" on storage.objects
for delete to authenticated using (bucket_id = 'room-images' and (select private.is_active_staff()));
