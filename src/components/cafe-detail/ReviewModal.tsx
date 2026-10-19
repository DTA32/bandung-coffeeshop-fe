import { useEffect, useId, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Check, ChevronDown, Plus, X } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import Dialog from '@/components/Dialog'
import LocaleLink from '@/components/LocaleLink'
import { StarInput } from './StarRating'
import { useAuth } from '@/lib/hooks/useAuth'
import { useLocale, dateLocale } from '@/lib/locale'
import { cn } from '@/lib/cn'
import { getFilterOptions } from '@/lib/api/filters'
import type { FilterOptions } from '@/lib/api/filters'
import {
  ApiError,
  createReview,
  deleteReview,
  updateReview,
} from '@/lib/api/cafe'
import type { MyReview, RatingType, ReviewPayload } from '@/lib/api/cafe'

const NAME_MAX = 50
const CONTENT_MAX = 2000
const VISIT_YEARS = 15

interface CategoryOption {
  key: string
  name: string
  lower: number
  upper: number | null // null on the open-ended top price tier
}

interface Category {
  type: RatingType
  name: string
  options: CategoryOption[]
}

// Every rating type the review can carry: the /v1/filters rating categories
// plus price-rank, which the API surfaces as price tiers.
function buildCategories(f: FilterOptions, priceName: string): Category[] {
  const cats: Category[] = f.rating_categories.map((c) => ({
    type: c.type as RatingType,
    name: c.display_name,
    options: [...c.options]
      .sort((a, b) => a.lower_bound - b.lower_bound)
      .map((o) => ({
        key: String(o.id),
        name: o.name,
        lower: o.lower_bound,
        upper: o.upper_bound,
      })),
  }))
  if (f.price_tiers.length > 0) {
    cats.unshift({
      type: 'price-rank',
      name: priceName,
      options: f.price_tiers.map((p) => ({
        key: p.label,
        name: p.label,
        lower: p.min,
        upper: p.max,
      })),
    })
  }
  return cats
}

// The score sent for a picked bucket: its midpoint, or its lower bound when
// it has no upper bound.
function optionValue(o: CategoryOption): number {
  return o.upper == null ? o.lower : (o.lower + o.upper) / 2
}

function bucketFor(
  options: CategoryOption[],
  score: number,
): CategoryOption | undefined {
  return (
    options.find(
      (o) => score >= o.lower && (o.upper == null || score <= o.upper),
    ) ?? [...options].reverse().find((o) => score >= o.lower)
  )
}

// The current year and month in WIB, which is what the API validates
// `visited_at` against.
function currentMonthWIB(): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(new Date())
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value)
  return { year: get('year'), month: get('month') }
}

type View = 'form' | 'confirmRemove' | 'success' | 'removed' | 'error'

interface ReviewModalProps {
  cafeId: string
  cafeName: string
  // The user's existing review: present → edit mode.
  mine: MyReview | null
  // Overall score picked from the submit card's stars.
  initialScore?: number | null
  onClose: () => void
  // Called after a successful save or removal.
  onChanged: () => void
}

