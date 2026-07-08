import { create } from "zustand"

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

interface MovementsState {
  movements: InventoryMovement[]
  addMovement: (input: Omit<InventoryMovement, "id" | "data">) => void
}

export const useMovementsStore = create<MovementsState>((set) => ({
  movements: [],
  addMovement: (input) =>
    set((state) => ({
      movements: [
        { ...input, id: crypto.randomUUID(), data: new Date().toISOString() },
        ...state.movements,
      ],
    })),
}))
