# Mapa de contratos frontend -> backend

Este documento consolida o contrato esperado pelo frontend atual para orientar a nova API Spring Boot.

## Animais

Origem no frontend:
- `src/services/animalService.ts`
- `src/components/admin/animal-registration/types.ts`
- `src/components/admin/animal-registration/AnimalRegistrationForm.tsx`

### Contrato mínimo atualmente persistido
- `nome` (string)
- `idade` (number)
- `tipo` (`cachorro|gato|outro`)
- `porte` (`pequeno|medio|grande`)
- `sexo` (`macho|femea`)
- `castrado` (boolean)
- `vacinas` (string[])
- `descricao` (string)
- `fotoPrincipal` (string URL/base64)
- `fotos` (string[])

### Campos coletados na UI e ainda nao persistidos de forma consistente
- Tutor: `tutorName`, `tutorContact`
- Saude detalhada: `veterinaryInfo`, `healthConditions`, `specialNeeds`, `specialNeedsDescription`
- Temperamento/perfil: `temperament`, `characteristics`, `goodWith*`, `energyLevel`, `trainability`
- Requisitos: `adoptionRequirements`, `requirements`
- Perfil ideal do adotante: `suitableHousing`, `requiresYard`, `requiresWalledYard`, `requiresWindowScreens`, `allowsRented`, `minResidentExperience`, `suitableForChildren`, `suitableForFirstTimers`, `maxHoursAloneDaily`, `estimatedMonthlyCost`, `requiresEmergencyBudget`

### Decisao de contrato no backend novo
- Persistir todos os campos acima com normalizacao relacional onde fizer sentido:
  - catalogos para vacinas, requisitos e tracos de temperamento
  - tabelas de associacao N:N para animal-vacina, animal-requisito e animal-traco
  - perfil ideal do adotante como objeto acoplado ao animal

## Usuarios

Origem no frontend:
- `src/components/admin/users/types.ts`
- `src/services/userService.ts`
- `src/lib/schemas/profile.ts`

### Campos relevantes
- Dados pessoais: nome, email, telefone
- Endereco: cep, rua, numero, bairro, cidade, estado
- Moradia: tipo, ownership, aluguel permite pets, quintal, quintal murado, telas
- Familia/experiencia: criancas, idades, historico com pets
- Financeiro: faixa de orcamento, custos de vacina/castracao/emergencia
- Intencao de adocao: motivacao, horas sozinho, respostas situacionais
- Papel de acesso: `ADMIN|VOLUNTARIO|ADOTANTE`

### Decisao de contrato no backend novo
- Separar:
  - conta/autenticacao
  - perfil de adotante
  - papeis/permissoes (RBAC)

## Entidades (ONG/Abrigo)

Origem no frontend:
- `src/services/shelterService.ts`
- `src/pages/Institution.tsx`

### Campos
- nome, cnpj, responsavel principal, segundo responsavel
- contato1, contato2
- localizacao (cidade/estado)
- endereco complementar opcional

## Parametros de sistema

Origem no frontend:
- `src/services/systemParameterService.ts`

Observacao:
- o frontend chama a edge function `admin-management` com acoes de parametros (`getParameters/createParameter/updateParameter`) que nao estao implementadas no backend antigo.
- no backend Spring novo havera endpoint dedicado de parametros administrativos.

## Regras de negocio essenciais (issues do project)

- Animal deve ter no minimo 1 imagem e no maximo 2.
- Cadastro de vacinas deve existir como catalogo e aplicacao em animal.
- Tutor deve ser entidade de primeiro nivel e vinculavel ao animal.
- Temperamento deve ser catalogavel e vinculavel ao animal.
- Requisitos devem ser catalogaveis e vinculaveis ao animal.
- Usuario precisa de perfil completo e papel bem definido para autorizacao.
