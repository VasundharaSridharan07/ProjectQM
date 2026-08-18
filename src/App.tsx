import { useMemo, useRef, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { LeftToolbar, type LeftNavId } from './components/LeftToolbar'
import { EditToolbar, type MapTool, type MapViewMode } from './components/EditToolbar'
import { ProjectDataPanel } from './components/ProjectDataPanel'
import { MapViewport, type MapHandle, type OverlayState } from './components/MapViewport'
import { TerrainTimeline } from './components/TerrainTimeline'
import { DEFAULT_EXPANDED, DEFAULT_SELECTED, DEFAULT_VISIBLE } from './data/projectData'
import { TIMELINE_ROWS, defaultCheckedMap } from './data/timelineData'

const SAVE_KEY = 'projectqm-timeline-checked'

function loadChecked(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (raw) return { ...defaultCheckedMap(), ...JSON.parse(raw) }
  } catch {
    /* keep defaults */
  }
  return defaultCheckedMap()
}

export default function App() {
  const mapRef = useRef<MapHandle>(null)
  const [projectName, setProjectName] = useState('Augie Project')
  const [leftNav, setLeftNav] = useState<LeftNavId>('models')
  const [expandedIds, setExpandedIds] = useState<string[]>(DEFAULT_EXPANDED)
  const [selectedId, setSelectedId] = useState(DEFAULT_SELECTED)
  const [visibleIds, setVisibleIds] = useState<string[]>(DEFAULT_VISIBLE)
  const [tool, setTool] = useState<MapTool>('orbit')
  const [viewMode, setViewMode] = useState<MapViewMode>('perspective')
  const [terrainOn, setTerrainOn] = useState(true)
  const [basemap, setBasemap] = useState<'satellite' | 'streets'>('satellite')
  const [timelineOpen, setTimelineOpen] = useState(true)
  const [timelineFullscreen, setTimelineFullscreen] = useState(false)
  const [checked, setChecked] = useState<Record<string, boolean>>(loadChecked)
  const [applied, setApplied] = useState<Record<string, boolean>>(loadChecked)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [measureLabel, setMeasureLabel] = useState<string | null>(null)

  const showProjectData = leftNav === 'models' || leftNav === 'layers'
  const showTimeline = timelineOpen

  const overlays: OverlayState = useMemo(() => {
    const machines = TIMELINE_ROWS.filter(
      (row) => row.kind === 'device' && applied[row.id] && (!row.parentId || applied[row.parentId]),
    ).map((row) => row.id)
    return {
      machines,
      terrain: visibleIds.includes('last-month-terrain') || visibleIds.includes('terrain-default'),
      surfaces: visibleIds.includes('surveyed-surfaces') || Boolean(applied['surveyed-surfaces']),
      ortho: visibleIds.includes('ortho-images') || Boolean(applied['ortho-images']),
    }
  }, [applied, visibleIds])

  const handleLeftNav = (id: LeftNavId) => {
    setLeftNav(id)
    if (id === 'devices') setTimelineOpen(true)
    if (id === 'measure') {
      setTool('measure')
      mapRef.current?.setTool('measure')
    }
  }

  const handleTool = (next: MapTool) => {
    setTool(next)
    mapRef.current?.setTool(next)
  }

  const handleViewMode = (mode: MapViewMode) => {
    setViewMode(mode)
    mapRef.current?.setViewMode(mode)
  }

  const handleTerrainToggle = () => {
    const next = !terrainOn
    setTerrainOn(next)
    mapRef.current?.setTerrain(next)
  }

  const handleBasemap = (next: 'satellite' | 'streets') => {
    setBasemap(next)
    mapRef.current?.setBasemap(next)
  }

  const handleToggleExpand = (id: string) => {
    setExpandedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const handleToggleVisible = (id: string) => {
    setVisibleIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const handleToggleDevice = (id: string) => {
    setChecked((current) => {
      const next = { ...current, [id]: !current[id] }
      const children = TIMELINE_ROWS.filter((row) => row.parentId === id)
      children.forEach((child) => {
        next[child.id] = next[id]
      })
      return next
    })
  }

  const handleApply = () => {
    setApplied(checked)
    mapRef.current?.setOverlays({
      machines: TIMELINE_ROWS.filter(
        (row) => row.kind === 'device' && checked[row.id] && (!row.parentId || checked[row.parentId]),
      ).map((row) => row.id),
      terrain: overlays.terrain,
      surfaces: Boolean(checked['surveyed-surfaces']),
      ortho: Boolean(checked['ortho-images']),
    })
  }

  const handleSave = () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(checked))
    setSaveMessage('Saved')
    window.setTimeout(() => setSaveMessage(null), 2000)
  }

  return (
    <div className="app-shell">
      <AppHeader projectName={projectName} onProjectChange={setProjectName} />
      <div className="flex min-h-0 flex-1">
        <LeftToolbar activeId={leftNav} onSelect={handleLeftNav} />
        <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <MapViewport
            ref={mapRef}
            tool={tool}
            viewMode={viewMode}
            terrainOn={terrainOn}
            basemap={basemap}
            overlays={overlays}
            chromeInsetBottom={
              showTimeline && !timelineFullscreen ? 'calc(64% + 12px)' : 12
            }
            onBasemapChange={handleBasemap}
            onMeasure={setMeasureLabel}
            measureLabel={measureLabel}
          />
          {showProjectData && (
            <div className="absolute inset-y-0 left-0 z-20">
              <ProjectDataPanel
                expandedIds={expandedIds}
                selectedId={selectedId}
                visibleIds={visibleIds}
                onToggleExpand={handleToggleExpand}
                onSelect={setSelectedId}
                onToggleVisible={handleToggleVisible}
              />
            </div>
          )}
          <div className="pointer-events-auto absolute left-1/2 top-3 z-20 -translate-x-1/2">
            <EditToolbar
              tool={tool}
              viewMode={viewMode}
              terrainOn={terrainOn}
              onToolChange={handleTool}
              onViewModeChange={handleViewMode}
              onTerrainToggle={handleTerrainToggle}
            />
          </div>
          {showTimeline && (
            <div
              className={`absolute z-20 ${
                timelineFullscreen
                  ? 'inset-0'
                  : showProjectData
                    ? 'bottom-0 right-0 top-[36%]'
                    : 'bottom-0 right-0 top-[36%] left-0'
              }`}
              style={timelineFullscreen || !showProjectData ? undefined : { left: 320 }}
            >
              <TerrainTimeline
                checked={checked}
                fullscreen={timelineFullscreen}
                saveMessage={saveMessage}
                onToggle={handleToggleDevice}
                onApply={handleApply}
                onSave={handleSave}
                onClose={() => {
                  setTimelineOpen(false)
                  setTimelineFullscreen(false)
                }}
                onToggleFullscreen={() => setTimelineFullscreen((value) => !value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
