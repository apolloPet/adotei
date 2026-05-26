alter table app_user
    add column if not exists organization_id uuid references organization(id);

create index if not exists idx_app_user_organization_id on app_user(organization_id);
