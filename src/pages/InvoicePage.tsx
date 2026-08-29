import { InvoiceForm } from '../components/invoice/InvoiceForm'
import { InvoicePreview } from '../components/invoice/InvoicePreview'
import { useInvoiceDraftForm } from '../components/invoice/useInvoiceDraftForm'
import { getAppData } from '../services/storage'

export function InvoicePage() {
  const appData = getAppData()
  const clients = appData?.clients ?? []
  const invoiceSequence = appData?.invoiceSequence ?? 1
  const draftForm = useInvoiceDraftForm({ invoiceSequence, clients })

  if (!appData) {
    return null
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="text-2xl font-semibold">Create Invoice</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <InvoiceForm clients={clients} draftForm={draftForm} />
        <InvoicePreview
          contractor={appData.contractor}
          clients={clients}
          control={draftForm.control}
        />
      </div>
    </div>
  )
}
