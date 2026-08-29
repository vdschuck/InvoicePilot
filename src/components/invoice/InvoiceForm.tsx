import { useWatch } from 'react-hook-form'
import type { Client } from '../../types'
import { calculateInvoiceTotal, calculateItemAmount, toSafeNumber } from '../../utils/calculations'
import { SelectField } from '../forms/SelectField'
import { TextField } from '../forms/TextField'
import { InvoiceItemRow } from './InvoiceItemRow'
import type { InvoiceDraftForm } from './useInvoiceDraftForm'

interface InvoiceFormProps {
  clients: Client[]
  draftForm: InvoiceDraftForm
}

export function InvoiceForm({ clients, draftForm }: InvoiceFormProps) {
  const {
    register,
    control,
    formState: { errors },
    fields,
    remove,
    handleAddItem,
  } = draftForm

  const items = useWatch({ control, name: 'items' })

  const total = calculateInvoiceTotal(
    (items ?? []).map((item) => ({
      quantity: toSafeNumber(item.quantity),
      rate: toSafeNumber(item.rate),
    })),
  )

  const clientOptions = clients.map((client) => ({ value: client.id, label: client.name }))
  const itemsError = errors.items?.root?.message ?? errors.items?.message

  return (
    <form className="flex flex-col gap-6" noValidate>
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
            amount={calculateItemAmount(
              toSafeNumber(items?.[index]?.quantity),
              toSafeNumber(items?.[index]?.rate),
            )}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
          />
        ))}
        <button
          type="button"
          onClick={handleAddItem}
          className="w-fit rounded-md border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
        >
          Add Item
        </button>
      </div>

      <div className="text-right text-lg font-semibold">Total: {total.toFixed(2)}</div>
    </form>
  )
}
