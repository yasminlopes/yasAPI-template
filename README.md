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
  - **`env.ts`** — Lê variáveis de ambiente (PORT, JWT_SECRET, DATABASE_URL, API_SECRET, etc.).
  - **`features.ts`** — Feature flags por ambiente (ex.: Swagger só em dev).
  - **`index.ts`** — Reexporta `env` e `features`.

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
  - **`dto/`** — Tipos de resposta do domínio auth (ex.: `LoginResponse`, `ProfileResponse`).

- **`users/`**
  - **`users.routes.ts`** — `POST /` (criar conta — rota pública).
  - **`users.service.ts`** — Criar usuário (hash de senha, verificação de email já existente).
  - **`users.repository.ts`** — Create e findByEmail (Prisma).
  - **`users.schema.ts`** — Schema do body de criação de usuário.
  - **`dto/`** — Tipos de resposta do domínio users (ex.: `UserResponse`, `UserCreateResponse`).

Para novos módulos (game, store, achievements): crie uma pasta em `modules/` com o mesmo padrão (routes, service, repository, schema) e registre as rotas em `app/routes.ts`.

**Resumo:** em `modules/` fica a regra de negócio e a API HTTP de cada domínio; cada módulo pode crescer sem misturar com os outros.

---

### `shared/` — Middlewares, validators, helpers, tipos e constantes globais

Coisas usadas por vários módulos ou pela app, sem pertencer a um domínio só. Cada conceito em sua própria pasta para facilitar testes e evolução.

- **`middlewares/`** — Um middleware por pasta:
  - **`auth/`** — Verifica JWT e anexa `request.userId`. Uso: `onRequest: [authMiddleware]`.
  - **`api-key/`** — Exige header `X-API-Key` quando `API_SECRET` está definido (rota `/health` isenta).

- **`validators/`** — Um validator por pasta:
  - **`token/`** — `token.validator.ts` (`isBearerToken`, `extractBearerToken`), `index.ts`.

- **`helpers/`** — Helpers reutilizáveis por domínio:
  - **`pagination/`** — `types.ts` (`PaginationQuery`, `PaginatedResult`), `pagination.helper.ts` (`normalizePagination`, `toPaginatedResult`), `index.ts`.

- **`enums/`** — Enums organizados por contexto:
  - **`http/`** — `status.ts` (`HttpStatus`), `error-codes.ts` (`HttpErrorCode`), `index.ts`.

- **`types/`** — Tipos compartilhados entre módulos (quando fizer sentido).

- **`constants/`** — Constantes globais (ex.: `API_PREFIX`, `DEFAULT_PAGE_SIZE`, `MAX_PAGE_SIZE`).

**Resumo:** em `shared/` nada fica solto; cada middleware, validator ou helper vive em sua pasta. DTOs e tipos de resposta da API ficam **dentro de cada módulo** (ex.: `modules/auth/dto/`, `modules/users/dto/`), para manter tudo do domínio no mesmo lugar.

---

## Rotas

| Método | Rota | Autenticação | Descrição |
|--------|------|--------------|-----------|
| GET | `/health` | Não (sempre isento de API key) | Health check (status app + DB); 200 ok, 503 degraded |
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
pnpm install
pnpm run db:generate
pnpm run db:migrate:dev                           # cria/migra o schema
pnpm dev
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
| `pnpm dev` | Sobe a API em modo watch (tsx) |
| `pnpm build` | Gera Prisma client e compila TypeScript |
| `pnpm start` | Roda a API compilada |
| `pnpm run db:generate` | Gera o Prisma Client |
| `pnpm run db:migrate` | Aplica migrations (deploy) |
| `pnpm run db:migrate:dev` | Cria/aplica migrations em dev |
| `pnpm run db:studio` | Abre o Prisma Studio |
| `ppnpm run db:seed` | Cria usuário de dev (dev@localhost / dev123) |
| `pnpm format` | Formata código com Prettier |
| `pnpm run format:check` | Verifica formatação sem alterar |

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
| `API_SECRET` | Não | Se definido, todas as requisições (exceto `/health`) devem enviar header `X-API-Key` com este valor |

