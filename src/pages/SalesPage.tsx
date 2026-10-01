import { useState } from "react"
import { CheckCircle2, Plus, ShoppingCart, Undo2 } from "lucide-react"

import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CustomerForm } from "@/features/customers/components/CustomerForm"
import type { CustomerFormValues } from "@/features/customers/schemas/customerSchema"
import type { ChildFormValues } from "@/features/customers/schemas/childSchema"
import { useCustomersStore } from "@/features/customers/store/customersStore"
import { SaleForm } from "@/features/sales/components/SaleForm"
import { CancelSaleDialog } from "@/features/sales/components/CancelSaleDialog"
import { useSalesStore } from "@/features/sales/store/salesStore"
import type { Sale } from "@/features/sales/types"
import { useProductsStore } from "@/features/products/store/productsStore"
import { formatBRL } from "@/features/products/utils"

export function SalesPage() {
  const addCustomer = useCustomersStore((state) => state.addCustomer)
  const customers = useCustomersStore((state) => state.customers)
  const products = useProductsStore((state) => state.products)
  const sales = useSalesStore((state) => state.sales)
  const [newCustomerOpen, setNewCustomerOpen] = useState(false)
  const [createdCustomerId, setCreatedCustomerId] = useState<string | undefined>(undefined)
  const [customerError, setCustomerError] = useState<string | null>(null)
  const [saleSuccess, setSaleSuccess] = useState(false)
  const [cancelingSale, setCancelingSale] = useState<Sale | null>(null)
  const [cancelFeedback, setCancelFeedback] = useState<string | null>(null)

  async function handleNewCustomer(values: CustomerFormValues, filhos: ChildFormValues[]) {
    setCustomerError(null)
    try {
      const id = await addCustomer(values, filhos)
      setCreatedCustomerId(id)
      setNewCustomerOpen(false)
    } catch (error) {
      setCustomerError(error instanceof Error ? error.message : "Não foi possível cadastrar o cliente.")
    }
  }

  const createdCustomer = createdCustomerId ? customers.find((c) => c.id === createdCustomerId) : undefined
  const recentSales = sales.slice(0, 10)

  function customerName(id: string) {
    return customers.find((customer) => customer.id === id)?.nomeCompleto ?? "Cliente"
  }

  function productName(id: string) {
    return products.find((product) => product.id === id)?.nome ?? "Produto"
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="Registrar Venda" description="Registre uma venda rapidamente, no computador ou no celular." />
        <Button variant="outline" onClick={() => { setCustomerError(null); setNewCustomerOpen(true) }}>
          <Plus className="size-4" /> Novo Cliente
        </Button>
      </div>

      {saleSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm">
          <CheckCircle2 className="size-5 text-primary" />
          Venda registrada com sucesso.
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShoppingCart className="size-5" />
          <p className="font-semibold">Nova venda</p>
        </div>
        {createdCustomer && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted p-3 text-sm">
            <span>Cliente novo selecionado: <strong>{createdCustomer.nomeCompleto}</strong></span>
            <Button size="sm" variant="ghost" onClick={() => setCreatedCustomerId(undefined)}>Escolher outro</Button>
          </div>
        )}
        <SaleForm
          key={createdCustomerId ?? "existing-customer"}
          clienteId={createdCustomerId}
          onSuccess={() => { setSaleSuccess(true); setCreatedCustomerId(undefined) }}
          onCancel={() => setCreatedCustomerId(undefined)}
        />
      </div>

      {cancelFeedback && (
        <p className="rounded-md border border-brand-green/40 bg-brand-green/10 px-3 py-2 text-sm text-foreground">
          {cancelFeedback}
        </p>
      )}

      {recentSales.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <p className="mb-3 font-semibold">Vendas recentes</p>
          <ul className="divide-y divide-border">
            {recentSales.map((sale) => (
              <li key={sale.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{customerName(sale.clienteId)}</p>
                  <p className="text-muted-foreground">
                    {sale.quantidade} × {productName(sale.productId)} · {formatBRL(sale.total)} · {sale.data}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => { setCancelFeedback(null); setCancelingSale(sale) }}
                >
                  <Undo2 className="size-4" /> Cancelar
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={newCustomerOpen} onOpenChange={setNewCustomerOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Cadastrar Novo Cliente</DialogTitle></DialogHeader>
          {customerError && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{customerError}</p>}
          <CustomerForm onSubmit={handleNewCustomer} onCancel={() => setNewCustomerOpen(false)} />
        </DialogContent>
      </Dialog>

      <CancelSaleDialog
        sale={cancelingSale}
        customerName={cancelingSale ? customerName(cancelingSale.clienteId) : ""}
        productName={cancelingSale ? productName(cancelingSale.productId) : ""}
        onOpenChange={(open) => !open && setCancelingSale(null)}
        onCanceled={() => {
          setSaleSuccess(false)
          setCancelFeedback("Venda cancelada. O financeiro e o estoque foram atualizados.")
        }}
      />
    </div>
  )
}
