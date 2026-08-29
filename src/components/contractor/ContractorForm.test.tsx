import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import * as storageService from '../../services/storage'
import { getAppData } from '../../services/storage'
import type { Contractor } from '../../types'
import { ContractorForm } from './ContractorForm'

function fillForm(values: Contractor) {
  fireEvent.change(screen.getByLabelText('Contractor name'), {
    target: { value: values.name },
  })
  fireEvent.change(screen.getByLabelText('Company name'), {
    target: { value: values.companyName },
  })
  fireEvent.change(screen.getByLabelText('Street address'), {
    target: { value: values.streetAddress },
  })
  fireEvent.change(screen.getByLabelText('City'), { target: { value: values.city } })
  fireEvent.change(screen.getByLabelText('State'), { target: { value: values.state } })
  fireEvent.change(screen.getByLabelText('Country'), { target: { value: values.country } })
  fireEvent.change(screen.getByLabelText('Contact number'), {
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
  contactNumber: '+44 20 7946 0958',
}

describe('ContractorForm', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows validation errors when required fields are missing', async () => {
    render(<ContractorForm contractor={null} />)

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findAllByRole('alert')).toHaveLength(7)
    expect(getAppData()).toBeNull()
  })

  it('persists the contractor and shows a confirmation on valid submit', async () => {
    render(<ContractorForm contractor={null} />)

    fillForm(contractor)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('saved')
    })
    expect(getAppData()).toEqual({
      contractor,
      clients: [],
      invoiceSequence: 1,
    })
  })

  it('pre-fills the form when an existing contractor is passed in', () => {
    render(<ContractorForm contractor={contractor} />)

    expect(screen.getByLabelText('Contractor name')).toHaveValue(contractor.name)
    expect(screen.getByLabelText('Contact number')).toHaveValue(contractor.contactNumber)
  })

  it('clears the confirmation once the form is edited again', async () => {
    render(<ContractorForm contractor={contractor} />)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())

    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Manchester' } })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows an error message when saving fails, without crashing', async () => {
    jest.spyOn(storageService, 'saveContractor').mockImplementationOnce(() => {
      throw new Error('boom')
    })

    render(<ContractorForm contractor={null} />)
    fillForm(contractor)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Failed to save contractor information. Please try again.',
      )
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    jest.restoreAllMocks()
  })

  it('clears the save error once the form is edited again', async () => {
    jest.spyOn(storageService, 'saveContractor').mockImplementationOnce(() => {
      throw new Error('boom')
    })

    render(<ContractorForm contractor={null} />)
    fillForm(contractor)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())

    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Manchester' } })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    jest.restoreAllMocks()
  })
})
