import type { StyleSpecification } from 'maplibre-gl'

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
  label: string
  lng: number
  lat: number
  kind: 'excavator' | 'compactor' | 'dozer'
}

export const MACHINE_FEATURES: MachineFeature[] = [
  { id: 'exc-01', label: 'Excavator 01', lng: -107.318, lat: 39.565, kind: 'excavator' },
  { id: 'exc-02', label: 'Excavator 02', lng: -107.328, lat: 39.558, kind: 'excavator' },
  { id: 'exc-03', label: 'Excavator 03', lng: -107.334, lat: 39.564, kind: 'excavator' },
  { id: 'exc-04', label: 'Excavator 04', lng: -107.311, lat: 39.555, kind: 'excavator' },
  { id: 'exc-05', label: 'Excavator 05', lng: -107.322, lat: 39.552, kind: 'excavator' },
  { id: 'comp-01', label: 'Compactor 01', lng: -107.339, lat: 39.557, kind: 'compactor' },
  { id: 'comp-02', label: 'Compactor 02', lng: -107.315, lat: 39.568, kind: 'compactor' },
  { id: 'dozer-5000', label: 'Bulldozer 5000 Series', lng: -107.326, lat: 39.549, kind: 'dozer' },
  { id: 'dozer-7000', label: 'Bulldozer 7000 Series', lng: -107.308, lat: 39.562, kind: 'dozer' },
]
