import { Package } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"

export function ProductsPage() {
  return (
    <div>
      <PageHeader title="Produtos" description="Gerencie seu catálogo de produtos" />
      <EmptyState
        icon={Package}
        title="Cadastro de produtos em breve"
        description="Nome, SKU, categoria, marca, coleção, preços, fotos e variantes serão construídos no próximo milestone."
      />
    </div>
  )
}
