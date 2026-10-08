import type { SrpItem } from '@/lib/srp'
import type { CafeListing } from '@/lib/api/search'
import type { CafeData, CafePrice, CafeReview } from '@/lib/api/cafe'
import {
  breadcrumbJsonLd,
  cafeItemListJsonLd,
  closedCafesCrumbs,
  localizedPath,
} from '@/lib/seo'
import type { Crumb, SeoMeta } from '@/lib/seo'
import type { Locale } from '@/i18n'

type TFn = (key: string, options?: Record<string, unknown>) => string
type Labelable = { name: string; type: string; typeLabel?: string }

// "dago" → "Dago". Title-cases location slugs and rating type suffixes.
export function prettifySlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// Formats anchor / clause text from a {name, type}. Wording + i18n live here,
// not in the loader:
//   - explore root → the localized "Explore"
//   - location → the title-cased slug
//   - rating → "<name> <localized category>" (EN) / "<localized category> <name>"
//     (ID), e.g. "Hangout Vibe" / "Suasana Nongkrong"
//   - tag / price → the name as-is (price tiers are named by the backend,
//     e.g. "Cheap")
export function formatSrpLabel(
  item: Labelable,
  t: TFn,
  locale: string,
): string {
  switch (item.type) {
    case 'explore':
      return t('explore.breadcrumb.explore')
    case 'location':
      return prettifySlug(item.name)
    case 'tag':
    case 'price':
      return item.name
    default: {
      // A rating category type (vibe / noise / …) → its localized label, served
      // by the backend (display_name) and threaded through as typeLabel. Falls
      // back to the prettified slug when the filter metadata was unavailable.
      const formattedType = item.typeLabel || prettifySlug(item.type)
      return locale === 'id'
        ? `${formattedType} ${item.name}`
        : `${item.name} ${formattedType}`
    }
  }
}

// " in Dago" / " near Gedung Sate" from the backend's formatted_location_name
// (which already carries its preposition), or " in Bandung" when unfocused.
export function srpLocationClause(
  formattedLocationName: string,
  t: TFn,
): string {
  return formattedLocationName
    ? ` ${formattedLocationName}`
    : ` ${t('explore.in')} Bandung`
}

// The page's active filter labels, pulled from the crumbs (one each, by cap).
function filterParts(crumbs: SrpItem[], t: TFn, locale: string) {
  const price = crumbs.find((c) => c.type === 'price')
  const tag = crumbs.find((c) => c.type === 'tag')
  const rating = crumbs.find(
    (c) => !['explore', 'location', 'tag', 'price'].includes(c.type),
  )
  return {
    price: price && formatSrpLabel(price, t, locale),
    tag: tag && formatSrpLabel(tag, t, locale),
    ratingClause:
      rating && `${t('explore.h1.with')} ${formatSrpLabel(rating, t, locale)}`,
  }
}

// "<price> <tag> <noun> <with rating>" (EN) / "<noun> <price> <tag> <dengan
// rating>" (ID). `noun` is "cafe"/"Cafe" (H1/title) or "cafes"/"cafe" (meta).
function composePhrase(
  parts: ReturnType<typeof filterParts>,
  noun: string,
  locale: string,
): string {
  const ordered =
    locale === 'id'
      ? [noun, parts.price, parts.tag, parts.ratingClause]
      : [parts.price, parts.tag, noun, parts.ratingClause]
  return ordered.filter(Boolean).join(' ')
}

// The explore page H1:
//   EN: "<price> <tag> cafe [with <rating>]<locationClause>"
//   ID: "Cafe <price> <tag> [dengan <rating>]<locationClause>"
// Each filter part is omitted when absent, and the first letter is capitalized
// so the bare "/explore" case reads "Cafe in Bandung". `locationClause` already
// carries its leading space + preposition (see srpLocationClause).
export function buildExploreH1(
  crumbs: SrpItem[],
  locationClause: string,
  t: TFn,
  locale: string,
): string {
  const parts = filterParts(crumbs, t, locale)
  const h1 = composePhrase(parts, t('explore.h1.cafe'), locale) + locationClause
  return h1.charAt(0).toUpperCase() + h1.slice(1)
}

// SEO meta for the explore page: the title mirrors the H1 + brand; the
// description is a natural sentence that folds in the same filter + location
// keywords. Built server-side in the route head.
export function buildExploreMeta(
  crumbs: SrpItem[],
  formattedLocationName: string,
  t: TFn,
  locale: string,
): { title: string; description: string } {
  const clause = srpLocationClause(formattedLocationName, t)
  const title = `${buildExploreH1(crumbs, clause, t, locale)} | ${t('brand')}`

  const parts = filterParts(crumbs, t, locale)
  const phrase = composePhrase(parts, t('explore.meta.cafes'), locale)
  const description = `${t('explore.meta.descLead')} ${phrase}${clause}. ${t('explore.meta.descTail')}`

  return { title, description }
}

