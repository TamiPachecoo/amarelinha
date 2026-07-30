import { z } from "zod"

export const stockAdjustmentSchema = z.object({
  tipo: z.enum(["entrada", "ajuste"]),
  quantidade: z.coerce.number().int().min(1, "Informe uma quantidade maior que zero"),
  observacao: z.string().optional(),
})

export type StockAdjustmentInput = z.input<typeof stockAdjustmentSchema>
export type StockAdjustmentValues = z.output<typeof stockAdjustmentSchema>
