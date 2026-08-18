import {
  ModusWcButton,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'
import { AssetIcon } from './AssetIcon'
import { PROJECT_DATA_TREE, type ProjectDataNode } from '../data/projectData'
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
import eyeIcon from '../assets/eye.svg'
import eyeSelectedIcon from '../assets/eye-selected.svg'

const ICONS = {
  design: designIcon,
  surface: surfaceIcon,
  photo: photoIcon,
  terrain: terrainIcon,
}

type ProjectDataPanelProps = {
  expandedIds: string[]
  selectedId: string
  visibleIds: string[]
  onToggleExpand: (id: string) => void
  onSelect: (id: string) => void
  onToggleVisible: (id: string) => void
}

export function ProjectDataPanel({
  expandedIds,
  selectedId,
  visibleIds,
  onToggleExpand,
  onSelect,
  onToggleVisible,
}: ProjectDataPanelProps) {
  return (
    <aside
      className="flex h-full w-80 shrink-0 flex-col"
      style={{
        background: 'var(--modus-wc-color-base-100)',
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
        {PROJECT_DATA_TREE.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            expandedIds={expandedIds}
            selectedId={selectedId}
            visibleIds={visibleIds}
            onToggleExpand={onToggleExpand}
            onSelect={onSelect}
            onToggleVisible={onToggleVisible}
          />
        ))}
      </div>
    </aside>
  )
}

function TreeNode({
  node,
  expandedIds,
  selectedId,
  visibleIds,
  onToggleExpand,
  onSelect,
  onToggleVisible,
}: {
  node: ProjectDataNode
} & Omit<ProjectDataPanelProps, never>) {
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
          onSelect={() => onSelect(node.id)}
          onToggleVisible={() => onToggleVisible(node.id)}
        />
      )}
      {hasChildren && expanded &&
        node.children?.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            expandedIds={expandedIds}
            selectedId={selectedId}
            visibleIds={visibleIds}
            onToggleExpand={onToggleExpand}
            onSelect={onSelect}
            onToggleVisible={onToggleVisible}
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
      className="flex h-9 w-full items-center gap-3 px-3 text-left"
      onClick={onToggleExpand}
    >
      <span className={expanded ? 'rotate-0' : '-rotate-90'}>
        <AssetIcon src={chevronIcon} size={16} />
      </span>
      <AssetIcon src={ICONS[node.icon]} size={16} />
      <span className="min-w-0 flex-1">
        <ModusWcTypography
          hierarchy="p"
          size="xs"
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
  onSelect,
  onToggleVisible,
}: {
  node: ProjectDataNode
  selected: boolean
  visible: boolean
  onSelect: () => void
  onToggleVisible: () => void
}) {
  return (
    <div
      className="flex h-8 w-full items-center pl-4 pr-2"
      style={
        selected
          ? {
              background: 'var(--modus-wc-color-blue-pale)',
              color: 'var(--modus-wc-color-trimble-blue)',
              borderRadius: '8px',
              margin: '0 8px',
              width: 'calc(100% - 16px)',
            }
          : undefined
      }
    >
      <ModusWcButton
        color="tertiary"
        variant="borderless"
        shape="square"
        size="sm"
        type="button"
        aria-label={visible ? `Hide ${node.label}` : `Show ${node.label}`}
        onButtonClick={onToggleVisible}
      >
        <AssetIcon src={selected ? eyeSelectedIcon : eyeIcon} size={14} />
      </ModusWcButton>
      <button type="button" className="min-w-0 flex-1 text-left" onClick={onSelect}>
        <ModusWcTypography
          hierarchy="p"
          size="xs"
          weight="normal"
          customClass={selected ? 't-blue' : 't-content'}
          label={node.label}
        />
      </button>
      {selected && <AssetIcon src={moreIcon} size={16} />}
    </div>
  )
}
