# Tech Debt

> Last audited: 2026-04-22

## P1 — High

| Rule             | File/Area                                                                          | Issue                                                                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| reusability      | `apps/flow-web/src/modules/AuthGuard/`                                             | Duplicates `useAuthGuard`, `AuthGuard.types.ts`, `AuthGuard.utils.ts` already in `services/auth-guard/`; `index.ts` re-exports from services but sibling files are redundant copies |
| forms-validation | `apps/flow-web/src/modules/JoinWorkspaceDialog/JoinWorkspaceDialog.schema.ts`      | Valibot form schema lives under `modules/`; should be in `services/` per convention                                                                                                 |
| i18n             | `apps/login-web/src/modules/CreateAccount/CreateAccountForm/CreateAccountForm.tsx` | Name validation error uses `tCreateAccount('nameLabel')` instead of a dedicated validation message key                                                                              |

## P2 — Medium

| Rule                | File/Area                                                 | Issue                                                                                   |
| ------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| component-structure | `apps/flow-web/src/modules/ContentTab/AiChatPanel.tsx`    | Not in its own `AiChatPanel/` folder with prescribed file set and `index.ts` barrel     |
| component-structure | `apps/flow-web/src/modules/ContentTab/QuizPlayer.tsx`     | Not in its own `QuizPlayer/` folder with prescribed file set and `index.ts` barrel      |
| component-structure | `apps/flow-web/src/modules/PendingTab/PendingCard.tsx`    | Not in its own `PendingCard/` folder with prescribed file set and `index.ts` barrel     |
| component-structure | `apps/core-web/src/modules/AuthGuard/ContentSkeleton.tsx` | Not in its own `ContentSkeleton/` folder with prescribed file set and `index.ts` barrel |
| component-structure | `apps/login-web/src/modules/CreateAccount/SignInLink/`    | Missing `SignInLink.types.ts`                                                           |
| testing-tdd         | `apps/flow-web/src/modules/ContentTab/useContentTab.ts`   | Hook has no corresponding `useContentTab.test.ts`                                       |
| testing-tdd         | `apps/components-web/src/utils/icon.utils.ts`             | Public `IconSize` export has no co-located unit test                                    |
| i18n                | `apps/login-web/src/i18n/locales/es/`                     | Spanish locale files exist but are not registered in `i18n.config.ts`                   |
| clean-code          | `apps/flow-web/package.json`                              | Unused `zustand` dependency (no imports in `src/`)                                      |
| clean-code          | `apps/login-web/package.json`                             | Unused `zustand` dependency (no imports in `src/`)                                      |

## P3 — Low

| Rule               | File/Area                                                           | Issue                                                                                                  |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| ui-quality         | `apps/flow-web/src/modules/PendingTab/PendingCard.tsx`              | `TASK_LABEL_VARIANT` uses `Record<string, …>` with string keys instead of a typed enum                 |
| clean-code         | `apps/flow-web/src/modules/ContentTab/useContentTab.ts`             | Type assertions (`as QuestionData`, `as ContentGuide`) instead of narrowing or typed service outputs   |
| clean-code         | `apps/flow-web/src/modules/ContentTab/ContentTab.tsx`               | Passes `contentId` and `identificationNumber` with `as string` though upstream values may be null      |
| design-tokens      | `apps/core-web/src/modules/Channels/Channels.module.scss`           | Grid uses `minmax(14rem, 1fr)` — raw layout number not in a named CSS var                              |
| i18n               | `apps/login-web/src/index.tsx`                                      | Hardcoded English error string `'Root element not found'`                                              |
| nestjs-conventions | `apps/guardian-server/src/modules/firebase/firebase.module.ts`      | Monorepo root discovered via `resolve(__dirname, '../../../../..')` — brittle relative path            |
| clean-code         | `apps/guardian-server/src/modules/validation/validation.service.ts` | Loose typing with `Record<string, unknown>` and `as never[]` for Brain responses instead of typed DTOs |
| monorepo-structure | `libs/llm-services/package.json`                                    | Missing `"type": "module"` unlike sibling `cloud-services`                                             |
