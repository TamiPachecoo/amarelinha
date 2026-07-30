import { z } from "zod"

export const collectionSchema = z.object({
  supplierId: z.string().min(1, "Selecione o fornecedor"),
  nome: z.string().min(2, "Informe o nome da coleção"),
  temporada: z.string().min(1, "Informe a temporada"),
  ano: z.coerce.number().int().min(2020, "Informe um ano válido"),
  status: z.enum(["planejada", "ativa", "encerrada"]),
  dataImportacao: z.string().optional(),
})

export type CollectionFormInput = z.input<typeof collectionSchema>
export type CollectionFormValues = z.output<typeof collectionSchema>
