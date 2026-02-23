# yasAPI Template

API REST em **Fastify + TypeScript** com estrutura escalável: domínio, infraestrutura e HTTP bem separados, pronta para crescer com novos módulos (game, store, achievements, etc.).

---

## Estrutura do projeto

```
src/
├── app/           # Camada HTTP e servidor
├── core/          # Infraestrutura compartilhada
├── modules/       # Domínio por módulo (auth, users, …)
├── shared/        # Middlewares, validators, tipos e constantes globais
└── index.ts       # Entrada da aplicação
```

---

## O que é cada pasta

### `app/` — Camada de aplicação HTTP

Onde o servidor Fastify é montado e onde ficam **plugins** e **rotas**.

- **`server.ts`** — Sobe o servidor (conecta DB, build do app, listen).
- **`app.ts`** — Monta a instância do Fastify: registra plugins (CORS, JWT, rate-limit, Swagger), error handler e rotas.
- **`routes.ts`** — Agrupa e registra as rotas de todos os módulos (ex.: `/api/v1/auth`, `/api/v1/users`).
- **`error-handler.ts`** — Tratamento global de erros (traduz exceções em respostas HTTP no formato estilo AWS).
- **`plugins/`** — Plugins do Fastify:
  - **`jwt.ts`** — Registra `@fastify/jwt` (segredo, expiração). Quem exige autenticação usa o **middleware de auth** em `shared/middlewares`.
  - **`cors.ts`** — Configura CORS.
  - **`swagger.ts`** — Documentação OpenAPI/Swagger (ex.: em dev em `/docs`).
  - **`rate-limit.ts`** — Rate limit global por IP.

**Resumo:** em `app/` você **não** coloca regra de negócio; só configuração HTTP, plugins e encadeamento de rotas.

---

### `core/` — Infraestrutura compartilhada

Tudo que é transversal à aplicação: config, banco, HTTP (tipos/erros/respostas) e utilitários.

- **`config/`**
  - **`env.ts`** — Lê variáveis de ambiente (PORT, JWT_SECRET, DATABASE_URL, etc.).
  - **`index.ts`** — Reexporta `env` (e `requiredEnv` quando precisar de env obrigatório).

- **`database/`**
  - **`client.ts`** — Cliente Prisma: `getPrisma()`, `connectDatabase()`, `disconnectDatabase()`, `hasDatabase()`.
  - **`migrations/`** — Migrations do Prisma.
  - **`seed/`** — Scripts de seed (opcional).

- **`http/`**
  - **`types.ts`** — Tipos HTTP da app (ex.: `AuthenticatedRequest`).
  - **`errors.ts`** — Erros HTTP: `AppError`, `HttpError(HttpStatus.NotFound, '...')`, `NotFoundError`, `ForbiddenError`, etc.
  - **`response.ts`** — Helpers de resposta: `sendOk`, `sendCreated`, `sendError`, `sendPaginated`, etc.

- **`utils/`**
  - **`logger.ts`** — Logger (pino).
  - **`crypto.ts`** — Hash e tokens (ex.: senha).
  - **`login-rate-limit.ts`** — Rate limit de login: 3 tentativas inválidas → bloqueio por 15 min (por email).

**Resumo:** em `core/` ficam config, DB, contrato HTTP (erros/respostas) e utilitários; sem regras de negócio específicas de um módulo.

---

### `modules/` — Domínio por responsabilidade

Cada módulo é um “bounded context”: **routes** (HTTP), **service** (lógica), **repository** (persistência), **schema** (validação).

- **`auth/`**
  - **`auth.routes.ts`** — `POST /login` (público, com rate limit de login), `GET /me` (autenticado, exemplo de rota protegida).
  - **`auth.service.ts`** — Login (com rate limit 3 tentativas / 15 min), `getProfile`.
  - **`auth.repository.ts`** — Acesso a usuário por email/id (Prisma).
  - **`auth.schema.ts`** — JSON Schema do body de login (e outros que precisar).

- **`users/`**
  - **`users.routes.ts`** — `POST /` (criar conta — rota pública).
  - **`users.service.ts`** — Criar usuário (hash de senha, verificação de email já existente).
  - **`users.repository.ts`** — Create e findByEmail (Prisma).
  - **`users.schema.ts`** — Schema do body de criação de usuário.

Para novos módulos (game, store, achievements): crie uma pasta em `modules/` com o mesmo padrão (routes, service, repository, schema) e registre as rotas em `app/routes.ts`.

**Resumo:** em `modules/` fica a regra de negócio e a API HTTP de cada domínio; cada módulo pode crescer sem misturar com os outros.

---

### `shared/` — Middlewares, validators, helpers, tipos e constantes globais

Coisas usadas por vários módulos ou pela app, sem pertencer a um domínio só. Cada conceito em sua própria pasta para facilitar testes e evolução.

