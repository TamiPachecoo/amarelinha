export type MalinhaStatus = "preparando" | "com_cliente" | "fechada"

export const malinhaStatusLabel: Record<MalinhaStatus, string> = {
  preparando: "Preparando",
  com_cliente: "Com Cliente",
  fechada: "Fechada",
}

export interface MalinhaItem {
  id: string
  productId: string
  variantId: string
  /** Quantidade enviada ao cliente. */
  quantidade: number
  /** Preenchidos no fechamento da malinha. */
  quantidadeVendida: number
  quantidadeDevolvida: number
}

export interface Malinha {
  id: string
  numero: string
  clienteId: string
  status: MalinhaStatus
  dataPreparo: string
  dataEnvio?: string
  previsaoDevolucao?: string
  dataDevolucao?: string
  itens: MalinhaItem[]
  observacoes?: string
  createdAt: string
}
