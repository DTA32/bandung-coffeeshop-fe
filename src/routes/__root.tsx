import {
  HeadContent,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import LocaleLink from '@/components/LocaleLink'
import TelemetryClient, {
  reportClientError,
} from '@/components/TelemetryClient'
import { getUserAgentInfo } from '@/lib/helper'
import { localeFromPathname } from '@/lib/locale'
import { requestLogger } from '@/lib/middleware'
import { createI18n } from '@/i18n'

import appCss from '@/styles.css?url'
import Footer from '@/components/Footer'

export const Route = createRootRoute({
  beforeLoad: async () => {
    const ua = await getUserAgentInfo()
    return { ua }
  },
  server: {
    middleware: [requestLogger],
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'BDGCafe' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
    scripts: [
      import.meta.env.PROD
        ? {
            async: true,
            src: 'https://www.googletagmanager.com/gtag/js?id=G-HG0K2CZQWH',
          }
        : undefined,
      import.meta.env.PROD
        ? {
            children: `window.dataLayer = window.dataLayer || [];
                     function gtag(){dataLayer.push(arguments);}
                     gtag('js', new Date());
                     gtag('config', 'G-HG0K2CZQWH', { send_page_view: false });`,
          }
        : undefined,
    ],
  }),
  errorComponent: RootErrorComponent,
  notFoundComponent: RootNotFoundComponent,
  shellComponent: RootDocument,
})

function RootErrorComponent({ error }: { error: Error }) {
  const { t } = useTranslation()
  reportClientError({
    message: error.message,
    stack: error.stack,
    source: 'root-error-boundary',
    path: window.location.pathname,
  })

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 py-32 text-forest text-center">
      <p className="text-2xl font-semibold">{t('errors.genericTitle')}</p>
      <p className="mt-2 text-bark">{t('errors.genericBody')}</p>
      <LocaleLink
        to="/{-$locale}"
        className="py-4 px-8 text-sm bg-forest text-cream rounded-lg"
      >
        {t('errors.backToHome')}
      </LocaleLink>
    </main>
  )
}

function RootNotFoundComponent() {
  const { t } = useTranslation()
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 py-32 text-forest text-center">
      <p className="text-2xl font-semibold">{t('errors.notFoundTitle')}</p>
      <p className="mt-2 text-bark">{t('errors.notFoundBody')}</p>
      <LocaleLink
        to="/{-$locale}"
        className="py-4 px-8 text-sm bg-forest text-cream rounded-lg"
      >
        {t('errors.backToHome')}
      </LocaleLink>
    </main>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const locale = localeFromPathname(pathname)
  const i18n = useMemo(() => createI18n(locale), [locale])

  return (
    <html lang={locale}>
      <head>
        <HeadContent />
      </head>
      <body className={'m-0 bg-cream flex flex-col min-h-screen'}>
        <I18nextProvider i18n={i18n}>
          <TelemetryClient />
          <SkipLink />
          <Header />
          <div id="main" className="contents">
            {children}
          </div>
          {import.meta.env.PROD ? null : (
            <TanStackDevtools
              config={{ position: 'bottom-right' }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
          )}
          <Navbar />
          <Footer />
        </I18nextProvider>
        <Scripts />
      </body>
    </html>
  )
}

function SkipLink() {
  const { t } = useTranslation()
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-forest focus:px-4 focus:py-2 focus:text-cream"
    >
      {t('skipToMain')}
    </a>
  )
}
