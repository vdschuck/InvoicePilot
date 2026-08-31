import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getAppData, hasContractor } from '../services/storage'

export function RequireContractor({ children }: { children: ReactNode }) {
  if (!hasContractor(getAppData())) {
    return <Navigate to="/contractor" replace />
  }

  return children
}
