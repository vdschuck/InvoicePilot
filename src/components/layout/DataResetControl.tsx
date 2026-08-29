import { clearAppData } from '../../services/storage'

export function DataResetControl() {
  function handleReset() {
    if (!window.confirm('Delete all application data? This cannot be undone.')) return
    clearAppData()
    // A full reload (rather than client-side navigation) guarantees every
    // page starts clean from the now-empty storage, with no stale in-memory
    // state left over from before the reset.
    window.location.assign('/')
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      className="text-sm font-medium text-red-600 underline"
    >
      Delete All Data
    </button>
  )
}
