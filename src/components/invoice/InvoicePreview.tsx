import { useWatch, type Control } from 'react-hook-form'
import type { InvoiceFormValues } from '../../schemas/invoice'
import type { Client, Contractor } from '../../types'
import { calculateInvoiceTotal, calculateItemAmount, toSafeNumber } from '../../utils/calculations'
import { formatCurrency } from '../../utils/currency'

interface InvoicePreviewProps {
  contractor: Contractor
  clients: Client[]
  control: Control<InvoiceFormValues>
}

export function InvoicePreview({ contractor, clients, control }: InvoicePreviewProps) {
  const values = useWatch({ control })
  const items = values.items ?? []
  const client = clients.find((candidate) => candidate.id === values.clientId)

  const format = (amount: number) =>
    client ? formatCurrency(amount, client.currency) : amount.toFixed(2)

  const total = calculateInvoiceTotal(
    items.map((item) => ({
      quantity: toSafeNumber(item?.quantity),
      rate: toSafeNumber(item?.rate),
    })),
  )

  return (
    <div className="flex flex-col gap-6 rounded-md border border-gray-200 p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Invoice</p>
        <p className="text-lg font-semibold">{values.invoiceNumber || '—'}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">From</h3>
          <p className="font-medium">{contractor.name}</p>
          <p>{contractor.companyName}</p>
          <p>{contractor.streetAddress}</p>
          <p>
            {contractor.city}, {contractor.state}, {contractor.country}
          </p>
          <p>{contractor.contactNumber}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">To</h3>
          {client ? (
            <>
              <p className="font-medium">{client.name}</p>
              <p>{client.companyName}</p>
              <p>{client.streetAddress}</p>
              <p>
                {client.city}, {client.state}, {client.country}
              </p>
              <p>{client.contactNumber}</p>
            </>
          ) : (
            <p className="text-gray-500">No client selected</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
        <div>
          <h3 className="font-semibold text-gray-500">Invoice Date</h3>
          <p>{values.invoiceDate || '—'}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-500">Issued Date</h3>
          <p>{values.issuedDate || '—'}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-500">Due Date</h3>
          <p>{values.dueDate || '—'}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 pr-2">Ref No</th>
              <th className="py-2 pr-2">Description In Detail</th>
              <th className="py-2 pr-2 text-right">Quantity</th>
              <th className="py-2 pr-2 text-right">Rate</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item?.id ?? index} className="border-b border-gray-100">
                <td className="py-2 pr-2">{item?.refNo}</td>
                <td className="py-2 pr-2">{item?.description}</td>
                <td className="py-2 pr-2 text-right">{toSafeNumber(item?.quantity)}</td>
                <td className="py-2 pr-2 text-right">{format(toSafeNumber(item?.rate))}</td>
                <td className="py-2 text-right">
                  {format(calculateItemAmount(toSafeNumber(item?.quantity), toSafeNumber(item?.rate)))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-4 text-lg font-semibold">
        <span>Amount Due</span>
        <span>{format(total)}</span>
      </div>
    </div>
  )
}
