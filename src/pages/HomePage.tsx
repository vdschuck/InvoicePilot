import { Link } from 'react-router-dom'
import { DataResetControl } from '../components/layout/DataResetControl'
import { getAppData, hasClients } from '../services/storage'

export function HomePage() {
  const isClientConfigured = hasClients(getAppData())

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-5xl tracking-wide">Invoice Pilot</h1>
      <div>
        <p className="text-lg text-gray-600">
          Welcome! Register your details and create professional invoices in
          your browser.
        </p>
        <p className="text-base text-gray-500">
          Enable "On-device site data" in your browser settings to keep your
          data saved between visits.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/setup"
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Setup Data
        </Link>
        {isClientConfigured ? (
          <Link
            to="/invoice"
            className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
          >
            Create Invoice
          </Link>
        ) : (
          <button
            type="button"
            disabled
            title="Complete Setup and add a client before creating an invoice."
            className="cursor-not-allowed rounded-md bg-gray-300 px-4 py-2 font-medium text-gray-500"
          >
            Create Invoice
          </button>
        )}
      </div>
      <DataResetControl />
    </div>
  )
}
