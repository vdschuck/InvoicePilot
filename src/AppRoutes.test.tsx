import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './AppRoutes'
import type { AppData, Client, Contractor } from './types'

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

function seedAppData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function renderAt(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('route guards', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects direct access to /setup back to the home page', async () => {
    renderAt('/setup')
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'InvoicePilot' }),
      ).toBeInTheDocument(),
    )
  })

  it('redirects direct access to /clients back to the home page', async () => {
    renderAt('/clients')
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'InvoicePilot' }),
      ).toBeInTheDocument(),
    )
  })

  it('redirects direct access to /invoice back to the home page', async () => {
    renderAt('/invoice')
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'InvoicePilot' }),
      ).toBeInTheDocument(),
    )
  })

  it('redirects an unknown route back to the home page', async () => {
    renderAt('/does-not-exist')
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'InvoicePilot' }),
      ).toBeInTheDocument(),
    )
  })

  it('lets in-app navigation to Setup through with no contractor configured', () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('link', { name: 'Setup' }))
    expect(screen.getByRole('heading', { name: 'Setup' })).toBeInTheDocument()
  })

  it('redirects Create Invoice to Setup when no contractor is configured', () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('link', { name: 'Create Invoice' }))
    expect(screen.getByRole('heading', { name: 'Setup' })).toBeInTheDocument()
  })

  it('redirects Create Invoice to Clients when the contractor exists but no client is registered', () => {
    seedAppData({ contractor: makeContractor(), clients: [], invoiceSequence: 1 })
    renderAt('/')
    fireEvent.click(screen.getByRole('link', { name: 'Create Invoice' }))
    expect(screen.getByRole('heading', { name: 'Clients' })).toBeInTheDocument()
  })

  it('allows Create Invoice through when a contractor and a client exist', () => {
    seedAppData({
      contractor: makeContractor(),
      clients: [makeClient()],
      invoiceSequence: 1,
    })
    renderAt('/')
    fireEvent.click(screen.getByRole('link', { name: 'Create Invoice' }))
    expect(
      screen.getByRole('heading', { name: 'Create Invoice' }),
    ).toBeInTheDocument()
  })
})
