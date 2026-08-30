import { useWatch, type Control } from 'react-hook-form'
import type { InvoiceFormValues } from '../../schemas/invoice'
import type { Client, Contractor } from '../../types'
import { calculateInvoiceTotal, calculateItemAmount, toSafeNumber } from '../../utils/calculations'
import { formatCurrency } from '../../utils/currency'
import { formatLongDate } from '../../utils/dateFormat'

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
    <div className="flex flex-col gap-6 rounded-md border border-gray-200 bg-white p-6 font-invoice">
      <p className="pt-10 text-4xl font-bold">Invoice # {values.invoiceNumber || '—'}</p>

      <div className="mb-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-base font-semibold uppercase tracking-wide text-gray-500">From</h3>
          <p className="text-sm font-medium">{contractor.name}</p>
          <p className="text-sm">{contractor.companyName}</p>
          <p className="text-sm">{contractor.streetAddress}</p>
          <p className="text-sm">
            {contractor.city}, {contractor.state}, {contractor.country}
          </p>
          <p className="text-sm">{contractor.contactNumber}</p>
        </div>
        <div>
          <h3 className="text-base font-semibold uppercase tracking-wide text-gray-500">To</h3>
          {client ? (
            <>
              <p className="text-sm font-medium">{client.name}</p>
              <p className="text-sm">{client.companyName}</p>
              <p className="text-sm">{client.streetAddress}</p>
              <p className="text-sm">
                {client.city}, {client.state}, {client.country}
              </p>
              <p className="text-sm">{client.contactNumber}</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">No client selected</p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-100">
              <th className="py-2 pr-2 pl-2">Ref No</th>
              <th className="py-2 pr-2">Description In Detail</th>
              <th className="py-2 pr-2 text-right">Quantity</th>
              <th className="py-2 pr-2 text-right">Rate</th>
              <th className="py-2 pr-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item?.id ?? index} className="border-b border-gray-100">
                <td className="py-2 pr-2 pl-2">{item?.refNo}</td>
                <td className="py-2 pr-2">{item?.description}</td>
                <td className="py-2 pr-2 text-right">{toSafeNumber(item?.quantity)}</td>
                <td className="py-2 pr-2 text-right">{format(toSafeNumber(item?.rate))}</td>
                <td className="py-2 pr-2 text-right">
                  {format(calculateItemAmount(toSafeNumber(item?.quantity), toSafeNumber(item?.rate)))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-[auto_auto] items-baseline justify-end gap-x-2 gap-y-1 self-end border-t border-gray-200 pt-4">
        <h3 className="text-right text-sm font-semibold">Invoice Date:</h3>
        <p className="text-sm">{values.invoiceDate ? formatLongDate(values.invoiceDate) : '—'}</p>
        <h3 className="text-right text-sm font-semibold">Issued Date:</h3>
        <p className="text-sm">{values.issuedDate ? formatLongDate(values.issuedDate) : '—'}</p>
        <h3 className="text-right text-sm font-semibold">Due Date:</h3>
        <p className="text-sm">{values.dueDate ? formatLongDate(values.dueDate) : '—'}</p>
      </div>

      <div className="flex items-start justify-between gap-6">
        <div className="text-sm">
          {client?.bankingDetails && (
            <>
              <p className="font-semibold text-gray-700">Client Banking Information</p>
              <p className="whitespace-pre-line text-gray-600">{client.bankingDetails}</p>
            </>
          )}
        </div>
        <div className="flex gap-4 text-lg font-semibold">
          <span>Amount Due:</span>
          <span>{format(total)}</span>
        </div>
      </div>
    </div>
  )
}
