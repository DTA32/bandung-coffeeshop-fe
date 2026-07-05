import { createElement } from 'react'
import type { ReactNode } from 'react'
import { vi } from 'vitest'

// Shared router mock surface for unit tests. The components/hooks under test only
// touch three things from '@tanstack/react-router': <Link>, useNavigate, and
// useRouterState (via useLocale, reading location.pathname). This module supplies
// stubs for those three. Test files plug `routerOverrides` into
// vi.mock('@tanstack/react-router', ...). Because '@/test/router' is never itself
// mocked, the dynamic import() inside the mock factory and the static import in
// the test resolve to the same module singleton, so the spy is shared.

// Navigate spy — assert call args in hook/component tests.
export const mockNavigate = vi.fn()

// Mutable router state read by useLocale: '/en' → locale 'en'; any bare path → 'id'.
export const mockRouterState = { pathname: '/en' }

export function setMockPathname(pathname: string) {
  mockRouterState.pathname = pathname
}

// Reset between tests (call in beforeEach).
export function resetRouter() {
  mockNavigate.mockReset()
  mockRouterState.pathname = '/en'
}

// DOM-safe <Link>: drop router-only props so React 19 doesn't warn about unknown
// <a> attributes, and surface `to` as href for sanity.
type LinkProps = Record<string, unknown> & {
  to?: unknown
  children?: ReactNode
}

export function MockLink(props: LinkProps) {
  const {
    to,
    params: _params,
    search: _search,
    preload: _preload,
    activeProps: _activeProps,
    inactiveProps: _inactiveProps,
    activeOptions: _activeOptions,
    replace: _replace,
    resetScroll: _resetScroll,
    from: _from,
    mask: _mask,
    children,
    ...domProps
  } = props
  return createElement(
    'a',
    { href: typeof to === 'string' ? to : '#', ...domProps },
    children,
  )
}

// The override bag spread over the real module by each test's vi.mock factory.
export const routerOverrides = {
  Link: MockLink,
  useNavigate: () => mockNavigate,
  useRouterState: ({ select }: { select: (s: any) => unknown }) =>
    select({ location: { pathname: mockRouterState.pathname } }),
}
