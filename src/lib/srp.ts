import type { FilterOptions } from '@/lib/api/filters'
import type { SearchCafesParams } from '@/lib/api/search'

// SRP (Search Result Page) pretty URLs.
//
// An SRP path is a sequence of clean slugs after /explore that pre-fills a fixed
// set of filters, reachable at one canonical, SEO-friendly URL:
//
//   /explore/dago                          location
//   /explore/wfc-friendly                  tag
//   /explore/dago/wfc-friendly             location × tag
//   /explore/dago/wfc-friendly/quiet-noise location × tag × rating
//
// Rating/price slugs are namespaced by their category type ("quiet-noise",
// "bandung-price-rank"); the backend composes them in /v1/filters, so the
// registry below keys on the already-composed slug.
// Each segment belongs to exactly one axis. Three of the four axes (tag, price,
// rating) are recognized by slug membership in the registry fetched from
// /v1/filters — i.e. the backend's filter metadata IS the SRP substring registry,
// so we never hand-maintain a slug enum. Location is the FALLBACK axis: any
// segment that isn't a known filter slug is treated as a location id and
// validated against the location service by the route loader.

export type SrpAxis = 'location' | 'tag' | 'price' | 'rating'

// Canonical segment order. A path whose segments arrive in a different order is
// redirected to this order, so every page has exactly one URL (no duplicate
// content). Location first (it's the natural anchor and is path-hierarchical),
// then the feature axis (tag), then the spec axes (price, rating).
const AXIS_ORDER: SrpAxis[] = ['location', 'tag', 'price', 'rating']

// How many segments each axis may contribute to a single SRP path. These caps
// encode the SEO economics from docs/srp-filter-taxonomy.md:
//   - location ≤ 3   district / area / poi — one hierarchical location, never two
//   - tag      = 1   features never repeat; a 2-tag page slices inventory to
//                    near-empty (thin content) and explodes the URL space
//   - price    = 1   one spec
//   - rating   = 1   one spec  → price + rating = the "anchor + refinement" cap
// Exceeding any cap means the combination isn't worth a page → not a valid SRP.
const AXIS_CAP: Record<SrpAxis, number> = {
  location: 3,
  tag: 1,
  price: 1,
  rating: 1,
}

// The slug → meaning lookups, built once from /v1/filters. Tags carry their slug
// straight to the wire (the search API takes tag slugs); ratings resolve slug →
// bucket id (the search API takes ids); price resolves slug → numeric bounds.
export interface SrpRegistry {
  tag: Set<string>
  rating: Map<string, number> // slug → rating_category bucket id
  price: Map<string, { min: number; max: number | null }>
}

// A slug only enters the registry when it's non-empty: an empty slug is the
// backend's signal that a value isn't SRP-worthy (e.g. the mushy "Moderate"
// noise bucket has no slug, so it never gets a pretty URL).
export function buildSrpRegistry(options: FilterOptions): SrpRegistry {
  const tag = new Set<string>()
  for (const t of options.tags) if (t.slug) tag.add(t.slug)

  const rating = new Map<string, number>()
  for (const c of options.rating_categories)
    for (const o of c.options) if (o.slug) rating.set(o.slug, o.id)

  const price = new Map<string, { min: number; max: number | null }>()
  for (const p of options.price_tiers)
    if (p.slug) price.set(p.slug, { min: p.min, max: p.max })

  return { tag, rating, price }
}

// Precedence: a segment is classified against the filter registry first, so a
// slug that is also a location id resolves as a filter. Location is only the
// fallback. (With current data there is no actual collision — e.g. the "riau"
// price tier has no slug, so /explore/riau resolves to the riau *area*.)
function classify(segment: string, registry: SrpRegistry): SrpAxis {
  if (registry.tag.has(segment)) return 'tag'
  if (registry.price.has(segment)) return 'price'
  if (registry.rating.has(segment)) return 'rating'
  return 'location'
}

// The filter params an SRP path translates into (a subset of the search params).
type SrpFilterParams = Pick<
  SearchCafesParams,
  'tags' | 'ratings' | 'price_min' | 'price_max'
