import { create } from "zustand"
import type {
  OrderOrigin,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStatus,
} from "@/features/purchasing/types"
import type { PurchaseOrderFormValues } from "@/features/purchasing/schemas/purchaseOrderSchema"
import { isFullyReceived, isPartiallyReceived } from "@/features/purchasing/utils"
import { supabase } from "@/services/supabase"

function itemFromRow(row: Record<string, unknown>): PurchaseOrderItem {
  return {
    id: row.id as string,
    codigoFornecedor: row.codigo_fornecedor as string,
    nome: row.nome as string,
    categoria: row.categoria as string,
    marca: row.marca as string,
    cor: row.cor as string,
    tamanho: row.tamanho as string,
    quantidadePedida: row.quantidade_pedida as number,
    quantidadeRecebida: row.quantidade_recebida as number,
    custoUnitario: Number(row.custo_unitario),
    precoVenda: Number(row.preco_venda),
    foto: (row.foto as string) ?? undefined,
    productId: (row.product_id as string) ?? undefined,
    variantId: (row.variant_id as string) ?? undefined,
  }
}

function itemToRow(item: PurchaseOrderItem, purchaseOrderId: string) {
  return {
    id: item.id,
    purchase_order_id: purchaseOrderId,
    codigo_fornecedor: item.codigoFornecedor,
    nome: item.nome,
    categoria: item.categoria,
    marca: item.marca,
    cor: item.cor,
    tamanho: item.tamanho,
    quantidade_pedida: item.quantidadePedida,
    quantidade_recebida: item.quantidadeRecebida,
    custo_unitario: item.custoUnitario,
    preco_venda: item.precoVenda,
    foto: item.foto || null,
    product_id: item.productId || null,
    variant_id: item.variantId || null,
  }
}

function orderFromRow(row: Record<string, unknown>): Omit<PurchaseOrder, "itens"> {
  return {
    id: row.id as string,
    numero: row.numero as string,
    supplierId: row.supplier_id as string,
    collectionId: (row.collection_id as string) ?? undefined,
    status: row.status as PurchaseOrderStatus,
    origem: row.origem as OrderOrigin,
    dataPedido: row.data_pedido as string,
    previsaoEntrega: (row.previsao_entrega as string) ?? undefined,
    notaFiscal: (row.nota_fiscal as string) ?? undefined,
    frete: Number(row.frete),
    desconto: Number(row.desconto),
    observacoes: (row.observacoes as string) ?? undefined,
    createdAt: row.created_at as string,
  }
}

function orderToRow(order: PurchaseOrder) {
  return {
    id: order.id,
    numero: order.numero,
    supplier_id: order.supplierId,
    collection_id: order.collectionId || null,
    status: order.status,
    origem: order.origem,
    data_pedido: order.dataPedido,
    previsao_entrega: order.previsaoEntrega || null,
    nota_fiscal: order.notaFiscal || null,
    frete: order.frete,
    desconto: order.desconto,
    observacoes: order.observacoes || null,
    created_at: order.createdAt,
  }
}

async function requireSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) {
    throw new Error("Sua sessão expirou. Entre novamente no sistema e tente de novo.")
  }
}

let orderCounter = 0

interface PurchaseOrdersState {
  orders: PurchaseOrder[]
  fetchAll: () => Promise<void>
  addOrder: (input: PurchaseOrderFormValues, origem?: OrderOrigin) => Promise<string>
  updateOrder: (id: string, input: PurchaseOrderFormValues) => Promise<void>
  updateStatus: (id: string, status: PurchaseOrderStatus) => void
  deleteOrder: (id: string) => Promise<string | null>
  receiveItem: (
    orderId: string,
    itemId: string,
    quantidadeAgora: number,
    linked?: { productId: string; variantId: string }
  ) => void
}

