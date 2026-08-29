import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import * as pdfService from '../services/pdf'
import { addClient, getAppData, saveContractor } from '../services/storage'
import type { Contractor } from '../types'
import { InvoicePage } from './InvoicePage'

jest.mock('../services/pdf', () => ({
  generateInvoicePdf: jest.fn(),
  getInvoiceFilename: jest.fn((invoiceNumber: string) => `invoice-${invoiceNumber}.pdf`),
}))

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

function fillValidDraft() {
  fireEvent.change(screen.getByLabelText('Client'), {
    target: { value: screen.getByRole('option', { name: 'Grace Hopper' }).getAttribute('value') },
  })
  fireEvent.change(screen.getByLabelText('Invoice date'), { target: { value: '2026-01-01' } })
  fireEvent.change(screen.getByLabelText('Issued date'), { target: { value: '2026-01-01' } })
  fireEvent.change(screen.getByLabelText('Due date'), { target: { value: '2026-01-15' } })
  fireEvent.change(screen.getByLabelText('Ref No'), { target: { value: 'A-1' } })
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Consulting' } })
  fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '2' } })
  fireEvent.change(screen.getByLabelText('Rate'), { target: { value: '100' } })
}

describe('InvoicePage', () => {
  beforeEach(() => {
    localStorage.clear()
    seedContractorWithClient()
    jest.clearAllMocks()
    ;(pdfService.generateInvoicePdf as jest.Mock).mockReturnValue({ save: jest.fn() })
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

    // "150.00" now appears both in the entry row's Amount and in the live
    // preview's item/Amount Due cells.
    expect(screen.getAllByText('150.00').length).toBeGreaterThanOrEqual(2)
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

  describe('preview', () => {
    it('shows the contractor in the FROM section immediately', () => {
      render(<InvoicePage />)
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
      expect(screen.getByText('Analytical Engines Ltd')).toBeInTheDocument()
    })

    it('shows a placeholder in the TO section until a client is selected', () => {
      render(<InvoicePage />)
      expect(screen.getByText('No client selected')).toBeInTheDocument()
    })

    it('shows the selected client in the TO section', () => {
      render(<InvoicePage />)
      fireEvent.change(screen.getByLabelText('Client'), {
        target: { value: screen.getByRole('option', { name: 'Grace Hopper' }).getAttribute('value') },
      })
      expect(screen.getByText('Compilers Inc')).toBeInTheDocument()
      expect(screen.queryByText('No client selected')).not.toBeInTheDocument()
    })

    it('reflects the invoice number and dates as they are entered', () => {
      render(<InvoicePage />)
      fireEvent.change(screen.getByLabelText('Invoice date'), { target: { value: '2026-01-01' } })

      expect(screen.getAllByText('INV-1').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('2026-01-01')).toBeInTheDocument()
    })

    it('formats Amount Due using the selected client currency', () => {
      render(<InvoicePage />)
      fireEvent.change(screen.getByLabelText('Client'), {
        target: { value: screen.getByRole('option', { name: 'Grace Hopper' }).getAttribute('value') },
      })
      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '2' } })
      fireEvent.change(screen.getByLabelText('Rate'), { target: { value: '25' } })

      // "$50.00" appears both as the single item's Amount and as Amount Due.
      expect(screen.getAllByText('$50.00').length).toBeGreaterThanOrEqual(2)
    })

    it('shows plain numbers for Amount Due before a client is selected', () => {
      render(<InvoicePage />)
      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '2' } })
      fireEvent.change(screen.getByLabelText('Rate'), { target: { value: '25' } })

      expect(screen.getAllByText('50.00').length).toBeGreaterThanOrEqual(1)
      expect(screen.queryByText('$50.00')).not.toBeInTheDocument()
    })
  })

  describe('PDF download', () => {
    it('generates and downloads a PDF for a valid draft', async () => {
      render(<InvoicePage />)
      fillValidDraft()

      fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }))

      await waitFor(() => {
        expect(pdfService.generateInvoicePdf).toHaveBeenCalledTimes(1)
      })
      const [, draft] = (pdfService.generateInvoicePdf as jest.Mock).mock.calls[0]
      expect(draft.invoiceNumber).toBe('INV-1')
      expect(draft.client.name).toBe('Grace Hopper')
      expect(draft.items).toHaveLength(1)

      const generatedDoc = (pdfService.generateInvoicePdf as jest.Mock).mock.results[0].value
      expect(generatedDoc.save).toHaveBeenCalledWith('invoice-INV-1.pdf')
    })

    it('does not generate a PDF when the draft is invalid, and shows validation errors instead', async () => {
      render(<InvoicePage />)

      fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }))

      await waitFor(() => {
        expect(screen.getByText('Select a client')).toBeInTheDocument()
      })
      expect(pdfService.generateInvoicePdf).not.toHaveBeenCalled()
    })

    it('shows an error message and does not throw when PDF generation fails', async () => {
      ;(pdfService.generateInvoicePdf as jest.Mock).mockImplementation(() => {
        throw new Error('boom')
      })
      render(<InvoicePage />)
      fillValidDraft()

      fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }))

      await waitFor(() => {
        expect(
          screen.getByText('Failed to generate the PDF. Please try again.'),
        ).toBeInTheDocument()
      })
    })
  })

  describe('invoice sequence', () => {
    it('advances the invoice sequence after a successful download', async () => {
      render(<InvoicePage />)
      fillValidDraft()

      fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }))

      await waitFor(() => {
        expect(pdfService.generateInvoicePdf).toHaveBeenCalledTimes(1)
      })
      expect(getAppData()?.invoiceSequence).toBe(2)
    })

    it('does not advance the invoice sequence when generation fails', async () => {
      ;(pdfService.generateInvoicePdf as jest.Mock).mockImplementation(() => {
        throw new Error('boom')
      })
      render(<InvoicePage />)
      fillValidDraft()

      fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }))

      await waitFor(() => {
        expect(
          screen.getByText('Failed to generate the PDF. Please try again.'),
        ).toBeInTheDocument()
      })
      expect(getAppData()?.invoiceSequence).toBe(1)
    })

    it('is idempotent: downloading the same unmodified draft again does not advance the sequence a second time', async () => {
      render(<InvoicePage />)
      fillValidDraft()

      fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }))
      await waitFor(() => {
        expect(pdfService.generateInvoicePdf).toHaveBeenCalledTimes(1)
      })
      expect(getAppData()?.invoiceSequence).toBe(2)

      fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }))
      await waitFor(() => {
        expect(pdfService.generateInvoicePdf).toHaveBeenCalledTimes(2)
      })
      expect(getAppData()?.invoiceSequence).toBe(2)
    })

    it('advances the sequence again when the draft is modified before downloading again', async () => {
      render(<InvoicePage />)
      fillValidDraft()

      fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }))
      await waitFor(() => {
        expect(getAppData()?.invoiceSequence).toBe(2)
      })

      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '3' } })
      fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }))

      await waitFor(() => {
        expect(pdfService.generateInvoicePdf).toHaveBeenCalledTimes(2)
      })
      expect(getAppData()?.invoiceSequence).toBe(3)
    })

    it('gives the next invoice draft the next sequence number', async () => {
      const first = render(<InvoicePage />)
      fillValidDraft()
      fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }))
      await waitFor(() => {
        expect(getAppData()?.invoiceSequence).toBe(2)
      })
      first.unmount()

      render(<InvoicePage />)
      expect(screen.getByLabelText('Invoice number')).toHaveValue('INV-2')
    })
  })
})
