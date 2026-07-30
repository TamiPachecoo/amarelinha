import { supabase } from "@/services/supabase"
import { refreshSharedData } from "@/lib/refreshSharedData"

const tables = [
  "products",
  "product_variants",
  "inventory_movements",
  "sales",
  "customers",
  "children",
  "payment_records",
  "suppliers",
  "collections",
  "purchase_orders",
  "purchase_order_items",
  "malinhas",
  "malinha_itens",
  "locations",
]

export function setupRealtimeSync() {
  const channel = supabase.channel("inventory-shared-sync")

  tables.forEach((table) => {
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
      },
      () => {
        void refreshSharedData()
      }
    )
  })

  channel.subscribe()

  return () => {
    void channel.unsubscribe()
  }
}
