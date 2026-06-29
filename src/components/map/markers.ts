import { COLORS } from '@/lib/colors'

export type UserMarker = {
  id: string
  lat: number
  lng: number
  name: string
  color: string
}

export function encodeMarker(m: UserMarker) {
  return `${m.lat},${m.lng},${m.color.replace('#', '')},${encodeURIComponent(m.name)}`
}

export function decodeMarker(entry: string, i: number): UserMarker | null {
  const parts = entry.split(',')
  const lat = parseFloat(parts[0])
  const lng = parseFloat(parts[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  const givenColor =
    parts[2] && parts[2].match(/^[0-9A-Fa-f]{6}$/) ? `#${parts[2]}` : null
  const color = `${givenColor ?? COLORS.moss}`
  const givenName =
    parts.length > 3 && parts.slice(3).join(',').trim()
      ? decodeURIComponent(parts.slice(3).join(','))
      : null
  const name = givenName ? givenName : `Marker ${i + 1}`
  return { id: `m-${i}`, lat, lng, color, name }
}

// hail claude
export function randomGreenHex() {
  const h = 80 + Math.random() * 80 // 80–160: yellow-green to teal-green
  const s = 35 + Math.random() * 35 // 35–70%
  const l = 25 + Math.random() * 25 // 25–50%
  const a = (s * Math.min(l, 100 - l)) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round((c / 100) * 255)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}
