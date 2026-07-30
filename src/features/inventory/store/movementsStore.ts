import { create } from "zustand"
import { supabase } from "@/services/supabase"

export type MovementType = "entrada" | "venda" | "ajuste" | "malinha"

export interface InventoryMovement {
  id: string
  variantId: string
  productId: string
  tipo: MovementType
  quantidade: number
  observacao?: string
  data: string
}

function fromRow(row: Record<string, unknown>): InventoryMovement {
  return {
    id: row.id as string,
    variantId: row.variant_id as string,
    productId: row.product_id as string,
    tipo: row.tipo as MovementType,
    quantidade: row.quantidade as number,
    observacao: (row.observacao as string) ?? undefined,
    data: row.data as string,
  }
}

interface MovementsState {
  movements: InventoryMovement[]
  fetchAll: () => Promise<void>
  addMovement: (input: Omit<InventoryMovement, "id" | "data">) => void
}

export const useMovementsStore = create<MovementsState>((set) => ({
  movements: [],
  fetchAll: async () => {
    const { data, error } = await supabase
      .from("inventory_movements")
      .select("*")
      .order("data", { ascending: false })
    if (error) {
      console.error("Failed to fetch inventory movements", error)
      return
    }
    set({ movements: (data ?? []).map(fromRow) })
  },
  addMovement: (input) => {
    const movement: InventoryMovement = {
      ...input,
      id: crypto.randomUUID(),
      data: new Date().toISOString(),
    }
    set((state) => ({ movements: [movement, ...state.movements] }))
    supabase
      .from("inventory_movements")
      .insert({
        id: movement.id,
        variant_id: movement.variantId,
        product_id: movement.productId,
        tipo: movement.tipo,
        quantidade: movement.quantidade,
        observacao: movement.observacao || null,
        data: movement.data,
      })
      .then(({ error }) => error && console.error("Failed to insert inventory movement", error))
  },
}))
