import type { Locale } from '@/i18n'
import { localePrefix } from '@/lib/locale'
import type { CafeData, CafeReview } from '@/lib/api/cafe'
import type { CafeListing } from '@/lib/api/search'

export const SITE_URL = 'https://bdgcafe.com'
export const SITE_NAME = 'BDGCafé'
// Fallback OG image (the site logo) for pages without a content image.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo512.png`

// Locale-prefixed path: '/en/...' for English, bare for Indonesian. `path`
// starts with '/'; '/' (home) → '/en' or '/'.
export function localizedPath(locale: Locale, path: string): string {
  const prefix = localePrefix(locale)
  if (path === '/') return prefix || '/'
  return prefix + path
}

export interface Crumb {
  name: string
  path: string // locale-prefixed path (see localizedPath)
}

type TFn = (key: string) => string

function homeCrumb(t: TFn, locale: Locale): Crumb {
  return {
    name: t('explore.breadcrumb.home'),
    path: localizedPath(locale, '/'),
  }
}

export function aboutCrumbs(t: TFn, locale: Locale): Crumb[] {
  return [
    homeCrumb(t, locale),
    { name: t('nav.about'), path: localizedPath(locale, '/about') },
  ]
}

export function privacyPolicyCrumbs(t: TFn, locale: Locale): Crumb[] {
  return [
    homeCrumb(t, locale),
    {
      name: t('nav.privacyPolicy'),
      path: localizedPath(locale, '/privacy-policy'),
    },
  ]
}

export function mitmCrumbs(t: TFn, locale: Locale): Crumb[] {
  return [
    homeCrumb(t, locale),
    {
      name: t('mitm.title'),
      path: localizedPath(locale, '/meet-in-the-middle'),
    },
  ]
}

// Home › Explore › {District} › {Area} › {Cafe}. Locations are the cafe's
// ancestor chain (district, area); each links to its explore path prefix.
export function cafeCrumbs(cafe: CafeData, t: TFn, locale: Locale): Crumb[] {
  const crumbs: Crumb[] = [
    homeCrumb(t, locale),
    {
      name: t('explore.breadcrumb.explore'),
      path: localizedPath(locale, '/explore'),
    },
  ]
  cafe.locations.forEach((loc, i) => {
    const splat = cafe.locations
      .slice(0, i + 1)
      .map((l) => l.id)
      .join('/')
    crumbs.push({
      name: loc.name,
      path: localizedPath(locale, `/explore/${splat}`),
    })
  })
  crumbs.push({
    name: cafe.name,
    path: localizedPath(locale, `/cafe/${cafe.id}`),
  })
  return crumbs
}

// The per-page SEO bundle. Built in the loader (dynamic pages: cafe/explore) or
// the route head (static pages: home/about/mitm), then rendered by seoHead().
export interface SeoMeta {
  title: string
  description: string
  canonicalPath: string // locale-prefixed; includes ?page=N when applicable
  locale: Locale // the page's locale; drives og:locale + its alternate
  ogImage?: string // absolute content image; falls back to the site logo
  jsonLd?: object[]
}

// Open Graph locale tag (underscore form).
function ogLocale(locale: Locale): string {
  return locale === 'en' ? 'en_US' : 'id_ID'
}

// Strips the '/en' locale prefix off a path, yielding the bare (Indonesian)
// path. '/en' → '/', '/en/explore/dago?page=2' → '/explore/dago?page=2'.
function barePath(path: string): string {
  if (path === '/en') return '/'
  if (path.startsWith('/en/')) return path.slice(3)
  return path
}

// hreflang alternates for a page: the id (bare) and en (/en) URLs, plus
// x-default → id (the default locale). Each page advertises the full set,
// including itself. Built from the canonical path by toggling the locale prefix.
function alternateLinks(canonicalPath: string) {
  const bare = barePath(canonicalPath)
  const idHref = SITE_URL + bare
  const enHref = SITE_URL + (bare === '/' ? '/en' : '/en' + bare)
  return [
    { rel: 'alternate', hrefLang: 'id-ID', href: idHref },
    { rel: 'alternate', hrefLang: 'en-ID', href: enHref },
    { rel: 'alternate', hrefLang: 'x-default', href: idHref },
  ]
}

