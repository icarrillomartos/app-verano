-- =====================================================================
--  SOMos los que veranean — setup de la base de datos
--  Pega TODO este archivo en Supabase → SQL Editor → Run.
--  Crea tablas, seguridad (RLS), buckets de fotos y tu grupo.
--  Después: desactiva "Confirm email" en Auth, crea el admin con
--  scripts/admin-util.mjs y (opcional) carga planes con apply-plans.mjs.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---- Tablas ----
create table if not exists groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  city        text,
  created_at  timestamptz not null default now()
);

create table if not exists members (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid references groups(id) on delete cascade,
  name        text not null,
  initials    text not null,
  color       text not null,            -- hex; el avatar es un círculo con iniciales
  photo_url   text,
  is_admin    boolean not null default false,
  auth_id     uuid,                     -- enlaza con auth.users
  created_at  timestamptz not null default now()
);

create table if not exists plans (
  id            uuid primary key default gen_random_uuid(),
  group_id      uuid references groups(id) on delete cascade,
  title         text not null,
  category      text not null,
  stream        text,
  is_atemporal  boolean not null default false,
  date_text     text,
  date_long     text,
  date_start    date,
  date_end      date,
  price         numeric not null default 0,
  price_note    text,
  location      text,
  duration      text,
  description   text,
  source_name   text,
  source_url    text,
  image_url     text,
  is_flash      boolean not null default false,
  expires_at    date,
  status        text not null default 'pending',  -- pending|published|discarded|archived
  proposed_by   uuid references members(id) on delete set null,
  created_at    timestamptz not null default now()
);

create table if not exists attendance (
  plan_id     uuid references plans(id) on delete cascade,
  member_id   uuid references members(id) on delete cascade,
  joined_at   timestamptz not null default now(),
  primary key (plan_id, member_id)
);

create index if not exists plans_group_status_idx on plans (group_id, status);
create index if not exists attendance_plan_idx on attendance (plan_id);

-- ---- Seguridad (RLS) ----
alter table groups     enable row level security;
alter table members    enable row level security;
alter table plans      enable row level security;
alter table attendance enable row level security;

drop policy if exists "read groups" on groups;
create policy "read groups" on groups for select using (true);

drop policy if exists "read members" on members;
drop policy if exists "insert own member" on members;
drop policy if exists "update own member" on members;
create policy "read members"  on members for select using (true);
create policy "insert own member" on members for insert to authenticated with check (auth_id = auth.uid());
create policy "update own member" on members for update to authenticated using (auth_id = auth.uid()) with check (auth_id = auth.uid());

drop policy if exists "read plans" on plans;
drop policy if exists "propose plans" on plans;
drop policy if exists "admin manage plans" on plans;
create policy "read plans" on plans for select using (true);
create policy "propose plans" on plans for insert to authenticated
  with check (status = 'pending' and proposed_by in (select id from members where auth_id = auth.uid()));
create policy "admin manage plans" on plans for update to authenticated
  using (exists (select 1 from members m where m.auth_id = auth.uid() and m.is_admin))
  with check (true);

drop policy if exists "read attendance" on attendance;
drop policy if exists "join own" on attendance;
drop policy if exists "leave own" on attendance;
create policy "read attendance" on attendance for select using (true);
create policy "join own"  on attendance for insert to authenticated
  with check (member_id in (select id from members where auth_id = auth.uid()));
create policy "leave own" on attendance for delete to authenticated
  using (member_id in (select id from members where auth_id = auth.uid()));

-- ---- Storage: bucket público para las fotos de los planes ----
insert into storage.buckets (id, name, public) values ('plan-photos', 'plan-photos', true)
  on conflict (id) do update set public = true;
drop policy if exists "public read plan-photos" on storage.objects;
drop policy if exists "anon upload plan-photos" on storage.objects;
create policy "public read plan-photos" on storage.objects for select using (bucket_id = 'plan-photos');
create policy "anon upload plan-photos" on storage.objects for insert with check (bucket_id = 'plan-photos');

-- ---- Tu grupo (con id fijo que usa la app: lib/supabase.ts GROUP_ID) ----
insert into groups (id, name, city)
values ('00000000-0000-0000-0000-0000000000aa', 'SOMos los que veranean', 'Madrid')
on conflict (id) do update set name = excluded.name;
