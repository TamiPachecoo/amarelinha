import { z } from "zod"

export const childSchema = z.object({
  nome: z.string().min(1, "Informe o nome"),
  sexo: z.enum(["feminino", "masculino"]),
  dataNascimento: z.string().min(1, "Informe a data de nascimento"),
  tamanhoRoupa: z.string().min(1, "Informe o tamanho de roupa"),
  observacoes: z.string().optional(),
})

export type ChildFormValues = z.infer<typeof childSchema>
