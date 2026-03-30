-- AI-generated projects table
create table if not exists ai_projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  color text default '#8B5CF6',
  -- Files stored as JSONB: { "/App.tsx": "code...", "/styles.css": "code..." }
  files jsonb not null default '{}',
  -- Chat history: [{ role: "user"|"assistant", content: "..." }]
  messages jsonb not null default '[]',
  status text default 'draft' check (status in ('draft', 'published')),
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger ai_projects_updated_at
  before update on ai_projects
  for each row execute function update_updated_at();

-- RLS policies
alter table ai_projects enable row level security;

-- Authenticated users can read all projects
create policy "Authenticated users can view projects"
  on ai_projects for select
  to authenticated
  using (true);

-- Only admins can insert/update/delete
create policy "Admins can manage projects"
  on ai_projects for all
  to authenticated
  using (
    (select raw_app_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  )
  with check (
    (select raw_app_meta_data->>'role' from auth.users where id = auth.uid()) = 'admin'
  );
