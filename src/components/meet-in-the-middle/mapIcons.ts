import L from 'leaflet'

export function userIcon(color: string, name: string) {
  const safeName = name.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%)">
        <span style="margin-top:2px;background:white;border:1px solid #D4E3C5;border-radius:6px;padding:2px 6px;font-size:11px;color:#2A3D22;white-space:nowrap;font-family:inherit">${safeName}</span>
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
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#2A3D22;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3);transform:translate(-50%,-50%)"></div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
})

export const cafeIcon = L.divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#F7F5EE;border:2px solid #6A9E52;box-shadow:0 1px 4px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-size:13px;line-height:1">☕</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
})
