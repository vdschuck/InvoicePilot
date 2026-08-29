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

  it('asks for confirmation before clearing data', () => {
    window.confirm = jest.fn().mockReturnValue(true)

    renderControl()
    fireEvent.click(screen.getByRole('button', { name: 'Delete All Data' }))

    expect(window.confirm).toHaveBeenCalledTimes(1)
  })

  it('clears the stored data when confirmed', () => {
    window.confirm = jest.fn().mockReturnValue(true)

    renderControl()
    fireEvent.click(screen.getByRole('button', { name: 'Delete All Data' }))

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('does not clear the stored data when the confirmation is dismissed', () => {
    window.confirm = jest.fn().mockReturnValue(false)

    renderControl()
    fireEvent.click(screen.getByRole('button', { name: 'Delete All Data' }))

    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })
})
