alter table public.profiles enable row level security;
alter table public.loads enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, full_name, role, vehicle_type, plate) on public.profiles to authenticated;
grant update (full_name, role, vehicle_type, plate) on public.profiles to authenticated;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()));

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

revoke all on public.loads from anon, authenticated;

grant select (
  id, source, source_group,
  from_province_code, from_province, from_district,
  to_province_code, to_province, to_district,
  pickup_point, delivery_point,
  cargo_type, weight_tons, vehicle_type, load_date,
  price, currency, description, status,
  created_at, updated_at, expires_at
) on public.loads to anon;

grant select on public.loads to authenticated;

grant insert (
  owner_id,
  from_province_code, from_province, from_district,
  to_province_code, to_province, to_district,
  pickup_point, delivery_point,
  cargo_type, weight_tons, vehicle_type, load_date,
  price, description, contact_phone
) on public.loads to authenticated;

grant update (
  from_province_code, from_province, from_district,
  to_province_code, to_province, to_district,
  pickup_point, delivery_point,
  cargo_type, weight_tons, vehicle_type, load_date,
  price, description, contact_phone, status
) on public.loads to authenticated;

grant delete on public.loads to authenticated;

create policy "loads_select_active_public"
on public.loads for select
to anon, authenticated
using (status = 'active' and expires_at > now());

create policy "loads_select_own"
on public.loads for select
to authenticated
using (owner_id = (select auth.uid()));

create policy "loads_insert_own"
on public.loads for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and source = 'user'
  and status = 'active'
);

create policy "loads_update_own"
on public.loads for update
to authenticated
using (owner_id = (select auth.uid()) and source = 'user' and status <> 'removed')
with check (owner_id = (select auth.uid()) and source = 'user' and status in ('active', 'found'));

create policy "loads_delete_own"
on public.loads for delete
to authenticated
using (owner_id = (select auth.uid()) and source = 'user');

grant all on public.profiles to service_role;
grant all on public.loads to service_role;
