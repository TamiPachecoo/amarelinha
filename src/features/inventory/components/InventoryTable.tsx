import { useMemo, useState } from "react"
import { ImageOff, Settings2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/shared/EmptyState"
import type { InventoryRow, InventoryRowStatus } from "@/features/inventory/types"

const PAGE_SIZE = 8
const ALL = "todos"

const statusLabel: Record<InventoryRowStatus, { label: string; className: string }> = {
  sem_estoque: { label: "Sem Estoque", className: "bg-destructive text-white" },
  baixo: { label: "Estoque Baixo", className: "bg-brand-yellow text-accent-foreground" },
  ok: { label: "Em Estoque", className: "bg-brand-green text-foreground" },
}

interface InventoryTableProps {
  rows: InventoryRow[]
  onAdjust: (row: InventoryRow) => void
}

export function InventoryTable({ rows, onAdjust }: InventoryTableProps) {
  const [search, setSearch] = useState("")
  const [categoria, setCategoria] = useState(ALL)
  const [marca, setMarca] = useState(ALL)
  const [localizacao, setLocalizacao] = useState(ALL)
  const [status, setStatus] = useState<typeof ALL | InventoryRowStatus>(ALL)
  const [page, setPage] = useState(1)

  const categorias = useMemo(() => Array.from(new Set(rows.map((r) => r.categoria))), [rows])
  const marcas = useMemo(() => Array.from(new Set(rows.map((r) => r.marca))), [rows])
  const localizacoes = useMemo(() => Array.from(new Set(rows.map((r) => r.localizacao))), [rows])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesSearch =
        term.length === 0 ||
        row.produto.toLowerCase().includes(term) ||
        row.variante.toLowerCase().includes(term) ||
        row.cor.toLowerCase().includes(term) ||
        row.tamanho.toLowerCase().includes(term) ||
        row.localizacao.toLowerCase().includes(term)

      return (
        matchesSearch &&
        (categoria === ALL || row.categoria === categoria) &&
        (marca === ALL || row.marca === marca) &&
        (localizacao === ALL || row.localizacao === localizacao) &&
        (status === ALL || row.status === status)
      )
    })
  }, [rows, search, categoria, marca, localizacao, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          placeholder="Buscar por produto, cor, tamanho ou localização..."
          value={search}
          onChange={(e) => updateFilter(setSearch, e.target.value)}
          className="sm:max-w-xs"
        />

        <Select value={categoria} onValueChange={(v) => updateFilter(setCategoria, v)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as categorias</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={marca} onValueChange={(v) => updateFilter(setMarca, v)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as marcas</SelectItem>
            {marcas.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={localizacao} onValueChange={(v) => updateFilter(setLocalizacao, v)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Localização" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as localizações</SelectItem>
            {localizacoes.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => updateFilter((val) => setStatus(val as typeof status), v)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os status</SelectItem>
            <SelectItem value="ok">Em Estoque</SelectItem>
            <SelectItem value="baixo">Estoque Baixo</SelectItem>
            <SelectItem value="sem_estoque">Sem Estoque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ImageOff}
          title="Nenhum item encontrado"
          description="Ajuste a busca ou os filtros para ver outros produtos."
        />
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foto</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Variante</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Estoque Mínimo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((row) => (
                  <TableRow key={row.variantId}>
                    <TableCell>
                      <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
                        {row.foto ? (
                          <img src={row.foto} alt={row.produto} className="size-full object-cover" />
                        ) : (
                          <ImageOff className="size-4" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{row.produto}</TableCell>
                    <TableCell className="text-muted-foreground">{row.marca}</TableCell>
                    <TableCell className="text-muted-foreground">{row.categoria}</TableCell>
                    <TableCell className="text-muted-foreground">{row.variante}</TableCell>
                    <TableCell className="text-muted-foreground">{row.cor}</TableCell>
                    <TableCell className="text-muted-foreground">{row.tamanho}</TableCell>
                    <TableCell className="text-muted-foreground">📍 {row.localizacao}</TableCell>
                    <TableCell className="text-right font-medium">{row.quantidade}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {row.estoqueMinimo}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusLabel[row.status].className}>
                        {statusLabel[row.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => onAdjust(row)}>
                        <Settings2 className="size-4" />
                        Movimentar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
