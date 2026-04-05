begin;

alter table public.user_journal_settings
  add column if not exists major_symbols text[] not null default '{}',
  add column if not exists scenario_checklists text[] not null default '{}';

commit;
