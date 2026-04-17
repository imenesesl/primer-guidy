import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { IAuthProvider } from '@primer-guidy/cloud-services'

const mockSignInWithGoogle = vi.fn()
const mockSendSignInLink = vi.fn()
const mockIsSignInWithEmailLink = vi.fn().mockReturnValue(false)
const mockCreateUserMutateAsync = vi.fn()

const mockAuth: IAuthProvider = {
  signInWithEmail: vi.fn(),
  signUpWithEmail: vi.fn(),
  sendSignInLink: mockSendSignInLink,
  signInWithEmailLink: vi.fn(),
  isSignInWithEmailLink: mockIsSignInWithEmailLink,
  signInWithGoogle: mockSignInWithGoogle,
  signInAnonymously: vi.fn(),
  signOut: vi.fn(),
  sendEmailVerification: vi.fn(),
  onAuthStateChanged: vi.fn(),
  getCurrentUser: vi.fn().mockReturnValue(null),
}

vi.mock('@primer-guidy/cloud-services', () => ({
  useAuth: () => mockAuth,
  AuthErrorCode: { UNKNOWN: 'UNKNOWN' },
}))

vi.mock('@/services/user', () => ({
  useCreateUser: () => ({ mutateAsync: mockCreateUserMutateAsync }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

const mockShowBanner = vi.fn()

vi.mock('@primer-guidy/components-web', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useBannerStore: (selector: (state: Record<string, unknown>) => unknown) =>
      selector({ showBanner: mockShowBanner, banner: null }),
  }
})

import { CreateAccount } from './CreateAccount'

describe('CreateAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsSignInWithEmailLink.mockReturnValue(false)
  })

  it('renders the create account heading', () => {
    render(<CreateAccount />)

    expect(screen.getByRole('heading', { name: 'title' })).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<CreateAccount />)

    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('renders name and email fields', () => {
    render(<CreateAccount />)

    expect(screen.getByLabelText('nameLabel')).toBeInTheDocument()
    expect(screen.getByLabelText('emailLabel')).toBeInTheDocument()
  })

  it('renders enabled email and google buttons', () => {
    render(<CreateAccount />)

    expect(screen.getByRole('button', { name: /createWithEmail/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /createWithGoogle/i })).not.toBeDisabled()
  })

  it('renders a link back to sign in', () => {
    render(<CreateAccount />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/')
  })

  it('calls sendSignInLink on valid form submission', async () => {
    const user = userEvent.setup()
    mockSendSignInLink.mockResolvedValue(undefined)

    render(<CreateAccount />)

    await user.type(screen.getByLabelText('nameLabel'), 'John Doe')
    await user.type(screen.getByLabelText('emailLabel'), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /createWithEmail/i }))

    expect(mockSendSignInLink).toHaveBeenCalledOnce()
    expect(await screen.findByText('linkSent.title')).toBeInTheDocument()
  })

  it('calls signInWithGoogle and saves user on google button click', async () => {
    const user = userEvent.setup()
    const mockUser = {
      uid: 'google-uid-123',
      email: 'test@test.com',
      displayName: 'Test User',
      emailVerified: true,
      photoURL: 'https://example.com/photo.jpg',
    }
    mockSignInWithGoogle.mockResolvedValue(mockUser)
    mockCreateUserMutateAsync.mockResolvedValue(undefined)

    render(<CreateAccount />)

    await user.click(screen.getByRole('button', { name: /createWithGoogle/i }))

    expect(mockSignInWithGoogle).toHaveBeenCalledOnce()
    expect(mockCreateUserMutateAsync).toHaveBeenCalledWith({
      uid: 'google-uid-123',
      data: expect.objectContaining({
        name: 'Test User',
        email: 'test@test.com',
        avatarUrl: 'https://example.com/photo.jpg',
      }),
    })
  })
})
