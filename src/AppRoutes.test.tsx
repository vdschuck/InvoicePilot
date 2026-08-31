import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './AppRoutes'
import type { AppData, Client, Contractor } from './types'

const STORAGE_KEY = 'invoicepilot:app-data'

function makeContractor(): Contractor {
  return {
    name: 'Ada Lovelace',
    companyName: '',
    addressLine1: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    contactNumber: '',
  }
}

function makeClient(): Client {
  return {
    id: '1',
    companyName: 'Client',
    addressLine1: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
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

  it('redirects direct access to /contractor back to the home page', async () => {
    renderAt('/contractor')
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'INVOICE PILOT' }),
      ).toBeInTheDocument(),
    )
  })

  it('redirects direct access to /clients back to the home page', async () => {
    renderAt('/clients')
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'INVOICE PILOT' }),
      ).toBeInTheDocument(),
    )
  })

  it('redirects direct access to /invoice back to the home page', async () => {
    renderAt('/invoice')
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'INVOICE PILOT' }),
      ).toBeInTheDocument(),
    )
  })

  it('redirects an unknown route back to the home page', async () => {
    renderAt('/does-not-exist')
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'INVOICE PILOT' }),
      ).toBeInTheDocument(),
    )
  })

  it('lets in-app navigation to Setup through with no contractor configured', () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('link', { name: 'Setup Data' }))
    expect(screen.getByRole('heading', { name: 'Setup' })).toBeInTheDocument()
  })

  it('disables Create Invoice with an explanatory message when no contractor is configured', () => {
    renderAt('/')
    const createInvoiceButton = screen.getByRole('button', { name: 'Create Invoice' })
    expect(createInvoiceButton).toBeDisabled()
    expect(createInvoiceButton).toHaveAttribute(
      'title',
      'Complete Setup and add a client before creating an invoice.',
    )
  })

  it('disables Create Invoice with an explanatory message when the contractor exists but no client is registered', () => {
    seedAppData({ contractor: makeContractor(), clients: [], invoiceSequence: 1 })
    renderAt('/')
    const createInvoiceButton = screen.getByRole('button', { name: 'Create Invoice' })
    expect(createInvoiceButton).toBeDisabled()
    expect(createInvoiceButton).toHaveAttribute(
      'title',
      'Complete Setup and add a client before creating an invoice.',
    )
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
    expect(screen.getByRole('heading', { name: 'INVOICE PILOT' })).toBeInTheDocument()
    expect(screen.queryByText("We couldn't read your saved data")).not.toBeInTheDocument()
  })

  it('shows a corrupted-data notice instead of the app when stored data cannot be parsed', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json')

    renderAt('/')

    expect(screen.getByText("We couldn't read your saved data")).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Setup Data' })).not.toBeInTheDocument()
  })

  it('shows the corrupted-data notice regardless of which route was requested', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json')

    renderAt('/invoice')

    expect(screen.getByText("We couldn't read your saved data")).toBeInTheDocument()
  })

  it('the corrupted-data notice offers the same Delete All Data control', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json')

    renderAt('/')
    fireEvent.click(screen.getByRole('button', { name: 'Delete All Data' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('offers Delete All Data on the home page', () => {
    renderAt('/')
    expect(screen.getByRole('button', { name: 'Delete All Data' })).toBeInTheDocument()
  })

  it('does not offer Delete All Data on other pages', () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('link', { name: 'Setup Data' }))
    expect(screen.queryByRole('button', { name: 'Delete All Data' })).not.toBeInTheDocument()
  })
})
