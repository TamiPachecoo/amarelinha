import { ClipboardList, PackageCheck, Truck, Wallet } from "lucide-react"

import { KpiCardGrid } from "@/components/shared/KpiCardGrid"
import { formatBRL } from "@/features/products/utils"
import { usePurchaseOrdersStore } from "@/features/purchasing/store/purchaseOrdersStore"
import { orderTotal } from "@/features/purchasing/utils"
import { useSuppliersStore } from "@/features/suppliers/store/suppliersStore"

const OPEN_STATUSES = ["rascunho", "enviado", "confirmado", "parcialmente_recebido"]
const AWAITING_RECEIVING_STATUSES = ["confirmado", "parcialmente_recebido"]

export function PurchasingKpiCards() {
  const orders = usePurchaseOrdersStore((state) => state.orders)
  const suppliers = useSuppliersStore((state) => state.suppliers)

  const openOrders = orders.filter((o) => OPEN_STATUSES.includes(o.status))
  const awaitingReceiving = orders.filter((o) => AWAITING_RECEIVING_STATUSES.includes(o.status))
  const valorEmAberto = openOrders.reduce((sum, o) => sum + orderTotal(o), 0)
  const fornecedoresAtivos = suppliers.filter((s) => s.ativo).length

  const cards = [
    { title: "Pedidos em Andamento", value: openOrders.length, icon: ClipboardList },
    { title: "Aguardando Recebimento", value: awaitingReceiving.length, icon: PackageCheck },
    { title: "Valor em Pedidos Abertos", value: formatBRL(valorEmAberto), icon: Wallet },
    { title: "Fornecedores Ativos", value: fornecedoresAtivos, icon: Truck },
  ]

  return <KpiCardGrid cards={cards} />
}
