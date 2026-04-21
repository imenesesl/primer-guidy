# Tech Debt

> Last audited: 2026-04-20

## P1 — High

| Rule                | File/Area                                                                  | Issue                                                                               |
| ------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| web-architecture    | `apps/core-web/src/modules/Activity/Activity.tsx`                          | Cross-module import: imports `TabLayout` from `@/modules/TabLayout`                 |
| web-architecture    | `apps/core-web/src/modules/Directories/Directories.tsx`                    | Cross-module import: imports `TabLayout` from `@/modules/TabLayout`                 |
| web-architecture    | `apps/core-web/src/modules/ContentTab/ContentTab.tsx`                      | Cross-module import: imports `GeneratorForm` from `@/modules/GeneratorForm`         |
| web-architecture    | `apps/core-web/src/modules/ShellGuard/ShellGuard.tsx`                      | Cross-module import: imports `useAuthGuard` from `@/modules/AuthGuard`              |
| web-architecture    | `apps/core-web/src/modules/Activity/Activity.utils.ts`                     | Imports `CoreRoutes` from `@/routes/routes`; modules must not import from `routes/` |
| web-architecture    | `apps/core-web/src/modules/Directories/Directories.utils.ts`               | Imports `CoreRoutes` from `@/routes/routes`; modules must not import from `routes/` |
| web-architecture    | `apps/core-web/src/modules/ShellGuard/ShellGuard.utils.ts`                 | Imports `CoreRoutes` from `@/routes/routes`; modules must not import from `routes/` |
| react-routing-state | `apps/core-web/src/modules/ChannelLayout/ChannelLayout.tsx`                | Hardcoded path strings for content/ai tab navigation                                |
| react-routing-state | `apps/core-web/src/routes/_shell/channels/$channelId/index.tsx`            | Hardcoded redirect path string                                                      |
| react-routing-state | `apps/flow-web/src/modules/ChannelLayout/ChannelLayout.tsx`                | Hardcoded path segments (`/quizes`, `/tasks`) and template-literal URL construction |
| react-routing-state | `apps/flow-web/src/routes/_shell/tasks/$workspaceId/$channelId/index.tsx`  | Hardcoded redirect path string                                                      |
| react-routing-state | `apps/flow-web/src/routes/_shell/quizes/$workspaceId/$channelId/index.tsx` | Hardcoded redirect path string                                                      |
| testing-tdd         | `apps/core-web/src/services/channel/channel.hooks.ts`                      | Missing `channel.hooks.test.ts`                                                     |
| testing-tdd         | `apps/core-web/src/services/enrollment/enrollment.hooks.ts`                | Missing `enrollment.hooks.test.ts`                                                  |
| testing-tdd         | `apps/core-web/src/services/generator/generator.hooks.ts`                  | Missing `generator.hooks.test.ts`                                                   |
| testing-tdd         | `apps/core-web/src/services/invite-code/invite-code.hooks.ts`              | Missing `invite-code.hooks.test.ts`                                                 |
| testing-tdd         | `apps/flow-web/src/services/workspace/workspace.hooks.ts`                  | Missing `workspace.hooks.test.ts`                                                   |
| testing-tdd         | `apps/flow-web/src/services/channel/channel.hooks.ts`                      | Missing `channel.hooks.test.ts`                                                     |
| testing-tdd         | `apps/flow-web/src/services/student-auth/student-auth.service.ts`          | Missing `student-auth.service.test.ts`                                              |
| testing-tdd         | `apps/flow-web/src/modules/Home/AuthFormFields/AuthFormFields.tsx`         | Missing `AuthFormFields.test.tsx`                                                   |
| database-schemas    | `apps/flow-web/src/services/workspace/`                                    | Missing schema for RTDB `codes/{code}` node                                         |
| database-schemas    | `apps/flow-web/src/services/workspace/`                                    | Missing schema for Firestore `students/{id}/workspaces` subcollection               |

## P2 — Medium

| Rule                | File/Area                                                                        | Issue                                                                               |
| ------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| styling-conventions | `apps/core-web/src/modules/Directories/tabs/UsersTab/UsersTab.module.scss`       | `@use` precedes `@reference`; must start with `@reference` lines                    |
| styling-conventions | `apps/core-web/src/modules/Channels/Channels.module.scss`                        | `@use` precedes `@reference`; must start with `@reference` lines                    |
| styling-conventions | `apps/core-web/src/modules/ChannelLayout/ChannelLayout.module.scss`              | `@use` precedes `@reference`; must start with `@reference` lines                    |
| component-structure | `apps/core-web/src/modules/ContentTab/ContentCard.tsx`                           | Not in its own folder with dedicated types, scss, and index.ts                      |
| component-structure | `apps/flow-web/src/modules/ContentTab/ContentCard.tsx`                           | Not in its own folder with dedicated types, scss, and index.ts                      |
| component-structure | `apps/flow-web/src/modules/ContentTab/QuestionList.tsx`                          | Not in its own folder with dedicated types, scss, and index.ts                      |
| component-structure | `apps/flow-web/src/modules/JoinWorkspaceDialog/CodeInput.tsx`                    | Not in its own folder with dedicated types, scss, and index.ts                      |
| forms-validation    | `apps/core-web/src/modules/Channels/CreateChannelDialog/CreateChannelDialog.tsx` | Uses `useState` for form state instead of `react-hook-form` + `valibot`             |
| services-layer      | `apps/flow-web/src/services/workspace/workspace.hooks.ts`                        | `JoinWorkspaceArgs` defined inline in hooks file; should be in `workspace.types.ts` |
| clean-code          | `apps/flow-web/src/styles/_breakpoints.scss`                                     | File is never imported or referenced                                                |

## P3 — Low

| Rule          | File/Area                                               | Issue                                                      |
| ------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| design-tokens | `apps/flow-web/src/modules/ContentTab/QuestionList.tsx` | `LETTER_OFFSET = 65` magic number; use `'A'.charCodeAt(0)` |
