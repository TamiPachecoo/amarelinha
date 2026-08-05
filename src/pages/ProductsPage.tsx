import { useState } from "react"
import { Package, Pencil, Plus, Tag, Trash2 } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useCollectionsStore } from "@/features/collections/store/collectionsStore"
import { useLocationsStore } from "@/features/locations/store/locationsStore"
import { ProductForm } from "@/features/products/components/ProductForm"
import { ProductCard } from "@/features/products/components/ProductCard"
import { useProductsStore } from "@/features/products/store/productsStore"
import type { ProductFormValues } from "@/features/products/schemas/productSchema"
import type { Product } from "@/features/products/types"
import { productSourceTypeLabel } from "@/features/products/types"
import {
  custoRange,
  formatBRL,
  investimentoEstoque,
  totalQuantidade,
  valorEstoque,
} from "@/features/products/utils"
import { usePurchaseOrdersStore } from "@/features/purchasing/store/purchaseOrdersStore"
import { useSuppliersStore } from "@/features/suppliers/store/suppliersStore"

function formatCustoRange(product: Product): string {
  const range = custoRange(product)
  if (!range) return "—"
  return range.min === range.max
    ? formatBRL(range.min)
    : `${formatBRL(range.min)} – ${formatBRL(range.max)}`
}

function buildEditDefaultValues(product: Product): ProductFormValues {
  const variant = product.variants[0]
  return {
    nome: product.nome,
    sku: product.sku,
    categoria: product.categoria,
    marca: product.marca,
    precoVenda: product.precoVenda,
    custo: variant?.custo ?? 0,
    cor: variant?.cor ?? "",
    tamanho: variant?.tamanho ?? "",
    localizacaoId: variant?.localizacaoId ?? "",
    quantidade: variant?.quantidade ?? 0,
    estoqueMinimo: variant?.estoqueMinimo ?? 0,
    foto: product.foto,
  }
}

