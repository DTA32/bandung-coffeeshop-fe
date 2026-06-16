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
import { getUserAgentInfo } from '@/lib/helper'
import { createI18n } from '@/i18n'
import { localeFromPathname } from '@/lib/locale'

import appCss from '@/styles.css?url'
import Footer from '@/components/Footer'

export const Route = createRootRoute({
  beforeLoad: async () => {
    const ua = await getUserAgentInfo()
    return { ua }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'BDGCafe' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  // Locale is derived from the URL (bare = id, /en = en). A fresh i18n instance
  // is created per locale so SSR renders the right language with no cross-request
  // leakage; deriving from pathname keeps server and client renders in sync.
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
          <Footer />
          <Navbar />
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
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-forest focus:px-4 focus:py-2 focus:text-cream"
    >
      {t('skipToMain')}
    </a>
  )
}
