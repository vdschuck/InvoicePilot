import type { AppData, Client, Contractor } from '../types'

const APP_DATA_KEY = 'invoicepilot:app-data'
export const MAX_CLIENTS = 3

function readAppDataRaw(): string | null {
  return localStorage.getItem(APP_DATA_KEY)
}

function writeAppData(appData: AppData): void {
  localStorage.setItem(APP_DATA_KEY, JSON.stringify(appData))
}

function removeAppData(): void {
  localStorage.removeItem(APP_DATA_KEY)
}

export function getAppData(): AppData | null {
  const raw = readAppDataRaw()
  if (!raw) return null

  try {
    return JSON.parse(raw) as AppData
  } catch {
    return null
  }
}

export function isAppDataCorrupted(): boolean {
  const raw = readAppDataRaw()
  if (!raw) return false

  try {
    JSON.parse(raw)
    return false
  } catch {
    return true
  }
}

export function clearAppData(): void {
  removeAppData()
}

export function saveContractor(contractor: Contractor): void {
  const existing = getAppData()

  writeAppData({
    contractor,
    clients: existing?.clients ?? [],
    invoiceSequence: existing?.invoiceSequence ?? 1,
  })
}

function requireAppData(): AppData {
  const appData = getAppData()
  if (!appData) {
    throw new Error('Cannot update application data before the contractor is configured.')
  }
  return appData
}

function saveClients(appData: AppData, clients: Client[]): Client[] {
  writeAppData({ ...appData, clients })
  return clients
}

export function addClient(input: Omit<Client, 'id'>): Client[] {
  const appData = requireAppData()

  if (appData.clients.length >= MAX_CLIENTS) {
    throw new Error(`A maximum of ${MAX_CLIENTS} clients is allowed.`)
  }

  const client: Client = { ...input, id: crypto.randomUUID() }
  return saveClients(appData, [...appData.clients, client])
}

export function updateClient(id: string, input: Omit<Client, 'id'>): Client[] {
  const appData = requireAppData()

  if (!appData.clients.some((client) => client.id === id)) {
    throw new Error(`No client found with id "${id}".`)
  }

  const clients = appData.clients.map((client) =>
    client.id === id ? { ...input, id } : client,
  )
  return saveClients(appData, clients)
}

export function deleteClient(id: string): Client[] {
  const appData = requireAppData()
  const clients = appData.clients.filter((client) => client.id !== id)
  return saveClients(appData, clients)
}

export function advanceInvoiceSequence(): number {
  const appData = requireAppData()
  const invoiceSequence = appData.invoiceSequence + 1
  writeAppData({ ...appData, invoiceSequence })
  return invoiceSequence
}

export function hasContractor(appData: AppData | null): boolean {
  return appData?.contractor != null
}

export function hasClients(appData: AppData | null): boolean {
  return (appData?.clients.length ?? 0) > 0
}
