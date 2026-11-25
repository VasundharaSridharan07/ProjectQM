import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ModusWcButton,
  ModusWcCheckbox,
  ModusWcMenu,
  ModusWcMenuItem,
  ModusWcTextInput,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'
import { AssetIcon } from './AssetIcon'
import {
  DAY_WIDTH,
  DESIGN_IDS,
  HEADER_HEIGHT,
  ROW_HEIGHT,
  TIMELINE_BARS,
  TIMELINE_DAYS,
  TIMELINE_MARKERS,
  TIMELINE_ROWS,
  designCheckState,
  designKey,
  groupCheckState,
  isDesignChecked,
  isRowActive,
  machineCheckState,
  type DesignId,
  type TimelineRow,
} from '../data/timelineData'
import dragIcon from '../assets/drag.svg'
import calendarIcon from '../assets/calendar.svg'
import caretDownIcon from '../assets/caret-down.svg'
import expandMoreIcon from '../assets/expand-more.svg'
import fullscreenIcon from '../assets/fullscreen.svg'
import closeIcon from '../assets/close.svg'
import machinesIcon from '../assets/machines.svg'
import designsIcon from '../assets/designs.svg'
import elevationIcon from '../assets/elevation.svg'
import excavatorIcon from '../assets/excavator.svg'
import compactorIcon from '../assets/compactor.svg'
import dozerIcon from '../assets/dozer.svg'
import surfaceIcon from '../assets/surface-track.svg'
import photoIcon from '../assets/photo-track.svg'

type TimelinePane = 'machines' | 'designs'

const DEVICE_ICONS = {
  excavator: excavatorIcon,
  compactor: compactorIcon,
  dozer: dozerIcon,
  surface: surfaceIcon,
  photo: photoIcon,
}

const DESIGN_CLASS: Record<DesignId, string> = {
  A: 'design-a',
  B: 'design-b',
  C: 'design-c',
}

const DESIGN_FILTERS = DESIGN_IDS.map((id) => ({
  id: designKey(id),
  design: id,
  label: `Design ${id}`,
}))

const ICON_COL_WIDTH = 36

export type TerrainKind = 'system' | 'saved'

type TerrainTimelineProps = {
  title: string
  kind: TerrainKind
  checked: Record<string, boolean>
  canApply: boolean
  hasUnsaved: boolean
  fullscreen: boolean
  saveMessage: string | null
  onToggle: (id: string) => void
  onToggleAllMachines: () => void
  onToggleDesign: (id: string) => void
  onToggleAllDesigns: () => void
  onApply: () => void
  onSaveAs: () => void
  onSaveCurrent: () => void
  onClose: () => void
  onToggleFullscreen: () => void
}

const SAVE_MENU_ACTIONS = [
  { value: 'save-as-new', label: 'Save as New Terrain' },
  { value: 'save-current', label: 'Save to Current Terrain' },
] as const

