import { useId } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { CircleAlert, X } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import Dialog from '@/components/Dialog'
import LocaleLink from '@/components/LocaleLink'
import { loginUrl } from '@/lib/api/auth'

export type LoginError = 'deactivated' | 'failed'

interface LoginModalProps {
  open: boolean
  onClose: () => void
  cafeName?: string
  intent?: 'review'
  error?: LoginError
}

// Official multicolor Google "G" mark.
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

// The page to come back to after the OAuth round-trip: the current path and
// query, minus a stale `auth_error`, plus `review=open` for the review intent.
function useRedirectTarget(intent?: 'review') {
  const { pathname, searchStr } = useRouterState({
    select: (s) => s.location,
  })
  const params = new URLSearchParams(searchStr)
  params.delete('auth_error')
  if (intent === 'review') params.set('review', 'open')
  const query = params.toString()
  return `${pathname}${query ? `?${query}` : ''}`
}

export default function LoginModal({
  open,
  onClose,
  cafeName,
  intent,
  error,
}: LoginModalProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const redirect = useRedirectTarget(intent)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      className="relative flex flex-col gap-5 px-6 pt-8 pb-10 sm:max-w-100 sm:p-8"
    >
      <button
        type="button"
        aria-label={t('auth.close')}
        onClick={onClose}
        className="absolute top-4 right-4 cursor-pointer rounded-full p-1 text-bark hover:bg-grove-light"
      >
        <X size={20} aria-hidden="true" />
      </button>

      <div className="flex flex-col gap-2">
        <span className="text-xl font-bold text-forest">{t('brand')}</span>
        <h2 id={titleId} className="text-lg font-bold text-forest">
          {cafeName
            ? t('auth.titleReview', { cafe: cafeName })
            : t('auth.title')}
        </h2>
        <p className="text-sm text-bark">{t('auth.subtitle')}</p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl bg-error-bg px-3 py-2.5 text-[13px] text-error"
        >
          <CircleAlert
            size={16}
            aria-hidden="true"
            className="mt-px shrink-0 text-error-accent"
          />
          <span>{t(`auth.${error}`)}</span>
        </div>
      )}

      <a
        href={loginUrl('google', redirect)}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-forest-light bg-surface text-sm font-semibold text-forest no-underline transition-colors hover:bg-forest-lighter"
      >
        <GoogleMark />
        {t('auth.continueWithGoogle')}
      </a>

      <p className="text-center text-xs text-bark">
        <Trans
          i18nKey="auth.legal"
          components={{
            link: (
              <LocaleLink
                to="/{-$locale}/privacy-policy"
                onClick={onClose}
                className="font-semibold text-moss underline"
              />
            ),
          }}
        />
      </p>
    </Dialog>
  )
}