// The full SEO bundle for an explore page: meta title/description + canonical +
// JSON-LD (BreadcrumbList from the SRP crumbs, ItemList of the shown cafes).
// Home › Explore › <path crumbs> as concrete {name, path} crumbs. Shared by the
// breadcrumb JSON-LD (below) and the visible breadcrumb (ExploreContent renders
// the generic Breadcrumb from these). Each srp crumb's url is its splat ('' =
// the explore index), turned into a locale-prefixed path.
export function exploreCrumbs(
  crumbs: SrpItem[],
  t: TFn,
  locale: Locale,
): Crumb[] {
  return [
    { name: t('explore.breadcrumb.home'), path: localizedPath(locale, '/') },
    ...crumbs.map((c) => ({
      name: formatSrpLabel(c, t, locale),
      path: localizedPath(locale, c.url ? `/explore/${c.url}` : '/explore'),
    })),
  ]
}

export function buildExploreSeo(args: {
  crumbs: SrpItem[]
  cafes: CafeListing[]
  formattedLocationName: string
  canonicalPath: string
  t: TFn
  locale: Locale
}): SeoMeta {
  const { crumbs, cafes, formattedLocationName, canonicalPath, t, locale } =
    args
  const { title, description } = buildExploreMeta(
    crumbs,
    formattedLocationName,
    t,
    locale,
  )
  return {
    title,
    description,
    canonicalPath,
    locale,
    jsonLd: [
      breadcrumbJsonLd(exploreCrumbs(crumbs, t, locale)),
      cafeItemListJsonLd(cafes, locale),
    ],
  }
}

// The closed-cafes archive: fixed title/description (no filters), canonical
// keeps ?page, JSON-LD is the Home › Closed Cafes crumb + the shown cafes.
export function buildClosedCafesSeo(args: {
  cafes: CafeListing[]
  page: number
  t: TFn
  locale: Locale
}): SeoMeta {
  const { cafes, page, t, locale } = args
  return {
    title: t('seo.closedCafesTitle'),
    description: t('seo.closedCafesDesc'),
    canonicalPath:
      localizedPath(locale, '/closed-cafes') +
      (page > 1 ? `?page=${page}` : ''),
    locale,
    jsonLd: [
      breadcrumbJsonLd(closedCafesCrumbs(t, locale)),
      cafeItemListJsonLd(cafes, locale),
    ],
  }
}

// Cafe detail page (CDP) meta. Titles target the branded "<name> <area>
// <intent>" queries (ulasan / menu / foto); descriptions are built from the
// cafe's own data so no two read the same.
export const CAFE_TITLE_MAX = 60
export const CAFE_DESC_MAX = 155

// Deciding tags for the description, most decisive first. Only one is used.
const CAFE_DESC_TAGS = [
  'indoor-smoking',
  'wfc-friendly',
  'air-conditioned-seating',
] as const

function hasPrice(price: CafePrice): boolean {
  return [
    price.price_range_min,
    price.price_range_max,
    price.coffee_price_min,
    price.coffee_price_max,
    price.snack_price_min,
    price.snack_price_max,
    price.food_price_min,
    price.food_price_max,
  ].some((v) => v !== null)
}

// "Ulasan, Harga Menu & Foto" / "Ulasan & Foto" / "Ulasan".
function joinKeywords(words: string[]): string {
  if (words.length < 2) return words.join('')
  return `${words.slice(0, -1).join(', ')} & ${words.at(-1)}`
}

// The cafe's deepest location, unless the name already says it
// ("Dreezel Coffee Tubagus Ismail" + "Tubagus Ismail" → no area).
function cafeArea(cafe: CafeData): string | undefined {
  const area = cafe.locations.at(-1)?.name
  if (!area) return undefined
  return cafe.name.toLowerCase().includes(area.toLowerCase()) ? undefined : area
}

