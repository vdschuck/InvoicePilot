import { Navigate, Route, Routes } from 'react-router-dom'
import { CorruptedDataNotice } from './components/layout/CorruptedDataNotice'
import { Layout } from './components/layout/Layout'
import { ClientsPage } from './pages/ClientsPage'
import { ContractorPage } from './pages/ContractorPage'
import { HomePage } from './pages/HomePage'
import { InvoicePage } from './pages/InvoicePage'
import { EntryGuard } from './routes/EntryGuard'
import { RequireContractor } from './routes/RequireContractor'
import { RequireContractorAndClient } from './routes/RequireContractorAndClient'
import { isAppDataCorrupted } from './services/storage'

export function AppRoutes() {
  if (isAppDataCorrupted()) {
    return <CorruptedDataNotice />
  }

  return (
    <EntryGuard>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contractor" element={<ContractorPage />} />
          <Route
            path="/clients"
            element={
              <RequireContractor>
                <ClientsPage />
              </RequireContractor>
            }
          />
          <Route
            path="/invoice"
            element={
              <RequireContractorAndClient>
                <InvoicePage />
              </RequireContractorAndClient>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </EntryGuard>
  )
}
