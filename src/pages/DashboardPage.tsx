import { LayoutDashboard } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"

export function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Painel"
        description="Visão geral do seu estoque e vendas"
      />
      <EmptyState
        icon={LayoutDashboard}
        title="Os cards do painel chegam no próximo milestone"
        description="Total de produtos, valor do estoque, estoque baixo e atividades recentes vão aparecer aqui assim que os produtos forem cadastrados."
      />
    </div>
  )
}
