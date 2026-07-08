import { AlertTriangle, Boxes, Package, PackageX, Wallet } from "lucide-react"

import { KpiCardGrid } from "@/components/shared/KpiCardGrid"
import type { Product } from "@/features/products/types"
import {
  formatBRL,
  semEstoque,
  temEstoqueBaixo,
  totalQuantidade,
  valorEstoque,
} from "@/features/products/utils"

interface InventoryDashboardCardsProps {
  products: Product[]
}

export function InventoryDashboardCards({ products }: InventoryDashboardCardsProps) {
  const cards = [
    {
      title: "Valor Total do Estoque",
      value: formatBRL(products.reduce((sum, p) => sum + valorEstoque(p), 0)),
      icon: Wallet,
    },
    { title: "Total de Produtos", value: products.length, icon: Package },
    {
      title: "Total de Peças",
      value: products.reduce((sum, p) => sum + totalQuantidade(p), 0),
      icon: Boxes,
    },
    {
      title: "Produtos com Estoque Baixo",
      value: products.filter(temEstoqueBaixo).length,
      icon: AlertTriangle,
    },
    {
      title: "Produtos sem Estoque",
      value: products.filter(semEstoque).length,
      icon: PackageX,
    },
  ]

  return <KpiCardGrid cards={cards} />
}
