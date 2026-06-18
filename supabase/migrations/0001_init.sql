-- Schema for VrataServis (servisní systém pro vrata, brány a závory).
-- Not yet wired into the app — the frontend currently runs against
-- localStorage (see src/lib/localTable.ts). This migration is the target
-- shape for when src/data/repository.ts is swapped to a Supabase client.
-- Run against a fresh Supabase project, then create users via Supabase
-- Auth and insert a matching row into public.users with the same id.

create type role as enum ('admin', 'technik', 'recepce');
create type customer_type as enum ('firma', 'osoba');
create type device_type as enum ('vrata', 'brana', 'zavora', 'pohon', 'jine');
create type order_type as enum ('oprava', 'servis', 'instalace', 'revize');
create type order_status as enum (
  'nova', 'naplanovana', 'probiha', 'ceka_na_dily', 'hotovo', 'fakturovano', 'zrusena'
);
create type order_priority as enum ('nizka', 'normalni', 'vysoka', 'havarie');

-- Profile row for each Supabase Auth user, carrying the app role.
create table users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  role role not null default 'technik',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  type customer_type not null,
  name text not null,
  ico text,
  dic text,
  street text not null,
  city text not null,
  zip text not null,
  phone text not null,
  email text,
  note text,
  created_at timestamptz not null default now()
);

create table devices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  type device_type not null,
  manufacturer text not null,
  model text not null,
  serial_number text,
  install_date date,
  warranty_until date,
  location text,
  note text,
  created_at timestamptz not null default now()
);

create table service_orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  customer_id uuid not null references customers (id) on delete restrict,
  device_id uuid references devices (id) on delete set null,
  type order_type not null,
  status order_status not null default 'nova',
  priority order_priority not null default 'normalni',
  description text not null,
  assigned_technician_id uuid references users (id) on delete set null,
  scheduled_at timestamptz,
  completed_at timestamptz,
  labor_price numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid not null references users (id)
);

create table order_parts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references service_orders (id) on delete cascade,
  name text not null,
  qty integer not null check (qty > 0),
  unit_price numeric(10, 2) not null default 0
);

create table order_notes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references service_orders (id) on delete cascade,
  author_id uuid not null references users (id),
  text text not null,
  created_at timestamptz not null default now()
);

create index on devices (customer_id);
create index on service_orders (customer_id);
create index on service_orders (assigned_technician_id);
create index on service_orders (status);
create index on order_parts (order_id);
create index on order_notes (order_id);

-- Row Level Security: any authenticated staff member can read everything;
-- writes follow the same admin/recepce/technik rules as the frontend
-- (src/lib/permissions.ts). Adjust to taste once real auth is wired up.

alter table users enable row level security;
alter table customers enable row level security;
alter table devices enable row level security;
alter table service_orders enable row level security;
alter table order_parts enable row level security;
alter table order_notes enable row level security;

create function current_role_name() returns role
  language sql stable security definer as $$
    select role from users where id = auth.uid()
  $$;

create policy "staff can read users" on users for select to authenticated using (true);
create policy "admin manages users" on users for all to authenticated
  using (current_role_name() = 'admin');

create policy "staff can read customers" on customers for select to authenticated using (true);
create policy "admin and recepce manage customers" on customers for all to authenticated
  using (current_role_name() in ('admin', 'recepce'));

create policy "staff can read devices" on devices for select to authenticated using (true);
create policy "admin and recepce manage devices" on devices for all to authenticated
  using (current_role_name() in ('admin', 'recepce'));

create policy "staff can read orders" on service_orders for select to authenticated using (true);
create policy "admin and recepce manage orders" on service_orders for all to authenticated
  using (current_role_name() in ('admin', 'recepce'));
create policy "technik updates own orders" on service_orders for update to authenticated
  using (current_role_name() = 'technik' and assigned_technician_id = auth.uid());

create policy "staff can read order parts" on order_parts for select to authenticated using (true);
create policy "staff manage order parts" on order_parts for all to authenticated
  using (
    current_role_name() in ('admin', 'recepce')
    or exists (
      select 1 from service_orders
      where service_orders.id = order_parts.order_id
        and service_orders.assigned_technician_id = auth.uid()
    )
  );

create policy "staff can read order notes" on order_notes for select to authenticated using (true);
create policy "staff add order notes" on order_notes for insert to authenticated
  with check (true);