Sem `DATABASE_URL`, a API sobe, mas login e criação de conta não persistem.  
Com `API_SECRET` definido, todas as requisições (exceto `GET /health`) devem enviar o header `X-API-Key` com o mesmo valor.

---

## Health check

`GET /health` retorna:

- **status:** `ok` ou `degraded` (degraded quando o DB está down).
- **database:** `ok` | `down` | `unconfigured`.
- **timestamp**, **version**.

Resposta 200 quando tudo ok; 503 quando `database === 'down'`.

---

## Header X-API-Key (segurança)

Se a variável `API_SECRET` estiver definida, a API exige o header **`X-API-Key`** em todas as requisições, com o mesmo valor. A rota `/health` é sempre isenta (para load balancers e probes).  
Em desenvolvimento, deixe `API_SECRET` vazio para não exigir o header.

---

## Validação com Zod

O body das rotas é validado com **Zod**. Em cada módulo, os schemas ficam em `*.schema.ts` (ex.: `loginBodySchema`, `createUserBodySchema`). Em caso de falha, a API responde 400 com código `ValidationError` e a mensagem do primeiro erro (ex.: "Email inválido"). Helper em `shared/helpers/validation` (`validateOrThrow`, `formatZodError`).

---

## Request ID

Toda requisição recebe um **`X-Request-Id`** na resposta. Se o cliente enviar esse header, o mesmo valor é repassado; caso contrário, é gerado um UUID. Útil para correlacionar logs e erros. Plugin em `app/plugins/request-id.ts`.

---

## Helmet (headers de segurança)

O **@fastify/helmet** adiciona headers de segurança (X-Content-Type-Options, X-Frame-Options, etc.). Registrado em `app/plugins/helmet.ts` com `contentSecurityPolicy: false` para evitar conflitos com Swagger; pode ser ajustado em produção.

---

## Feature flags

Em `core/config/features.ts`: flags por ambiente (ex.: `swagger` só em dev, `seedAllowed` em dev). Use para ligar/desligar Swagger, seeds ou outros comportamentos.

---

## Seed de desenvolvimento

```bash
pnpm run db:seed
```

Cria o usuário `dev@localhost` com senha `dev123` (se ainda não existir). Útil para login local sem cadastro manual.

---

## Lint, Prettier e Husky

- **ESLint** (flat config em ESM: `eslint.config.mjs`) + **Prettier** para código consistente.
- **Husky** + **lint-staged**: no `git commit`, rodam lint e formatação nos arquivos staged.

Comandos: `pnpm lint`, `pnpm format`, `pnpm run format:check`. O projeto usa **pnpm** (`packageManager` no `package.json`); use `corepack enable` se ainda não tiver pnpm.

---

## GitHub Actions

- **CI** (`.github/workflows/ci.yml`): em push/PR na `main`, roda lint, format check, typecheck e build.
- **Deploy EC2** (`.github/workflows/deploy.yml`): em push na `main`, roda CI, envia o código por rsync para a EC2 e sobe com `docker-compose up --build -d`.

Secrets no repositório: `EC2_KEY` (chave SSH privada), `EC2_HOST` (host da EC2). O deploy usa o diretório `/home/ec2-user/vida-br-api` na EC2; ajuste no workflow se usar outro path.

---

## Resumo da arquitetura

- **Plugins** (`app/plugins/`): configuração do Fastify (JWT, CORS, Swagger, rate-limit).
- **Core** (`core/`): config, banco (Prisma), HTTP (erros/respostas), utils e rate limit de login.
- **Modules** (`modules/`): domínio por módulo (auth, users, e futuros); cada um com routes, service, repository e schema.
- **Shared** (`shared/`): middlewares (auth), validators (token), tipos, constantes e enums globais.

Isso mantém a base escalável e limpa para adicionar novos módulos sem virar bagunça.
