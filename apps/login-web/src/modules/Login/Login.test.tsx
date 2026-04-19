import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IAuthProvider } from '@primer-guidy/cloud-services'

const mockSignInWithGoogle = vi.fn()
const mockSignOut = vi.fn()
const mockSendSignInLink = vi.fn()
const mockSignInWithEmailLink = vi.fn()
const mockIsSignInWithEmailLink = vi.fn().mockReturnValue(false)
const mockCheckUserExistsMutateAsync = vi.fn()

const mockAuth: IAuthProvider = {
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  sendSignInLink: mockSendSignInLink,
  signInWithEmailLink: mockSignInWithEmailLink,
  isSignInWithEmailLink: mockIsSignInWithEmailLink,
  signInWithGoogle: mockSignInWithGoogle,
  signInAnonymously: vi.fn(),
  signInWithCustomToken: vi.fn(),
  signOut: mockSignOut,
  sendEmailVerification: vi.fn(),
  onAuthStateChanged: vi.fn(),
  getCurrentUser: vi.fn().mockReturnValue(null),
}

vi.mock('@primer-guidy/cloud-services', () => ({
  useAuth: () => mockAuth,
}))

vi.mock('@/services/user', () => ({
  useCheckUserExists: () => ({ mutateAsync: mockCheckUserExistsMutateAsync }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}))

const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => mockNavigate,
}))

const mockShowBanner = vi.fn()
const mockDismissBanner = vi.fn()

vi.mock('@primer-guidy/components-web', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useBannerStore: (selector: (state: Record<string, unknown>) => unknown) =>
      selector({ showBanner: mockShowBanner, dismissBanner: mockDismissBanner, banner: null }),
  }
})

import { Login } from './Login'

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsSignInWithEmailLink.mockReturnValue(false)
  })

  it('renders the sign-in heading', () => {
    render(<Login />)

    expect(screen.getByRole('heading', { name: 'title' })).toBeInTheDocument()
  })

  it('renders the email form', () => {
    render(<Login />)

    expect(screen.getByLabelText('emailLabel')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /signInWithoutPassword/i })).toBeInTheDocument()
  })

  it('renders the google sign-in button', () => {
    render(<Login />)

    expect(screen.getByRole('button', { name: /signInWithGoogle/i })).toBeInTheDocument()
  })

  it('renders the or divider', () => {
    render(<Login />)

    expect(screen.getByText('or')).toBeInTheDocument()
  })

  it('calls signInWithGoogle and checks Firestore on google button click', async () => {
    const user = userEvent.setup()
    const mockUser = {
      uid: 'google-uid-123',
      email: 'test@test.com',
      displayName: null,
      emailVerified: true,
      photoURL: null,
    }
    mockSignInWithGoogle.mockResolvedValue(mockUser)
    mockCheckUserExistsMutateAsync.mockResolvedValue(true)

    render(<Login />)

    await user.click(screen.getByRole('button', { name: /signInWithGoogle/i }))

    expect(mockSignInWithGoogle).toHaveBeenCalledOnce()
  })

  it('calls showBanner with warning when user does not exist in Firestore after Google sign-in', async () => {
    const user = userEvent.setup()
    const mockUser = {
      uid: 'new-uid',
      email: 'new@test.com',
      displayName: null,
      emailVerified: true,
      photoURL: null,
    }
    mockSignInWithGoogle.mockResolvedValue(mockUser)
    mockCheckUserExistsMutateAsync.mockResolvedValue(false)
    mockSignOut.mockResolvedValue(undefined)

    render(<Login />)

    await user.click(screen.getByRole('button', { name: /signInWithGoogle/i }))

    await waitFor(() => {
      expect(mockShowBanner).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'warning',
          message: 'accountNotFound.message',
        }),
      )
    })
    expect(mockSignOut).toHaveBeenCalledOnce()
  })

  it('shows validation error on invalid email submission', async () => {
    const user = userEvent.setup()

    render(<Login />)

    await user.click(screen.getByRole('button', { name: /signInWithoutPassword/i }))

    expect(await screen.findByText('errors.INVALID_EMAIL')).toBeInTheDocument()
  })

  it('calls sendSignInLink on valid email submission', async () => {
    const user = userEvent.setup()
    mockSendSignInLink.mockResolvedValue(undefined)

    render(<Login />)

    const emailInput = screen.getByLabelText('emailLabel')
    await user.type(emailInput, 'valid@email.com')
    await user.click(screen.getByRole('button', { name: /signInWithoutPassword/i }))

    expect(mockSendSignInLink).toHaveBeenCalledOnce()
    expect(await screen.findByText('linkSent.title')).toBeInTheDocument()
  })
})
