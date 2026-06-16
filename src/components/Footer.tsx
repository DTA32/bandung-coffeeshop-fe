import { useTranslation } from 'react-i18next'
import LocaleLink from '@/components/LocaleLink'
import LanguageToggle from '#/components/LanguageToggle.tsx'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="bg-forest-lighter text-forest text-sm py-4 px-6 md:px-16 flex flex-col gap-2">
      <div className="w-full flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col gap-0">
            <p className="text-lg font-bold">
              {t('brand')}
            </p>
            <p className="text-bark">{t('footer.tagline')}</p>
          </div>
          <LanguageToggle text={t('footer.changeLanguage')} />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <h2 className="font-semibold">{t('footer.quickLinks')}</h2>
          <ul className="text-bark">
            <li>
              <LocaleLink
                to="/{-$locale}/explore/$"
                params={{ _splat: 'bandung-utara' }}
                className="text-moss hover:underline"
              >
                {t('footer.cafeInBandungUtara')}
              </LocaleLink>
            </li>
            <li>
              <LocaleLink
                to="/{-$locale}/explore/$"
                params={{ _splat: 'bandung-tengah/riau' }}
                className="text-moss hover:underline"
              >
                {t('footer.cafeInRiau')}
              </LocaleLink>
            </li>
            <li>
              <LocaleLink
                to="/{-$locale}/explore/$"
                params={{ _splat: 'bandung-tengah/riau/gedung-sate' }}
                className="text-moss hover:underline"
              >
                {t('footer.cafeNearGedungSate')}
              </LocaleLink>
            </li>
            <li>
              <LocaleLink
                to="/{-$locale}/about"
                className="text-moss hover:underline"
              >
                {t('footer.aboutUs')}
              </LocaleLink>
            </li>
          </ul>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <h2 className="font-semibold">{t('footer.contactUs')}</h2>
          <p className="text-bark">
            {t('footer.email')}{' '}
            <a
              href="mailto:contact@bdgcafe.com"
              className="text-moss hover:underline"
            >
              contact@bdgcafe.com
            </a>
          </p>
        </div>
      </div>
      <p className="text-bark">{t('footer.copyright', { year: 2026 })}</p>
    </footer>
  )
}
