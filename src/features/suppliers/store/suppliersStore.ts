import { create } from "zustand"
import type { Supplier } from "@/features/suppliers/types"
import type { SupplierFormValues } from "@/features/suppliers/schemas/supplierSchema"

export const SUPPLIER_SEED_IDS = {
  florKids: "sup-flor-kids",
  babyBear: "sup-baby-bear",
} as const

const seedSuppliers: Supplier[] = [
  {
    id: SUPPLIER_SEED_IDS.florKids,
    nome: "Flor Kids Confecções",
    contatoNome: "Marcelo Vieira",
    telefone: "(11) 3456-7890",
    whatsapp: "(11) 98888-1234",
    email: "vendas@florkids.example.com",
    instagram: "@florkidsconfeccoes",
    website: "https://florkids.example.com",
    condicoesPagamento: "30/60 dias",
    leadTimeDias: 15,
    observacoes: "Pedido mínimo de R$ 1.500 por coleção.",
    ativo: true,
    createdAt: "2025-11-02",
  },
  {
    id: SUPPLIER_SEED_IDS.babyBear,
    nome: "Baby Bear Malharia",
    contatoNome: "Fernanda Alves",
    telefone: "(47) 3222-5566",
    whatsapp: "(47) 99911-2233",
    email: "fernanda@babybear.example.com",
    instagram: "@babybearmalharia",
    website: "",
    condicoesPagamento: "À vista com 10% de desconto ou 30 dias",
    leadTimeDias: 25,
    observacoes: "",
    ativo: true,
    createdAt: "2026-01-15",
  },
]

interface SuppliersState {
  suppliers: Supplier[]
  addSupplier: (input: SupplierFormValues) => void
  updateSupplier: (id: string, input: SupplierFormValues) => void
}

export const useSuppliersStore = create<SuppliersState>((set) => ({
  suppliers: seedSuppliers,
  addSupplier: (input) =>
    set((state) => ({
      suppliers: [
        {
          ...input,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...state.suppliers,
      ],
    })),
  updateSupplier: (id, input) =>
    set((state) => ({
      suppliers: state.suppliers.map((supplier) =>
        supplier.id === id ? { ...supplier, ...input } : supplier
      ),
    })),
}))
