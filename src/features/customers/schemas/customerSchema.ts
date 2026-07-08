import { z } from "zod"

export const addressSchema = z.object({
  cep: z.string().min(1, "Informe o CEP"),
  logradouro: z.string().min(1, "Informe o logradouro"),
  numero: z.string().min(1, "Informe o número"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Informe o bairro"),
  cidade: z.string().min(1, "Informe a cidade"),
  estado: z.string().min(2, "Informe o estado").max(2, "Use a sigla, ex: MG"),
})

export const customerSchema = z.object({
  nomeCompleto: z.string().min(2, "Informe o nome completo"),
  telefone: z.string().min(8, "Informe um telefone válido"),
  whatsapp: z.string().min(8, "Informe um WhatsApp válido"),
  email: z.string().email("E-mail inválido").or(z.literal("")),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  cpf: z.string().optional(),
  endereco: addressSchema,
  observacoes: z.string().optional(),
  ativo: z.boolean(),
  limiteCredito: z.coerce.number().min(0, "Informe um limite válido"),
  dataVencimento: z.string().min(1, "Informe a data de vencimento"),
})

export type CustomerFormInput = z.input<typeof customerSchema>
export type CustomerFormValues = z.output<typeof customerSchema>
