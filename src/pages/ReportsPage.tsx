import { useMemo, useState } from "react"
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
import { AlertTriangle, Package, PackageX, TrendingDown, TrendingUp, Wallet } from "lucide-react"

import { PageHeader } from "@/components/shared/PageHeader"
import { KpiCardGrid } from "@/components/shared/KpiCardGrid"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useSalesStore } from "@/features/sales/store/salesStore"
import { usePaymentsStore } from "@/features/financial/store/paymentsStore"
import { useProductsStore } from "@/features/products/store/productsStore"
import { useCustomersStore } from "@/features/customers/store/customersStore"
import {
  formatBRL,
  semEstoque,
  temEstoqueBaixo,
  valorEstoque,
  investimentoEstoque,
} from "@/features/products/utils"
import {
  giroStatusLabel,
  monthlyFinancialSeries,
  productLifespanReport,
  promoSalesReport,
  stockByCategoria,
  type GiroStatus,
} from "@/features/reports/utils"

const giroBadgeClass: Record<GiroStatus, string> = {
  parado: "bg-destructive text-white",
  lento: "bg-brand-yellow text-accent-foreground",
  girando: "bg-brand-green text-foreground",
}

const ALL = "todos"

const MONTH_OPTIONS = [3, 6, 12, 24]

export function ReportsPage() {
  const sales = useSalesStore((state) => state.sales)
  const payments = usePaymentsStore((state) => state.payments)
  const products = useProductsStore((state) => state.products)
  const customers = useCustomersStore((state) => state.customers)

  const [lifespanSearch, setLifespanSearch] = useState("")
  const [lifespanStatus, setLifespanStatus] = useState<typeof ALL | GiroStatus>(ALL)
  const [financialMonths, setFinancialMonths] = useState(12)
  const [stockCategoria, setStockCategoria] = useState(ALL)
  const [promoSearch, setPromoSearch] = useState("")

  const financialSeries = useMemo(
    () => monthlyFinancialSeries(sales, payments, financialMonths),
    [sales, payments, financialMonths]
  )
  const totalReceitaPeriodo = financialSeries.reduce((sum, m) => sum + m.receita, 0)
  const totalDespesasPeriodo = financialSeries.reduce((sum, m) => sum + m.despesas, 0)

  const categoriaStock = useMemo(() => stockByCategoria(products), [products])
  const filteredCategoriaStock = useMemo(
    () => (stockCategoria === ALL ? categoriaStock : categoriaStock.filter((c) => c.categoria === stockCategoria)),
    [categoriaStock, stockCategoria]
  )
  const lifespan = useMemo(() => productLifespanReport(products, sales), [products, sales])
  const promoSales = useMemo(() => promoSalesReport(sales, products, customers), [sales, products, customers])

  const filteredPromoSales = useMemo(() => {
    const term = promoSearch.trim().toLowerCase()
    if (!term) return promoSales
    return promoSales.filter(
      (row) =>
        row.productNome.toLowerCase().includes(term) || row.clienteNome.toLowerCase().includes(term)
    )
  }, [promoSales, promoSearch])

  const filteredLifespan = useMemo(() => {
    const term = lifespanSearch.trim().toLowerCase()
    return lifespan.filter((row) => {
      const matchesSearch =
        term.length === 0 ||
        row.nome.toLowerCase().includes(term) ||
        row.categoria.toLowerCase().includes(term) ||
        row.marca.toLowerCase().includes(term)
      return matchesSearch && (lifespanStatus === ALL || row.status === lifespanStatus)
    })
  }, [lifespan, lifespanSearch, lifespanStatus])

  const financialCards = [
    {
      title: `Receita (${financialMonths}m)`,
      value: formatBRL(totalReceitaPeriodo),
      icon: TrendingUp,
      accent: "green" as const,
    },
    {
      title: `Despesas (${financialMonths}m)`,
      value: formatBRL(totalDespesasPeriodo),
      icon: TrendingDown,
      accent: "pink" as const,
    },
    {
      title: `Saldo (${financialMonths}m)`,
      value: formatBRL(totalReceitaPeriodo - totalDespesasPeriodo),
      icon: Wallet,
      accent: "yellow" as const,
    },
  ]

  const stockCards = [
    {
      title: "Valor de Custo do Estoque",
      value: formatBRL(products.reduce((sum, p) => sum + investimentoEstoque(p), 0)),
      icon: Wallet,
      accent: "aqua" as const,
    },
    {
      title: "Valor de Venda do Estoque",
      value: formatBRL(products.reduce((sum, p) => sum + valorEstoque(p), 0)),
      icon: Wallet,
      accent: "aqua" as const,
    },
    {
      title: "Produtos com Estoque Baixo",
      value: products.filter(temEstoqueBaixo).length,
      icon: AlertTriangle,
      accent: "yellow" as const,
    },
    {
      title: "Produtos sem Estoque",
      value: products.filter(semEstoque).length,
      icon: PackageX,
      accent: "pink" as const,
    },
  ]

  const paradosCount = lifespan.filter((r) => r.status === "parado").length

  return (
    <div className="space-y-6">
      <PageHeader title="Relatórios" description="Financeiro, estoque e ciclo de vida dos produtos" />

      <Tabs defaultValue="financeiro">
        <TabsList>
          <TabsTrigger value="financeiro">💰 Financeiro</TabsTrigger>
          <TabsTrigger value="estoque">📦 Estoque</TabsTrigger>
          <TabsTrigger value="ciclo-vida">⏳ Ciclo de Vida dos Produtos</TabsTrigger>
          <TabsTrigger value="promocoes">🏷️ Promoções</TabsTrigger>
        </TabsList>

        <TabsContent value="financeiro" className="space-y-4">
          <div className="flex items-center justify-end">
            <Select value={String(financialMonths)} onValueChange={(v) => setFinancialMonths(Number(v))}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    Últimos {m} meses
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <KpiCardGrid cards={financialCards} />
          <div className="h-72 rounded-xl border border-border bg-card p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialSeries}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => formatBRL(Number(value))} />
                <Legend />
                <Bar dataKey="receita" name="Receita" fill="var(--brand-green)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="var(--brand-pink)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="estoque" className="space-y-4">
          <KpiCardGrid cards={stockCards} />
          <div className="flex items-center justify-end">
            <Select value={stockCategoria} onValueChange={setStockCategoria}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas as categorias</SelectItem>
                {categoriaStock.map((c) => (
                  <SelectItem key={c.categoria} value={c.categoria}>
                    {c.categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Peças</TableHead>
                  <TableHead className="text-right">Valor de Custo</TableHead>
                  <TableHead className="text-right">Valor de Venda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategoriaStock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhum produto cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategoriaStock.map((row) => (
                    <TableRow key={row.categoria}>
                      <TableCell className="font-medium text-foreground">{row.categoria}</TableCell>
                      <TableCell className="text-right">{row.quantidade}</TableCell>
                      <TableCell className="text-right">{formatBRL(row.valorCusto)}</TableCell>
                      <TableCell className="text-right">{formatBRL(row.valorVenda)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="ciclo-vida" className="space-y-4">
          {paradosCount > 0 && (
            <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{paradosCount}</span>{" "}
              {paradosCount === 1 ? "produto parado" : "produtos parados"} — sem vendas há mais de 60
              dias.
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Buscar por produto, categoria ou marca..."
              value={lifespanSearch}
              onChange={(e) => setLifespanSearch(e.target.value)}
              className="sm:max-w-xs"
            />
            <Select value={lifespanStatus} onValueChange={(v) => setLifespanStatus(v as typeof lifespanStatus)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status de giro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os status</SelectItem>
                <SelectItem value="girando">Girando Bem</SelectItem>
                <SelectItem value="lento">Giro Lento</SelectItem>
                <SelectItem value="parado">Parado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead className="text-right">Dias em Estoque</TableHead>
                  <TableHead className="text-right">Estoque Atual</TableHead>
                  <TableHead className="text-right">Vendidos</TableHead>
                  <TableHead>Última Venda</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLifespan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      <Package className="mx-auto mb-1 size-5" />
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLifespan.map((row) => (
                    <TableRow key={row.productId}>
                      <TableCell className="font-medium text-foreground">{row.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{row.categoria}</TableCell>
                      <TableCell className="text-muted-foreground">{row.marca}</TableCell>
                      <TableCell className="text-right">{row.diasEmEstoque}</TableCell>
                      <TableCell className="text-right">{row.quantidadeAtual}</TableCell>
                      <TableCell className="text-right">{row.quantidadeVendida}</TableCell>
                      <TableCell className="text-muted-foreground">{row.ultimaVenda ?? "—"}</TableCell>
                      <TableCell>
                        <Badge className={giroBadgeClass[row.status]}>
                          {giroStatusLabel[row.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="promocoes" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Itens vendidos com desconto (marcados como "em promoção" na venda), para acompanhar o
            que costuma ir para promoção e por quanto.
          </p>
          <Input
            placeholder="Buscar por produto ou cliente..."
            value={promoSearch}
            onChange={(e) => setPromoSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Qtd.</TableHead>
                  <TableHead className="text-right">Preço Original</TableHead>
                  <TableHead className="text-right">Preço Vendido</TableHead>
                  <TableHead className="text-right">Desconto</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromoSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Nenhuma venda em promoção registrada ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPromoSales.map((row) => (
                    <TableRow key={row.saleId}>
                      <TableCell className="text-muted-foreground">{row.data}</TableCell>
                      <TableCell className="font-medium text-foreground">{row.productNome}</TableCell>
                      <TableCell className="text-muted-foreground">{row.clienteNome}</TableCell>
                      <TableCell className="text-right">{row.quantidade}</TableCell>
                      <TableCell className="text-right text-muted-foreground line-through">
                        {formatBRL(row.precoOriginal)}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatBRL(row.precoVendido)}</TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-brand-pink text-foreground">
                          -{row.descontoPercentual.toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatBRL(row.total)}</TableCell>
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
