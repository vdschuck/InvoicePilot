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

describe('data reset', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the home page normally when there is no stored data', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'InvoicePilot' })).toBeInTheDocument()
    expect(screen.queryByText("We couldn't read your saved data")).not.toBeInTheDocument()
  })

  it('shows a corrupted-data notice instead of the app when stored data cannot be parsed', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json')

    renderAt('/')

    expect(screen.getByText("We couldn't read your saved data")).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Setup' })).not.toBeInTheDocument()
  })

  it('shows the corrupted-data notice regardless of which route was requested', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json')

    renderAt('/invoice')

    expect(screen.getByText("We couldn't read your saved data")).toBeInTheDocument()
  })

  it('the corrupted-data notice offers the same Delete All Data control', () => {
    window.confirm = jest.fn().mockReturnValue(true)
    localStorage.setItem(STORAGE_KEY, '{not valid json')

    renderAt('/')
    fireEvent.click(screen.getByRole('button', { name: 'Delete All Data' }))

    expect(window.confirm).toHaveBeenCalled()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('offers Delete All Data from the header on a normal page too', () => {
    renderAt('/')
    expect(screen.getByRole('button', { name: 'Delete All Data' })).toBeInTheDocument()
  })
})
