import { useMemo, useState } from "react"
import { endOfMonth, format, parseISO, startOfMonth, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { PageHeader } from "@/components/shared/PageHeader"
import { KpiCardGrid } from "@/components/shared/KpiCardGrid"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingDown, TrendingUp, Wallet } from "lucide-react"

import { useSalesStore } from "@/features/sales/store/salesStore"
import { useCustomersStore } from "@/features/customers/store/customersStore"
import { usePaymentsStore } from "@/features/financial/store/paymentsStore"
import { usePurchaseOrdersStore } from "@/features/purchasing/store/purchaseOrdersStore"
import { useSuppliersStore } from "@/features/suppliers/store/suppliersStore"
import { formaPagamentoFornecedorLabel } from "@/features/financial/types"
import {
  despesaNoPeriodo,
  isVencidoNaoPago,
  receitaNoPeriodo,
  type Period,
} from "@/features/financial/utils"
import { formatBRL } from "@/features/products/utils"
import { formaPagamentoLabel } from "@/features/sales/types"

function monthPeriod(monthValue: string): Period {
  const date = parseISO(`${monthValue}-01`)
  return { start: startOfMonth(date), end: endOfMonth(date) }
}

export function FinanceiroPage() {
  const sales = useSalesStore((state) => state.sales)
  const customers = useCustomersStore((state) => state.customers)
  const payments = usePaymentsStore((state) => state.payments)
  const orders = usePurchaseOrdersStore((state) => state.orders)
  const suppliers = useSuppliersStore((state) => state.suppliers)

  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"))
  const period = useMemo(() => monthPeriod(month), [month])

  const receita = receitaNoPeriodo(sales, period)
  const despesa = despesaNoPeriodo(payments, period)
  const saldo = receita - despesa

  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => {
      const date = subMonths(new Date(), 5 - index)
      const p = monthPeriod(format(date, "yyyy-MM"))
      return {
        mes: format(date, "MMM/yy", { locale: ptBR }),
        Receita: receitaNoPeriodo(sales, p),
        Despesas: despesaNoPeriodo(payments, p),
      }
    })
  }, [sales, payments])

  const salesNoPeriodo = sales.filter(
    (sale) => parseISO(sale.data) >= period.start && parseISO(sale.data) <= period.end
  )
  const paymentsNoPeriodo = payments.filter(
    (p) => parseISO(p.dataVencimento) >= period.start && parseISO(p.dataVencimento) <= period.end
  )

  function customerName(id: string) {
    return customers.find((c) => c.id === id)?.nomeCompleto ?? "—"
  }

  function orderInfo(id: string) {
    const order = orders.find((o) => o.id === id)
    if (!order) return "—"
    const supplierNome = suppliers.find((s) => s.id === order.supplierId)?.nome ?? "—"
    return `${order.numero} · ${supplierNome}`
  }

  const cards = [
    { title: "Receita do Mês", value: formatBRL(receita), icon: TrendingUp },
    { title: "Despesas do Mês", value: formatBRL(despesa), icon: TrendingDown },
    { title: "Saldo do Mês", value: formatBRL(saldo), icon: Wallet },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="Financeiro" description="Entradas, saídas e saúde financeira do negócio" />
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="mes-filtro">
            Mês
          </label>
          <Input
            id="mes-filtro"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      <KpiCardGrid cards={cards} />

      <div className="h-64 rounded-xl border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="mes" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value) => formatBRL(Number(value))} />
            <Legend />
            <Bar dataKey="Receita" fill="var(--brand-green)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Despesas" fill="var(--brand-pink)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Tabs defaultValue="entradas">
        <TabsList>
          <TabsTrigger value="entradas">Entradas</TabsTrigger>
          <TabsTrigger value="saidas">Saídas</TabsTrigger>
        </TabsList>

        <TabsContent value="entradas">
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Forma</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesNoPeriodo.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhuma venda neste período.
                    </TableCell>
                  </TableRow>
                ) : (
                  salesNoPeriodo.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="text-muted-foreground">{sale.data}</TableCell>
                      <TableCell className="font-medium text-foreground">
                        {customerName(sale.clienteId)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formaPagamentoLabel[sale.formaPagamento]}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatBRL(sale.total)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="saidas">
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Forma</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsNoPeriodo.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum pagamento neste período.
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentsNoPeriodo.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell
                        className={
                          isVencidoNaoPago(payment) ? "font-medium text-destructive" : "text-muted-foreground"
                        }
                      >
                        {payment.dataVencimento}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {orderInfo(payment.purchaseOrderId)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formaPagamentoFornecedorLabel[payment.formaPagamento]}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatBRL(payment.valor)}</TableCell>
                      <TableCell className="text-right">
                        {payment.pago ? "Pago" : isVencidoNaoPago(payment) ? "Vencido" : "Pendente"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
