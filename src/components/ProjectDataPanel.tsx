import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ModusWcButton,
  ModusWcMenu,
  ModusWcMenuItem,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'
import { AssetIcon } from './AssetIcon'
import { TERRAIN_FOLDER_ID, type ProjectDataNode } from '../data/projectData'
import addIcon from '../assets/add.svg'
import sortIcon from '../assets/sort.svg'
import searchIcon from '../assets/search.svg'
import caretSm from '../assets/caret-sm.svg'
import designIcon from '../assets/design.svg'
import surfaceIcon from '../assets/surface.svg'
import photoIcon from '../assets/photo.svg'
import terrainIcon from '../assets/terrain.svg'
import chevronIcon from '../assets/chevron.svg'
import moreIcon from '../assets/more.svg'
import eyeVisibilityIcon from '../assets/eye-visibility.svg'
import eyeVisibilityOffIcon from '../assets/eye-visibility-off.svg'

const ICONS = {
  design: designIcon,
  surface: surfaceIcon,
  photo: photoIcon,
  terrain: terrainIcon,
}

const TERRAIN_CHILD_ACTIONS = [
  { value: 'filter', label: 'Filter' },
  { value: 'export', label: 'Export' },
  { value: 'rename', label: 'Rename' },
  { value: 'delete', label: 'Delete' },
] as const

type ProjectDataPanelProps = {
  tree: ProjectDataNode[]
  expandedIds: string[]
  selectedId: string
  visibleIds: string[]
  hasUnsaved: boolean
  onToggleExpand: (id: string) => void
  onSelect: (id: string) => void
  onToggleVisible: (id: string) => void
  onFilter: (node: ProjectDataNode) => void
}

export function ProjectDataPanel({
  tree,
  expandedIds,
  selectedId,
  visibleIds,
  hasUnsaved,
  onToggleExpand,
  onSelect,
  onToggleVisible,
  onFilter,
}: ProjectDataPanelProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const closeMenu = useCallback(() => {
    setOpenMenuId(null)
  }, [])
  const toggleMenu = useCallback((id: string) => {
    setOpenMenuId((current) => (current === id ? null : id))
  }, [])

  return (
    <aside
      className="flex h-full w-80 shrink-0 flex-col"
      style={{
        background: 'var(--modus-wc-color-base-page)',
        borderRight: '1px solid var(--modus-wc-color-base-200)',
      }}
    >
      <div
        className="flex h-[76px] shrink-0 items-center justify-between py-2 pl-4 pr-2"
        style={{ borderBottom: '1px solid var(--modus-wc-color-base-200)' }}
      >
        <div className="flex min-w-0 flex-col">
          <ModusWcTypography
            hierarchy="h4"
            size="lg"
            weight="semibold"
            customClass="t-gray"
            label="Project Data"
          />
          <span className="flex items-center">
            <ModusWcTypography
              hierarchy="p"
              size="xs"
              weight="normal"
              customClass="t-gray"
              label="Everything in project"
            />
            <AssetIcon src={caretSm} size={20} />
          </span>
        </div>
        <div className="flex items-center">
          <ModusWcButton color="tertiary" variant="borderless" shape="square" size="sm" type="button" aria-label="Add">
            <AssetIcon src={addIcon} size={18} />
          </ModusWcButton>
          <ModusWcButton color="tertiary" variant="borderless" shape="square" size="sm" type="button" aria-label="Sort">
            <AssetIcon src={sortIcon} size={18} />
          </ModusWcButton>
          <ModusWcButton color="tertiary" variant="borderless" shape="square" size="sm" type="button" aria-label="Search">
            <AssetIcon src={searchIcon} size={18} />
          </ModusWcButton>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-1">
        {tree.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            expandedIds={expandedIds}
            selectedId={selectedId}
            visibleIds={visibleIds}
            hasUnsaved={hasUnsaved}
            openMenuId={openMenuId}
            onToggleExpand={onToggleExpand}
            onSelect={onSelect}
            onToggleVisible={onToggleVisible}
            onFilter={onFilter}
            onToggleMenu={toggleMenu}
            onCloseMenu={closeMenu}
          />
        ))}
      </div>
    </aside>
  )
}

function TreeNode({
  node,
  parentId,
  expandedIds,
  selectedId,
  visibleIds,
  hasUnsaved,
  openMenuId,
  onToggleExpand,
  onSelect,
  onToggleVisible,
  onFilter,
  onToggleMenu,
  onCloseMenu,
}: {
  node: ProjectDataNode
  parentId?: string
  openMenuId: string | null
  onToggleMenu: (id: string) => void
  onCloseMenu: () => void
} & Omit<ProjectDataPanelProps, 'tree'>) {
  const expanded = expandedIds.includes(node.id)
  const hasChildren = Boolean(node.children?.length)

  return (
    <div>
      {node.kind === 'folder' ? (
        <FolderRow
          node={node}
          expanded={expanded}
          onToggleExpand={() => onToggleExpand(node.id)}
        />
      ) : (
        <ItemRow
          node={node}
          selected={selectedId === node.id}
          visible={visibleIds.includes(node.id)}
          unsaved={hasUnsaved && selectedId === node.id && parentId === TERRAIN_FOLDER_ID}
          showMenu={parentId === TERRAIN_FOLDER_ID}
          menuOpen={openMenuId === node.id}
          onSelect={() => onSelect(node.id)}
          onToggleVisible={() => onToggleVisible(node.id)}
          onToggleMenu={() => onToggleMenu(node.id)}
          onCloseMenu={onCloseMenu}
          onFilter={() => onFilter(node)}
        />
      )}
      {hasChildren && expanded &&
        node.children?.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            parentId={node.id}
            expandedIds={expandedIds}
            selectedId={selectedId}
            visibleIds={visibleIds}
            hasUnsaved={hasUnsaved}
            openMenuId={openMenuId}
            onToggleExpand={onToggleExpand}
            onSelect={onSelect}
            onToggleVisible={onToggleVisible}
            onFilter={onFilter}
            onToggleMenu={onToggleMenu}
            onCloseMenu={onCloseMenu}
          />
        ))}
    </div>
  )
}

