import { z } from "zod"

export const createMalinhaSchema = z.object({
  clienteId: z.string().min(1, "Selecione o cliente"),
  previsaoDevolucao: z.string().optional(),
  observacoes: z.string().optional(),
})

export type CreateMalinhaFormValues = z.infer<typeof createMalinhaSchema>

export function makeAddMalinhaItemSchema(maxQuantidade: number) {
  return z.object({
    productId: z.string().min(1, "Selecione o produto"),
    variantId: z.string().min(1, "Selecione a variante"),
    quantidade: z.coerce
      .number()
      .int()
      .min(1, "Informe uma quantidade válida")
      .max(maxQuantidade, `Estoque disponível: ${maxQuantidade}`),
  })
}

export type AddMalinhaItemFormInput = z.input<ReturnType<typeof makeAddMalinhaItemSchema>>
export type AddMalinhaItemFormValues = z.output<ReturnType<typeof makeAddMalinhaItemSchema>>
