alter table app_user
    add column if not exists organization_responsible boolean not null default false;