export default function ReviewModal({
  cafeId,
  cafeName,
  mine: mineProp,
  initialScore,
  onClose,
  onChanged,
}: ReviewModalProps) {
  const { t } = useTranslation()
  const locale = useLocale()
  const { me } = useAuth()
  const ids = {
    title: useId(),
    overall: useId(),
    wfc: useId(),
    name: useId(),
    nameHint: useId(),
    visit: useId(),
    content: useId(),
  }
  // Snapshot at open: the parent refetches the review after a save, which must
  // not flip the modal between create and edit mode while it is showing.
  const [mine] = useState(mineProp)
  const isEdit = mine !== null

  const [view, setView] = useState<View>('form')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<{
    action: 'save' | 'remove'
    error: ApiError | null
  } | null>(null)
  const [showErrors, setShowErrors] = useState(false)

  const [overall, setOverall] = useState<number | null>(
    initialScore ??
      (mine?.overall_score != null ? Math.round(mine.overall_score) : null),
  )
  const [wfc, setWfc] = useState<number | null>(
    mine?.wfc_score != null ? Math.round(mine.wfc_score) : null,
  )
  const [name, setName] = useState(
    (mine?.reviewer_name ?? me?.name ?? '').slice(0, NAME_MAX),
  )
  const [visitYear, setVisitYear] = useState(
    mine?.visited_at?.slice(0, 4) ?? '',
  )
  const [visitMonth, setVisitMonth] = useState(
    mine?.visited_at?.slice(5, 7) ?? '',
  )
  const [content, setContent] = useState(mine?.content ?? '')
  // Score per rating type. Saved scores are kept as-is until the user picks
  // another bucket, so an untouched rating is not shifted to the midpoint.
  const [ratings, setRatings] = useState<Partial<Record<RatingType, number>>>(
    mine?.ratings ?? {},
  )
  const [expanded, setExpanded] = useState<RatingType[]>(
    Object.keys(mine?.ratings ?? {}) as RatingType[],
  )

  const [filters, setFilters] = useState<FilterOptions | null>(null)
  const [filtersFailed, setFiltersFailed] = useState(false)
  useEffect(() => {
    let cancelled = false
    getFilterOptions(locale)
      .then((f) => {
        if (!cancelled) setFilters(f)
      })
      .catch(() => {
        if (!cancelled) setFiltersFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [locale])
  const categories = useMemo(
    () =>
      filters ? buildCategories(filters, t('reviews.modal.priceRank')) : [],
    [filters, t],
  )

  const now = useMemo(currentMonthWIB, [])
  const years = Array.from({ length: VISIT_YEARS }, (_, i) =>
    String(now.year - i),
  )
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: new Date(Date.UTC(2000, i, 1)).toLocaleString(dateLocale(locale), {
      month: 'long',
      timeZone: 'UTC',
    }),
    future: Number(visitYear) === now.year && i + 1 > now.month,
  }))

  const errors = {
    overall: overall == null,
    name: name.trim() === '',
    visit:
      (visitYear === '') !== (visitMonth === '') ||
      (Number(visitYear) === now.year && Number(visitMonth) > now.month),
  }
  const invalid = errors.overall || errors.name || errors.visit

  function payload(): ReviewPayload {
    const picked = Object.fromEntries(
      Object.entries(ratings).filter(([type]) =>
        expanded.includes(type as RatingType),
      ),
    ) as ReviewPayload['ratings']
    return {
      overall_score: overall ?? 0,
      wfc_score: wfc,
      reviewer_name: name.trim(),
      visited_at: visitYear && visitMonth ? `${visitYear}-${visitMonth}` : null,
      content: content.trim() || null,
      ratings: picked,
    }
  }

  async function run(action: 'save' | 'remove') {
    setBusy(true)
    try {
      if (action === 'remove') {
        await deleteReview(cafeId)
        setView('removed')
      } else {
        const body = payload()
        await (isEdit ? updateReview(cafeId, body) : createReview(cafeId, body))
        setView('success')
      }
      setFailed(null)
      onChanged()
    } catch (e) {
      setFailed({ action, error: e instanceof ApiError ? e : null })
      setView('error')
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    if (invalid) {
      setShowErrors(true)
      return
    }
    void run('save')
  }

  function pickOption(type: RatingType, option: CategoryOption) {
    setRatings((cur) => {
      const current = cur[type]
      const selected =
        current != null &&
        bucketFor(
          categories.find((c) => c.type === type)?.options ?? [],
          current,
        )?.key === option.key
      const next = { ...cur }
      if (selected) delete next[type]
      else next[type] = optionValue(option)
      return next
    })
  }

  function collapse(type: RatingType) {
    setExpanded((cur) => cur.filter((x) => x !== type))
    setRatings((cur) => {
      const next = { ...cur }
      delete next[type]
      return next
    })
  }

  if (view !== 'form') {
    return (
      <Dialog
        key={view}
        open
        onClose={onClose}
        labelledBy={ids.title}
        className="flex flex-col items-center gap-4 px-6 pt-8 pb-10 text-center sm:max-w-110 sm:p-8"
      >
        {view === 'confirmRemove' ? (
          <ResultContent
            titleId={ids.title}
            tone="error"
            title={t('reviews.modal.confirmRemoveTitle')}
            subtitle={t('reviews.modal.confirmRemoveBody', { cafe: cafeName })}
          >
            <SecondaryButton onClick={() => setView('form')} disabled={busy}>
              {t('reviews.modal.cancel')}
            </SecondaryButton>
            <button
              type="button"
              onClick={() => void run('remove')}
              disabled={busy}
              className="h-10 cursor-pointer rounded-full border-none bg-error px-5 text-sm font-bold text-white disabled:cursor-default disabled:opacity-60"
            >
              {busy
                ? t('reviews.modal.saving')
                : t('reviews.modal.confirmRemove')}
            </button>
          </ResultContent>
        ) : view === 'error' ? (
          <ResultContent
            titleId={ids.title}
            tone="error"
            title={
              failed?.action === 'remove'
                ? t('reviews.result.failedRemoveTitle')
                : t('reviews.result.failedTitle')
            }
            subtitle={t('reviews.result.failedSubtitle')}
            detail={
              failed?.error && failed.error.status < 500
                ? failed.error.message
                : undefined
            }
          >
            <SecondaryButton onClick={() => setView('form')} disabled={busy}>
              {t('reviews.result.back')}
            </SecondaryButton>
            <PrimaryButton
              onClick={() => void run(failed?.action ?? 'save')}
              disabled={busy}
            >
              {busy ? t('reviews.modal.saving') : t('reviews.result.retry')}
            </PrimaryButton>
          </ResultContent>
        ) : (
          <ResultContent
            titleId={ids.title}
            tone="success"
            title={
              view === 'removed'
                ? t('reviews.result.removedTitle')
                : t('reviews.result.successTitle')
            }
            subtitle={
              view === 'removed'
                ? t('reviews.result.removedSubtitle')
                : t('reviews.result.successSubtitle')
            }
            body={
              view === 'success' ? t('reviews.result.successBody') : undefined
            }
          >
            <PrimaryButton onClick={onClose}>
              {t('reviews.result.done')}
            </PrimaryButton>
          </ResultContent>
        )}
      </Dialog>
    )
  }

  const expandedCats = categories.filter((c) => expanded.includes(c.type))
  const collapsedCats = categories.filter((c) => !expanded.includes(c.type))

  return (
    <Dialog
      key="form"
      open
      onClose={onClose}
      labelledBy={ids.title}
      className="flex max-h-[92dvh] flex-col sm:max-w-170"
    >
      <div className="flex items-center justify-between gap-4 border-b border-grove-light px-5 py-4 sm:px-6">
        <h2 id={ids.title} className="m-0 text-lg font-bold text-forest">
          {t('reviews.modal.title', { cafe: cafeName })}
        </h2>
        <button
          type="button"
          aria-label={t('reviews.modal.close')}
          onClick={onClose}
          className="cursor-pointer rounded-full border-none bg-transparent p-1 text-bark hover:bg-grove-light"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <form
        noValidate
        onSubmit={onSubmit}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div
              className={cn(
                'flex flex-col items-center gap-3 rounded-2xl border bg-forest-lighter p-4 text-center',
                showErrors && errors.overall
                  ? 'border-error-accent'
                  : 'border-grove-light',
              )}
            >
              <p
                id={ids.overall}
                className="m-0 text-[15px] font-bold text-forest"
              >
                {t('reviews.modal.overallQuestion')}
              </p>
              <StarInput
                value={overall}
                onChange={setOverall}
                labelledBy={ids.overall}
                showLabels
              />
              {showErrors && errors.overall && (
                <FieldError>{t('reviews.modal.errorOverall')}</FieldError>
              )}
            </div>
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-grove-light bg-surface p-4 text-center">
              <p
                id={ids.wfc}
                className="m-0 text-[13px] font-semibold text-forest"
              >
                {t('reviews.modal.wfcQuestion')}{' '}
                <span className="font-normal text-forest-light">
                  {t('reviews.modal.optional')}
                </span>
              </p>
              <StarInput
                value={wfc}
                onChange={setWfc}
                labelledBy={ids.wfc}
                size={26}
                showLabels
                clearable
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={ids.name}
                className="text-[13px] font-semibold text-forest"
              >
                {t('reviews.modal.name')}
              </label>
              <input
                id={ids.name}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={NAME_MAX}
                required
                autoComplete="name"
                aria-invalid={showErrors && errors.name}
                aria-describedby={ids.nameHint}
                className={cn(
                  'h-11 rounded-xl border bg-surface px-3 text-sm text-forest outline-none focus:border-moss',
                  showErrors && errors.name
                    ? 'border-error-accent'
                    : 'border-grove-light',
                )}
              />
              <span id={ids.nameHint} className="text-[11px] text-forest-light">
                {t('reviews.modal.nameHint')}
              </span>
              {showErrors && errors.name && (
                <FieldError>{t('reviews.modal.errorName')}</FieldError>
              )}
            </div>
            <fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-none p-0">
              <legend
                id={ids.visit}
                className="mb-1.5 p-0 text-[13px] font-semibold text-forest"
              >
                {t('reviews.modal.visit')}{' '}
                <span className="font-normal text-forest-light">
                  {t('reviews.modal.optional')}
                </span>
              </legend>
              <div className="grid grid-cols-[3fr_2fr] gap-2">
                <Select
                  label={t('reviews.modal.month')}
                  value={visitMonth}
                  onChange={setVisitMonth}
                  invalid={showErrors && errors.visit}
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value} disabled={m.future}>
                      {m.label}
                    </option>
                  ))}
                </Select>
                <Select
                  label={t('reviews.modal.year')}
                  value={visitYear}
                  onChange={setVisitYear}
                  invalid={showErrors && errors.visit}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              </div>
              {showErrors && errors.visit && (
                <FieldError>{t('reviews.modal.errorVisit')}</FieldError>
              )}
            </fieldset>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={ids.content}
              className="text-[13px] font-semibold text-forest"
            >
              {t('reviews.modal.content')}{' '}
              <span className="font-normal text-forest-light">
                {t('reviews.modal.optional')}
              </span>
            </label>
            <textarea
              id={ids.content}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={CONTENT_MAX}
              rows={4}
              className="resize-y rounded-xl border border-grove-light bg-surface px-3 py-2.5 text-sm leading-relaxed text-forest outline-none focus:border-moss"
            />
            <span className="self-end text-[11px] text-forest-light">
              {content.length} / {CONTENT_MAX}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <p className="m-0 text-[13px] font-semibold text-forest">
              {t('reviews.modal.ratings')}{' '}
              <span className="font-normal text-forest-light">
                {t('reviews.modal.optional')}
              </span>
            </p>
            {filtersFailed && (
              <p className="m-0 text-xs text-bark">
                {t('reviews.modal.categoriesFailed')}
              </p>
            )}
            {!filters && !filtersFailed && (
              <div className="flex flex-wrap gap-2" aria-hidden="true">
                {[20, 14, 24, 18, 16].map((w) => (
                  <span
                    key={w}
                    className="block h-8 animate-pulse rounded-full bg-grove-light"
                    style={{ width: `${w * 4}px` }}
                  />
                ))}
              </div>
            )}
            {expandedCats.map((cat) => {
              const score = ratings[cat.type]
              const selected =
                score != null ? bucketFor(cat.options, score)?.key : undefined
              return (
                <div
                  key={cat.type}
                  className="flex flex-col gap-2 rounded-xl bg-forest-lighter p-3 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center justify-between gap-2 sm:w-36 sm:shrink-0">
                    <span
                      id={`${ids.content}-${cat.type}`}
                      className="text-[13px] font-semibold text-forest"
                    >
                      {cat.name}
                    </span>
                    <CollapseButton
                      className="flex sm:hidden"
                      label={t('reviews.modal.removeCategory', {
                        name: cat.name,
                      })}
                      onClick={() => collapse(cat.type)}
                    />
                  </div>
                  <div
                    role="group"
                    aria-labelledby={`${ids.content}-${cat.type}`}
                    className="flex flex-1 flex-wrap gap-2"
                  >
                    {cat.options.map((o) => (
                      <button
                        key={o.key}
                        type="button"
                        aria-pressed={selected === o.key}
                        onClick={() => pickOption(cat.type, o)}
                        className={cn(
                          'min-h-8 flex-1 cursor-pointer rounded-full border px-3 py-1 text-xs',
                          selected === o.key
                            ? 'border-moss bg-moss font-semibold text-white'
                            : 'border-grove-light bg-surface text-moss-dark hover:border-moss',
                        )}
                      >
                        {o.name}
                      </button>
                    ))}
                  </div>
                  <CollapseButton
                    className="hidden sm:flex"
                    label={t('reviews.modal.removeCategory', {
                      name: cat.name,
                    })}
                    onClick={() => collapse(cat.type)}
                  />
                </div>
              )
            })}
            {collapsedCats.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {collapsedCats.map((cat) => (
                  <button
                    key={cat.type}
                    type="button"
                    onClick={() => setExpanded((cur) => [...cur, cat.type])}
                    aria-label={t('reviews.modal.addCategory', {
                      name: cat.name,
                    })}
                    className="flex h-8 cursor-pointer items-center gap-1 rounded-full border border-grove-light bg-surface px-3 text-xs font-medium text-moss hover:bg-forest-lighter"
                  >
                    <Plus size={12} aria-hidden="true" />
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-grove-light px-5 py-4 sm:px-6">
          <p className="m-0 text-xs leading-relaxed text-bark">
            <Trans
              i18nKey="reviews.modal.notice"
              components={{
                policy: (
                  <LocaleLink
                    to="/{-$locale}/privacy-policy"
                    onClick={onClose}
                    className="font-semibold text-moss underline"
                  />
                ),
              }}
            />
          </p>
          <div
            className={cn(
              'flex flex-col-reverse gap-2 sm:flex-row sm:items-center',
              isEdit ? 'sm:justify-between' : 'sm:justify-end',
            )}
          >
            {isEdit && (
              <button
                type="button"
                onClick={() => setView('confirmRemove')}
                disabled={busy}
                className="h-11 cursor-pointer rounded-full border-none bg-transparent px-4 text-sm font-semibold text-error hover:bg-error-bg"
              >
                {t('reviews.modal.remove')}
              </button>
            )}
            <button
              type="submit"
              disabled={busy}
              className="h-11 cursor-pointer rounded-full border-none bg-moss px-6 text-sm font-bold text-white hover:bg-forest disabled:cursor-default disabled:opacity-60"
            >
              {busy
                ? t('reviews.modal.saving')
                : isEdit
                  ? t('reviews.modal.update')
                  : t('reviews.modal.submit')}
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  )
}

function FieldError({ children }: { children: ReactNode }) {
  return (
    <span role="alert" className="text-xs text-error">
      {children}
    </span>
  )
}

function Select({
  label,
  value,
  onChange,
  invalid,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  children: ReactNode
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        aria-invalid={invalid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-11 w-full cursor-pointer appearance-none rounded-xl border bg-surface pr-8 pl-3 text-sm text-forest outline-none focus:border-moss',
          invalid ? 'border-error-accent' : 'border-grove-light',
          !value && 'text-forest-light',
        )}
      >
        <option value="">{label}</option>
        {children}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-bark"
      />
    </div>
  )
}

function CollapseButton({
  label,
  onClick,
  className,
}: {
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-bark hover:bg-grove-light',
        className,
      )}
    >
      <X size={14} aria-hidden="true" />
    </button>
  )
}

