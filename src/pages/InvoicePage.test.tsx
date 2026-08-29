import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { addClient, saveContractor } from '../services/storage'
import type { Contractor } from '../types'
import { InvoicePage } from './InvoicePage'

const contractor: Contractor = {
  name: 'Ada Lovelace',
  companyName: 'Analytical Engines Ltd',
  streetAddress: '1 Babbage Street',
  city: 'London',
  state: 'London',
  country: 'United Kingdom',
  contactNumber: '+44 20 7946 0958',
}

function seedContractorWithClient() {
  saveContractor(contractor)
  addClient({
    name: 'Grace Hopper',
    companyName: 'Compilers Inc',
    streetAddress: '1 Turing Way',
    city: 'Arlington',
    state: 'VA',
    country: 'United States',
    contactNumber: '+1 555-0100',
    currency: 'USD',
  })
}

describe('InvoicePage', () => {
  beforeEach(() => {
    localStorage.clear()
    seedContractorWithClient()
  })

  it('pre-fills the invoice number from the current sequence, unpadded', () => {
    render(<InvoicePage />)
    expect(screen.getByLabelText('Invoice number')).toHaveValue('INV-1')
  })

  it('allows manually editing the invoice number', () => {
    render(<InvoicePage />)
    const input = screen.getByLabelText('Invoice number')
    fireEvent.change(input, { target: { value: 'INV-2026-007' } })
    expect(input).toHaveValue('INV-2026-007')
  })

  it('lists registered clients in the client select', () => {
    render(<InvoicePage />)
    expect(
      within(screen.getByLabelText('Client')).getByRole('option', { name: 'Grace Hopper' }),
    ).toBeInTheDocument()
  })

  it('starts with one item row and computes its amount live', () => {
    render(<InvoicePage />)

    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText('Rate'), { target: { value: '50' } })

    expect(screen.getByText('150.00')).toBeInTheDocument()
    expect(screen.getByText('Total: 150.00')).toBeInTheDocument()
  })

  it('adds and removes items dynamically, recalculating the total', () => {
    render(<InvoicePage />)

    fireEvent.change(screen.getAllByLabelText('Quantity')[0], { target: { value: '2' } })
    fireEvent.change(screen.getAllByLabelText('Rate')[0], { target: { value: '10' } })

    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }))
    expect(screen.getAllByLabelText('Ref No')).toHaveLength(2)

    fireEvent.change(screen.getAllByLabelText('Quantity')[1], { target: { value: '1' } })
    fireEvent.change(screen.getAllByLabelText('Rate')[1], { target: { value: '30' } })

    expect(screen.getByText('Total: 50.00')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[1])
    expect(screen.getAllByLabelText('Ref No')).toHaveLength(1)
    expect(screen.getByText('Total: 20.00')).toBeInTheDocument()
  })

  it('disables removing the last remaining item', () => {
    render(<InvoicePage />)
    expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled()
  })

  it('shows validation errors for required fields once touched', async () => {
    render(<InvoicePage />)

    fireEvent.change(screen.getByLabelText('Invoice number'), { target: { value: '' } })
    fireEvent.blur(screen.getByLabelText('Invoice number'))

    await waitFor(() => {
      expect(screen.getByText('Invoice number is required')).toBeInTheDocument()
    })
  })

  it('shows an error when quantity is left at an invalid value', async () => {
    render(<InvoicePage />)

    const quantity = screen.getByLabelText('Quantity')
    // The field's default value is already "0"; change through a distinct
    // value first so the browser/React actually registers the edit back to 0.
    fireEvent.change(quantity, { target: { value: '5' } })
    fireEvent.change(quantity, { target: { value: '0' } })
    fireEvent.blur(quantity)

    await waitFor(() => {
      expect(screen.getByText('Quantity must be greater than 0')).toBeInTheDocument()
    })
  })
})
