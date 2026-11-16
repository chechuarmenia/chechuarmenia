-- Run once in the Supabase SQL editor before enabling cloud sync.
begin;
alter table public.dashboard_data enable row level security;
drop policy if exists chechu_owner_guard on public.dashboard_data;
create policy chechu_owner_guard on public.dashboard_data as restrictive
for all to public using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists chechu_owner_access on public.dashboard_data;
create policy chechu_owner_access on public.dashboard_data
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
revoke all on public.dashboard_data from anon;
grant select, insert, update on public.dashboard_data to authenticated;

create or replace function public.save_dashboard_checked(payload jsonb, expected_updated_at timestamptz)
returns timestamptz language plpgsql security invoker set search_path = '' as $$
declare saved timestamptz;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if payload->>'format' is distinct from 'chechu-sync-v1' or jsonb_typeof(payload->'storage') is distinct from 'object'
 then raise exception 'Invalid dashboard payload'; end if;
 if expected_updated_at is null then
   insert into public.dashboard_data(user_id,data,updated_at)
   values(auth.uid(),payload,clock_timestamp()) on conflict(user_id) do nothing
   returning updated_at into saved;
 else
   update public.dashboard_data set data=payload,updated_at=clock_timestamp()
   where user_id=auth.uid() and updated_at=expected_updated_at returning updated_at into saved;
 end if;
 return saved;
end $$;
revoke all on function public.save_dashboard_checked(jsonb,timestamptz) from public, anon;
grant execute on function public.save_dashboard_checked(jsonb,timestamptz) to authenticated;
commit;

