import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import * as storageService from '../services/storage'
import { saveContractor } from '../services/storage'
import type { Contractor } from '../types'
import { ClientsPage } from './ClientsPage'

const contractor: Contractor = {
  name: 'Ada Lovelace',
  companyName: 'Analytical Engines Ltd',
  addressLine1: '1 Babbage Street',
  city: 'London',
  state: 'London',
  country: 'United Kingdom',
  zipCode: 'EC1A 1BB',
  contactNumber: '+44 20 7946 0958',
}

function fillClientForm(values: {
  companyName: string
  addressLine1: string
  city: string
  state: string
  country: string
  zipCode: string
  contactNumber: string
  currency: string
}) {
  fireEvent.change(screen.getByLabelText(/^Company name/), {
    target: { value: values.companyName },
  })
  fireEvent.change(screen.getByLabelText(/^Address line 1/), {
    target: { value: values.addressLine1 },
  })
  fireEvent.change(screen.getByLabelText(/^City/), { target: { value: values.city } })
  fireEvent.change(screen.getByLabelText(/^State/), { target: { value: values.state } })
  fireEvent.change(screen.getByLabelText(/^Country/), { target: { value: values.country } })
  fireEvent.change(screen.getByLabelText(/^Zip code/), { target: { value: values.zipCode } })
  fireEvent.change(screen.getByLabelText(/^Contact number/), {
    target: { value: values.contactNumber },
  })
  fireEvent.change(screen.getByLabelText(/^Currency/), { target: { value: values.currency } })
}

const clientA = {
  companyName: 'Compilers Inc',
  addressLine1: '1 Turing Way',
  city: 'Arlington',
  state: 'VA',
  country: 'United States',
  zipCode: '22201',
  contactNumber: '+1 555-0100',
  currency: 'USD',
}

const clientB = {
  companyName: 'Codebreakers Ltd',
  addressLine1: '2 Bletchley Park',
  city: 'Milton Keynes',
  state: 'Buckinghamshire',
  country: 'United Kingdom',
  zipCode: 'MK3 6EB',
  contactNumber: '+44 1908 640404',
  currency: 'GBP',
}

describe('ClientsPage', () => {
  beforeEach(() => {
    localStorage.clear()
    saveContractor(contractor)
  })

  it('shows an empty state and a 0 / 3 count initially', () => {
    render(<ClientsPage />)
    expect(screen.getByText('0 / 3')).toBeInTheDocument()
    expect(screen.getByText('No clients registered yet.')).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('replaces the empty state with the list once a client exists', async () => {
    render(<ClientsPage />)
    fillClientForm(clientA)
    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))

    await screen.findByText('Compilers Inc')
    expect(screen.queryByText('No clients registered yet.')).not.toBeInTheDocument()
  })

  it('adds a client and shows it in the list', async () => {
    render(<ClientsPage />)

    fillClientForm(clientA)
    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))

    expect(await screen.findByText('Compilers Inc')).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('shows validation errors when the form is submitted empty', async () => {
    render(<ClientsPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))

    expect(await screen.findAllByRole('alert')).toHaveLength(8)
  })

  it('disables Add Client once the maximum of 3 is reached', async () => {
    render(<ClientsPage />)

    for (const client of [clientA, clientB, { ...clientA, companyName: 'Third Client' }]) {
      fillClientForm(client)
      fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
      await screen.findByText(client.companyName)
    }

    expect(screen.getByText('3 / 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Client' })).toBeDisabled()
  })

  it('edits an existing client', async () => {
    render(<ClientsPage />)
    fillClientForm(clientA)
    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
    await screen.findByText('Compilers Inc')

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText(/^Company name/), {
      target: { value: 'Compilers International' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(await screen.findByText('Compilers International')).toBeInTheDocument()
    expect(screen.queryByText('Compilers Inc')).not.toBeInTheDocument()
  })

  it('shows a custom confirmation dialog before deleting a client', async () => {
    render(<ClientsPage />)
    fillClientForm(clientA)
    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
    await screen.findByText('Compilers Inc')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText(/Compilers Inc/)).toBeInTheDocument()
  })

  it('deletes a client after confirmation', async () => {
    render(<ClientsPage />)
    fillClientForm(clientA)
    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
    await screen.findByText('Compilers Inc')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete' }))

    expect(screen.queryByText('Compilers Inc')).not.toBeInTheDocument()
    expect(screen.getByText('0 / 3')).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('does not delete when the confirmation is cancelled', async () => {
    render(<ClientsPage />)
    fillClientForm(clientA)
    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
    await screen.findByText('Compilers Inc')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }))

    expect(screen.getByText('Compilers Inc')).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('cancels editing a client without saving changes', async () => {
    render(<ClientsPage />)
    fillClientForm(clientA)
    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
    await screen.findByText('Compilers Inc')

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText(/^Company name/), {
      target: { value: 'Compilers International' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByText('Compilers Inc')).toBeInTheDocument()
    expect(screen.queryByText('Compilers International')).not.toBeInTheDocument()
  })

  describe('error states', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('shows an error message, without crashing, when adding fails', async () => {
      jest.spyOn(storageService, 'addClient').mockImplementationOnce(() => {
        throw new Error('boom')
      })

      render(<ClientsPage />)
      fillClientForm(clientA)
      fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))

      await waitFor(() => {
        expect(
          screen.getByText('Failed to add the client. Please try again.'),
        ).toBeInTheDocument()
      })
    })

    it('shows an error message, without crashing, when editing fails', async () => {
      render(<ClientsPage />)
      fillClientForm(clientA)
      fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
      await screen.findByText('Compilers Inc')

      jest.spyOn(storageService, 'updateClient').mockImplementationOnce(() => {
        throw new Error('boom')
      })

      fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

      await waitFor(() => {
        expect(
          screen.getByText('Failed to update the client. Please try again.'),
        ).toBeInTheDocument()
      })
    })

    it('shows an error message, without crashing, when deleting fails', async () => {
      render(<ClientsPage />)
      fillClientForm(clientA)
      fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
      await screen.findByText('Compilers Inc')

      jest.spyOn(storageService, 'deleteClient').mockImplementationOnce(() => {
        throw new Error('boom')
      })

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
      fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete' }))

      await waitFor(() => {
        expect(
          screen.getByText('Failed to delete the client. Please try again.'),
        ).toBeInTheDocument()
      })
      expect(screen.getByText('Compilers Inc')).toBeInTheDocument()
    })
  })
})
