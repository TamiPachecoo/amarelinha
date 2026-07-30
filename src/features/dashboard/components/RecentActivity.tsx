import { ArrowDownCircle, ArrowUpCircle, Briefcase, Settings2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMovementsStore, type MovementType } from "@/features/inventory/store/movementsStore"
import { useProductsStore } from "@/features/products/store/productsStore"

const movementIcon: Record<MovementType, typeof ArrowDownCircle> = {
  entrada: ArrowDownCircle,
  venda: ArrowUpCircle,
  ajuste: Settings2,
  malinha: Briefcase,
}

const movementLabel: Record<MovementType, string> = {
  entrada: "Entrada",
  venda: "Venda",
  ajuste: "Ajuste",
  malinha: "Malinha Amarelinha",
}

export function RecentActivity() {
  const movements = useMovementsStore((state) => state.movements).slice(0, 6)
  const products = useProductsStore((state) => state.products)

  function describe(productId: string, variantId: string) {
    const product = products.find((p) => p.id === productId)
    const variant = product?.variants.find((v) => v.id === variantId)
    if (!product) return "Produto removido"
    return variant ? `${product.nome} · ${variant.cor}/${variant.tamanho}` : product.nome
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada ainda.</p>
        ) : (
          <ul className="space-y-3">
            {movements.map((movement) => {
              const Icon = movementIcon[movement.tipo]
              return (
                <li key={movement.id} className="flex items-center gap-3 text-sm">
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {describe(movement.productId, movement.variantId)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {movementLabel[movement.tipo]} · {movement.quantidade > 0 ? "+" : ""}
                      {movement.quantidade} un.
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{movement.data.slice(0, 10)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
