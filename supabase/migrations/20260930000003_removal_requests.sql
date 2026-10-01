create table public.removal_requests (
  id uuid primary key default gen_random_uuid(),
  load_id uuid references public.loads (id) on delete set null,
  requester_id uuid references auth.users (id) on delete set null default auth.uid(),
  full_name text not null check (char_length(btrim(full_name)) between 3 and 80),
  phone text not null check (phone ~ '^\+90[2-5][0-9]{9}$'),
  reason text not null check (char_length(btrim(reason)) between 10 and 1000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index removal_requests_status_idx on public.removal_requests (status, created_at desc);
create index removal_requests_load_idx on public.removal_requests (load_id);
create unique index removal_requests_pending_uidx on public.removal_requests (load_id, phone)
  where status = 'pending';

alter table public.removal_requests enable row level security;

revoke all on public.removal_requests from anon, authenticated;
grant insert (load_id, full_name, phone, reason) on public.removal_requests to anon, authenticated;
grant select on public.removal_requests to authenticated;
grant all on public.removal_requests to service_role;

create policy "removal_requests_insert_public"
on public.removal_requests for insert
to anon, authenticated
with check (
  status = 'pending'
  and (requester_id is null or requester_id = (select auth.uid()))
  and load_id is not null
);

create policy "removal_requests_select_own"
on public.removal_requests for select
to authenticated
using (requester_id = (select auth.uid()));

create or replace function public.resolve_removal_request(request_id uuid, approve boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_load uuid;
begin
  update public.removal_requests
  set status = case when approve then 'approved' else 'rejected' end,
      resolved_at = now()
  where id = request_id and status = 'pending'
  returning load_id into target_load;

  if not found then
    raise exception 'Talep bulunamadı veya zaten sonuçlandırılmış';
  end if;

  if approve and target_load is not null then
    update public.loads set status = 'removed' where id = target_load;
  end if;
end;
$$;

revoke all on function public.resolve_removal_request(uuid, boolean) from public, anon, authenticated;
grant execute on function public.resolve_removal_request(uuid, boolean) to service_role;
