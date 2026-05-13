# Auditoria: cadastros vs. cartão do animal vs. exigências do adotante

Fiz um cruzamento entre os 3 pontos do fluxo:
1. **Cadastro do animal** (`AnimalRegistrationForm` + abas)
2. **Cartão do animal** (`PetInfoOverlay` em `/browse`)
3. **Cadastro do adotante** (`RegisterForm`, passos 3 e 4)

## O que está OK

- O **adotante** já informa moradia, área útil, acesso externo, controle de fugas, crianças, alergias, outros pets, horas sozinho, viagens, rotina e compromissos financeiros.
- O **cadastro do animal** já tem a aba "Perfil ideal do adotante" com requisitos espelhados (moradia, quintal, telas, experiência, horas sozinho, custo mensal, reserva de emergência) — então o match cobre o que o adotante declara.
- Características, vacinação, castração, necessidades especiais e condições de saúde estão presentes no formulário do animal.

## Lacunas que precisam ser corrigidas

### 1. Cartão do animal mostra dados falsos (hash do id)
Hoje `PetInfoOverlay` deriva por hash do id:
- `personality` (Dócil/Brincalhão fixos)
- `isVaccinated = true` sempre
- `isNeutered` aleatório
- `isSpecial` lê campos que nunca chegam no Pet

**Causa**: `src/utils/animalAdapter.ts` ignora `characteristics`, `vaccinationStatus`, `sterilized`, `specialNeeds`, `healthConditions`. Só repassa `castrado` como trait.

### 2. `Animal`/`AnimalCreateData` (camada de dados) descarta campos
No `AnimalRegistrationForm` (linha 212), o save monta:
```
castrado, vacinas: [vaccinationStatus], descricao, fotos…
```
e **perde**: `characteristics`, `specialNeeds`, `specialNeedsDescription`, `healthConditions`, `veterinaryInfo`, `adoptionRequirements`, e **toda a aba "Perfil ideal do adotante"** (suitableHousing, requiresYard, suitableForChildren, maxHoursAloneDaily, estimatedMonthlyCost, requiresEmergencyBudget, etc).

Sem esses campos persistidos, o match inteligente entre adotante e animal não funciona — apenas exibe a UI.

### 3. "Tempo de espera" no cartão é falso
`waitingDays` vem do hash do id. Deveria vir de `data_cadastro`.

## Mudanças propostas

**A. Frontend (cartão + adapter)** — escopo seguro, sem tocar no banco:
1. Estender o tipo `Pet` (`src/types/pets/interfaces.ts`) com `vaccinated`, `neutered`, `daysWaiting` opcionais.
2. Atualizar `animalAdapter.ts` para mapear:
   - `characteristics` → `traits`
   - `sterilized` → `neutered`
   - `vaccinationStatus in ['complete','partial']` → `vaccinated`
   - `specialNeeds` → `specialNeeds`
   - `healthConditions.length > 0` → `healthIssues`
   - `data_cadastro` → `daysWaiting`
3. Atualizar `PetInfoOverlay` para usar esses campos em vez do hash (mantendo fallback para mock data).
4. Atualizar `mockPets.ts` para gerar valores coerentes com os novos campos.

**B. Persistência** — para o match funcionar de verdade:
1. Estender `AnimalCreateData`/`Animal` (`animalService.ts`) com os campos que hoje são descartados.
2. Atualizar o `INSERT` da tabela `animais` para gravá-los (provavelmente como JSON em uma coluna `perfil_match` para evitar uma migração extensa de schema).
3. Atualizar `AnimalRegistrationForm` para enviar esses campos.

**C. Não vou mexer em**: schema do banco propriamente dito. Como o memory indica que o BD da Lovable Cloud está vazio, qualquer migração precisa de decisão sua antes.

## Pergunta

Quer que eu execute **A** (corrigir o cartão para refletir o cadastro — visual imediato), **A + B sem migração** (gravando o perfil de match como JSON em uma coluna existente ou nova via migração leve), ou **A + B + migração completa** com colunas tipadas?
