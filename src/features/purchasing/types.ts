export type PurchaseOrderStatus =
  | "rascunho"
  | "enviado"
  | "confirmado"
  | "parcialmente_recebido"
  | "recebido"
  | "cancelado"

/**
 * Origem do pedido — o seio da abstração do futuro Assistente de Compras.
 * Hoje só "manual" é suportado; PDF/site/Excel viram outros criadores de
 * PurchaseOrder no futuro, sem mudar o restante do módulo de compras.
 */
export type OrderOrigin = "manual" | "pdf" | "site" | "excel"

export interface PurchaseOrderItem {
  id: string
  codigoFornecedor: string
  nome: string
  categoria: string
  marca: string
  cor: string
  tamanho: string
  quantidadePedida: number
  quantidadeRecebida: number
  custoUnitario: number
  precoVenda: number
  /** Recorte da foto do catálogo (data URL), quando o item vem do Workflow A (PDF). */
  foto?: string
  productId?: string
  variantId?: string
}

export interface PurchaseOrder {
  id: string
  numero: string
  supplierId: string
  collectionId?: string
  status: PurchaseOrderStatus
  origem: OrderOrigin
  dataPedido: string
  previsaoEntrega?: string
  notaFiscal?: string
  frete: number
  desconto: number
  observacoes?: string
  itens: PurchaseOrderItem[]
  createdAt: string
}

export const purchaseOrderStatusLabel: Record<PurchaseOrderStatus, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  confirmado: "Confirmado",
  parcialmente_recebido: "Parcialmente Recebido",
  recebido: "Recebido",
  cancelado: "Cancelado",
}
