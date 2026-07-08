import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Users } from "lucide-react"

import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CustomerForm } from "@/features/customers/components/CustomerForm"
import type { CustomerFormValues } from "@/features/customers/schemas/customerSchema"
import { useCustomersStore } from "@/features/customers/store/customersStore"

export function ClientesPage() {
  const navigate = useNavigate()
  const customers = useCustomersStore((state) => state.customers)
  const addCustomer = useCustomersStore((state) => state.addCustomer)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return customers
    return customers.filter(
      (customer) =>
        customer.nomeCompleto.toLowerCase().includes(term) ||
        customer.telefone.includes(term) ||
        customer.whatsapp.includes(term) ||
        customer.email.toLowerCase().includes(term)
    )
  }, [customers, search])

  function handleAdd(values: CustomerFormValues) {
    addCustomer(values)
    setDialogOpen(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader title="Clientes" description="Cadastro, filhos e conta de cada cliente" />
        <Button onClick={() => setDialogOpen(true)}>
          <Plus />
          Novo Cliente
        </Button>
      </div>

      <Input
        placeholder="Buscar por nome, telefone ou e-mail..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 sm:max-w-xs"
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente encontrado"
          description="Cadastre um cliente para começar a controlar compras, filhos e conta corrente."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead className="text-right">Filhos</TableHead>
                <TableHead>Cliente Desde</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/clientes/${customer.id}`)}
                >
                  <TableCell className="font-medium text-foreground">
                    {customer.nomeCompleto}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{customer.whatsapp}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                  <TableCell className="text-right">{customer.filhos.length}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.clienteDesde}</TableCell>
                  <TableCell>
                    <Badge variant={customer.ativo ? "default" : "outline"}>
                      {customer.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <CustomerForm onSubmit={handleAdd} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
