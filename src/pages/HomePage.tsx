import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-3xl font-semibold">InvoicePilot</h1>
      <p className="text-gray-600">
        Register your details and create professional invoices in your
        browser.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/setup"
          className="rounded-md border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
        >
          Setup
        </Link>
        <Link
          to="/invoice"
          className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
        >
          Create Invoice
        </Link>
      </div>
    </div>
  )
}
