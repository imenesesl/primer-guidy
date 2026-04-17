# Audit Checklist — All 26 Rules

Reference file for the Rules Auditor skill. Each section maps to one `.mdc` rule.

---

## 1. monorepo-structure

- NO `.js` / `.jsx` files — TypeScript only
- Every package has `tsconfig.json` extending root
- `strict: true` in all tsconfigs
- No `any` type — use `unknown` + type guards
- Package names: `@primer-guidy/<name>` kebab-case
- Web apps suffix `-web`, servers suffix `-server`
- Root `package.json` has `dev:<name>` per web app — no generic `dev`
- Web apps have NO local `components/` — all UI from `@primer-guidy/components-web`
- Web apps NEVER import from `firebase/*` — only `@primer-guidy/cloud-services`

## 2. web-architecture

- Web apps have ONLY: `routes/`, `modules/`, `services/`, `i18n/`, `utils/`, `hooks/`, `context/`, `styles/`, `test/`
- `utils/` contains app-specific pure helpers — NO SVG icons (icons live in `components-web/atoms/Icons`)
- `routes/` files: ONLY `createFileRoute` — no UI or business logic
- `routes/` import ONLY from `modules/`
- `modules/` import from `@primer-guidy/components-web`, `@primer/react`, `services/`, `utils/`
- Components (in components-web) NEVER import from `services/` or `modules/`
- No circular dependencies between layers
- Web apps NEVER import from local `components/` or `stores/`

## 3. component-structure

- Every component has its own folder with ALL required files: `.tsx`, `.module.scss`, `.types.ts`, `.test.tsx`, `index.ts`
- `.utils.ts` is OPTIONAL — create ONLY when needed, NEVER create empty files
- Types NEVER inline in `.tsx` — always in `.types.ts`
- NO `export default` (exceptions: i18next config, `*.d.ts`)
- `index.ts` is the ONLY entry point — no imports from internal files outside folder
- Components NEVER accept `className`, `style`, or styling props — `variant` only
- **Icons Atom exception**: `atoms/Icons/` groups multiple SVG icon components in a single folder — one `.tsx` file per icon, shared `Icons.types.ts`, single `Icons.test.tsx`, no `.module.scss`
- ALL custom SVG icons MUST live in `components-web/atoms/Icons/` — NEVER in app modules or utils
- Brand icon colors (e.g., Google logo hex values) are an accepted exception to the `--primer-*`-only color rule

## 4. atomic-design

- `components-web` follows 4 levels: `atoms/`, `molecules/`, `organisms/`, `templates/`
- NO `pages/` level — modules replace pages
- Atoms: single UI element, NO business logic, NO state, NO service imports
- Molecules: combine 2+ atoms, minimal local state only
- Organisms: compose molecules/atoms, data via props, NEVER import services
- Templates: layout with slots, NO data fetching, NO business logic
- Components are pure UI — NEVER import from `services/` or `modules/`

## 5. services-layer

- Full services (async I/O) have: `.service.ts`, `.hooks.ts`, `.types.ts`, `.service.test.ts`, `index.ts`
- Schema-only services (validation only) have: `.types.ts`, `index.ts` — no `.service.ts`, `.hooks.ts`, or tests needed
- Types (Response, Request, Payload) NEVER defined outside `services/`
- Service functions: pure async — no React, no hooks, no side effects
- Hooks: thin TanStack Query (`useQuery`/`useMutation`) or `useSubscription` wrappers — no business logic
- Hooks resolve their own providers via `useFirestore()`, `useAuth()`, etc. — NEVER pass providers as arguments
- Use `useQuery` for cacheable reads, `useMutation` for writes/actions, `useSubscription` for real-time listeners
- One hook per operation (GET, POST, PATCH, DELETE)
- `index.ts` re-exports all functions, hooks, and types

## 6. clean-code

- No unused imports, variables, functions, types
- No commented-out code
- No unreachable code (after return/throw/break)
- No empty files with placeholder comments
- Type-only imports use `import type`

## 7. solid-principles

- Each file/class/function does ONE thing (SRP)
- No function names with "and" doing multiple things
- Extend via composition/interfaces, not modifying existing code (OCP)
- Large interfaces split into focused ones (ISP)
- Depend on abstractions, not concretions (DIP)

## 8. dependency-injection

- NEVER `new` inside class/component (except composition root)
- Every service/repository has a corresponding interface
- React: services injected via Context
- NestJS: services injected via constructor

## 9. i18n

- ZERO hardcoded user-visible strings in JSX — all via `t()`
- Default language: English only (`en/`)
- Namespace per module, `common` for shared keys
- `t` NEVER bare — always renamed: `tCommon`, `tDashboard`, etc.
- Translations NOT passed via props — `useTranslation` directly
- Keys semantic: `actions.save`, NOT `btn1`
- Interpolations descriptive: `{{userName}}`, NOT `{{0}}`

## 10. styling-conventions

