export type FormaPagamentoFornecedor = "avista" | "prazo" | "cartao_parcelado" | "boleto"

export const formaPagamentoFornecedorLabel: Record<FormaPagamentoFornecedor, string> = {
  avista: "À Vista",
  prazo: "A Prazo (entrada + parcelas)",
  cartao_parcelado: "Cartão Parcelado",
  boleto: "Boleto",
}

export interface PurchaseOrderPayment {
  id: string
  purchaseOrderId: string
  formaPagamento: FormaPagamentoFornecedor
  numeroParcela: number
  totalParcelas: number
  valor: number
  dataVencimento: string
  pago: boolean
  dataPagamento?: string
}

/** Prazos de parcelamento em dias, usados no plano "a prazo". */
export const PRAZOS_DIAS = [30, 60, 90, 120, 180] as const
