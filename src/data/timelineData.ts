export type DesignId = 'A' | 'B' | 'C'

export type TimelineRowKind = 'group' | 'device' | 'surface' | 'ortho'

export type TimelineRow = {
  id: string
  label: string
  kind: TimelineRowKind
  parentId?: string
  icon?: 'excavator' | 'compactor' | 'dozer' | 'surface' | 'photo'
  defaultChecked: boolean
}

export type TimelineBar = {
  rowId: string
  design: DesignId
  startDay: number
  durationDays: number
}

export type TimelineMarker = {
  rowId: string
  day: number
  kind: 'surface' | 'ortho'
}

export const TIMELINE_START = new Date(2026, 0, 1)
export const TIMELINE_DAYS = 29
export const DAY_WIDTH = 50.71
export const ROW_HEIGHT = 40

export const TIMELINE_ROWS: TimelineRow[] = [
  { id: 'excavators', label: 'Excavators', kind: 'group', defaultChecked: true },
  { id: 'exc-01', label: 'Excavator 01', kind: 'device', parentId: 'excavators', icon: 'excavator', defaultChecked: true },
  { id: 'exc-02', label: 'Excavator 02', kind: 'device', parentId: 'excavators', icon: 'excavator', defaultChecked: true },
  { id: 'exc-03', label: 'Excavator 03', kind: 'device', parentId: 'excavators', icon: 'excavator', defaultChecked: true },
  { id: 'exc-04', label: 'Excavator 04', kind: 'device', parentId: 'excavators', icon: 'excavator', defaultChecked: true },
  { id: 'exc-05', label: 'Excavator 05', kind: 'device', parentId: 'excavators', icon: 'excavator', defaultChecked: true },
  { id: 'compactors', label: 'Compactors', kind: 'group', defaultChecked: false },
  { id: 'comp-01', label: 'Compactor 01', kind: 'device', parentId: 'compactors', icon: 'compactor', defaultChecked: false },
  { id: 'comp-02', label: 'Compactor 02', kind: 'device', parentId: 'compactors', icon: 'compactor', defaultChecked: false },
  { id: 'dozers', label: 'Dozers', kind: 'group', defaultChecked: true },
  { id: 'dozer-5000', label: 'Bulldozer 5000 Series', kind: 'device', parentId: 'dozers', icon: 'dozer', defaultChecked: true },
  { id: 'dozer-7000', label: 'Bulldozer 7000 Series', kind: 'device', parentId: 'dozers', icon: 'dozer', defaultChecked: true },
  { id: 'surveyed-surfaces', label: 'Surveyed Surfaces', kind: 'surface', icon: 'surface', defaultChecked: false },
  { id: 'ortho-images', label: 'Ortho Images', kind: 'ortho', icon: 'photo', defaultChecked: true },
]

export const TIMELINE_BARS: TimelineBar[] = [
  { rowId: 'exc-01', design: 'A', startDay: 0, durationDays: 6 },
  { rowId: 'exc-01', design: 'B', startDay: 6, durationDays: 14 },
  { rowId: 'exc-02', design: 'A', startDay: 2, durationDays: 8 },
  { rowId: 'exc-02', design: 'B', startDay: 11, durationDays: 8 },
  { rowId: 'exc-03', design: 'A', startDay: 5, durationDays: 7 },
  { rowId: 'exc-03', design: 'C', startDay: 17, durationDays: 7 },
  { rowId: 'exc-04', design: 'A', startDay: 3, durationDays: 6 },
  { rowId: 'exc-05', design: 'A', startDay: 9, durationDays: 7 },
  { rowId: 'comp-01', design: 'A', startDay: 7, durationDays: 20 },
  { rowId: 'comp-02', design: 'A', startDay: 0, durationDays: 6 },
  { rowId: 'comp-02', design: 'B', startDay: 8.5, durationDays: 8 },
  { rowId: 'dozer-5000', design: 'A', startDay: 0, durationDays: 13 },
  { rowId: 'dozer-5000', design: 'B', startDay: 13, durationDays: 8 },
  { rowId: 'dozer-7000', design: 'A', startDay: 3, durationDays: 6 },
]

export const TIMELINE_MARKERS: TimelineMarker[] = [
  { rowId: 'surveyed-surfaces', day: 3, kind: 'surface' },
  { rowId: 'surveyed-surfaces', day: 5, kind: 'surface' },
  { rowId: 'surveyed-surfaces', day: 8.7, kind: 'surface' },
  { rowId: 'surveyed-surfaces', day: 12.8, kind: 'surface' },
  { rowId: 'ortho-images', day: 2, kind: 'ortho' },
  { rowId: 'ortho-images', day: 6.5, kind: 'ortho' },
  { rowId: 'ortho-images', day: 10.2, kind: 'ortho' },
  { rowId: 'ortho-images', day: 20.7, kind: 'ortho' },
]

export function defaultCheckedMap(): Record<string, boolean> {
  return Object.fromEntries(TIMELINE_ROWS.map((row) => [row.id, row.defaultChecked]))
}

export function isRowActive(row: TimelineRow, checked: Record<string, boolean>): boolean {
  if (!checked[row.id]) return false
  if (row.parentId && !checked[row.parentId]) return false
  return true
}
