import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ModusWcSideNavigation } from '@trimble-oss/moduswebcomponents-react'
import { AppHeader } from './components/AppHeader'
import { DevicesPage } from './components/DevicesPage'
import { SideNav, type SideNavId } from './components/SideNav'
import { LeftToolbar, type LeftNavId } from './components/LeftToolbar'
import { EditToolbar, type MapTool, type MapViewMode } from './components/EditToolbar'
import { MeasureToolPanel } from './components/MeasureToolPanel'
import { QualityMetricsPanel } from './components/QualityMetricsPanel'
import { ProjectDataPanel } from './components/ProjectDataPanel'
import { MapViewport, type MapHandle, type OverlayState } from './components/MapViewport'
import { TerrainTimeline, type TerrainKind } from './components/TerrainTimeline'
import { SaveTerrainFilterModal } from './components/SaveTerrainFilterModal'
import {
  DEFAULT_EXPANDED,
  DEFAULT_SELECTED,
  DEFAULT_VISIBLE,
  LAST_MONTH_TERRAIN_ID,
  LAST_MONTH_TERRAIN_LABEL,
  TERRAIN_DEFAULT_ID,
  TERRAIN_DEFAULT_LABEL,
  TERRAIN_FOLDER_ID,
  mergeTerrainTree,
  reservedTerrainNames,
  type ProjectDataNode,
  type UserTerrainFilter,
} from './data/projectData'
import {
  TIMELINE_ROWS,
  allCheckedMap,
  checkedMapsEqual,
  defaultCheckedMap,
  designCheckState,
  groupCheckState,
  machineCheckState,
  setDesignRows,
  setMachineRows,
} from './data/timelineData'

const SAVE_KEY = 'projectqm-timeline-checked'
const FILTERS_KEY = 'projectqm-terrain-filters'

function loadChecked(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (raw) return { ...defaultCheckedMap(), ...JSON.parse(raw) }
  } catch {
    /* keep defaults */
  }
  return defaultCheckedMap()
}

function loadUserFilters(): UserTerrainFilter[] {
  try {
    const raw = localStorage.getItem(FILTERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is UserTerrainFilter => {
      if (!item || typeof item !== 'object') return false
      const filter = item as UserTerrainFilter
      return (
        typeof filter.id === 'string' &&
        typeof filter.label === 'string' &&
        Boolean(filter.checked) &&
        typeof filter.checked === 'object'
      )
    })
  } catch {
    return []
  }
}

function persistUserFilters(filters: UserTerrainFilter[]) {
  localStorage.setItem(FILTERS_KEY, JSON.stringify(filters))
}

function persistLastMonthChecked(checked: Record<string, boolean>) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(checked))
}

