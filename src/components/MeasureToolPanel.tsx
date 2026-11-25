import { ModusWcButton, ModusWcDivider, ModusWcIcon, ModusWcTooltip } from '@trimble-oss/moduswebcomponents-react'
import { AssetIcon } from './AssetIcon'
import caretIcon from '../assets/caret.svg'

type MeasureTool = {
  id: string
  label: string
  icon?: string
  caret?: boolean
}

const MEASURE_TOOLS: MeasureTool[] = [
  { id: 'point', label: 'Point', icon: 'location_point' },
  { id: 'distance', label: 'Distance', icon: 'polygon_line_tool' },
  { id: 'area', label: 'Area', icon: 'polygon_area_tool', caret: true },
  { id: 'angle', label: 'Angle', icon: 'angle_90' },
  { id: 'volume', label: 'Volume' },
]

const MEASURE_ACTIONS: MeasureTool[] = [
  { id: 'view-3d', label: '3D', icon: 'cube' },
  { id: 'report', label: 'Report', icon: 'document' },
]

function ToolIcon({ name }: { name?: string }) {
  if (name) {
    return <ModusWcIcon decorative name={name} size="xs" />
  }
  return <span className="measure-tool-placeholder" aria-hidden="true" />
}

function ToolButton({
  tool,
  pressed,
  describedBy,
  onClick,
}: {
  tool: MeasureTool
  pressed?: boolean
  describedBy?: string
  onClick?: () => void
}) {
  return (
    <ModusWcButton
      color="tertiary"
      variant={pressed ? 'filled' : 'borderless'}
      shape="square"
      size="sm"
      type="button"
      aria-label={tool.label}
      aria-pressed={pressed}
      aria-describedby={describedBy}
      onButtonClick={onClick}
    >
      <span className="measure-tool-icon-slot">
        <ToolIcon name={tool.icon} />
        {tool.caret ? (
          <AssetIcon src={caretIcon} size={12} className="measure-tool-caret" />
        ) : null}
      </span>
    </ModusWcButton>
  )
}

type MeasureToolPanelProps = {
  reportOpen: boolean
  onReportToggle: () => void
}

export function MeasureToolPanel({ reportOpen, onReportToggle }: MeasureToolPanelProps) {
  return (
    <div className="measure-tool-panel" role="toolbar" aria-label="Measure tools">
      {MEASURE_TOOLS.map((tool) => (
        <ToolButton key={tool.id} tool={tool} />
      ))}
      <ModusWcDivider />
      {MEASURE_ACTIONS.map((tool) =>
        tool.id === 'report' ? (
          <ModusWcTooltip
            key={tool.id}
            content="Quality Metrics"
            position="right"
            tooltipId="quality-metrics-tooltip"
          >
            <ToolButton
              tool={tool}
              pressed={reportOpen}
              describedBy="quality-metrics-tooltip"
              onClick={onReportToggle}
            />
          </ModusWcTooltip>
        ) : (
          <ToolButton key={tool.id} tool={tool} />
        ),
      )}
    </div>
  )
}
