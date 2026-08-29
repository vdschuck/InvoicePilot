import { fireEvent, render, screen } from '@testing-library/react'
import { saveContractor } from '../services/storage'
import type { Contractor } from '../types'
import { ClientsPage } from './ClientsPage'

const contractor: Contractor = {
  name: 'Ada Lovelace',
  companyName: 'Analytical Engines Ltd',
  streetAddress: '1 Babbage Street',
  city: 'London',
  state: 'London',
  country: 'United Kingdom',
  contactNumber: '+44 20 7946 0958',
}

function fillClientForm(values: {
  name: string
  companyName: string
  streetAddress: string
  city: string
  state: string
  country: string
  contactNumber: string
  currency: string
}) {
  fireEvent.change(screen.getByLabelText('Client name'), { target: { value: values.name } })
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
  fireEvent.change(screen.getByLabelText('Currency'), { target: { value: values.currency } })
}

const clientA = {
  name: 'Grace Hopper',
  companyName: 'Compilers Inc',
  streetAddress: '1 Turing Way',
  city: 'Arlington',
  state: 'VA',
  country: 'United States',
  contactNumber: '+1 555-0100',
  currency: 'USD',
}

const clientB = {
  name: 'Alan Turing',
  companyName: 'Codebreakers Ltd',
  streetAddress: '2 Bletchley Park',
  city: 'Milton Keynes',
  state: 'Buckinghamshire',
  country: 'United Kingdom',
  contactNumber: '+44 1908 640404',
  currency: 'GBP',
}

function mockConfirm(returnValue: boolean) {
  window.confirm = jest.fn().mockReturnValue(returnValue)
}

describe('ClientsPage', () => {
  beforeEach(() => {
    localStorage.clear()
    saveContractor(contractor)
    mockConfirm(true)
  })

  it('shows an empty list and a 0 / 3 count initially', () => {
    render(<ClientsPage />)
    expect(screen.getByText('0 / 3')).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('adds a client and shows it in the list', async () => {
    render(<ClientsPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
    fillClientForm(clientA)
    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))

    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('shows validation errors when the form is submitted empty', async () => {
    render(<ClientsPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))

    expect(await screen.findAllByRole('alert')).toHaveLength(8)
  })

  it('disables Add Client once the maximum of 3 is reached', async () => {
    render(<ClientsPage />)

    for (const client of [clientA, clientB, { ...clientA, name: 'Third Client' }]) {
      fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
      fillClientForm(client)
      fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
      await screen.findByText(client.name)
    }

    expect(screen.getByText('3 / 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Client' })).toBeDisabled()
  })

  it('edits an existing client', async () => {
    render(<ClientsPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
    fillClientForm(clientA)
    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
    await screen.findByText('Grace Hopper')

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByLabelText('Client name'), {
      target: { value: 'Grace B. Hopper' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(await screen.findByText('Grace B. Hopper')).toBeInTheDocument()
    expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument()
  })

  it('deletes a client after confirmation', async () => {
    render(<ClientsPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
    fillClientForm(clientA)
    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
    await screen.findByText('Grace Hopper')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument()
    expect(screen.getByText('0 / 3')).toBeInTheDocument()
  })

  it('does not delete when the confirmation is dismissed', async () => {
    render(<ClientsPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
    fillClientForm(clientA)
    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
    await screen.findByText('Grace Hopper')

    mockConfirm(false)
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
  })

  it('cancels adding a client without saving it', () => {
    render(<ClientsPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Add Client' }))
    fillClientForm(clientA)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument()
    expect(screen.getByText('0 / 3')).toBeInTheDocument()
  })
})
