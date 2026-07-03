import { Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute"
import { DashboardPage } from "@/pages/DashboardPage"
import { InventoryPage } from "@/pages/InventoryPage"
import { LoginPage } from "@/pages/LoginPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { ProductsPage } from "@/pages/ProductsPage"
import { ReportsPage } from "@/pages/ReportsPage"
import { SettingsPage } from "@/pages/SettingsPage"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/produtos" element={<ProductsPage />} />
          <Route path="/estoque" element={<InventoryPage />} />
          <Route path="/relatorios" element={<ReportsPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
