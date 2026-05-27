# Relatório de atividades — colaboração Cursor (projeto Adotei)

Este documento consolida as solicitações e entregas da nossa colaboração no repositório **Adotei**, com **datas e horários** quando registrados no histórico da conversa, **estimativas de tempo de trabalho do assistente** (planejamento + implementação + depuração) e uma seção sobre **valores monetários**.

**Fonte do histórico datado:** transcript da conversa em  
[`11eb5054-1dbb-4af0-9476-247f50181b17`](file:///home/joaocobo/.cursor/projects/home-joaocobo-Documentos-projects-adotei/agent-transcripts/11eb5054-1dbb-4af0-9476-247f50181b17/11eb5054-1dbb-4af0-9476-247f50181b17.jsonl)  
(fuso **UTC-3** nos timestamps do cliente).

**Observação:** algumas mensagens de follow-up (ex.: filtro “apenas com interesses”, ajustes de UI) aparecem no transcript **sem** `<timestamp>`; nesses casos a atividade fica agrupada na mesma janela de trabalho, sem horário exato.

---

## 1. Metodologia — tempo e custos

### Tempo

- As durações abaixo são **estimativas** do esforço típico de assistente para **pesquisar o código**, **alterar backend/frontend**, **corrigir erros reportados** e **validar build/testes**, **não** medidas de cronômetro humano nem faturamento formal.
- Arredondamento: blocos em múltiplos de 5 minutos onde faz sentido.

### Valores (custos)

- O assistente **não emite nota fiscal** nem possui valor de mercado único por hora neste contexto.
- **Custo real para você** depende do seu plano (ex.: Cursor) e do consumo de tokens — isso só aparece no **painel da sua conta**, não no repositório.
- Para fins de **planejamento de projeto**, segue uma **tabela ilustrativa** multiplicando as horas estimadas por tarifas hipotéticas de desenvolvimento (BRL/h). Substitua pela tarifa que você usa internamente.

---

## 2. Cronologia por data (mensagens do usuário com timestamp)

### 25 de maio de 2026 (segunda-feira)

| Horário (UTC-3) | Pedido / tema |
|-----------------|---------------|
| 09:31 | Explicação do funcionamento do plugin Auth0 no Cursor |
| 09:33 | Adicionar login com Auth0 no app React |
| 09:37 | Manter AuthProvider próprio com **auth real** front↔back; admin via banco; **Meu perfil** para todos; troca de senha no perfil |
| 09:57 | Erro 400 “Credenciais invalidas” no login |
| 09:59 | Referência a saída de terminal |
| 10:07 | `SPRING_PROFILES_ACTIVE=local` + `spring-boot:run` quebrando |
| 10:10 | Ajuste de exibição do avatar / identidade no header |
| 10:11 | Front subir **apenas na porta 4000** |
| 10:16 | Reclamação de UI poluída no painel (ONGs / abas) |
| 10:23 | Cadastro de **voluntários** da ONG + checkbox **responsável pela entidade** |
| 10:27 | Voluntário com **email + senha** + **edição** |
| 10:32 | Login com usuário da ONG não funcionando |
| 10:37 | Voluntário: tela de cadastro de pets; **não** “encontrar pets”; **não** ser tutor |
| 10:57 | Fluxo administrativo só para **funcionários de entidade**; remover cadastro de admin na tela; remover aviso de credenciais de demonstração |
| 11:03 | Tela de cadastro de pets em **reload contínuo** |
| 11:18 | Tela de cadastro de pets **em branco** |
| 11:22 | Especificação ampla do **cadastro de animal** + fotos via **S3 no backend** |
| 11:40 | Vacinas: **multiselect** + cadastro pré-definido (nomes amigáveis) |

Trabalho associado (sem timestamp explícito no transcript, mas realizado na mesma linha do tempo): refatoração da área de **gestão de ONGs** (lista, busca, paginação, formulário compartilhado novo/editar), conforme resposta do assistente no transcript.

### 26 de maio de 2026 (terça-feira)

#### Manhã

| Horário (UTC-3) | Pedido / tema |
|-----------------|---------------|
| 09:10 | **Cadastro de vacinas** restrito a voluntários e administradores |
| 09:20 | Erro AWS S3 403 (Access Key inexistente) no fetch de imagem |
| 09:25 | Uso local do **MinIO** — alinhar credenciais/configuração |
| 09:29 | Erro 500 **LazyInitialization** em `Animal.vaccines` |
| 09:33 | Email “já cadastrado” sem parecer existir na UI (`carlos12@gmail.com`) |
| 09:35 | Fluxo de registro: “Próximo” não deve disparar **create** cedo |
| 09:38 | Registro retorna **201** mas front falha ao parsear JSON; redirecionar para login com email pré-preenchido |
| 09:45 | Imagem do animal: URL abre no browser mas **não renderiza** no front |
| 09:54 | Endpoint passando `images` vazio — correção |

#### Noite

| Horário (UTC-3) | Pedido / tema |
|-----------------|---------------|
| 19:50 | **Compatibilidade** por perguntas alinhadas (usuário × pet); algoritmo percentual; textos para validação da ONG |
| 19:54 | Cache de dados de compatibilidade do usuário em **localStorage** para não refetch por pet |
| 19:55 | Execução do **Plano de Compatibilidade por Perguntas** (implementação completa sem editar o ficheiro do plano) |
| 21:07 | Persistir **interesse** no backend; botão **interessados** no painel; swipe direita persiste, esquerda só pula |
| 21:37 | **Segurança**: token forte, anti-bypass no front, isolamento por ONG, roles no backend, todos os endpoints protegidos |

#### Follow-ups (sem `<timestamp>` no transcript)

- Filtro na lista de animais: **“Apenas animais com interesses”**.
- **Modal de interessados**: mais espaço, menos quebra feia de texto.
- **Paginação** na lista de animais (10 / 20 / todos + navegação).
- Página **ONG parceira**: vitrine pública + edição por admin/voluntário responsável.
- Pergunta sobre **alterar o body do login** (role) e o front “acreditar” — esclarecimento + alinhamento com hardening (backend como fonte da verdade).
- Pedido deste **relatório .MD** com tempos e valores.

---

## 3. Atividades agrupadas — descrição e tempo estimado

| ID | Bloco de trabalho | Conteúdo principal | Tempo estimado |
|----|-------------------|-------------------|----------------|
| A | Auth0 (exploração) | Explicação do plugin; início de integração React; decisão de seguir com auth próprio | 25 min |
| B | Autenticação real (grande entrega) | Credenciais no banco, JWT, login/registro/me, segurança Spring no perfil local, integração `apiClient`/wrapper, perfil e troca de senha | 3 h 30 min |
| C | Estabilização pós-auth | Erros de login, boot Spring, avatar, porta 4000, ajustes de painel | 50 min |
| D | Voluntários e papéis | CRUD voluntário, responsável da entidade, login VOLUNTARIO, bloqueios de UX para não-adotante | 1 h 45 min |
| E | Área administrativa de pets | Rotas protegidas, remoção de demo, correção de reload/tela em branco | 50 min |
| F | Modelo rico de animal + mídia | Campos do cadastro, vacinas multiselect, S3/MinIO no backend, lazy loading/EntityGraph, imagens na API e no front | 3 h 15 min |
| G | Cadastro de vacinas (CRUD) | Endpoints + UI com restrição ADMIN/VOLUNTARIO | 35 min |
| H | Registro multi-passos | Não submeter cedo; respostas HTTP com corpo JSON consistente; redirect pós-registro | 40 min |
| I | Compatibilidade | Modelo de perguntas booleanas + textos; serviço de score; cache em localStorage; alterações em perfil animal/adotante e UI | 3 h 45 min |
| J | Interesses de adoção | Migration, entidade, API, autorização por ONG; front swipe + lista de interessados | 2 h 15 min |
| K | Lista de animais (UX) | Filtro “com interesses”, modal maior, paginação 10/20/todos | 1 h 45 min |
| L | ONG parceira (público + edição) | Campos de perfil público, endpoints, página `/institution`, dialog de edição | 1 h 35 min |
| M | Segurança (hardening) | Cookie HttpOnly, CORS configurável, remoções permitAll sensíveis, RBAC/`@PreAuthorize`, ABAC por ONG, guards no front sem confiar em flags locais, erros sem vazamento, testes ajustados | 4 h 30 min |
| N | Orientação + relatório | Pergunta sobre tamper de role na resposta; elaboração deste `.md` | 25 min |

**Total estimado (somando blocos A–N):** **~23 h 30 min**

*(Se quiser exclusivamente o pacote da “segurança + interesses + compatibilidade + ONGs + lista”, pode somar apenas J–N ≈ 10 h 30 min.)*

---

## 4. Equivalência de custo ilustrativo (BRL)

Fórmula: **custo_ilustrativo = horas_estimadas × tarifa_horária**.

| Tarifa hipotética (R$/h) | Custo ilustrativo (total ~23,5 h) |
|--------------------------|-----------------------------------|
| 80 | ~1.880 |
| 120 | ~2.820 |
| 200 | ~4.700 |

Substitua a tarifa pela sua real (freelancer, CLT equivalida, ou agência).

**Custos Cursor / IA:** consulte sua fatura ou painel de uso; não há como derivar esse valor apenas a partir do código ou deste relatório.

---

## 5. Referência rápida — principais artefatos tocados

- **Auth / sessão:** `AuthController`, `SecurityConfig` / `LocalSecurityConfig`, `CookieBearerTokenResolver`, `LocalJwtConfig`, `apiClient.ts`, `supabase.ts` (wrapper), rotas `AuthenticatedRoute` / `AdminProtectedRoute`.
- **Animais / mídia / vacinas:** `AnimalService`, `AnimalController`, storage S3/MinIO, migrações e entidades relacionadas.
- **Compatibilidade:** serviços e DTOs de scoring, perfis de adotante e animal.
- **Interesses:** `V9__adoption_interest`, `AdoptionInterestService`, `AdoptionInterestController`, `adoptionService.ts`, `AnimalList`, `Browse`.
- **ONG pública:** migração de perfil público, `OrganizationProfileService` / controller, `Institution.tsx`.
- **Testes:** ajustes em testes de serviço e `application.yml` de teste para segredo JWT.

---

## 6. Limitações deste relatório

- **Não** substitui controle de horas formal (Jira/Toggl/nota fiscal).
- Tempos são **aproximações** do trabalho assistido na conversa, não garantia de produtividade em outro ambiente ou com outra equipe.
- **Datas** são as dos pedidos **registrados com timestamp**; mensagens sem timestamp ficam apenas **ordenadas logicamente**.

---

*Documento gerado para arquivo no repositório em 26 de maio de 2026.*
