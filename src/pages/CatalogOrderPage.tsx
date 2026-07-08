import { useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { FileSpreadsheet, FileText, ImageOff, Plus, Trash2 } from "lucide-react"

import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCollectionsStore } from "@/features/collections/store/collectionsStore"
import { exportOrderToCsv, exportOrderToPdf } from "@/features/purchasing/orderExport"
import { PdfCropViewer } from "@/features/purchasing/components/PdfCropViewer"
import type { PurchaseOrderItemFormValues } from "@/features/purchasing/schemas/purchaseOrderSchema"
import { usePurchaseOrdersStore } from "@/features/purchasing/store/purchaseOrdersStore"
import { useSuppliersStore } from "@/features/suppliers/store/suppliersStore"

const emptyDraft = {
  codigoFornecedor: "",
  nome: "",
  categoria: "",
  marca: "",
  cor: "",
  tamanho: "",
  quantidadePedida: "",
  custoUnitario: "",
  precoVenda: "",
}

export function CatalogOrderPage() {
  const { collectionId } = useParams<{ collectionId: string }>()
  const navigate = useNavigate()

  const collections = useCollectionsStore((state) => state.collections)
  const suppliers = useSuppliersStore((state) => state.suppliers)
  const addOrder = usePurchaseOrdersStore((state) => state.addOrder)

  const collection = collections.find((c) => c.id === collectionId)
  const supplier = suppliers.find((s) => s.id === collection?.supplierId)

  const [draft, setDraft] = useState(emptyDraft)
  const [fotoAtual, setFotoAtual] = useState<string | undefined>(undefined)
  const [itens, setItens] = useState<PurchaseOrderItemFormValues[]>([])

  const [dataPedido] = useState(new Date().toISOString().slice(0, 10))
  const [observacoes, setObservacoes] = useState("")

  if (!collection || !collection.catalogoPdfUrl) {
    return <Navigate to="/colecoes" replace />
  }

  const draftIsValid =
    draft.nome.trim() &&
    draft.codigoFornecedor.trim() &&
    draft.categoria.trim() &&
    draft.marca.trim() &&
    draft.cor.trim() &&
    draft.tamanho.trim() &&
    Number(draft.quantidadePedida) > 0 &&
    Number(draft.custoUnitario) > 0 &&
    Number(draft.precoVenda) > 0

  function handleAddItem() {
    if (!draftIsValid) return
    setItens((prev) => [
      ...prev,
      {
        codigoFornecedor: draft.codigoFornecedor,
        nome: draft.nome,
        categoria: draft.categoria,
        marca: draft.marca,
        cor: draft.cor,
        tamanho: draft.tamanho,
        quantidadePedida: Number(draft.quantidadePedida),
        custoUnitario: Number(draft.custoUnitario),
        precoVenda: Number(draft.precoVenda),
        foto: fotoAtual,
      },
    ])
    setDraft({ ...emptyDraft, marca: draft.marca, categoria: draft.categoria })
    setFotoAtual(undefined)
  }

  function handleRemoveItem(index: number) {
    setItens((prev) => prev.filter((_, i) => i !== index))
  }

  function handleExportPdf() {
    if (!supplier) return
    exportOrderToPdf(itens, { supplierNome: supplier.nome, collectionNome: collection?.nome })
  }

  function handleExportCsv() {
    if (!supplier) return
    exportOrderToCsv(itens, { supplierNome: supplier.nome, collectionNome: collection?.nome })
  }

  function handleCreateOrder() {
    if (!collection || itens.length === 0) return
    addOrder(
      {
        supplierId: collection.supplierId,
        collectionId: collection.id,
        dataPedido,
        previsaoEntrega: undefined,
        notaFiscal: undefined,
        frete: 0,
        desconto: 0,
        impostos: 0,
        observacoes: observacoes || undefined,
        itens,
      },
      "pdf"
    )
    navigate("/pedidos-compra")
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <PageHeader
        title={`Montar Pedido — ${collection.nome}`}
        description={`${supplier?.nome ?? "Fornecedor"} · selecione a foto no catálogo e cadastre cada item pedido`}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-2">
        <PdfCropViewer pdfUrl={collection.catalogoPdfUrl} onCrop={setFotoAtual} />

        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
          <div className="space-y-3 rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
                {fotoAtual ? (
                  <img src={fotoAtual} alt="Foto do item" className="size-full object-cover" />
                ) : (
                  <ImageOff className="size-6" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Arraste sobre a foto do produto no catálogo à esquerda para anexá-la a este item.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Nome do Produto</Label>
                <Input
                  placeholder="Macacão Jardineira Xadrez"
                  value={draft.nome}
                  onChange={(e) => setDraft({ ...draft, nome: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Código do Fornecedor</Label>
                <Input
                  placeholder="FK-3321"
                  value={draft.codigoFornecedor}
                  onChange={(e) => setDraft({ ...draft, codigoFornecedor: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Categoria</Label>
                <Input
                  placeholder="Macacões"
                  value={draft.categoria}
                  onChange={(e) => setDraft({ ...draft, categoria: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Marca</Label>
                <Input
                  placeholder="Flor Kids"
                  value={draft.marca}
                  onChange={(e) => setDraft({ ...draft, marca: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Cor</Label>
                <Input
                  placeholder="Azul"
                  value={draft.cor}
                  onChange={(e) => setDraft({ ...draft, cor: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Tamanho</Label>
                <Input
                  placeholder="3"
                  value={draft.tamanho}
                  onChange={(e) => setDraft({ ...draft, tamanho: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  placeholder="12"
                  value={draft.quantidadePedida}
                  onChange={(e) => setDraft({ ...draft, quantidadePedida: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Custo Unitário</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="42.00"
                  value={draft.custoUnitario}
                  onChange={(e) => setDraft({ ...draft, custoUnitario: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Preço de Venda</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="99.90"
                  value={draft.precoVenda}
                  onChange={(e) => setDraft({ ...draft, precoVenda: e.target.value })}
                />
              </div>
            </div>

            <Button type="button" className="w-full" disabled={!draftIsValid} onClick={handleAddItem}>
              <Plus className="size-4" />
              Adicionar Item ao Pedido
            </Button>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                Itens do Pedido ({itens.length})
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={itens.length === 0}
                  onClick={handleExportPdf}
                >
                  <FileText className="size-4" />
                  Exportar PDF
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={itens.length === 0}
                  onClick={handleExportCsv}
                >
                  <FileSpreadsheet className="size-4" />
                  Exportar Excel
                </Button>
              </div>
            </div>
            {itens.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Nenhum item adicionado ainda.
              </p>
            ) : (
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Foto</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Cor/Tam.</TableHead>
                      <TableHead className="text-right">Qtd.</TableHead>
                      <TableHead className="text-right">Custo</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex size-9 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
                            {item.foto ? (
                              <img src={item.foto} alt={item.nome} className="size-full object-cover" />
                            ) : (
                              <ImageOff className="size-4" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{item.nome}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.cor}/{item.tamanho}
                        </TableCell>
                        <TableCell className="text-right">{item.quantidadePedida}</TableCell>
                        <TableCell className="text-right">
                          {item.custoUnitario.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label>Observações (opcional)</Label>
            <Input
              placeholder="Combinado com o fornecedor..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          <Button
            size="lg"
            disabled={itens.length === 0}
            onClick={handleCreateOrder}
          >
            Criar Pedido de Compra com {itens.length} {itens.length === 1 ? "item" : "itens"}
          </Button>
        </div>
      </div>
    </div>
  )
}
