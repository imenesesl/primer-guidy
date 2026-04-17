import { describe, it, expect } from 'vitest'
import * as v from 'valibot'
import { LoginSchema, RegisterSchema } from './auth.types'

describe('LoginSchema', () => {
  it('passes with valid identificationNumber and password', () => {
    const result = v.safeParse(LoginSchema, {
      identificationNumber: '12345678',
      password: 'securepass',
    })
    expect(result.success).toBe(true)
  })

  it('fails when identificationNumber contains letters', () => {
    const result = v.safeParse(LoginSchema, {
      identificationNumber: '1234abcd',
      password: 'securepass',
    })
    expect(result.success).toBe(false)
  })

  it('fails when identificationNumber is too short', () => {
    const result = v.safeParse(LoginSchema, {
      identificationNumber: '1234',
      password: 'securepass',
    })
    expect(result.success).toBe(false)
  })

  it('fails when password is too short', () => {
    const result = v.safeParse(LoginSchema, {
      identificationNumber: '12345678',
      password: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('fails when fields are missing', () => {
    const result = v.safeParse(LoginSchema, {})
    expect(result.success).toBe(false)
  })
})

describe('RegisterSchema', () => {
  it('passes with valid data including name', () => {
    const result = v.safeParse(RegisterSchema, {
      identificationNumber: '12345678',
      name: 'John',
      password: 'securepass',
    })
    expect(result.success).toBe(true)
  })

  it('fails when name is empty', () => {
    const result = v.safeParse(RegisterSchema, {
      identificationNumber: '12345678',
      name: '',
      password: 'securepass',
    })
    expect(result.success).toBe(false)
  })

  it('fails when identificationNumber contains letters', () => {
    const result = v.safeParse(RegisterSchema, {
      identificationNumber: 'abcdefgh',
      name: 'John',
      password: 'securepass',
    })
    expect(result.success).toBe(false)
  })

  it('fails when password is too short', () => {
    const result = v.safeParse(RegisterSchema, {
      identificationNumber: '12345678',
      name: 'John',
      password: 'short',
    })
    expect(result.success).toBe(false)
  })
})
