import { useState } from "react"
import { Link } from "react-router-dom"
import { FileText, PackageSearch, Pencil, Plus, ShoppingBag } from "lucide-react"

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CollectionForm } from "@/features/collections/components/CollectionForm"
import { useCollectionsStore } from "@/features/collections/store/collectionsStore"
import { collectionStatusLabel, type Collection } from "@/features/collections/types"
import type { CollectionFormValues } from "@/features/collections/schemas/collectionSchema"
import { usePurchaseOrdersStore } from "@/features/purchasing/store/purchaseOrdersStore"
import { useSuppliersStore } from "@/features/suppliers/store/suppliersStore"

const statusVariant = {
  planejada: "outline",
  ativa: "default",
  encerrada: "secondary",
} as const

export function CollectionsPage() {
  const collections = useCollectionsStore((state) => state.collections)
  const addCollection = useCollectionsStore((state) => state.addCollection)
  const updateCollection = useCollectionsStore((state) => state.updateCollection)
  const suppliers = useSuppliersStore((state) => state.suppliers)
  const orders = usePurchaseOrdersStore((state) => state.orders)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)

  function supplierName(supplierId: string) {
    return suppliers.find((s) => s.id === supplierId)?.nome ?? "—"
  }

  function pedidosDaColecao(collectionId: string) {
    return orders.filter((o) => o.collectionId === collectionId).length
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleAdd(values: CollectionFormValues, catalogoPdf: File | null) {
    addCollection({
      ...values,
      catalogoPdfUrl: catalogoPdf ? await fileToDataUrl(catalogoPdf) : undefined,
      catalogoPdfNome: catalogoPdf?.name,
    })
    setDialogOpen(false)
  }

  async function handleUpdate(values: CollectionFormValues, catalogoPdf: File | null) {
    if (!editingCollection) return
    updateCollection(editingCollection.id, {
      ...values,
      catalogoPdfUrl: catalogoPdf ? await fileToDataUrl(catalogoPdf) : editingCollection.catalogoPdfUrl,
      catalogoPdfNome: catalogoPdf?.name ?? editingCollection.catalogoPdfNome,
    })
    setEditingCollection(null)
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          title="Coleções"
          description="Coleções sazonais organizadas por fornecedor"
        />
        <Button onClick={() => setDialogOpen(true)}>
          <Plus />
          Nova Coleção
        </Button>
      </div>

      {collections.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Nenhuma coleção cadastrada"
          description="Cadastre uma coleção para organizar os pedidos de compra por temporada."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coleção</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Temporada</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Catálogo</TableHead>
                <TableHead className="text-right">Pedidos de Compra</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell className="font-medium text-foreground">{collection.nome}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {supplierName(collection.supplierId)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{collection.temporada}</TableCell>
                  <TableCell className="text-muted-foreground">{collection.ano}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[collection.status]}>
                      {collectionStatusLabel[collection.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {collection.catalogoPdfUrl ? (
                      <a
                        href={collection.catalogoPdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-primary-foreground/90 underline-offset-2 hover:underline"
                        title={collection.catalogoPdfNome}
                      >
                        <FileText className="size-4 shrink-0" />
                        <span className="max-w-[140px] truncate">
                          {collection.catalogoPdfNome ?? "Abrir PDF"}
                        </span>
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {pedidosDaColecao(collection.id)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingCollection(collection)}>
                        <Pencil className="size-4" />
                      </Button>
                      {collection.catalogoPdfUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/colecoes/${collection.id}/pedido-catalogo`}>
                            <ShoppingBag className="size-4" />
                            Montar Pedido
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Coleção</DialogTitle>
          </DialogHeader>
          <CollectionForm onSubmit={handleAdd} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={editingCollection !== null} onOpenChange={(open) => !open && setEditingCollection(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Coleção</DialogTitle>
          </DialogHeader>
          {editingCollection && (
            <CollectionForm
              initialValues={editingCollection}
              onSubmit={handleUpdate}
              onCancel={() => setEditingCollection(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
