import { z } from "zod"

export const purchaseOrderItemSchema = z.object({
  codigoFornecedor: z.string().min(1, "Informe o código do fornecedor"),
  nome: z.string().min(1, "Informe o nome do produto"),
  categoria: z.string().min(1, "Informe a categoria"),
  marca: z.string().min(1, "Informe a marca"),
  cor: z.string().min(1, "Informe a cor"),
  tamanho: z.string().min(1, "Informe o tamanho"),
  quantidadePedida: z.coerce.number().int().min(1, "Informe uma quantidade válida"),
  custoUnitario: z.coerce.number().min(0.01, "Informe um custo válido"),
  precoVenda: z.coerce.number().min(0.01, "Informe um preço de venda válido"),
  foto: z.string().optional(),
})

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Selecione o fornecedor"),
  collectionId: z.string().optional(),
  dataPedido: z.string().min(1, "Informe a data do pedido"),
  previsaoEntrega: z.string().optional(),
  notaFiscal: z.string().optional(),
  frete: z.coerce.number().min(0, "Informe um valor válido"),
  desconto: z.coerce.number().min(0, "Informe um valor válido"),
  observacoes: z.string().optional(),
  itens: z.array(purchaseOrderItemSchema).min(1, "Adicione ao menos um item"),
})

export type PurchaseOrderFormInput = z.input<typeof purchaseOrderSchema>
export type PurchaseOrderFormValues = z.output<typeof purchaseOrderSchema>
export type PurchaseOrderItemFormValues = z.output<typeof purchaseOrderItemSchema>
