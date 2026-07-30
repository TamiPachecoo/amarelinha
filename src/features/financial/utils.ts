import { isWithinInterval, parseISO } from "date-fns"
import type { PurchaseOrderPayment } from "@/features/financial/types"
import type { Sale } from "@/features/sales/types"

export interface Period {
  start: Date
  end: Date
}

function inPeriod(dateStr: string, period: Period): boolean {
  return isWithinInterval(parseISO(dateStr), { start: period.start, end: period.end })
}

export function receitaNoPeriodo(sales: Sale[], period: Period): number {
  return sales.filter((sale) => inPeriod(sale.data, period)).reduce((sum, sale) => sum + sale.total, 0)
}

export function despesaNoPeriodo(payments: PurchaseOrderPayment[], period: Period): number {
  return payments
    .filter((payment) => inPeriod(payment.dataVencimento, period))
    .reduce((sum, payment) => sum + payment.valor, 0)
}

export function saldoNoPeriodo(sales: Sale[], payments: PurchaseOrderPayment[], period: Period): number {
  return receitaNoPeriodo(sales, period) - despesaNoPeriodo(payments, period)
}

export function isVencidoNaoPago(payment: PurchaseOrderPayment): boolean {
  if (payment.pago) return false
  return parseISO(payment.dataVencimento) < new Date(new Date().toDateString())
}
