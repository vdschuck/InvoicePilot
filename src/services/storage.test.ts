import type { AppData, Client, Contractor } from '../types'
import {
  addClient,
  advanceInvoiceSequence,
  clearAppData,
  deleteClient,
  getAppData,
  hasClients,
  hasContractor,
  isAppDataCorrupted,
  MAX_CLIENTS,
  saveContractor,
  updateClient,
} from './storage'

const STORAGE_KEY = 'invoicepilot:app-data'

function makeContractor(): Contractor {
  return {
    name: 'Ada Lovelace',
    companyName: '',
    streetAddress: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    contactNumber: '',
  }
}

function makeClientInput(): Omit<Client, 'id'> {
  return {
    name: 'Client',
    companyName: '',
    streetAddress: '',
    city: '',
    state: '',
    country: '',
    contactNumber: '',
    currency: 'USD',
  }
}

function makeClient(): Client {
  return { ...makeClientInput(), id: '1' }
}

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getAppData', () => {
    it('returns null when nothing is stored', () => {
      expect(getAppData()).toBeNull()
    })

    it('returns null when the stored value is not valid JSON', () => {
      localStorage.setItem(STORAGE_KEY, '{not json')
      expect(getAppData()).toBeNull()
    })

    it('parses valid stored app data', () => {
      const data: AppData = {
        contractor: makeContractor(),
        clients: [makeClient()],
        invoiceSequence: 3,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      expect(getAppData()).toEqual(data)
    })
  })

  describe('saveContractor', () => {
    it('creates app data with default clients and sequence when none exists', () => {
      const contractor = makeContractor()
      saveContractor(contractor)

      expect(getAppData()).toEqual({
        contractor,
        clients: [],
        invoiceSequence: 1,
      })
    })

    it('preserves existing clients and sequence when updating the contractor', () => {
      const existing: AppData = {
        contractor: makeContractor(),
        clients: [makeClient()],
        invoiceSequence: 4,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))

      const updatedContractor = { ...makeContractor(), name: 'Grace Hopper' }
      saveContractor(updatedContractor)

      expect(getAppData()).toEqual({
        contractor: updatedContractor,
        clients: existing.clients,
        invoiceSequence: existing.invoiceSequence,
      })
    })
  })

  describe('addClient', () => {
    beforeEach(() => {
      saveContractor(makeContractor())
    })

    it('throws when the contractor is not configured', () => {
      localStorage.clear()
      expect(() => addClient(makeClient())).toThrow(/contractor/i)
    })

    it('adds a client with a generated id', () => {
      const input = makeClientInput()
      const clients = addClient(input)

      expect(clients).toHaveLength(1)
      expect(clients[0]).toMatchObject(input)
      expect(clients[0].id).toEqual(expect.any(String))
      expect(clients[0].id).not.toBe('')
    })

    it('persists the added client', () => {
      const input = makeClientInput()
      addClient(input)

      expect(getAppData()?.clients).toHaveLength(1)
    })

    it('refuses to add a client beyond the maximum', () => {
      const input = makeClientInput()
      for (let i = 0; i < MAX_CLIENTS; i += 1) {
        addClient(input)
      }

      expect(() => addClient(input)).toThrow(/maximum/i)
      expect(getAppData()?.clients).toHaveLength(MAX_CLIENTS)
    })
  })

  describe('updateClient', () => {
    beforeEach(() => {
      saveContractor(makeContractor())
    })

    it('updates the matching client and preserves its id', () => {
      const input = makeClientInput()
      const [added] = addClient(input)

      const updated = updateClient(added.id, { ...input, name: 'Updated Name' })

      expect(updated).toHaveLength(1)
      expect(updated[0]).toEqual({ ...input, name: 'Updated Name', id: added.id })
    })

    it('throws when no client matches the id', () => {
      const input = makeClientInput()
      expect(() => updateClient('missing-id', input)).toThrow(/no client/i)
    })
  })

  describe('deleteClient', () => {
    beforeEach(() => {
      saveContractor(makeContractor())
    })

    it('removes the matching client', () => {
      const input = makeClientInput()
      const [added] = addClient(input)

      const clients = deleteClient(added.id)

      expect(clients).toHaveLength(0)
      expect(getAppData()?.clients).toHaveLength(0)
    })

    it('is a no-op when the id does not match any client', () => {
      const input = makeClientInput()
      addClient(input)

      const clients = deleteClient('missing-id')

      expect(clients).toHaveLength(1)
    })
  })

  describe('advanceInvoiceSequence', () => {
    beforeEach(() => {
      saveContractor(makeContractor())
    })

    it('throws when the contractor is not configured', () => {
      localStorage.clear()
      expect(() => advanceInvoiceSequence()).toThrow(/contractor/i)
    })

    it('increments the sequence by 1 and returns the new value', () => {
      const next = advanceInvoiceSequence()
      expect(next).toBe(2)
      expect(getAppData()?.invoiceSequence).toBe(2)
    })

    it('increments repeatedly on successive calls', () => {
      advanceInvoiceSequence()
      advanceInvoiceSequence()
      const next = advanceInvoiceSequence()
      expect(next).toBe(4)
      expect(getAppData()?.invoiceSequence).toBe(4)
    })

    it('preserves the contractor and clients', () => {
      const input = makeClientInput()
      addClient(input)

      advanceInvoiceSequence()

      const appData = getAppData()
      expect(appData?.contractor).toEqual(makeContractor())
      expect(appData?.clients).toHaveLength(1)
    })
  })

  describe('isAppDataCorrupted', () => {
    it('is false when nothing is stored', () => {
      expect(isAppDataCorrupted()).toBe(false)
    })

    it('is false when valid app data is stored', () => {
      saveContractor(makeContractor())
      expect(isAppDataCorrupted()).toBe(false)
    })

    it('is true when the stored value is not valid JSON', () => {
      localStorage.setItem(STORAGE_KEY, '{not json')
      expect(isAppDataCorrupted()).toBe(true)
    })
  })

  describe('clearAppData', () => {
    it('removes the stored app data', () => {
      saveContractor(makeContractor())
      expect(getAppData()).not.toBeNull()

      clearAppData()

      expect(getAppData()).toBeNull()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('clears corrupted data too', () => {
      localStorage.setItem(STORAGE_KEY, '{not json')
      clearAppData()
      expect(isAppDataCorrupted()).toBe(false)
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('is a no-op when there is nothing to clear', () => {
      expect(() => clearAppData()).not.toThrow()
    })
  })

  describe('hasContractor', () => {
    it('is false when there is no app data', () => {
      expect(hasContractor(null)).toBe(false)
    })

    it('is true when a contractor is present', () => {
      expect(
        hasContractor({ contractor: makeContractor(), clients: [], invoiceSequence: 1 }),
      ).toBe(true)
    })
  })

  describe('hasClients', () => {
    it('is false for an empty client list', () => {
      expect(
        hasClients({ contractor: makeContractor(), clients: [], invoiceSequence: 1 }),
      ).toBe(false)
    })

    it('is true when at least one client exists', () => {
      expect(
        hasClients({
          contractor: makeContractor(),
          clients: [makeClient()],
          invoiceSequence: 1,
        }),
      ).toBe(true)
    })
  })
})
