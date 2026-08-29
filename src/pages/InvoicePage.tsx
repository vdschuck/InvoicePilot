import { InvoiceForm } from '../components/invoice/InvoiceForm'
import { getAppData } from '../services/storage'

export function InvoicePage() {
  const appData = getAppData()

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Create Invoice</h1>
      <InvoiceForm
        invoiceSequence={appData?.invoiceSequence ?? 1}
        clients={appData?.clients ?? []}
      />
    </div>
  )
}
