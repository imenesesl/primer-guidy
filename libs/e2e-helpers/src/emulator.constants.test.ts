import { describe, it, expect } from 'vitest'
import {
  AUTH_EMULATOR_PORT,
  FIRESTORE_EMULATOR_PORT,
  EMULATOR_HOST,
  AUTH_EMULATOR_URL,
  FIRESTORE_EMULATOR_URL,
  FIREBASE_PROJECT_ID,
  FIREBASE_API_KEY,
  USERS_COLLECTION,
} from './emulator.constants'

describe('emulator.constants', () => {
  it('AUTH_EMULATOR_PORT is 9099', () => {
    expect(AUTH_EMULATOR_PORT).toBe(9099)
  })

  it('FIRESTORE_EMULATOR_PORT is 8080', () => {
    expect(FIRESTORE_EMULATOR_PORT).toBe(8080)
  })

  it('EMULATOR_HOST is 127.0.0.1', () => {
    expect(EMULATOR_HOST).toBe('127.0.0.1')
  })

  it('AUTH_EMULATOR_URL is composed from host and auth port', () => {
    expect(AUTH_EMULATOR_URL).toBe('http://127.0.0.1:9099')
  })

  it('FIRESTORE_EMULATOR_URL is composed from host and firestore port', () => {
    expect(FIRESTORE_EMULATOR_URL).toBe('http://127.0.0.1:8080')
  })

  it('FIREBASE_PROJECT_ID is guidy-app-ai', () => {
    expect(FIREBASE_PROJECT_ID).toBe('guidy-app-ai')
  })

  it('FIREBASE_API_KEY is fake-api-key', () => {
    expect(FIREBASE_API_KEY).toBe('fake-api-key')
  })

  it('USERS_COLLECTION is users', () => {
    expect(USERS_COLLECTION).toBe('users')
  })
})
