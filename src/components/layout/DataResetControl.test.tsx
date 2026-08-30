import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { saveContractor } from '../../services/storage'
import type { Contractor } from '../../types'
import { DataResetControl } from './DataResetControl'

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

function renderControl() {
  return render(
    <MemoryRouter>
      <DataResetControl />
    </MemoryRouter>,
  )
}

describe('DataResetControl', () => {
  beforeEach(() => {
    localStorage.clear()
    saveContractor(makeContractor())
  })

  it('does not show the confirmation dialog until the button is clicked', () => {
    renderControl()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('shows a custom confirmation dialog when clicked', () => {
    renderControl()
    fireEvent.click(screen.getByRole('button', { name: 'Delete All Data' }))

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument()
  })

  it('clears the stored data when the dialog is confirmed', () => {
    renderControl()
    fireEvent.click(screen.getByRole('button', { name: 'Delete All Data' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('does not clear the stored data when the dialog is cancelled', () => {
    renderControl()
    fireEvent.click(screen.getByRole('button', { name: 'Delete All Data' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('closes the dialog without clearing data when Escape is pressed', () => {
    renderControl()
    fireEvent.click(screen.getByRole('button', { name: 'Delete All Data' }))
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
