import { AlertTriangle, Boxes, Package, PackageX, Wallet } from "lucide-react"

import { KpiCardGrid } from "@/components/shared/KpiCardGrid"
import { PageHeader } from "@/components/shared/PageHeader"
import { AlertsPanel } from "@/features/dashboard/components/AlertsPanel"
import { MalinhaKpiCards } from "@/features/dashboard/components/MalinhaKpiCards"
import { PurchasingKpiCards } from "@/features/dashboard/components/PurchasingKpiCards"
import { RecentActivity } from "@/features/dashboard/components/RecentActivity"
import { useProductsStore } from "@/features/products/store/productsStore"
import {
  formatBRL,
  semEstoque as isSemEstoque,
  temEstoqueBaixo,
  totalQuantidade,
  valorEstoque as valorEstoqueDoProduto,
} from "@/features/products/utils"

export function DashboardPage() {
  const products = useProductsStore((state) => state.products)

  const totalProdutos = products.length
  const totalPecas = products.reduce((sum, p) => sum + totalQuantidade(p), 0)
  const valorEstoque = products.reduce((sum, p) => sum + valorEstoqueDoProduto(p), 0)
  const estoqueBaixo = products.filter(temEstoqueBaixo).length
  const semEstoque = products.filter(isSemEstoque).length

  const cards = [
    { title: "Total de Produtos", value: totalProdutos, icon: Package },
    { title: "Total em Estoque", value: `${totalPecas} peças`, icon: Boxes },
    { title: "Valor do Estoque", value: formatBRL(valorEstoque), icon: Wallet },
    { title: "Estoque Baixo", value: estoqueBaixo, icon: AlertTriangle },
    { title: "Sem Estoque", value: semEstoque, icon: PackageX },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel"
        description="Visão geral do estoque, compras e atividade do negócio"
      />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Estoque</h2>
        <KpiCardGrid cards={cards} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Compras</h2>
        <PurchasingKpiCards />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Malinha Amarelinha e Clientes</h2>
        <MalinhaKpiCards />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AlertsPanel />
        <RecentActivity />
      </div>
    </div>
  )
}
