import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

const mockMatchRoute = vi.fn()
const mockToggleRail = vi.fn()
const mockToggleSidebar = vi.fn()
const mockCloseSidebar = vi.fn()

vi.mock('@primer/react', () => ({
  useTheme: () => ({ theme: { colors: {} } }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@tanstack/react-router', () => ({
  useMatchRoute: () => mockMatchRoute,
  useLocation: () => ({ pathname: '/workspace/123' }),
}))

vi.mock('../../../stores/layout.store', () => ({
  useLayoutStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      railVisible: true,
      sidebarVisible: false,
      toggleRail: mockToggleRail,
      toggleSidebar: mockToggleSidebar,
      closeSidebar: mockCloseSidebar,
    }),
}))

vi.mock('../../../hooks', () => ({
  useCloseSidebarOnMobileNav: vi.fn(),
}))

vi.mock('../../../utils/theme.utils', () => ({
  buildThemeVars: vi.fn(() => ({ '--color-bg': '#000' })),
}))

vi.mock('./ContentHeader.utils', () => ({
  buildBreadcrumb: vi.fn(() => [{ label: 'Home', href: '/' }]),
}))

vi.mock('./SidebarContent.utils', () => ({
  resolveSidebarItems: vi.fn(() => []),
}))

import { useShellState } from './useShellState'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useShellState', () => {
  const hookArgs = { sidebarItemsMap: {}, breadcrumbResolver: undefined }

  it('returns all expected properties', () => {
    const { result } = renderHook(() => useShellState(hookArgs))

    expect(result.current).toEqual(
      expect.objectContaining({
        themeVars: expect.any(Object),
        railVisible: true,
        sidebarVisible: false,
        toggleRail: mockToggleRail,
        toggleSidebar: mockToggleSidebar,
        closeSidebar: mockCloseSidebar,
        breadcrumb: expect.any(Array),
        sidebarItems: expect.any(Array),
        isActive: expect.any(Function),
        resolveLabel: expect.any(Function),
        labels: expect.objectContaining({
          toggleRail: expect.any(String),
          closeSidebar: expect.any(String),
          toggleSidebar: expect.any(String),
          rail: expect.any(String),
          sidebar: expect.any(String),
        }),
      }),
    )
  })

  it('isActive calls matchRoute with correct args', () => {
    mockMatchRoute.mockReturnValue(true)
    const { result } = renderHook(() => useShellState(hookArgs))

    const active = result.current.isActive('/some/path')

    expect(mockMatchRoute).toHaveBeenCalledWith({ to: '/some/path', fuzzy: true })
    expect(active).toBe(true)
  })
})
