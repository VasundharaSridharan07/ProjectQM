import { ModusWcButton } from '@trimble-oss/moduswebcomponents-react'
import { AssetIcon } from './AssetIcon'
import orbitIcon from '../assets/orbit.svg'
import caretIcon from '../assets/caret.svg'
import selectIcon from '../assets/select.svg'
import marqueeIcon from '../assets/marquee.svg'
import viewCubeIcon from '../assets/view-cube.svg'
import orthoIcon from '../assets/ortho.svg'
import eyeIcon from '../assets/eye.svg'
import measureXIcon from '../assets/measure-x.svg'

export type MapTool = 'orbit' | 'select' | 'marquee' | 'measure'
export type MapViewMode = 'perspective' | 'ortho'

type EditToolbarProps = {
  tool: MapTool
  viewMode: MapViewMode
  terrainOn: boolean
  onToolChange: (tool: MapTool) => void
  onViewModeChange: (mode: MapViewMode) => void
  onTerrainToggle: () => void
}

function Divider() {
  return (
    <div
      className="mx-1 h-5 w-px"
      style={{ background: 'var(--modus-wc-color-base-200)' }}
    />
  )
}

export function EditToolbar({
  tool,
  viewMode,
  terrainOn,
  onToolChange,
  onViewModeChange,
  onTerrainToggle,
}: EditToolbarProps) {
  return (
    <div
      className="flex h-10 items-center rounded-lg px-2"
      style={{
        background: 'var(--modus-wc-color-base-100)',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)',
      }}
    >
      <ModusWcButton
        color="tertiary"
        variant={tool === 'orbit' ? 'filled' : 'borderless'}
        shape="square"
        size="sm"
        type="button"
        aria-label="Orbit"
        aria-pressed={tool === 'orbit'}
        onButtonClick={() => onToolChange('orbit')}
      >
        <AssetIcon src={orbitIcon} size={16} />
      </ModusWcButton>
      <AssetIcon src={caretIcon} size={16} />
      <Divider />
      <ModusWcButton
        color="tertiary"
        variant={tool === 'select' ? 'filled' : 'borderless'}
        shape="square"
        size="sm"
        type="button"
        aria-label="Select"
        aria-pressed={tool === 'select'}
        onButtonClick={() => onToolChange('select')}
      >
        <AssetIcon src={selectIcon} size={16} />
      </ModusWcButton>
      <ModusWcButton
        color="tertiary"
        variant={tool === 'marquee' ? 'filled' : 'borderless'}
        shape="square"
        size="sm"
        type="button"
        aria-label="Select area"
        aria-pressed={tool === 'marquee'}
        onButtonClick={() => onToolChange('marquee')}
      >
        <AssetIcon src={marqueeIcon} size={16} />
      </ModusWcButton>
      <Divider />
      <ModusWcButton
        color="tertiary"
        variant={viewMode === 'perspective' ? 'filled' : 'borderless'}
        shape="square"
        size="sm"
        type="button"
        aria-label="Perspective view"
        onButtonClick={() => onViewModeChange('perspective')}
      >
        <AssetIcon src={viewCubeIcon} size={16} />
      </ModusWcButton>
      <AssetIcon src={caretIcon} size={16} />
      <ModusWcButton
        color="tertiary"
        variant={viewMode === 'ortho' ? 'filled' : 'borderless'}
        shape="square"
        size="sm"
        type="button"
        aria-label="Orthographic view"
        onButtonClick={() => onViewModeChange('ortho')}
      >
        <AssetIcon src={orthoIcon} size={16} />
      </ModusWcButton>
      <ModusWcButton
        color="tertiary"
        variant={terrainOn ? 'filled' : 'borderless'}
        shape="square"
        size="sm"
        type="button"
        aria-label="Toggle terrain"
        aria-pressed={terrainOn}
        onButtonClick={onTerrainToggle}
      >
        <AssetIcon src={eyeIcon} size={16} />
      </ModusWcButton>
      <AssetIcon src={caretIcon} size={16} />
      <Divider />
      <ModusWcButton
        color="tertiary"
        variant={tool === 'measure' ? 'filled' : 'borderless'}
        shape="square"
        size="sm"
        type="button"
        aria-label="Measure"
        aria-pressed={tool === 'measure'}
        onButtonClick={() => onToolChange('measure')}
      >
        <AssetIcon src={measureXIcon} size={16} />
      </ModusWcButton>
    </div>
  )
}
