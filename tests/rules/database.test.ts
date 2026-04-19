import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ref, get, set } from 'firebase/database'

const RULES = readFileSync(resolve(__dirname, '../../database.rules.json'), 'utf8')
const PROJECT_ID = 'demo-rules-test'

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    database: { rules: RULES, host: '127.0.0.1', port: 9000 },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

afterEach(async () => {
  await testEnv.clearDatabase()
})

// ── Root deny ─────────────────────────────────────────────────

describe('root-level deny', () => {
  it('authenticated user cannot read root', async () => {
    const db = testEnv.authenticatedContext('user-1').database()
    await assertFails(get(ref(db, '/')))
  })

  it('authenticated user cannot write root', async () => {
    const db = testEnv.authenticatedContext('user-1').database()
    await assertFails(set(ref(db, '/'), { data: 'hack' }))
  })

  it('unauthenticated cannot read root', async () => {
    const db = testEnv.unauthenticatedContext().database()
    await assertFails(get(ref(db, '/')))
  })

  it('unauthenticated cannot write root', async () => {
    const db = testEnv.unauthenticatedContext().database()
    await assertFails(set(ref(db, '/'), { data: 'hack' }))
  })
})

// ── studentCredentials/{identificationNumber} ─────────────────

describe('studentCredentials/{identificationNumber}', () => {
  const PATH = 'studentCredentials/12345678'

  it('authenticated user cannot read credentials', async () => {
    const db = testEnv.authenticatedContext('user-1').database()
    await assertFails(get(ref(db, PATH)))
  })

  it('authenticated user cannot write credentials', async () => {
    const db = testEnv.authenticatedContext('user-1').database()
    await assertFails(set(ref(db, PATH), { password: 'hash', uid: 'uid-1' }))
  })

  it('unauthenticated cannot read credentials', async () => {
    const db = testEnv.unauthenticatedContext().database()
    await assertFails(get(ref(db, PATH)))
  })

  it('unauthenticated cannot write credentials', async () => {
    const db = testEnv.unauthenticatedContext().database()
    await assertFails(set(ref(db, PATH), { password: 'hash', uid: 'uid-1' }))
  })
})

// ── codes/{code} ──────────────────────────────────────────────

describe('codes/{code}', () => {
  const PATH = 'codes/ABC1234567'

  it('authenticated user can read code', async () => {
    const db = testEnv.authenticatedContext('teacher-1').database()
    await assertSucceeds(get(ref(db, PATH)))
  })

  it('authenticated user can write code', async () => {
    const db = testEnv.authenticatedContext('teacher-1').database()
    await assertSucceeds(set(ref(db, PATH), { uid: 'teacher-1' }))
  })

  it('unauthenticated cannot read code', async () => {
    const db = testEnv.unauthenticatedContext().database()
    await assertFails(get(ref(db, PATH)))
  })

  it('unauthenticated cannot write code', async () => {
    const db = testEnv.unauthenticatedContext().database()
    await assertFails(set(ref(db, PATH), { uid: 'teacher-1' }))
  })
})

// ── userCodes/{uid} ───────────────────────────────────────────

describe('userCodes/{uid}', () => {
  const OWNER_UID = 'teacher-1'
  const PATH = `userCodes/${OWNER_UID}`

  it('owner can read own code', async () => {
    const db = testEnv.authenticatedContext(OWNER_UID).database()
    await assertSucceeds(get(ref(db, PATH)))
  })

  it('owner can write own code', async () => {
    const db = testEnv.authenticatedContext(OWNER_UID).database()
    await assertSucceeds(set(ref(db, PATH), 'ABC1234567'))
  })

  it('other authenticated user cannot read code', async () => {
    const db = testEnv.authenticatedContext('other-user').database()
    await assertFails(get(ref(db, PATH)))
  })

  it('other authenticated user cannot write code', async () => {
    const db = testEnv.authenticatedContext('other-user').database()
    await assertFails(set(ref(db, PATH), 'HACKED'))
  })

  it('unauthenticated cannot read code', async () => {
    const db = testEnv.unauthenticatedContext().database()
    await assertFails(get(ref(db, PATH)))
  })

  it('unauthenticated cannot write code', async () => {
    const db = testEnv.unauthenticatedContext().database()
    await assertFails(set(ref(db, PATH), 'HACKED'))
  })
})

// ── Undefined nodes ───────────────────────────────────────────

describe('undefined nodes', () => {
  it('authenticated cannot read undefined node', async () => {
    const db = testEnv.authenticatedContext('user-1').database()
    await assertFails(get(ref(db, 'secretNode/data')))
  })

  it('authenticated cannot write undefined node', async () => {
    const db = testEnv.authenticatedContext('user-1').database()
    await assertFails(set(ref(db, 'secretNode/data'), { hack: true }))
  })
})
