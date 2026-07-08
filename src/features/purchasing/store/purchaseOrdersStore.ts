import { create } from "zustand"
import type { OrderOrigin, PurchaseOrder, PurchaseOrderStatus } from "@/features/purchasing/types"
import type { PurchaseOrderFormValues } from "@/features/purchasing/schemas/purchaseOrderSchema"
import { isFullyReceived, isPartiallyReceived } from "@/features/purchasing/utils"
import { SUPPLIER_SEED_IDS } from "@/features/suppliers/store/suppliersStore"
import { COLLECTION_SEED_IDS } from "@/features/collections/store/collectionsStore"

export const PURCHASE_ORDER_SEED_IDS = {
  pc0001: "po-0001",
  pc0002: "po-0002",
} as const

const seedOrders: PurchaseOrder[] = [
  {
    id: PURCHASE_ORDER_SEED_IDS.pc0001,
    numero: "PC-0001",
    supplierId: SUPPLIER_SEED_IDS.florKids,
    collectionId: COLLECTION_SEED_IDS.verao2027,
    status: "confirmado",
    origem: "manual",
    dataPedido: "2026-06-15",
    previsaoEntrega: "2026-06-30",
    notaFiscal: "",
    frete: 45,
    desconto: 0,
    impostos: 0,
    observacoes: "Entrega combinada para retirada em transportadora.",
    itens: [
      {
        id: crypto.randomUUID(),
        codigoFornecedor: "FK-3321",
        nome: "Macacão Jardineira Xadrez",
        categoria: "Macacões",
        marca: "Flor Kids",
        cor: "Azul",
        tamanho: "3",
        quantidadePedida: 12,
        quantidadeRecebida: 0,
        custoUnitario: 42,
        precoVenda: 99.9,
      },
      {
        id: crypto.randomUUID(),
        codigoFornecedor: "FK-3355",
        nome: "Saída de Maternidade Renda",
        categoria: "Enxoval",
        marca: "Flor Kids",
        cor: "Branco",
        tamanho: "RN",
        quantidadePedida: 6,
        quantidadeRecebida: 0,
        custoUnitario: 58,
        precoVenda: 139.9,
      },
    ],
    createdAt: "2026-06-15",
  },
  {
    id: PURCHASE_ORDER_SEED_IDS.pc0002,
    numero: "PC-0002",
    supplierId: SUPPLIER_SEED_IDS.babyBear,
    collectionId: COLLECTION_SEED_IDS.inverno2027,
    status: "rascunho",
    origem: "manual",
    dataPedido: "2026-07-01",
    previsaoEntrega: "",
    notaFiscal: "",
    frete: 0,
    desconto: 0,
    impostos: 0,
    observacoes: "",
    itens: [
      {
        id: crypto.randomUUID(),
        codigoFornecedor: "BB-9910",
        nome: "Casaco Tricot Ursinho",
        categoria: "Casacos",
        marca: "Baby Bear",
        cor: "Bege",
        tamanho: "4",
        quantidadePedida: 10,
        quantidadeRecebida: 0,
        custoUnitario: 60,
        precoVenda: 149.9,
      },
    ],
    createdAt: "2026-07-01",
  },
]

let orderCounter = seedOrders.length

interface PurchaseOrdersState {
  orders: PurchaseOrder[]
  addOrder: (input: PurchaseOrderFormValues, origem?: OrderOrigin) => void
  updateStatus: (id: string, status: PurchaseOrderStatus) => void
  receiveItem: (
    orderId: string,
    itemId: string,
    quantidadeAgora: number,
    linked?: { productId: string; variantId: string }
  ) => void
}

export const usePurchaseOrdersStore = create<PurchaseOrdersState>((set) => ({
  orders: seedOrders,
  addOrder: (input, origem = "manual") => {
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
      impostos: input.impostos,
      observacoes: input.observacoes || undefined,
      itens: input.itens.map((item) => ({ ...item, id: crypto.randomUUID(), quantidadeRecebida: 0 })),
      createdAt: new Date().toISOString().slice(0, 10),
    }
    set((state) => ({ orders: [order, ...state.orders] }))
  },
  updateStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((order) => (order.id === id ? { ...order, status } : order)),
    })),
  receiveItem: (orderId, itemId, quantidadeAgora, linked) =>
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
    })),
}))
