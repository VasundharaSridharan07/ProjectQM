import { ModusWcButton } from '@trimble-oss/moduswebcomponents-react'
import { AssetIcon } from './AssetIcon'
import cubeIcon from '../assets/cube.svg'
import packageIcon from '../assets/package.svg'
import layersIcon from '../assets/layers.svg'
import devicesIcon from '../assets/devices.svg'
import measureIcon from '../assets/measure.svg'

export type LeftNavId = 'models' | 'packages' | 'layers' | 'devices' | 'measure'

const ITEMS: { id: LeftNavId; src: string; label: string }[] = [
  { id: 'models', src: cubeIcon, label: 'Models' },
  { id: 'packages', src: packageIcon, label: 'Data packages' },
  { id: 'layers', src: layersIcon, label: 'Layers' },
  { id: 'devices', src: devicesIcon, label: 'Devices' },
  { id: 'measure', src: measureIcon, label: 'Measurements' },
]

type LeftToolbarProps = {
  activeId: LeftNavId
  onSelect: (id: LeftNavId) => void
}

export function LeftToolbar({ activeId, onSelect }: LeftToolbarProps) {
  return (
    <nav
      className="flex h-full w-10 shrink-0 flex-col items-center justify-center"
      style={{ background: 'var(--modus-wc-color-gray-light)' }}
      aria-label="Viewer tools"
    >
      <div className="flex flex-col items-center gap-1">
        {ITEMS.map((item) => (
          <ModusWcButton
            key={item.id}
            color="tertiary"
            variant={activeId === item.id ? 'filled' : 'borderless'}
            shape="square"
            size="sm"
            type="button"
            aria-label={item.label}
            aria-pressed={activeId === item.id}
            onButtonClick={() => onSelect(item.id)}
          >
            <AssetIcon src={item.src} size={18} />
          </ModusWcButton>
        ))}
      </div>
    </nav>
  )
}
