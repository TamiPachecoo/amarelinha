import { Link } from "react-router-dom"
import { saldoDevedor } from "@/features/customers/utils"
import { useCustomersStore } from "@/features/customers/store/customersStore"
import { useSalesStore } from "@/features/sales/store/salesStore"
import { formatBRL } from "@/features/products/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function OutstandingBalances() {
  const customers = useCustomersStore((state) => state.customers)
  const sales = useSalesStore((state) => state.sales)
  const [search, setSearch] = useState("")
  const balances = customers.map((customer) => ({ customer, balance: saldoDevedor(customer, sales) }))
    .filter((row) => row.balance > 0)
    .sort((a, b) => b.balance - a.balance)
  const visible = balances.filter(({ customer }) => customer.nomeCompleto.toLocaleLowerCase("pt-BR")
    .includes(search.trim().toLocaleLowerCase("pt-BR")))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Clientes com saldo devedor · {formatBRL(balances.reduce((sum, row) => sum + row.balance, 0))}</CardTitle>
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cliente para cobrar" aria-label="Buscar cliente com saldo devedor" />
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum cliente com saldo devedor encontrado.</p> : (
          <ul className="divide-y divide-border">
            {visible.map(({ customer, balance }) => (
              <li key={customer.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div>
                  <Link to={`/clientes/${customer.id}`} className="font-medium underline">{customer.nomeCompleto}</Link>
                  <p className="text-muted-foreground">{customer.whatsapp} · Vencimento: {customer.dataVencimento || "—"}</p>
                </div>
                <strong className="whitespace-nowrap">{formatBRL(balance)}</strong>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
