import { z } from "zod"

export const productSchema = z.object({
  nome: z.string().min(2, "Informe o nome do produto"),
  sku: z.string().min(1, "Informe o SKU"),
  categoria: z.string().min(1, "Informe a categoria"),
  marca: z.string().min(1, "Informe a marca"),
  precoVenda: z.coerce.number().min(0.01, "Informe um preço válido"),
  custo: z.coerce.number().min(0, "Informe um custo válido"),
  cor: z.string().min(1, "Informe a cor"),
  tamanho: z.string().min(1, "Informe o tamanho"),
  localizacaoId: z.string().min(1, "Selecione a localização"),
  quantidade: z.coerce.number().int().min(0, "Informe uma quantidade válida"),
  estoqueMinimo: z.coerce.number().int().min(0, "Informe um estoque mínimo válido"),
  foto: z.string().optional(),
})

export type ProductFormInput = z.input<typeof productSchema>
export type ProductFormValues = z.output<typeof productSchema>
