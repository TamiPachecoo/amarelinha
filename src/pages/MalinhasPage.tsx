import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Briefcase, Plus } from "lucide-react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCustomersStore } from "@/features/customers/store/customersStore"
import { CreateMalinhaForm } from "@/features/malinhas/components/CreateMalinhaForm"
import type { CreateMalinhaFormValues } from "@/features/malinhas/schemas/malinhaSchema"
import { useMalinhasStore } from "@/features/malinhas/store/malinhasStore"
import { malinhaStatusLabel, type MalinhaStatus } from "@/features/malinhas/types"

const statusVariant: Record<MalinhaStatus, "default" | "outline" | "secondary"> = {
  preparando: "outline",
  com_cliente: "default",
  fechada: "secondary",
}

export function MalinhasPage() {
  const navigate = useNavigate()
  const malinhas = useMalinhasStore((state) => state.malinhas)
  const createMalinha = useMalinhasStore((state) => state.createMalinha)
  const customers = useCustomersStore((state) => state.customers)
  const [isDialogOpen, setDialogOpen] = useState(false)

  function customerName(id: string) {
    return customers.find((c) => c.id === id)?.nomeCompleto ?? "—"
  }

  function handleCreate(values: CreateMalinhaFormValues) {
    const id = createMalinha(values)
    setDialogOpen(false)
    navigate(`/malinha-amarelinha/${id}`)
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <PageHeader
          title="Malinha Amarelinha"
          description="Showroom móvel: produtos emprestados para clientes experimentarem em casa"
        />
        <Button onClick={() => setDialogOpen(true)}>
          <Plus />
          Nova Malinha
        </Button>
      </div>

      {malinhas.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Nenhuma malinha criada"
          description="Crie uma malinha para enviar produtos a uma cliente experimentar em casa."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Envio</TableHead>
                <TableHead>Previsão de Devolução</TableHead>
                <TableHead className="text-right">Itens</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {malinhas.map((malinha) => (
                <TableRow
                  key={malinha.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/malinha-amarelinha/${malinha.id}`)}
                >
                  <TableCell className="font-medium text-foreground">{malinha.numero}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {customerName(malinha.clienteId)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[malinha.status]}>
                      {malinhaStatusLabel[malinha.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{malinha.dataEnvio ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {malinha.previsaoDevolucao ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">{malinha.itens.length}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Gerenciar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Malinha</DialogTitle>
          </DialogHeader>
          <CreateMalinhaForm onSubmit={handleCreate} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
