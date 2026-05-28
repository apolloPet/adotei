# Estrategia de testes do backend

## Camadas

- **Unitario (rapido)**
  - regras de negocio de servicos
  - validacoes de limite (ex.: maximo de 2 imagens por animal)
- **Integracao Spring**
  - carregamento de contexto e wiring de beans
- **Integracao de persistencia (proximo passo)**
  - Testcontainers com PostgreSQL para validar migrations Flyway e relacionamentos

## Cobertura inicial implementada

- `AnimalServiceTest`
  - valida a regra de negocio de limite de imagens
- `AdoteiBackendApplicationTests`
  - valida subida de contexto da aplicacao

## Proximo incremento recomendado

1. Testes de controller com `MockMvc` para endpoints:
   - `/api/animals`
   - `/api/users`
   - `/api/system-parameters`
2. Testes de integracao com PostgreSQL real (Testcontainers) para:
   - migrations `V1` e `V2`
   - CRUD completo com relacoes N:N
3. Teste de contrato para upload:
   - gerar presigned URL
   - validar bloqueio apos 2 imagens