>

export interface ResolvedSrp {
  // Location segments in path order (district → area → poi); empty for a
  // pure-filter SRP like /explore/wfc-friendly.
  locationIds: string[]
  // The pre-filled filters this path maps to, ready to merge into searchCafes.
  params: SrpFilterParams
  // The canonical slug path (segments reordered per AXIS_ORDER, joined by '/').
  // The loader redirects when this differs from the requested path.
  canonical: string
}

// Resolve a raw splat ("dago/wfc-friendly/quiet") into a location chain + filter
// params + the canonical path. Returns null when the path isn't a valid SRP
// (empty, or an axis cap exceeded) → the loader should 404.
export function resolveSrp(
  rawSegments: string[],
  registry: SrpRegistry,
): ResolvedSrp | null {
  const segments = rawSegments.filter(Boolean)
  if (segments.length === 0) return null

  // 1. Classify each segment and bucket it, preserving order within an axis.
  const byAxis: Record<SrpAxis, string[]> = {
    location: [],
    tag: [],
    price: [],
    rating: [],
  }
  for (const s of segments) byAxis[classify(s, registry)].push(s)

  // 2. Enforce the per-axis caps — over the cap is a thin page, not an SRP.
  for (const axis of AXIS_ORDER) {
    if (byAxis[axis].length > AXIS_CAP[axis]) return null
  }

  // 3. Canonical path: axis order, original order within an axis.
  const canonical = AXIS_ORDER.flatMap((axis) => byAxis[axis]).join('/')

  // 4. Translate the filter segments into search params via the registry.
  const params: SrpFilterParams = {}
  if (byAxis.tag.length > 0) {
    params.tags = byAxis.tag.join(',') // slugs pass straight to the wire
  }
  if (byAxis.rating.length > 0) {
    params.ratings = byAxis.rating
      .map((slug) => registry.rating.get(slug))
      .join(',')
  }
  if (byAxis.price.length > 0) {
    const tier = registry.price.get(byAxis.price[0])
    if (tier) {
      params.price_min = tier.min
      if (tier.max != null) params.price_max = tier.max
    }
  }

  return { locationIds: byAxis.location, params, canonical }
}

export interface SrpVariant {
  axis: 'tag' | 'price' | 'rating'
  slug: string
  splat: string // canonical splat (path after /explore) for this variant page
}

// Direct variants of the current SRP: every page that is a DIRECT DESCENDANT of
// the current one — the current path plus exactly one more filter segment
// (tag/price/rating, NEVER location) APPENDED at the end. Because variants only
// append, the new segment must belong to an axis at or after the highest axis
// already present (per AXIS_ORDER); otherwise appending would put it out of
// canonical order and the page would no longer be a child of the current path.
// So e.g. /location/tag/rating offers no price variant (price precedes rating —
// /location/tag/price/rating is a child of /location/tag, not of this page).
// Per-axis caps still apply (a page with a tag offers no further tag).
export function srpVariants(
  rawSegments: string[],
  registry: SrpRegistry,
): SrpVariant[] {
  const segments = rawSegments.filter(Boolean)
  const byAxis: Record<SrpAxis, string[]> = {
    location: [],
    tag: [],
    price: [],
    rating: [],
  }
  for (const s of segments) byAxis[classify(s, registry)].push(s)

  // Highest axis already in the path (per AXIS_ORDER); -1 when the path is empty.
  // A variant's axis must be >= this, so appending keeps the path canonical.
  const highestAxis = segments.reduce(
    (max, s) => Math.max(max, AXIS_ORDER.indexOf(classify(s, registry))),
    -1,
  )

  const filterAxes: SrpVariant['axis'][] = ['tag', 'price', 'rating']
  const slugsByAxis: Record<SrpVariant['axis'], string[]> = {
    tag: [...registry.tag],
    price: [...registry.price.keys()],
    rating: [...registry.rating.keys()],
  }

  const variants: SrpVariant[] = []
  for (const axis of filterAxes) {
    if (byAxis[axis].length >= AXIS_CAP[axis]) continue // axis already at its cap
    if (AXIS_ORDER.indexOf(axis) < highestAxis) continue // would insert, not append
    for (const slug of slugsByAxis[axis]) {
      // Append-only → already canonical, and the current path is its prefix.
      variants.push({ axis, slug, splat: [...segments, slug].join('/') })
    }
  }
  return variants
}

