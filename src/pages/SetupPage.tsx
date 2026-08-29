import { ContractorForm } from '../components/contractor/ContractorForm'
import { getAppData } from '../services/storage'

export function SetupPage() {
  const appData = getAppData()

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Setup</h1>
      <ContractorForm contractor={appData?.contractor ?? null} />
    </div>
  )
}
