import { create } from "zustand"
import type { Child, Customer, PaymentRecord } from "@/features/customers/types"
import type { CustomerFormValues } from "@/features/customers/schemas/customerSchema"
import type { ChildFormValues } from "@/features/customers/schemas/childSchema"
import { supabase } from "@/services/supabase"

function childFromRow(row: Record<string, unknown>): Child {
  return {
    id: row.id as string,
    nome: row.nome as string,
    sexo: row.sexo as Child["sexo"],
    dataNascimento: row.data_nascimento as string,
    tamanhoRoupa: row.tamanho_roupa as string,
    observacoes: (row.observacoes as string) ?? undefined,
  }
}

function childToRow(child: Child, customerId: string) {
  return {
    id: child.id,
    customer_id: customerId,
    nome: child.nome,
    sexo: child.sexo,
    data_nascimento: child.dataNascimento,
    tamanho_roupa: child.tamanhoRoupa,
    observacoes: child.observacoes || null,
  }
}

function paymentFromRow(row: Record<string, unknown>): PaymentRecord {
  return {
    id: row.id as string,
    data: row.data as string,
    valor: Number(row.valor),
    observacao: (row.observacao as string) ?? undefined,
  }
}

function paymentToRow(payment: PaymentRecord, customerId: string) {
  return {
    id: payment.id,
    customer_id: customerId,
    data: payment.data,
    valor: payment.valor,
    observacao: payment.observacao || null,
  }
}

function customerFromRow(row: Record<string, unknown>): Omit<Customer, "filhos" | "historicoPagamentos"> {
  return {
    id: row.id as string,
    nomeCompleto: row.nome_completo as string,
    whatsapp: row.whatsapp as string,
    email: row.email as string,
    instagram: (row.instagram as string) ?? undefined,
    facebook: (row.facebook as string) ?? undefined,
    cpf: (row.cpf as string) ?? undefined,
    endereco: row.endereco as Customer["endereco"],
    observacoes: (row.observacoes as string) ?? undefined,
    clienteDesde: row.cliente_desde as string,
    ativo: row.ativo as boolean,
    limiteCredito: Number(row.limite_credito),
    dataVencimento: row.data_vencimento as string,
  }
}

function customerToRow(customer: Customer) {
  return {
    id: customer.id,
    nome_completo: customer.nomeCompleto,
    whatsapp: customer.whatsapp,
    email: customer.email,
    instagram: customer.instagram || null,
    facebook: customer.facebook || null,
    cpf: customer.cpf || null,
    endereco: customer.endereco,
    observacoes: customer.observacoes || null,
    cliente_desde: customer.clienteDesde,
    ativo: customer.ativo,
    limite_credito: customer.limiteCredito,
    data_vencimento: customer.dataVencimento || null,
  }
}

interface CustomersState {
  customers: Customer[]
  fetchAll: () => Promise<void>
  addCustomer: (input: CustomerFormValues, filhos?: ChildFormValues[]) => void
  updateCustomer: (id: string, input: CustomerFormValues) => void
  addChild: (customerId: string, input: ChildFormValues) => void
  updateChild: (customerId: string, childId: string, input: ChildFormValues) => void
  deleteChild: (customerId: string, childId: string) => void
  registerPayment: (customerId: string, payment: Omit<PaymentRecord, "id">) => void
}