// One SRP link's raw data. The anchor TEXT is formatted in the component (which
// owns wording + i18n); here we expose only what it needs to format:
//   - name: the filter's localized name / price label / location slug
//   - type: 'tag' | 'price' | 'location' | 'explore' | a rating category type
//           (e.g. 'noise') — the discriminator the component formats on
//   - url:  the splat (path after /explore); '' = the explore index
//   - typeLabel: for rating items, the backend's localized type label
//           (display_name, e.g. 'Noise Level'); the component composes the
//           anchor text from it. Absent for non-rating axes.
export interface SrpItem {
  name: string
  type: string
  url: string
  typeLabel?: string
}

// A descriptive blurb for one of the page's active filters (its long copy):
// {name, type} label the section (formatted in the component), body is the
// localized prose (tag.description / rating bucket long_description).
export interface SrpBlurb {
  name: string
  type: string
  body: string
}

export interface SrpContent {
  variants: SrpItem[] // "explore more" links: one extra filter each (direct children)
  crumbs: SrpItem[] // breadcrumb after Home: explore root + one per path segment
  blurb: SrpBlurb[] // long copy for the page's tag/rating filters (enriched only)
}

// Builds the variant links + breadcrumb crumbs for an SRP path as compact
// {name, type, url} lists, so the page never has to ship the full filter
// metadata to the client. `segments` is the canonical SRP path (location +
// filter slugs, no explore root). options may be absent (e.g. /v1/filters
// failed) → no variants, and crumbs fall back to slug names.
export function buildSrpContent(
  segments: string[],
  options?: FilterOptions,
): SrpContent {
  const meta = new Map<
    string,
    { name: string; type: string; typeLabel?: string }
  >()
  const descBySlug = new Map<string, string>() // slug → long copy (enriched only)
  if (options) {
    for (const tag of options.tags) {
      meta.set(tag.slug, { name: tag.name, type: 'tag' })
      if (tag.description) descBySlug.set(tag.slug, tag.description)
    }
    for (const tier of options.price_tiers)
      if (tier.slug) {
        meta.set(tier.slug, { name: tier.label, type: 'price' })
        if (tier.long_description)
          descBySlug.set(tier.slug, tier.long_description)
      }

    for (const cat of options.rating_categories)
      for (const opt of cat.options)
        if (opt.slug) {
          meta.set(opt.slug, {
            name: opt.name,
            type: cat.type,
            typeLabel: cat.display_name,
          })
          if (opt.long_description)
            descBySlug.set(opt.slug, opt.long_description)
        }
  }

  const variants: SrpItem[] = options
    ? srpVariants(segments, buildSrpRegistry(options)).map((v) => {
        const m = meta.get(v.slug)
        return {
          name: m?.name ?? v.slug,
          type: m?.type ?? v.axis,
          url: v.splat,
          typeLabel: m?.typeLabel,
        }
      })
    : []

  // Explore root first, then one crumb per segment linking to its path prefix.
  const crumbs: SrpItem[] = [{ name: 'explore', type: 'explore', url: '' }]
  segments.forEach((seg, i) => {
    const m = meta.get(seg)
    crumbs.push({
      name: m?.name ?? seg,
      type: m?.type ?? 'location',
      url: segments.slice(0, i + 1).join('/'),
      typeLabel: m?.typeLabel,
    })
  })

  // Blurb: the long copy for each filter segment that has one (tag/rating), in
  // path order. Empty unless options were enriched (enrich_content=true).
  const blurb: SrpBlurb[] = []
  for (const seg of segments) {
    const body = descBySlug.get(seg)
    if (!body) continue
    const m = meta.get(seg)
    blurb.push({ name: m?.name ?? seg, type: m?.type ?? 'location', body })
  }

  return { variants, crumbs, blurb }
}
