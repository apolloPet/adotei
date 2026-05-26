create table if not exists user_credential (
    user_id uuid primary key references app_user(id) on delete cascade,
    password_hash varchar(255) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