export const usePurchaseOrdersStore = create<PurchaseOrdersState>((set, get) => ({
  orders: [],
  fetchAll: async () => {
    const [ordersRes, itemsRes] = await Promise.all([
      supabase.from("purchase_orders").select("*").order("created_at", { ascending: false }),
      supabase.from("purchase_order_items").select("*"),
    ])
    if (ordersRes.error) {
      console.error("Failed to fetch purchase orders", ordersRes.error)
      return
    }
    if (itemsRes.error) {
      console.error("Failed to fetch purchase order items", itemsRes.error)
      return
    }
    const itemsByOrder = new Map<string, PurchaseOrderItem[]>()
    for (const row of itemsRes.data ?? []) {
      const orderId = row.purchase_order_id as string
      const list = itemsByOrder.get(orderId) ?? []
      list.push(itemFromRow(row))
      itemsByOrder.set(orderId, list)
    }
    const orders = (ordersRes.data ?? []).map((row) => ({
      ...orderFromRow(row),
      itens: itemsByOrder.get(row.id as string) ?? [],
    }))
    orderCounter = Math.max(
      orders.length,
      ...orders.map((order) => Number(order.numero.replace(/\D/g, "")) || 0),
      0
    )
    set({ orders })
  },
  addOrder: async (input, origem = "manual") => {
    await requireSession()
    orderCounter += 1
    const order: PurchaseOrder = {
      id: crypto.randomUUID(),
      numero: `PC-${String(orderCounter).padStart(4, "0")}`,
      supplierId: input.supplierId,
      collectionId: input.collectionId || undefined,
      status: "rascunho",
      origem,
      dataPedido: input.dataPedido,
      previsaoEntrega: input.previsaoEntrega || undefined,
      notaFiscal: input.notaFiscal || undefined,
      frete: input.frete,
      desconto: input.desconto,
      observacoes: input.observacoes || undefined,
      itens: input.itens.map((item) => ({ ...item, id: crypto.randomUUID(), quantidadeRecebida: 0 })),
      createdAt: new Date().toISOString().slice(0, 10),
    }

    const { error: orderError } = await supabase.from("purchase_orders").insert(orderToRow(order))
    if (orderError) {
      orderCounter -= 1
      console.error("Failed to insert purchase order", orderError)
      throw new Error(orderError.message || "Não foi possível salvar o pedido de compra.")
    }

    const { error: itemsError } = await supabase
      .from("purchase_order_items")
      .insert(order.itens.map((item) => itemToRow(item, order.id)))

    if (itemsError) {
      await supabase.from("purchase_orders").delete().eq("id", order.id)
      orderCounter -= 1
      console.error("Failed to insert purchase order items", itemsError)
      throw new Error(itemsError.message || "Não foi possível salvar os itens do pedido.")
    }

    set((state) => ({ orders: [order, ...state.orders] }))
    return order.id
  },
  updateOrder: async (id, input) => {
    await requireSession()
    const current = get().orders.find((order) => order.id === id)
    if (!current) throw new Error("Pedido não encontrado.")
    if (current.status === "recebido" || current.status === "parcialmente_recebido") {
      throw new Error("Pedidos com recebimento registrado não podem ser editados.")
    }

    const updated: PurchaseOrder = {
      ...current,
      supplierId: input.supplierId,
      collectionId: input.collectionId || undefined,
      dataPedido: input.dataPedido,
      previsaoEntrega: input.previsaoEntrega || undefined,
      notaFiscal: input.notaFiscal || undefined,
      frete: input.frete,
      desconto: input.desconto,
      observacoes: input.observacoes || undefined,
      itens: input.itens.map((item, index) => ({
        ...item,
        id: current.itens[index]?.id ?? crypto.randomUUID(),
        quantidadeRecebida: current.itens[index]?.quantidadeRecebida ?? 0,
        productId: current.itens[index]?.productId,
        variantId: current.itens[index]?.variantId,
      })),
    }

    const { error: orderError } = await supabase
      .from("purchase_orders")
      .update(orderToRow(updated))
      .eq("id", id)
    if (orderError) {
      console.error("Failed to update purchase order", orderError)
      throw new Error(orderError.message || "Não foi possível atualizar o pedido.")
    }

    const oldItems = current.itens.map((item) => itemToRow(item, id))
    const { error: deleteError } = await supabase.from("purchase_order_items").delete().eq("purchase_order_id", id)
    if (deleteError) {
      console.error("Failed to replace purchase order items", deleteError)
      throw new Error(deleteError.message || "Não foi possível atualizar os itens do pedido.")
    }

    const { error: insertError } = await supabase
      .from("purchase_order_items")
      .insert(updated.itens.map((item) => itemToRow(item, id)))
    if (insertError) {
      console.error("Failed to insert updated purchase order items", insertError)
      await supabase.from("purchase_order_items").insert(oldItems)
      throw new Error(insertError.message || "Não foi possível atualizar os itens do pedido.")
    }

    set((state) => ({
      orders: state.orders.map((order) => (order.id === id ? updated : order)),
    }))
  },
  updateStatus: (id, status) => {
    set((state) => ({
      orders: state.orders.map((order) => (order.id === id ? { ...order, status } : order)),
    }))
    supabase
      .from("purchase_orders")
      .update({ status })
      .eq("id", id)
      .then(({ error }) => error && console.error("Failed to update purchase order status", error))
  },
  receiveItem: (orderId, itemId, quantidadeAgora, linked) => {
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId) return order

        const itens = order.itens.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantidadeRecebida: item.quantidadeRecebida + quantidadeAgora,
                productId: item.productId ?? linked?.productId,
                variantId: item.variantId ?? linked?.variantId,
              }
            : item
        )
        const updatedOrder = { ...order, itens }
        const status: PurchaseOrderStatus = isFullyReceived(updatedOrder)
          ? "recebido"
          : isPartiallyReceived(updatedOrder)
            ? "parcialmente_recebido"
            : order.status

        return { ...updatedOrder, status }
      }),
    }))

    const order = get().orders.find((o) => o.id === orderId)
    const item = order?.itens.find((i) => i.id === itemId)
    if (order && item) {
      supabase
        .from("purchase_order_items")
        .update({
          quantidade_recebida: item.quantidadeRecebida,
          product_id: item.productId || null,
          variant_id: item.variantId || null,
        })
        .eq("id", itemId)
        .then(({ error }) => error && console.error("Failed to update purchase order item", error))
      if (order.status !== "rascunho") {
        supabase
          .from("purchase_orders")
          .update({ status: order.status })
          .eq("id", orderId)
          .then(({ error }) => error && console.error("Failed to update purchase order status", error))
      }
    }
  },
  deleteOrder: async (id) => {
    const { error } = await supabase.from("purchase_orders").delete().eq("id", id)
    if (error) {
      if (error.code === "23503") {
        return "Não é possível excluir: itens deste pedido já geraram produtos no estoque."
      }
      console.error("Failed to delete purchase order", error)
      return "Não foi possível excluir o pedido."
    }
    set((state) => ({ orders: state.orders.filter((o) => o.id !== id) }))
    return null
  },
}))
