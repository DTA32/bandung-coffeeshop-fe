import { render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { createI18n } from '@/i18n'
import type { Locale } from '@/i18n'

interface ProviderOptions {
  locale?: Locale
}

// renderWithProviders wraps the tree in a fresh i18next instance so
// useTranslation() resolves real copy. Default locale is 'en' so assertions read
// in English (keys live in src/i18n/locales/en/common.json). Router needs are
// handled separately via a per-test vi.mock of '@tanstack/react-router' using the
// helpers in '@/test/router'.
export function renderWithProviders(
  ui: ReactElement,
  { locale = 'en' }: ProviderOptions = {},
) {
  const i18n = createI18n(locale)
  function Wrapper({ children }: { children: ReactNode }) {
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  }
  return render(ui, { wrapper: Wrapper })
}

// Re-export RTL + user-event from one place so tests import from '@/test/utils'.
export { renderHook } from '@testing-library/react'
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
