import type { Location } from "@/features/locations/types"
import type { Product } from "@/features/products/types"
import type { InventoryRow } from "@/features/inventory/types"

export function buildInventoryRows(products: Product[], locations: Location[]): InventoryRow[] {
  const locationName = (locationId: string) =>
    locations.find((location) => location.id === locationId)?.nome ?? "—"

  return products.flatMap((product) =>
    product.variants.map((variant): InventoryRow => ({
      productId: product.id,
      variantId: variant.id,
      foto: product.foto,
      produto: product.nome,
      marca: product.marca,
      categoria: product.categoria,
      variante: variant.sku,
      cor: variant.cor,
      tamanho: variant.tamanho,
      localizacaoId: variant.localizacaoId,
      localizacao: locationName(variant.localizacaoId),
      quantidade: variant.quantidade,
      estoqueMinimo: variant.estoqueMinimo,
      status:
        variant.quantidade === 0
          ? "sem_estoque"
          : variant.quantidade <= variant.estoqueMinimo
            ? "baixo"
            : "ok",
    }))
  )
}
