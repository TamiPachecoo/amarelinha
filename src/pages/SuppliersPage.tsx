import { useState } from "react"
import { Plus, Trash2, Truck } from "lucide-react"

import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCollectionsStore } from "@/features/collections/store/collectionsStore"
import { usePurchaseOrdersStore } from "@/features/purchasing/store/purchaseOrdersStore"
import { orderTotal } from "@/features/purchasing/utils"
import { SupplierForm } from "@/features/suppliers/components/SupplierForm"
import { useSuppliersStore } from "@/features/suppliers/store/suppliersStore"
import type { Supplier } from "@/features/suppliers/types"
import type { SupplierFormValues } from "@/features/suppliers/schemas/supplierSchema"
import { formatBRL } from "@/features/products/utils"

export function SuppliersPage() {
  const suppliers = useSuppliersStore((state) => state.suppliers)
  const addSupplier = useSuppliersStore((state) => state.addSupplier)
  const deleteSupplier = useSuppliersStore((state) => state.deleteSupplier)
  const collections = useCollectionsStore((state) => state.collections)
  const orders = usePurchaseOrdersStore((state) => state.orders)

  const [isDialogOpen, setDialogOpen] = useState(false)
  const [viewing, setViewing] = useState<Supplier | null>(null)
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function handleAdd(values: SupplierFormValues) {
    addSupplier(values)
    setDialogOpen(false)
  }

  async function handleConfirmDelete() {
    if (!deletingSupplier) return
    const error = await deleteSupplier(deletingSupplier.id)
    if (error) {
      setDeleteError(error)
      return
    }
    setDeletingSupplier(null)
    setDeleteError(null)
    setViewing(null)
  }

  function statsFor(supplierId: string) {
    const supplierCollections = collections.filter((c) => c.supplierId === supplierId)
    const supplierOrders = orders.filter((o) => o.supplierId === supplierId)
    const emAndamento = supplierOrders.filter(
      (o) => o.status !== "recebido" && o.status !== "cancelado"
    ).length
    const totalComprado = supplierOrders.reduce((sum, o) => sum + orderTotal(o), 0)
    return {
      totalColecoes: supplierCollections.length,
      totalPedidos: supplierOrders.length,
      emAndamento,
      totalComprado,
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          title="Fornecedores"
          description="Contatos, condições comerciais e desempenho de compra"
        />
        <Button onClick={() => setDialogOpen(true)}>
          <Plus />
          Novo Fornecedor
        </Button>
      </div>

      {suppliers.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Nenhum fornecedor cadastrado"
          description="Cadastre seu primeiro fornecedor para começar a registrar coleções e pedidos de compra."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {suppliers.map((supplier) => {
            const stats = statsFor(supplier.id)
            return (
              <Card
                key={supplier.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => setViewing(supplier)}
              >
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground">{supplier.nome}</h3>
                    <Badge variant={supplier.ativo ? "default" : "outline"}>
                      {supplier.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {supplier.contatoNome || "Sem contato definido"} · Lead time {supplier.leadTimeDias}d
                  </p>
                  <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-foreground">{stats.totalColecoes}</p>
                      <p className="text-xs text-muted-foreground">Coleções</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{stats.emAndamento}</p>
                      <p className="text-xs text-muted-foreground">Em Andamento</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{formatBRL(stats.totalComprado)}</p>
                      <p className="text-xs text-muted-foreground">Total Comprado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Fornecedor</DialogTitle>
          </DialogHeader>
          <SupplierForm onSubmit={handleAdd} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="sm:max-w-md">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between gap-2">
                  {viewing.nome}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setDeletingSupplier(viewing)
                      setDeleteError(null)
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <dt className="text-muted-foreground">Contato</dt>
                <dd className="text-right font-medium">{viewing.contatoNome || "—"}</dd>
                <dt className="text-muted-foreground">WhatsApp</dt>
                <dd className="text-right font-medium">{viewing.whatsapp}</dd>
                <dt className="text-muted-foreground">E-mail</dt>
                <dd className="text-right font-medium">{viewing.email || "—"}</dd>
                <dt className="text-muted-foreground">Instagram</dt>
                <dd className="text-right font-medium">{viewing.instagram || "—"}</dd>
                <dt className="text-muted-foreground">Website</dt>
                <dd className="text-right font-medium">{viewing.website || "—"}</dd>
                <dt className="text-muted-foreground">Condições de Pagamento</dt>
                <dd className="text-right font-medium">{viewing.condicoesPagamento}</dd>
                <dt className="text-muted-foreground">Lead Time</dt>
                <dd className="text-right font-medium">{viewing.leadTimeDias} dias</dd>
              </dl>
              {viewing.observacoes && (
                <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  {viewing.observacoes}
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deletingSupplier !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingSupplier(null)
            setDeleteError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir fornecedor?</DialogTitle>
            <DialogDescription>
              Isso vai remover "{deletingSupplier?.nome}" permanentemente. Essa ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingSupplier(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
