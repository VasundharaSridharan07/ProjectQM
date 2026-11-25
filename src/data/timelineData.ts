import { PROJECT_DEVICES, type DeviceGroupId } from './devices'

export type DesignId = 'A' | 'B' | 'C'

export const DESIGN_IDS: DesignId[] = ['A', 'B', 'C']

export function designKey(id: DesignId): string {
  return `design-${id}`
}

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
export const HEADER_HEIGHT = 32

const GROUP_LABEL: Record<DeviceGroupId, string> = {
  excavators: 'Excavators',
  compactors: 'Compactors',
  dozers: 'Dozers',
}

const GROUP_DEFAULT_CHECKED: Record<DeviceGroupId, boolean> = {
  excavators: true,
  compactors: false,
  dozers: true,
}

function deviceGroupIds(): DeviceGroupId[] {
  const ids: DeviceGroupId[] = []
  for (const device of PROJECT_DEVICES) {
    if (!ids.includes(device.groupId)) ids.push(device.groupId)
  }
  return ids
}

export const TIMELINE_ROWS: TimelineRow[] = [
  ...deviceGroupIds().flatMap((groupId): TimelineRow[] => [
    {
      id: groupId,
      label: GROUP_LABEL[groupId],
      kind: 'group',
      defaultChecked: GROUP_DEFAULT_CHECKED[groupId],
    },
    ...PROJECT_DEVICES.filter((device) => device.groupId === groupId).map(
      (device): TimelineRow => ({
        id: device.id,
        label: device.name,
        kind: 'device',
        parentId: device.groupId,
        icon: device.kind,
        defaultChecked: device.defaultChecked,
      }),
    ),
  ]),
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
  { rowId: 'exc-05', design: 'A', startDay: 9, durationDays: 7 },
  { rowId: 'comp-01', design: 'A', startDay: 7, durationDays: 20 },
  { rowId: 'comp-02', design: 'A', startDay: 0, durationDays: 6 },
  { rowId: 'comp-02', design: 'B', startDay: 8.5, durationDays: 8 },
  { rowId: 'dozer-5000', design: 'A', startDay: 0, durationDays: 13 },
  { rowId: 'dozer-5000', design: 'B', startDay: 13, durationDays: 8 },
  { rowId: 'dozer-6000', design: 'A', startDay: 4, durationDays: 9 },
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

export type CheckState = 'all' | 'none' | 'mixed'

export function isMachineRow(row: TimelineRow): boolean {
  return row.kind === 'group' || row.kind === 'device'
}

export const MACHINE_ROWS = TIMELINE_ROWS.filter(isMachineRow)

export function machineRowIds(): string[] {
  return MACHINE_ROWS.map((row) => row.id)
}

export function childDeviceIds(parentId: string): string[] {
  return TIMELINE_ROWS.filter((row) => row.parentId === parentId).map((row) => row.id)
}

export function checkStateForIds(
  ids: string[],
  checked: Record<string, boolean>,
): CheckState {
  if (ids.length === 0) return 'none'
  const onCount = ids.filter((id) => checked[id]).length
  if (onCount === ids.length) return 'all'
  if (onCount === 0) return 'none'
  return 'mixed'
}

export function machineCheckState(checked: Record<string, boolean>): CheckState {
  return checkStateForIds(machineRowIds(), checked)
}

export function groupCheckState(
  parentId: string,
  checked: Record<string, boolean>,
): CheckState {
  return checkStateForIds(childDeviceIds(parentId), checked)
}

export function setMachineRows(
  checked: Record<string, boolean>,
  value: boolean,
): Record<string, boolean> {
  const next = { ...checked }
  for (const row of MACHINE_ROWS) {
    next[row.id] = value
  }
  return next
}

export function designIds(): string[] {
  return DESIGN_IDS.map((id) => designKey(id))
}

export function designCheckState(checked: Record<string, boolean>): CheckState {
  const ids = designIds()
  if (ids.length === 0) return 'none'
  const onCount = ids.filter((id) => checked[id] !== false).length
  if (onCount === ids.length) return 'all'
  if (onCount === 0) return 'none'
  return 'mixed'
}

export function setDesignRows(
  checked: Record<string, boolean>,
  value: boolean,
): Record<string, boolean> {
  const next = { ...checked }
  for (const id of DESIGN_IDS) {
    next[designKey(id)] = value
  }
  return next
}

export function isDesignChecked(
  checked: Record<string, boolean>,
  design: DesignId,
): boolean {
  return checked[designKey(design)] !== false
}

function designCheckedEntries(value: boolean): Array<[string, boolean]> {
  return DESIGN_IDS.map((id) => [designKey(id), value])
}

export function defaultCheckedMap(): Record<string, boolean> {
  return Object.fromEntries([
    ...TIMELINE_ROWS.map((row) => [row.id, row.defaultChecked] as [string, boolean]),
    ...designCheckedEntries(true),
  ])
}

export function allCheckedMap(): Record<string, boolean> {
  return Object.fromEntries([
    ...TIMELINE_ROWS.map((row) => [row.id, true] as [string, boolean]),
    ...designCheckedEntries(true),
  ])
}

export function checkedMapForTerrain(terrainId: string): Record<string, boolean> {
  return terrainId === 'terrain-default' ? allCheckedMap() : defaultCheckedMap()
}

export function isRowActive(row: TimelineRow, checked: Record<string, boolean>): boolean {
  if (!checked[row.id]) return false
  if (row.parentId && !checked[row.parentId]) return false
  return true
}

export function checkedMapsEqual(
  a: Record<string, boolean>,
  b: Record<string, boolean>,
): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    if (Boolean(a[key]) !== Boolean(b[key])) return false
  }
  return true
}
