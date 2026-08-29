import { DataResetControl } from './DataResetControl'

export function CorruptedDataNotice() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">InvoicePilot</p>
      <h1 className="text-xl font-semibold">We couldn't read your saved data</h1>
      <p className="max-w-md text-gray-600">
        Your stored data appears to be corrupted and can&apos;t be loaded. Use the
        control below to delete it and start fresh.
      </p>
      <DataResetControl />
    </div>
  )
}
