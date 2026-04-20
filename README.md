# Primer Guidy

AI-powered educational platform that generates personalized quizzes, homework, and guided chat for students. Built with NestJS servers for LLM orchestration, React SPAs for teachers and students, and Firebase for auth, database, and hosting.

## Architecture Overview

```
                         ┌─────────────────────────────────────────────┐
                         │              Firebase Cloud                 │
                         │  Auth · Realtime DB · Firestore · Hosting   │
                         │           Cloud Functions (v2)              │
                         └──────────────┬──────────────────────────────┘
                                        │
               ┌────────────────────────┼────────────────────────┐
               │                        │                        │
         ┌─────▼─────┐           ┌──────▼─────┐          ┌──────▼─────┐
         │ login-web  │           │  core-web  │          │  flow-web  │
         │  Student   │           │  Teacher   │          │  Student   │
         │  Login     │           │  Dashboard │          │  Learning  │
         │  :3001     │           │  :3002     │          │  :3003     │
         └────────────┘           └──────┬─────┘          └──────┬─────┘
                                         │                       │
                                         └───────────┬───────────┘
                                                     │
                                        ┌────────────▼────────────┐
                                        │  guardian-server         │
                                        │  (:3010)                │
                                        │  Safety guard           │
                                        │  Prompt curation        │
                                        └────────────┬────────────┘
                                                     │
                                        ┌────────────▼────────────┐
                                        │  brain-server (:3011)   │
                                        │  Chat generation        │
                                        │  Quiz generation        │
                                        │  Homework generation    │
                                        └────────────┬────────────┘
                                                     │
                                        ┌────────────▼────────────┐
                                        │  Anthropic Claude API   │
                                        │  Haiku (guard/curation) │
                                        │  Sonnet (generation)    │
                                        └─────────────────────────┘
```

## Quick Start

### Prerequisites

- **Node.js** >= 22 (see `.nvmrc`)
- **pnpm** >= 10
- **Anthropic API key**

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values. The key variables are:

| Variable            | Purpose                                            | Default                 |
| ------------------- | -------------------------------------------------- | ----------------------- |
| `ANTHROPIC_API_KEY` | Anthropic API key (required)                       | —                       |
| `ANTHROPIC_MODEL`   | Model for content generation                       | `claude-sonnet-4-6`     |
| `GUARD_MODEL`       | Model for safety classification                    | `claude-haiku-4-5`      |
| `CURATION_MODEL`    | Model for prompt rewriting                         | `claude-haiku-4-5`      |
| `BRAIN_API_KEY`     | Shared secret between validation and brain servers | —                       |
| `BRAIN_BASE_URL`    | Brain server URL (for validation server)           | `http://localhost:3011` |
| `TASK_CONCURRENCY`  | Max parallel LLM calls per request                 | `2`                     |
| `PUBLIC_FIREBASE_*` | Firebase project config (for web apps)             | —                       |

### 3. Run everything (dev proxy)

```bash
pnpm dev
```

This starts a **dev proxy on port 3000** that routes to all web apps:

| URL                                  | Target                  |
| ------------------------------------ | ----------------------- |
| `http://localhost:3000/login/`       | login-web (:3001)       |
| `http://localhost:3000/core/`        | core-web (:3002)        |
| `http://localhost:3000/flow/`        | flow-web (:3003)        |
| `http://localhost:3000/api/guardian` | guardian-server (:3010) |

The proxy **does not** start the NestJS servers. Run them separately:

```bash
# Terminal 2 — start brain server
pnpm dev:brain

# Terminal 3 — start guardian server
pnpm dev:guardian
```

### Run servers only (no web apps)

If you only need the backend:

```bash
# Terminal 1
pnpm dev:brain

# Terminal 2
pnpm dev:guardian
```

Both servers expose Swagger docs:

- Brain: `http://localhost:3011/docs`
- Guardian: `http://localhost:3010/docs`

### Run with Docker

```bash
pnpm docker:up
```

This starts brain-server and guardian-server via `docker-compose.yml`. Requires `ANTHROPIC_API_KEY` and `BRAIN_API_KEY` in your `.env`. Web apps are not containerized — run them with `pnpm dev` or individually.

```bash
pnpm docker:down   # stop all containers
```

## Project Structure

