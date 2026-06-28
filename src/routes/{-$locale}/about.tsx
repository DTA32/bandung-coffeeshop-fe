import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import Breadcrumb from '@/components/Breadcrumb'
import { useLocale } from '@/lib/locale'
import {
  seoHead,
  localizedPath,
  aboutCrumbs,
  breadcrumbJsonLd,
} from '@/lib/seo'
import type { SeoMeta } from '@/lib/seo'
import { createI18n, normalizeLocale } from '@/i18n'
import AboutEN from '@/components/about/EN'
import AboutID from '@/components/about/ID'

export const Route = createFileRoute('/{-$locale}/about')({
  head: (ctx: any) => {
    const locale = normalizeLocale(ctx.params.locale)
    const i18n = createI18n(locale)
    const seo: SeoMeta = {
      title: i18n.t('seo.aboutTitle'),
      description: i18n.t('seo.aboutDesc'),
      canonicalPath: localizedPath(locale, '/about'),
      jsonLd: [breadcrumbJsonLd(aboutCrumbs((k) => i18n.t(k), locale))],
    }
    return seoHead(seo)
  },
  component: About,
})

function About() {
  const { t } = useTranslation()
  const locale = useLocale()
  return (
    <main className="flex-1 md:px-8 py-12">
      <div className="mx-auto max-w-3xl px-6 sm:px-8 mb-4">
        <Breadcrumb items={aboutCrumbs(t, locale)} />
      </div>
      {locale === 'en' ? <AboutEN /> : <AboutID />}
    </main>
  )
}
