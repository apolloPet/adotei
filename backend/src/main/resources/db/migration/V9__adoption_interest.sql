create table if not exists adoption_interest (
    id uuid primary key default gen_random_uuid(),
    animal_id uuid not null references animal(id) on delete cascade,
    user_id uuid not null references app_user(id) on delete cascade,
    interest_type varchar(20) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_adoption_interest_animal_user unique (animal_id, user_id)
);

create index if not exists idx_adoption_interest_animal_id on adoption_interest(animal_id);
create index if not exists idx_adoption_interest_user_id on adoption_interest(user_id);
