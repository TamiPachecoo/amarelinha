import { useMemo, useState } from "react"

import { PageHeader } from "@/components/shared/PageHeader"
import { InventoryDashboardCards } from "@/features/inventory/components/InventoryDashboardCards"
import { InventoryTable } from "@/features/inventory/components/InventoryTable"
import { StockAdjustmentDialog } from "@/features/inventory/components/StockAdjustmentDialog"
import type { InventoryRow } from "@/features/inventory/types"
import { buildInventoryRows } from "@/features/inventory/utils"
import { useLocationsStore } from "@/features/locations/store/locationsStore"
import { useProductsStore } from "@/features/products/store/productsStore"

export function InventoryPage() {
  const products = useProductsStore((state) => state.products)
  const locations = useLocationsStore((state) => state.locations)
  const [adjustingRow, setAdjustingRow] = useState<InventoryRow | null>(null)

  const rows = useMemo(() => buildInventoryRows(products, locations), [products, locations])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque"
        description="Visão geral, busca e movimentações de estoque por variante"
      />

      <InventoryDashboardCards products={products} />

      <InventoryTable rows={rows} onAdjust={setAdjustingRow} />

      <StockAdjustmentDialog row={adjustingRow} onOpenChange={(open) => !open && setAdjustingRow(null)} />
    </div>
  )
}