export function ProductsPage() {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [viewingProductId, setViewingProductId] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const products = useProductsStore((state) => state.products)
  const addProduct = useProductsStore((state) => state.addProduct)
  const updateProduct = useProductsStore((state) => state.updateProduct)
  const setProductPhoto = useProductsStore((state) => state.setProductPhoto)
  const deleteProduct = useProductsStore((state) => state.deleteProduct)
  const setPromocao = useProductsStore((state) => state.setPromocao)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [precoPromocionalDraft, setPrecoPromocionalDraft] = useState("")
  const locations = useLocationsStore((state) => state.locations)
  const suppliers = useSuppliersStore((state) => state.suppliers)
  const collections = useCollectionsStore((state) => state.collections)
  const orders = usePurchaseOrdersStore((state) => state.orders)

  const viewingProduct = products.find((p) => p.id === viewingProductId) ?? null

  async function handleAddProduct(values: ProductFormValues) {
    const result = await addProduct(values)
    if (result.success) {
      setFeedbackMessage("Produto salvo com sucesso após confirmação do Supabase.")
      setDialogOpen(false)
      return result
    }

    setFeedbackMessage(result.error ?? "Não foi possível salvar o produto.")
    return result
  }

  async function handleUpdateProduct(values: ProductFormValues) {
    if (!editingProduct) {
      return { success: false, error: "Produto não encontrado para edição." }
    }

    const result = await updateProduct(editingProduct.id, values)
    if (result.success) {
      setFeedbackMessage("Produto atualizado com sucesso após confirmação do Supabase.")
      setEditingProduct(null)
      return result
    }

    setFeedbackMessage(result.error ?? "Não foi possível salvar as alterações.")
    return result
  }

  function handleConfirmDelete() {
    if (!deletingProduct) return
    deleteProduct(deletingProduct.id)
    setDeletingProduct(null)
    setViewingProductId(null)
  }

  function handleOpenProduct(product: Product) {
    setViewingProductId(product.id)
    setFeedbackMessage(null)
    setPrecoPromocionalDraft(product.precoPromocional ? String(product.precoPromocional) : "")
  }

  function handleOpenEdit(product: Product) {
    setEditingProduct(product)
    setFeedbackMessage(null)
  }

  function handleTogglePromocao(checked: boolean) {
    if (!viewingProduct) return
    if (checked) {
      const preco = Number(precoPromocionalDraft)
      if (!preco || preco <= 0) return
      setPromocao(viewingProduct.id, { emPromocao: true, precoPromocional: preco })
    } else {
      setPromocao(viewingProduct.id, { emPromocao: false })
    }
  }

  function handleUpdatePrecoPromocional() {
    if (!viewingProduct || !viewingProduct.emPromocao) return
    const preco = Number(precoPromocionalDraft)
    if (!preco || preco <= 0) return
    setPromocao(viewingProduct.id, { emPromocao: true, precoPromocional: preco })
  }

  function handleSaveProductEdits() {
    if (!viewingProduct) return

    if (viewingProduct.emPromocao) {
      handleUpdatePrecoPromocional()
    }
  }

  function locationName(locationId: string) {
    return locations.find((location) => location.id === locationId)?.nome ?? "—"
  }

  function handleChangeProductPhoto(product: Product, file: File | null) {
    if (!file) return
    if (!file.type.startsWith("image/")) return
    if (file.size > 5 * 1024 * 1024) return

    const reader = new FileReader()
    reader.onload = () => {
      const photo = typeof reader.result === "string" ? reader.result : undefined
      setProductPhoto(product.id, photo)
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveProductPhoto(product: Product) {
    setProductPhoto(product.id, undefined)
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

      {feedbackMessage && (
        <div
          className={`mb-4 rounded-md border px-3 py-2 text-sm ${feedbackMessage.startsWith("Não") ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-brand-green/40 bg-brand-green/10 text-foreground"}`}
        >
          {feedbackMessage}
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum produto cadastrado"
          description="Cadastre seu primeiro produto para começar a controlar o estoque."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onView={handleOpenProduct} />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cadastrar Produto</DialogTitle>
          </DialogHeader>
          <ProductForm onSubmit={handleAddProduct} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={editingProduct !== null} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              key={editingProduct.id}
              defaultValues={buildEditDefaultValues(editingProduct)}
              submitLabel="Salvar Alterações"
              onSubmit={handleUpdateProduct}
              onCancel={() => setEditingProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={viewingProduct !== null}
        onOpenChange={(open) => !open && setViewingProductId(null)}
      >
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-md">
          {viewingProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between gap-2">
                  {viewingProduct.nome}
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(viewingProduct)}>
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeletingProduct(viewingProduct)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="-mx-6 flex flex-col gap-4 overflow-y-auto px-6">
              {viewingProduct.foto && (
                <img
                  src={viewingProduct.foto}
                  alt={viewingProduct.nome}
                  className="max-h-48 w-full rounded-lg object-cover"
                />
              )}

              <div className="space-y-2 rounded-lg border border-dashed border-input p-3">
                <p className="text-sm font-semibold text-foreground">Foto do produto</p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    handleChangeProductPhoto(viewingProduct, event.target.files?.[0] ?? null)
                    event.currentTarget.value = ""
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Envie uma imagem JPG, PNG ou WEBP de até 5 MB.
                </p>
                {viewingProduct.foto && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveProductPhoto(viewingProduct)}
                  >
                    Remover foto
                  </Button>
                )}
              </div>

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
                <dd className="text-right font-medium">{formatBRL(viewingProduct.precoVenda)}</dd>
                <dt className="text-muted-foreground">Quantidade Total</dt>
                <dd className="text-right font-medium">{totalQuantidade(viewingProduct)}</dd>
                <dt className="text-muted-foreground">Valor potencial de venda</dt>
                <dd className="text-right font-medium">{formatBRL(valorEstoque(viewingProduct))}</dd>
                <dt className="text-muted-foreground">Valor investido em estoque</dt>
                <dd className="text-right font-medium">{formatBRL(investimentoEstoque(viewingProduct))}</dd>
              </dl>

              <div className="space-y-2 rounded-lg border border-dashed border-input p-3">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Tag className="size-4" />
                    Colocar em promoção
                  </p>
                  <Switch
                    checked={viewingProduct.emPromocao}
                    onCheckedChange={handleTogglePromocao}
                  />
                </div>
                {viewingProduct.emPromocao ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={precoPromocionalDraft}
                      onChange={(e) => setPrecoPromocionalDraft(e.target.value)}
                      className="max-w-[140px]"
                    />
                    <span className="text-xs text-muted-foreground">
                      preço de tabela: {formatBRL(viewingProduct.precoVenda)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Preço promocional"
                      value={precoPromocionalDraft}
                      onChange={(e) => setPrecoPromocionalDraft(e.target.value)}
                      className="max-w-[140px]"
                    />
                    <span className="text-xs text-muted-foreground">
                      informe o preço e ative para colocar em promoção
                    </span>
                  </div>
                )}

                {viewingProduct.emPromocao && (
                  <div className="pt-1">
                    <Button type="button" size="sm" onClick={handleSaveProductEdits}>
                      Salvar alterações
                    </Button>
                  </div>
                )}
              </div>

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
