import { AlertTriangle, Briefcase, CheckCircle2, PackageX } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMalinhasStore } from "@/features/malinhas/store/malinhasStore"
import { useProductsStore } from "@/features/products/store/productsStore"
import { semEstoque, temEstoqueBaixo } from "@/features/products/utils"
import { usePurchaseOrdersStore } from "@/features/purchasing/store/purchaseOrdersStore"

export function AlertsPanel() {
  const products = useProductsStore((state) => state.products)
  const orders = usePurchaseOrdersStore((state) => state.orders)
  const malinhas = useMalinhasStore((state) => state.malinhas)

  const estoqueBaixo = products.filter(temEstoqueBaixo).length
  const semEstoqueCount = products.filter(semEstoque).length
  const aguardandoRecebimento = orders.filter(
    (o) => o.status === "confirmado" || o.status === "parcialmente_recebido"
  ).length
  const hoje = new Date().toISOString().slice(0, 10)
  const malinhasAtrasadas = malinhas.filter(
    (m) => m.status === "com_cliente" && m.previsaoDevolucao && m.previsaoDevolucao < hoje
  ).length

  const alerts = [
    estoqueBaixo > 0 && {
      icon: AlertTriangle,
      text: `${estoqueBaixo} produto(s) com estoque baixo`,
    },
    semEstoqueCount > 0 && {
      icon: PackageX,
      text: `${semEstoqueCount} produto(s) sem estoque`,
    },
    aguardandoRecebimento > 0 && {
      icon: AlertTriangle,
      text: `${aguardandoRecebimento} pedido(s) aguardando recebimento`,
    },
    malinhasAtrasadas > 0 && {
      icon: Briefcase,
      text: `${malinhasAtrasadas} malinha(s) com devolução atrasada`,
    },
  ].filter(Boolean) as { icon: typeof AlertTriangle; text: string }[]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Alertas</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-brand-green" />
            Tudo em dia por aqui.
          </p>
        ) : (
          <ul className="space-y-2">
            {alerts.map((alert) => (
              <li key={alert.text} className="flex items-center gap-2 text-sm text-foreground">
                <alert.icon className="size-4 shrink-0 text-brand-yellow" />
                {alert.text}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
