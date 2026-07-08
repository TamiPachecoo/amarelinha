# Componentes

## UI base (shadcn/ui)

Ficam em `src/components/ui/` e não devem ser editados manualmente para
lógica de negócio — apenas para ajuste de estilo. Adicionar novos com:

```
npx shadcn@latest add <componente>
```

Instalados até agora: button, card, input, label, form, sidebar,
avatar, separator, sheet, skeleton, badge, dropdown-menu, tooltip,
dialog, select, textarea, table, tabs, switch.

## Layout

- `src/components/layout/AppLayout.tsx` — casca da área autenticada
  (`SidebarProvider` + `AppSidebar` + `SidebarInset`)
- `src/components/layout/AppSidebar.tsx` — navegação principal, agrupada
  em Principal / Compras / Operação / Vendas / Gestão. Nome e logo vêm
  de `src/config/storeSettings.ts`, não hardcoded
- `src/components/layout/TopNav.tsx` — busca global, notificações, menu
  do usuário (sair)

## Compartilhados (`src/components/shared/`)

- `PageHeader.tsx` — título + descrição no topo de cada página
- `EmptyState.tsx` — estado vazio reutilizável (ícone + título + descrição)
- `KpiCardGrid.tsx` — grid de cartões de indicador (título + valor +
  ícone), usado no Painel e no dashboard de Estoque

## Configuração (`src/config/`)

- `storeSettings.ts` — nome de exibição, nome curto, emoji de logo e
  versão da loja atual. Existe para que uma futura segunda loja seja
  uma mudança de dado, não de código (ver `DECISIONS.md`)

## Autenticação (`src/features/auth/`)

- `components/LoginForm.tsx`, `AuthProvider.tsx`, `ProtectedRoute.tsx`
- `store/authStore.ts`, `schemas/loginSchema.ts`

## Localizações (`src/features/locations/`)

- `store/locationsStore.ts` — lista de localizações físicas
  (Prateleira 1/2/3, Arara A/B, Depósito, Mesa Promoção) + `addLocation`

## Produtos (`src/features/products/`)

- `types.ts` — `Product` (com `variants: ProductVariant[]` e
  `origem: ProductSource`), `ProductVariant` (inclui `custo` e
  `purchaseOrderItemId` opcional), `ProductSource`/`ProductSourceType`
  (rastreabilidade: catálogo PDF / site / planilha / manual, fornecedor,
  coleção, código e imagem originais, pedido de compra)
- `store/productsStore.ts` — `addProduct` (cadastro manual, `origem`
  vira `"manual"` automaticamente), `adjustVariantQuantity` (ajuste
  manual de estoque), `receiveVariant` / `createFromReceiving` (usadas
  pelo Recebimento, recebem `origem` já resolvida)
- `utils.ts` — `totalQuantidade`, `valorEstoque`, `temEstoqueBaixo`,
  `semEstoque`, `margemPercentual`, `investimentoEstoque`, `formatBRL`
- `components/ProductForm.tsx`, `ProductCard.tsx` — a tela "Ver Produto"
  em `/produtos` exibe a origem (fornecedor/coleção/pedido/código
  original) quando disponível

## Estoque (`src/features/inventory/`)

- `types.ts` — `InventoryRow` (produto + variante "achatados" para tabela)
- `utils.ts` — `buildInventoryRows`
- `store/movementsStore.ts` — histórico de movimentações
  (`entrada` | `venda` | `ajuste` | `malinha`)
- `components/InventoryDashboardCards.tsx`, `InventoryTable.tsx`
  (busca + filtros + paginação), `StockAdjustmentDialog.tsx`

## Fornecedores (`src/features/suppliers/`)

- `types.ts`, `schemas/supplierSchema.ts`, `store/suppliersStore.ts`
- `components/SupplierForm.tsx`
- Métricas (coleções, pedidos em andamento, total comprado) são
  calculadas na página, não armazenadas no fornecedor

## Coleções (`src/features/collections/`)

- `types.ts`, `schemas/collectionSchema.ts`, `store/collectionsStore.ts`
- `components/CollectionForm.tsx`

## Compras / Pedidos de Compra (`src/features/purchasing/`)

- `types.ts` — `PurchaseOrder`, `PurchaseOrderItem`, `OrderOrigin`
  (abstração para futuros workflows de importação)
- `utils.ts` — `itemTotal`, `orderSubtotal`, `orderTotal`,
  `isFullyReceived`, `isPartiallyReceived`, `pendingQuantity`