function FolderRow({
  node,
  expanded,
  onToggleExpand,
}: {
  node: ProjectDataNode
  expanded: boolean
  onToggleExpand: () => void
}) {
  return (
    <button
      type="button"
      className="tree-folder-row flex h-9 w-full items-center gap-3 text-left"
      onClick={onToggleExpand}
    >
      <span className={expanded ? 'rotate-0' : '-rotate-90'}>
        <AssetIcon src={chevronIcon} size={16} glyphWidth={10} />
      </span>
      <AssetIcon src={ICONS[node.icon]} size={16} />
      <span className="min-w-0 flex-1">
        <ModusWcTypography
          hierarchy="p"
          size="md"
          weight="normal"
          customClass="t-content"
          label={node.label}
        />
      </span>
      <AssetIcon src={moreIcon} size={16} />
    </button>
  )
}

function ItemRow({
  node,
  selected,
  visible,
  unsaved,
  showMenu,
  menuOpen,
  onSelect,
  onToggleVisible,
  onToggleMenu,
  onCloseMenu,
  onFilter,
}: {
  node: ProjectDataNode
  selected: boolean
  visible: boolean
  unsaved: boolean
  showMenu: boolean
  menuOpen: boolean
  onSelect: () => void
  onToggleVisible: () => void
  onToggleMenu: () => void
  onCloseMenu: () => void
  onFilter: () => void
}) {
  const displayLabel = unsaved ? `${node.label} *` : node.label
  const selectLabel = unsaved ? `${node.label}, unsaved changes` : undefined

  return (
    <div
      className={`relative isolate flex h-8 w-full items-center gap-3 pl-6 pr-3${menuOpen ? ' z-20' : ''}`}
    >
      {selected ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 inset-x-2 -z-10 tree-item-highlight"
        />
      ) : null}
      <ModusWcButton
        color="tertiary"
        variant="borderless"
        shape="square"
        size="sm"
        type="button"
        customClass="tree-eye-toggle size-4 shrink-0"
        aria-label={visible ? `Hide ${node.label}` : `Show ${node.label}`}
        onButtonClick={onToggleVisible}
      >
        <AssetIcon src={visible ? eyeVisibilityIcon : eyeVisibilityOffIcon} size={16} />
      </ModusWcButton>
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={onSelect}
        aria-label={selectLabel}
      >
        <ModusWcTypography
          hierarchy="p"
          size="md"
          weight="normal"
          customClass={selected ? 't-blue' : 't-content'}
          label={displayLabel}
        />
      </button>
      {showMenu ? (
        <TerrainChildKebab
          label={node.label}
          open={menuOpen}
          onToggle={onToggleMenu}
          onClose={onCloseMenu}
          onFilter={onFilter}
        />
      ) : (
        <AssetIcon src={moreIcon} size={16} />
      )}
    </div>
  )
}

function TerrainChildKebab({
  label,
  open,
  onToggle,
  onClose,
  onFilter,
}: {
  label: string
  open: boolean
  onToggle: () => void
  onClose: () => void
  onFilter: () => void
}) {
  const wrapRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (wrapRef.current?.contains(event.target as Node)) return
      onClose()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  const handleMenuFocusout = (event: CustomEvent<FocusEvent>) => {
    const next = event.detail?.relatedTarget as Node | null
    if (next && wrapRef.current?.contains(next)) return
    onClose()
  }

  return (
    <span ref={wrapRef} className="relative shrink-0">
      <ModusWcButton
        color="tertiary"
        variant="borderless"
        shape="square"
        size="sm"
        type="button"
        customClass="tree-kebab-toggle size-4 shrink-0"
        aria-label={`More options for ${label}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onButtonClick={onToggle}
      >
        <AssetIcon src={moreIcon} size={16} />
      </ModusWcButton>
      {open ? (
        <div className="tree-item-menu">
          <ModusWcMenu
            size="sm"
            orientation="vertical"
            aria-label={`Actions for ${label}`}
            onMenuFocusout={handleMenuFocusout}
          >
            {TERRAIN_CHILD_ACTIONS.map((action) => (
              <ModusWcMenuItem
                key={action.value}
                size="sm"
                label={action.label}
                value={action.value}
                onItemSelect={() => {
                  if (action.value === 'filter') onFilter()
                  onClose()
                }}
              />
            ))}
          </ModusWcMenu>
        </div>
      ) : null}
    </span>
  )
}
