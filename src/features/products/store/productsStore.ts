import { create } from "zustand"
import type { Product, ProductSource, ProductVariant } from "@/features/products/types"

export interface NewProductInput {
  nome: string
  sku: string
  categoria: string
  marca: string
  precoVenda: number
  cor: string
  tamanho: string
  localizacaoId: string
  quantidade: number
  estoqueMinimo: number
}

export interface ReceivingProductInput {
  nome: string
  sku: string
  categoria: string
  marca: string
  precoVenda: number
  cor: string
  tamanho: string
  localizacaoId: string
  quantidadeRecebida: number
  custoUnitario: number
  purchaseOrderItemId: string
  foto?: string
  origem: ProductSource
}

export const PRODUCT_SEED_IDS = {
  vestidoFloral: { productId: "prod-vestido-floral", variantId: "var-vestido-floral-rosa-4" },
  conjuntoMoletom: { productId: "prod-conjunto-moletom", variantId: "var-conjunto-moletom-azul-2" },
  bodyListrado: { productId: "prod-body-listrado", variantId: "var-body-listrado-amarelo-rn" },
} as const

function makeProduct(
  input: NewProductInput & {
    id?: string
    variantId?: string
    createdAt?: string
    custo?: number
    purchaseOrderItemId?: string
    foto?: string
    origem?: ProductSource
  }
): Product {
  const productId = input.id ?? crypto.randomUUID()
  const createdAt = input.createdAt ?? new Date().toISOString()
  const variant: ProductVariant = {
    id: input.variantId ?? crypto.randomUUID(),
    productId,
    cor: input.cor,
    tamanho: input.tamanho,
    sku: input.sku,
    localizacaoId: input.localizacaoId,
    quantidade: input.quantidade,
    estoqueMinimo: input.estoqueMinimo,
    custo: input.custo ?? 0,
    purchaseOrderItemId: input.purchaseOrderItemId,
  }

  return {
    id: productId,
    nome: input.nome,
    sku: input.sku,
    categoria: input.categoria,
    marca: input.marca,
    precoVenda: input.precoVenda,
    status: "ativo",
    foto: input.foto,
    origem: input.origem ?? { tipo: "manual", importadoEm: createdAt },
    variants: [variant],
    createdAt,
  }
}

const seedProducts: Product[] = [
  makeProduct({
    id: PRODUCT_SEED_IDS.vestidoFloral.productId,
    variantId: PRODUCT_SEED_IDS.vestidoFloral.variantId,
    nome: "Vestido Floral Manga Curta",
    sku: "VST-001",
    categoria: "Vestidos",
    marca: "Amarelinha Kids",
    precoVenda: 129.9,
    cor: "Rosa",
    tamanho: "4",
    localizacaoId: "loc-arara-a",
    quantidade: 8,
    estoqueMinimo: 3,
    custo: 65,
  }),
  makeProduct({
    id: PRODUCT_SEED_IDS.conjuntoMoletom.productId,
    variantId: PRODUCT_SEED_IDS.conjuntoMoletom.variantId,
    nome: "Conjunto Moletom Ursinho",
    sku: "CNJ-014",
    categoria: "Conjuntos",
    marca: "Baby Bear",
    precoVenda: 89.9,
    cor: "Azul",
    tamanho: "2",
    localizacaoId: "loc-prateleira-1",
    quantidade: 2,
    estoqueMinimo: 3,
    custo: 45,
  }),
  makeProduct({
    id: PRODUCT_SEED_IDS.bodyListrado.productId,
    variantId: PRODUCT_SEED_IDS.bodyListrado.variantId,
    nome: "Body Manga Longa Listrado",
    sku: "BDY-027",
    categoria: "Bodies",
    marca: "Amarelinha Kids",
    precoVenda: 39.9,
    cor: "Amarelo",
    tamanho: "RN",
    localizacaoId: "loc-deposito",
    quantidade: 0,
    estoqueMinimo: 5,
    custo: 18,
  }),
]

interface ProductsState {
  products: Product[]
  addProduct: (input: NewProductInput) => void
  adjustVariantQuantity: (variantId: string, delta: number) => void
  receiveVariant: (
    variantId: string,
    quantidade: number,
    custoUnitario: number,
    localizacaoId: string
  ) => void
  createFromReceiving: (input: ReceivingProductInput) => { productId: string; variantId: string }
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: seedProducts,
  addProduct: (input) =>
    set((state) => ({ products: [makeProduct(input), ...state.products] })),
  adjustVariantQuantity: (variantId, delta) =>
    set((state) => ({
      products: state.products.map((product) => ({
        ...product,
        variants: product.variants.map((variant) =>
          variant.id === variantId
            ? { ...variant, quantidade: Math.max(0, variant.quantidade + delta) }
            : variant
        ),
      })),
    })),
  receiveVariant: (variantId, quantidade, custoUnitario, localizacaoId) =>
    set((state) => ({
      products: state.products.map((product) => ({
        ...product,
        variants: product.variants.map((variant) =>
          variant.id === variantId
            ? {
                ...variant,
                quantidade: variant.quantidade + quantidade,
                custo: custoUnitario,
                localizacaoId,
              }
            : variant
        ),
      })),
    })),
  createFromReceiving: (input) => {
    const product = makeProduct({
      nome: input.nome,
      sku: input.sku,
      categoria: input.categoria,
      marca: input.marca,
      precoVenda: input.precoVenda,
      cor: input.cor,
      tamanho: input.tamanho,
      localizacaoId: input.localizacaoId,
      quantidade: input.quantidadeRecebida,
      estoqueMinimo: 3,
      custo: input.custoUnitario,
      purchaseOrderItemId: input.purchaseOrderItemId,
      foto: input.foto,
      origem: input.origem,
    })
    set((state) => ({ products: [product, ...state.products] }))
    return { productId: product.id, variantId: product.variants[0].id }
  },
}))
