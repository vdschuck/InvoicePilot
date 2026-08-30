import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 px-4 py-3 sm:px-6">
        <Link to="/" className="text-lg font-semibold">
          InvoicePilot
        </Link>
      </header>
      <main className="flex flex-1 flex-col px-4 py-6 sm:px-6">{children}</main>
      <footer className="border-t border-gray-200 px-4 py-3 text-center text-sm text-gray-500 sm:px-6">
        Powered by VDS Nexus
      </footer>
    </div>
  )
}
