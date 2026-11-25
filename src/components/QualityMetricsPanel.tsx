import { useState } from 'react'
import type { ISelectOption, ITab } from '@trimble-oss/moduswebcomponents'
import {
  ModusWcButton,
  ModusWcIcon,
  ModusWcSelect,
  ModusWcTabs,
  ModusWcTextInput,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'

const TERRAIN_OPTIONS: ISelectOption[] = [{ label: 'Default Terrain', value: 'default' }]
const TEMPLATE_OPTIONS: ISelectOption[] = [{ label: 'Blue to Red (Default)', value: 'blue-to-red' }]
const SECTION_TABS: ITab[] = [{ label: 'Properties' }, { label: 'Style' }]

const VIBRATION_OPTIONS = ['All', 'On', 'Off'] as const
const DIRECTION_OPTIONS = ['All', 'Forward', 'Reverse'] as const

const COLOR_STOPS = [
  { id: 'gte7', label: 'Passes greater than or equal to 7', colorClass: 'qm-color-red' },
  { id: 'six', label: 'Passes 6', colorClass: 'qm-color-red-light' },
  { id: 'five', label: 'Passes 5', colorClass: 'qm-color-green' },
  { id: 'four', label: 'Passes 4', colorClass: 'qm-color-blue' },
] as const

type QualityMetricsPanelProps = {
  onClose: () => void
}

function FieldLabel({ label }: { label: string }) {
  return (
    <ModusWcTypography
      hierarchy="p"
      size="xs"
      weight="normal"
      customClass="t-muted !m-0"
      label={label}
    />
  )
}

function IconButton({
  label,
  name,
  pressed,
  onClick,
}: {
  label: string
  name: string
  pressed?: boolean
  onClick?: () => void
}) {
  return (
    <ModusWcButton
      color="tertiary"
      variant="outlined"
      shape="square"
      size="sm"
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onButtonClick={onClick}
    >
      <ModusWcIcon decorative name={name} size="xs" />
    </ModusWcButton>
  )
}

function SegmentGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly string[]
  value: string
  onChange: (next: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel label={label} />
      <div className="qm-segment flex w-full" role="group" aria-label={label}>
        {options.map((option) => {
          const selected = option === value
          return (
            <ModusWcButton
              key={option}
              color={selected ? 'primary' : 'tertiary'}
              variant={selected ? 'filled' : 'outlined'}
              size="sm"
              type="button"
              aria-pressed={selected}
              onButtonClick={() => onChange(option)}
            >
              {option}
            </ModusWcButton>
          )
        })}
      </div>
    </div>
  )
}

