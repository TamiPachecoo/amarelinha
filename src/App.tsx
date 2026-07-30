import { Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute"
import { AuthCallbackPage } from "@/pages/AuthCallbackPage"
import { CatalogOrderPage } from "@/pages/CatalogOrderPage"
import { ClienteDetailPage } from "@/pages/ClienteDetailPage"
import { ClientesPage } from "@/pages/ClientesPage"
import { CollectionsPage } from "@/pages/CollectionsPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { FinanceiroPage } from "@/pages/FinanceiroPage"
import { InventoryPage } from "@/pages/InventoryPage"
import { LoginPage } from "@/pages/LoginPage"
import { MalinhaDetailPage } from "@/pages/MalinhaDetailPage"
import { MalinhasPage } from "@/pages/MalinhasPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { ProductsPage } from "@/pages/ProductsPage"
import { PurchaseOrdersPage } from "@/pages/PurchaseOrdersPage"
import { ReceivingPage } from "@/pages/ReceivingPage"
import { ReportsPage } from "@/pages/ReportsPage"
import { SetPasswordPage } from "@/pages/SetPasswordPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { SuppliersPage } from "@/pages/SuppliersPage"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/auth/set-password" element={<SetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/fornecedores" element={<SuppliersPage />} />
          <Route path="/colecoes" element={<CollectionsPage />} />
          <Route path="/colecoes/:collectionId/pedido-catalogo" element={<CatalogOrderPage />} />
          <Route path="/pedidos-compra" element={<PurchaseOrdersPage />} />
          <Route path="/recebimento" element={<ReceivingPage />} />
          <Route path="/produtos" element={<ProductsPage />} />
          <Route path="/estoque" element={<InventoryPage />} />
          <Route path="/malinha-amarelinha" element={<MalinhasPage />} />
          <Route path="/malinha-amarelinha/:malinhaId" element={<MalinhaDetailPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/clientes/:clienteId" element={<ClienteDetailPage />} />
          <Route path="/financeiro" element={<FinanceiroPage />} />
          <Route path="/relatorios" element={<ReportsPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
