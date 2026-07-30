import type { Product } from "@/features/products/types"

export function totalQuantidade(product: Product): number {
  return product.variants.reduce((sum, variant) => sum + variant.quantidade, 0)
}

export function valorEstoque(product: Product): number {
  return totalQuantidade(product) * product.precoVenda
}

export function temEstoqueBaixo(product: Product): boolean {
  return product.variants.some(
    (variant) => variant.quantidade > 0 && variant.quantidade <= variant.estoqueMinimo
  )
}

export function semEstoque(product: Product): boolean {
  return totalQuantidade(product) === 0
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

/** Retorna a margem percentual (0–100) ou null quando não há custo registrado. */
export function margemPercentual(precoVenda: number, custo: number): number | null {
  if (custo <= 0 || precoVenda <= 0) return null
  return ((precoVenda - custo) / precoVenda) * 100
}

export function investimentoEstoque(product: Product): number {
  return product.variants.reduce((sum, variant) => sum + variant.quantidade * variant.custo, 0)
}

/** Menor e maior custo entre as variantes do produto (null quando não há variantes). */
export function custoRange(product: Product): { min: number; max: number } | null {
  if (product.variants.length === 0) return null
  const custos = product.variants.map((variant) => variant.custo)
  return { min: Math.min(...custos), max: Math.max(...custos) }
}
