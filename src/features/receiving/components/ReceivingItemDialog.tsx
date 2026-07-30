import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useMovementsStore } from "@/features/inventory/store/movementsStore"
import { useLocationsStore } from "@/features/locations/store/locationsStore"
import { useProductsStore } from "@/features/products/store/productsStore"
import type { ProductSourceType } from "@/features/products/types"
import type { OrderOrigin, PurchaseOrder, PurchaseOrderItem } from "@/features/purchasing/types"
import { pendingQuantity } from "@/features/purchasing/utils"

const orderOriginToSourceType: Record<OrderOrigin, ProductSourceType> = {
  manual: "manual",
  pdf: "catalogo_pdf",
  site: "site",
  excel: "excel",
}
import { usePurchaseOrdersStore } from "@/features/purchasing/store/purchaseOrdersStore"
import {
  makeReceivingSchema,
  type ReceivingFormInput,
  type ReceivingFormValues,
} from "@/features/receiving/schemas/receivingSchema"

interface ReceivingItemDialogProps {
  order: PurchaseOrder | null
  item: PurchaseOrderItem | null
  onOpenChange: (open: boolean) => void
}

export function ReceivingItemDialog({ order, item, onOpenChange }: ReceivingItemDialogProps) {
  const products = useProductsStore((state) => state.products)
  const receiveVariant = useProductsStore((state) => state.receiveVariant)
  const createFromReceiving = useProductsStore((state) => state.createFromReceiving)
  const addMovement = useMovementsStore((state) => state.addMovement)
  const receiveItem = usePurchaseOrdersStore((state) => state.receiveItem)
  const locations = useLocationsStore((state) => state.locations)

  const pendente = item ? pendingQuantity(item) : 0
  const schema = useMemo(() => makeReceivingSchema(Math.max(1, pendente)), [pendente])

  // Se o item já tem uma variante vinculada (recebimento parcial anterior),
  // sugere a localização atual dela como padrão — mas o campo continua editável.
  const existingLocationId = useMemo(() => {
    if (!item?.variantId) return ""
    for (const product of products) {
      const variant = product.variants.find((v) => v.id === item.variantId)
      if (variant) return variant.localizacaoId
    }
    return ""
  }, [item?.variantId, products])

  const form = useForm<ReceivingFormInput, unknown, ReceivingFormValues>({
    resolver: zodResolver(schema),
    values: {
      quantidadeRecebida: pendente,
      quantidadeAvariada: 0,
      localizacaoId: existingLocationId,
      observacao: "",
    },
  })

  function handleSubmit(values: ReceivingFormValues) {
    if (!order || !item) return

    const quantidadeBoa = values.quantidadeRecebida - values.quantidadeAvariada
    const observacao = [
      `Recebimento do pedido ${order.numero}`,
      values.quantidadeAvariada > 0 ? `${values.quantidadeAvariada} unidade(s) avariada(s)` : null,
      values.observacao || null,
    ]
      .filter(Boolean)
      .join(" — ")

    let productId = item.productId
    let variantId = item.variantId

    if (quantidadeBoa > 0) {
      if (!productId || !variantId) {
        const created = createFromReceiving({
          nome: item.nome,
          sku: item.codigoFornecedor,
          categoria: item.categoria,
          marca: item.marca,
          precoVenda: item.precoVenda,
          cor: item.cor,
          tamanho: item.tamanho,
          localizacaoId: values.localizacaoId,
          quantidadeRecebida: quantidadeBoa,
          custoUnitario: item.custoUnitario,
          purchaseOrderItemId: item.id,
          foto: item.foto,
          origem: {
            tipo: orderOriginToSourceType[order.origem],
            supplierId: order.supplierId,
            collectionId: order.collectionId,
            codigoOriginal: item.codigoFornecedor,
            imagemOriginalUrl: item.foto,
            importadoEm: new Date().toISOString(),
            purchaseOrderId: order.id,
          },
        })
        productId = created.productId
        variantId = created.variantId
      } else {
        receiveVariant(variantId, quantidadeBoa, item.custoUnitario, values.localizacaoId)
      }

      addMovement({
        variantId,
        productId,
        tipo: "entrada",
        quantidade: quantidadeBoa,
        observacao,
      })
    }

    receiveItem(order.id, item.id, values.quantidadeRecebida, { productId: productId!, variantId: variantId! })
    onOpenChange(false)
  }

  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {item && order && (
          <>
            <DialogHeader>
              <DialogTitle>Receber Item</DialogTitle>
            </DialogHeader>
            <p className="-mt-2 text-sm text-muted-foreground">
              {item.nome} · {item.cor} · {item.tamanho} — pendente: {pendente}
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
                <FormField
                  control={form.control}
                  name="quantidadeRecebida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade Recebida Agora</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={pendente}
                          {...field}
                          value={field.value as string | number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantidadeAvariada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dessas, quantas avariadas/faltando</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          value={field.value as string | number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="localizacaoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Onde vai ficar na loja</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione a localização" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observação (opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detalhes da divergência, se houver" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Confirmar Recebimento</Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
