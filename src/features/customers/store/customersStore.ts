import { create } from "zustand"
import type { Child, Customer, PaymentRecord } from "@/features/customers/types"
import type { CustomerFormValues } from "@/features/customers/schemas/customerSchema"
import type { ChildFormValues } from "@/features/customers/schemas/childSchema"

export const CUSTOMER_SEED_IDS = {
  ana: "cli-ana-paula",
  bruna: "cli-bruna-lima",
} as const

const seedCustomers: Customer[] = [
  {
    id: CUSTOMER_SEED_IDS.ana,
    nomeCompleto: "Ana Paula Souza",
    telefone: "(31) 3222-1010",
    whatsapp: "(31) 99876-5432",
    email: "anapaula.souza@example.com",
    instagram: "@anapaulasouza",
    facebook: "",
    cpf: "123.456.789-00",
    endereco: {
      cep: "30140-071",
      logradouro: "Rua da Bahia",
      numero: "1200",
      complemento: "Apto 302",
      bairro: "Funcionários",
      cidade: "Belo Horizonte",
      estado: "MG",
    },
    observacoes: "Prefere ser contatada pelo WhatsApp após as 18h.",
    clienteDesde: "2024-03-10",
    ativo: true,
    filhos: [
      {
        id: crypto.randomUUID(),
        nome: "Beatriz",
        sexo: "feminino",
        dataNascimento: "2021-05-14",
        tamanhoRoupa: "4",
        numeracaoCalcado: "25",
        observacoes: "Alérgica a tecido sintético",
      },
    ],
    limiteCredito: 500,
    dataVencimento: "2026-07-15",
    historicoPagamentos: [
      { id: crypto.randomUUID(), data: "2026-06-05", valor: 80, observacao: "Pagamento parcial" },
    ],
  },
  {
    id: CUSTOMER_SEED_IDS.bruna,
    nomeCompleto: "Bruna Lima Andrade",
    telefone: "(31) 3333-2020",
    whatsapp: "(31) 98765-4321",
    email: "bruna.lima@example.com",
    instagram: "@brunalima",
    facebook: "bruna.lima.andrade",
    cpf: "",
    endereco: {
      cep: "30380-000",
      logradouro: "Av. Raja Gabaglia",
      numero: "2000",
      complemento: "",
      bairro: "Estoril",
      cidade: "Belo Horizonte",
      estado: "MG",
    },
    observacoes: "",
    clienteDesde: "2025-01-20",
    ativo: true,
    filhos: [
      {
        id: crypto.randomUUID(),
        nome: "Théo",
        sexo: "masculino",
        dataNascimento: "2023-09-02",
        tamanhoRoupa: "2",
        numeracaoCalcado: "21",
      },
      {
        id: crypto.randomUUID(),
        nome: "Laura",
        sexo: "feminino",
        dataNascimento: "2019-12-20",
        tamanhoRoupa: "6",
        numeracaoCalcado: "28",
      },
    ],
    limiteCredito: 300,
    dataVencimento: "2026-05-10",
    historicoPagamentos: [],
  },
]

interface CustomersState {
  customers: Customer[]
  addCustomer: (input: CustomerFormValues) => void
  updateCustomer: (id: string, input: CustomerFormValues) => void
  addChild: (customerId: string, input: ChildFormValues) => void
  registerPayment: (customerId: string, payment: Omit<PaymentRecord, "id">) => void
}

export const useCustomersStore = create<CustomersState>((set) => ({
  customers: seedCustomers,
  addCustomer: (input) =>
    set((state) => ({
      customers: [
        {
          ...input,
          id: crypto.randomUUID(),
          clienteDesde: new Date().toISOString().slice(0, 10),
          filhos: [],
          historicoPagamentos: [],
        },
        ...state.customers,
      ],
    })),
  updateCustomer: (id, input) =>
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === id ? { ...customer, ...input } : customer
      ),
    })),
  addChild: (customerId, input) =>
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              filhos: [...customer.filhos, { ...input, id: crypto.randomUUID() } as Child],
            }
          : customer
      ),
    })),
  registerPayment: (customerId, payment) =>
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              historicoPagamentos: [
                { ...payment, id: crypto.randomUUID() },
                ...customer.historicoPagamentos,
              ],
            }
          : customer
      ),
    })),
}))
