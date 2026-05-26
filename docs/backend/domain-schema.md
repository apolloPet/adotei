# Modelo de dominio e banco (Railway Postgres)

## Escopo

Este schema cobre os cadastros de:
- usuarios
- tutores
- entidades
- vacinas
- temperamento
- requisitos
- animais (com imagens e perfil ideal de adotante)

## Entidades principais

- `app_user`
  - conta do usuario da plataforma
  - contem dados basicos e campos para integracao de autenticacao externa (JWT subject)
  - `user_type` define o perfil de negocio:
    - `ADOTANTE`: pessoa que demonstra interesse em adotar um animal
    - `VOLUNTARIO`: perfil criado por administrador para cadastrar e manter animais
    - `ADMIN`: administra configuracoes, entidades, voluntarios e demais operacoes
- `role` e `user_role`
  - RBAC para `ADMIN`, `VOLUNTARIO`, `ADOTANTE`
- `adopter_profile`
  - perfil detalhado para match de adocao
- `tutor`
  - pessoa/contato responsavel anterior ou atual do animal
- `organization`
  - entidade/ONG
- `vaccine`
  - catalogo de vacinas
- `temperament_trait`
  - catalogo de tracos de personalidade/temperamento
- `adoption_requirement`
  - catalogo de requisitos
- `animal`
  - dados centrais do animal
- `animal_image`
  - metadados da imagem no S3
- `animal_vaccine`
  - associacao N:N de vacinas aplicadas no animal
- `animal_temperament_trait`
  - associacao N:N de tracos no animal
- `animal_requirement`
  - associacao N:N de requisitos do animal
- `animal_adopter_profile`
  - perfil ideal do adotante por animal

## Regras e constraints relevantes

- Animal deve possuir:
  - nome, tipo, porte, sexo, idade, descricao
  - pelo menos 1 e no maximo 2 imagens (regra validada na aplicacao; opcionalmente trigger no banco futuramente)
- `vaccine.code` deve ser unico.
- `temperament_trait.code` deve ser unico.
- `adoption_requirement.code` deve ser unico.
- Cada usuario deve ter exatamente 1 papel em `user_role`, obrigatoriamente igual ao `user_type`.
- Associacoes N:N usam chave composta para impedir duplicidade.

## Observacoes de seguranca e auditoria

- Todas as tabelas possuem `created_at` e `updated_at`.
- Tabelas com alteracao frequente tambem possuem `active` quando aplicavel.
- Campos de autenticacao sensivel (senha) nao ficam no banco da aplicacao; somente `auth_subject` para correlacao JWT.
