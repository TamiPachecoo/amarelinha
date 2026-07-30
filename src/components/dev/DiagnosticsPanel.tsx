import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/features/auth/store/authStore"
import { useDiagnosticsStore } from "@/features/auth/store/diagnosticsStore"
import { useProductsStore } from "@/features/products/store/productsStore"

export function DiagnosticsPanel() {
  const user = useAuthStore((state) => state.user)
  const products = useProductsStore((state) => state.products)
  const lastSuccessfulInventoryRefresh = useDiagnosticsStore(
    (state) => state.lastSuccessfulInventoryRefresh
  )

  const isEnabled = import.meta.env.DEV && import.meta.env.VITE_SHOW_DIAGNOSTICS === "true"

  if (!isEnabled) {
    return null
  }

  return (
    <Card className="mb-4 border-dashed border-amber-500/50 bg-amber-50/70 text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-xs">
        <div>Project ID: {import.meta.env.VITE_SUPABASE_URL?.split("//")[1]?.split(".")[0] ?? "—"}</div>
        <div>Email: {user?.email ?? "—"}</div>
        <div>User UUID: {user?.id ?? "—"}</div>
        <div>Loaded products: {products.length}</div>
        <div>Last refresh: {lastSuccessfulInventoryRefresh ?? "—"}</div>
      </CardContent>
    </Card>
  )
}
