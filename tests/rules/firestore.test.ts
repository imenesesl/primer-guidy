import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore'

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

// ── quizzes/{contentId}/students/{studentId} ──────────────────

describe('quizzes/{contentId}/students/{studentId}', () => {
  const TEACHER_UID = 'teacher-1'
  const STUDENT_ID = '12345678'
  const STUDENT_AUTH_UID = 'student-auth-1'
  const STUDENT_DOC_PATH = `users/${TEACHER_UID}/channels/ch-1/quizzes/quiz-1/students/${STUDENT_ID}`
  const STUDENT_PROFILE_PATH = `students/${STUDENT_ID}`

  it('any authenticated user can read', async () => {
    const db = testEnv.authenticatedContext('anyone').firestore()
    await assertSucceeds(getDoc(doc(db, STUDENT_DOC_PATH)))
  })

  it('unauthenticated cannot read', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, STUDENT_DOC_PATH)))
  })

  it('nobody can create via client', async () => {
    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertFails(setDoc(doc(db, STUDENT_DOC_PATH), { questions: [], chatContext: '' }))
  })

  it('nobody can delete via client', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), STUDENT_DOC_PATH), {
        questions: [],
        chatContext: '',
        answered: false,
        completed: false,
        selectedIndex: null,
      })
    })

    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertFails(deleteDoc(doc(db, STUDENT_DOC_PATH)))
  })

  it('owner student can update allowed fields', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), STUDENT_PROFILE_PATH), {
        uid: STUDENT_AUTH_UID,
        identificationNumber: STUDENT_ID,
        name: 'Jane',
      })
      await setDoc(doc(context.firestore(), STUDENT_DOC_PATH), {
        questions: [],
        chatContext: '',
        answered: false,
        completed: false,
        selectedIndex: null,
      })
    })

    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertSucceeds(updateDoc(doc(db, STUDENT_DOC_PATH), { answered: true, selectedIndex: 2 }))
  })

  it('owner student cannot update disallowed fields', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), STUDENT_PROFILE_PATH), {
        uid: STUDENT_AUTH_UID,
        identificationNumber: STUDENT_ID,
        name: 'Jane',
      })
      await setDoc(doc(context.firestore(), STUDENT_DOC_PATH), {
        questions: [],
        chatContext: '',
        answered: false,
        completed: false,
        selectedIndex: null,
      })
    })

    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertFails(updateDoc(doc(db, STUDENT_DOC_PATH), { questions: [{ id: 'hack' }] }))
  })

  it('non-owner student cannot update', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), STUDENT_PROFILE_PATH), {
        uid: STUDENT_AUTH_UID,
        identificationNumber: STUDENT_ID,
        name: 'Jane',
      })
      await setDoc(doc(context.firestore(), STUDENT_DOC_PATH), {
        questions: [],
        chatContext: '',
        answered: false,
        completed: false,
        selectedIndex: null,
      })
    })

    const db = testEnv.authenticatedContext('other-student').firestore()
    await assertFails(updateDoc(doc(db, STUDENT_DOC_PATH), { answered: true }))
  })
})

// ── homework/{contentId}/students/{studentId} ─────────────────

describe('homework/{contentId}/students/{studentId}', () => {
  const TEACHER_UID = 'teacher-1'
  const STUDENT_ID = '12345678'
  const STUDENT_AUTH_UID = 'student-auth-1'
  const STUDENT_DOC_PATH = `users/${TEACHER_UID}/channels/ch-1/homework/hw-1/students/${STUDENT_ID}`
  const STUDENT_PROFILE_PATH = `students/${STUDENT_ID}`

  it('any authenticated user can read', async () => {
    const db = testEnv.authenticatedContext('anyone').firestore()
    await assertSucceeds(getDoc(doc(db, STUDENT_DOC_PATH)))
  })

  it('unauthenticated cannot read', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, STUDENT_DOC_PATH)))
  })

  it('nobody can create via client', async () => {
    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertFails(setDoc(doc(db, STUDENT_DOC_PATH), { questions: [], chatContext: '' }))
  })

  it('nobody can delete via client', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), STUDENT_DOC_PATH), {
        questions: [],
        chatContext: '',
        answered: false,
        completed: false,
        selectedIndex: null,
      })
    })

    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertFails(deleteDoc(doc(db, STUDENT_DOC_PATH)))
  })

  it('owner student can update allowed fields', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), STUDENT_PROFILE_PATH), {
        uid: STUDENT_AUTH_UID,
        identificationNumber: STUDENT_ID,
        name: 'Jane',
      })
      await setDoc(doc(context.firestore(), STUDENT_DOC_PATH), {
        questions: [],
        chatContext: '',
        answered: false,
        completed: false,
        selectedIndex: null,
      })
    })

    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertSucceeds(updateDoc(doc(db, STUDENT_DOC_PATH), { answered: true, selectedIndex: 0 }))
  })

  it('owner student cannot update disallowed fields', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), STUDENT_PROFILE_PATH), {
        uid: STUDENT_AUTH_UID,
        identificationNumber: STUDENT_ID,
        name: 'Jane',
      })
      await setDoc(doc(context.firestore(), STUDENT_DOC_PATH), {
        questions: [],
        chatContext: '',
        answered: false,
        completed: false,
        selectedIndex: null,
      })
    })

    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertFails(updateDoc(doc(db, STUDENT_DOC_PATH), { questions: [{ id: 'hack' }] }))
  })

  it('non-owner student cannot update', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), STUDENT_PROFILE_PATH), {
        uid: STUDENT_AUTH_UID,
        identificationNumber: STUDENT_ID,
        name: 'Jane',
      })
      await setDoc(doc(context.firestore(), STUDENT_DOC_PATH), {
        questions: [],
        chatContext: '',
        answered: false,
        completed: false,
        selectedIndex: null,
      })
    })

    const db = testEnv.authenticatedContext('other-student').firestore()
    await assertFails(updateDoc(doc(db, STUDENT_DOC_PATH), { answered: true }))
  })
})

