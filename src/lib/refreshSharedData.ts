import { useCollectionsStore } from "@/features/collections/store/collectionsStore"
import { useCustomersStore } from "@/features/customers/store/customersStore"
import { usePaymentsStore } from "@/features/financial/store/paymentsStore"
import { useLocationsStore } from "@/features/locations/store/locationsStore"
import { useMalinhasStore } from "@/features/malinhas/store/malinhasStore"
import { useMovementsStore } from "@/features/inventory/store/movementsStore"
import { useProductsStore } from "@/features/products/store/productsStore"
import { usePurchaseOrdersStore } from "@/features/purchasing/store/purchaseOrdersStore"
import { useSalesStore } from "@/features/sales/store/salesStore"
import { useSuppliersStore } from "@/features/suppliers/store/suppliersStore"
import { useDiagnosticsStore } from "@/features/auth/store/diagnosticsStore"
import { supabase } from "@/services/supabase"

export function clearSharedDataState() {
  useProductsStore.setState({ products: [] })
  useSuppliersStore.setState({ suppliers: [] })
  useCollectionsStore.setState({ collections: [] })
  usePurchaseOrdersStore.setState({ orders: [] })
  useLocationsStore.setState({ locations: [] })
  useMovementsStore.setState({ movements: [] })
  useCustomersStore.setState({ customers: [] })
  useMalinhasStore.setState({ malinhas: [] })
  useSalesStore.setState({ sales: [] })
  usePaymentsStore.setState({ payments: [] })
  useDiagnosticsStore.getState().setLastSuccessfulInventoryRefresh(null)
}

export async function refreshSharedData() {
  const setLastSuccessfulInventoryRefresh = useDiagnosticsStore.getState().setLastSuccessfulInventoryRefresh
  const sessionResponse = await supabase.auth.getSession()
  const session = sessionResponse.data.session

  if (!session) {
    clearSharedDataState()
    return
  }

  setLastSuccessfulInventoryRefresh(null)

  const refreshTasks = [
    useSuppliersStore.getState().fetchAll(),
    useCollectionsStore.getState().fetchAll(),
    usePurchaseOrdersStore.getState().fetchAll(),
    useProductsStore.getState().fetchAll(),
    useLocationsStore.getState().fetchAll(),
    useMovementsStore.getState().fetchAll(),
    useCustomersStore.getState().fetchAll(),
    useMalinhasStore.getState().fetchAll(),
    useSalesStore.getState().fetchAll(),
    usePaymentsStore.getState().fetchAll(),
  ]

  const results = await Promise.allSettled(refreshTasks)
  const failures = results.filter((result) => result.status === "rejected")

  if (failures.length > 0) {
    console.error("One or more shared data refreshes failed", failures)
  }

  setLastSuccessfulInventoryRefresh(new Date().toISOString())
}