- ALL styles in `.module.scss` — never in `.tsx`
- Every `.module.scss` starts with `@reference "tailwindcss/theme"` and `@reference "tailwindcss/utilities"`
- Layout/spacing/sizing via Tailwind `@apply`
- ALL colors via `--primer-*` CSS custom properties
- No hardcoded hex/rgb/hsl
- No `filter: brightness()` — use Primer canvas layering
- No Primer CSS vars directly (`--bgColor-*`) — use `--primer-*`
- Conditional classes: `clsx` with object syntax — no template literals
- No `style` prop except for `--primer-*` theme vars
- No margin — use padding or gap
- Responsive: mobile-first, breakpoint mixins, no hardcoded values
- Doubled selectors consistent across media queries

## 11. design-tokens

- Zero magic numbers in SCSS — extract to named CSS custom properties
- Zero magic numbers in TS/TSX — extract to named constants (0, 1, -1 allowed)
- No raw CSS when Tailwind has a utility (opacity, display, transitions, sizing)
- No raw CSS transitions — use `@apply transition-*`
- No custom SCSS token files (exception: `_breakpoints.scss`)
- Global layout tokens in `:root` CSS vars
- State statuses: enums, not strings
- Route paths: `as const` objects, not hardcoded strings
- Error codes: enums, not strings

## 12. primer-react

- ALL UI uses `@primer/react` — no duplicating Primer
- Primer components over native HTML: `Button` not `<button>`, `Text` not `<span>/<p>`, `Heading` not `<h1>-<h6>`
- Native HTML only for: `<div>`, `<nav>`, `<aside>`, `<main>`, `<section>`, `<header>`, `<footer>`, `<form>`
- Atoms wrap Primer with full file structure
- No overriding Primer internal colors

## 13. github-dark-ui

- Canvas layering: `canvas.inset` → `canvas.default` → `canvas.subtle`
- Correct text token pairing (WCAG AA)
- `neutral.emphasisPlus` ONLY for navigation chrome
- No `filter: brightness()`
- Primer `<Button>` colors NEVER overridden
- Primer primitives CSS in `global.css` BEFORE Tailwind
- `buildThemeVars` from `components-web` — not duplicated

## 14. smooth-ux

- Every interactive element has `transition-*` via Tailwind
- Every clickable element has `:hover` state
- No raw CSS transitions
- No raw CSS opacity/scale — use `@apply`

## 15. ui-quality

- Every clickable element: `cursor: pointer`
- Every disabled element: `cursor: not-allowed`
- All text meets WCAG AA contrast
- Correct token pairing (see contrast table in rule)
- Disabled elements shown dimmed, not hidden
- Focus states visible
- Dark surface text: explicit color set
- Large modules decomposed: hook + sub-components + thin orchestrator
- Status values: enums, not magic strings

## 16. testing-tdd

- Every component, hook, utility, service has `.test.tsx` or `.test.ts`
- Tests use `screen`, `render`, `userEvent`
- Query priority: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- Tests independent — no shared state
- E2E in `e2e/` per app, using `@primer-guidy/e2e-helpers`
- E2E infrastructure NOT duplicated

## 17. forms-validation

- `react-hook-form` for form state — NEVER `useState` for fields
- `valibot` for schemas — never manual validation
- Schemas in `services/` — never in components
- Form types via `v.InferOutput`
- `onSubmit` via props — never internal submission

## 18. react-routing-state

- TanStack Router file-based in `src/routes/`
- Route constants: `as const` objects — NOT enums
- No hardcoded path strings
- Server state: TanStack Query — never `useEffect` + `fetch`
- Client state: Zustand only for UI state
- Server state NEVER in Zustand

## 19. cloud-services

- Web apps NEVER import `firebase/*`
- Import ONLY from `@primer-guidy/cloud-services`
- Port/Adapter: ports public, adapters private
- Use `createCloudServicesFromEnv` — NEVER `createCloudServices`
- Each port has own error types — no provider errors leaked

## 20. backend-ready-contracts

- Modules/components NEVER define domain data inline
- ALL domain data via typed props
- Composition root decides data source
- Swap test: mock → real API = ZERO module/component changes

## 21. reusability

- Every component reusable across contexts
- No copy-pasted code — extract shared logic
- Helpers: pure functions, typed I/O
- Hooks accept dependencies via parameters

## 22. linting-formatting

- ESLint: no `any`, no unused vars, consistent-type-imports, no-magic-numbers
- Prettier: singleQuote, no semi, trailing commas
- Stylelint: no margin, camelCase selectors, no `!important`
- No inline lint disable without justification

## 23. database-schemas

- Every Firestore collection / Realtime node has `.schema.json`
- TypeScript types match schema exactly
- Schema updated FIRST on database changes

## 24. deployment-github-pages

- No hardcoded base paths — use `DEPLOY_PREFIX`
- New apps registered in `apps-registry.json`

## 25. nestjs-conventions

- Module structure: `module.ts`, `controller.ts`, `service.ts`, `repository.ts`, `interfaces/`, `dto/`, `guards/`
- Controllers NEVER access repositories
- Services NEVER handle HTTP concerns
- Separate Create/Update/Response DTOs

## 26. backend-ready-contracts (additional)

- Service types from `services/` define the contract
- Props types reference or extend service types
- When creating a module: "What data will this need from a backend?" = your props
