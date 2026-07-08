import { z } from "zod"

export const saleSchema = z.object({
  clienteId: z.string().min(1, "Selecione o cliente"),
  productId: z.string().min(1, "Selecione o produto"),
  variantId: z.string().min(1, "Selecione a variante"),
  quantidade: z.coerce.number().int().min(1, "Informe uma quantidade válida"),
  formaPagamento: z.enum(["pix", "dinheiro", "cartao", "conta_cliente"]),
})

export type SaleFormInput = z.input<typeof saleSchema>
export type SaleFormValues = z.output<typeof saleSchema>
