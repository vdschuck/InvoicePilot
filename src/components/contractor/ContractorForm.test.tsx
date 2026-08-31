import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import * as storageService from '../../services/storage'
import { getAppData } from '../../services/storage'
import type { Contractor } from '../../types'
import { ContractorForm } from './ContractorForm'

function fillForm(values: Contractor) {
  fireEvent.change(screen.getByLabelText(/^Contractor name/), {
    target: { value: values.name },
  })
  fireEvent.change(screen.getByLabelText(/^Company name/), {
    target: { value: values.companyName },
  })
  fireEvent.change(screen.getByLabelText(/^Street address/), {
    target: { value: values.streetAddress },
  })
  fireEvent.change(screen.getByLabelText(/^City/), { target: { value: values.city } })
  fireEvent.change(screen.getByLabelText(/^State/), { target: { value: values.state } })
  fireEvent.change(screen.getByLabelText(/^Country/), { target: { value: values.country } })
  fireEvent.change(screen.getByLabelText(/^Zip code/), { target: { value: values.zipCode } })
  fireEvent.change(screen.getByLabelText(/^Contact number/), {
    target: { value: values.contactNumber },
  })
}

const contractor: Contractor = {
  name: 'Ada Lovelace',
  companyName: 'Analytical Engines Ltd',
  streetAddress: '1 Babbage Street',
  city: 'London',
  state: 'London',
  country: 'United Kingdom',
  zipCode: 'EC1A 1BB',
  contactNumber: '+44 20 7946 0958',
}

function renderForm(contractorProp: Contractor | null) {
  return render(
    <MemoryRouter>
      <ContractorForm contractor={contractorProp} />
    </MemoryRouter>,
  )
}

function renderFormWithRoutes(contractorProp: Contractor | null) {
  return render(
    <MemoryRouter initialEntries={['/contractor']}>
      <Routes>
        <Route path="/contractor" element={<ContractorForm contractor={contractorProp} />} />
        <Route path="/clients" element={<div>Clients Page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ContractorForm', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows validation errors when required fields are missing', async () => {
    renderForm(null)

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findAllByRole('alert')).toHaveLength(7)
    expect(getAppData()).toBeNull()
  })

  it('navigates to Clients after a successful save', async () => {
    renderFormWithRoutes(null)

    fillForm(contractor)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Clients Page')).toBeInTheDocument()
    expect(getAppData()?.contractor).toEqual({ ...contractor, paymentInformation: '' })
  })

  it('navigates to Clients after saving an edit, even when clients already exist', async () => {
    localStorage.setItem(
      'invoicepilot:app-data',
      JSON.stringify({
        contractor,
        clients: [
          {
            id: '1',
            companyName: 'Compilers Inc',
            streetAddress: '1 Turing Way',
            city: 'Arlington',
            state: 'VA',
            country: 'United States',
            contactNumber: '+1 555-0100',
            currency: 'USD',
          },
        ],
        invoiceSequence: 1,
      }),
    )
    renderFormWithRoutes(contractor)

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Clients Page')).toBeInTheDocument()
  })

  it('pre-fills the form when an existing contractor is passed in', () => {
    renderForm(contractor)

    expect(screen.getByLabelText(/^Contractor name/)).toHaveValue(contractor.name)
    expect(screen.getByLabelText(/^Contact number/)).toHaveValue(contractor.contactNumber)
  })

  it('shows an error message when saving fails, without crashing', async () => {
    jest.spyOn(storageService, 'saveContractor').mockImplementationOnce(() => {
      throw new Error('boom')
    })

    renderForm(contractor)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Failed to save contractor information. Please try again.',
      )
    })

    jest.restoreAllMocks()
  })

  it('clears the save error once the form is edited again', async () => {
    jest.spyOn(storageService, 'saveContractor').mockImplementationOnce(() => {
      throw new Error('boom')
    })

    renderForm(contractor)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())

    fireEvent.change(screen.getByLabelText(/^City/), { target: { value: 'Manchester' } })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    jest.restoreAllMocks()
  })
})
