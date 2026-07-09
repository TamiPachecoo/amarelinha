import { create } from "zustand"
import type { Product, ProductSource, ProductVariant } from "@/features/products/types"
import { supabase } from "@/services/supabase"

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

function variantFromRow(row: Record<string, unknown>): ProductVariant {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    cor: row.cor as string,
    tamanho: row.tamanho as string,
    sku: row.sku as string,
    codigoBarras: (row.codigo_barras as string) ?? undefined,
    localizacaoId: row.localizacao_id as string,
    quantidade: row.quantidade as number,
    estoqueMinimo: row.estoque_minimo as number,
    custo: Number(row.custo),
    purchaseOrderItemId: (row.purchase_order_item_id as string) ?? undefined,
  }
}

function variantToRow(variant: ProductVariant) {
  return {
    id: variant.id,
    product_id: variant.productId,
    cor: variant.cor,
    tamanho: variant.tamanho,
    sku: variant.sku,
    codigo_barras: variant.codigoBarras || null,
    localizacao_id: variant.localizacaoId,
    quantidade: variant.quantidade,
    estoque_minimo: variant.estoqueMinimo,
    custo: variant.custo,
    purchase_order_item_id: variant.purchaseOrderItemId || null,
  }
}

function productFromRow(row: Record<string, unknown>): Omit<Product, "variants"> {
  return {
    id: row.id as string,
    nome: row.nome as string,
    sku: row.sku as string,
    categoria: row.categoria as string,
    marca: row.marca as string,
    precoVenda: Number(row.preco_venda),
    status: row.status as Product["status"],
    foto: (row.foto as string) ?? undefined,
    origem: row.origem as ProductSource,
    createdAt: row.created_at as string,
  }
}

function productToRow(product: Product) {
  return {
    id: product.id,
    nome: product.nome,
    sku: product.sku,
    categoria: product.categoria,
    marca: product.marca,
    preco_venda: product.precoVenda,
    status: product.status,
    foto: product.foto || null,
    origem: product.origem,
    created_at: product.createdAt,
  }
}

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

async function persistProduct(product: Product) {
  const { error } = await supabase.from("products").insert(productToRow(product))
  if (error) {
    console.error("Failed to insert product", error)
    return
  }
  const { error: variantsError } = await supabase
    .from("product_variants")
    .insert(product.variants.map(variantToRow))
  if (variantsError) console.error("Failed to insert product variants", variantsError)
}

interface ProductsState {
  products: Product[]
  fetchAll: () => Promise<void>
  addProduct: (input: NewProductInput) => void
  adjustVariantQuantity: (variantId: string, delta: number) => void
  receiveVariant: (
    variantId: string,
    quantidade: number,
    custoUnitario: number,
    localizacaoId: string
  ) => void
  createFromReceiving: (input: ReceivingProductInput) => { productId: string; variantId: string }
  deleteProduct: (id: string) => void
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  fetchAll: async () => {
    const [productsRes, variantsRes] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("product_variants").select("*"),
    ])
    if (productsRes.error) {
      console.error("Failed to fetch products", productsRes.error)
      return
    }
    if (variantsRes.error) {
      console.error("Failed to fetch product variants", variantsRes.error)
      return
    }
    const variantsByProduct = new Map<string, ProductVariant[]>()
    for (const row of variantsRes.data ?? []) {
      const productId = row.product_id as string
      const list = variantsByProduct.get(productId) ?? []
      list.push(variantFromRow(row))
      variantsByProduct.set(productId, list)
    }
    const products = (productsRes.data ?? []).map((row) => ({
      ...productFromRow(row),
      variants: variantsByProduct.get(row.id as string) ?? [],
    }))
    set({ products })
  },
  addProduct: (input) => {
    const product = makeProduct(input)
    set((state) => ({ products: [product, ...state.products] }))
    persistProduct(product)
  },
  adjustVariantQuantity: (variantId, delta) => {
    set((state) => ({
      products: state.products.map((product) => ({
        ...product,
        variants: product.variants.map((variant) =>
          variant.id === variantId
            ? { ...variant, quantidade: Math.max(0, variant.quantidade + delta) }
            : variant
        ),
      })),
    }))
    const variant = get()
      .products.flatMap((p) => p.variants)
      .find((v) => v.id === variantId)
    if (variant) {
      supabase
        .from("product_variants")
        .update({ quantidade: variant.quantidade })
        .eq("id", variantId)
        .then(({ error }) => error && console.error("Failed to update variant quantity", error))
    }
  },
  receiveVariant: (variantId, quantidade, custoUnitario, localizacaoId) => {
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
    }))
    const variant = get()
      .products.flatMap((p) => p.variants)
      .find((v) => v.id === variantId)
    if (variant) {
      supabase
        .from("product_variants")
        .update({
          quantidade: variant.quantidade,
          custo: variant.custo,
          localizacao_id: variant.localizacaoId,
        })
        .eq("id", variantId)
        .then(({ error }) => error && console.error("Failed to update received variant", error))
    }
  },
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
    persistProduct(product)
    return { productId: product.id, variantId: product.variants[0].id }
  },
  deleteProduct: (id) => {
    set((state) => ({ products: state.products.filter((product) => product.id !== id) }))
    supabase
      .from("products")
      .delete()
      .eq("id", id)
      .then(({ error }) => error && console.error("Failed to delete product", error))
  },
}))
