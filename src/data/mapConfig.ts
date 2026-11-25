import type { StyleSpecification } from 'maplibre-gl'
import { PROJECT_DEVICES, type DeviceKind, type DeviceStatus } from './devices'

export const DEMO_CENTER: [number, number] = [-107.323, 39.561]
export const DEMO_ZOOM = 13.4
export const DEMO_PITCH = 62
export const DEMO_BEARING = -28

export function satelliteStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      esri: {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: 'Tiles © Esri',
        maxzoom: 19,
      },
    },
    layers: [{ id: 'sat', type: 'raster', source: 'esri' }],
  }
}

export function streetsStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      carto: {
        type: 'raster',
        tiles: ['https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap © CARTO',
        maxzoom: 20,
      },
    },
    layers: [{ id: 'streets', type: 'raster', source: 'carto' }],
  }
}

export type MachineFeature = {
  id: string
  name: string
  lng: number
  lat: number
  kind: DeviceKind
  status: DeviceStatus
}

export const MACHINE_FEATURES: MachineFeature[] = PROJECT_DEVICES.map((device) => ({
  id: device.id,
  name: device.name,
  lng: device.lng,
  lat: device.lat,
  kind: device.kind,
  status: device.status,
}))

export const SURFACE_LINE_COORDS: [number, number][] = [
  [-107.345, 39.548],
  [-107.323, 39.561],
  [-107.305, 39.572],
]

export const ORTHO_RING_COORDS: [number, number][] = [
  [-107.335, 39.553],
  [-107.312, 39.553],
  [-107.312, 39.566],
  [-107.335, 39.566],
  [-107.335, 39.553],
]

const TERRAIN_PAD = 0.004

type TerrainSourceInput = {
  machines: string[]
  surfaces: boolean
  ortho: boolean
}

export function terrainPolygonFromOverlays(input: TerrainSourceInput): {
  type: 'Polygon'
  coordinates: [number, number][][]
} {
  const points: [number, number][] = []
  for (const machine of MACHINE_FEATURES) {
    if (input.machines.includes(machine.id)) {
      points.push([machine.lng, machine.lat])
    }
  }
  if (input.surfaces) {
    points.push(...SURFACE_LINE_COORDS)
  }
  if (input.ortho) {
    points.push(...ORTHO_RING_COORDS)
  }
  const ring = expandRing(convexHull(points.length > 0 ? points : [DEMO_CENTER]))
  return { type: 'Polygon', coordinates: [ring] }
}

function convexHull(points: [number, number][]): [number, number][] {
  const unique: [number, number][] = []
  const seen = new Set<string>()
  for (const point of points) {
    const key = `${point[0]},${point[1]}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(point)
  }
  unique.sort((a, b) => a[0] - b[0] || a[1] - b[1])
  if (unique.length === 1) {
    const [lng, lat] = unique[0]
    return [
      [lng - TERRAIN_PAD, lat - TERRAIN_PAD],
      [lng + TERRAIN_PAD, lat - TERRAIN_PAD],
      [lng + TERRAIN_PAD, lat + TERRAIN_PAD],
      [lng - TERRAIN_PAD, lat + TERRAIN_PAD],
      [lng - TERRAIN_PAD, lat - TERRAIN_PAD],
    ]
  }
  if (unique.length === 2) {
    const [a, b] = unique
    return [
      [a[0], a[1]],
      [b[0], b[1]],
      [a[0], a[1]],
    ]
  }

  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

  const lower: [number, number][] = []
  for (const point of unique) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop()
    }
    lower.push(point)
  }
  const upper: [number, number][] = []
  for (let i = unique.length - 1; i >= 0; i -= 1) {
    const point = unique[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop()
    }
    upper.push(point)
  }
  lower.pop()
  upper.pop()
  const hull = [...lower, ...upper]
  hull.push(hull[0])
  return hull
}

function expandRing(ring: [number, number][]): [number, number][] {
  const closed = ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
  const body = closed ? ring.slice(0, -1) : ring
  if (body.length === 0) return ring
  let cx = 0
  let cy = 0
  for (const [lng, lat] of body) {
    cx += lng
    cy += lat
  }
  cx /= body.length
  cy /= body.length
  const expanded = body.map(([lng, lat]) => {
    const dx = lng - cx
    const dy = lat - cy
    const length = Math.hypot(dx, dy) || 1
    return [lng + (dx / length) * TERRAIN_PAD, lat + (dy / length) * TERRAIN_PAD] as [number, number]
  })
  expanded.push(expanded[0])
  return expanded
}
