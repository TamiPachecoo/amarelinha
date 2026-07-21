export type ProductStatus = "ativo" | "inativo"

export type ProductSourceType = "catalogo_pdf" | "site" | "excel" | "manual"

/**
 * Rastreabilidade da origem do produto — de onde ele veio, do catálogo do
 * fornecedor até o estoque. Preenchido automaticamente no Recebimento;
 * produtos cadastrados manualmente recebem tipo "manual" sem os demais
 * campos. Isso viabiliza reimportação de catálogo, histórico de compra por
 * origem e futuras recomendações, sem precisar navegar
 * variante → item do pedido → pedido → fornecedor toda vez.
 */
export interface ProductSource {
  tipo: ProductSourceType
  supplierId?: string
  collectionId?: string
  codigoOriginal?: string
  imagemOriginalUrl?: string
  importadoEm: string
  purchaseOrderId?: string
}

export const productSourceTypeLabel: Record<ProductSourceType, string> = {
  catalogo_pdf: "Catálogo PDF",
  site: "Site do Fornecedor",
  excel: "Planilha Excel",
  manual: "Cadastro Manual",
}

export interface ProductVariant {
  id: string
  productId: string
  cor: string
  tamanho: string
  sku: string
  codigoBarras?: string
  localizacaoId: string
  quantidade: number
  estoqueMinimo: number
  /** Custo unitário mais recente. Preenchido automaticamente pelo Recebimento
   *  de Pedidos de Compra; 0 para produtos cadastrados manualmente. */
  custo: number
  /** Pedido de Compra que originou este item, quando aplicável. */
  purchaseOrderItemId?: string
}

export interface Product {
  id: string
  nome: string
  sku: string
  categoria: string
  marca: string
  precoVenda: number
  status: ProductStatus
  /** Foto principal do produto (data URL). Vem do recorte do catálogo PDF
   *  no Recebimento, quando disponível. */
  foto?: string
  origem: ProductSource
  variants: ProductVariant[]
  createdAt: string
  /** Produto colocado em promoção manualmente na aba Produtos — preço
   *  promocional sugerido para a venda, sem alterar precoVenda (preço de
   *  tabela). */
  emPromocao: boolean
  precoPromocional?: number
}
