insert into vaccine (code, name, animal_type, active)
values
    ('VAC_DOG_RAIVA', 'Raiva', 'cachorro', true),
    ('VAC_DOG_MULTIPLA', 'Proteção Múltipla', 'cachorro', true),
    ('VAC_DOG_GRIPE', 'Gripe Canina', 'cachorro', true),
    ('VAC_DOG_GIARDIA', 'Giárdia', 'cachorro', true),
    ('VAC_CAT_RAIVA', 'Raiva', 'gato', true),
    ('VAC_CAT_MULTIPLA', 'Proteção Múltipla Felina', 'gato', true),
    ('VAC_CAT_LEUCEMIA', 'Leucemia Felina', 'gato', true),
    ('VAC_CAT_CLAMIDIOSE', 'Clamidiose', 'gato', true)
on conflict (code) do update
set
    name = excluded.name,
    animal_type = excluded.animal_type,
    active = excluded.active;
