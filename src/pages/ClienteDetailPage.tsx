import { useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { ArrowLeft, Plus } from "lucide-react"

import { PageHeader } from "@/components/shared/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChildForm } from "@/features/customers/components/ChildForm"
import { CustomerForm } from "@/features/customers/components/CustomerForm"
import { RegisterPaymentForm } from "@/features/customers/components/RegisterPaymentForm"
import type { ChildFormValues } from "@/features/customers/schemas/childSchema"
import type { CustomerFormValues } from "@/features/customers/schemas/customerSchema"
import type { PaymentFormValues } from "@/features/customers/schemas/paymentSchema"
import { useCustomersStore } from "@/features/customers/store/customersStore"
import { calcularIdade, customerStats, saldoDevedor } from "@/features/customers/utils"
import { useProductsStore } from "@/features/products/store/productsStore"
import { formatBRL } from "@/features/products/utils"
import { SaleForm } from "@/features/sales/components/SaleForm"
import { useSalesStore } from "@/features/sales/store/salesStore"
import { formaPagamentoLabel } from "@/features/sales/types"

export function ClienteDetailPage() {
  const { clienteId } = useParams<{ clienteId: string }>()
  const customers = useCustomersStore((state) => state.customers)
  const updateCustomer = useCustomersStore((state) => state.updateCustomer)
  const addChild = useCustomersStore((state) => state.addChild)
  const registerPayment = useCustomersStore((state) => state.registerPayment)
  const products = useProductsStore((state) => state.products)
  const sales = useSalesStore((state) => state.sales)

  const [isEditOpen, setEditOpen] = useState(false)
  const [isChildOpen, setChildOpen] = useState(false)
  const [isPaymentOpen, setPaymentOpen] = useState(false)
  const [isSaleOpen, setSaleOpen] = useState(false)

  const customer = customers.find((c) => c.id === clienteId)

  if (!customer) {
    return <Navigate to="/clientes" replace />
  }

  const stats = customerStats(customer, sales, products)
  const saldo = saldoDevedor(customer, sales)
  const customerSales = sales
    .filter((sale) => sale.clienteId === customer.id)
    .sort((a, b) => (a.data < b.data ? 1 : -1))

  function productName(productId: string) {
    return products.find((p) => p.id === productId)?.nome ?? "—"
  }

  function handleUpdate(values: CustomerFormValues) {
    updateCustomer(customer!.id, values)
    setEditOpen(false)
  }

  function handleAddChild(values: ChildFormValues) {
    addChild(customer!.id, values)
    setChildOpen(false)
  }

  function handlePayment(values: PaymentFormValues) {
    registerPayment(customer!.id, values)
    setPaymentOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link to="/clientes">
            <ArrowLeft className="size-4" />
            Clientes
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <PageHeader
            title={customer.nomeCompleto}
            description={`${customer.whatsapp} · Cliente desde ${customer.clienteDesde}`}
          />
          <Badge className="mt-1" variant={customer.ativo ? "default" : "outline"}>
            {customer.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total de Compras
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-bold text-foreground">
            {stats.totalCompras}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Valor Total Gasto
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-bold text-foreground">
            {formatBRL(stats.valorTotalGasto)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Última Compra
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-bold text-foreground">
            {stats.ultimaCompra ?? "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-bold text-foreground">
            {formatBRL(stats.ticketMedio)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Número de Filhos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-bold text-foreground">
            {stats.numeroDeFilhos}
          </CardContent>
        </Card>
      </div>

      {(stats.marcasFavoritas.length > 0 || stats.categoriasFavoritas.length > 0) && (
        <div className="flex flex-wrap gap-6 rounded-lg bg-muted p-3 text-sm">
          {stats.marcasFavoritas.length > 0 && (
            <p>
              <span className="font-semibold text-foreground">Marcas favoritas: </span>
              <span className="text-muted-foreground">{stats.marcasFavoritas.join(", ")}</span>
            </p>
          )}
          {stats.categoriasFavoritas.length > 0 && (
            <p>
              <span className="font-semibold text-foreground">Categorias favoritas: </span>
              <span className="text-muted-foreground">{stats.categoriasFavoritas.join(", ")}</span>
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Dados Cadastrais</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Editar
            </Button>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-muted-foreground">Telefone: {customer.telefone}</p>
            <p className="text-muted-foreground">WhatsApp: {customer.whatsapp}</p>
            <p className="text-muted-foreground">E-mail: {customer.email || "—"}</p>
            <p className="text-muted-foreground">Instagram: {customer.instagram || "—"}</p>
            <p className="text-muted-foreground">Facebook: {customer.facebook || "—"}</p>
            <p className="text-muted-foreground">CPF: {customer.cpf || "—"}</p>
            <p className="text-muted-foreground">
              Endereço: {customer.endereco.logradouro}, {customer.endereco.numero}
              {customer.endereco.complemento ? ` — ${customer.endereco.complemento}` : ""} ·{" "}
              {customer.endereco.bairro}, {customer.endereco.cidade}/{customer.endereco.estado} ·
              CEP {customer.endereco.cep}
            </p>
            {customer.observacoes && (
              <p className="mt-2 rounded-lg bg-muted p-2 text-muted-foreground">
                {customer.observacoes}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Conta do Cliente</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setPaymentOpen(true)}>
              Registrar Pagamento
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground">Saldo Devedor</p>
                <p className={`text-lg font-bold ${saldo > 0 ? "text-destructive" : "text-foreground"}`}>
                  {formatBRL(saldo)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Limite de Crédito</p>
                <p className="text-lg font-bold text-foreground">{formatBRL(customer.limiteCredito)}</p>
              </div>
            </div>
            <p className="text-muted-foreground">Vencimento: {customer.dataVencimento || "—"}</p>

            <div>
              <p className="mb-1 font-semibold text-foreground">Histórico de Pagamentos</p>
              {customer.historicoPagamentos.length === 0 ? (
                <p className="text-muted-foreground">Nenhum pagamento registrado.</p>
              ) : (
                <ul className="space-y-1">
                  {customer.historicoPagamentos.map((payment) => (
                    <li key={payment.id} className="flex justify-between text-muted-foreground">
                      <span>
                        {payment.data} {payment.observacao ? `— ${payment.observacao}` : ""}
                      </span>
                      <span className="font-medium text-foreground">{formatBRL(payment.valor)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Filhos ({customer.filhos.length})</p>
          <Button variant="outline" size="sm" onClick={() => setChildOpen(true)}>
            <Plus className="size-4" />
            Adicionar Filho(a)
          </Button>
        </div>
        {customer.filhos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Nenhum filho cadastrado.
          </p>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Tamanho Roupa</TableHead>
                  <TableHead>Calçado</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.filhos.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell className="font-medium text-foreground">{child.nome}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {calcularIdade(child.dataNascimento)} anos
                    </TableCell>
                    <TableCell className="text-muted-foreground">{child.tamanhoRoupa}</TableCell>
                    <TableCell className="text-muted-foreground">{child.numeracaoCalcado}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {child.observacoes || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            Histórico de Compras ({customerSales.length})
          </p>
          <Button size="sm" onClick={() => setSaleOpen(true)}>
            <Plus className="size-4" />
            Nova Venda
          </Button>
        </div>
        {customerSales.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Nenhuma compra registrada ainda.
          </p>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Qtd.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Origem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="text-muted-foreground">{sale.data}</TableCell>
                    <TableCell className="font-medium text-foreground">
                      {productName(sale.productId)}
                    </TableCell>
                    <TableCell className="text-right">{sale.quantidade}</TableCell>
                    <TableCell className="text-right">{formatBRL(sale.total)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formaPagamentoLabel[sale.formaPagamento]}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {sale.malinhaId ? "Malinha Amarelinha" : "Venda direta"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <CustomerForm initialValues={customer} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isChildOpen} onOpenChange={setChildOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Filho(a)</DialogTitle>
          </DialogHeader>
          <ChildForm onSubmit={handleAddChild} onCancel={() => setChildOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          <RegisterPaymentForm onSubmit={handlePayment} onCancel={() => setPaymentOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isSaleOpen} onOpenChange={setSaleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Venda</DialogTitle>
          </DialogHeader>
          <SaleForm clienteId={customer.id} onSuccess={() => setSaleOpen(false)} onCancel={() => setSaleOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
