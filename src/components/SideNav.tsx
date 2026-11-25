import type { CSSProperties } from 'react'
import {
  ModusWcButton,
  ModusWcDivider,
  ModusWcIcon,
  ModusWcLogo,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'
import { AssetIcon } from './AssetIcon'
import accountIcon from '../assets/sidenav-account.svg'
import designsIcon from '../assets/designs.svg'
import devicesIcon from '../assets/devices.svg'
import mapIcon from '../assets/map.svg'
import globeIcon from '../assets/globe.svg'
import heroImage from '../assets/sidenav-hero.jpg'

export type SideNavId =
  | 'map'
  | 'viewer'
  | 'designs'
  | 'members'
  | 'devices'
  | 'settings'
  | 'projects'
  | 'accounts'

const MAIN_ITEMS: { id: SideNavId; label: string; icon: string }[] = [
  { id: 'map', label: 'Map', icon: 'map' },
  { id: 'viewer', label: '3D Viewer', icon: 'globe' },
  { id: 'designs', label: 'Designs', icon: 'designs' },
  { id: 'members', label: 'Members', icon: 'person' },
  { id: 'devices', label: 'Devices', icon: 'devices' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

const SECONDARY_ITEMS: { id: SideNavId; label: string; icon: string }[] = [
  { id: 'projects', label: 'My Projects', icon: 'apps' },
  { id: 'accounts', label: 'My Accounts', icon: 'account' },
]

function glyphStyle(src: string): CSSProperties {
  return { '--side-nav-glyph': `url("${src}")` } as CSSProperties
}

function SideNavIcon({ name }: { name: string }) {
  if (name === 'map') {
    return <AssetIcon src={mapIcon} size={24} className="side-nav-glyph side-nav-map" style={glyphStyle(mapIcon)} />
  }
  if (name === 'globe') {
    return <AssetIcon src={globeIcon} size={24} className="side-nav-glyph side-nav-globe" style={glyphStyle(globeIcon)} />
  }
  if (name === 'devices') {
    return <AssetIcon src={devicesIcon} size={24} className="side-nav-glyph side-nav-devices" style={glyphStyle(devicesIcon)} />
  }
  if (name === 'designs') {
    return <AssetIcon src={designsIcon} size={24} className="side-nav-glyph side-nav-designs" style={glyphStyle(designsIcon)} />
  }
  if (name === 'account') {
    return <AssetIcon src={accountIcon} size={24} className="side-nav-glyph side-nav-account" style={glyphStyle(accountIcon)} />
  }
  return (
    <ModusWcIcon
      decorative
      name={name}
      size="md"
      customClass="side-nav-icon"
    />
  )
}

function SideNavItem({
  id,
  label,
  icon,
  selected,
  onSelect,
}: {
  id: SideNavId
  label: string
  icon: string
  selected: boolean
  onSelect: (id: SideNavId) => void
}) {
  return (
    <ModusWcButton
      color="tertiary"
      variant="borderless"
      shape="rectangle"
      size="sm"
      type="button"
      fullWidth
      aria-label={label}
      aria-pressed={selected}
      aria-current={selected ? 'page' : undefined}
      customClass={selected ? 'side-nav-item side-nav-item-selected' : 'side-nav-item'}
      onButtonClick={() => onSelect(id)}
    >
      <span className="side-nav-item-content">
        <SideNavIcon name={icon} />
        <ModusWcTypography
          hierarchy="p"
          size="md"
          weight="normal"
          customClass="side-nav-label"
          label={label}
        />
      </span>
    </ModusWcButton>
  )
}

export function SideNav({
  expanded,
  selectedId,
  onSelect,
}: {
  expanded: boolean
  selectedId: SideNavId
  onSelect: (id: SideNavId) => void
}) {
  return (
    <nav
      className={expanded ? 'side-nav' : 'side-nav side-nav-collapsed'}
      aria-label="Side navigation"
    >
      <img className="side-nav-hero" src={heroImage} alt="Sanders Dam Worksite" />
      <div className="side-nav-items">
        {MAIN_ITEMS.map((item) => (
          <SideNavItem key={item.id} {...item} selected={selectedId === item.id} onSelect={onSelect} />
        ))}
        <ModusWcDivider customClass="side-nav-divider" />
        {SECONDARY_ITEMS.map((item) => (
          <SideNavItem key={item.id} {...item} selected={selectedId === item.id} onSelect={onSelect} />
        ))}
      </div>
      <div className="side-nav-footer">
        <ModusWcLogo name="trimble" alt="Trimble" customClass="side-nav-logo" />
        <ModusWcTypography
          hierarchy="p"
          size="xs"
          weight="normal"
          customClass="side-nav-footer-text"
          label="Privacy | Terms of Use"
        />
        <ModusWcTypography
          hierarchy="p"
          size="xs"
          weight="normal"
          customClass="side-nav-footer-text"
          label="© Copyright 2025, Trimble Inc."
        />
      </div>
    </nav>
  )
}
