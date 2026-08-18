import {
  ModusWcButton,
  ModusWcCheckbox,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'
import { AssetIcon } from './AssetIcon'
import {
  DAY_WIDTH,
  ROW_HEIGHT,
  TIMELINE_BARS,
  TIMELINE_DAYS,
  TIMELINE_MARKERS,
  TIMELINE_ROWS,
  isRowActive,
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

type TerrainTimelineProps = {
  checked: Record<string, boolean>
  fullscreen: boolean
  saveMessage: string | null
  onToggle: (id: string) => void
  onApply: () => void
  onSave: () => void
  onClose: () => void
  onToggleFullscreen: () => void
}

export function TerrainTimeline({
  checked,
  fullscreen,
  saveMessage,
  onToggle,
  onApply,
  onSave,
  onClose,
  onToggleFullscreen,
}: TerrainTimelineProps) {
  const days = Array.from({ length: TIMELINE_DAYS }, (_, index) => index + 1)

  return (
    <section
      className="flex h-full min-h-0 w-full flex-col"
      style={{
        background: 'var(--modus-wc-color-base-100)',
        border: '1px solid var(--modus-wc-color-gray-0)',
      }}
    >
      <header
        className="relative flex h-11 shrink-0 items-center gap-3 overflow-hidden px-3"
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
            label="Last Month Terrain"
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
        {saveMessage && (
          <ModusWcTypography
            hierarchy="p"
            size="xs"
            weight="normal"
            customClass="t-green"
            label={saveMessage}
          />
        )}
        <div className="flex overflow-hidden rounded-lg">
          <ModusWcButton
            color="tertiary"
            variant="filled"
            shape="rectangle"
            size="sm"
            type="button"
            onButtonClick={onSave}
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
            onButtonClick={onSave}
          >
            <AssetIcon src={expandMoreIcon} size={18} />
          </ModusWcButton>
        </div>
        <ModusWcButton
          color="primary"
          variant="filled"
          shape="rectangle"
          size="sm"
          type="button"
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
          <ModusWcButton color="tertiary" variant="filled" shape="square" size="sm" type="button" aria-label="Machines">
            <AssetIcon src={machinesIcon} size={16} />
          </ModusWcButton>
          <ModusWcButton color="tertiary" variant="borderless" shape="square" size="sm" type="button" aria-label="Designs">
            <AssetIcon src={designsIcon} size={16} />
          </ModusWcButton>
          <ModusWcButton color="tertiary" variant="borderless" shape="square" size="sm" type="button" aria-label="Elevation">
            <AssetIcon src={elevationIcon} size={16} />
          </ModusWcButton>
        </div>

        <div
          className="flex w-[260px] shrink-0 flex-col overflow-auto"
          style={{ borderRight: '1px solid var(--modus-wc-color-gray-0)' }}
        >
          <div
            className="flex h-8 shrink-0 items-center px-3"
            style={{
              background: 'var(--modus-wc-color-gray-01)',
              borderBottom: '1px solid var(--modus-wc-color-gray-0)',
            }}
          >
            <ModusWcTypography
              hierarchy="p"
              size="xs"
              weight="semibold"
              customClass="t-muted"
              label="Devices"
            />
          </div>
          {TIMELINE_ROWS.map((row) => (
            <DeviceRow key={row.id} row={row} checked={checked} onToggle={onToggle} />
          ))}
        </div>

        <div className="min-w-0 flex-1 overflow-auto">
          <div style={{ width: TIMELINE_DAYS * DAY_WIDTH }}>
            <div
              className="relative h-8"
              style={{
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
            {TIMELINE_ROWS.map((row) => {
              const active = isRowActive(row, checked)
              return (
                <div
                  key={row.id}
                  className="relative"
                  style={{
                    height: ROW_HEIGHT,
                    borderBottom: '1px solid var(--modus-wc-color-gray-0)',
                    opacity: active ? 1 : 0.4,
                  }}
                >
                  {TIMELINE_BARS.filter((bar) => bar.rowId === row.id).map((bar, index) => (
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
                      <AssetIcon
                        src={marker.kind === 'surface' ? surfaceIcon : photoIcon}
                        size={16}
                      />
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
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
  return (
    <div
      className="flex items-center gap-2"
      style={{
        height: ROW_HEIGHT,
        paddingLeft: indent ? 28 : 8,
        paddingRight: 12,
        borderBottom: '1px solid var(--modus-wc-color-gray-0)',
        opacity: row.parentId && !checked[row.parentId] ? 0.45 : 1,
      }}
    >
      <ModusWcCheckbox
        inputId={`device-${row.id}`}
        label=""
        size="sm"
        value={Boolean(checked[row.id])}
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
