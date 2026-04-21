begin;

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

commit;
