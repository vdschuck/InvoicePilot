import { useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

/**
 * Only in-app navigation may reach any route other than "/". A fresh page
 * load (typed URL, refresh, bookmark) always mounts this component with the
 * requested path already current, so the initial pathname is captured once
 * and compared on every render. A declarative <Navigate> is used (rather
 * than calling the imperative navigate() from an effect) because a redirect
 * issued from an effect on the very first mount is unreliable: it races
 * with the router's own initialization and can be silently dropped. The
 * guarded route tree is withheld until the redirect has actually taken
 * effect — rendering it early would let a route's own guard (e.g.
 * RequireContractor) fire its own redirect first and leak past this one.
 */
export function EntryGuard({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [initialPath] = useState(() => location.pathname)

  const isDirectAccessToOtherRoute =
    initialPath !== '/' && location.pathname !== '/'

  if (isDirectAccessToOtherRoute) {
    return <Navigate to="/" replace />
  }

  return children
}
