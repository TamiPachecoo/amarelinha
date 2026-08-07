import { create } from "zustand"
import type { Sale } from "@/features/sales/types"
import type { SaleFormValues } from "@/features/sales/schemas/saleSchema"
import { useProductsStore } from "@/features/products/store/productsStore"
import { useMovementsStore } from "@/features/inventory/store/movementsStore"
import { supabase } from "@/services/supabase"

function fromRow(row: Record<string, unknown>): Sale {
  return {
    id: row.id as string,
    clienteId: row.cliente_id as string,
    productId: row.product_id as string,
    variantId: row.variant_id as string,
    quantidade: row.quantidade as number,
    precoUnitario: Number(row.preco_unitario),
    total: Number(row.total),
    formaPagamento: row.forma_pagamento as Sale["formaPagamento"],
    data: row.data as string,
    malinhaId: (row.malinha_id as string) ?? undefined,
    emPromocao: row.em_promocao as boolean,
  }
}

function toRow(sale: Sale) {
  return {
    id: sale.id,
    cliente_id: sale.clienteId,
    product_id: sale.productId,
    variant_id: sale.variantId,
    quantidade: sale.quantidade,
    preco_unitario: sale.precoUnitario,
    total: sale.total,
    forma_pagamento: sale.formaPagamento,
    data: sale.data,
    malinha_id: sale.malinhaId || null,
    em_promocao: sale.emPromocao,
  }
}

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
  emPromocao?: boolean
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
    emPromocao: input.emPromocao ?? false,
  }
}

interface SalesState {
  sales: Sale[]
  fetchAll: () => Promise<void>
  registerSale: (input: RegisterSaleInput) => Promise<{ success: boolean; error?: string }>
  /** Usada pelo fechamento da Malinha Amarelinha: registra a venda sem
   *  mexer no estoque, porque a quantidade já saiu da loja no envio da
   *  malinha (ver `features/malinhas`). */
  recordSaleWithoutStockChange: (input: RecordSaleWithoutStockChangeInput) => Promise<{ success: boolean; error?: string }>
}

export const useSalesStore = create<SalesState>((set) => ({
  sales: [],
  fetchAll: async () => {
    const { data, error } = await supabase.from("sales").select("*").order("data", { ascending: false })
    if (error) {
      console.error("Failed to fetch sales", error)
      return
    }
    set({ sales: (data ?? []).map(fromRow) })
  },
  registerSale: async (input) => {
    const sale = buildSale(input)

    // Try to insert the sale into Supabase first
    const { error: saleError } = await supabase
      .from("sales")
      .insert(toRow(sale))

    if (saleError) {
      console.error("Failed to insert sale", saleError)
      // Return user-friendly error message
      let errorMessage = "Não foi possível registrar a venda. Tente novamente."
      if (saleError.message?.includes("cliente_id")) {
        errorMessage = "Cliente inválido. Selecione um cliente válido."
      } else if (saleError.message?.includes("product_id") || saleError.message?.includes("variant_id")) {
        errorMessage = "Produto ou variante inválido. Selecione um produto válido."
      } else if (saleError.message?.includes("connection") || saleError.message?.includes("timeout")) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente."
      }
      return { success: false, error: errorMessage }
    }

    // Only update local state after Supabase confirms the sale
    set((state) => ({ sales: [sale, ...state.sales] }))

    // Only decrease inventory after sale is persisted
    useProductsStore.getState().adjustVariantQuantity(input.variantId, -input.quantidade)
    useMovementsStore.getState().addMovement({
      variantId: input.variantId,
      productId: input.productId,
      tipo: "venda",
      quantidade: -input.quantidade,
      observacao: `Venda registrada (${input.formaPagamento})`,
    })

    return { success: true }
  },
  recordSaleWithoutStockChange: async (input) => {
    const sale = buildSale(input)

    // Try to insert the sale into Supabase first
    const { error: saleError } = await supabase
      .from("sales")
      .insert(toRow(sale))

    if (saleError) {
      console.error("Failed to insert sale", saleError)
      return { success: false, error: "Não foi possível registrar a venda. Tente novamente." }
    }

    // Only update local state after Supabase confirms the sale
    set((state) => ({ sales: [sale, ...state.sales] }))

    // Record the movement (without stock change, since inventory was already adjusted on malinha creation)
    useMovementsStore.getState().addMovement({
      variantId: input.variantId,
      productId: input.productId,
      tipo: "venda",
      quantidade: -input.quantidade,
      observacao: input.observacao ?? `Venda via Malinha Amarelinha (${input.formaPagamento})`,
    })

    return { success: true }
  },
}))
