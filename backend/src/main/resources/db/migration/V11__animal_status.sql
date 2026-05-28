alter table animal
    add column if not exists status varchar(20) not null default 'DISPONIVEL';

update animal
set status = 'DISPONIVEL'
where status is null;
