import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { createInvoiceSchema, type InvoiceFormValues } from '../../schemas/invoice'
import { getNextInvoiceNumber } from '../../utils/invoiceNumber'
import type { Client } from '../../types'

interface UseInvoiceDraftFormArgs {
  invoiceSequence: number
  clients: Client[]
}

export function useInvoiceDraftForm({ invoiceSequence, clients }: UseInvoiceDraftFormArgs) {
  // The first item is always id "1"; the next appended item starts at 2.
  const nextItemId = useRef(2)
  const [schema] = useState(() => createInvoiceSchema(clients.map((client) => client.id)))

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      invoiceNumber: getNextInvoiceNumber(invoiceSequence),
      clientId: '',
      issueDate: '',
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

  const itemFieldArray = useFieldArray({ control: form.control, name: 'items' })

  function handleAddItem() {
    itemFieldArray.append({
      id: String(nextItemId.current++),
      refNo: '',
      description: '',
      quantity: 0,
      rate: 0,
    })
  }

  return { ...form, ...itemFieldArray, handleAddItem }
}

export type InvoiceDraftForm = ReturnType<typeof useInvoiceDraftForm>
