# Ambiente local com Docker Compose

Sobe apenas a **infraestrutura** (PostgreSQL e MinIO). Backend e frontend rodam na máquina host.

## Pré-requisitos

- Docker Engine 24+ e Docker Compose v2
- Java 21 e Maven (backend)
- Node.js 22+ (frontend)

## 1. Subir infraestrutura

```bash
docker compose up -d
```

| Serviço   | URL / conexão |
|-----------|----------------|
| Postgres  | `localhost:5432` — db `adotei`, user/pass `postgres` |
| MinIO API | http://localhost:9000 |
| MinIO UI  | http://localhost:9001 (`minioadmin` / `minioadmin`) |

## 2. Backend (host)

```bash
cd backend
export SPRING_PROFILES_ACTIVE=local
export DATABASE_URL=jdbc:postgresql://localhost:5432/adotei
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=postgres
export S3_BUCKET=adotei-assets
export S3_ENDPOINT=http://localhost:9000
export S3_ACCESS_KEY=minioadmin
export S3_SECRET_KEY=minioadmin
mvn spring-boot:run
```

API: http://localhost:8080 — Swagger: http://localhost:8080/swagger

O perfil **`local`** desliga JWT e libera todos os endpoints (apenas desenvolvimento).

Ao iniciar em perfil local, o backend garante um administrador bootstrap:

- email: `admin@petmatch.com`
- tipo/papel: `ADMIN`

Para sobrescrever:

- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_FULL_NAME`
- `BOOTSTRAP_ADMIN_AUTH_SUBJECT`

## 3. Frontend (host)

Na raiz do projeto:

```bash
export VITE_API_BASE_URL=http://localhost:8080
npm run dev
```

App: http://localhost:8080 (porta padrão do Vite neste projeto)

## Testes automatizados do backend

Na máquina host:

```bash
cd backend && mvn test
```

Ou via container (sem subir Postgres/MinIO — testes usam H2):

```bash
docker compose --profile test run --rm backend-test
```

Se o Gradle no IDE falhar com *Unable to delete directory .../backend/build*, a pasta foi criada como `root` por um build Docker anterior. Limpe com:

```bash
sudo rm -rf backend/build
# ou: ./scripts/clean-backend-build.sh  (indica o comando se precisar de sudo)
```

## Parar e limpar

```bash
docker compose down
docker compose down -v   # remove volumes de Postgres e MinIO
```

## Produção

Não use o perfil `local` em produção. Configure `JWT_ISSUER_URI` / `JWT_JWK_SET_URI` e credenciais reais de Postgres e S3.
