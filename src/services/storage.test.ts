import type { AppData, Client, Contractor } from '../types'
import { getAppData, hasClients, hasContractor } from './storage'

const STORAGE_KEY = 'invoicepilot:app-data'

function makeContractor(): Contractor {
  return {
    name: 'Ada Lovelace',
    companyName: '',
    streetAddress: '',
    city: '',
    state: '',
    country: '',
    contactNumber: '',
  }
}

function makeClient(): Client {
  return {
    id: '1',
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
