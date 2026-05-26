create extension if not exists "pgcrypto";

create table if not exists app_user (
    id uuid primary key default gen_random_uuid(),
    auth_subject varchar(255) unique not null,
    full_name varchar(255) not null,
    email varchar(255) unique not null,
    phone varchar(50),
    user_type varchar(30) not null,
    address_line varchar(255),
    address_number varchar(30),
    neighborhood varchar(120),
    city varchar(120),
    state varchar(120),
    zip_code varchar(20),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists role (
    id uuid primary key default gen_random_uuid(),
    code varchar(50) unique not null,
    description varchar(255) not null
);

create table if not exists user_role (
    user_id uuid not null references app_user(id) on delete cascade,
    role_id uuid not null references role(id) on delete cascade,
    primary key (user_id, role_id)
);

create table if not exists adopter_profile (
    id uuid primary key default gen_random_uuid(),
    user_id uuid unique not null references app_user(id) on delete cascade,
    housing_type varchar(30),
    ownership_type varchar(30),
    rent_allows_pets boolean,
    has_yard boolean,
    yard_walled boolean,
    has_window_screens boolean,
    residents_count integer,
    has_children boolean,
    children_ages varchar(255),
    had_pets_before boolean,
    currently_has_pets boolean,
    current_pets_count integer,
    current_pets_types varchar(255),
    returned_animal boolean,
    pets_vaccinated boolean,
    pets_neutered boolean,
    aware_of_costs boolean,
    monthly_budget varchar(20),
    will_cover_vaccines boolean,
    will_cover_neutering boolean,
    will_cover_emergencies boolean,
    reason_to_adopt text,
    hours_alone_daily integer,
    if_destroyed text,
    if_sick text,
    will_adapt boolean,
    environment_photo_url text,
    environment_video_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists tutor (
    id uuid primary key default gen_random_uuid(),
    full_name varchar(255) not null,
    cpf varchar(20),
    code varchar(50) unique,
    contact varchar(80) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists organization (
    id uuid primary key default gen_random_uuid(),
    legal_name varchar(255) not null,
    cnpj varchar(30) unique,
    primary_contact_name varchar(255) not null,
    secondary_contact_name varchar(255),
    contact_phone_1 varchar(80) not null,
    contact_phone_2 varchar(80),
    city varchar(120) not null,
    state varchar(120),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists vaccine (
    id uuid primary key default gen_random_uuid(),
    code varchar(50) unique not null,
    name varchar(255) not null,
    animal_type varchar(30) not null,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists temperament_trait (
    id uuid primary key default gen_random_uuid(),
    code varchar(50) unique not null,
    description varchar(255) not null,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists adoption_requirement (
    id uuid primary key default gen_random_uuid(),
    code varchar(50) unique not null,
    name varchar(255) not null,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists animal (
    id uuid primary key default gen_random_uuid(),
    name varchar(255) not null,
    animal_type varchar(30) not null,
    breed varchar(120),
    age_years integer not null check (age_years >= 0),
    sex varchar(20) not null,
    size varchar(20) not null,
    description text not null,
    sterilized boolean not null default false,
    vaccination_status varchar(40),
    veterinary_info text,
    health_conditions text,
    special_needs boolean not null default false,
    special_needs_description text,
    good_with_children boolean not null default false,
    good_with_other_animals boolean not null default false,
    good_with_seniors boolean not null default false,
    energy_level varchar(40),
    trainability varchar(40),
    location varchar(255),
    responsible_name varchar(255),
    responsible_contact varchar(80),
    organization_id uuid references organization(id),
    tutor_id uuid references tutor(id),
    created_by uuid references app_user(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists animal_image (
    id uuid primary key default gen_random_uuid(),
    animal_id uuid not null references animal(id) on delete cascade,
    s3_key varchar(500) not null,
    file_url text not null,
    content_type varchar(80) not null,
    display_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists animal_vaccine (
    animal_id uuid not null references animal(id) on delete cascade,
    vaccine_id uuid not null references vaccine(id) on delete cascade,
    application_date date,
    notes text,
    primary key (animal_id, vaccine_id)
);

create table if not exists animal_temperament_trait (
    animal_id uuid not null references animal(id) on delete cascade,
    trait_id uuid not null references temperament_trait(id) on delete cascade,
    primary key (animal_id, trait_id)
);

create table if not exists animal_requirement (
    animal_id uuid not null references animal(id) on delete cascade,
    requirement_id uuid not null references adoption_requirement(id) on delete cascade,
    primary key (animal_id, requirement_id)
);

create table if not exists animal_adopter_profile (
    id uuid primary key default gen_random_uuid(),
    animal_id uuid unique not null references animal(id) on delete cascade,
    suitable_housing varchar(255),
    requires_yard boolean not null default false,
    requires_walled_yard boolean not null default false,
    requires_window_screens boolean not null default false,
    allows_rented boolean not null default true,
    min_resident_experience varchar(30),
    suitable_for_children boolean not null default true,
    suitable_for_first_timers boolean not null default true,
    max_hours_alone_daily integer,
    estimated_monthly_cost varchar(20),
    requires_emergency_budget boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

insert into role (code, description)
values
    ('ADMIN', 'Administrador da plataforma'),
    ('VOLUNTARIO', 'Voluntario da organizacao'),
    ('ADOTANTE', 'Usuario adotante')
on conflict (code) do nothing;
