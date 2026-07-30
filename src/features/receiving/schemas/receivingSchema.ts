import { z } from "zod"

export function makeReceivingSchema(maxPendente: number) {
  return z
    .object({
      quantidadeRecebida: z.coerce
        .number()
        .int()
        .min(1, "Informe uma quantidade válida")
        .max(maxPendente, `Máximo pendente: ${maxPendente}`),
      quantidadeAvariada: z.coerce.number().int().min(0, "Informe um valor válido"),
      localizacaoId: z.string().min(1, "Selecione onde este item vai ficar na loja"),
      observacao: z.string().optional(),
    })
    .refine((data) => data.quantidadeAvariada <= data.quantidadeRecebida, {
      message: "A quantidade avariada não pode ser maior que a recebida",
      path: ["quantidadeAvariada"],
    })
}

export type ReceivingFormInput = z.input<ReturnType<typeof makeReceivingSchema>>
export type ReceivingFormValues = z.output<ReturnType<typeof makeReceivingSchema>>
