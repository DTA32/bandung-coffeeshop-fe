import i18next from 'i18next'
import type { i18n as I18nInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/common.json'
import id from './locales/id/common.json'

export const SUPPORTED_LOCALES = ['id', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'id'
export const DEFAULT_NS = 'common'

export const resources = {
  en: { common: en },
  id: { common: id },
} as const

// normalizeLocale coerces any string to a supported locale, defaulting to id.
export function normalizeLocale(value: string | undefined | null): Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value ?? '')
    ? (value as Locale)
    : DEFAULT_LOCALE
}

// createI18n builds a fresh i18next instance for the given locale. A new
// instance is created per SSR request (and per locale on the client) so request
// state never leaks between concurrent renders. Resources are bundled, so init
// is synchronous and translations are ready immediately.
export function createI18n(locale: Locale): I18nInstance {
  const instance = i18next.createInstance()
  instance.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: 'en',
    defaultNS: DEFAULT_NS,
    ns: [DEFAULT_NS],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
  return instance
}
