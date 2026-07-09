import { useState } from "react"
import { Package, Plus, Trash2 } from "lucide-react"

import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCollectionsStore } from "@/features/collections/store/collectionsStore"
import { useLocationsStore } from "@/features/locations/store/locationsStore"
import { ProductForm } from "@/features/products/components/ProductForm"
import { ProductCard } from "@/features/products/components/ProductCard"
import { useProductsStore } from "@/features/products/store/productsStore"
import type { ProductFormValues } from "@/features/products/schemas/productSchema"
import type { Product } from "@/features/products/types"
import { productSourceTypeLabel } from "@/features/products/types"
import { custoRange, formatBRL, totalQuantidade } from "@/features/products/utils"
import { usePurchaseOrdersStore } from "@/features/purchasing/store/purchaseOrdersStore"
import { useSuppliersStore } from "@/features/suppliers/store/suppliersStore"

function formatCustoRange(product: Product): string {
  const range = custoRange(product)
  if (!range) return "—"
  return range.min === range.max
    ? formatBRL(range.min)
    : `${formatBRL(range.min)} – ${formatBRL(range.max)}`
}

export function ProductsPage() {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const products = useProductsStore((state) => state.products)
  const addProduct = useProductsStore((state) => state.addProduct)
  const deleteProduct = useProductsStore((state) => state.deleteProduct)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const locations = useLocationsStore((state) => state.locations)
  const suppliers = useSuppliersStore((state) => state.suppliers)
  const collections = useCollectionsStore((state) => state.collections)
  const orders = usePurchaseOrdersStore((state) => state.orders)

  function handleAddProduct(values: ProductFormValues) {
    addProduct(values)
    setDialogOpen(false)
  }

  function handleConfirmDelete() {
    if (!deletingProduct) return
    deleteProduct(deletingProduct.id)
    setDeletingProduct(null)
    setViewingProduct(null)
  }

  function locationName(locationId: string) {
    return locations.find((location) => location.id === locationId)?.nome ?? "—"
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader title="Produtos" description="Gerencie seu catálogo de produtos" />
        <Button onClick={() => setDialogOpen(true)}>
          <Plus />
          Cadastrar Produto
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum produto cadastrado"
          description="Cadastre seu primeiro produto para começar a controlar o estoque."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onView={setViewingProduct} />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cadastrar Produto</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSubmit={handleAddProduct}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={viewingProduct !== null}
        onOpenChange={(open) => !open && setViewingProduct(null)}
      >
        <DialogContent className="sm:max-w-md">
          {viewingProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between gap-2">
                  {viewingProduct.nome}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeletingProduct(viewingProduct)}
                  >
                    <Trash2 />
                  </Button>
                </DialogTitle>
              </DialogHeader>
              {viewingProduct.foto && (
                <img
                  src={viewingProduct.foto}
                  alt={viewingProduct.nome}
                  className="max-h-48 w-full rounded-lg object-cover"
                />
              )}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <dt className="text-muted-foreground">SKU</dt>
                <dd className="text-right font-medium">{viewingProduct.sku}</dd>
                <dt className="text-muted-foreground">Categoria</dt>
                <dd className="text-right font-medium">{viewingProduct.categoria}</dd>
                <dt className="text-muted-foreground">Marca</dt>
                <dd className="text-right font-medium">{viewingProduct.marca}</dd>
                <dt className="text-muted-foreground">Preço de Custo</dt>
                <dd className="text-right font-medium">{formatCustoRange(viewingProduct)}</dd>
                <dt className="text-muted-foreground">Preço de Venda</dt>
                <dd className="text-right font-medium">
                  {formatBRL(viewingProduct.precoVenda)}
                </dd>
                <dt className="text-muted-foreground">Quantidade Total</dt>
                <dd className="text-right font-medium">{totalQuantidade(viewingProduct)}</dd>
              </dl>

              <div className="mt-2 space-y-2">
                <p className="text-sm font-semibold text-foreground">Variantes</p>
                <div className="divide-y divide-border rounded-lg border border-border">
                  {viewingProduct.variants.map((variant) => (
                    <div key={variant.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="text-muted-foreground">
                        {variant.cor} · {variant.tamanho} · 📍 {locationName(variant.localizacaoId)}
                      </span>
                      <span className="font-medium">{variant.quantidade} un.</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 space-y-1 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">
                  Origem: {productSourceTypeLabel[viewingProduct.origem.tipo]}
                </p>
                {viewingProduct.origem.supplierId && (
                  <p>
                    Fornecedor:{" "}
                    {suppliers.find((s) => s.id === viewingProduct.origem.supplierId)?.nome ?? "—"}
                  </p>
                )}
                {viewingProduct.origem.collectionId && (
                  <p>
                    Coleção:{" "}
                    {collections.find((c) => c.id === viewingProduct.origem.collectionId)?.nome ?? "—"}
                  </p>
                )}
                {viewingProduct.origem.purchaseOrderId && (
                  <p>
                    Pedido de Compra:{" "}
                    {orders.find((o) => o.id === viewingProduct.origem.purchaseOrderId)?.numero ?? "—"}
                  </p>
                )}
                {viewingProduct.origem.codigoOriginal && (
                  <p>Código original do fornecedor: {viewingProduct.origem.codigoOriginal}</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deletingProduct !== null}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir produto?</DialogTitle>
            <DialogDescription>
              Isso vai remover "{deletingProduct?.nome}" e todas as suas variantes do estoque
              permanentemente. Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingProduct(null)}>
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
