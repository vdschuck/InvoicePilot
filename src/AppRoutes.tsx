import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ClientsPage } from './pages/ClientsPage'
import { HomePage } from './pages/HomePage'
import { InvoicePage } from './pages/InvoicePage'
import { SetupPage } from './pages/SetupPage'
import { EntryGuard } from './routes/EntryGuard'
import { RequireContractor } from './routes/RequireContractor'
import { RequireContractorAndClient } from './routes/RequireContractorAndClient'

export function AppRoutes() {
  return (
    <EntryGuard>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<SetupPage />} />
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
