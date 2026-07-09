import { useEffect } from "react"
import { Outlet } from "react-router-dom"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { TopNav } from "@/components/layout/TopNav"
import { useSuppliersStore } from "@/features/suppliers/store/suppliersStore"
import { useCollectionsStore } from "@/features/collections/store/collectionsStore"
import { usePurchaseOrdersStore } from "@/features/purchasing/store/purchaseOrdersStore"
import { useProductsStore } from "@/features/products/store/productsStore"
import { useLocationsStore } from "@/features/locations/store/locationsStore"
import { useMovementsStore } from "@/features/inventory/store/movementsStore"
import { useCustomersStore } from "@/features/customers/store/customersStore"
import { useMalinhasStore } from "@/features/malinhas/store/malinhasStore"
import { useSalesStore } from "@/features/sales/store/salesStore"
import { usePaymentsStore } from "@/features/financial/store/paymentsStore"

export function AppLayout() {
  useEffect(() => {
    useSuppliersStore.getState().fetchAll()
    useCollectionsStore.getState().fetchAll()
    usePurchaseOrdersStore.getState().fetchAll()
    useProductsStore.getState().fetchAll()
    useLocationsStore.getState().fetchAll()
    useMovementsStore.getState().fetchAll()
    useCustomersStore.getState().fetchAll()
    useMalinhasStore.getState().fetchAll()
    useSalesStore.getState().fetchAll()
    usePaymentsStore.getState().fetchAll()
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopNav />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
