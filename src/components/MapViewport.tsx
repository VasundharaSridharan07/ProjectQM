import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from 'maplibre-gl'
import { ModusWcTypography } from '@trimble-oss/moduswebcomponents-react'
import type { MapTool, MapViewMode } from './EditToolbar'
import {
  DEMO_BEARING,
  DEMO_CENTER,
  DEMO_PITCH,
  DEMO_ZOOM,
  MACHINE_FEATURES,
  ORTHO_RING_COORDS,
  SURFACE_LINE_COORDS,
  satelliteStyle,
  streetsStyle,
  terrainPolygonFromOverlays,
} from '../data/mapConfig'
import satelliteThumb from '../assets/satellite-thumb.png'
import axisGizmo from '../assets/axis-gizmo.png'

export type OverlayState = {
  machines: string[]
  terrain: boolean
  surfaces: boolean
  ortho: boolean
}

export type MapHandle = {
  setTool: (tool: MapTool) => void
  setViewMode: (mode: MapViewMode) => void
  setTerrain: (on: boolean) => void
  setBasemap: (basemap: 'satellite' | 'streets') => void
  setOverlays: (overlays: OverlayState) => void
  resetNorth: () => void
}

type MapViewportProps = {
  tool: MapTool
  viewMode: MapViewMode
  terrainOn: boolean
  basemap: 'satellite' | 'streets'
  overlays: OverlayState
  chromeInsetBottom?: number | string
  chromeInsetLeft?: number
  onBasemapChange: (basemap: 'satellite' | 'streets') => void
  onMeasure: (label: string | null) => void
  measureLabel: string | null
}

