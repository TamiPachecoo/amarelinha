import { create } from "zustand"
import type { Sale } from "@/features/sales/types"
import type { SaleFormValues } from "@/features/sales/schemas/saleSchema"
import { CUSTOMER_SEED_IDS } from "@/features/customers/store/customersStore"
import { PRODUCT_SEED_IDS, useProductsStore } from "@/features/products/store/productsStore"
import { useMovementsStore } from "@/features/inventory/store/movementsStore"

const seedSales: Sale[] = [
  {
    id: crypto.randomUUID(),
    clienteId: CUSTOMER_SEED_IDS.ana,
    productId: PRODUCT_SEED_IDS.vestidoFloral.productId,
    variantId: PRODUCT_SEED_IDS.vestidoFloral.variantId,
    quantidade: 1,
    precoUnitario: 129.9,
    total: 129.9,
    formaPagamento: "pix",
    data: "2026-06-02",
  },
  {
    id: crypto.randomUUID(),
    clienteId: CUSTOMER_SEED_IDS.ana,
    productId: PRODUCT_SEED_IDS.conjuntoMoletom.productId,
    variantId: PRODUCT_SEED_IDS.conjuntoMoletom.variantId,
    quantidade: 1,
    precoUnitario: 89.9,
    total: 89.9,
    formaPagamento: "conta_cliente",
    data: "2026-06-20",
  },
  {
    id: crypto.randomUUID(),
    clienteId: CUSTOMER_SEED_IDS.bruna,
    productId: PRODUCT_SEED_IDS.vestidoFloral.productId,
    variantId: PRODUCT_SEED_IDS.vestidoFloral.variantId,
    quantidade: 2,
    precoUnitario: 129.9,
    total: 259.8,
    formaPagamento: "cartao",
    data: "2026-05-15",
  },
]

interface RegisterSaleInput extends SaleFormValues {
  precoUnitario: number
}

interface RecordSaleWithoutStockChangeInput {
  clienteId: string
  productId: string
  variantId: string
  quantidade: number
  precoUnitario: number
  formaPagamento: Sale["formaPagamento"]
  malinhaId: string
  observacao?: string
}

function buildSale(input: {
  clienteId: string
  productId: string
  variantId: string
  quantidade: number
  precoUnitario: number
  formaPagamento: Sale["formaPagamento"]
  malinhaId?: string
}): Sale {
  return {
    id: crypto.randomUUID(),
    clienteId: input.clienteId,
    productId: input.productId,
    variantId: input.variantId,
    quantidade: input.quantidade,
    precoUnitario: input.precoUnitario,
    total: input.precoUnitario * input.quantidade,
    formaPagamento: input.formaPagamento,
    data: new Date().toISOString().slice(0, 10),
    malinhaId: input.malinhaId,
  }
}

interface SalesState {
  sales: Sale[]
  registerSale: (input: RegisterSaleInput) => void
  /** Usada pelo fechamento da Malinha Amarelinha: registra a venda sem
   *  mexer no estoque, porque a quantidade já saiu da loja no envio da
   *  malinha (ver `features/malinhas`). */
  recordSaleWithoutStockChange: (input: RecordSaleWithoutStockChangeInput) => void
}

export const useSalesStore = create<SalesState>((set) => ({
  sales: seedSales,
  registerSale: (input) => {
    const sale = buildSale(input)
    set((state) => ({ sales: [sale, ...state.sales] }))

    useProductsStore.getState().adjustVariantQuantity(input.variantId, -input.quantidade)
    useMovementsStore.getState().addMovement({
      variantId: input.variantId,
      productId: input.productId,
      tipo: "venda",
      quantidade: -input.quantidade,
      observacao: `Venda registrada (${input.formaPagamento})`,
    })
  },
  recordSaleWithoutStockChange: (input) => {
    const sale = buildSale(input)
    set((state) => ({ sales: [sale, ...state.sales] }))

    useMovementsStore.getState().addMovement({
      variantId: input.variantId,
      productId: input.productId,
      tipo: "venda",
      quantidade: -input.quantidade,
      observacao: input.observacao ?? `Venda via Malinha Amarelinha (${input.formaPagamento})`,
    })
  },
}))