export function QualityMetricsPanel({ onClose }: QualityMetricsPanelProps) {
  const [configureOpen, setConfigureOpen] = useState(true)
  const [terrainVisible, setTerrainVisible] = useState(true)
  const [terrainFilter, setTerrainFilter] = useState('default')
  const [template, setTemplate] = useState('blue-to-red')
  const [vibration, setVibration] = useState<string>('All')
  const [direction, setDirection] = useState<string>('All')
  const [tabIndex, setTabIndex] = useState(1)
  const [stops, setStops] = useState<Record<string, string>>({
    gte7: '>= 7',
    six: '6',
    five: '5',
    four: '4',
  })

  return (
    <aside className="quality-metrics-panel" aria-label="Pass Count 3">
      <div className="quality-metrics-header">
        <ModusWcTypography
          hierarchy="h2"
          size="lg"
          weight="semibold"
          customClass="!m-0 min-w-0"
          label="Pass Count 3"
        />
        <div className="flex items-center">
          <ModusWcButton
            color="tertiary"
            variant="borderless"
            shape="square"
            size="sm"
            type="button"
            aria-label="Rename"
          >
            <ModusWcIcon decorative name="pencil" size="xs" />
          </ModusWcButton>
          <ModusWcButton
            color="tertiary"
            variant="borderless"
            shape="square"
            size="sm"
            type="button"
            aria-label="Close"
            onButtonClick={onClose}
          >
            <ModusWcIcon decorative name="close" size="xs" />
          </ModusWcButton>
        </div>
      </div>

      <div className="quality-metrics-body">
        <div className="quality-metrics-configure">
          <ModusWcTypography
            hierarchy="p"
            size="md"
            weight="normal"
            customClass="!m-0 min-w-0 flex-1"
            label="Configure"
          />
          <ModusWcButton
            color="tertiary"
            variant="borderless"
            shape="square"
            size="sm"
            type="button"
            aria-label={configureOpen ? 'Collapse configure' : 'Expand configure'}
            aria-expanded={configureOpen}
            onButtonClick={() => setConfigureOpen((open) => !open)}
          >
            <ModusWcIcon decorative name={configureOpen ? 'expand_less' : 'expand_more'} size="xs" />
          </ModusWcButton>
        </div>

        <div
          className={configureOpen ? 'flex flex-col gap-3 px-4 py-3' : undefined}
          hidden={!configureOpen}
        >
          <div className="flex flex-col">
            <FieldLabel label="Quality Metric" />
            <ModusWcTypography
              hierarchy="p"
              size="md"
              weight="normal"
              customClass="!m-0"
              label="Pass Count"
            />
          </div>

          <div className="flex items-end gap-2">
            <ModusWcSelect
              customClass="min-w-0 flex-1"
              label="Terrain Filter"
              size="sm"
              options={TERRAIN_OPTIONS}
              value={terrainFilter}
              onInputChange={(event: CustomEvent) => {
                setTerrainFilter(event.detail?.target?.value || '')
              }}
            />
            <IconButton
              label={terrainVisible ? 'Hide terrain filter' : 'Show terrain filter'}
              name={terrainVisible ? 'visibility_on' : 'visibility_off'}
              pressed={terrainVisible}
              onClick={() => setTerrainVisible((visible) => !visible)}
            />
          </div>

          <div className="flex items-start gap-1">
            <ModusWcIcon decorative name="info" size="xs" />
            <ModusWcTypography
              hierarchy="p"
              size="xs"
              weight="normal"
              customClass="t-muted !m-0"
              label="Date ranges from Jan 10, 2026 12:00am to Jan 29, 2026 12:00am"
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex min-w-0 flex-1 flex-col">
              <FieldLabel label="Boundary" />
              <ModusWcTypography hierarchy="p" size="md" weight="normal" customClass="!m-0" label="None" />
            </div>
            <IconButton label="Edit boundary" name="pencil" />
            <IconButton label="Pick boundary" name="cursor" />
          </div>

          <SegmentGroup
            label="Vibration State"
            options={VIBRATION_OPTIONS}
            value={vibration}
            onChange={setVibration}
          />
          <SegmentGroup
            label="Travel Direction"
            options={DIRECTION_OPTIONS}
            value={direction}
            onChange={setDirection}
          />
        </div>

        <ModusWcTabs
          aria-label="Measurement sections"
          activeTabIndex={tabIndex}
          size="sm"
          tabs={SECTION_TABS}
          onTabChange={(event: CustomEvent<{ previousTab: number; newTab: number }>) => {
            setTabIndex(event.detail.newTab)
          }}
        />

        <div className={tabIndex === 0 ? 'px-4 py-3' : undefined} hidden={tabIndex !== 0}>
          <ModusWcTypography
            hierarchy="p"
            size="sm"
            weight="normal"
            customClass="t-muted !m-0"
            label="No properties"
          />
        </div>

        <div
          className={tabIndex === 1 ? 'flex flex-col gap-3 px-4 py-3' : undefined}
          hidden={tabIndex !== 1}
        >
          <div className="flex items-end gap-2">
            <ModusWcSelect
              customClass="min-w-0 flex-1"
              label="HEATMAP TEMPLATE (PASS COUNT)"
              size="sm"
              options={TEMPLATE_OPTIONS}
              value={template}
              onInputChange={(event: CustomEvent) => {
                setTemplate(event.detail?.target?.value || '')
              }}
            />
            <IconButton label="Edit heatmap template" name="pencil" />
            <IconButton label="Add heatmap template" name="add" />
          </div>

          <div className="flex flex-col gap-2">
            <ModusWcTypography
              hierarchy="p"
              size="xs"
              weight="semibold"
              customClass="t-muted !m-0"
              label="COLOR STOPS"
            />
            <div className="flex items-stretch gap-3">
              <div className="qm-stop-bar" aria-hidden="true">
                {COLOR_STOPS.map((stop) => (
                  <span key={stop.id} className={stop.colorClass} />
                ))}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <ModusWcTypography
                  hierarchy="p"
                  size="xs"
                  weight="semibold"
                  customClass="t-muted !m-0 text-center"
                  label="Passes"
                />
                {COLOR_STOPS.map((stop) => (
                  <div key={stop.id} className="flex items-center gap-2">
                    <span className={`qm-swatch ${stop.colorClass}`} aria-hidden="true" />
                    <ModusWcTextInput
                      customClass="min-w-0 flex-1"
                      size="sm"
                      aria-label={stop.label}
                      value={stops[stop.id]}
                      onInputChange={(event: CustomEvent) => {
                        const next = event.detail?.target?.value || ''
                        setStops((current) => ({ ...current, [stop.id]: next }))
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="quality-metrics-footer">
        <ModusWcButton color="tertiary" variant="outlined" size="sm" type="button" onButtonClick={onClose}>
          Cancel
        </ModusWcButton>
        <ModusWcButton color="primary" variant="filled" size="sm" type="button" onButtonClick={onClose}>
          Compute
        </ModusWcButton>
      </div>
    </aside>
  )
}