function tokenColor(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function haversineMeters(a: [number, number], b: [number, number]): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(b[1] - a[1])
  const dLng = toRad(b[0] - a[0])
  const lat1 = toRad(a[1])
  const lat2 = toRad(b[1])
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

export const MapViewport = forwardRef<MapHandle, MapViewportProps>(function MapViewport(
  {
    tool,
    viewMode,
    terrainOn,
    basemap,
    overlays,
    chromeInsetBottom = 12,
    chromeInsetLeft = 0,
    onBasemapChange,
    onMeasure,
    measureLabel,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const toolRef = useRef(tool)
  const overlaysRef = useRef(overlays)
  const onMeasureRef = useRef(onMeasure)
  const onBasemapChangeRef = useRef(onBasemapChange)
  const measurePts = useRef<[number, number][]>([])
  const orbitDrag = useRef<{ x: number; y: number; bearing: number; pitch: number } | null>(
    null,
  )
  const marquee = useRef<{ x: number; y: number } | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const fellBackRef = useRef(false)
  const statusRef = useRef<'loading' | 'ready' | 'error'>('loading')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [statusMessage, setStatusMessage] = useState('Loading map…')

  toolRef.current = tool
  overlaysRef.current = overlays
  onMeasureRef.current = onMeasure
  onBasemapChangeRef.current = onBasemapChange

  useImperativeHandle(ref, () => ({
    setTool: (next) => {
      toolRef.current = next
      measurePts.current = []
      onMeasureRef.current(null)
    },
    setViewMode: (mode) => {
      mapRef.current?.easeTo({
        pitch: mode === 'ortho' ? 0 : DEMO_PITCH,
        duration: 500,
      })
    },
    setTerrain: () => {
      // 2.5D only — no DEM mesh. Pitch is already applied from view mode.
    },
    setBasemap: (next) => {
      const map = mapRef.current
      if (!map) return
      applyBasemap(map, next, overlaysRef.current, terrainOn)
    },
    setOverlays: (next) => {
      if (mapRef.current) applyOverlays(mapRef.current, next)
    },
    resetNorth: () => {
      mapRef.current?.easeTo({ bearing: 0, pitch: DEMO_PITCH, duration: 600 })
    },
  }))

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: satelliteStyle(),
      center: DEMO_CENTER,
      zoom: DEMO_ZOOM,
      pitch: DEMO_PITCH,
      bearing: DEMO_BEARING,
      attributionControl: { compact: true },
      maxPitch: 80,
    })
    mapRef.current = map
    map.resize()

    const observer = new ResizeObserver(() => {
      map.resize()
    })
    observer.observe(containerRef.current)

    map.on('load', () => {
      addDataLayers(map)
      applyOverlays(map, overlaysRef.current)
      map.resize()
      statusRef.current = 'ready'
      setStatus('ready')
    })

    map.on('error', (event) => {
      const message = event.error?.message ?? 'Map failed to load'
      const isTileError = /tile|ajax|failed to fetch|404|403/i.test(message)
      if (isTileError && !fellBackRef.current) {
        fellBackRef.current = true
        onBasemapChangeRef.current('streets')
        applyBasemap(map, 'streets', overlaysRef.current, false)
        setStatusMessage('Satellite tiles blocked — showing streets')
        return
      }
      if (statusRef.current !== 'ready') {
        statusRef.current = 'error'
        setStatus('error')
        setStatusMessage(message)
      }
    })

    map.on('mousedown', (event) => {
      if (toolRef.current === 'orbit' && event.originalEvent.button === 0) {
        event.preventDefault()
        map.dragPan.disable()
        orbitDrag.current = {
          x: event.originalEvent.clientX,
          y: event.originalEvent.clientY,
          bearing: map.getBearing(),
          pitch: map.getPitch(),
        }
      }
      if (toolRef.current === 'marquee' && event.originalEvent.button === 0) {
        event.preventDefault()
        map.dragPan.disable()
        marquee.current = { x: event.point.x, y: event.point.y }
      }
    })

    map.on('mousemove', (event) => {
      const drag = orbitDrag.current
      if (drag) {
        const dx = event.originalEvent.clientX - drag.x
        const dy = event.originalEvent.clientY - drag.y
        map.setBearing(drag.bearing - dx * 0.35)
        map.setPitch(Math.max(0, Math.min(80, drag.pitch - dy * 0.25)))
      }
      if (marquee.current && boxRef.current) {
        const start = marquee.current
        const x = Math.min(start.x, event.point.x)
        const y = Math.min(start.y, event.point.y)
        const w = Math.abs(event.point.x - start.x)
        const h = Math.abs(event.point.y - start.y)
        boxRef.current.style.display = 'block'
        boxRef.current.style.left = `${x}px`
        boxRef.current.style.top = `${y}px`
        boxRef.current.style.width = `${w}px`
        boxRef.current.style.height = `${h}px`
      }
    })

    const endDrag = () => {
      orbitDrag.current = null
      marquee.current = null
      if (boxRef.current) boxRef.current.style.display = 'none'
      map.dragPan.enable()
    }
    window.addEventListener('mouseup', endDrag)

    map.on('click', (event) => {
      const lngLat: [number, number] = [event.lngLat.lng, event.lngLat.lat]
      if (toolRef.current === 'select') {
        const source = map.getSource('selection') as GeoJSONSource | undefined
        source?.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: { type: 'Point', coordinates: lngLat },
            },
          ],
        })
      }
      if (toolRef.current === 'measure') {
        measurePts.current = [...measurePts.current, lngLat].slice(-2)
        const pts = measurePts.current
        const source = map.getSource('measure') as GeoJSONSource | undefined
        if (pts.length === 1) {
          source?.setData({
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: { type: 'Point', coordinates: pts[0] },
              },
            ],
          })
          onMeasureRef.current('Click a second point')
        } else if (pts.length === 2) {
          source?.setData({
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: { type: 'LineString', coordinates: pts },
              },
            ],
          })
          const meters = haversineMeters(pts[0], pts[1])
          onMeasureRef.current(meters >= 1000 ? `${(meters / 1000).toFixed(2)} km` : `${Math.round(meters)} m`)
        }
      }
    })

    return () => {
      observer.disconnect()
      window.removeEventListener('mouseup', endDrag)
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const canvas = mapRef.current?.getCanvas()
    if (canvas) {
      canvas.style.cursor =
        tool === 'orbit' ? 'grab' : tool === 'measure' || tool === 'marquee' ? 'crosshair' : 'default'
    }
  }, [tool])

  useEffect(() => {
    const map = mapRef.current
    if (map?.isStyleLoaded()) applyOverlays(map, overlays)
  }, [overlays])

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      {status !== 'ready' && (
        <div
          className="pointer-events-none absolute inset-x-0 top-16 z-10 flex justify-center"
        >
          <div
            className="rounded px-3 py-1"
            style={{ background: 'var(--modus-wc-color-base-100)' }}
          >
            <ModusWcTypography
              hierarchy="p"
              size="sm"
              weight="semibold"
              customClass={status === 'error' ? 't-gray' : 't-muted'}
              label={statusMessage}
            />
          </div>
        </div>
      )}
      <div
        ref={boxRef}
        className="pointer-events-none absolute hidden"
        style={{
          border: '1px dashed var(--modus-wc-color-trimble-blue)',
          background: 'color-mix(in srgb, var(--modus-wc-color-blue-pale) 40%, transparent)',
        }}
      />
      {measureLabel && (
        <div
          className="absolute left-1/2 top-14 z-10 -translate-x-1/2 rounded px-3 py-1"
          style={{ background: 'var(--modus-wc-color-base-100)' }}
        >
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            weight="semibold"
            customClass="t-content"
            label={measureLabel}
          />
        </div>
      )}
      <div
        className="pointer-events-none absolute right-3 z-10 flex items-end justify-between"
        style={{ left: chromeInsetLeft + 12, bottom: chromeInsetBottom }}
      >
        <button
          type="button"
          className="pointer-events-auto relative size-[72px] overflow-hidden rounded-[4px]"
          style={{
            border: '4px solid var(--modus-wc-color-base-100)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}
          aria-label="Toggle satellite basemap"
          onClick={() =>
            onBasemapChange(basemap === 'satellite' ? 'streets' : 'satellite')
          }
        >
          <img
            src={satelliteThumb}
            alt=""
            width={72}
            height={72}
            className="size-full object-cover"
          />
          <span
            className="absolute inset-x-1 bottom-0 flex h-7 items-end justify-center pb-0.5"
            style={{
              background:
                'linear-gradient(to bottom, transparent, color-mix(in srgb, var(--modus-wc-color-trimble-gray) 25%, transparent) 50%, color-mix(in srgb, var(--modus-wc-color-trimble-gray) 70%, transparent))',
            }}
          >
            <ModusWcTypography
              hierarchy="p"
              size="xs"
              weight="semibold"
              customClass="t-on-image"
              label={basemap === 'satellite' ? 'Satellite' : 'Streets'}
            />
          </span>
        </button>
        <button
          type="button"
          className="pointer-events-auto relative size-20 overflow-visible"
          aria-label="Reset north and 3D view"
          onClick={() =>
            mapRef.current?.easeTo({
              bearing: 0,
              pitch: viewMode === 'ortho' ? 0 : DEMO_PITCH,
              duration: 600,
            })
          }
        >
          <img
            src={axisGizmo}
            alt=""
            width={104}
            height={104}
            className="map-axis-gizmo"
          />
        </button>
      </div>
    </div>
  )
})

