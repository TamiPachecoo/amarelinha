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
import {
  stockAdjustmentSchema,
  type StockAdjustmentInput,
  type StockAdjustmentValues,
} from "@/features/inventory/schemas/stockAdjustmentSchema"
import type { InventoryRow } from "@/features/inventory/types"
import { useProductsStore } from "@/features/products/store/productsStore"

interface StockAdjustmentDialogProps {
  row: InventoryRow | null
  onOpenChange: (open: boolean) => void
}

export function StockAdjustmentDialog({ row, onOpenChange }: StockAdjustmentDialogProps) {
  const adjustVariantQuantity = useProductsStore((state) => state.adjustVariantQuantity)
  const addMovement = useMovementsStore((state) => state.addMovement)

  const form = useForm<StockAdjustmentInput, unknown, StockAdjustmentValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: { tipo: "entrada", quantidade: undefined, observacao: "" },
  })

  function handleSubmit(values: StockAdjustmentValues) {
    if (!row) return

    const delta = values.tipo === "entrada" ? values.quantidade : -values.quantidade
    adjustVariantQuantity(row.variantId, delta)
    addMovement({
      variantId: row.variantId,
      productId: row.productId,
      tipo: "ajuste",
      quantidade: delta,
      observacao: values.observacao || undefined,
    })
    form.reset({ tipo: "entrada", quantidade: undefined, observacao: "" })
    onOpenChange(false)
  }

  return (
    <Dialog open={row !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {row && (
          <>
            <DialogHeader>
              <DialogTitle>Movimentar Estoque</DialogTitle>
            </DialogHeader>
            <p className="-mt-2 text-sm text-muted-foreground">
              {row.produto} · {row.cor} · {row.tamanho}
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Movimentação</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="entrada">Entrada (adiciona ao estoque)</SelectItem>
                          <SelectItem value="ajuste">Ajuste Manual (remove do estoque)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="1"
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
                  name="observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observação (opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Motivo da movimentação" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Confirmar</Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