export const useCustomersStore = create<CustomersState>((set) => ({
  customers: [],
  fetchAll: async () => {
    const [customersRes, childrenRes, paymentsRes] = await Promise.all([
      supabase.from("customers").select("*").order("cliente_desde", { ascending: false }),
      supabase.from("children").select("*"),
      supabase.from("payment_records").select("*").order("data", { ascending: false }),
    ])
    if (customersRes.error) {
      console.error("Failed to fetch customers", customersRes.error)
      return
    }
    if (childrenRes.error) console.error("Failed to fetch children", childrenRes.error)
    if (paymentsRes.error) console.error("Failed to fetch payment records", paymentsRes.error)

    const childrenByCustomer = new Map<string, Child[]>()
    for (const row of childrenRes.data ?? []) {
      const customerId = row.customer_id as string
      const list = childrenByCustomer.get(customerId) ?? []
      list.push(childFromRow(row))
      childrenByCustomer.set(customerId, list)
    }
    const paymentsByCustomer = new Map<string, PaymentRecord[]>()
    for (const row of paymentsRes.data ?? []) {
      const customerId = row.customer_id as string
      const list = paymentsByCustomer.get(customerId) ?? []
      list.push(paymentFromRow(row))
      paymentsByCustomer.set(customerId, list)
    }

    const customers = (customersRes.data ?? []).map((row) => ({
      ...customerFromRow(row),
      filhos: childrenByCustomer.get(row.id as string) ?? [],
      historicoPagamentos: paymentsByCustomer.get(row.id as string) ?? [],
    }))
    set({ customers })
  },
  addCustomer: (input, filhosInput = []) => {
    const filhos: Child[] = filhosInput.map((filho) => ({ ...filho, id: crypto.randomUUID() }) as Child)
    const customer: Customer = {
      ...input,
      id: crypto.randomUUID(),
      clienteDesde: new Date().toISOString().slice(0, 10),
      filhos,
      historicoPagamentos: [],
    }
    set((state) => ({ customers: [customer, ...state.customers] }))
    supabase
      .from("customers")
      .insert(customerToRow(customer))
      .then(({ error }) => {
        if (error) {
          console.error("Failed to insert customer", error)
          return
        }
        if (filhos.length > 0) {
          supabase
            .from("children")
            .insert(filhos.map((filho) => childToRow(filho, customer.id)))
            .then(({ error: childrenError }) => {
              if (childrenError) console.error("Failed to insert children", childrenError)
            })
        }
      })
  },
  updateCustomer: (id, input) => {
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === id ? { ...customer, ...input } : customer
      ),
    }))
    supabase
      .from("customers")
      .update({
        nome_completo: input.nomeCompleto,
        whatsapp: input.whatsapp,
        email: input.email,
        instagram: input.instagram || null,
        facebook: input.facebook || null,
        cpf: input.cpf || null,
        endereco: input.endereco,
        observacoes: input.observacoes || null,
        ativo: input.ativo,
        limite_credito: input.limiteCredito,
        data_vencimento: input.dataVencimento || null,
      })
      .eq("id", id)
      .then(({ error }) => error && console.error("Failed to update customer", error))
  },
  addChild: (customerId, input) => {
    const child: Child = { ...input, id: crypto.randomUUID() } as Child
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === customerId
          ? { ...customer, filhos: [...customer.filhos, child] }
          : customer
      ),
    }))
    supabase
      .from("children")
      .insert(childToRow(child, customerId))
      .then(({ error }) => error && console.error("Failed to insert child", error))
  },
  updateChild: (customerId, childId, input) => {
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              filhos: customer.filhos.map((child) =>
                child.id === childId ? { ...child, ...input } : child
              ),
            }
          : customer
      ),
    }))
    supabase
      .from("children")
      .update(childToRow({ ...input, id: childId } as Child, customerId))
      .eq("id", childId)
      .then(({ error }) => error && console.error("Failed to update child", error))
  },
  deleteChild: (customerId, childId) => {
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === customerId
          ? { ...customer, filhos: customer.filhos.filter((child) => child.id !== childId) }
          : customer
      ),
    }))
    supabase
      .from("children")
      .delete()
      .eq("id", childId)
      .then(({ error }) => error && console.error("Failed to delete child", error))
  },
  registerPayment: (customerId, payment) => {
    const record: PaymentRecord = { ...payment, id: crypto.randomUUID() }
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === customerId
          ? { ...customer, historicoPagamentos: [record, ...customer.historicoPagamentos] }
          : customer
      ),
    }))
    supabase
      .from("payment_records")
      .insert(paymentToRow(record, customerId))
      .then(({ error }) => error && console.error("Failed to insert payment record", error))
  },
}))
