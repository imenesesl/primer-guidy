# Tech Debt

## P0 — Critical

| Rule                    | File/Area         | Issue                                                                                            |
| ----------------------- | ----------------- | ------------------------------------------------------------------------------------------------ |
| deployment-github-pages | `apps/core-web/`  | No SPA fallback `404.html` in build output — client-side routing will break on direct URL access |
| deployment-github-pages | `apps/login-web/` | No SPA fallback `404.html` in build output — client-side routing will break on direct URL access |
