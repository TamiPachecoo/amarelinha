import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Plus, ShoppingBag } from "lucide-react"

import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCollectionsStore } from "@/features/collections/store/collectionsStore"
import { formatBRL } from "@/features/products/utils"
import { PurchaseOrderForm } from "@/features/purchasing/components/PurchaseOrderForm"
import { usePurchaseOrdersStore } from "@/features/purchasing/store/purchaseOrdersStore"
import type { PurchaseOrderFormValues } from "@/features/purchasing/schemas/purchaseOrderSchema"
import type { PurchaseOrder, PurchaseOrderStatus } from "@/features/purchasing/types"
import { purchaseOrderStatusLabel } from "@/features/purchasing/types"
import { itemTotal, orderTotal } from "@/features/purchasing/utils"
import { useSuppliersStore } from "@/features/suppliers/store/suppliersStore"
import { RegisterOrderPaymentForm } from "@/features/financial/components/RegisterOrderPaymentForm"
import { usePaymentsStore } from "@/features/financial/store/paymentsStore"
import { formaPagamentoFornecedorLabel } from "@/features/financial/types"
import { isVencidoNaoPago } from "@/features/financial/utils"
import { Switch } from "@/components/ui/switch"

const statusVariant: Record<PurchaseOrderStatus, "default" | "outline" | "secondary" | "destructive"> = {
  rascunho: "outline",
  enviado: "secondary",
  confirmado: "default",
  parcialmente_recebido: "secondary",
  recebido: "default",
  cancelado: "destructive",
}

const nextStatus: Partial<Record<PurchaseOrderStatus, PurchaseOrderStatus>> = {
  rascunho: "enviado",
  enviado: "confirmado",
}

export function PurchaseOrdersPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const orders = usePurchaseOrdersStore((state) => state.orders)
  const addOrder = usePurchaseOrdersStore((state) => state.addOrder)
  const updateStatus = usePurchaseOrdersStore((state) => state.updateStatus)
  const suppliers = useSuppliersStore((state) => state.suppliers)
  const collections = useCollectionsStore((state) => state.collections)
  const payments = usePaymentsStore((state) => state.payments)
  const addPayments = usePaymentsStore((state) => state.addPayments)
  const markPaid = usePaymentsStore((state) => state.markPaid)

  const [isDialogOpen, setDialogOpen] = useState(false)
  const [viewing, setViewing] = useState<PurchaseOrder | null>(null)

  function supplierName(id: string) {
    return suppliers.find((s) => s.id === id)?.nome ?? "—"
  }

  function collectionName(id?: string) {
    return id ? collections.find((c) => c.id === id)?.nome ?? "—" : "—"
  }

  useEffect(() => {
    const openOrderId = (location.state as { openOrderId?: string } | null)?.openOrderId
    if (!openOrderId) return
    const order = orders.find((o) => o.id === openOrderId)
    if (order) {
      setViewing(order)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, orders, navigate])

  function handleAdd(values: PurchaseOrderFormValues) {
    const newOrderId = addOrder(values)
    setDialogOpen(false)
    const newOrder = usePurchaseOrdersStore.getState().orders.find((o) => o.id === newOrderId)
    if (newOrder) setViewing(newOrder)
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          title="Pedidos de Compra"
          description="Todos os pedidos, independentemente da origem (manual, PDF, site ou planilha)"
        />
        <Button onClick={() => setDialogOpen(true)}>
          <Plus />
          Novo Pedido
        </Button>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Nenhum pedido de compra"
          description="Crie um pedido manualmente para começar a controlar suas compras com fornecedores."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Coleção</TableHead>
                <TableHead>Data do Pedido</TableHead>
                <TableHead>Previsão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer" onClick={() => setViewing(order)}>
                  <TableCell className="font-medium text-foreground">{order.numero}</TableCell>
                  <TableCell className="text-muted-foreground">{supplierName(order.supplierId)}</TableCell>
                  <TableCell className="text-muted-foreground">{collectionName(order.collectionId)}</TableCell>
                  <TableCell className="text-muted-foreground">{order.dataPedido}</TableCell>
                  <TableCell className="text-muted-foreground">{order.previsaoEntrega || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[order.status]}>
                      {purchaseOrderStatusLabel[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatBRL(orderTotal(order))}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    {order.status !== "recebido" && order.status !== "cancelado" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">Ações</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {nextStatus[order.status] && (
                            <DropdownMenuItem
                              onClick={() => updateStatus(order.id, nextStatus[order.status]!)}
                            >
                              Avançar para {purchaseOrderStatusLabel[nextStatus[order.status]!]}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => updateStatus(order.id, "cancelado")}
                          >
                            Cancelar Pedido
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Pedido de Compra</DialogTitle>
          </DialogHeader>
          <PurchaseOrderForm onSubmit={handleAdd} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {viewing.numero} · {supplierName(viewing.supplierId)}
                </DialogTitle>
              </DialogHeader>

              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Cor / Tamanho</TableHead>
                      <TableHead className="text-right">Pedida</TableHead>
                      <TableHead className="text-right">Recebida</TableHead>
                      <TableHead className="text-right">Custo Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewing.itens.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-foreground">{item.nome}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.cor} / {item.tamanho}
                        </TableCell>
                        <TableCell className="text-right">{item.quantidadePedida}</TableCell>
                        <TableCell className="text-right">{item.quantidadeRecebida}</TableCell>
                        <TableCell className="text-right">{formatBRL(item.custoUnitario)}</TableCell>
                        <TableCell className="text-right">{formatBRL(itemTotal(item))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Frete</span>
                  <span>{formatBRL(viewing.frete)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Desconto</span>
                  <span>-{formatBRL(viewing.desconto)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatBRL(orderTotal(viewing))}</span>
                </div>
              </div>

              {viewing.observacoes && (
                <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  {viewing.observacoes}
                </p>
              )}

              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Pagamento ao Fornecedor</p>
                {payments.filter((p) => p.purchaseOrderId === viewing.id).length === 0 ? (
                  <RegisterOrderPaymentForm
                    valorTotal={orderTotal(viewing)}
                    dataPedido={viewing.dataPedido}
                    onSubmit={(plan) =>
                      addPayments(plan.map((p) => ({ ...p, purchaseOrderId: viewing.id, pago: false })))
                    }
                  />
                ) : (
                  <div className="rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parcela</TableHead>
                          <TableHead>Forma</TableHead>
                          <TableHead>Vencimento</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-right">Pago</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments
                          .filter((p) => p.purchaseOrderId === viewing.id)
                          .sort((a, b) => a.numeroParcela - b.numeroParcela)
                          .map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>
                                {payment.numeroParcela}/{payment.totalParcelas}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formaPagamentoFornecedorLabel[payment.formaPagamento]}
                              </TableCell>
                              <TableCell
                                className={
                                  isVencidoNaoPago(payment)
                                    ? "font-medium text-destructive"
                                    : "text-muted-foreground"
                                }
                              >
                                {payment.dataVencimento}
                              </TableCell>
                              <TableCell className="text-right">{formatBRL(payment.valor)}</TableCell>
                              <TableCell className="text-right">
                                <Switch
                                  checked={payment.pago}
                                  onCheckedChange={(checked) => markPaid(payment.id, checked)}
                                  className="ml-auto"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
