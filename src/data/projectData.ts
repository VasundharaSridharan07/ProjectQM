export type ProjectDataKind = 'folder' | 'item'

export type ProjectDataNode = {
  id: string
  label: string
  kind: ProjectDataKind
  icon: 'design' | 'surface' | 'photo' | 'terrain'
  children?: ProjectDataNode[]
}

export type UserTerrainFilter = {
  id: string
  label: string
  checked: Record<string, boolean>
}

export const TERRAIN_FOLDER_ID = '3d-terrain'
export const TERRAIN_DEFAULT_ID = 'terrain-default'
export const LAST_MONTH_TERRAIN_ID = 'last-month-terrain'
export const TERRAIN_DEFAULT_LABEL = 'Terrain Default'
export const LAST_MONTH_TERRAIN_LABEL = 'Last Month Terrain'

export const PROJECT_DATA_TREE: ProjectDataNode[] = [
  { id: 'designs', label: 'Designs', kind: 'folder', icon: 'design' },
  { id: 'surveyed-surfaces', label: 'Surveyed Surfaces', kind: 'folder', icon: 'surface' },
  { id: 'ortho-images', label: 'Ortho-images', kind: 'folder', icon: 'photo' },
  {
    id: TERRAIN_FOLDER_ID,
    label: '3D Terrain',
    kind: 'folder',
    icon: 'terrain',
    children: [
      { id: TERRAIN_DEFAULT_ID, label: TERRAIN_DEFAULT_LABEL, kind: 'item', icon: 'terrain' },
      { id: LAST_MONTH_TERRAIN_ID, label: LAST_MONTH_TERRAIN_LABEL, kind: 'item', icon: 'terrain' },
    ],
  },
]

export const DEFAULT_EXPANDED = [TERRAIN_FOLDER_ID]
export const DEFAULT_SELECTED = LAST_MONTH_TERRAIN_ID
export const DEFAULT_VISIBLE = [LAST_MONTH_TERRAIN_ID]

export function mergeTerrainTree(userFilters: UserTerrainFilter[]): ProjectDataNode[] {
  return PROJECT_DATA_TREE.map((node) => {
    if (node.id !== TERRAIN_FOLDER_ID) return node
    return {
      ...node,
      children: [
        ...(node.children ?? []),
        ...userFilters.map((filter) => ({
          id: filter.id,
          label: filter.label,
          kind: 'item' as const,
          icon: 'terrain' as const,
        })),
      ],
    }
  })
}

export function reservedTerrainNames(userFilters: UserTerrainFilter[]): string[] {
  return [TERRAIN_DEFAULT_LABEL, LAST_MONTH_TERRAIN_LABEL, ...userFilters.map((filter) => filter.label)]
}

export function isTerrainNameTaken(name: string, existingNames: string[]): boolean {
  const needle = name.trim().toLowerCase()
  if (!needle) return false
  return existingNames.some((label) => label.trim().toLowerCase() === needle)
}
