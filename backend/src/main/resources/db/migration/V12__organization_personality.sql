create table if not exists organization_personality (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organization(id) on delete cascade,
    name varchar(120) not null,
    description varchar(200) not null,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (organization_id, name)
);

create index if not exists idx_organization_personality_org on organization_personality (organization_id);

alter table animal
    add column if not exists personality_id uuid references organization_personality(id);
