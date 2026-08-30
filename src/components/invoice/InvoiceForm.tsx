import { useState } from 'react'
import { useWatch } from 'react-hook-form'
import { advanceInvoiceSequence } from '../../services/storage'
import type { Client, Contractor, InvoiceDraft } from '../../types'
import { calculateInvoiceTotal, toSafeNumber } from '../../utils/calculations'
import { SelectField } from '../forms/SelectField'
import { TextField } from '../forms/TextField'
import { InvoiceItemRow } from './InvoiceItemRow'
import type { InvoiceDraftForm } from './useInvoiceDraftForm'
import type { InvoiceFormValues } from '../../schemas/invoice'

interface InvoiceFormProps {
  contractor: Contractor
  clients: Client[]
  draftForm: InvoiceDraftForm
}

export function InvoiceForm({ contractor, clients, draftForm }: InvoiceFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    fields,
    remove,
    handleAddItem,
  } = draftForm
  const [downloadError, setDownloadError] = useState<string | null>(null)
  // Snapshot of the draft as of the last successful download, used to make
  // repeat downloads of an unmodified draft idempotent (no double-advance).
  const [lastDownloadedDraft, setLastDownloadedDraft] = useState<string | null>(null)

  const items = useWatch({ control, name: 'items' })

  const total = calculateInvoiceTotal(
    (items ?? []).map((item) => ({
      quantity: toSafeNumber(item.quantity),
      rate: toSafeNumber(item.rate),
    })),
  )

  const clientOptions = clients.map((client) => ({ value: client.id, label: client.name }))
  const itemsError = errors.items?.root?.message ?? errors.items?.message

  async function handleDownload(values: InvoiceFormValues) {
    const client = clients.find((candidate) => candidate.id === values.clientId)
    if (!client) {
      setDownloadError('Failed to generate the PDF. Please try again.')
      return
    }

    const draft: InvoiceDraft = {
      invoiceNumber: values.invoiceNumber,
      client,
      invoiceDate: values.invoiceDate,
      issuedDate: values.issuedDate,
      dueDate: values.dueDate,
      items: values.items,
    }

    try {
      // Loaded on demand rather than imported at the top of the file: jsPDF
      // (plus the embedded Inter font and jsPDF's own html2canvas/dompurify
      // dependencies) is the single largest chunk in the app, and is only
      // needed once the user actually downloads an invoice.
      const { generateInvoicePdf, getInvoiceFilename } = await import('../../services/pdf')
      const doc = generateInvoicePdf(contractor, draft)
      doc.save(getInvoiceFilename(draft.invoiceNumber))

      const draftSnapshot = JSON.stringify(values)
      if (lastDownloadedDraft !== draftSnapshot) {
        advanceInvoiceSequence()
        setLastDownloadedDraft(draftSnapshot)
      }

      setDownloadError(null)
    } catch {
      setDownloadError('Failed to generate the PDF. Please try again.')
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(handleDownload)} noValidate>
      <TextField
        label="Invoice number"
        registration={register('invoiceNumber')}
        error={errors.invoiceNumber?.message}
      />
      <SelectField
        label="Client"
        registration={register('clientId')}
        error={errors.clientId?.message}
        options={clientOptions}
        placeholder="Select a client"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField
          label="Invoice date"
          type="date"
          registration={register('invoiceDate')}
          error={errors.invoiceDate?.message}
        />
        <TextField
          label="Issued date"
          type="date"
          registration={register('issuedDate')}
          error={errors.issuedDate?.message}
        />
        <TextField
          label="Due date"
          type="date"
          registration={register('dueDate')}
          error={errors.dueDate?.message}
        />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Items</h2>
        {typeof itemsError === 'string' && (
          <span role="alert" className="text-sm text-red-600">
            {itemsError}
          </span>
        )}
        {fields.map((field, index) => (
          <InvoiceItemRow
            key={field.id}
            index={index}
            register={register}
            errors={errors.items?.[index]}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
          />
        ))}
        <button
          type="button"
          onClick={handleAddItem}
          className="w-fit cursor-pointer rounded-md border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
        >
          Add Item
        </button>
      </div>

      <div className="text-right text-lg font-semibold">Total: {total.toFixed(2)}</div>

      {downloadError && (
        <span role="alert" className="text-sm text-red-600">
          {downloadError}
        </span>
      )}

      <button
        type="submit"
        className="w-fit cursor-pointer self-end rounded-md bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
      >
        Download PDF
      </button>
    </form>
  )
}
