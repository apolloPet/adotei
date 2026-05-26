update app_user
set user_type = upper(user_type)
where user_type is not null;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'ck_app_user_user_type'
    ) then
        alter table app_user
            add constraint ck_app_user_user_type
            check (user_type in ('ADOTANTE', 'VOLUNTARIO', 'ADMIN'));
    end if;
end $$;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'uk_user_role_user_id'
    ) then
        alter table user_role
            add constraint uk_user_role_user_id unique (user_id);
    end if;
end $$;
