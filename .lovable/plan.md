## Visão geral

Implementar três grandes mudanças:

1. **Página `/browse`**: adicionar ação "Salvar" (acompanhar) além de curtir/passar.
2. **Página `/profile`**: expandir cadastro com perfil de moradia, experiência, finanças, intenção, comprovação (upload de foto/vídeo) e validação.
3. **Match inteligente + alertas para admins** baseados no perfil.

---

## 1. `/browse` — botão Salvar

- Adicionar 4º botão "Salvar" (ícone `Bookmark`) em `src/components/pet/ActionButtons.tsx`.
- Estender `onSwipe` em `PetCard.tsx` e `PetBrowser.tsx` para aceitar uma terceira ação `'saved'` (além de `'left'`/`'right'`).
- Em `Browse.tsx`, novo handler chama `recordPetMatch(id, userId, 'saved')`.
- Atualizar `recordPetMatch` em `src/services/adoptionService.ts` para suportar status `'saved'` no localStorage mock.
- Toast: "Animal salvo para acompanhar 🔖".

## 2. `/profile` — cadastro expandido

Expandir `UserProfile` (`src/types/user.ts`) com novos campos agrupados:

```text
housing: {
  type: 'house' | 'apartment' | 'farm'
  ownership: 'owned' | 'rented'
  rentAllowsPets?: boolean
  hasYard: boolean
  yardWalled?: boolean
  hasWindowScreens?: boolean
  numResidents: number
  hasChildren: boolean
  childrenAges?: string
}
experience: {
  hadPetsBefore: boolean
  currentlyHasPets: boolean
  currentPetsCount?: number
  currentPetsTypes?: string
  returnedAnimal: boolean
  petsVaccinated?: boolean
  petsNeutered?: boolean
}
financial: {
  awareOfCosts: boolean
  monthlyBudget: '100-300' | '300-600' | '600+'
  willCoverVaccines: boolean
  willCoverNeutering: boolean
  willCoverEmergencies: boolean
}
intention: {
  reasonToAdopt: string  // min 1000 chars
  hoursAloneDaily: number
  ifDestroyed: string
  ifSick: string
  willAdapt: boolean
}
proof: {
  environmentPhotoUrl?: string
  environmentVideoUrl?: string
}
hasAllergies: boolean
```

Refatorar `src/pages/Profile.tsx` em formulário multi-step com Tabs (Moradia / Experiência / Finanças / Intenção / Comprovação) usando `react-hook-form` + `zod` para validação:

- `reasonToAdopt`: mínimo 1000 caracteres.
- `rentAllowsPets`: obrigatório se `ownership === 'rented'`.
- Campos required por seção.

Persistência: salvar em `localStorage` via mock supabase (`profiles` table do offline client) e em `user_profile_extended` key.

Uploads: como estamos em modo offline (sem storage), aceitar arquivo e converter para base64/data URL salva no localStorage (com aviso de tamanho máx 2MB para foto, 10MB para vídeo).

## 3. Match inteligente

Criar `src/utils/petMatchFilter.ts`:

```ts
filterPetsForUser(pets: Pet[], profile: UserProfile): Pet[]
```

Regras:
- `housing.type === 'apartment'` → remover pets `size === 'large'`.
- `!housing.hasWindowScreens` + pet `species === 'cat'` → marcar pet com `requirementWarning` ("requer tela em janelas").
- `!experience.hadPetsBefore` → priorizar pets com traits dóceis (ordenar por personalidade dócil).
- `housing.ownership === 'rented' && !housing.rentAllowsPets` → não mostrar nenhum pet, exibir mensagem de bloqueio.

Aplicar no `loadPets` de `Browse.tsx` após gerar mocks.

Exibir banner em `Browse.tsx` quando o pet exige requisito que o usuário não atende.

## 4. Alertas para admins

Criar `src/utils/profileAlerts.ts`:

```ts
getProfileAlerts(profile: UserProfile): Alert[]
```

Alertas:
- 🔴 Mora em aluguel e não permite pets
- 🟠 Já devolveu animal
- 🟠 Não aceita custos veterinários (qualquer um dos 3 false)
- 🟡 Possui alergia

Exibir esses alertas no card do candidato em `src/components/admin/adoption/MatchCard.tsx` (badge colorido + lista no modal de detalhes).

---

## Detalhes técnicos

- **Validação**: `zod` schemas em `src/lib/schemas/profile.ts`, um por seção, combinados em schema final.
- **Persistência offline**: estendemos `offlineSupabase` para a tabela `profiles` aceitar o JSON estendido em uma coluna `extended_profile` (jsonb simulado).
- **Tipos**: atualizar `UserProfile` em `src/types/user.ts` mantendo backward compat (campos antigos ficam como aliases dos novos).
- **Upload offline**: helper `fileToDataUrl(file): Promise<string>` em `src/utils/fileUpload.ts` com validação de tamanho/tipo.

## Arquivos a criar

- `src/lib/schemas/profile.ts`
- `src/utils/petMatchFilter.ts`
- `src/utils/profileAlerts.ts`
- `src/utils/fileUpload.ts`
- `src/components/profile/HousingForm.tsx`
- `src/components/profile/ExperienceForm.tsx`
- `src/components/profile/FinancialForm.tsx`
- `src/components/profile/IntentionForm.tsx`
- `src/components/profile/ProofForm.tsx`

## Arquivos a editar

- `src/components/pet/ActionButtons.tsx` (botão Salvar)
- `src/components/PetCard.tsx` (handler save)
- `src/components/browse/PetBrowser.tsx` (propagar save)
- `src/pages/Browse.tsx` (recordPetMatch 'saved' + filtro inteligente + bloqueio aluguel)
- `src/services/adoptionService.ts` (status 'saved')
- `src/pages/Profile.tsx` (form multi-tab)
- `src/types/user.ts` (nova estrutura)
- `src/components/admin/adoption/MatchCard.tsx` (alertas)

## Fora do escopo (a confirmar depois)

- Notificação real à ONG quando alguém curte (continua só toast local).
- Backend real para uploads — vamos usar data URL no localStorage por enquanto (modo offline).
