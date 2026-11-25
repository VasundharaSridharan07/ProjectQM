import { useEffect, useState } from 'react'
import {
  ModusWcButton,
  ModusWcModal,
  ModusWcTextInput,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react'
import { isTerrainNameTaken } from '../data/projectData'

export const SAVE_TERRAIN_FILTER_MODAL_ID = 'save-terrain-filter-modal'

const DUPLICATE_MESSAGE = 'A terrain filter with this name already exists.'

type SaveTerrainFilterModalProps = {
  open: boolean
  existingNames: string[]
  onSave: (name: string) => void
  onClose: () => void
}

export function SaveTerrainFilterModal({
  open,
  existingNames,
  onSave,
  onClose,
}: SaveTerrainFilterModalProps) {
  const [name, setName] = useState('')

  useEffect(() => {
    const dialog = document.getElementById(SAVE_TERRAIN_FILTER_MODAL_ID) as HTMLDialogElement | null
    if (!dialog) return
    if (open && !dialog.open) {
      setName('')
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = document.getElementById(SAVE_TERRAIN_FILTER_MODAL_ID) as HTMLDialogElement | null
    if (!dialog) return
    const handleClose = () => {
      setName('')
      onClose()
    }
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  const trimmed = name.trim()
  const isEmpty = trimmed.length === 0
  const isDuplicate = isTerrainNameTaken(trimmed, existingNames)
  const canSave = !isEmpty && !isDuplicate

  const closeDialog = () => {
    const dialog = document.getElementById(SAVE_TERRAIN_FILTER_MODAL_ID) as HTMLDialogElement | null
    dialog?.close()
  }

  return (
    <ModusWcModal
      modalId={SAVE_TERRAIN_FILTER_MODAL_ID}
      position="center"
      showClose
      aria-label="Save as Terrain Filter"
    >
      <span slot="header">Save as Terrain Filter</span>
      <div slot="content" className="flex flex-col gap-2">
        <ModusWcTextInput
          inputId="terrain-filter-name"
          label="Terrain Filter Name"
          placeholder="Enter a name"
          size="md"
          value={name}
          feedback={isDuplicate ? { level: 'error', message: DUPLICATE_MESSAGE } : undefined}
          onInputChange={(e: CustomEvent) => {
            const next = e.detail?.target?.value || ''
            setName(next)
          }}
        />
        <ModusWcTypography
          hierarchy="p"
          size="sm"
          weight="normal"
          customClass="t-muted"
          label="Note: A new terrain filter will be saved with selected date range, machines, and data filters applied."
        />
      </div>
      <div slot="footer" className="flex justify-end gap-2">
        <ModusWcButton
          color="tertiary"
          variant="outlined"
          size="sm"
          type="button"
          onButtonClick={closeDialog}
        >
          Cancel
        </ModusWcButton>
        <ModusWcButton
          color="primary"
          variant="filled"
          size="sm"
          type="button"
          disabled={!canSave}
          onButtonClick={() => {
            if (!canSave) return
            onSave(trimmed)
            closeDialog()
          }}
        >
          Save
        </ModusWcButton>
      </div>
    </ModusWcModal>
  )
}
