alter table app_user
    add column if not exists admin_permissions jsonb;

update app_user
set admin_permissions = '{
  "manageAnimals": true,
  "approveAdoptions": true,
  "manageSettings": true,
  "manageAdmins": true
}'::jsonb
where user_type = 'ADMIN'
  and admin_permissions is null;
