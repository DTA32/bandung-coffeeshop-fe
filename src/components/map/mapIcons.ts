import L from 'leaflet'
import { COLORS } from '@/lib/colors'

export function userIcon(color: string, name: string) {
  const safeName = name.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%)">
        <span style="margin-top:2px;background:white;border:1px solid ${COLORS.groveLight};border-radius:6px;padding:2px 6px;font-size:11px;color:${COLORS.forest};white-space:nowrap;font-family:inherit">${safeName}</span>
        <div style="position:relative;width:16px;height:16px;border-radius:50%;background:${color}BF;box-shadow:0 1px 4px rgba(0,0,0,.3)">
            <span style="position:absolute;top:50%;left:50%;width:8px;height:8px;background:${color};border-radius:50%;transform:translate(-50%,-50%)"></span>
        </div>
      </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

export const midpointIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:${COLORS.forest};border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3);transform:translate(-50%,-50%)"></div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
})

export const queryMarkerIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:28px;height:28px;transform:translate(-50%,-50%)">
      <div style="position:absolute;inset:0;border-radius:50%;background:${COLORS.grove}AA"></div>
      <div style="position:absolute;top:50%;left:50%;width:14px;height:14px;border-radius:50%;background:${COLORS.moss};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3);transform:translate(-50%,-50%)"></div>
    </div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
})

export const cafeIcon = L.divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;border-radius:50%;background:${COLORS.cream};border:2px solid ${COLORS.grove};box-shadow:0 1px 4px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-size:13px;line-height:1">☕</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
})
