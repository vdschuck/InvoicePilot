import { useState } from 'react'
import { clearAppData } from '../../services/storage'
import { ConfirmDialog } from '../ui/ConfirmDialog'

export function DataResetControl() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  function handleConfirm() {
    setIsConfirmOpen(false)
    clearAppData()
    // A full reload (rather than client-side navigation) guarantees every
    // page starts clean from the now-empty storage, with no stale in-memory
    // state left over from before the reset.
    window.location.assign('/')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        className="cursor-pointer rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
      >
        Delete All Data
      </button>
      <ConfirmDialog
        open={isConfirmOpen}
        title="Delete All Data"
        message="This will permanently delete all contractor, client, and invoice sequence data. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  )
}
