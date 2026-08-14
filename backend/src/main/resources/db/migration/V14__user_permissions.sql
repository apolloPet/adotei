-- Permissoes tambem para voluntarios de ONG + nova permissao de gestao de usuarios.
update app_user
set admin_permissions = admin_permissions || jsonb_build_object(
    'manageUsers',
    coalesce((admin_permissions ->> 'manageSettings')::boolean, true)
)
where user_type = 'ADMIN'
  and admin_permissions is not null
  and not jsonb_exists(admin_permissions, 'manageUsers');

update app_user
set admin_permissions = '{
  "manageAnimals": true,
  "approveAdoptions": true,
  "manageSettings": false,
  "manageAdmins": false,
  "manageUsers": false
}'::jsonb
where user_type = 'VOLUNTARIO'
  and admin_permissions is null;
