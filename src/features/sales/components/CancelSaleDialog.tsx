import { useState } from "react"
import { AlertTriangle, Undo2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatBRL } from "@/features/products/utils"
import { useSalesStore } from "@/features/sales/store/salesStore"
import type { Sale } from "@/features/sales/types"

interface CancelSaleDialogProps {
  sale: Sale | null
  productName: string
  customerName: string
  onOpenChange: (open: boolean) => void
  onCanceled?: () => void
}

export function CancelSaleDialog({
  sale,
  productName,
  customerName,
  onOpenChange,
  onCanceled,
}: CancelSaleDialogProps) {
  const cancelSale = useSalesStore((state) => state.cancelSale)
  const [isCanceling, setIsCanceling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!sale) return
    setError(null)
    setIsCanceling(true)
    const result = await cancelSale(sale.id)
    setIsCanceling(false)

    if (!result.success) {
      setError(result.error ?? "Não foi possível cancelar a venda.")
      return
    }

    onOpenChange(false)
    onCanceled?.()
  }

  function handleOpenChange(open: boolean) {
    if (isCanceling) return
    if (!open) setError(null)
    onOpenChange(open)
  }

  return (
    <Dialog open={sale !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Cancelar venda?
          </DialogTitle>
          <DialogDescription>
            Esta ação retira a venda dos registros financeiros e devolve o produto ao estoque.
          </DialogDescription>
        </DialogHeader>

        {sale && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <p className="font-semibold text-foreground">{customerName}</p>
            <p className="text-muted-foreground">
              {sale.quantidade} × {productName} · {formatBRL(sale.total)}
            </p>
            <p className="text-muted-foreground">Venda de {sale.data}</p>
          </div>
        )}

        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isCanceling}>
            Voltar
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isCanceling}>
            <Undo2 className="size-4" />
            {isCanceling ? "Cancelando..." : "Confirmar cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
