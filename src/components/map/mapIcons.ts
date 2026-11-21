import L from 'leaflet'
import { COLORS } from '@/lib/colors'

// Cached by color + name: a new DivIcon on every render makes react-leaflet
// call setIcon, which rebuilds the element and would replay the drop-in.
const userIcons = new Map<string, L.DivIcon>()

// Icon HTML is styled with Tailwind classes (Tailwind scans this file). Only
// colours stay inline: the map icons keep the fixed COLORS palette in both
// themes, while the colour tokens change under `.dark`, and a user marker's
// colour is dynamic.
//
// Animation classes go on an inner element, never on Leaflet's icon root,
// which Leaflet positions with `transform`. The `-translate-*` utilities use
// the `translate` property, which the drop-in keyframe animates too, so the
// centering translate sits on an outer wrapper and the animation on the
// element inside it.
export function userIcon(color: string, name: string) {
  const key = `${color}|${name}`
  const cached = userIcons.get(key)
  if (cached) return cached
  const icon = buildUserIcon(color, name)
  userIcons.set(key, icon)
  return icon
}

function buildUserIcon(color: string, name: string) {
  const safeName = name.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return L.divIcon({
    className: '',
    html: `
      <div class="-translate-x-1/2 -translate-y-full">
        <div class="flex flex-col items-center motion-safe:animate-marker-drop">
          <span class="mt-0.5 whitespace-nowrap rounded-md border bg-white px-1.5 py-0.5 text-[11px]" style="border-color:${COLORS.groveLight};color:${COLORS.forest}">${safeName}</span>
          <div class="relative size-4 rounded-full shadow-marker" style="background:${color}BF">
            <span class="absolute top-1/2 left-1/2 size-2 -translate-1/2 rounded-full" style="background:${color}"></span>
          </div>
        </div>
      </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

export const midpointIcon = L.divIcon({
  className: '',
  html: `<div class="size-4 -translate-1/2 rounded-full border-3 border-white shadow-marker" style="background:${COLORS.forest}"></div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
})

// The Meet in the Middle midpoint: the same dot plus a ring that grows and
// fades once when the marker mounts. MapView keys the marker on its position,
// so each recalculation pulses again. Without motion the ring stays hidden.
export const midpointPulseIcon = L.divIcon({
  className: '',
  html: `
    <div class="relative size-4 -translate-1/2">
      <span class="absolute inset-0 rounded-full opacity-0 motion-safe:animate-marker-pulse" style="background:${COLORS.forest}"></span>
      <div class="absolute inset-0 rounded-full border-3 border-white shadow-marker" style="background:${COLORS.forest}"></div>
    </div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
})

export const queryMarkerIcon = L.divIcon({
  className: '',
  html: `
    <div class="size-7 -translate-1/2">
      <div class="relative size-full motion-safe:animate-marker-drop">
        <div class="absolute inset-0 rounded-full" style="background:${COLORS.grove}AA"></div>
        <div class="absolute top-1/2 left-1/2 size-3.5 -translate-1/2 rounded-full border-2 border-white shadow-marker" style="background:${COLORS.moss}"></div>
      </div>
    </div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
})

export const cafeIcon = L.divIcon({
  className: '',
  html: `<div class="flex size-6 items-center justify-center rounded-full border-2 text-[13px] leading-none text-white shadow-marker" style="background:${COLORS.cream};border-color:${COLORS.grove}">☕</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
})
