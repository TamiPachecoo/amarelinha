import { create } from "zustand"
import type { Collection } from "@/features/collections/types"
import type { CollectionFormValues } from "@/features/collections/schemas/collectionSchema"
import { supabase } from "@/services/supabase"

function fromRow(row: Record<string, unknown>): Collection {
  return {
    id: row.id as string,
    supplierId: row.supplier_id as string,
    nome: row.nome as string,
    temporada: row.temporada as string,
    ano: row.ano as number,
    status: row.status as Collection["status"],
    catalogoPdfUrl: (row.catalogo_pdf_url as string) ?? undefined,
    catalogoPdfNome: (row.catalogo_pdf_nome as string) ?? undefined,
    dataImportacao: (row.data_importacao as string) ?? undefined,
    createdAt: row.created_at as string,
  }
}

function toRow(collection: Collection) {
  return {
    id: collection.id,
    supplier_id: collection.supplierId,
    nome: collection.nome,
    temporada: collection.temporada,
    ano: collection.ano,
    status: collection.status,
    catalogo_pdf_url: collection.catalogoPdfUrl || null,
    catalogo_pdf_nome: collection.catalogoPdfNome || null,
    data_importacao: collection.dataImportacao || null,
    created_at: collection.createdAt,
  }
}

export interface NewCollectionInput extends CollectionFormValues {
  catalogoPdfUrl?: string
  catalogoPdfNome?: string
}

interface CollectionsState {
  collections: Collection[]
  fetchAll: () => Promise<void>
  addCollection: (input: NewCollectionInput) => void
  updateCollection: (id: string, input: NewCollectionInput) => void
}

export const useCollectionsStore = create<CollectionsState>((set) => ({
  collections: [],
  fetchAll: async () => {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) {
      console.error("Failed to fetch collections", error)
      return
    }
    set({ collections: (data ?? []).map(fromRow) })
  },
  addCollection: (input) => {
    const collection: Collection = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().slice(0, 10),
    }
    set((state) => ({ collections: [collection, ...state.collections] }))
    supabase
      .from("collections")
      .insert(toRow(collection))
      .then(({ error }) => error && console.error("Failed to insert collection", error))
  },
  updateCollection: (id, input) => {
    set((state) => ({
      collections: state.collections.map((collection) =>
        collection.id === id ? { ...collection, ...input } : collection
      ),
    }))
    supabase
      .from("collections")
      .update({
        supplier_id: input.supplierId,
        nome: input.nome,
        temporada: input.temporada,
        ano: input.ano,
        status: input.status,
        catalogo_pdf_url: input.catalogoPdfUrl || null,
        catalogo_pdf_nome: input.catalogoPdfNome || null,
      })
      .eq("id", id)
      .then(({ error }) => error && console.error("Failed to update collection", error))
  },
}))
