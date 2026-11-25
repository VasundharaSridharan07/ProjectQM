import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  ModusWcBreadcrumbs,
  ModusWcButton,
  ModusWcIcon,
  ModusWcTable,
  ModusWcTextInput,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'
import type { ITableColumn } from '@trimble-oss/moduswebcomponents'
import { AssetIcon } from './AssetIcon'
import compactorIcon from '../assets/compactor.svg'
import dozerIcon from '../assets/dozer.svg'
import excavatorIcon from '../assets/excavator.svg'
import {
  PROJECT_DEVICES,
  type DeviceKind,
  type DeviceStatus,
  type ProjectDevice,
} from '../data/devices'

const KIND_GLYPH: Record<DeviceKind, string> = {
  excavator: excavatorIcon,
  compactor: compactorIcon,
  dozer: dozerIcon,
}

const REMOTE_LABEL: Record<DeviceStatus, string> = {
  active: 'Remote active',
  warning: 'Remote warning',
  notreporting: 'Remote not reporting',
}

const LAST_REPORTED = 'lastReported'

type ColumnSort = { id: string; desc: boolean }

type DevicesTableElement = HTMLElement & {
  sorting: ColumnSort[]
  table: { setSorting: (sorting: ColumnSort[]) => void } | null
}

type DevicesPageProps = {
  projectName: string
}

function formatLastReported(iso: string): string {
  const date = new Date(iso)
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(hasTime ? { hour: '2-digit' as const, minute: '2-digit' as const, hourCycle: 'h23' as const } : {}),
  }).format(date)
}

function asDevice(row: unknown): ProjectDevice | null {
  if (!row || typeof row !== 'object') return null
  const candidate = row as ProjectDevice
  if (
    candidate.kind !== 'excavator' &&
    candidate.kind !== 'compactor' &&
    candidate.kind !== 'dozer'
  ) {
    return null
  }
  return candidate
}

function kindGlyph(kind: DeviceKind): HTMLElement {
  const source = document.querySelector<HTMLImageElement>(
    `.devices-kind-sources [data-kind="${kind}"] img`,
  )
  const image = (source?.cloneNode(true) as HTMLImageElement | undefined) ?? document.createElement('img')
  if (!source) {
    image.src = KIND_GLYPH[kind]
    image.width = 24
    image.height = 24
  }
  image.alt = ''
  image.className = 'devices-kind-icon'
  return image
}

function remoteIcon(status: DeviceStatus): HTMLElement {
  const icon = document.createElement('modus-wc-icon') as HTMLElement & {
    name: string
    decorative: boolean
    size: string
    variant: 'outlined' | 'solid'
    ariaLabel: string
  }
  icon.name = 'signal'
  icon.decorative = false
  icon.size = 'sm'
  icon.variant = 'outlined'
  icon.ariaLabel = REMOTE_LABEL[status]
  icon.className = `devices-remote devices-remote-${status}`
  return icon
}

function setReportedSort(element: DevicesTableElement | null, desc: boolean) {
  if (!element?.table) return
  const sorting = [{ id: LAST_REPORTED, desc }]
  element.sorting = sorting
  element.table.setSorting(sorting)
}

const COLUMNS: ITableColumn[] = [
  {
    id: 'kind',
    header: '',
    accessor: 'kind',
    width: '60px',
    sortable: false,
    className: 'devices-col-icon',
    cellRenderer: (_value, row) => {
      const device = asDevice(row)
      return device ? kindGlyph(device.kind) : ''
    },
  },
  {
    id: 'name',
    header: 'Device Name',
    accessor: 'name',
    sortable: false,
  },
  {
    id: 'description',
    header: 'Description',
    accessor: 'description',
    sortable: false,
  },
  {
    id: 'activeDesign',
    header: 'Active Design',
    accessor: 'activeDesign',
    sortable: false,
  },
  {
    id: LAST_REPORTED,
    header: 'Last Reported',
    accessor: 'lastReportedAt',
    sortable: true,
    cellRenderer: (value) => formatLastReported(typeof value === 'string' ? value : ''),
  },
  {
    id: 'remote',
    header: 'Remote',
    accessor: 'status',
    width: '86px',
    sortable: false,
    className: 'devices-col-remote',
    cellRenderer: (_value, row) => {
      const device = asDevice(row)
      return device ? remoteIcon(device.status) : ''
    },
  },
]

