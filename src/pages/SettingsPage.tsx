import { Settings } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"

export function SettingsPage() {
  return (
    <div>
      <PageHeader title="Configurações" description="Preferências da conta e da loja" />
      <EmptyState
        icon={Settings}
        title="Configurações em breve"
        description="Categorias, marcas, coleções e localizações personalizadas serão gerenciadas aqui."
      />
    </div>
  )
}
