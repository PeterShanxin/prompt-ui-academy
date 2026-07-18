create schema if not exists private;

create sequence private.pioneer_number_seq;

create table public.learner_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  pioneer_number bigint not null unique default nextval('private.pioneer_number_seq'),
  created_at timestamptz not null default now()
);

create table public.progress_items (
  user_id uuid not null references public.learner_profiles (user_id) on delete cascade,
  kind text not null check (kind in ('lesson', 'term', 'quiz', 'lab')),
  item_id text not null check (
    length(item_id) between 1 and 80
    and (
      (kind = 'lesson' and item_id in (
        'ui-components-patterns-structure',
        'ui-navigation-inputs',
        'ui-overlays-feedback',
        'motion-enter-exit',
        'motion-duration-easing',
        'motion-spring-stagger',
        'prompt-five-part',
        'prompt-vague-to-precise',
        'prompt-quiz-review'
      ))
      or (kind = 'term' and item_id in (
        'button', 'modal', 'toast', 'tooltip', 'tabs', 'accordion', 'toggle', 'skeleton'
      ))
      or (kind = 'quiz' and item_id = 'ui-vocabulary-v1')
      or (kind = 'lab' and item_id = 'prompt-lab-v1')
    )
  ),
  completed boolean not null default false,
  best_score integer check (
    (kind = 'quiz' and best_score between 0 and 4)
    or (kind <> 'quiz' and best_score is null)
  ),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind, item_id)
);

create table public.learner_state (
  user_id uuid primary key references public.learner_profiles (user_id) on delete cascade,
  last_route text check (last_route in ('/learn', '/dictionary', '/motion', '/quiz', '/lab')),
  last_activity_at timestamptz,
  schema_version integer not null default 2 check (schema_version = 2),
  updated_at timestamptz not null default now()
);

create table private.community_metrics (
  key text primary key,
  cumulative_verified_accounts bigint not null default 0 check (cumulative_verified_accounts >= 0),
  band_key text not null default 'founding' check (
    band_key in ('founding', 'early', 'hundred', 'thousand', 'ten_thousand', 'hundred_thousand')
  ),
  updated_at timestamptz not null default now()
);

insert into private.community_metrics (key) values ('learner_milestone');

create or replace function private.community_band(account_count bigint)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when account_count >= 100000 then 'hundred_thousand'
    when account_count >= 10000 then 'ten_thousand'
    when account_count >= 1000 then 'thousand'
    when account_count >= 100 then 'hundred'
    when account_count >= 25 then 'early'
    else 'founding'
  end;
$$;

create or replace function private.stamp_progress_item()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' and new.completed then
    new.completed_at := now();
  elsif tg_op = 'UPDATE' and new.completed and not old.completed then
    new.completed_at := now();
  elsif not new.completed then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

create trigger stamp_progress_item
before insert or update on public.progress_items
for each row execute function private.stamp_progress_item();

create or replace function private.stamp_learner_state()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger stamp_learner_state
before insert or update on public.learner_state
for each row execute function private.stamp_learner_state();

alter table public.learner_profiles enable row level security;
alter table public.progress_items enable row level security;
alter table public.learner_state enable row level security;
alter table private.community_metrics enable row level security;

create policy learner_profiles_select_own
on public.learner_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy progress_items_select_own
on public.progress_items
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy progress_items_insert_own
on public.progress_items
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy progress_items_update_own
on public.progress_items
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy progress_items_delete_own
on public.progress_items
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy learner_state_select_own
on public.learner_state
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy learner_state_insert_own
on public.learner_state
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy learner_state_update_own
on public.learner_state
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy learner_state_delete_own
on public.learner_state
for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.ensure_learner_profile()
returns public.learner_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  profile public.learner_profiles;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'Permanent account required' using errcode = '42501';
  end if;

  insert into public.learner_profiles (user_id)
  values (current_user_id)
  on conflict (user_id) do nothing
  returning * into profile;

  if profile.user_id is not null then
    update private.community_metrics
    set
      cumulative_verified_accounts = cumulative_verified_accounts + 1,
      band_key = private.community_band(cumulative_verified_accounts + 1),
      updated_at = now()
    where key = 'learner_milestone';
  else
    select * into profile
    from public.learner_profiles
    where user_id = current_user_id;
  end if;

  return profile;