- **`middlewares/`** — Um middleware por pasta:
  - **`auth/`** — `auth.middleware.ts` (verifica JWT, anexa `request.userId`), `index.ts`. Uso: `onRequest: [authMiddleware]`.

- **`validators/`** — Um validator por pasta:
  - **`token/`** — `token.validator.ts` (`isBearerToken`, `extractBearerToken`), `index.ts`.

- **`helpers/`** — Helpers reutilizáveis por domínio:
  - **`pagination/`** — `types.ts` (`PaginationQuery`, `PaginatedResult`), `pagination.helper.ts` (`normalizePagination`, `toPaginatedResult`), `index.ts`.

- **`enums/`** — Enums organizados por contexto:
  - **`http/`** — `status.ts` (`HttpStatus`), `error-codes.ts` (`HttpErrorCode`), `index.ts`.

- **`types/`** — `global.d.ts` (ex.: `FastifyRequest.userId`).

- **`constants/`** — Constantes globais (ex.: `API_PREFIX`, `DEFAULT_PAGE_SIZE`, `MAX_PAGE_SIZE`).

**Resumo:** em `shared/` nada fica solto; cada middleware, validator ou helper vive em sua pasta, o que facilita testes e manutenção.

---

## Rotas

| Método | Rota | Autenticação | Descrição |
|--------|------|--------------|-----------|
| GET | `/health` | Não | Health check |
| POST | `/api/v1/users` | Não | Criar conta (público) |
| POST | `/api/v1/auth/login` | Não | Login (rate limit: 3 tentativas / 15 min) |
| GET | `/api/v1/auth/me` | Sim (Bearer) | Perfil do usuário logado (exemplo de rota autenticada) |

---

## Erros HTTP (estilo AWS)

As respostas de erro seguem o formato:

```json
{
  "error": {
    "code": "NotFound",
    "message": "Usuário não encontrado",
    "statusCode": 404
  }
}
```

No código você pode usar:

- `throw new NotFoundError('Usuário não encontrado');`
- `throw new ForbiddenError();`
- `throw HttpError(HttpStatus.NotFound, 'Recurso não encontrado');`

O `error-handler` global traduz isso na resposta acima.

---

## Login e rate limit

- **3 tentativas inválidas** (por email) → bloqueio de **15 minutos**.
- Mensagem de erro 429: `"Muitas tentativas. Tente novamente em X minuto(s)."`

---

## Docker e Prisma

### Desenvolvimento (API local + Postgres no Docker)

```bash
cp .env.example .env
# Ajuste DATABASE_URL se precisar (padrão: postgresql://postgres:postgres@localhost:5432/yasapi)

docker compose -f docker-compose.dev.yml up -d   # sobe só o Postgres
npm install
npm run db:generate
npm run db:migrate:dev                            # cria/migra o schema
npm run dev
```

### Produção (API + Postgres no Docker)

```bash
docker compose up -d
# A API sobe na porta 8080 e usa o Postgres do compose.
```

Na primeira vez (ou após novas migrations), aplique o schema:

```bash
docker compose exec api npx prisma migrate deploy
```

---

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Sobe a API em modo watch (tsx) |
| `npm run build` | Gera Prisma client e compila TypeScript |
| `npm run start` | Roda a API compilada |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:migrate` | Aplica migrations (deploy) |
| `npm run db:migrate:dev` | Cria/aplica migrations em dev |
| `npm run db:studio` | Abre o Prisma Studio |

---

## Imports e path mapping

Os imports usam **path mapping** (aliases), sem extensão `.js`:

- `@app/*` → `src/app/*`
- `@core/*` → `src/core/*`
- `@modules/*` → `src/modules/*`
- `@shared/*` → `src/shared/*`

Exemplos: `import { env } from '@core/config'`, `import { authMiddleware } from '@shared/middlewares'`.

No build, o `tsc-alias` reescreve esses aliases para caminhos relativos no `dist/`, para o Node resolver corretamente em produção.

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NODE_ENV` | Não | `development` / `production` |
| `PORT` | Não | Porta da API (default: 8080) |
| `HOST` | Não | Host (default: 0.0.0.0) |
| `JWT_SECRET` | Não | Segredo do JWT (default em dev) |
| `DATABASE_URL` | Sim (para auth/users) | URL do Postgres (ex.: `postgresql://postgres:postgres@localhost:5432/yasapi`) |

Sem `DATABASE_URL`, a API sobe, mas login e criação de conta não persistem (repositórios retornam null / não configurado).

---

## Resumo da arquitetura

- **Plugins** (`app/plugins/`): configuração do Fastify (JWT, CORS, Swagger, rate-limit).
- **Core** (`core/`): config, banco (Prisma), HTTP (erros/respostas), utils e rate limit de login.
- **Modules** (`modules/`): domínio por módulo (auth, users, e futuros); cada um com routes, service, repository e schema.
- **Shared** (`shared/`): middlewares (auth), validators (token), tipos, constantes e enums globais.

Isso mantém a base escalável e limpa para adicionar novos módulos sem virar bagunça.
