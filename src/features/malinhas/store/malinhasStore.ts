import { create } from "zustand"
import type { Malinha } from "@/features/malinhas/types"
import type { CreateMalinhaFormValues } from "@/features/malinhas/schemas/malinhaSchema"
import { CUSTOMER_SEED_IDS } from "@/features/customers/store/customersStore"
import { PRODUCT_SEED_IDS, useProductsStore } from "@/features/products/store/productsStore"
import { useMovementsStore } from "@/features/inventory/store/movementsStore"
import { useSalesStore } from "@/features/sales/store/salesStore"
import type { FormaPagamento } from "@/features/sales/types"

const seedMalinhas: Malinha[] = [
  {
    id: "malinha-0001",
    numero: "ML-0001",
    clienteId: CUSTOMER_SEED_IDS.bruna,
    status: "com_cliente",
    dataPreparo: "2026-07-01",
    dataEnvio: "2026-07-02",
    previsaoDevolucao: "2026-07-09",
    itens: [
      {
        id: crypto.randomUUID(),
        productId: PRODUCT_SEED_IDS.vestidoFloral.productId,
        variantId: PRODUCT_SEED_IDS.vestidoFloral.variantId,
        quantidade: 2,
        quantidadeVendida: 0,
        quantidadeDevolvida: 0,
      },
    ],
    observacoes: "Cliente pediu para levar em dois tamanhos para experimentar.",
    createdAt: "2026-07-01",
  },
]

let malinhaCounter = seedMalinhas.length

interface FecharMalinhaInput {
  vendidos: Record<string, number>
  formaPagamento: FormaPagamento
}

interface MalinhasState {
  malinhas: Malinha[]
  createMalinha: (input: CreateMalinhaFormValues) => string
  addItem: (malinhaId: string, input: { productId: string; variantId: string; quantidade: number }) => void
  removeItem: (malinhaId: string, itemId: string) => void
  enviarMalinha: (malinhaId: string) => void
  fecharMalinha: (malinhaId: string, input: FecharMalinhaInput) => void
}

export const useMalinhasStore = create<MalinhasState>((set, get) => ({
  malinhas: seedMalinhas,
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
    return id
  },
  addItem: (malinhaId, input) =>
    set((state) => ({
      malinhas: state.malinhas.map((malinha) =>
        malinha.id === malinhaId
          ? {
              ...malinha,
              itens: [
                ...malinha.itens,
                {
                  id: crypto.randomUUID(),
                  productId: input.productId,
                  variantId: input.variantId,
                  quantidade: input.quantidade,
                  quantidadeVendida: 0,
                  quantidadeDevolvida: 0,
                },
              ],
            }
          : malinha
      ),
    })),
  removeItem: (malinhaId, itemId) =>
    set((state) => ({
      malinhas: state.malinhas.map((malinha) =>
        malinha.id === malinhaId
          ? { ...malinha, itens: malinha.itens.filter((item) => item.id !== itemId) }
          : malinha
      ),
    })),
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

    set((state) => ({
      malinhas: state.malinhas.map((m) =>
        m.id === malinhaId
          ? { ...m, status: "com_cliente", dataEnvio: new Date().toISOString().slice(0, 10) }
          : m
      ),
    }))
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

      return { ...item, quantidadeVendida: vendida, quantidadeDevolvida: devolvida }
    })

    set((state) => ({
      malinhas: state.malinhas.map((m) =>
        m.id === malinhaId
          ? {
              ...m,
              itens: itensAtualizados,
              status: "fechada",
              dataDevolucao: new Date().toISOString().slice(0, 10),
            }
          : m
      ),
    }))
  },
}))
