import { endOfMonth, startOfMonth } from "date-fns"
import { AlertTriangle, Boxes, Package, PackageX, TrendingDown, TrendingUp, Wallet } from "lucide-react"

import { KpiCardGrid } from "@/components/shared/KpiCardGrid"
import { PageHeader } from "@/components/shared/PageHeader"
import { AlertsPanel } from "@/features/dashboard/components/AlertsPanel"
import { MalinhaKpiCards } from "@/features/dashboard/components/MalinhaKpiCards"
import { PurchasingKpiCards } from "@/features/dashboard/components/PurchasingKpiCards"
import { RecentActivity } from "@/features/dashboard/components/RecentActivity"
import { useProductsStore } from "@/features/products/store/productsStore"
import { useSalesStore } from "@/features/sales/store/salesStore"
import { usePaymentsStore } from "@/features/financial/store/paymentsStore"
import { despesaNoPeriodo, receitaNoPeriodo } from "@/features/financial/utils"
import {
  formatBRL,
  investimentoEstoque as investimentoEstoqueDoProduto,
  semEstoque as isSemEstoque,
  temEstoqueBaixo,
  totalQuantidade,
  valorEstoque as valorEstoqueDoProduto,
} from "@/features/products/utils"

export function DashboardPage() {
  const products = useProductsStore((state) => state.products)
  const sales = useSalesStore((state) => state.sales)
  const payments = usePaymentsStore((state) => state.payments)

  const periodoMesAtual = { start: startOfMonth(new Date()), end: endOfMonth(new Date()) }
  const receitaMes = receitaNoPeriodo(sales, periodoMesAtual)
  const despesaMes = despesaNoPeriodo(payments, periodoMesAtual)
  const saldoMes = receitaMes - despesaMes

  const financialCards = [
    { title: "Receita do Mês", value: formatBRL(receitaMes), icon: TrendingUp, accent: "green" as const },
    { title: "Despesas do Mês", value: formatBRL(despesaMes), icon: TrendingDown, accent: "pink" as const },
    { title: "Saldo do Mês", value: formatBRL(saldoMes), icon: Wallet, accent: "yellow" as const },
  ]

  const totalProdutos = products.length
  const totalPecas = products.reduce((sum, p) => sum + totalQuantidade(p), 0)
  const valorEstoque = products.reduce((sum, p) => sum + valorEstoqueDoProduto(p), 0)
  const custoEstoque = products.reduce((sum, p) => sum + investimentoEstoqueDoProduto(p), 0)
  const estoqueBaixo = products.filter(temEstoqueBaixo).length
  const semEstoque = products.filter(isSemEstoque).length

  const cards = [
    { title: "Total de Produtos", value: totalProdutos, icon: Package, accent: "blue" as const },
    { title: "Total em Estoque", value: `${totalPecas} peças`, icon: Boxes, accent: "blue" as const },
    {
      title: "Valor de Custo do Estoque",
      value: formatBRL(custoEstoque),
      icon: Wallet,
      accent: "aqua" as const,
    },
    {
      title: "Valor de Venda do Estoque",
      value: formatBRL(valorEstoque),
      icon: Wallet,
      accent: "aqua" as const,
    },
    { title: "Estoque Baixo", value: estoqueBaixo, icon: AlertTriangle, accent: "yellow" as const },
    { title: "Sem Estoque", value: semEstoque, icon: PackageX, accent: "pink" as const },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel ✨"
        description="Visão geral do estoque, compras e atividade do negócio"
      />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">📦 Estoque</h2>
        <KpiCardGrid cards={cards} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">🛍️ Compras</h2>
        <PurchasingKpiCards />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">🧡 Malinha Amarelinha e Clientes</h2>
        <MalinhaKpiCards />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">💰 Saúde Financeira</h2>
        <KpiCardGrid cards={financialCards} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AlertsPanel />
        <RecentActivity />
      </div>
    </div>
  )
}
