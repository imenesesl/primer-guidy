import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'

const RULES = readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8')
const PROJECT_ID = 'demo-rules-test'

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: RULES, host: '127.0.0.1', port: 8080 },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

afterEach(async () => {
  await testEnv.clearFirestore()
})

// ── users/{uid} ────────────────────────────────────────────────

describe('users/{uid}', () => {
  const TEACHER_UID = 'teacher-1'

  it('owner can read own profile', async () => {
    const db = testEnv.authenticatedContext(TEACHER_UID).firestore()
    await assertSucceeds(getDoc(doc(db, `users/${TEACHER_UID}`)))
  })

  it('owner can write own profile', async () => {
    const db = testEnv.authenticatedContext(TEACHER_UID).firestore()
    await assertSucceeds(setDoc(doc(db, `users/${TEACHER_UID}`), { name: 'Alice', email: 'a@b.c' }))
  })

  it('other authenticated user cannot read another profile', async () => {
    const db = testEnv.authenticatedContext('other-user').firestore()
    await assertFails(getDoc(doc(db, `users/${TEACHER_UID}`)))
  })

  it('other authenticated user cannot write another profile', async () => {
    const db = testEnv.authenticatedContext('other-user').firestore()
    await assertFails(setDoc(doc(db, `users/${TEACHER_UID}`), { name: 'Hacker' }))
  })

  it('unauthenticated cannot read', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, `users/${TEACHER_UID}`)))
  })

  it('unauthenticated cannot write', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(setDoc(doc(db, `users/${TEACHER_UID}`), { name: 'Anon' }))
  })
})

// ── users/{uid}/channels/{channelId} ───────────────────────────

describe('users/{uid}/channels/{channelId}', () => {
  const TEACHER_UID = 'teacher-1'
  const CHANNEL_PATH = `users/${TEACHER_UID}/channels/ch-1`

  it('any authenticated user can read channels', async () => {
    const db = testEnv.authenticatedContext('student-1').firestore()
    await assertSucceeds(getDoc(doc(db, CHANNEL_PATH)))
  })

  it('owner can write channels', async () => {
    const db = testEnv.authenticatedContext(TEACHER_UID).firestore()
    await assertSucceeds(setDoc(doc(db, CHANNEL_PATH), { name: 'Math', active: true }))
  })

  it('non-owner cannot write channels', async () => {
    const db = testEnv.authenticatedContext('student-1').firestore()
    await assertFails(setDoc(doc(db, CHANNEL_PATH), { name: 'Hacked' }))
  })

  it('unauthenticated cannot read channels', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, CHANNEL_PATH)))
  })
})

// ── users/{uid}/students/{identificationNumber} ────────────────

describe('users/{uid}/students/{identificationNumber}', () => {
  const TEACHER_UID = 'teacher-1'
  const ENROLLMENT_PATH = `users/${TEACHER_UID}/students/12345678`

  it('any authenticated user can read enrollment', async () => {
    const db = testEnv.authenticatedContext('student-1').firestore()
    await assertSucceeds(getDoc(doc(db, ENROLLMENT_PATH)))
  })

  it('any authenticated user can create enrollment (student joins)', async () => {
    const db = testEnv.authenticatedContext('student-1').firestore()
    await assertSucceeds(setDoc(doc(db, ENROLLMENT_PATH), { name: 'Jane', status: 'inactive' }))
  })

  it('owner (teacher) can update enrollment', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), ENROLLMENT_PATH), {
        name: 'Jane',
        status: 'inactive',
      })
    })

    const db = testEnv.authenticatedContext(TEACHER_UID).firestore()
    await assertSucceeds(updateDoc(doc(db, ENROLLMENT_PATH), { status: 'active' }))
  })

  it('owner (teacher) can delete enrollment', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), ENROLLMENT_PATH), {
        name: 'Jane',
        status: 'inactive',
      })
    })

    const db = testEnv.authenticatedContext(TEACHER_UID).firestore()
    await assertSucceeds(deleteDoc(doc(db, ENROLLMENT_PATH)))
  })

  it('non-owner cannot update enrollment', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), ENROLLMENT_PATH), {
        name: 'Jane',
        status: 'inactive',
      })
    })

    const db = testEnv.authenticatedContext('student-1').firestore()
    await assertFails(updateDoc(doc(db, ENROLLMENT_PATH), { status: 'active' }))
  })

  it('non-owner cannot delete enrollment', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), ENROLLMENT_PATH), {
        name: 'Jane',
        status: 'inactive',
      })
    })

    const db = testEnv.authenticatedContext('student-1').firestore()
    await assertFails(deleteDoc(doc(db, ENROLLMENT_PATH)))
  })

  it('unauthenticated cannot access enrollment', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, ENROLLMENT_PATH)))
  })
})

// ── students/{identificationNumber} ───────────────────────────

describe('students/{identificationNumber}', () => {
  const STUDENT_PATH = 'students/12345678'

  it('authenticated user can read student profile', async () => {
    const db = testEnv.authenticatedContext('student-1').firestore()
    await assertSucceeds(getDoc(doc(db, STUDENT_PATH)))
  })

  it('nobody can write student profile (Cloud Functions only)', async () => {
    const db = testEnv.authenticatedContext('student-1').firestore()
    await assertFails(setDoc(doc(db, STUDENT_PATH), { name: 'Jane', uid: 'student-1' }))
  })

  it('unauthenticated cannot read student profile', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, STUDENT_PATH)))
  })
})

// ── students/{identificationNumber}/workspaces/{teacherUid} ───

describe('students/{identificationNumber}/workspaces/{teacherUid}', () => {
  const TEACHER_UID = 'teacher-1'
  const WORKSPACE_PATH = `students/12345678/workspaces/${TEACHER_UID}`

  it('authenticated user can read workspace', async () => {
    const db = testEnv.authenticatedContext('student-1').firestore()
    await assertSucceeds(getDoc(doc(db, WORKSPACE_PATH)))
  })

  it('teacher can write workspace entry', async () => {
    const db = testEnv.authenticatedContext(TEACHER_UID).firestore()
    await assertSucceeds(setDoc(doc(db, WORKSPACE_PATH), { name: 'Math Class', active: true }))
  })

  it('non-teacher cannot write workspace entry', async () => {
    const db = testEnv.authenticatedContext('student-1').firestore()
    await assertFails(setDoc(doc(db, WORKSPACE_PATH), { name: 'Hacked' }))
  })

  it('unauthenticated cannot access workspace', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, WORKSPACE_PATH)))
  })
})

// ── Catch-all deny ────────────────────────────────────────────

describe('catch-all deny', () => {
  it('authenticated user cannot access undefined collection', async () => {
    const db = testEnv.authenticatedContext('user-1').firestore()
    await assertFails(getDoc(doc(db, 'secretData/doc1')))
  })

  it('authenticated user cannot write to undefined collection', async () => {
    const db = testEnv.authenticatedContext('user-1').firestore()
    await assertFails(setDoc(doc(db, 'secretData/doc1'), { data: 'hack' }))
  })

  it('unauthenticated cannot access undefined collection', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, 'secretData/doc1')))
  })
})
