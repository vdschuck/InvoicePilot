import { z } from 'zod'

const requiredField = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

const invoiceItemSchema = z.object({
  id: z.string().min(1),
  refNo: requiredField('Ref No'),
  description: requiredField('Description'),
  quantity: z.number('Quantity is required').positive('Quantity must be greater than 0'),
  rate: z.number('Rate is required').min(0, 'Rate must be 0 or greater'),
})

export function createInvoiceSchema(validClientIds: string[]) {
  return z.object({
    invoiceNumber: requiredField('Invoice number'),
    clientId: z.string().refine((value) => validClientIds.includes(value), {
      message: 'Select a client',
    }),
    invoiceDate: requiredField('Invoice date'),
    issuedDate: requiredField('Issued date'),
    dueDate: requiredField('Due date'),
    items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  })
}

export type InvoiceFormValues = z.infer<ReturnType<typeof createInvoiceSchema>>
export type InvoiceItemFormValues = InvoiceFormValues['items'][number]
