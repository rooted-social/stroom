begin;

alter table public.trades
  add column if not exists reasons_entry text,
  add column if not exists reasons_exit text,
  add column if not exists scenario_checklist text,
  add column if not exists memo_additional text;

update public.trades
set
  reasons_entry = coalesce(reasons_entry, nullif(btrim(scenario), ''))
where true;

update public.trades
set
  reasons_exit = coalesce(
    reasons_exit,
    nullif((regexp_match(checklist, '(?m)^탈출 근거:\s*(.*)$'))[1], ''),
    nullif(btrim(checklist), '')
  ),
  scenario_checklist = coalesce(
    scenario_checklist,
    nullif((regexp_match(checklist, '(?m)^체크리스트:\s*(.*)$'))[1], '')
  ),
  memo_additional = coalesce(
    memo_additional,
    nullif((regexp_match(checklist, '(?m)^추가 메모:\s*(.*)$'))[1], '')
  )
where checklist is not null;

commit;
