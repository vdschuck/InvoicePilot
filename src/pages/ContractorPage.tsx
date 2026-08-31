import { ContractorForm } from '../components/contractor/ContractorForm'
import { getAppData } from '../services/storage'

export function ContractorPage() {
  const appData = getAppData()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Setup</h1>
      <p className="text-gray-600">Please enter your company&apos;s information.</p>
      <ContractorForm contractor={appData?.contractor ?? null} />
    </div>
  )
}
