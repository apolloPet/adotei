alter table animal
    add column if not exists tutor_name varchar(255),
    add column if not exists tutor_contact varchar(80),
    add column if not exists personality_temperament text,
    add column if not exists additional_info text;