// Maps a SeoMeta into a TanStack head object: title + description + Open Graph /
// Twitter meta, the canonical link, hreflang alternates, and any JSON-LD
// <script>s. og:image falls back to the site logo when there's no content image,
// so every page ships a valid image; twitter:card is the large card only for a
// real content image.
export function seoHead(seo: SeoMeta) {
  const url = SITE_URL + seo.canonicalPath
  const ogImage = seo.ogImage ?? DEFAULT_OG_IMAGE
  return {
    meta: [
      { title: seo.title },
      { name: 'description', content: seo.description },
      { property: 'og:title', content: seo.title },
      { property: 'og:description', content: seo.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: url },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:locale', content: ogLocale(seo.locale) },
      {
        property: 'og:locale:alternate',
        content: ogLocale(seo.locale === 'en' ? 'id' : 'en'),
      },
      { property: 'og:image', content: ogImage },
      {
        name: 'twitter:card',
        content: seo.ogImage ? 'summary_large_image' : 'summary',
      },
      { name: 'twitter:image', content: ogImage },
    ],
    links: [
      { rel: 'canonical', href: url },
      ...alternateLinks(seo.canonicalPath),
    ],
    scripts: (seo.jsonLd ?? []).map((node) => ({
      type: 'application/ld+json',
      children: JSON.stringify(node),
    })),
  }
}

// --- JSON-LD builders --------------------------------------------------------
// All return plain objects; seoHead serializes them into ld+json <script>s.

export function breadcrumbJsonLd(crumbs: Crumb[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: SITE_URL + c.path,
    })),
  }
}

// Home: the site itself + the publisher.
export function websiteJsonLd(locale: Locale): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL + (localePrefix(locale) || '/'),
    inLanguage: locale,
  }
}

export function organizationJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Honest, personal coffee shop reviews and discovery in Bandung.',
  }
}

// Meet in the Middle is a free browser tool.
export function webApplicationJsonLd(name: string, path: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url: SITE_URL + path,
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
  }
}

// Cafe detail: the place + our single, opinionated review of it.
export function cafeJsonLd(
  cafe: CafeData,
  review: CafeReview,
  canonicalPath: string,
): object {
  const locality = cafe.locations.at(-1)?.name
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: cafe.name,
    url: SITE_URL + canonicalPath,
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality ?? 'Bandung',
      addressRegion: 'Bandung',
      addressCountry: 'ID',
    },
  }
  if (cafe.images[0]?.url) node.image = cafe.images[0].url
  if (cafe.instagram)
    node.sameAs = `https://www.instagram.com/${cafe.instagram}`
  const priceRange = cafe.price.rank?.label
  if (priceRange) node.priceRange = priceRange
  if (cafe.open_hour && cafe.close_hour) {
    const is24h = cafe.open_hour === cafe.close_hour
    node.openingHoursSpecification = {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: is24h ? '00:00' : cafe.open_hour,
      closes: is24h ? '23:59' : cafe.close_hour,
    }
  }
  // Single-author review → schema.org Review, scored out of 5.
  if (review.overall_score != null) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: review.overall_score,
      bestRating: 5,
      worstRating: 0,
      ratingCount: 1,
      reviewCount: 1,
    }
    node.review = {
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.overall_score,
        bestRating: 5,
        worstRating: 0,
      },
      author: { '@type': 'Organization', name: SITE_NAME },
    }
  }
  return node
}

// Explore: the list of cafes currently shown (helps the SRP read as a listing).
export function cafeItemListJsonLd(
  cafes: CafeListing[],
  locale: Locale,
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: cafes.map((cafe, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: SITE_URL + localizedPath(locale, `/cafe/${cafe.id}`),
      name: cafe.name,
    })),
  }
}
