import { differenceInDays, endOfMonth, format, parseISO, startOfMonth, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Product } from "@/features/products/types"
import type { Sale } from "@/features/sales/types"
import type { Customer } from "@/features/customers/types"
import type { PurchaseOrderPayment } from "@/features/financial/types"
import { despesaNoPeriodo, receitaNoPeriodo } from "@/features/financial/utils"
import { investimentoEstoque, totalQuantidade, valorEstoque } from "@/features/products/utils"

export interface MonthlyFinancials {
  mes: string
  receita: number
  despesas: number
  saldo: number
}

export function monthlyFinancialSeries(
  sales: Sale[],
  payments: PurchaseOrderPayment[],
  months = 12
): MonthlyFinancials[] {
  return Array.from({ length: months }, (_, index) => {
    const date = subMonths(new Date(), months - 1 - index)
    const period = { start: startOfMonth(date), end: endOfMonth(date) }
    const receita = receitaNoPeriodo(sales, period)
    const despesas = despesaNoPeriodo(payments, period)
    return {
      mes: format(date, "MMM/yy", { locale: ptBR }),
      receita,
      despesas,
      saldo: receita - despesas,
    }
  })
}

export interface CategoriaStock {
  categoria: string
  quantidade: number
  valorCusto: number
  valorVenda: number
}

export function stockByCategoria(products: Product[]): CategoriaStock[] {
  const map = new Map<string, CategoriaStock>()
  for (const product of products) {
    const entry = map.get(product.categoria) ?? {
      categoria: product.categoria,
      quantidade: 0,
      valorCusto: 0,
      valorVenda: 0,
    }
    entry.quantidade += totalQuantidade(product)
    entry.valorCusto += investimentoEstoque(product)
    entry.valorVenda += valorEstoque(product)
    map.set(product.categoria, entry)
  }
  return Array.from(map.values()).sort((a, b) => b.valorVenda - a.valorVenda)
}

export type GiroStatus = "parado" | "lento" | "girando"

export interface ProductLifespan {
  productId: string
  nome: string
  categoria: string
  marca: string
  createdAt: string
  diasEmEstoque: number
  quantidadeAtual: number
  quantidadeVendida: number
  ultimaVenda?: string
  status: GiroStatus
}

/** Classifica o giro do produto: parado (nunca vendeu e está há mais de 60 dias em estoque),
 *  lento (vendeu, mas pouco em relação ao tempo em estoque) ou girando bem. */
function classifyGiro(diasEmEstoque: number, quantidadeVendida: number): GiroStatus {
  if (quantidadeVendida === 0) {
    return diasEmEstoque > 60 ? "parado" : "lento"
  }
  const vendaPorDia = quantidadeVendida / Math.max(diasEmEstoque, 1)
  return vendaPorDia >= 0.05 ? "girando" : "lento"
}

export function productLifespanReport(products: Product[], sales: Sale[]): ProductLifespan[] {
  const now = new Date()
  return products.map((product) => {
    const vendasDoProduto = sales.filter((sale) => sale.productId === product.id)
    const quantidadeVendida = vendasDoProduto.reduce((sum, sale) => sum + sale.quantidade, 0)
    const ultimaVenda = vendasDoProduto
      .map((sale) => sale.data)
      .sort()
      .at(-1)
    const diasEmEstoque = Math.max(0, differenceInDays(now, parseISO(product.createdAt)))

    return {
      productId: product.id,
      nome: product.nome,
      categoria: product.categoria,
      marca: product.marca,
      createdAt: product.createdAt,
      diasEmEstoque,
      quantidadeAtual: totalQuantidade(product),
      quantidadeVendida,
      ultimaVenda,
      status: classifyGiro(diasEmEstoque, quantidadeVendida),
    }
  })
}

export const giroStatusLabel: Record<GiroStatus, string> = {
  parado: "Parado",
  lento: "Giro Lento",
  girando: "Girando Bem",
}

export interface PromoSale {
  saleId: string
  productId: string
  productNome: string
  clienteNome: string
  data: string
  quantidade: number
  precoOriginal: number
  precoVendido: number
  descontoPercentual: number
  total: number
}

export function produtosParados(products: Product[], sales: Sale[], minDias = 60): ProductLifespan[] {
  return productLifespanReport(products, sales).filter(
    (row) => row.diasEmEstoque >= minDias && row.quantidadeAtual > 0
  )
}

export function promoSalesReport(sales: Sale[], products: Product[], customers: Customer[]): PromoSale[] {
  return sales
    .filter((sale) => sale.emPromocao)
    .map((sale) => {
      const product = products.find((p) => p.id === sale.productId)
      const customer = customers.find((c) => c.id === sale.clienteId)
      const precoOriginal = product?.precoVenda ?? sale.precoUnitario
      const descontoPercentual =
        precoOriginal > 0 ? ((precoOriginal - sale.precoUnitario) / precoOriginal) * 100 : 0
      return {
        saleId: sale.id,
        productId: sale.productId,
        productNome: product?.nome ?? "—",
        clienteNome: customer?.nomeCompleto ?? "—",
        data: sale.data,
        quantidade: sale.quantidade,
        precoOriginal,
        precoVendido: sale.precoUnitario,
        descontoPercentual,
        total: sale.total,
      }
    })
    .sort((a, b) => (a.data < b.data ? 1 : -1))
}