const PIN_SIZE = 54

const pinModules = import.meta.glob('../assets/pins/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function pinAssetUrl(name: string): string | undefined {
  const target = name.toLowerCase()
  for (const [path, url] of Object.entries(pinModules)) {
    const base = path.split('/').pop()?.replace(/\.svg$/i, '').toLowerCase() ?? ''
    const normalized = base.replace(/^exacavator_/, 'excavator_')
    if (normalized === target) return url
  }
  return undefined
}

function rasterizePin(url: string, size: number, ratio: number): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(size * ratio)
      canvas.height = Math.round(size * ratio)
      const context = canvas.getContext('2d')
      if (!context) {
        reject(new Error('Could not draw a map pin'))
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(context.getImageData(0, 0, canvas.width, canvas.height))
    }
    image.onerror = () => reject(new Error(`Could not load pin ${url}`))
    image.src = url
  })
}

let machinePinLoad: Promise<void> | null = null
let machinePinGeneration = 0

function ensureMachinePins(map: MapLibreMap): Promise<void> {
  if (machinePinLoad) return machinePinLoad
  const generation = machinePinGeneration
  machinePinLoad = (async () => {
    const ratio = window.devicePixelRatio || 1
    const names = new Set<string>()
    for (const machine of MACHINE_FEATURES) {
      names.add(`${machine.kind}_${machine.status}`)
    }
    for (const name of names) {
      if (generation !== machinePinGeneration) return
      if (map.hasImage(name)) continue
      const url = pinAssetUrl(name)
      if (!url) continue
      const image = await rasterizePin(url, PIN_SIZE, ratio)
      if (generation !== machinePinGeneration || map.hasImage(name)) continue
      map.addImage(name, image, { pixelRatio: ratio })
    }
    if (generation !== machinePinGeneration) return
    if (!map.getSource('machines')) {
      map.addSource('machines', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
    }
    if (!map.getLayer('machine-pins')) {
      map.addLayer({
        id: 'machine-pins',
        type: 'symbol',
        source: 'machines',
        layout: {
          'icon-image': ['get', 'icon'],
          'icon-size': 1,
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      })
    }
  })().catch((error: unknown) => {
    machinePinLoad = null
    throw error
  })
  return machinePinLoad
}

function applyBasemap(
  map: MapLibreMap,
  next: 'satellite' | 'streets',
  overlays: OverlayState,
  _terrainOn: boolean,
) {
  const camera = {
    center: map.getCenter(),
    zoom: map.getZoom(),
    pitch: map.getPitch(),
    bearing: map.getBearing(),
  }
  machinePinGeneration += 1
  machinePinLoad = null
  map.setStyle(next === 'satellite' ? satelliteStyle() : streetsStyle())
  map.once('styledata', () => {
    map.jumpTo(camera)
    addDataLayers(map)
    applyOverlays(map, overlays)
  })
}

function addDataLayers(map: MapLibreMap) {
  if (!map.getSource('machines')) {
    map.addSource('machines', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    })
  }
  if (!map.getSource('terrain-poly')) {
    map.addSource('terrain-poly', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: terrainPolygonFromOverlays({
          machines: MACHINE_FEATURES.map((machine) => machine.id),
          surfaces: false,
          ortho: true,
        }),
      },
    })
    map.addLayer({
      id: 'terrain-fill',
      type: 'fill',
      source: 'terrain-poly',
      paint: {
        'fill-color': tokenColor('--modus-wc-color-blue-pale'),
        'fill-opacity': 0.28,
      },
    })
  }
  if (!map.getSource('surface-line')) {
    map.addSource('surface-line', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: SURFACE_LINE_COORDS,
        },
      },
    })
    map.addLayer({
      id: 'surface-line',
      type: 'line',
      source: 'surface-line',
      paint: {
        'line-color': tokenColor('--modus-wc-color-green'),
        'line-width': 3,
      },
    })
  }
  if (!map.getSource('ortho-box')) {
    map.addSource('ortho-box', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [ORTHO_RING_COORDS],
        },
      },
    })
    map.addLayer({
      id: 'ortho-fill',
      type: 'fill',
      source: 'ortho-box',
      paint: {
        'fill-color': tokenColor('--modus-wc-color-green-pale'),
        'fill-opacity': 0.22,
      },
    })
  }
  if (!map.getSource('selection')) {
    map.addSource('selection', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    map.addLayer({
      id: 'selection-point',
      type: 'circle',
      source: 'selection',
      paint: {
        'circle-radius': 6,
        'circle-color': tokenColor('--modus-wc-color-trimble-blue'),
        'circle-stroke-width': 2,
        'circle-stroke-color': tokenColor('--modus-wc-color-base-100'),
      },
    })
  }
  if (!map.getSource('measure')) {
    map.addSource('measure', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    map.addLayer({
      id: 'measure-line',
      type: 'line',
      source: 'measure',
      paint: { 'line-color': tokenColor('--modus-wc-color-yellow'), 'line-width': 3 },
    })
    map.addLayer({
      id: 'measure-points',
      type: 'circle',
      source: 'measure',
      paint: {
        'circle-radius': 5,
        'circle-color': tokenColor('--modus-wc-color-yellow'),
        'circle-stroke-width': 2,
        'circle-stroke-color': tokenColor('--modus-wc-color-base-100'),
      },
    })
  }
}

function applyOverlays(map: MapLibreMap, overlays: OverlayState) {
  if (map.getLayer('terrain-fill')) {
    map.setLayoutProperty('terrain-fill', 'visibility', overlays.terrain ? 'visible' : 'none')
  }
  if (map.getLayer('surface-line')) {
    map.setLayoutProperty('surface-line', 'visibility', overlays.surfaces ? 'visible' : 'none')
  }
  if (map.getLayer('ortho-fill')) {
    map.setLayoutProperty('ortho-fill', 'visibility', overlays.ortho ? 'visible' : 'none')
  }
  const terrainSource = map.getSource('terrain-poly') as GeoJSONSource | undefined
  terrainSource?.setData({
    type: 'Feature',
    properties: {},
    geometry: terrainPolygonFromOverlays(overlays),
  })
  void ensureMachinePins(map).then(() => {
    const source = map.getSource('machines') as GeoJSONSource | undefined
    if (!source) return
    source.setData({
      type: 'FeatureCollection',
      features: MACHINE_FEATURES.filter((machine) => overlays.machines.includes(machine.id)).map(
        (machine) => ({
          type: 'Feature',
          properties: {
            id: machine.id,
            name: machine.name,
            icon: `${machine.kind}_${machine.status}`,
          },
          geometry: { type: 'Point', coordinates: [machine.lng, machine.lat] },
        }),
      ),
    })
  })
}