- `store/purchaseOrdersStore.ts` — `addOrder`, `updateStatus`,
  `receiveItem` (chamada pelo módulo de Recebimento)
- `components/PurchaseOrderForm.tsx` — formulário multi-item com
  `useFieldArray` (cadastro manual, origem `"manual"`)
- `components/PdfCropViewer.tsx` — renderiza o catálogo PDF
  (`pdfjs-dist`) e permite recortar uma área da página como foto do
  item (`<canvas>`, sem OCR/IA)
- `orderExport.ts` — `exportOrderToPdf`/`exportOrderToCsv` do pedido em
  construção antes de criá-lo
- `src/pages/CatalogOrderPage.tsx` — tela dividida (catálogo + item)
  para montar um pedido a partir de um PDF de coleção; cria o pedido
  com `origem: "pdf"`

## Recebimento (`src/features/receiving/`)

- `schemas/receivingSchema.ts` — schema dinâmico por item
  (`makeReceivingSchema(maxPendente)`), com suporte a quantidade
  avariada/faltante
- `components/ReceivingItemDialog.tsx` — único ponto que cria estoque
  (via `productsStore.createFromReceiving`/`receiveVariant`) e
  registra o movimento de `entrada`

## Malinha Amarelinha (`src/features/malinhas/`)

- `types.ts` — `Malinha`, `MalinhaItem`, `MalinhaStatus`
  (`preparando` → `com_cliente` → `fechada`)
- `schemas/malinhaSchema.ts` — `createMalinhaSchema` e
  `makeAddMalinhaItemSchema(maxQuantidade)` (schema dinâmico, mesmo
  padrão do Recebimento)
- `store/malinhasStore.ts` — `createMalinha`, `addItem`, `removeItem`
  (fase de preparação, sem tocar estoque), `enviarMalinha` (baixa
  estoque + movimento `malinha` por item), `fecharMalinha` (devolve o
  que não foi vendido + registra venda do que foi vendido via
  `salesStore.recordSaleWithoutStockChange`)
- `components/AddMalinhaItemForm.tsx`, `CreateMalinhaForm.tsx`
- Páginas: `src/pages/MalinhasPage.tsx` (lista) e
  `src/pages/MalinhaDetailPage.tsx` (fluxo completo, uma tela por fase)

## Painel (`src/features/dashboard/`)

- `components/PurchasingKpiCards.tsx`, `MalinhaKpiCards.tsx`,
  `AlertsPanel.tsx`, `RecentActivity.tsx`

## Clientes / CRM (`src/features/customers/`) — modelado, usado pela Malinha, sem tela própria ainda

- `types.ts` — `Customer`, `Child`, `Address`, `PaymentRecord`
- `schemas/customerSchema.ts`, `schemas/childSchema.ts`
- `store/customersStore.ts` — `addCustomer`, `updateCustomer`,
  `addChild`, `registerPayment`
- `utils.ts` — `saldoDevedor(customer, sales)` (derivado, ver
  `DATABASE.md`), usado no Painel e disponível para a futura tela de
  perfil do cliente

## Vendas (`src/features/sales/`) — modelado, usado pela Malinha, sem tela própria ainda

- `types.ts` — `Sale` (inclui `malinhaId` opcional), `FormaPagamento`
  (pix/dinheiro/cartao/conta_cliente)
- `schemas/saleSchema.ts`, `store/salesStore.ts` —
  `registerSale` (venda direta: decrementa estoque e, se
  `conta_cliente`, gera saldo devedor derivado) e
  `recordSaleWithoutStockChange` (venda originada do fechamento de uma
  Malinha: não mexe no estoque, pois ele já saiu no envio)
- `components/SaleForm.tsx`

## Convenções

- Todo texto visível ao usuário em português (pt-BR)
- Sem `any`; sem estilos inline
- Formulários sempre com React Hook Form + Zod. Para campos numéricos
  com `z.coerce.number()`, use os tipos `FormInput`/`FormValues`
  (`z.input`/`z.output`) e passe `value={field.value as string | number}`
  no `<Input>` — ver qualquer formulário existente como referência
- Ícones: `lucide-react`
- Dados ainda locais (Zustand) usam IDs de seed estáveis exportados
  pela store (ex.: `PRODUCT_SEED_IDS`, `SUPPLIER_SEED_IDS`) quando
  outra store precisa referenciá-los em dados de exemplo
