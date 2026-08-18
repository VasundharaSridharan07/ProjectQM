import { useState } from 'react'
import {
  ModusWcButton,
  ModusWcNavbar,
  ModusWcThemeSwitcher,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'
import { AssetIcon } from './AssetIcon'
import headerCaret from '../assets/header-caret.svg'

const PROJECTS = ['Augie Project', 'Glenwood Corridor']

type AppHeaderProps = {
  projectName: string
  onProjectChange: (name: string) => void
}

export function AppHeader({ projectName, onProjectChange }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <ModusWcNavbar
      logoName="worksmanager"
      visibility={{
        ai: true,
        apps: true,
        help: true,
        logo: true,
        mainMenu: false,
        notifications: false,
        search: true,
        searchInput: false,
        user: true,
      }}
      userCard={{ name: 'VS', email: 'vs@trimble.com' }}
    >
      <div slot="center" className="flex items-center gap-3">
        <ModusWcTypography
          hierarchy="p"
          size="lg"
          weight="normal"
          customClass="t-content"
          label="WorksManager"
        />
        <div
          className="h-8 w-px"
          style={{ background: 'var(--modus-wc-color-base-200)' }}
        />
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