function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-10 cursor-pointer rounded-full border-none bg-moss px-6 text-sm font-bold text-white hover:bg-forest disabled:cursor-default disabled:opacity-60"
    >
      {children}
    </button>
  )
}

function SecondaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-10 cursor-pointer rounded-full border border-grove-light bg-surface px-5 text-sm font-semibold text-moss hover:bg-forest-lighter disabled:cursor-default disabled:opacity-60"
    >
      {children}
    </button>
  )
}

function ResultContent({
  titleId,
  tone,
  title,
  subtitle,
  detail,
  body,
  children,
}: {
  titleId: string
  tone: 'success' | 'error'
  title: string
  subtitle: string
  detail?: string
  body?: string
  children: ReactNode
}) {
  return (
    <>
      <span
        className={cn(
          'flex size-14 items-center justify-center rounded-full',
          tone === 'success'
            ? 'bg-forest-lighter text-moss'
            : 'bg-error-bg text-error-accent',
        )}
      >
        {tone === 'success' ? (
          <Check size={26} aria-hidden="true" />
        ) : (
          <X size={26} aria-hidden="true" />
        )}
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 id={titleId} className="m-0 text-xl font-bold text-forest">
          {title}
        </h2>
        <p className="m-0 text-sm text-bark">{subtitle}</p>
        {detail && (
          <p className="m-0 text-xs text-error" role="alert">
            {detail}
          </p>
        )}
      </div>
      {body && (
        <p className="m-0 text-[13px] leading-relaxed text-moss-dark">{body}</p>
      )}
      <div className="flex flex-wrap justify-center gap-2 pt-1">{children}</div>
    </>
  )
}
