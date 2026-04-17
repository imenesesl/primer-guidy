# Tech Debt

> Last audited: 2026-04-17

## P1 — High

| Rule             | File/Area                               | Issue                                                                                                                                                              |
| ---------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| web-architecture | `apps/flow-web/src/routes/learning.tsx` | Route file defines a local `LearningRoute` component with mock data (`MOCK_STUDENT_NAME`) — routes should only use `createFileRoute` and delegate UI to `modules/` |

## P2 — Medium

| Rule        | File/Area                                                                     | Issue                                                                             |
| ----------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| testing-tdd | `apps/core-web/src/services/user/user.hooks.ts`                               | Missing `user.hooks.test.ts` for TanStack Query hooks                             |
| testing-tdd | `apps/login-web/src/services/user/user.hooks.ts`                              | Missing `user.hooks.test.ts` for TanStack Query hooks                             |
| testing-tdd | `apps/flow-web/src/services/student/student.hooks.ts`                         | Missing `student.hooks.test.ts` for TanStack Query hooks                          |
| testing-tdd | `apps/login-web/src/utils/url.utils.ts`                                       | Missing `url.utils.test.ts`                                                       |
| testing-tdd | `apps/core-web/src/i18n/i18n.config.ts`                                       | Missing test file for i18n config                                                 |
| testing-tdd | `apps/flow-web/src/i18n/i18n.config.ts`                                       | Missing test file for i18n config                                                 |
| testing-tdd | `apps/components-web/src/components/templates/AppProviders/ThemedContent.tsx` | Missing `ThemedContent.test.tsx`                                                  |
| i18n        | `apps/login-web/src/modules/LinkSentView/LinkSentView.tsx`                    | Uses bare `t` instead of renamed binding (e.g. `tLogin`)                          |
| i18n        | `apps/flow-web/src/i18n/i18n.config.ts`                                       | Spanish locale files exist under `locales/es/` but aren't loaded in the i18n init |
| clean-code  | `apps/flow-web/src/routes/routes.ts`                                          | `FlowRoutes` is exported but never imported anywhere                              |
| clean-code  | `apps/flow-web/src/styles/_breakpoints.scss`                                  | File is never imported or referenced                                              |

## P3 — Low

| Rule        | File/Area                                                                                          | Issue                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| reusability | `apps/login-web/src/modules/Login/VerifyingView.tsx` + `CreateAccount/CreatingView.tsx`            | Near-identical layout (Spinner + Text in card) — could be a shared component |
| reusability | `apps/login-web/src/modules/Login/GoogleSignInButton.tsx` + `CreateAccount/GoogleSignUpButton.tsx` | Near-identical structure — could be unified into a single `GoogleAuthButton` |
| reusability | `apps/flow-web/src/modules/Home/LoginForm/LoginForm.tsx` + `RegisterForm/RegisterForm.tsx`         | Near-duplicate form structure — could share a base form primitive            |
| clean-code  | `apps/core-web/src/modules/Channels/tabs/GeneralTab/GeneralTab.types.ts`                           | `GeneralTabProps` exported but unused                                        |
| clean-code  | `apps/core-web/src/modules/Channels/tabs/AnnouncementsTab/AnnouncementsTab.types.ts`               | `AnnouncementsTabProps` exported but unused                                  |
| i18n        | `apps/core-web/src/modules/Shell/ContentHeader.utils.ts`                                           | Breadcrumb separator `' · '` is hardcoded instead of using `t()`             |
