import { Briefcase, PackageOpen, Wallet } from "lucide-react"

import { KpiCardGrid } from "@/components/shared/KpiCardGrid"
import { useCustomersStore } from "@/features/customers/store/customersStore"
import { saldoDevedor } from "@/features/customers/utils"
import { useMalinhasStore } from "@/features/malinhas/store/malinhasStore"
import { formatBRL } from "@/features/products/utils"
import { useSalesStore } from "@/features/sales/store/salesStore"

export function MalinhaKpiCards() {
  const malinhas = useMalinhasStore((state) => state.malinhas)
  const customers = useCustomersStore((state) => state.customers)
  const sales = useSalesStore((state) => state.sales)

  const malinhasAtivas = malinhas.filter((m) => m.status !== "fechada").length
  const produtosForaDaLoja = malinhas
    .filter((m) => m.status === "com_cliente")
    .reduce((sum, m) => sum + m.itens.reduce((itemSum, item) => itemSum + item.quantidade, 0), 0)
  const saldoAReceber = customers.reduce((sum, customer) => sum + saldoDevedor(customer, sales), 0)

  const cards = [
    { title: "Malinhas Ativas", value: malinhasAtivas, icon: Briefcase },
    { title: "Produtos Fora da Loja", value: produtosForaDaLoja, icon: PackageOpen },
    { title: "Saldo a Receber de Clientes", value: formatBRL(saldoAReceber), icon: Wallet },
  ]

  return <KpiCardGrid cards={cards} />
}
