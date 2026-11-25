export type DeviceKind = 'excavator' | 'compactor' | 'dozer'
export type DeviceStatus = 'active' | 'warning' | 'notreporting'
export type DeviceGroupId = 'excavators' | 'compactors' | 'dozers'
export type ActiveDesign = 'Design A' | 'Design B' | 'Design C'

export type ProjectDevice = {
  id: string
  name: string
  description: string
  groupId: DeviceGroupId
  defaultChecked: boolean
  kind: DeviceKind
  status: DeviceStatus
  lng: number
  lat: number
  activeDesign: ActiveDesign
  lastReportedAt: string
}

const DAY_MS = 24 * 60 * 60 * 1000
const TIMELINE_ORIGIN = new Date(2026, 0, 1).getTime()

function reportedAt(endDay: number): string {
  return new Date(TIMELINE_ORIGIN + endDay * DAY_MS).toISOString()
}

function designLabel(design: 'A' | 'B' | 'C'): ActiveDesign {
  if (design === 'A') return 'Design A'
  if (design === 'B') return 'Design B'
  return 'Design C'
}

export const PROJECT_DEVICES: ProjectDevice[] = [
  {
    id: 'exc-01',
    name: 'Excavator 01',
    description: '-',
    groupId: 'excavators',
    defaultChecked: true,
    kind: 'excavator',
    status: 'active',
    lng: -107.318,
    lat: 39.565,
    activeDesign: designLabel('B'),
    lastReportedAt: reportedAt(20),
  },
  {
    id: 'exc-02',
    name: 'Excavator 02',
    description: '-',
    groupId: 'excavators',
    defaultChecked: true,
    kind: 'excavator',
    status: 'warning',
    lng: -107.328,
    lat: 39.558,
    activeDesign: designLabel('B'),
    lastReportedAt: reportedAt(19),
  },
  {
    id: 'exc-03',
    name: 'Excavator 03',
    description: '-',
    groupId: 'excavators',
    defaultChecked: true,
    kind: 'excavator',
    status: 'notreporting',
    lng: -107.334,
    lat: 39.564,
    activeDesign: designLabel('C'),
    lastReportedAt: reportedAt(24),
  },
  {
    id: 'exc-05',
    name: 'Excavator 05',
    description: '-',
    groupId: 'excavators',
    defaultChecked: true,
    kind: 'excavator',
    status: 'active',
    lng: -107.322,
    lat: 39.552,
    activeDesign: designLabel('A'),
    lastReportedAt: reportedAt(16),
  },
  {
    id: 'comp-01',
    name: 'Compactor 01',
    description: '-',
    groupId: 'compactors',
    defaultChecked: false,
    kind: 'compactor',
    status: 'active',
    lng: -107.339,
    lat: 39.557,
    activeDesign: designLabel('A'),
    lastReportedAt: reportedAt(27),
  },
  {
    id: 'comp-02',
    name: 'Compactor 02',
    description: '-',
    groupId: 'compactors',
    defaultChecked: false,
    kind: 'compactor',
    status: 'warning',
    lng: -107.315,
    lat: 39.568,
    activeDesign: designLabel('B'),
    lastReportedAt: reportedAt(16.5),
  },
  {
    id: 'dozer-5000',
    name: 'Bulldozer 5000 Series',
    description: '-',
    groupId: 'dozers',
    defaultChecked: true,
    kind: 'dozer',
    status: 'active',
    lng: -107.326,
    lat: 39.549,
    activeDesign: designLabel('B'),
    lastReportedAt: reportedAt(21),
  },
  {
    id: 'dozer-6000',
    name: 'Bulldozer 6000 Series',
    description: '-',
    groupId: 'dozers',
    defaultChecked: true,
    kind: 'dozer',
    status: 'active',
    lng: -107.336,
    lat: 39.57,
    activeDesign: designLabel('A'),
    lastReportedAt: reportedAt(13),
  },
  {
    id: 'dozer-7000',
    name: 'Bulldozer 7000 Series',
    description: '-',
    groupId: 'dozers',
    defaultChecked: true,
    kind: 'dozer',
    status: 'notreporting',
    lng: -107.308,
    lat: 39.562,
    activeDesign: designLabel('A'),
    lastReportedAt: reportedAt(9),
  },
]