// Title tiers, first that fits CAFE_TITLE_MAX wins (no brand suffix):
// name + area + full keywords → without "Foto" → name + full keywords →
// without "Foto" → name + area + "Ulasan" → name + "Ulasan".
// "Harga Menu" needs price data, "Foto" needs at least one image.
export function buildCafeTitle(cafe: CafeData, t: TFn): string {
  const review = t('seo.cafe.kwReview')
  const menu = hasPrice(cafe.price) ? t('seo.cafe.kwMenu') : undefined
  const photos = cafe.images.length > 0 ? t('seo.cafe.kwPhotos') : undefined
  const full = joinKeywords([review, menu, photos].filter(Boolean) as string[])
  const noPhotos = joinKeywords([review, menu].filter(Boolean) as string[])

  const area = cafeArea(cafe)
  const withArea = area ? `${cafe.name} ${area}` : undefined
  const tiers = [
    withArea && `${withArea} - ${full}`,
    withArea && `${withArea} - ${noPhotos}`,
    `${cafe.name} - ${full}`,
    `${cafe.name} - ${noPhotos}`,
    withArea && `${withArea} - ${review}`,
    `${cafe.name} - ${review}`,
  ].filter(Boolean) as string[]
  return tiers.find((x) => x.length <= CAFE_TITLE_MAX) ?? tiers.at(-1)!
}

function fmtK(n: number): string {
  return `Rp ${Math.floor(n / 1000)}k`
}

// The headline price range (excl. food), falling back to the coffee range.
function priceClause(price: CafePrice, t: TFn): string | undefined {
  const pairs: [number | null, number | null][] = [
    [price.price_range_min, price.price_range_max],
    [price.coffee_price_min, price.coffee_price_max],
  ]
  const [min, max] = pairs.find(([a, b]) => a !== null || b !== null) ?? []
  if (min != null && max != null) {
    const range =
      min === max ? fmtK(min) : `${fmtK(min)}–${Math.floor(max / 1000)}k`
    return t('seo.cafe.descPrice', { range })
  }
  if (min != null) return t('seo.cafe.descPriceFrom', { price: fmtK(min) })
  if (max != null) return t('seo.cafe.descPriceUpTo', { price: fmtK(max) })
  return undefined
}

// Hours only for active cafes: a closed one's old hours would mislead.
function hoursClause(cafe: CafeData, t: TFn): string | undefined {
  const { status, open_hour: open, close_hour: close } = cafe
  if (status !== 'active') return undefined
  if (open === '00:00' && close === '23:59') return t('seo.cafe.desc24Hours')
  if (open && close) return t('seo.cafe.descHours', { open, close })
  if (open) return t('seo.cafe.descOpenFrom', { open })
  if (close) return t('seo.cafe.descClosesAt', { close })
  return undefined
}

// The WiFi range label the score falls in ("Cepat" / "Fast").
function wifiClause(review: CafeReview, t: TFn): string | undefined {
  const wifi = review.ratings.wifi
  if (!wifi) return undefined
  const range = wifi.range.find((r) => wifi.score <= r.upper_bound)
  if (!range) return undefined
  return t('seo.cafe.descWifi', { label: range.name.toLowerCase() })
}

function tagClause(review: CafeReview, t: TFn): string | undefined {
  const slugs = new Set(review.tags.map((tag) => tag.slug))
  const slug = CAFE_DESC_TAGS.find((s) => slugs.has(s))
  return slug && t(`seo.cafe.descTag.${slug}`)
}

// "<name> di <area>, Bandung: <price>, <hours>, <wifi>, <tag>. <CTA>"
// Clauses go in priority order and drop from the end (CTA first) until the
// description fits CAFE_DESC_MAX. Missing data simply skips its clause.
export function buildCafeDescription(
  cafe: CafeData,
  review: CafeReview,
  t: TFn,
): string {
  const area = cafeArea(cafe)
  const location = area ? `${area}, Bandung` : 'Bandung'
  const lead = t('seo.cafe.descLead', { name: cafe.name, location })
  const facts = [
    priceClause(cafe.price, t),
    hoursClause(cafe, t),
    wifiClause(review, t),
    tagClause(review, t),
  ].filter(Boolean) as string[]
  const cta = t('seo.cafe.descCta')

  const compose = (n: number, withCta: boolean) => {
    const head =
      n > 0 ? `${lead}: ${facts.slice(0, n).join(', ')}.` : `${lead}.`
    return withCta ? `${head} ${cta}` : head
  }
  const candidates = [
    compose(facts.length, true),
    ...facts.map((_, i) => compose(facts.length - i, false)),
    compose(0, true),
    compose(0, false),
  ]
  return candidates.find((x) => x.length <= CAFE_DESC_MAX) ?? candidates.at(-1)!
}

export function buildCafeMeta(args: {
  cafe: CafeData
  review: CafeReview
  t: TFn
  locale: Locale
}): { title: string; description: string } {
  const { cafe, review, t } = args
  return {
    title: buildCafeTitle(cafe, t),
    description: buildCafeDescription(cafe, review, t),
  }
}