function createUserFilterId(): string {
  return `user-terrain-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function exclusiveTerrainVisible(
  current: string[],
  terrainId: string | null,
  terrainIds: Set<string>,
): string[] {
  const rest = current.filter((id) => !terrainIds.has(id))
  return terrainId ? [...rest, terrainId] : rest
}

function machineIdsFromChecked(checkedMap: Record<string, boolean>): string[] {
  return TIMELINE_ROWS.filter(
    (row) =>
      row.kind === 'device' && checkedMap[row.id] && (!row.parentId || checkedMap[row.parentId]),
  ).map((row) => row.id)
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
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [timelineFullscreen, setTimelineFullscreen] = useState(false)
  const [timelineTitle, setTimelineTitle] = useState('Last Month Terrain')
  const [terrainKind, setTerrainKind] = useState<TerrainKind>('saved')
  const [userFilters, setUserFilters] = useState<UserTerrainFilter[]>(loadUserFilters)
  const [lastMonthChecked, setLastMonthChecked] = useState<Record<string, boolean>>(loadChecked)
  const [checked, setChecked] = useState<Record<string, boolean>>(loadChecked)
  const [applied, setApplied] = useState<Record<string, boolean>>(loadChecked)
  const [appliedTerrainId, setAppliedTerrainId] = useState(DEFAULT_SELECTED)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [measureLabel, setMeasureLabel] = useState<string | null>(null)
  const [qualityMetricsOpen, setQualityMetricsOpen] = useState(false)
  const [sideNavOpen, setSideNavOpen] = useState(false)
  const [navId, setNavId] = useState<SideNavId>('viewer')

  const showProjectData = leftNav === 'models' || leftNav === 'layers'
  const showTimeline = timelineOpen
  const projectTree = useMemo(() => mergeTerrainTree(userFilters), [userFilters])
  const existingFilterNames = useMemo(() => reservedTerrainNames(userFilters), [userFilters])
  const terrainItemIds = useMemo(() => {
    const ids = new Set<string>([TERRAIN_DEFAULT_ID, LAST_MONTH_TERRAIN_ID])
    userFilters.forEach((filter) => ids.add(filter.id))
    return ids
  }, [userFilters])

  const overlays: OverlayState = useMemo(() => {
    const terrainVisible = visibleIds.some((id) => terrainItemIds.has(id))
    const machines = machineIdsFromChecked(applied)
    return {
      machines,
      terrain: terrainVisible,
      surfaces:
        terrainVisible &&
        (visibleIds.includes('surveyed-surfaces') || Boolean(applied['surveyed-surfaces'])),
      ortho:
        terrainVisible &&
        (visibleIds.includes('ortho-images') || Boolean(applied['ortho-images'])),
    }
  }, [applied, visibleIds, terrainItemIds])

  const canApply = !checkedMapsEqual(checked, applied)

  const flashSaved = () => {
    setSaveMessage('Saved')
    window.setTimeout(() => setSaveMessage(null), 2000)
  }

  const checkedMapForNode = useCallback(
    (id: string): Record<string, boolean> => {
      if (id === TERRAIN_DEFAULT_ID) return allCheckedMap()
      if (id === LAST_MONTH_TERRAIN_ID) return { ...defaultCheckedMap(), ...lastMonthChecked }
      const saved = userFilters.find((filter) => filter.id === id)
      return saved ? { ...defaultCheckedMap(), ...saved.checked } : defaultCheckedMap()
    },
    [lastMonthChecked, userFilters],
  )

  const savedChecked = checkedMapForNode(selectedId)
  const hasUnsaved =
    appliedTerrainId === selectedId && !checkedMapsEqual(applied, savedChecked)

  useEffect(() => {
    if (!hasUnsaved) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [hasUnsaved])

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
    if (next !== 'measure') setQualityMetricsOpen(false)
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
    if (!terrainItemIds.has(id)) {
      setVisibleIds((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
      )
      return
    }

    if (visibleIds.includes(id)) {
      setVisibleIds((current) => current.filter((item) => item !== id))
      return
    }

    if (appliedTerrainId !== id) {
      const snapshot = checkedMapForNode(id)
      setApplied(snapshot)
      if (id !== selectedId) {
        setSelectedId(id)
        setTimelineTitle(
          id === TERRAIN_DEFAULT_ID
            ? TERRAIN_DEFAULT_LABEL
            : id === LAST_MONTH_TERRAIN_ID
              ? LAST_MONTH_TERRAIN_LABEL
              : userFilters.find((filter) => filter.id === id)?.label ?? id,
        )
        setTerrainKind(id === TERRAIN_DEFAULT_ID ? 'system' : 'saved')
        setChecked(snapshot)
      }
    }
    setAppliedTerrainId(id)
    setVisibleIds((current) => exclusiveTerrainVisible(current, id, terrainItemIds))
  }

  const handleFilterTerrain = (node: ProjectDataNode) => {
    const nextChecked = checkedMapForNode(node.id)
    setSelectedId(node.id)
    setTimelineTitle(node.label)
    setTerrainKind(node.id === TERRAIN_DEFAULT_ID ? 'system' : 'saved')
    setChecked(nextChecked)
    setTimelineOpen(true)
    setTimelineFullscreen(false)
  }

  const handleToggleDevice = (id: string) => {
    setChecked((current) => {
      const row = TIMELINE_ROWS.find((item) => item.id === id)
      const next = { ...current }

      if (row?.kind === 'group') {
        const selectAll = groupCheckState(id, current) !== 'all'
        next[id] = selectAll
        TIMELINE_ROWS.filter((item) => item.parentId === id).forEach((child) => {
          next[child.id] = selectAll
        })
        return next
      }

      next[id] = !current[id]
      if (row?.kind === 'device' && row.parentId) {
        const siblings = TIMELINE_ROWS.filter((item) => item.parentId === row.parentId)
        next[row.parentId] = siblings.some((child) => next[child.id])
      }
      return next
    })
  }

  const handleToggleAllMachines = () => {
    setChecked((current) =>
      setMachineRows(current, machineCheckState(current) !== 'all'),
    )
  }

  const handleToggleDesign = (id: string) => {
    setChecked((current) => ({ ...current, [id]: current[id] === false }))
  }

  const handleToggleAllDesigns = () => {
    setChecked((current) =>
      setDesignRows(current, designCheckState(current) !== 'all'),
    )
  }

  const handleApply = () => {
    if (checkedMapsEqual(checked, applied)) return
    setApplied(checked)
    setAppliedTerrainId(selectedId)
    setVisibleIds((current) => exclusiveTerrainVisible(current, selectedId, terrainItemIds))
    mapRef.current?.setOverlays({
      machines: machineIdsFromChecked(checked),
      terrain: true,
      surfaces: visibleIds.includes('surveyed-surfaces') || Boolean(checked['surveyed-surfaces']),
      ortho: visibleIds.includes('ortho-images') || Boolean(checked['ortho-images']),
    })
  }

  const handleSaveCurrent = () => {
    if (selectedId === TERRAIN_DEFAULT_ID) return
    if (selectedId === LAST_MONTH_TERRAIN_ID) {
      setLastMonthChecked(checked)
      persistLastMonthChecked(checked)
    } else {
      setUserFilters((current) => {
        const next = current.map((filter) =>
          filter.id === selectedId ? { ...filter, checked } : filter,
        )
        persistUserFilters(next)
        return next
      })
    }
    flashSaved()
  }

  const handleSaveAs = () => {
    setSaveModalOpen(true)
  }

  const handleCloseSaveModal = useCallback(() => {
    setSaveModalOpen(false)
  }, [])

  const handleCreateFilter = (name: string) => {
    const id = createUserFilterId()
    const snapshot = { ...checked }
    const nextFilter: UserTerrainFilter = { id, label: name, checked: snapshot }
    const nextFilters = [...userFilters, nextFilter]
    setUserFilters(nextFilters)
    persistUserFilters(nextFilters)
    setSelectedId(id)
    setExpandedIds((current) =>
      current.includes(TERRAIN_FOLDER_ID) ? current : [...current, TERRAIN_FOLDER_ID],
    )
    setTerrainKind('saved')
    setTimelineTitle(name)
    setTimelineOpen(true)
    setSaveModalOpen(false)
    flashSaved()
  }

  return (
    <div className="app-shell">
      <AppHeader
        projectName={projectName}
        onProjectChange={setProjectName}
        mainMenuOpen={sideNavOpen}
        onMainMenuOpenChange={setSideNavOpen}
      />
      <div className="app-page-row relative flex min-h-0 flex-1">
        <ModusWcSideNavigation
          expanded={sideNavOpen}
          mode="push"
          maxWidth="256px"
          targetContent="#app-main"
          collapseOnClickOutside={false}
          onExpandedChange={(event: CustomEvent<boolean>) =>
            setSideNavOpen(Boolean(event.detail))
          }
        >
          <SideNav expanded={sideNavOpen} selectedId={navId} onSelect={setNavId} />
        </ModusWcSideNavigation>
        <div id="app-main" className="flex min-h-0 min-w-0 flex-1">
        {navId === 'devices' ? (
          <DevicesPage projectName={projectName} />
        ) : (
        <>
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
            chromeInsetLeft={showProjectData ? 320 : 0}
            onBasemapChange={handleBasemap}
            onMeasure={setMeasureLabel}
            measureLabel={measureLabel}
          />
          {showProjectData && (
            <div className="absolute inset-y-0 left-0 z-20">
              <ProjectDataPanel
                tree={projectTree}
                expandedIds={expandedIds}
                selectedId={selectedId}
                visibleIds={visibleIds}
                hasUnsaved={hasUnsaved}
                onToggleExpand={handleToggleExpand}
                onSelect={setSelectedId}
                onToggleVisible={handleToggleVisible}
                onFilter={handleFilterTerrain}
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
                title={timelineTitle}
                kind={terrainKind}
                checked={checked}
                canApply={canApply}
                hasUnsaved={hasUnsaved}
                fullscreen={timelineFullscreen}
                saveMessage={saveMessage}
                onToggle={handleToggleDevice}
                onToggleAllMachines={handleToggleAllMachines}
                onToggleDesign={handleToggleDesign}
                onToggleAllDesigns={handleToggleAllDesigns}
                onApply={handleApply}
                onSaveAs={handleSaveAs}
                onSaveCurrent={handleSaveCurrent}
                onClose={() => {
                  setTimelineOpen(false)
                  setTimelineFullscreen(false)
                }}
                onToggleFullscreen={() => setTimelineFullscreen((value) => !value)}
              />
            </div>
          )}
          {tool === 'measure' && (
            <div
              className={`pointer-events-auto absolute top-4 z-20 ${
                showProjectData ? 'left-[332px]' : 'left-3'
              }`}
            >
              <MeasureToolPanel
                reportOpen={qualityMetricsOpen}
                onReportToggle={() => setQualityMetricsOpen((open) => !open)}
              />
            </div>
          )}
          {tool === 'measure' && qualityMetricsOpen && (
            <div className="pointer-events-auto absolute inset-y-0 right-0 z-20">
              <QualityMetricsPanel onClose={() => setQualityMetricsOpen(false)} />
            </div>
          )}
        </div>
        </>
        )}
        </div>
      </div>
      <SaveTerrainFilterModal
        open={saveModalOpen}
        existingNames={existingFilterNames}
        onSave={handleCreateFilter}
        onClose={handleCloseSaveModal}
      />
    </div>
  )
}