export function DevicesPage({ projectName }: DevicesPageProps) {
  const tableRef = useRef<DevicesTableElement | null>(null)
  const [query, setQuery] = useState('')
  const [searchReady, setSearchReady] = useState(false)

  const crumbs = useMemo(
    () => [
      { label: 'Projects', url: '#' },
      { label: projectName, url: '#' },
      { label: 'Devices' },
    ],
    [projectName],
  )

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matched = PROJECT_DEVICES.filter((device) => {
      if (!needle) return true
      return [device.name, device.description, device.activeDesign].some((field) =>
        field.toLowerCase().includes(needle),
      )
    })
    return [...matched].sort((a, b) => (a.lastReportedAt < b.lastReportedAt ? 1 : -1))
  }, [query])

  useLayoutEffect(() => {
    setSearchReady(true)
  }, [])

  useLayoutEffect(() => {
    let frame = 0
    let tries = 0
    const apply = () => {
      if (tableRef.current?.table) {
        setReportedSort(tableRef.current, true)
        return
      }
      if (tries < 10) {
        tries += 1
        frame = requestAnimationFrame(apply)
      }
    }
    apply()
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <section className="devices-page" aria-label="Devices">
      <div
        className="devices-breadcrumbs"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a')) event.preventDefault()
        }}
      >
        <ModusWcBreadcrumbs
          aria-label="Breadcrumb"
          size="sm"
          items={crumbs}
          onBreadcrumbClick={() => undefined}
        />
      </div>
      <div className="devices-title-row">
        <ModusWcTypography
          hierarchy="h1"
          size="3xl"
          weight="normal"
          label="DEVICES"
          customClass="devices-title"
        />
        <ModusWcTextInput
          aria-label="Search for a device"
          bordered={false}
          customClass={searchReady ? 'devices-search' : 'devices-search devices-search-pending'}
          placeholder="Search for a device"
          size="sm"
          value={query}
          onInputChange={(event: CustomEvent) => {
            setQuery(event.detail?.target?.value || '')
          }}
        >
          <ModusWcIcon slot="custom-icon" decorative name="search" size="sm" />
        </ModusWcTextInput>
        <div className="devices-toolbar">
          <ModusWcButton
            aria-label="Filter"
            color="tertiary"
            shape="square"
            size="sm"
            type="button"
            variant="borderless"
          >
            <ModusWcIcon decorative name="filter" size="xs" />
          </ModusWcButton>
          <ModusWcButton
            aria-label="Column layout"
            color="tertiary"
            shape="square"
            size="sm"
            type="button"
            variant="borderless"
          >
            <ModusWcIcon decorative name="columns" size="xs" />
          </ModusWcButton>
          <ModusWcButton
            aria-label="Upload"
            color="tertiary"
            shape="square"
            size="sm"
            type="button"
            variant="borderless"
          >
            <ModusWcIcon decorative name="upload" size="xs" />
          </ModusWcButton>
          <ModusWcButton color="primary" size="sm" type="button" variant="filled">
            <ModusWcIcon decorative name="add" size="xs" />
            Add
          </ModusWcButton>
        </div>
      </div>
      <div className="devices-kind-sources" hidden aria-hidden="true">
        <span data-kind="excavator">
          <AssetIcon src={excavatorIcon} size={24} alt="" />
        </span>
        <span data-kind="compactor">
          <AssetIcon src={compactorIcon} size={24} alt="" />
        </span>
        <span data-kind="dozer">
          <AssetIcon src={dozerIcon} size={24} alt="" />
        </span>
      </div>
      <ModusWcTable
        ref={(element) => {
          tableRef.current = element as DevicesTableElement | null
        }}
        caption="Devices"
        columns={COLUMNS}
        customClass="devices-table"
        data={rows}
        sortable
        zebra={false}
        onSortChange={(event: CustomEvent<ColumnSort[]>) => {
          const reported = (event.detail ?? []).find((item) => item.id === LAST_REPORTED)
          if (reported) return
          setReportedSort(tableRef.current, false)
        }}
      />
    </section>
  )
}
