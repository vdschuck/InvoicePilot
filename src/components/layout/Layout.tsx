import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DataResetControl } from './DataResetControl'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
        <Link to="/" className="text-lg font-semibold">
          InvoicePilot
        </Link>
        <DataResetControl />
      </header>
      <main className="flex flex-1 flex-col px-4 py-6 sm:px-6">{children}</main>
    </div>
  )
}
