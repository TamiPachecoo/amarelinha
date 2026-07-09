import { create } from "zustand"
import type { Malinha, MalinhaItem } from "@/features/malinhas/types"
import type { CreateMalinhaFormValues } from "@/features/malinhas/schemas/malinhaSchema"
import { useProductsStore } from "@/features/products/store/productsStore"
import { useMovementsStore } from "@/features/inventory/store/movementsStore"
import { useSalesStore } from "@/features/sales/store/salesStore"
import type { FormaPagamento } from "@/features/sales/types"
import { supabase } from "@/services/supabase"

function itemFromRow(row: Record<string, unknown>): MalinhaItem {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    variantId: row.variant_id as string,
    quantidade: row.quantidade as number,
    quantidadeVendida: row.quantidade_vendida as number,
    quantidadeDevolvida: row.quantidade_devolvida as number,
  }
}

function itemToRow(item: MalinhaItem, malinhaId: string) {
  return {
    id: item.id,
    malinha_id: malinhaId,
    product_id: item.productId,
    variant_id: item.variantId,
    quantidade: item.quantidade,
    quantidade_vendida: item.quantidadeVendida,
    quantidade_devolvida: item.quantidadeDevolvida,
  }
}

function malinhaFromRow(row: Record<string, unknown>): Omit<Malinha, "itens"> {
  return {
    id: row.id as string,
    numero: row.numero as string,
    clienteId: row.cliente_id as string,
    status: row.status as Malinha["status"],
    dataPreparo: row.data_preparo as string,
    dataEnvio: (row.data_envio as string) ?? undefined,
    previsaoDevolucao: (row.previsao_devolucao as string) ?? undefined,
    dataDevolucao: (row.data_devolucao as string) ?? undefined,
    observacoes: (row.observacoes as string) ?? undefined,
    createdAt: row.created_at as string,
  }
}

function malinhaToRow(malinha: Malinha) {
  return {
    id: malinha.id,
    numero: malinha.numero,
    cliente_id: malinha.clienteId,
    status: malinha.status,
    data_preparo: malinha.dataPreparo,
    data_envio: malinha.dataEnvio || null,
    previsao_devolucao: malinha.previsaoDevolucao || null,
    data_devolucao: malinha.dataDevolucao || null,
    observacoes: malinha.observacoes || null,
    created_at: malinha.createdAt,
  }
}

let malinhaCounter = 0

interface FecharMalinhaInput {
  vendidos: Record<string, number>
  formaPagamento: FormaPagamento
}

interface MalinhasState {
  malinhas: Malinha[]
  fetchAll: () => Promise<void>
  createMalinha: (input: CreateMalinhaFormValues) => string
  addItem: (malinhaId: string, input: { productId: string; variantId: string; quantidade: number }) => void
  removeItem: (malinhaId: string, itemId: string) => void
  enviarMalinha: (malinhaId: string) => void
  fecharMalinha: (malinhaId: string, input: FecharMalinhaInput) => void
}