// ── quizzes/.../students/{studentId}/chat/{messageId} ─────────

describe('quizzes/.../students/{studentId}/chat/{messageId}', () => {
  const TEACHER_UID = 'teacher-1'
  const STUDENT_ID = '12345678'
  const STUDENT_AUTH_UID = 'student-auth-1'
  const STUDENT_PROFILE_PATH = `students/${STUDENT_ID}`
  const CHAT_COLLECTION_PATH = `users/${TEACHER_UID}/channels/ch-1/quizzes/quiz-1/students/${STUDENT_ID}/chat`
  const CHAT_DOC_PATH = `${CHAT_COLLECTION_PATH}/msg-1`

  const VALID_MESSAGE = { role: 'user', content: 'Hello', createdAt: '2026-04-21T00:00:00.000Z' }

  const seedStudentProfile = async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), STUDENT_PROFILE_PATH), {
        uid: STUDENT_AUTH_UID,
        identificationNumber: STUDENT_ID,
        name: 'Jane',
      })
    })
  }

  it('owner student can read chat messages', async () => {
    await seedStudentProfile()
    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertSucceeds(getDoc(doc(db, CHAT_DOC_PATH)))
  })

  it('non-owner cannot read chat messages', async () => {
    await seedStudentProfile()
    const db = testEnv.authenticatedContext('other-student').firestore()
    await assertFails(getDoc(doc(db, CHAT_DOC_PATH)))
  })

  it('unauthenticated cannot read chat messages', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, CHAT_DOC_PATH)))
  })

  it('owner student can create chat message with valid fields', async () => {
    await seedStudentProfile()
    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertSucceeds(addDoc(collection(db, CHAT_COLLECTION_PATH), VALID_MESSAGE))
  })

  it('owner student cannot create chat message with extra fields', async () => {
    await seedStudentProfile()
    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertFails(
      addDoc(collection(db, CHAT_COLLECTION_PATH), { ...VALID_MESSAGE, extra: 'hack' }),
    )
  })

  it('non-owner cannot create chat message', async () => {
    await seedStudentProfile()
    const db = testEnv.authenticatedContext('other-student').firestore()
    await assertFails(addDoc(collection(db, CHAT_COLLECTION_PATH), VALID_MESSAGE))
  })

  it('nobody can update chat messages', async () => {
    await seedStudentProfile()
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), CHAT_DOC_PATH), VALID_MESSAGE)
    })
    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertFails(updateDoc(doc(db, CHAT_DOC_PATH), { content: 'edited' }))
  })

  it('nobody can delete chat messages', async () => {
    await seedStudentProfile()
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), CHAT_DOC_PATH), VALID_MESSAGE)
    })
    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertFails(deleteDoc(doc(db, CHAT_DOC_PATH)))
  })
})

// ── homework/.../students/{studentId}/chat/{messageId} ────────

describe('homework/.../students/{studentId}/chat/{messageId}', () => {
  const TEACHER_UID = 'teacher-1'
  const STUDENT_ID = '12345678'
  const STUDENT_AUTH_UID = 'student-auth-1'
  const STUDENT_PROFILE_PATH = `students/${STUDENT_ID}`
  const CHAT_COLLECTION_PATH = `users/${TEACHER_UID}/channels/ch-1/homework/hw-1/students/${STUDENT_ID}/chat`
  const CHAT_DOC_PATH = `${CHAT_COLLECTION_PATH}/msg-1`

  const VALID_MESSAGE = {
    role: 'assistant',
    content: 'Hi there',
    createdAt: '2026-04-21T00:00:00.000Z',
  }

  const seedStudentProfile = async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), STUDENT_PROFILE_PATH), {
        uid: STUDENT_AUTH_UID,
        identificationNumber: STUDENT_ID,
        name: 'Jane',
      })
    })
  }

  it('owner student can read chat messages', async () => {
    await seedStudentProfile()
    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertSucceeds(getDoc(doc(db, CHAT_DOC_PATH)))
  })

  it('non-owner cannot read chat messages', async () => {
    await seedStudentProfile()
    const db = testEnv.authenticatedContext('other-student').firestore()
    await assertFails(getDoc(doc(db, CHAT_DOC_PATH)))
  })

  it('owner student can create chat message', async () => {
    await seedStudentProfile()
    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertSucceeds(addDoc(collection(db, CHAT_COLLECTION_PATH), VALID_MESSAGE))
  })

  it('non-owner cannot create chat message', async () => {
    await seedStudentProfile()
    const db = testEnv.authenticatedContext('other-student').firestore()
    await assertFails(addDoc(collection(db, CHAT_COLLECTION_PATH), VALID_MESSAGE))
  })

  it('nobody can update chat messages', async () => {
    await seedStudentProfile()
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), CHAT_DOC_PATH), VALID_MESSAGE)
    })
    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertFails(updateDoc(doc(db, CHAT_DOC_PATH), { content: 'edited' }))
  })

  it('nobody can delete chat messages', async () => {
    await seedStudentProfile()
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), CHAT_DOC_PATH), VALID_MESSAGE)
    })
    const db = testEnv.authenticatedContext(STUDENT_AUTH_UID).firestore()
    await assertFails(deleteDoc(doc(db, CHAT_DOC_PATH)))
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
