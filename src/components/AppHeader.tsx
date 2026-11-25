import { useLayoutEffect, useState } from 'react'
import {
  ModusWcButton,
  ModusWcNavbar,
  ModusWcThemeSwitcher,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'
import { AssetIcon } from './AssetIcon'
import headerCaret from '../assets/header-caret.svg'

const PROJECTS = ['Augie Project', 'Glenwood Corridor']

/** Filled Modus `info` glyph (solid info.svg). The navbar help control hardcodes a question mark. */
const INFO_ICON_PATH =
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1.06 14.15c0 .55-.45 1-1 1s-1-.45-1-1v-4.14c0-.55.45-1 1-1s1 .45 1 1zm-1-7.11c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1'

function applyHelpInfoIcon(navbar: Element) {
  const svg = navbar.querySelector('button[aria-label="Help"] svg')
  const path = svg?.querySelector('path')
  if (!svg || !path || svg.getAttribute('data-icon') === 'info-solid') return
  path.setAttribute('d', INFO_ICON_PATH)
  svg.setAttribute('class', 'mi-solid mi-info')
  svg.setAttribute('data-icon', 'info-solid')
}

type AppHeaderProps = {
  projectName: string
  onProjectChange: (name: string) => void
  mainMenuOpen: boolean
  onMainMenuOpenChange: (open: boolean) => void
}

export function AppHeader({
  projectName,
  onProjectChange,
  mainMenuOpen,
  onMainMenuOpenChange,
}: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  useLayoutEffect(() => {
    const navbar = document.querySelector('modus-wc-navbar')
    if (!navbar) return
    applyHelpInfoIcon(navbar)
    const observer = new MutationObserver(() => applyHelpInfoIcon(navbar))
    observer.observe(navbar, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return (
    <ModusWcNavbar
      logoName="worksmanager"
      mainMenuOpen={mainMenuOpen}
      onMainMenuOpenChange={(event: CustomEvent<boolean>) =>
        onMainMenuOpenChange(Boolean(event.detail))
      }
      visibility={{
        ai: true,
        apps: true,
        help: true,
        logo: true,
        mainMenu: true,
        notifications: false,
        search: true,
        searchInput: false,
        user: true,
      }}
      userCard={{ name: 'VS', email: 'vs@trimble.com' }}
    >
      <div slot="start" className="flex items-center gap-3">
        <div className="relative">
          <ModusWcButton
            color="tertiary"
            variant="borderless"
            shape="rectangle"
            size="md"
            type="button"
            onButtonClick={() => setMenuOpen((open) => !open)}
          >
            <span className="flex items-center gap-2">
              <ModusWcTypography
                hierarchy="p"
                size="md"
                weight="normal"
                customClass="t-content"
                label={projectName}
              />
              <AssetIcon src={headerCaret} size={16} />
            </span>
          </ModusWcButton>
          {menuOpen && (
            <div
              className="absolute left-0 top-full z-30 mt-1 min-w-[180px] p-1"
              style={{
                background: 'var(--modus-wc-color-base-100)',
                boxShadow: 'var(--modus-wc-shadow-md, 0 1px 3px rgba(0,0,0,0.12))',
              }}
            >
              {PROJECTS.map((name) => (
                <ModusWcButton
                  key={name}
                  color="tertiary"
                  variant="borderless"
                  shape="rectangle"
                  size="sm"
                  type="button"
                  onButtonClick={() => {
                    onProjectChange(name)
                    setMenuOpen(false)
                  }}
                >
                  {name}
                </ModusWcButton>
              ))}
            </div>
          )}
        </div>
      </div>
      <div slot="end" className="navbar-end">
        <ModusWcThemeSwitcher aria-label="Theme toggle" />
      </div>
    </ModusWcNavbar>
  )
}
