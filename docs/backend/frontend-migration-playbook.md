# Plano de migracao frontend -> API Spring

## Objetivo

Remover dependencia de `supabase.*` no frontend e consumir a API Spring (`/api/...`) hospedada no Railway.

## Fase 1 - Infra de cliente HTTP

1. Criar `src/lib/apiClient.ts` com:
   - `baseURL` via `VITE_API_BASE_URL`
   - injeção do JWT no header `Authorization: Bearer ...`
   - tratamento padrao de erro (status, message)
2. Manter `supabase` apenas para autenticação temporaria ate o frontend concluir a troca de token.

## Fase 2 - Migracao de serviços (ordem recomendada)

1. Catalogos base:
   - `src/services/systemParameterService.ts` -> `/api/system-parameters`
   - novos serviços para:
     - `/api/vaccines`
     - `/api/temperament-traits`
     - `/api/adoption-requirements`
     - `/api/tutors`
     - `/api/organizations`
2. Usuarios:
   - `src/services/userService.ts` -> `/api/users`
   - perfil adotante -> `PUT /api/users/{id}/adopter-profile`
3. Animais:
   - `src/services/animalService.ts` -> `/api/animals`
   - upload imagem:
     - `POST /api/animals/{id}/images/presigned-upload`
     - frontend faz `PUT` no `uploadUrl` retornado

## Fase 3 - Ajustes de contrato na UI

1. `AnimalRegistrationForm.tsx`
   - parar de reduzir dados para subconjunto antigo
   - enviar payload completo com:
     - `vaccineIds`, `temperamentTraitIds`, `requirementIds`
     - `adopterProfile`
     - `organizationId`, `tutorId`
2. `types.ts` da tela admin:
   - alinhar enums/strings com backend (`animalType`, `size`, `sex`, etc.)
3. `Browse.tsx`:
   - retirar `mockPets`
   - buscar `/api/animals` e mapear para visualização pública

## Fase 4 - Limpeza final

1. Remover uso de:
   - `src/lib/offlineSupabase.ts`
   - `supabase.functions.invoke(...)` para domínios migrados
2. Desativar toggles/fallback de mock em produção.
3. Revisar RBAC no frontend:
   - ações admin/voluntario bloqueadas por papel do JWT.

## Checklist de aceite

- Todos os CRUDs das 7 issues funcionam sem Supabase para dados.
- Cadastro de animal salva dados completos + relacionamento.
- Upload de imagens usa apenas S3 (presigned URL).
- Lista pública/admin de animais usa API Spring.
- `systemParameterService` deixa de chamar edge function antiga.
