export type FormaPagamento = "pix" | "dinheiro" | "cartao" | "conta_cliente"

export interface Sale {
  id: string
  clienteId: string
  productId: string
  variantId: string
  quantidade: number
  precoUnitario: number
  total: number
  formaPagamento: FormaPagamento
  data: string
  /** Referência à Malinha Amarelinha, quando a venda vem de um fechamento
   *  de malinha (o estoque já foi baixado no envio, não de novo aqui). */
  malinhaId?: string
  /** Marca que este item foi vendido com desconto/promoção, para o
   *  relatório de "o que foi para promoção e por quanto". */
  emPromocao: boolean
}

/** Multi-item direct sales share the first four UUID blocks. Legacy and
 * single-item sales naturally form a group containing only themselves. */
export function saleGroupKey(saleId: string): string {
  return saleId.slice(0, 24)
}

export const formaPagamentoLabel: Record<FormaPagamento, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  conta_cliente: "Conta do Cliente",
}
