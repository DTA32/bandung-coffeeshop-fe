import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import Breadcrumb from '@/components/Breadcrumb'
import PrivacyPolicyEN from '@/components/privacy-policy/EN'
import PrivacyPolicyID from '@/components/privacy-policy/ID'
import { useLocale } from '@/lib/locale'
import {
  breadcrumbJsonLd,
  localizedPath,
  privacyPolicyCrumbs,
  seoHead,
} from '@/lib/seo'
import type { SeoMeta } from '@/lib/seo'
import { createI18n, normalizeLocale } from '@/i18n'

export const Route = createFileRoute('/{-$locale}/privacy-policy')({
  head: (ctx: any) => {
    const locale = normalizeLocale(ctx.params.locale)
    const i18n = createI18n(locale)
    const seo: SeoMeta = {
      title: i18n.t('seo.privacyTitle'),
      description: i18n.t('seo.privacyDesc'),
      canonicalPath: localizedPath(locale, '/privacy-policy'),
      locale,
      jsonLd: [breadcrumbJsonLd(privacyPolicyCrumbs((k) => i18n.t(k), locale))],
    }
    return seoHead(seo)
  },
  component: PrivacyPolicy,
})

function PrivacyPolicy() {
  const { t } = useTranslation()
  const locale = useLocale()
  return (
    <main className="flex-1 md:px-8 py-12">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <Breadcrumb items={privacyPolicyCrumbs(t, locale)} />
      </div>
      {locale === 'en' ? <PrivacyPolicyEN /> : <PrivacyPolicyID />}
    </main>
  )
}
