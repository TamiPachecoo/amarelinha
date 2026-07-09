import { create } from "zustand"
import type { PurchaseOrderPayment } from "@/features/financial/types"
import { supabase } from "@/services/supabase"

function fromRow(row: Record<string, unknown>): PurchaseOrderPayment {
  return {
    id: row.id as string,
    purchaseOrderId: row.purchase_order_id as string,
    formaPagamento: row.forma_pagamento as PurchaseOrderPayment["formaPagamento"],
    numeroParcela: row.numero_parcela as number,
    totalParcelas: row.total_parcelas as number,
    valor: Number(row.valor),
    dataVencimento: row.data_vencimento as string,
    pago: row.pago as boolean,
    dataPagamento: (row.data_pagamento as string) ?? undefined,
  }
}

function toRow(payment: PurchaseOrderPayment) {
  return {
    id: payment.id,
    purchase_order_id: payment.purchaseOrderId,
    forma_pagamento: payment.formaPagamento,
    numero_parcela: payment.numeroParcela,
    total_parcelas: payment.totalParcelas,
    valor: payment.valor,
    data_vencimento: payment.dataVencimento,
    pago: payment.pago,
    data_pagamento: payment.dataPagamento || null,
  }
}

interface PaymentsState {
  payments: PurchaseOrderPayment[]
  fetchAll: () => Promise<void>
  addPayments: (payments: Array<Omit<PurchaseOrderPayment, "id">>) => void
  markPaid: (id: string, pago: boolean) => void
}

export const usePaymentsStore = create<PaymentsState>((set) => ({
  payments: [],
  fetchAll: async () => {
    const { data, error } = await supabase
      .from("purchase_order_payments")
      .select("*")
      .order("data_vencimento", { ascending: true })
    if (error) {
      console.error("Failed to fetch purchase order payments", error)
      return
    }
    set({ payments: (data ?? []).map(fromRow) })
  },
  addPayments: (payments) => {
    const records: PurchaseOrderPayment[] = payments.map((payment) => ({
      ...payment,
      id: crypto.randomUUID(),
    }))
    set((state) => ({ payments: [...state.payments, ...records] }))
    supabase
      .from("purchase_order_payments")
      .insert(records.map(toRow))
      .then(({ error }) => error && console.error("Failed to insert payments", error))
  },
  markPaid: (id, pago) => {
    const dataPagamento = pago ? new Date().toISOString().slice(0, 10) : undefined
    set((state) => ({
      payments: state.payments.map((payment) =>
        payment.id === id ? { ...payment, pago, dataPagamento } : payment
      ),
    }))
    supabase
      .from("purchase_order_payments")
      .update({ pago, data_pagamento: dataPagamento || null })
      .eq("id", id)
      .then(({ error }) => error && console.error("Failed to update payment", error))
  },
}))
