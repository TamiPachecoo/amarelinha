import type { FormaPagamentoFornecedor, PurchaseOrderPayment } from "@/features/financial/types"

type NewPayment = Omit<PurchaseOrderPayment, "id" | "purchaseOrderId" | "pago" | "dataPagamento">

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

interface AVistaInput {
  forma: "avista"
  valorTotal: number
  dataPedido: string
}

interface PrazoInput {
  forma: "prazo"
  valorTotal: number
  dataPedido: string
  entradaPercentual: number
  prazosDias: number[]
}

interface CartaoParceladoInput {
  forma: "cartao_parcelado"
  valorTotal: number
  dataPedido: string
  parcelas: number
}

interface BoletoInput {
  forma: "boleto"
  valorTotal: number
  dataPedido: string
  prazosDias: number[]
}

export type PaymentPlanInput = AVistaInput | PrazoInput | CartaoParceladoInput | BoletoInput

export function generatePaymentPlan(input: PaymentPlanInput): NewPayment[] {
  const forma: FormaPagamentoFornecedor = input.forma

  if (input.forma === "avista") {
    return [
      {
        formaPagamento: forma,
        numeroParcela: 1,
        totalParcelas: 1,
        valor: round2(input.valorTotal),
        dataVencimento: input.dataPedido,
      },
    ]
  }

  if (input.forma === "prazo") {
    const entrada = round2((input.valorTotal * input.entradaPercentual) / 100)
    const restante = round2(input.valorTotal - entrada)
    const parcelas = input.prazosDias.length
    const valorParcela = parcelas > 0 ? round2(restante / parcelas) : 0
    const totalParcelas = 1 + parcelas

    const payments: NewPayment[] = [
      {
        formaPagamento: forma,
        numeroParcela: 1,
        totalParcelas,
        valor: entrada,
        dataVencimento: input.dataPedido,
      },
    ]
    input.prazosDias.forEach((dias, index) => {
      payments.push({
        formaPagamento: forma,
        numeroParcela: index + 2,
        totalParcelas,
        valor: valorParcela,
        dataVencimento: addDays(input.dataPedido, dias),
      })
    })
    return payments
  }

  if (input.forma === "cartao_parcelado") {
    const valorParcela = round2(input.valorTotal / input.parcelas)
    return Array.from({ length: input.parcelas }, (_, index) => ({
      formaPagamento: forma,
      numeroParcela: index + 1,
      totalParcelas: input.parcelas,
      valor: valorParcela,
      dataVencimento: addDays(input.dataPedido, index * 30),
    }))
  }

  // boleto
  const parcelas = input.prazosDias.length
  const valorParcela = parcelas > 0 ? round2(input.valorTotal / parcelas) : 0
  return input.prazosDias.map((dias, index) => ({
    formaPagamento: forma,
    numeroParcela: index + 1,
    totalParcelas: parcelas,
    valor: valorParcela,
    dataVencimento: addDays(input.dataPedido, dias),
  }))
}