```
primer-guidy/
├── apps/
│   ├── login-web/                → Student login SPA
│   ├── core-web/                 → Teacher dashboard SPA
│   ├── flow-web/                 → Student learning SPA
│   ├── components-web/           → Shared React component library (design system)
│   ├── guardian-server/           → NestJS: safety guard + prompt curation
│   ├── brain-server/             → NestJS: LLM content generation
│   └── functions/                → Firebase Cloud Functions (auth, privileged writes)
├── libs/
│   ├── llm-services/             → LLM port/adapter abstraction (Anthropic Claude)
│   ├── nest-shared/              → Shared NestJS modules (guards, DTOs, metrics, LLM wiring)
│   ├── cloud-services/           → Firebase client abstraction for React (port/adapter)
│   ├── e2e-helpers/              → Playwright test utilities
│   ├── eslint-config/            → Shared ESLint flat config
│   └── stylelint-config/         → Shared Stylelint config
├── scripts/
│   └── dev-proxy.ts              → Local dev proxy (port 3000)
├── docker/
│   └── Dockerfile.server         → Shared multi-stage Dockerfile for NestJS servers
├── analysis/                     → Integration test suites
├── .cursor/rules/                → AI coding rules (29 rules)
└── .github/workflows/deploy.yml  → CI/CD pipeline
```

## Services & Roles

### Web Applications

| App                | Package                        | Port | Role                                                                                                                     |
| ------------------ | ------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------ |
| **login-web**      | `@primer-guidy/login-web`      | 3001 | Student authentication. Login and account creation flow. Communicates with Firebase Auth via Cloud Functions.            |
| **core-web**       | `@primer-guidy/core-web`       | 3002 | Teacher dashboard. Course management, student monitoring, quiz/homework creation. Calls guardian-server for AI features. |
| **flow-web**       | `@primer-guidy/flow-web`       | 3003 | Student learning interface. Takes quizzes, does homework, engages in guided AI chat within course context.               |
| **components-web** | `@primer-guidy/components-web` | —    | Shared React component library. Primer React design system. Not a standalone app.                                        |

**Stack:** Rsbuild + React 19 + TanStack Router + Primer React + SCSS Modules + Tailwind (layout only)

### Backend Servers

#### guardian-server (:3010)

Entry point for all AI requests from web apps. Validates, sanitizes, and routes prompts.

**Pipeline:**

```
Request → SanitizeInputPipe → SafetyGuardService → PromptCurationService → BrainClientService → Response
```

| Stage               | What it does                                                                     | LLM model              | Temperature |
| ------------------- | -------------------------------------------------------------------------------- | ---------------------- | ----------- |
| **Safety Guard**    | Classifies prompt as safe/unsafe. Rejects harmful, off-topic, or biased content. | Guard model (Haiku)    | 0           |
| **Prompt Curation** | Rewrites the user prompt for clarity and pedagogical alignment.                  | Curation model (Haiku) | 0.2         |
| **Brain Client**    | HTTP call to brain-server with the curated prompt. Merges downstream metrics.    | —                      | —           |

**Endpoints:**

- `POST /api/process` — Accepts `type: "chat"` or `type: "task-generator"` with discriminated DTOs

#### brain-server (:3011)

Content generation engine. Receives curated prompts from the validation server and generates educational content.

**Endpoints:**

| Endpoint                  | Purpose                                                  | Pipeline                               |
| ------------------------- | -------------------------------------------------------- | -------------------------------------- |
| `POST /api/chat`          | Guided student chat within course context                | System prompt + history + user message |
| `POST /api/task/quiz`     | Generate quiz (always 1 question, 4 options per student) | Guide generation → per-student fan-out |
| `POST /api/task/homework` | Generate homework (N questions, MC or open-ended)        | Guide generation → per-student fan-out |

**Task generation pipeline:**

```
1. Generate learning guide (single LLM call, low temperature, JSON mode)
2. Fan-out: generate unique content per student (bounded concurrency, retry with backoff)
3. Validate each student's output against Zod schema
4. Return guide + student contents + metrics
```

#### Firebase Cloud Functions

| Function       | Purpose                                                                       |
| -------------- | ----------------------------------------------------------------------------- |
| `studentLogin` | Verifies student credentials server-side (argon2id), issues custom auth token |

### Shared Libraries

