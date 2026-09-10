import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { FileSpreadsheet, FileText, Pencil, Plus, ShoppingBag } from "lucide-react"

import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { exportOrderToCsv, exportOrderToPdf } from "@/features/purchasing/orderExport"
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

function orderToFormValues(order: PurchaseOrder): PurchaseOrderFormValues {
  return {
    supplierId: order.supplierId,
    collectionId: order.collectionId ?? "",
    dataPedido: order.dataPedido,
    previsaoEntrega: order.previsaoEntrega ?? "",
    notaFiscal: order.notaFiscal ?? "",
    frete: order.frete,
    desconto: order.desconto,
    observacoes: order.observacoes ?? "",
    itens: order.itens.map((item) => ({
      codigoFornecedor: item.codigoFornecedor,
      nome: item.nome,
      categoria: item.categoria,
      marca: item.marca,
      cor: item.cor,
      tamanho: item.tamanho,
      quantidadePedida: item.quantidadePedida,
      custoUnitario: item.custoUnitario,
      precoVenda: item.precoVenda,
      foto: item.foto,
    })),
  }
}

export function PurchaseOrdersPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const orders = usePurchaseOrdersStore((state) => state.orders)
  const addOrder = usePurchaseOrdersStore((state) => state.addOrder)
  const updateOrder = usePurchaseOrdersStore((state) => state.updateOrder)
  const updateStatus = usePurchaseOrdersStore((state) => state.updateStatus)
  const deleteOrder = usePurchaseOrdersStore((state) => state.deleteOrder)
  const suppliers = useSuppliersStore((state) => state.suppliers)
  const collections = useCollectionsStore((state) => state.collections)
  const payments = usePaymentsStore((state) => state.payments)
  const addPayments = usePaymentsStore((state) => state.addPayments)
  const markPaid = usePaymentsStore((state) => state.markPaid)

  const [isDialogOpen, setDialogOpen] = useState(false)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<PurchaseOrder | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const viewing = viewingId ? orders.find((order) => order.id === viewingId) ?? null : null
  const editing = editingId ? orders.find((order) => order.id === editingId) ?? null : null

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
      setViewingId(order.id)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, orders, navigate])

  async function handleAdd(values: PurchaseOrderFormValues) {
    const newOrderId = await addOrder(values)
    setDialogOpen(false)
    setViewingId(newOrderId)
  }

  async function handleEdit(values: PurchaseOrderFormValues) {
    if (!editing) return
    await updateOrder(editing.id, values)
    setEditingId(null)
    setViewingId(editing.id)
  }

  function exportPdf(order: PurchaseOrder) {
    exportOrderToPdf(order.itens, {
      supplierNome: supplierName(order.supplierId),
      collectionNome: order.collectionId ? collectionName(order.collectionId) : undefined,
    })
  }

  function exportExcel(order: PurchaseOrder) {
    exportOrderToCsv(order.itens, {
      supplierNome: supplierName(order.supplierId),
      collectionNome: order.collectionId ? collectionName(order.collectionId) : undefined,
    })
  }

  async function handleConfirmDelete() {
    if (!deletingOrder) return
    const error = await deleteOrder(deletingOrder.id)
    if (error) {
      setDeleteError(error)
      return
    }
    setDeletingOrder(null)
    setDeleteError(null)
    setViewingId(null)
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader title="Pedidos de Compra" description="Todos os pedidos, independentemente da origem (manual, PDF, site ou planilha)" />
        <Button onClick={() => setDialogOpen(true)}><Plus /> Novo Pedido</Button>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Nenhum pedido de compra" description="Crie um pedido manualmente para começar a controlar suas compras com fornecedores." />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Número</TableHead><TableHead>Fornecedor</TableHead><TableHead>Coleção</TableHead><TableHead>Data do Pedido</TableHead><TableHead>Previsão</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer" onClick={() => setViewingId(order.id)}>
                  <TableCell className="font-medium text-foreground">{order.numero}</TableCell>
                  <TableCell className="text-muted-foreground">{supplierName(order.supplierId)}</TableCell>
                  <TableCell className="text-muted-foreground">{collectionName(order.collectionId)}</TableCell>
                  <TableCell className="text-muted-foreground">{order.dataPedido}</TableCell>
                  <TableCell className="text-muted-foreground">{order.previsaoEntrega || "—"}</TableCell>
                  <TableCell><Badge variant={statusVariant[order.status]}>{purchaseOrderStatusLabel[order.status]}</Badge></TableCell>
                  <TableCell className="text-right font-medium">{formatBRL(orderTotal(order))}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Ações</Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {order.status !== "recebido" && order.status !== "parcialmente_recebido" && order.status !== "cancelado" && <DropdownMenuItem onClick={() => setEditingId(order.id)}>Editar Pedido</DropdownMenuItem>}
                        <DropdownMenuItem onClick={() => exportPdf(order)}>Exportar PDF</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportExcel(order)}>Exportar Excel</DropdownMenuItem>
                        {nextStatus[order.status] && <DropdownMenuItem onClick={() => updateStatus(order.id, nextStatus[order.status]!)}>Avançar para {purchaseOrderStatusLabel[nextStatus[order.status]!]}</DropdownMenuItem>}
                        {order.status !== "recebido" && order.status !== "cancelado" && <DropdownMenuItem variant="destructive" onClick={() => updateStatus(order.id, "cancelado")}>Cancelar Pedido</DropdownMenuItem>}
                        <DropdownMenuItem variant="destructive" onClick={() => { setDeletingOrder(order); setDeleteError(null) }}>Excluir Pedido</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Novo Pedido de Compra</DialogTitle></DialogHeader>
          <PurchaseOrderForm onSubmit={handleAdd} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {editing && <><DialogHeader><DialogTitle>Editar {editing.numero}</DialogTitle><DialogDescription>Você pode adicionar, remover ou alterar itens e exportar novamente depois de salvar.</DialogDescription></DialogHeader><PurchaseOrderForm initialValues={orderToFormValues(editing)} submitLabel="Salvar Alterações" onSubmit={handleEdit} onCancel={() => setEditingId(null)} /></>}
        </DialogContent>
      </Dialog>

      <Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewingId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {viewing && <>
            <DialogHeader><DialogTitle>{viewing.numero} · {supplierName(viewing.supplierId)}</DialogTitle></DialogHeader>
            <div className="flex flex-wrap gap-2">
              {viewing.status !== "recebido" && viewing.status !== "parcialmente_recebido" && viewing.status !== "cancelado" && <Button variant="outline" size="sm" onClick={() => { setEditingId(viewing.id); setViewingId(null) }}><Pencil className="size-4" /> Editar Pedido</Button>}
              <Button variant="outline" size="sm" onClick={() => exportPdf(viewing)}><FileText className="size-4" /> Exportar PDF</Button>
              <Button variant="outline" size="sm" onClick={() => exportExcel(viewing)}><FileSpreadsheet className="size-4" /> Exportar Excel</Button>
            </div>
            <div className="rounded-lg border border-border overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Produto</TableHead><TableHead>Cor / Tamanho</TableHead><TableHead className="text-right">Pedida</TableHead><TableHead className="text-right">Recebida</TableHead><TableHead className="text-right">Custo Unit.</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader><TableBody>{viewing.itens.map((item) => <TableRow key={item.id}><TableCell className="font-medium text-foreground">{item.nome}</TableCell><TableCell className="text-muted-foreground">{item.cor} / {item.tamanho}</TableCell><TableCell className="text-right">{item.quantidadePedida}</TableCell><TableCell className="text-right">{item.quantidadeRecebida}</TableCell><TableCell className="text-right">{formatBRL(item.custoUnitario)}</TableCell><TableCell className="text-right">{formatBRL(itemTotal(item))}</TableCell></TableRow>)}</TableBody></Table></div>
            <div className="space-y-1 text-sm"><div className="flex justify-between text-muted-foreground"><span>Frete</span><span>{formatBRL(viewing.frete)}</span></div><div className="flex justify-between text-muted-foreground"><span>Desconto</span><span>-{formatBRL(viewing.desconto)}</span></div><div className="flex justify-between border-t border-border pt-1 font-semibold text-foreground"><span>Total</span><span>{formatBRL(orderTotal(viewing))}</span></div></div>
            {viewing.observacoes && <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">{viewing.observacoes}</p>}
            <div className="space-y-3"><p className="text-sm font-semibold text-foreground">Pagamento ao Fornecedor</p>{payments.filter((p) => p.purchaseOrderId === viewing.id).length === 0 ? <RegisterOrderPaymentForm valorTotal={orderTotal(viewing)} dataPedido={viewing.dataPedido} onSubmit={(plan) => addPayments(plan.map((p) => ({ ...p, purchaseOrderId: viewing.id, pago: false })))} /> : <div className="rounded-lg border border-border overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Parcela</TableHead><TableHead>Forma</TableHead><TableHead>Vencimento</TableHead><TableHead className="text-right">Valor</TableHead><TableHead className="text-right">Pago</TableHead></TableRow></TableHeader><TableBody>{payments.filter((p) => p.purchaseOrderId === viewing.id).sort((a,b) => a.numeroParcela-b.numeroParcela).map((payment) => <TableRow key={payment.id}><TableCell>{payment.numeroParcela}/{payment.totalParcelas}</TableCell><TableCell className="text-muted-foreground">{formaPagamentoFornecedorLabel[payment.formaPagamento]}</TableCell><TableCell className={isVencidoNaoPago(payment) ? "font-medium text-destructive" : "text-muted-foreground"}>{payment.dataVencimento}</TableCell><TableCell className="text-right">{formatBRL(payment.valor)}</TableCell><TableCell className="text-right"><Switch checked={payment.pago} onCheckedChange={(checked) => markPaid(payment.id, checked)} className="ml-auto" /></TableCell></TableRow>)}</TableBody></Table></div>}</div>
          </>}
        </DialogContent>
      </Dialog>

      <Dialog open={deletingOrder !== null} onOpenChange={(open) => { if (!open) { setDeletingOrder(null); setDeleteError(null) } }}>
        <DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>Excluir pedido?</DialogTitle><DialogDescription>Isso vai remover o pedido "{deletingOrder?.numero}" e seus pagamentos registrados permanentemente. Essa ação não pode ser desfeita.</DialogDescription></DialogHeader>{deleteError && <p className="text-sm text-destructive">{deleteError}</p>}<DialogFooter><Button variant="outline" onClick={() => setDeletingOrder(null)}>Cancelar</Button><Button variant="destructive" onClick={handleConfirmDelete}>Excluir</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  )
}
