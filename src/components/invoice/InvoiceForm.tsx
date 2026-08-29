import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { createInvoiceSchema, type InvoiceFormValues } from '../../schemas/invoice'
import { calculateInvoiceTotal, calculateItemAmount } from '../../utils/calculations'
import { getNextInvoiceNumber } from '../../utils/invoiceNumber'
import type { Client } from '../../types'
import { SelectField } from '../forms/SelectField'
import { TextField } from '../forms/TextField'
import { InvoiceItemRow } from './InvoiceItemRow'

interface InvoiceFormProps {
  invoiceSequence: number
  clients: Client[]
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function InvoiceForm({ invoiceSequence, clients }: InvoiceFormProps) {
  // The first item is always id "1"; the next appended item starts at 2.
  const nextItemId = useRef(2)
  const [schema] = useState(() => createInvoiceSchema(clients.map((client) => client.id)))

  const {
    register,
    control,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      invoiceNumber: getNextInvoiceNumber(invoiceSequence),
      clientId: '',
      invoiceDate: '',
      issuedDate: '',
      dueDate: '',
      items: [
        {
          id: '1',
          refNo: '',
          description: '',
          quantity: 0,
          rate: 0,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = useWatch({ control, name: 'items' })

  function handleAddItem() {
    append({
      id: String(nextItemId.current++),
      refNo: '',
      description: '',
      quantity: 0,
      rate: 0,
    })
  }

  const total = calculateInvoiceTotal(
    (items ?? []).map((item) => ({
      quantity: toNumber(item.quantity),
      rate: toNumber(item.rate),
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
            amount={calculateItemAmount(toNumber(items?.[index]?.quantity), toNumber(items?.[index]?.rate))}
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