| Library              | Package                          | Consumers                     | Purpose                                                                                                                                                                           |
| -------------------- | -------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **llm-services**     | `@primer-guidy/llm-services`     | brain-server, guardian-server | LLM abstraction. Port/adapter pattern with `ILlmProvider` interface. Anthropic Claude adapter. Factory pattern for future extensibility.                                          |
| **nest-shared**      | `@primer-guidy/nest-shared`      | brain-server, guardian-server | Shared NestJS building blocks: `LlmModule` (DI wiring), `MetricsCollector` (per-step token tracking), `ApiKeyGuard`, `SanitizeInputPipe`, shared DTOs, Swagger setup, env loader. |
| **cloud-services**   | `@primer-guidy/cloud-services`   | login-web, core-web, flow-web | Firebase client abstraction. Port/adapter for Auth, Realtime DB, Firestore, Functions. React Context + hooks for DI. Web apps never import `firebase/*` directly.                 |
| **e2e-helpers**      | `@primer-guidy/e2e-helpers`      | core-web, login-web           | Playwright utilities for E2E tests. Emulator setup, auth helpers.                                                                                                                 |
| **eslint-config**    | `@primer-guidy/eslint-config`    | All packages                  | Shared ESLint flat config with `base` and `nestServer` presets.                                                                                                                   |
| **stylelint-config** | `@primer-guidy/stylelint-config` | Web apps                      | Shared Stylelint rules (no margin, strict values, camelCase modules).                                                                                                             |

### Infrastructure

| Service                        | Role                                                            | Environment                     |
| ------------------------------ | --------------------------------------------------------------- | ------------------------------- |
| **Firebase Auth**              | Student and teacher authentication                              | Firebase project `guidy-app-ai` |
| **Firebase Realtime Database** | Real-time data (courses, students, progress)                    | Same project                    |
| **Firebase Firestore**         | Structured data storage                                         | Same project                    |
| **Firebase Hosting**           | Production web app hosting (`guidy-ai.web.app`)                 | Same project                    |
| **Firebase Cloud Functions**   | Server-side auth logic (credential verification)                | Node 22 runtime                 |
| **GitHub Pages**               | Preview/demo deployment (`<user>.github.io/primer-guidy/`)      | GitHub Actions                  |
| **Anthropic Claude**           | LLM inference (Haiku for guard/curation, Sonnet for generation) | API key                         |

### LLM Configuration

All servers use **Anthropic Claude** as the LLM provider. Model selection is per-role via env vars:

| Role             | Env var           | Default model       | Purpose                                   |
| ---------------- | ----------------- | ------------------- | ----------------------------------------- |
| **Generation**   | `ANTHROPIC_MODEL` | `claude-sonnet-4-6` | Content generation (chat, quiz, homework) |
| **Safety guard** | `GUARD_MODEL`     | `claude-haiku-4-5`  | Fast, cheap prompt classification         |
| **Curation**     | `CURATION_MODEL`  | `claude-haiku-4-5`  | Prompt rewriting for clarity              |

The architecture uses a factory pattern (`createLlmProvider`) to keep the adapter layer extensible for future providers.

## CI/CD Pipeline

```
push to main
    │
    ├── install
    ├── analyze (typecheck + lint + format)
    ├── test-unit (vitest)
    └── test-e2e (Playwright)
            │
            ├── deploy-pages → GitHub Pages (with /primer-guidy prefix)
            ├── deploy-backend → Firebase rules + functions
            └── deploy-hosting → Firebase Hosting (after backend succeeds)
```

- Backend deploys **before** frontend to ensure rules and functions are live before new client code
- E2E reports with videos and traces are published to GitHub Pages
- All deployments are automated — no manual deploys

## Available Scripts

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start dev proxy + all web apps on port 3000  |
| `pnpm dev:brain`    | Start brain-server on port 3011              |
| `pnpm dev:guardian` | Start guardian-server on port 3010           |
| `pnpm dev:core`     | Start core-web only                          |
| `pnpm dev:login`    | Start login-web only                         |
| `pnpm dev:flow`     | Start flow-web only                          |
| `pnpm docker:up`    | Start servers via Docker Compose             |
| `pnpm docker:down`  | Stop Docker containers                       |
| `pnpm build`        | Build all packages                           |
| `pnpm test`         | Run all unit tests                           |
| `pnpm test:e2e`     | Run all E2E tests                            |
| `pnpm test:rules`   | Run Firebase security rules tests            |
| `pnpm typecheck`    | TypeScript type checking across all packages |
| `pnpm lint`         | ESLint across all packages                   |
