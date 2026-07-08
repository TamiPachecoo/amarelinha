import { create } from "zustand"
import type { Collection } from "@/features/collections/types"
import type { CollectionFormValues } from "@/features/collections/schemas/collectionSchema"
import { SUPPLIER_SEED_IDS } from "@/features/suppliers/store/suppliersStore"

export const COLLECTION_SEED_IDS = {
  verao2027: "col-verao-2027",
  inverno2027: "col-inverno-2027",
} as const

const seedCollections: Collection[] = [
  {
    id: COLLECTION_SEED_IDS.verao2027,
    supplierId: SUPPLIER_SEED_IDS.florKids,
    nome: "Verão 2027",
    temporada: "Verão",
    ano: 2027,
    status: "ativa",
    dataImportacao: "2026-06-10",
    createdAt: "2026-06-10",
  },
  {
    id: COLLECTION_SEED_IDS.inverno2027,
    supplierId: SUPPLIER_SEED_IDS.babyBear,
    nome: "Inverno 2027",
    temporada: "Inverno",
    ano: 2027,
    status: "planejada",
    dataImportacao: undefined,
    createdAt: "2026-06-25",
  },
]

export interface NewCollectionInput extends CollectionFormValues {
  catalogoPdfUrl?: string
  catalogoPdfNome?: string
}

interface CollectionsState {
  collections: Collection[]
  addCollection: (input: NewCollectionInput) => void
  updateCollection: (id: string, input: NewCollectionInput) => void
}

export const useCollectionsStore = create<CollectionsState>((set) => ({
  collections: seedCollections,
  addCollection: (input) =>
    set((state) => ({
      collections: [
        {
          ...input,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...state.collections,
      ],
    })),
  updateCollection: (id, input) =>
    set((state) => ({
      collections: state.collections.map((collection) =>
        collection.id === id ? { ...collection, ...input } : collection
      ),
    })),
}))
