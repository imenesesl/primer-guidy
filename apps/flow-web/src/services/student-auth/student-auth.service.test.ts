import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IFunctionsProvider } from '@primer-guidy/cloud-services'
import { studentLogin, studentRegister } from './student-auth.service'

const mockFunctions: IFunctionsProvider = { call: vi.fn() }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('studentLogin', () => {
  it('calls functions.call with correct name and data', async () => {
    vi.mocked(mockFunctions.call).mockResolvedValue({ token: 'login-token' })

    const data = { identificationNumber: '12345678', password: 'securepass' }
    const result = await studentLogin(mockFunctions, data)

    expect(mockFunctions.call).toHaveBeenCalledWith('studentLogin', data)
    expect(result).toEqual({ token: 'login-token' })
  })
})

describe('studentRegister', () => {
  it('calls functions.call with correct name and data', async () => {
    vi.mocked(mockFunctions.call).mockResolvedValue({ token: 'register-token' })

    const data = { identificationNumber: '12345678', password: 'securepass', name: 'Jane' }
    const result = await studentRegister(mockFunctions, data)

    expect(mockFunctions.call).toHaveBeenCalledWith('studentRegister', data)
    expect(result).toEqual({ token: 'register-token' })
  })
})
