create or replace function public.nearby_loads(
  p_lat double precision,
  p_lng double precision,
  p_from_province smallint default null,
  p_to_province smallint default null,
  p_vehicle_type text default null,
  p_date_from date default null,
  p_date_to date default null,
  p_min_tons numeric default null,
  p_max_tons numeric default null,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id uuid,
  source text,
  source_group text,
  from_province_code smallint,
  from_province text,
  from_district text,
  to_province_code smallint,
  to_province text,
  to_district text,
  cargo_type text,
  weight_tons numeric,
  vehicle_type text,
  load_date date,
  price numeric,
  currency text,
  description text,
  status text,
  created_at timestamptz,
  expires_at timestamptz,
  distance_km double precision,
  total_count bigint
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_origin extensions.geography;
  v_limit integer := least(greatest(coalesce(p_limit, 20), 1), 50);
  v_offset integer := least(greatest(coalesce(p_offset, 0), 0), 10000);
begin
  if p_lat is null or p_lng is null or p_lat not between -90 and 90 or p_lng not between -180 and 180 then
    raise exception 'Geçersiz konum' using errcode = '22023';
  end if;

  v_origin := extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography;

  return query
  select
    l.id,
    l.source,
    l.source_group,
    l.from_province_code,
    l.from_province,
    l.from_district,
    l.to_province_code,
    l.to_province,
    l.to_district,
    l.cargo_type,
    l.weight_tons,
    l.vehicle_type,
    l.load_date,
    l.price,
    l.currency,
    l.description,
    l.status,
    l.created_at,
    l.expires_at,
    round((extensions.st_distance(l.pickup_point, v_origin) / 1000.0)::numeric, 1)::double precision,
    count(*) over ()
  from public.loads l
  where l.status = 'active'
    and l.expires_at > now()
    and (p_from_province is null or l.from_province_code = p_from_province)
    and (p_to_province is null or l.to_province_code = p_to_province)
    and (
      p_vehicle_type is null
      or p_vehicle_type = 'farketmez'
      or l.vehicle_type in (p_vehicle_type, 'farketmez')
    )
    and (p_date_from is null or l.load_date >= p_date_from)
    and (p_date_to is null or l.load_date <= p_date_to)
    and (p_min_tons is null or l.weight_tons >= p_min_tons)
    and (p_max_tons is null or l.weight_tons <= p_max_tons)
  order by
    extensions.st_distance(l.pickup_point, v_origin) asc nulls last,
    l.created_at desc,
    l.id desc
  limit v_limit
  offset v_offset;
end;
$$;

revoke all on function public.nearby_loads(
  double precision, double precision, smallint, smallint, text, date, date, numeric, numeric, integer, integer
) from public;

grant execute on function public.nearby_loads(
  double precision, double precision, smallint, smallint, text, date, date, numeric, numeric, integer, integer
) to anon, authenticated, service_role;
