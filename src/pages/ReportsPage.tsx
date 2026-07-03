import { BarChart3 } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"

export function ReportsPage() {
  return (
    <div>
      <PageHeader title="Relatórios" description="Indicadores do seu negócio" />
      <EmptyState
        icon={BarChart3}
        title="Relatórios em breve"
        description="Produtos sem estoque, abaixo do mínimo, valor do estoque e movimentações recentes."
      />
    </div>
  )
}
