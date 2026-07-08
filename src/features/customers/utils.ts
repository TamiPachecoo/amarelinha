import type { Customer } from "@/features/customers/types"
import type { Product } from "@/features/products/types"
import type { Sale } from "@/features/sales/types"

/**
 * Saldo devedor é derivado, não armazenado: soma das vendas na conta do
 * cliente menos o histórico de pagamentos. Evita ter dois números que podem
 * divergir com o tempo (ver docs/DECISIONS.md).
 */
export function saldoDevedor(customer: Customer, sales: Sale[]): number {
  const totalContaCliente = sales
    .filter((sale) => sale.clienteId === customer.id && sale.formaPagamento === "conta_cliente")
    .reduce((sum, sale) => sum + sale.total, 0)

  const totalPago = customer.historicoPagamentos.reduce((sum, payment) => sum + payment.valor, 0)

  return Math.max(0, totalContaCliente - totalPago)
}

export function calcularIdade(dataNascimento: string): number {
  const nascimento = new Date(dataNascimento)
  const hoje = new Date()
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())
  if (aindaNaoFezAniversario) idade -= 1
  return Math.max(0, idade)
}

export interface CustomerStats {
  totalCompras: number
  valorTotalGasto: number
  ultimaCompra: string | null
  ticketMedio: number
  marcasFavoritas: string[]
  categoriasFavoritas: string[]
  numeroDeFilhos: number
}

function topEntries(counts: Record<string, number>, limit: number): string[] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key)
}

export function customerStats(customer: Customer, sales: Sale[], products: Product[]): CustomerStats {
  const customerSales = sales.filter((sale) => sale.clienteId === customer.id)

  const totalCompras = customerSales.length
  const valorTotalGasto = customerSales.reduce((sum, sale) => sum + sale.total, 0)
  const ticketMedio = totalCompras > 0 ? valorTotalGasto / totalCompras : 0
  const ultimaCompra =
    customerSales.length > 0
      ? customerSales.reduce((latest, sale) => (sale.data > latest ? sale.data : latest), customerSales[0].data)
      : null

  const marcaCounts: Record<string, number> = {}
  const categoriaCounts: Record<string, number> = {}
  for (const sale of customerSales) {
    const product = products.find((p) => p.id === sale.productId)
    if (!product) continue
    marcaCounts[product.marca] = (marcaCounts[product.marca] ?? 0) + sale.quantidade
    categoriaCounts[product.categoria] = (categoriaCounts[product.categoria] ?? 0) + sale.quantidade
  }

  return {
    totalCompras,
    valorTotalGasto,
    ultimaCompra,
    ticketMedio,
    marcasFavoritas: topEntries(marcaCounts, 3),
    categoriasFavoritas: topEntries(categoriaCounts, 3),
    numeroDeFilhos: customer.filhos.length,
  }
}
