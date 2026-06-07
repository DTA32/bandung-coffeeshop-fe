import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import { getUserAgentInfo } from '@/lib/helper'

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
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className={'m-0 bg-cream flex flex-col min-h-screen'}>
        <Header />
        {children}
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
        <Scripts />
      </body>
    </html>
  )
}
