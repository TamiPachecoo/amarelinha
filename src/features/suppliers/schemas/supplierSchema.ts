import { z } from "zod"

export const supplierSchema = z.object({
  nome: z.string().min(2, "Informe o nome do fornecedor"),
  contatoNome: z.string().optional(),
  whatsapp: z.string().min(8, "Informe um WhatsApp válido"),
  email: z.string().email("E-mail inválido").or(z.literal("")).optional(),
  instagram: z.string().optional(),
  website: z.string().optional(),
  condicoesPagamento: z.string().min(1, "Informe as condições de pagamento"),
  leadTimeDias: z.coerce.number().int().min(0, "Informe um lead time válido"),
  observacoes: z.string().optional(),
  ativo: z.boolean(),
})

export type SupplierFormInput = z.input<typeof supplierSchema>
export type SupplierFormValues = z.output<typeof supplierSchema>