export function TerrainTimeline({
  title,
  kind,
  checked,
  canApply,
  hasUnsaved,
  fullscreen,
  saveMessage,
  onToggle,
  onToggleAllMachines,
  onToggleDesign,
  onToggleAllDesigns,
  onApply,
  onSaveAs,
  onSaveCurrent,
  onClose,
  onToggleFullscreen,
}: TerrainTimelineProps) {
  const [pane, setPane] = useState<TimelinePane>('machines')
  const [designQuery, setDesignQuery] = useState('')
  const days = Array.from({ length: TIMELINE_DAYS }, (_, index) => index + 1)
  const machineState = machineCheckState(checked)
  const designsState = designCheckState(checked)
  const isDesigns = pane === 'designs'
  const query = designQuery.trim().toLowerCase()
  const visibleDesigns = DESIGN_FILTERS.filter((item) =>
    query ? item.label.toLowerCase().includes(query) : true,
  )
  const ganttLeadWidth = isDesigns ? ICON_COL_WIDTH : 260

  return (
    <section
      className="flex h-full min-h-0 w-full flex-col"
      style={{
        background: 'var(--modus-wc-color-base-100)',
        border: '1px solid var(--modus-wc-color-gray-0)',
      }}
    >
      <header
        className="relative z-10 flex h-11 shrink-0 items-center gap-3 px-3"
        style={{ borderBottom: '1px solid var(--modus-wc-color-gray-0)' }}
      >
        <div
          className="absolute left-1/2 top-0.5 h-0.5 w-6 -translate-x-1/2 rounded"
          style={{ background: 'var(--modus-wc-color-gray-0)' }}
        />
        <AssetIcon src={dragIcon} size={16} />
        <span className="shrink-0">
          <ModusWcTypography
            hierarchy="p"
            size="md"
            weight="semibold"
            customClass="t-gray"
            label={title}
          />
        </span>
        <button
          type="button"
          className="flex h-8 shrink-0 items-center gap-2 rounded px-2.5"
          style={{ border: '1px solid var(--modus-wc-color-gray-0)' }}
          aria-label="Date range"
        >
          <AssetIcon src={calendarIcon} size={14} />
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            weight="normal"
            customClass="t-gray"
            label="Jan 10, 2026 12:00am  –  Jan 29, 2026 12:00am"
          />
          <AssetIcon src={caretDownIcon} size={12} />
        </button>
        <div className="flex-1" />
        {hasUnsaved ? (
          <ModusWcTypography
            hierarchy="p"
            size="xs"
            weight="normal"
            customClass="t-muted"
            label="Unsaved changes"
          />
        ) : (
          saveMessage && (
            <ModusWcTypography
              hierarchy="p"
              size="xs"
              weight="normal"
              customClass="t-green"
              label={saveMessage}
            />
          )
        )}
        {kind === 'system' ? (
          <ModusWcButton
            color="tertiary"
            variant="filled"
            shape="rectangle"
            size="sm"
            type="button"
            onButtonClick={onSaveAs}
          >
            Save As
          </ModusWcButton>
        ) : (
          <SaveSplitButton onSaveAs={onSaveAs} onSaveCurrent={onSaveCurrent} />
        )}
        <ModusWcButton
          color="primary"
          variant="filled"
          shape="rectangle"
          size="sm"
          type="button"
          disabled={!canApply}
          onButtonClick={onApply}
        >
          Apply
        </ModusWcButton>
        <ModusWcButton
          color="tertiary"
          variant="borderless"
          shape="square"
          size="sm"
          type="button"
          aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          onButtonClick={onToggleFullscreen}
        >
          <AssetIcon src={fullscreenIcon} size={18} />
        </ModusWcButton>
        <ModusWcButton
          color="tertiary"
          variant="borderless"
          shape="square"
          size="sm"
          type="button"
          aria-label="Close timeline"
          onButtonClick={onClose}
        >
          <AssetIcon src={closeIcon} size={18} />
        </ModusWcButton>
      </header>

      <div className="flex min-h-0 flex-1">
        <div
          className="flex w-8 shrink-0 flex-col items-center gap-1 pt-2"
          style={{ borderRight: '1px solid var(--modus-wc-color-gray-0)' }}
        >
          <ModusWcButton
            color="tertiary"
            variant={pane === 'machines' ? 'filled' : 'borderless'}
            shape="square"
            size="sm"
            type="button"
            aria-label="Machines"
            aria-pressed={pane === 'machines'}
            onButtonClick={() => setPane('machines')}
          >
            <AssetIcon src={machinesIcon} size={16} />
          </ModusWcButton>
          <ModusWcButton
            color="tertiary"
            variant={pane === 'designs' ? 'filled' : 'borderless'}
            shape="square"
            size="sm"
            type="button"
            aria-label="Designs"
            aria-pressed={pane === 'designs'}
            onButtonClick={() => setPane('designs')}
          >
            <AssetIcon src={designsIcon} size={16} />
          </ModusWcButton>
          <ModusWcButton
            color="tertiary"
            variant="borderless"
            shape="square"
            size="sm"
            type="button"
            aria-label="Elevation"
            aria-pressed={false}
          >
            <AssetIcon src={elevationIcon} size={16} />
          </ModusWcButton>
        </div>

        <div hidden={!isDesigns} className="timeline-designs-panel">
          <div
            className="flex items-center gap-2 overflow-hidden pl-2 pr-3"
            style={{
              height: HEADER_HEIGHT,
              minHeight: HEADER_HEIGHT,
              background: 'var(--modus-wc-color-gray-01)',
              borderBottom: '1px solid var(--modus-wc-color-gray-0)',
            }}
          >
            <ModusWcCheckbox
              inputId="designs-select-all"
              label=""
              size="sm"
              aria-label="Select all designs"
              value={designsState === 'all'}
              indeterminate={designsState === 'mixed'}
              onInputChange={onToggleAllDesigns}
            />
            <ModusWcTypography
              hierarchy="p"
              size="sm"
              weight="semibold"
              customClass="t-muted"
              label="Designs"
            />
          </div>
          <div className="px-2 py-2">
            <ModusWcTextInput
              inputId="designs-search"
              customClass="timeline-designs-search"
              placeholder="Search"
              size="sm"
              type="search"
              includeSearch
              aria-label="Search designs"
              value={designQuery}
              onInputChange={(e: CustomEvent) => {
                const next = e.detail?.target?.value || ''
                setDesignQuery(next)
              }}
            />
          </div>
          {visibleDesigns.map((item) => (
            <div
              key={item.id}
              className="timeline-device-row box-border flex w-full items-center gap-2 overflow-hidden"
              style={{
                height: ROW_HEIGHT,
                minHeight: ROW_HEIGHT,
                maxHeight: ROW_HEIGHT,
                paddingLeft: 8,
                paddingRight: 12,
                background: 'var(--modus-wc-color-base-100)',
                borderBottom: '1px solid var(--modus-wc-color-gray-0)',
              }}
            >
              <ModusWcCheckbox
                inputId={`design-filter-${item.design}`}
                label=""
                size="sm"
                value={isDesignChecked(checked, item.design)}
                onInputChange={() => onToggleDesign(item.id)}
              />
              <ModusWcTypography
                hierarchy="p"
                size="sm"
                weight="normal"
                customClass="t-gray"
                label={item.label}
              />
            </div>
          ))}
        </div>

        <div className="timeline-scroll">
          <div style={{ width: ganttLeadWidth + TIMELINE_DAYS * DAY_WIDTH }}>
            <div
              className="timeline-header-row flex"
              style={{
                height: HEADER_HEIGHT,
                minHeight: HEADER_HEIGHT,
              }}
            >
              {isDesigns ? (
                <div
                  className="timeline-icon-col box-border shrink-0"
                  style={{
                    height: HEADER_HEIGHT,
                    minHeight: HEADER_HEIGHT,
                    borderBottom: '1px solid var(--modus-wc-color-gray-0)',
                  }}
                />
              ) : (
                <div
                  className="timeline-name-col flex w-[260px] shrink-0 items-center gap-2 overflow-hidden pl-2 pr-3"
                  style={{
                    height: HEADER_HEIGHT,
                    minHeight: HEADER_HEIGHT,
                    background: 'var(--modus-wc-color-gray-01)',
                    borderBottom: '1px solid var(--modus-wc-color-gray-0)',
                  }}
                >
                  <ModusWcCheckbox
                    inputId="devices-select-all"
                    label=""
                    size="sm"
                    aria-label="Select all devices"
                    value={machineState === 'all'}
                    indeterminate={machineState === 'mixed'}
                    onInputChange={onToggleAllMachines}
                  />
                  <ModusWcTypography
                    hierarchy="p"
                    size="sm"
                    weight="semibold"
                    customClass="t-muted"
                    label="Devices"
                  />
                </div>
              )}
              <div
                className="relative overflow-hidden"
                style={{
                  width: TIMELINE_DAYS * DAY_WIDTH,
                  height: HEADER_HEIGHT,
                  minHeight: HEADER_HEIGHT,
                  background: 'var(--modus-wc-color-gray-01)',
                  borderBottom: '1px solid var(--modus-wc-color-gray-0)',
                }}
              >
                {days.map((day) => (
                  <span
                    key={day}
                    className="absolute top-2"
                    style={{ left: (day - 1) * DAY_WIDTH + 4 }}
                  >
                    <ModusWcTypography
                      hierarchy="p"
                      size="xs"
                      weight="normal"
                      customClass="t-muted"
                      label={`${day} Jan`}
                    />
                  </span>
                ))}
              </div>
            </div>
            {TIMELINE_ROWS.map((row) => {
              const active = isRowActive(row, checked)
              return (
                <div key={row.id} className="flex">
                  {isDesigns ? (
                    <div
                      className="timeline-icon-col box-border flex shrink-0 items-center justify-center overflow-hidden"
                      style={{
                        height: ROW_HEIGHT,
                        minHeight: ROW_HEIGHT,
                        maxHeight: ROW_HEIGHT,
                        borderBottom: '1px solid var(--modus-wc-color-gray-0)',
                        opacity: active ? 1 : 0.4,
                      }}
                    >
                      {row.icon ? <AssetIcon src={DEVICE_ICONS[row.icon]} size={16} /> : null}
                    </div>
                  ) : (
                    <DeviceRow row={row} checked={checked} onToggle={onToggle} />
                  )}
                  <TrackCells row={row} checked={checked} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function TrackCells({
  row,
  checked,
}: {
  row: TimelineRow
  checked: Record<string, boolean>
}) {
  const active = isRowActive(row, checked)
  return (
    <div
      className="relative box-border overflow-hidden"
      style={{
        width: TIMELINE_DAYS * DAY_WIDTH,
        height: ROW_HEIGHT,
        minHeight: ROW_HEIGHT,
        maxHeight: ROW_HEIGHT,
        borderBottom: '1px solid var(--modus-wc-color-gray-0)',
        opacity: active ? 1 : 0.4,
      }}
    >
      {TIMELINE_BARS.filter(
        (bar) => bar.rowId === row.id && isDesignChecked(checked, bar.design),
      ).map((bar, index) => (
        <div
          key={`${bar.rowId}-${bar.design}-${index}`}
          className={`absolute top-[6px] flex h-7 items-center overflow-hidden rounded-sm px-1.5 ${DESIGN_CLASS[bar.design]}`}
          style={{
            left: bar.startDay * DAY_WIDTH,
            width: bar.durationDays * DAY_WIDTH,
          }}
        >
          <ModusWcTypography
            hierarchy="p"
            size="xs"
            weight="semibold"
            customClass="t-gray-10"
            label={`Design ${bar.design}`}
          />
        </div>
      ))}
      {TIMELINE_MARKERS.filter((marker) => marker.rowId === row.id).map((marker) => (
        <div
          key={`${marker.rowId}-${marker.day}`}
          className="absolute top-2 flex size-6 items-center justify-center rounded"
          style={{
            left: marker.day * DAY_WIDTH,
            border: '1px solid var(--modus-wc-color-gray-0)',
          }}
        >
          <AssetIcon src={marker.kind === 'surface' ? surfaceIcon : photoIcon} size={16} />
        </div>
      ))}
    </div>
  )
}

function SaveSplitButton({
  onSaveAs,
  onSaveCurrent,
}: {
  onSaveAs: () => void
  onSaveCurrent: () => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const closeMenu = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (wrapRef.current?.contains(event.target as Node)) return
      closeMenu()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, closeMenu])

  const handleMenuFocusout = (event: CustomEvent<FocusEvent>) => {
    const next = event.detail?.relatedTarget as Node | null
    if (next && wrapRef.current?.contains(next)) return
    closeMenu()
  }

  return (
    <div ref={wrapRef} className="relative z-30 shrink-0">
      <div className="flex overflow-hidden rounded-lg">
        <ModusWcButton
          color="tertiary"
          variant="filled"
          shape="rectangle"
          size="sm"
          type="button"
          onButtonClick={() => {
            closeMenu()
            onSaveCurrent()
          }}
        >
          Save
        </ModusWcButton>
        <ModusWcButton
          color="tertiary"
          variant="filled"
          shape="square"
          size="sm"
          type="button"
          aria-label="Save options"
          aria-expanded={open}
          aria-haspopup="menu"
          onButtonClick={() => setOpen((current) => !current)}
        >
          <AssetIcon src={expandMoreIcon} size={18} />
        </ModusWcButton>
      </div>
      {open ? (
        <div className="save-options-menu">
          <ModusWcMenu
            size="sm"
            orientation="vertical"
            aria-label="Save options"
            onMenuFocusout={handleMenuFocusout}
          >
            {SAVE_MENU_ACTIONS.map((action) => (
              <ModusWcMenuItem
                key={action.value}
                size="sm"
                label={action.label}
                value={action.value}
                onItemSelect={() => {
                  if (action.value === 'save-as-new') onSaveAs()
                  else onSaveCurrent()
                  closeMenu()
                }}
              />
            ))}
          </ModusWcMenu>
        </div>
      ) : null}
    </div>
  )
}

function DeviceRow({
  row,
  checked,
  onToggle,
}: {
  row: TimelineRow
  checked: Record<string, boolean>
  onToggle: (id: string) => void
}) {
  const indent = Boolean(row.parentId)
  const groupState = row.kind === 'group' ? groupCheckState(row.id, checked) : null
  const isChecked = groupState ? groupState === 'all' : Boolean(checked[row.id])
  return (
    <div
      className="timeline-device-row timeline-name-col box-border flex w-[260px] shrink-0 items-center gap-2 overflow-hidden"
      style={{
        height: ROW_HEIGHT,
        minHeight: ROW_HEIGHT,
        maxHeight: ROW_HEIGHT,
        paddingLeft: indent ? 28 : 8,
        paddingRight: 12,
        background: 'var(--modus-wc-color-base-100)',
        borderBottom: '1px solid var(--modus-wc-color-gray-0)',
        opacity: row.parentId && !checked[row.parentId] ? 0.45 : 1,
      }}
    >
      <ModusWcCheckbox
        inputId={`device-${row.id}`}
        label=""
        size="sm"
        value={isChecked}
        indeterminate={groupState === 'mixed'}
        onInputChange={() => onToggle(row.id)}
      />
      {row.icon && <AssetIcon src={DEVICE_ICONS[row.icon]} size={16} />}
      <ModusWcTypography
        hierarchy="p"
        size="sm"
        weight={row.kind === 'device' ? 'normal' : 'semibold'}
        customClass="t-gray"
        label={row.label}
      />
    </div>
  )
}
