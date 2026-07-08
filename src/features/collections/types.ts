export type CollectionStatus = "planejada" | "ativa" | "encerrada"

export interface Collection {
  id: string
  supplierId: string
  nome: string
  temporada: string
  ano: number
  status: CollectionStatus
  catalogoPdfUrl?: string
  catalogoPdfNome?: string
  dataImportacao?: string
  createdAt: string
}

export const collectionStatusLabel: Record<CollectionStatus, string> = {
  planejada: "Planejada",
  ativa: "Ativa",
  encerrada: "Encerrada",
}