end;
$$;

create or replace function public.merge_guest_progress(payload jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  item jsonb;
  item_kind text;
  progress_id text;
  item_completed boolean;
  item_best_score integer;
  route text;
  activity_at timestamptz;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if jsonb_typeof(payload) <> 'object' or pg_column_size(payload) > 32768 then
    raise exception 'Invalid progress payload' using errcode = '22023';
  end if;
  if jsonb_typeof(payload -> 'items') <> 'array'
    or jsonb_array_length(payload -> 'items') > 64 then
    raise exception 'Invalid progress items' using errcode = '22023';
  end if;

  perform public.ensure_learner_profile();

  for item in select value from jsonb_array_elements(payload -> 'items') loop
    item_kind := item ->> 'kind';
    progress_id := item ->> 'itemId';
    if jsonb_typeof(item -> 'completed') <> 'boolean' then
      raise exception 'Invalid completion value' using errcode = '22023';
    end if;
    item_completed := (item ->> 'completed')::boolean;
    item_best_score := case
      when item_kind = 'quiz' and jsonb_typeof(item -> 'bestScore') = 'number'
        then (item ->> 'bestScore')::integer
      else null
    end;

    insert into public.progress_items (
      user_id, kind, item_id, completed, best_score
    ) values (
      current_user_id, item_kind, progress_id, item_completed, item_best_score
    )
    on conflict (user_id, kind, item_id) do update
    set
      completed = public.progress_items.completed or excluded.completed,
      best_score = case
        when excluded.kind = 'quiz'
          then greatest(
            coalesce(public.progress_items.best_score, 0),
            coalesce(excluded.best_score, 0)
          )
        else null
      end;
  end loop;

  route := payload ->> 'lastRoute';
  if route is not null then
    if route not in ('/learn', '/dictionary', '/motion', '/quiz', '/lab')
      or jsonb_typeof(payload -> 'lastActivityAt') <> 'string' then
      raise exception 'Invalid learner state' using errcode = '22023';
    end if;
    activity_at := (payload ->> 'lastActivityAt')::timestamptz;
    if activity_at > now() + interval '5 minutes' then
      raise exception 'Invalid activity timestamp' using errcode = '22023';
    end if;

    insert into public.learner_state (
      user_id, last_route, last_activity_at, schema_version
    ) values (
      current_user_id, route, activity_at, 2
    )
    on conflict (user_id) do update
    set last_route = case
          when public.learner_state.last_activity_at is null
            or excluded.last_activity_at >= public.learner_state.last_activity_at
          then excluded.last_route
          else public.learner_state.last_route
        end,
        last_activity_at = greatest(
          public.learner_state.last_activity_at,
          excluded.last_activity_at
        ),
        schema_version = 2;
  end if;
end;
$$;

create or replace function public.get_community_band()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select band_key
  from private.community_metrics
  where key = 'learner_milestone';
$$;

revoke all on table public.learner_profiles from anon, authenticated;
revoke all on table public.progress_items from anon, authenticated;
revoke all on table public.learner_state from anon, authenticated;
revoke all on table private.community_metrics from anon, authenticated;

grant select on table public.learner_profiles to authenticated;
grant select, insert, update, delete on table public.progress_items to authenticated;
grant select, insert, update, delete on table public.learner_state to authenticated;

revoke execute on function public.ensure_learner_profile() from public, anon, authenticated;
revoke execute on function public.merge_guest_progress(jsonb) from public, anon, authenticated;
revoke execute on function public.get_community_band() from public, anon, authenticated;

grant execute on function public.ensure_learner_profile() to authenticated;
grant execute on function public.merge_guest_progress(jsonb) to authenticated;
grant execute on function public.get_community_band() to anon, authenticated;
