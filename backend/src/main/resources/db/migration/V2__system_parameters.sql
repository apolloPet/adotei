create table if not exists system_parameter (
    id uuid primary key default gen_random_uuid(),
    category varchar(120) not null,
    parameter_key varchar(120) not null,
    parameter_value text not null,
    description text,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (category, parameter_key)
);
