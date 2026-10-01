create extension if not exists postgis with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 3 and 80),
  role text not null check (role in ('shipper', 'carrier', 'both')),
  vehicle_type text check (
    vehicle_type is null
    or vehicle_type in ('tir', 'kirkayak', 'kamyon', 'kamyonet', 'panelvan', 'frigorifik', 'lowbed', 'diger')
  ),
  plate text check (plate is null or plate ~ '^(0[1-9]|[1-7][0-9]|8[01]) ?[A-Z]{1,3} ?[0-9]{2,4}$'),
  phone text,
  kvkk_accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_vehicle_required check (role = 'shipper' or vehicle_type is not null)
);

create or replace function public.set_profile_phone()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select u.phone into new.phone from auth.users u where u.id = new.id;
  return new;
end;
$$;

create trigger profiles_set_phone
before insert on public.profiles
for each row execute function public.set_profile_phone();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table public.loads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete cascade,
  source text not null default 'user' check (source in ('user', 'whatsapp')),
  source_group text,
  source_message_id text,
  from_province_code smallint not null check (from_province_code between 1 and 81),
  from_province text not null,
  from_district text,
  to_province_code smallint not null check (to_province_code between 1 and 81),
  to_province text not null,
  to_district text,
  pickup_point extensions.geography(Point, 4326),
  delivery_point extensions.geography(Point, 4326),
  cargo_type text not null check (char_length(btrim(cargo_type)) between 2 and 60),
  weight_tons numeric(7, 2) not null check (weight_tons > 0 and weight_tons < 1000),
  vehicle_type text not null check (
    vehicle_type in ('tir', 'kirkayak', 'kamyon', 'kamyonet', 'panelvan', 'frigorifik', 'lowbed', 'diger', 'farketmez')
  ),
  load_date date not null,
  price numeric(12, 2) check (price is null or price >= 0),
  currency text not null default 'TRY' check (currency in ('TRY', 'USD', 'EUR')),
  description text check (description is null or char_length(description) <= 1000),
  contact_phone text not null check (contact_phone ~ '^\+90[2-5][0-9]{9}$'),
  status text not null default 'active' check (status in ('active', 'found', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint loads_user_source_owner check (source <> 'user' or owner_id is not null),
  constraint loads_user_source_no_group check (source <> 'user' or (source_group is null and source_message_id is null)),
  constraint loads_whatsapp_group check (source <> 'whatsapp' or source_group is not null)
);

create or replace function public.set_load_expiry()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.expires_at is null then
      new.expires_at := greatest(now() + interval '10 days', (new.load_date + 2)::timestamptz);
    end if;
  elsif new.load_date is distinct from old.load_date
    or (new.status = 'active' and (old.status <> 'active' or old.expires_at <= now())) then
    new.expires_at := greatest(now() + interval '10 days', (new.load_date + 2)::timestamptz);
  end if;
  return new;
end;
$$;

create trigger loads_set_expiry
before insert or update on public.loads
for each row execute function public.set_load_expiry();

create trigger loads_set_updated_at
before update on public.loads
for each row execute function public.set_updated_at();

create index loads_active_created_idx on public.loads (created_at desc) where status = 'active';
create index loads_status_expires_idx on public.loads (status, expires_at);
create index loads_from_province_idx on public.loads (from_province_code, created_at desc);
create index loads_to_province_idx on public.loads (to_province_code, created_at desc);
create index loads_vehicle_type_idx on public.loads (vehicle_type);
create index loads_load_date_idx on public.loads (load_date);
create index loads_weight_idx on public.loads (weight_tons);
create index loads_owner_idx on public.loads (owner_id, created_at desc);
create index loads_pickup_point_idx on public.loads using gist (pickup_point);
create index loads_delivery_point_idx on public.loads using gist (delivery_point);
create unique index loads_whatsapp_message_uidx on public.loads (source_group, source_message_id)
  where source = 'whatsapp' and source_message_id is not null;
