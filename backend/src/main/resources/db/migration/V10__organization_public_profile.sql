alter table organization
    add column if not exists trade_name varchar(255),
    add column if not exists about_text text,
    add column if not exists story_text text,
    add column if not exists founded_year integer,
    add column if not exists mission_focus varchar(500),
    add column if not exists structure_info text,
    add column if not exists contact_email varchar(255),
    add column if not exists address_line varchar(500),
    add column if not exists logo_url varchar(1000),
    add column if not exists website_url varchar(500),
    add column if not exists instagram_url varchar(500),
    add column if not exists facebook_url varchar(500),
    add column if not exists published boolean not null default true;
