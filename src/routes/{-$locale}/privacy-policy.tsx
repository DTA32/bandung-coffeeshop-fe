import { createFileRoute } from '@tanstack/react-router'
import { useLocale } from '@/lib/locale'
import { localizedPath, seoHead } from '@/lib/seo'
import type { SeoMeta } from '@/lib/seo'
import { createI18n, normalizeLocale } from '@/i18n'
import PrivacyPolicyEN from '@/components/privacy-policy/EN'
import PrivacyPolicyID from '@/components/privacy-policy/ID'

export const Route = createFileRoute('/{-$locale}/privacy-policy')({
  // Only the SEO title/description live in i18n; the page content stays in the
  // EN/ID components.
  head: (ctx: any) => {
    const locale = normalizeLocale(ctx.params.locale)
    const i18n = createI18n(locale)
    const seo: SeoMeta = {
      title: i18n.t('seo.privacyTitle'),
      description: i18n.t('seo.privacyDesc'),
      canonicalPath: localizedPath(locale, '/privacy-policy'),
    }
    return seoHead(seo)
  },
  component: PrivacyPolicy,
})

function PrivacyPolicy() {
  const locale = useLocale()
  return locale === 'en' ? <PrivacyPolicyEN /> : <PrivacyPolicyID />
}
