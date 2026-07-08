import { useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { ArrowLeft, Send, Trash2 } from "lucide-react"

import { PageHeader } from "@/components/shared/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useCustomersStore } from "@/features/customers/store/customersStore"
import { AddMalinhaItemForm } from "@/features/malinhas/components/AddMalinhaItemForm"
import type { AddMalinhaItemFormValues } from "@/features/malinhas/schemas/malinhaSchema"
import { useMalinhasStore } from "@/features/malinhas/store/malinhasStore"
import { malinhaStatusLabel } from "@/features/malinhas/types"
import { useProductsStore } from "@/features/products/store/productsStore"
import { formatBRL } from "@/features/products/utils"
import { useSalesStore } from "@/features/sales/store/salesStore"
import { formaPagamentoLabel, type FormaPagamento } from "@/features/sales/types"

export function MalinhaDetailPage() {
  const { malinhaId } = useParams<{ malinhaId: string }>()
  const malinhas = useMalinhasStore((state) => state.malinhas)
  const addItem = useMalinhasStore((state) => state.addItem)
  const removeItem = useMalinhasStore((state) => state.removeItem)
  const enviarMalinha = useMalinhasStore((state) => state.enviarMalinha)
  const fecharMalinha = useMalinhasStore((state) => state.fecharMalinha)
  const customers = useCustomersStore((state) => state.customers)
  const products = useProductsStore((state) => state.products)
  const sales = useSalesStore((state) => state.sales)

  const [vendidos, setVendidos] = useState<Record<string, number>>({})
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix")

  const malinha = malinhas.find((m) => m.id === malinhaId)

  if (!malinha) {
    return <Navigate to="/malinha-amarelinha" replace />
  }

  const cliente = customers.find((c) => c.id === malinha.clienteId)

  function findProduct(productId: string) {
    return products.find((p) => p.id === productId)
  }

  function findVariant(productId: string, variantId: string) {
    return findProduct(productId)?.variants.find((v) => v.id === variantId)
  }

  function handleAddItem(values: AddMalinhaItemFormValues) {
    addItem(malinha!.id, values)
  }

  function handleEnviar() {
    enviarMalinha(malinha!.id)
  }

  function handleFechar() {
    fecharMalinha(malinha!.id, { vendidos, formaPagamento })
  }

  const totalVendido = malinha.itens.reduce((sum, item) => {
    const vendida = vendidos[item.id] ?? 0
    const product = findProduct(item.productId)
    return sum + vendida * (product?.precoVenda ?? 0)
  }, 0)

  const vendasDaMalinha = sales.filter((sale) => sale.malinhaId === malinha.id)

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link to="/malinha-amarelinha">
            <ArrowLeft className="size-4" />
            Malinha Amarelinha
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <PageHeader
            title={`${malinha.numero} · ${cliente?.nomeCompleto ?? "Cliente"}`}
            description={
              malinha.observacoes || "Showroom móvel enviado para a cliente experimentar em casa"
            }
          />
          <Badge className="mt-1">{malinhaStatusLabel[malinha.status]}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Preparo</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">
            {malinha.dataPreparo}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Envio</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">
            {malinha.dataEnvio ?? "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Previsão de Devolução
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">
            {malinha.previsaoDevolucao ?? "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Devolução</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-semibold text-foreground">
            {malinha.dataDevolucao ?? "—"}
          </CardContent>
        </Card>
      </div>

      {malinha.status === "preparando" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Adicionar Item</CardTitle>
            </CardHeader>
            <CardContent>
              <AddMalinhaItemForm onAdd={handleAddItem} />
            </CardContent>
          </Card>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Itens na Malinha ({malinha.itens.length})
            </p>
            {malinha.itens.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Nenhum item adicionado ainda.
              </p>
            ) : (
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Cor/Tam.</TableHead>
                      <TableHead className="text-right">Qtd.</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {malinha.itens.map((item) => {
                      const variant = findVariant(item.productId, item.variantId)
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-foreground">
                            {findProduct(item.productId)?.nome ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {variant?.cor}/{variant?.tamanho}
                          </TableCell>
                          <TableCell className="text-right">{item.quantidade}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(malinha.id, item.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            <Button size="lg" className="w-full" disabled={malinha.itens.length === 0} onClick={handleEnviar}>
              <Send className="size-4" />
              Enviar para a Cliente
            </Button>
          </div>
        </div>
      )}

      {malinha.status === "com_cliente" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Cor/Tam.</TableHead>
                  <TableHead className="text-right">Enviada</TableHead>
                  <TableHead className="text-right">Vendida</TableHead>
                  <TableHead className="text-right">Devolvida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {malinha.itens.map((item) => {
                  const variant = findVariant(item.productId, item.variantId)
                  const vendida = vendidos[item.id] ?? 0
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-foreground">
                        {findProduct(item.productId)?.nome ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {variant?.cor}/{variant?.tamanho}
                      </TableCell>
                      <TableCell className="text-right">{item.quantidade}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={0}
                          max={item.quantidade}
                          className="ml-auto w-20 text-right"
                          value={vendida}
                          onChange={(e) =>
                            setVendidos((prev) => ({
                              ...prev,
                              [item.id]: Math.min(
                                item.quantidade,
                                Math.max(0, Number(e.target.value) || 0)
                              ),
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.quantidade - vendida}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Total vendido: <span className="font-semibold text-foreground">{formatBRL(totalVendido)}</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Forma de pagamento:</span>
                <Select value={formaPagamento} onValueChange={(v) => setFormaPagamento(v as FormaPagamento)}>
                  <SelectTrigger size="sm" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(formaPagamentoLabel).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button size="lg" onClick={handleFechar}>
              Fechar Malinha
            </Button>
          </div>
        </div>
      )}

      {malinha.status === "fechada" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Cor/Tam.</TableHead>
                  <TableHead className="text-right">Enviada</TableHead>
                  <TableHead className="text-right">Vendida</TableHead>
                  <TableHead className="text-right">Devolvida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {malinha.itens.map((item) => {
                  const variant = findVariant(item.productId, item.variantId)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-foreground">
                        {findProduct(item.productId)?.nome ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {variant?.cor}/{variant?.tamanho}
                      </TableCell>
                      <TableCell className="text-right">{item.quantidade}</TableCell>
                      <TableCell className="text-right">{item.quantidadeVendida}</TableCell>
                      <TableCell className="text-right">{item.quantidadeDevolvida}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {vendasDaMalinha.length > 0 && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="mb-1 font-semibold text-foreground">
                Vendas geradas: {formatBRL(vendasDaMalinha.reduce((sum, s) => sum + s.total, 0))}
              </p>
              <p className="text-muted-foreground">
                Forma de pagamento: {formaPagamentoLabel[vendasDaMalinha[0].formaPagamento]}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
