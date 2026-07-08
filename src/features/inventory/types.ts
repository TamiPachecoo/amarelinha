export type InventoryRowStatus = "sem_estoque" | "baixo" | "ok"

export interface InventoryRow {
  productId: string
  variantId: string
  foto?: string
  produto: string
  marca: string
  categoria: string
  variante: string
  cor: string
  tamanho: string
  localizacaoId: string
  localizacao: string
  quantidade: number
  estoqueMinimo: number
  status: InventoryRowStatus
}
