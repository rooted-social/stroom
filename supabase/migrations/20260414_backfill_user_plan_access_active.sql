begin;

insert into public.user_plan_access (user_id, plan_code, status, source)
select
  users.id as user_id,
  'active' as plan_code,
  'active' as status,
  'backfill_20260414' as source
from auth.users as users
on conflict (user_id) do update
set
  plan_code = excluded.plan_code,
  status = excluded.status,
  source = excluded.source,
  updated_at = timezone('utc', now());

commit;
