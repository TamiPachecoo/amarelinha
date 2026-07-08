import { z } from "zod"

export const paymentSchema = z.object({
  valor: z.coerce.number().min(0.01, "Informe um valor válido"),
  data: z.string().min(1, "Informe a data"),
  observacao: z.string().optional(),
})

export type PaymentFormInput = z.input<typeof paymentSchema>
export type PaymentFormValues = z.output<typeof paymentSchema>
