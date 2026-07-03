import { Warehouse } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"

export function InventoryPage() {
  return (
    <div>
      <PageHeader
        title="Estoque"
        description="Entradas, vendas e ajustes de estoque"
      />
      <EmptyState
        icon={Warehouse}
        title="Movimentações de estoque em breve"
        description="Entrada, venda e ajuste manual, com histórico completo por variante e localização física."
      />
    </div>
  )
}
