import type { SrpItem } from '@/lib/srp'
import type { CafeListing } from '@/lib/api/search'
import type { Locale } from '@/i18n'
import { breadcrumbJsonLd, cafeItemListJsonLd, localizedPath } from '@/lib/seo'
import type { Crumb, SeoMeta } from '@/lib/seo'

type TFn = (key: string) => string
type Labelable = { name: string; type: string }

// "dago" → "Dago". Title-cases location slugs and rating type suffixes.
export function prettifySlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// Formats anchor / clause text from a {name, type}. Wording + i18n live here,
// not in the loader:
//   - price → "Cheap" (only the cheap tier is SRP-eligible today)
//   - explore root → the localized "Explore"
//   - location → the title-cased slug
//   - rating → "<name> <localized category>" (EN) / "<localized category> <name>"
//     (ID), e.g. "Hangout Vibe" / "Suasana Nongkrong"
//   - tag → the name as-is
export function formatSrpLabel(
  item: Labelable,
  t: TFn,
  locale: string,
): string {
  switch (item.type) {
    case 'price':
      return t('explore.priceCheap')
    case 'explore':
      return t('explore.breadcrumb.explore')
    case 'location':
      return prettifySlug(item.name)
    case 'tag':
      return item.name
    default: {
      // A rating category type (vibe / noise / …) → its localized label.
      const translatedType = t(`cafe.ratingLabels.${item.type}`)
      const formattedType = translatedType || prettifySlug(item.type)
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
    jsonLd: [
      breadcrumbJsonLd(exploreCrumbs(crumbs, t, locale)),
      cafeItemListJsonLd(cafes, locale),
    ],
  }
}
