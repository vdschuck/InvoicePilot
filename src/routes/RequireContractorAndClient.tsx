import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getAppData, hasClients, hasContractor } from '../services/storage'

export function RequireContractorAndClient({ children }: { children: ReactNode }) {
  const appData = getAppData()

  if (!hasContractor(appData)) {
    return <Navigate to="/setup" replace />
  }

  if (!hasClients(appData)) {
    return <Navigate to="/clients" replace />
  }

  return children
}
