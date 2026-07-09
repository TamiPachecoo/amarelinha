import { create } from "zustand"
import type { Supplier } from "@/features/suppliers/types"
import type { SupplierFormValues } from "@/features/suppliers/schemas/supplierSchema"
import { supabase } from "@/services/supabase"

function fromRow(row: Record<string, unknown>): Supplier {
  return {
    id: row.id as string,
    nome: row.nome as string,
    contatoNome: (row.contato_nome as string) ?? undefined,
    whatsapp: row.whatsapp as string,
    email: (row.email as string) ?? undefined,
    instagram: (row.instagram as string) ?? undefined,
    website: (row.website as string) ?? undefined,
    condicoesPagamento: row.condicoes_pagamento as string,
    leadTimeDias: row.lead_time_dias as number,
    observacoes: (row.observacoes as string) ?? undefined,
    ativo: row.ativo as boolean,
    createdAt: row.created_at as string,
  }
}

function toRow(supplier: Supplier) {
  return {
    id: supplier.id,
    nome: supplier.nome,
    contato_nome: supplier.contatoNome || null,
    whatsapp: supplier.whatsapp,
    email: supplier.email || null,
    instagram: supplier.instagram || null,
    website: supplier.website || null,
    condicoes_pagamento: supplier.condicoesPagamento,
    lead_time_dias: supplier.leadTimeDias,
    observacoes: supplier.observacoes || null,
    ativo: supplier.ativo,
    created_at: supplier.createdAt,
  }
}

interface SuppliersState {
  suppliers: Supplier[]
  fetchAll: () => Promise<void>
  addSupplier: (input: SupplierFormValues) => void
  updateSupplier: (id: string, input: SupplierFormValues) => void
}

export const useSuppliersStore = create<SuppliersState>((set) => ({
  suppliers: [],
  fetchAll: async () => {
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) {
      console.error("Failed to fetch suppliers", error)
      return
    }
    set({ suppliers: (data ?? []).map(fromRow) })
  },
  addSupplier: (input) => {
    const supplier: Supplier = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().slice(0, 10),
    }
    set((state) => ({ suppliers: [supplier, ...state.suppliers] }))
    supabase
      .from("suppliers")
      .insert(toRow(supplier))
      .then(({ error }) => error && console.error("Failed to insert supplier", error))
  },
  updateSupplier: (id, input) => {
    set((state) => ({
      suppliers: state.suppliers.map((supplier) =>
        supplier.id === id ? { ...supplier, ...input } : supplier
      ),
    }))
    supabase
      .from("suppliers")
      .update({
        nome: input.nome,
        contato_nome: input.contatoNome || null,
        whatsapp: input.whatsapp,
        email: input.email || null,
        instagram: input.instagram || null,
        website: input.website || null,
        condicoes_pagamento: input.condicoesPagamento,
        lead_time_dias: input.leadTimeDias,
        observacoes: input.observacoes || null,
        ativo: input.ativo,
      })
      .eq("id", id)
      .then(({ error }) => error && console.error("Failed to update supplier", error))
  },
}))
