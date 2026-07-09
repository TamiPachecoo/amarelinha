import { ImageOff } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Product } from "@/features/products/types"
import {
  custoRange,
  formatBRL,
  semEstoque,
  temEstoqueBaixo,
  totalQuantidade,
} from "@/features/products/utils"

function formatCustoRange(product: Product): string {
  const range = custoRange(product)
  if (!range) return "—"
  return range.min === range.max
    ? formatBRL(range.min)
    : `${formatBRL(range.min)} – ${formatBRL(range.max)}`
}

function getStockBadge(product: Product) {
  if (semEstoque(product)) {
    return { label: "Sem Estoque", className: "bg-destructive text-white" }
  }
  if (temEstoqueBaixo(product)) {
    return { label: "Estoque Baixo", className: "bg-brand-yellow text-accent-foreground" }
  }
  return { label: "Em Estoque", className: "bg-brand-green text-foreground" }
}

interface ProductCardProps {
  product: Product
  onView: (product: Product) => void
}

export function ProductCard({ product, onView }: ProductCardProps) {
  const stockBadge = getStockBadge(product)
  const quantidade = totalQuantidade(product)

  return (
    <Card className="overflow-hidden gap-0 py-0">
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-muted text-muted-foreground">
        {product.foto ? (
          <img src={product.foto} alt={product.nome} className="size-full object-cover" />
        ) : (
          <ImageOff className="size-10" />
        )}
      </div>

      <CardContent className="flex flex-1 flex-col gap-1 px-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold text-foreground">{product.nome}</h3>
          <Badge className={stockBadge.className}>{stockBadge.label}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {product.marca} · {product.categoria}
        </p>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-lg font-bold text-foreground">
            {formatBRL(product.precoVenda)}
          </span>
          <span className="text-sm text-muted-foreground">
            {quantidade} {quantidade === 1 ? "peça" : "peças"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Custo: {formatCustoRange(product)}</p>
      </CardContent>

      <CardFooter className="px-4 pt-3 pb-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onView(product)}
        >
          Ver Produto
        </Button>
      </CardFooter>
    </Card>
  )
}
