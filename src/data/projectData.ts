export type ProjectDataKind = 'folder' | 'item'

export type ProjectDataNode = {
  id: string
  label: string
  kind: ProjectDataKind
  icon: 'design' | 'surface' | 'photo' | 'terrain'
  children?: ProjectDataNode[]
}

export const PROJECT_DATA_TREE: ProjectDataNode[] = [
  { id: 'designs', label: 'Designs', kind: 'folder', icon: 'design' },
  { id: 'surveyed-surfaces', label: 'Surveyed Surfaces', kind: 'folder', icon: 'surface' },
  { id: 'ortho-images', label: 'Ortho-images', kind: 'folder', icon: 'photo' },
  {
    id: '3d-terrain',
    label: '3D Terrain',
    kind: 'folder',
    icon: 'terrain',
    children: [
      { id: 'terrain-default', label: 'Terrain Default', kind: 'item', icon: 'terrain' },
      { id: 'last-month-terrain', label: 'Last Month Terrain', kind: 'item', icon: 'terrain' },
    ],
  },
]

export const DEFAULT_EXPANDED = ['3d-terrain']
export const DEFAULT_SELECTED = 'last-month-terrain'
export const DEFAULT_VISIBLE = ['terrain-default', 'last-month-terrain']
