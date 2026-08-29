import type { AppData, Contractor } from '../types'

const APP_DATA_KEY = 'invoicepilot:app-data'

export function getAppData(): AppData | null {
  const raw = localStorage.getItem(APP_DATA_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AppData
  } catch {
    return null
  }
}

export function saveContractor(contractor: Contractor): void {
  const existing = getAppData()

  const appData: AppData = {
    contractor,
    clients: existing?.clients ?? [],
    invoiceSequence: existing?.invoiceSequence ?? 1,
  }

  localStorage.setItem(APP_DATA_KEY, JSON.stringify(appData))
}

export function hasContractor(appData: AppData | null): boolean {
  return appData?.contractor != null
}

export function hasClients(appData: AppData | null): boolean {
  return (appData?.clients.length ?? 0) > 0
}
