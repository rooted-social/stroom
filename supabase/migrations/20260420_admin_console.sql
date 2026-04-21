begin;

alter table public.profiles
  add column if not exists role text not null default 'member' check (role in ('member', 'admin')),
  add column if not exists account_status text not null default 'active' check (account_status in ('active', 'inactive', 'suspended')),
  add column if not exists last_login_at timestamptz;

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_account_status_created_at
  on public.profiles(account_status, created_at desc);

create or replace function public.prevent_non_admin_profile_privileged_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  ) then
    if new.role is distinct from old.role
       or new.account_status is distinct from old.account_status then
      raise exception '권한이 없는 프로필 필드 변경입니다.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_non_admin_profile_privileged_update on public.profiles;
create trigger trg_prevent_non_admin_profile_privileged_update
before update on public.profiles
for each row execute function public.prevent_non_admin_profile_privileged_update();

alter table public.user_plan_access
  add column if not exists plan_tier text not null default 'starter' check (plan_tier in ('starter', 'pro', 'enterprise')),
  add column if not exists started_at timestamptz not null default timezone('utc', now()),
  add column if not exists expires_at timestamptz;

create index if not exists idx_user_plan_access_plan_tier on public.user_plan_access(plan_tier);
create index if not exists idx_user_plan_access_expires_at on public.user_plan_access(expires_at);
create index if not exists idx_user_plan_access_status_expires_at
  on public.user_plan_access(status, expires_at);

update public.user_plan_access
set plan_tier = case
  when plan_code = 'active' then 'pro'
  else 'starter'
end
where plan_tier is null;

alter table public.contact_inquiries
  add column if not exists title text not null default '일반 문의',
  add column if not exists status text not null default 'pending' check (status in ('pending', 'in_progress', 'done')),
  add column if not exists admin_memo text,
  add column if not exists handled_by uuid references public.profiles(id) on delete set null,
  add column if not exists handled_at timestamptz,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.contact_inquiries
set title = case
  when array_length(inquiry_topics, 1) >= 1 then '[문의] ' || inquiry_topics[1]
  else '일반 문의'
end
where title is null or title = '일반 문의';

drop trigger if exists set_contact_inquiries_updated_at on public.contact_inquiries;
create trigger set_contact_inquiries_updated_at
before update on public.contact_inquiries
for each row execute function public.set_updated_at();

create index if not exists idx_contact_inquiries_status_created_at
  on public.contact_inquiries(status, created_at desc);
create index if not exists idx_contact_inquiries_user_created_at
  on public.contact_inquiries(user_id, created_at desc);

drop function if exists public.is_admin_user(uuid);
create or replace function public.is_admin_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = p_user_id
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin_user(uuid) from public;
grant execute on function public.is_admin_user(uuid) to authenticated;

drop policy if exists "profiles_select_admin_all" on public.profiles;
create policy "profiles_select_admin_all"
on public.profiles
for select
to authenticated
using (public.is_admin_user(auth.uid()));

drop policy if exists "profiles_update_admin_all" on public.profiles;
create policy "profiles_update_admin_all"
on public.profiles
for update
to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "user_plan_access_select_admin_all" on public.user_plan_access;
create policy "user_plan_access_select_admin_all"
on public.user_plan_access
for select
to authenticated
using (public.is_admin_user(auth.uid()));

drop policy if exists "user_plan_access_update_admin_all" on public.user_plan_access;
create policy "user_plan_access_update_admin_all"
on public.user_plan_access
for update
to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "contact_inquiries_select_admin_all" on public.contact_inquiries;
create policy "contact_inquiries_select_admin_all"
on public.contact_inquiries
for select
to authenticated
using (public.is_admin_user(auth.uid()));

drop policy if exists "contact_inquiries_update_admin_all" on public.contact_inquiries;
create policy "contact_inquiries_update_admin_all"
on public.contact_inquiries
for update
to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "contact_inquiries_select_own" on public.contact_inquiries;
create policy "contact_inquiries_select_own"
on public.contact_inquiries
for select
to authenticated
using (auth.uid() = user_id);

commit;
