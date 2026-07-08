import { useState } from "react"
import { Boxes } from "lucide-react"

import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ReceivingItemDialog } from "@/features/receiving/components/ReceivingItemDialog"
import { usePurchaseOrdersStore } from "@/features/purchasing/store/purchaseOrdersStore"
import type { PurchaseOrder, PurchaseOrderItem } from "@/features/purchasing/types"
import { purchaseOrderStatusLabel } from "@/features/purchasing/types"
import { pendingQuantity } from "@/features/purchasing/utils"
import { useSuppliersStore } from "@/features/suppliers/store/suppliersStore"

export function ReceivingPage() {
  const orders = usePurchaseOrdersStore((state) => state.orders)
  const suppliers = useSuppliersStore((state) => state.suppliers)
  const [receiving, setReceiving] = useState<{ order: PurchaseOrder; item: PurchaseOrderItem } | null>(null)

  const pendingOrders = orders.filter(
    (order) => order.status === "confirmado" || order.status === "parcialmente_recebido"
  )

  function supplierName(id: string) {
    return suppliers.find((s) => s.id === id)?.nome ?? "—"
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recebimento"
        description="Confira os itens recebidos de cada pedido — o estoque só é atualizado a partir daqui"
      />

      {pendingOrders.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="Nenhum pedido aguardando recebimento"
          description="Pedidos precisam estar com status Confirmado para aparecer aqui."
        />
      ) : (
        <div className="space-y-4">
          {pendingOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                  {order.numero} · {supplierName(order.supplierId)}
                </CardTitle>
                <Badge variant="secondary">{purchaseOrderStatusLabel[order.status]}</Badge>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Cor / Tamanho</TableHead>
                      <TableHead className="text-right">Pedida</TableHead>
                      <TableHead className="text-right">Recebida</TableHead>
                      <TableHead className="text-right">Pendente</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.itens.map((item) => {
                      const pendente = pendingQuantity(item)
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-foreground">{item.nome}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.cor} / {item.tamanho}
                          </TableCell>
                          <TableCell className="text-right">{item.quantidadePedida}</TableCell>
                          <TableCell className="text-right">{item.quantidadeRecebida}</TableCell>
                          <TableCell className="text-right">{pendente}</TableCell>
                          <TableCell className="text-right">
                            {pendente > 0 ? (
                              <Button size="sm" onClick={() => setReceiving({ order, item })}>
                                Receber
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Completo</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ReceivingItemDialog
        order={receiving?.order ?? null}
        item={receiving?.item ?? null}
        onOpenChange={(open) => !open && setReceiving(null)}
      />
    </div>
  )
}
