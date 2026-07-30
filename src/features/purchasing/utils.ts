import type { PurchaseOrder, PurchaseOrderItem } from "@/features/purchasing/types"

export function itemTotal(item: PurchaseOrderItem): number {
  return item.quantidadePedida * item.custoUnitario
}

export function orderSubtotal(order: PurchaseOrder): number {
  return order.itens.reduce((sum, item) => sum + itemTotal(item), 0)
}

export function orderTotal(order: PurchaseOrder): number {
  return orderSubtotal(order) + order.frete - order.desconto
}

export function isFullyReceived(order: PurchaseOrder): boolean {
  return order.itens.every((item) => item.quantidadeRecebida >= item.quantidadePedida)
}

export function isPartiallyReceived(order: PurchaseOrder): boolean {
  return order.itens.some((item) => item.quantidadeRecebida > 0) && !isFullyReceived(order)
}

export function pendingQuantity(item: PurchaseOrderItem): number {
  return Math.max(0, item.quantidadePedida - item.quantidadeRecebida)
}
