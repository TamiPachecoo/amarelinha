export interface Supplier {
  id: string
  nome: string
  contatoNome?: string
  whatsapp: string
  email?: string
  instagram?: string
  website?: string
  condicoesPagamento: string
  leadTimeDias: number
  observacoes?: string
  ativo: boolean
  createdAt: string
}