export const useMalinhasStore = create<MalinhasState>((set, get) => ({
  malinhas: [],
  fetchAll: async () => {
    const [malinhasRes, itemsRes] = await Promise.all([
      supabase.from("malinhas").select("*").order("created_at", { ascending: false }),
      supabase.from("malinha_itens").select("*"),
    ])
    if (malinhasRes.error) {
      console.error("Failed to fetch malinhas", malinhasRes.error)
      return
    }
    if (itemsRes.error) {
      console.error("Failed to fetch malinha itens", itemsRes.error)
      return
    }
    const itemsByMalinha = new Map<string, MalinhaItem[]>()
    for (const row of itemsRes.data ?? []) {
      const malinhaId = row.malinha_id as string
      const list = itemsByMalinha.get(malinhaId) ?? []
      list.push(itemFromRow(row))
      itemsByMalinha.set(malinhaId, list)
    }
    const malinhas = (malinhasRes.data ?? []).map((row) => ({
      ...malinhaFromRow(row),
      itens: itemsByMalinha.get(row.id as string) ?? [],
    }))
    malinhaCounter = malinhas.length
    set({ malinhas })
  },
  createMalinha: (input) => {
    malinhaCounter += 1
    const id = crypto.randomUUID()
    const malinha: Malinha = {
      id,
      numero: `ML-${String(malinhaCounter).padStart(4, "0")}`,
      clienteId: input.clienteId,
      status: "preparando",
      dataPreparo: new Date().toISOString().slice(0, 10),
      previsaoDevolucao: input.previsaoDevolucao || undefined,
      itens: [],
      observacoes: input.observacoes || undefined,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ malinhas: [malinha, ...state.malinhas] }))
    supabase
      .from("malinhas")
      .insert(malinhaToRow(malinha))
      .then(({ error }) => error && console.error("Failed to insert malinha", error))
    return id
  },
  addItem: (malinhaId, input) => {
    const item: MalinhaItem = {
      id: crypto.randomUUID(),
      productId: input.productId,
      variantId: input.variantId,
      quantidade: input.quantidade,
      quantidadeVendida: 0,
      quantidadeDevolvida: 0,
    }
    set((state) => ({
      malinhas: state.malinhas.map((malinha) =>
        malinha.id === malinhaId ? { ...malinha, itens: [...malinha.itens, item] } : malinha
      ),
    }))
    supabase
      .from("malinha_itens")
      .insert(itemToRow(item, malinhaId))
      .then(({ error }) => error && console.error("Failed to insert malinha item", error))
  },
  removeItem: (malinhaId, itemId) => {
    set((state) => ({
      malinhas: state.malinhas.map((malinha) =>
        malinha.id === malinhaId
          ? { ...malinha, itens: malinha.itens.filter((item) => item.id !== itemId) }
          : malinha
      ),
    }))
    supabase
      .from("malinha_itens")
      .delete()
      .eq("id", itemId)
      .then(({ error }) => error && console.error("Failed to delete malinha item", error))
  },
  enviarMalinha: (malinhaId) => {
    const malinha = get().malinhas.find((m) => m.id === malinhaId)
    if (!malinha || malinha.itens.length === 0) return

    for (const item of malinha.itens) {
      useProductsStore.getState().adjustVariantQuantity(item.variantId, -item.quantidade)
      useMovementsStore.getState().addMovement({
        variantId: item.variantId,
        productId: item.productId,
        tipo: "malinha",
        quantidade: -item.quantidade,
        observacao: `Enviado com a ${malinha.numero} para o cliente`,
      })
    }

    const dataEnvio = new Date().toISOString().slice(0, 10)
    set((state) => ({
      malinhas: state.malinhas.map((m) =>
        m.id === malinhaId ? { ...m, status: "com_cliente", dataEnvio } : m
      ),
    }))
    supabase
      .from("malinhas")
      .update({ status: "com_cliente", data_envio: dataEnvio })
      .eq("id", malinhaId)
      .then(({ error }) => error && console.error("Failed to update malinha on envio", error))
  },
  fecharMalinha: (malinhaId, input) => {
    const malinha = get().malinhas.find((m) => m.id === malinhaId)
    if (!malinha) return

    const products = useProductsStore.getState().products

    const itensAtualizados = malinha.itens.map((item) => {
      const vendida = Math.min(item.quantidade, Math.max(0, input.vendidos[item.id] ?? 0))
      const devolvida = item.quantidade - vendida

      if (vendida > 0) {
        const product = products.find((p) => p.id === item.productId)
        useSalesStore.getState().recordSaleWithoutStockChange({
          clienteId: malinha.clienteId,
          productId: item.productId,
          variantId: item.variantId,
          quantidade: vendida,
          precoUnitario: product?.precoVenda ?? 0,
          formaPagamento: input.formaPagamento,
          malinhaId: malinha.id,
          observacao: `Venda via ${malinha.numero} (${input.formaPagamento})`,
        })
      }

      if (devolvida > 0) {
        useProductsStore.getState().adjustVariantQuantity(item.variantId, devolvida)
        useMovementsStore.getState().addMovement({
          variantId: item.variantId,
          productId: item.productId,
          tipo: "malinha",
          quantidade: devolvida,
          observacao: `Devolvido da ${malinha.numero} ao estoque`,
        })
      }

      supabase
        .from("malinha_itens")
        .update({ quantidade_vendida: vendida, quantidade_devolvida: devolvida })
        .eq("id", item.id)
        .then(({ error }) => error && console.error("Failed to update malinha item on fechamento", error))

      return { ...item, quantidadeVendida: vendida, quantidadeDevolvida: devolvida }
    })

    const dataDevolucao = new Date().toISOString().slice(0, 10)
    set((state) => ({
      malinhas: state.malinhas.map((m) =>
        m.id === malinhaId
          ? { ...m, itens: itensAtualizados, status: "fechada", dataDevolucao }
          : m
      ),
    }))
    supabase
      .from("malinhas")
      .update({ status: "fechada", data_devolucao: dataDevolucao })
      .eq("id", malinhaId)
      .then(({ error }) => error && console.error("Failed to update malinha on fechamento", error))
  },
}))
