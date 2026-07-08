# Banco de dados — Supabase

Nenhuma tabela foi criada ainda no Supabase. Todo o estado hoje vive em
stores Zustand locais (por módulo, em `src/features/*/store/`), com
dados semente (seed) para permitir testar o app sem backend. Isso é
intencional: o objetivo até aqui foi validar o modelo de dados e os
fluxos antes de fixar um schema.

## Projeto Supabase

- Ainda não conectado a um projeto real para dados de negócio. Preencha
  `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- `VITE_SKIP_AUTH=true` em `.env.local` pula a tela de login em
  desenvolvimento (ver `DECISIONS.md`) — remover antes de produção.
- Auth por e-mail/senha deve estar habilitado no painel do Supabase
  (Authentication → Providers → Email).

## Modelo de dados planejado

Ciclo de vida: `Fornecedor → Coleção → Pedido de Compra → Recebimento
→ Estoque (Produto/Variante) → Venda → Cliente → Relatórios`.

```
stores (1) ──< suppliers (N)                [multi-loja futura]
suppliers (1) ──< collections (N)
suppliers (1) ──< purchase_orders (N)
collections (1) ──< purchase_orders (N)
purchase_orders (1) ──< purchase_order_items (N)
purchase_order_items (1) ──< inventory_movements (N)   [via recebimento]
purchase_order_items (0..1) ──> products / product_variants  [após 1º recebimento]

products (1) ──< product_variants (N)
products (1) ──< product_sources (1)        [rastreabilidade da origem]
product_variants (N) >── (1) locations
product_variants (1) ──< inventory_movements (N)
products >── categories / brands

customers (1) ──< children (N)
customers (1) ──< sales (N)
customers (1) ──< payment_records (N)   [histórico de pagamentos da conta do cliente]
sales (N) >── (1) product_variants
sales.forma_pagamento = 'conta_cliente' ⇒ gera saldo devedor (accounts receivable)
sales (0..1) >── (1) malinhas             [venda gerada por um fechamento de malinha]

customers (1) ──< malinhas (N)
malinhas (1) ──< malinha_itens (N)
malinha_itens (N) >── (1) product_variants
malinha_itens.quantidade sai do estoque no envio, volta (parcial ou
totalmente) no fechamento — nunca "desaparece", sempre via
inventory_movements tipo 'malinha'

employees, settings — reservados, sem tabela ainda
```

### Tabelas previstas

| Tabela                    | Origem no código atual                              |
| ------------------------- | ---------------------------------------------------- |
| `stores`                  | `src/config/storeSettings.ts` (hoje 1 registro fixo)  |
| `suppliers`                | `src/features/suppliers`                              |
| `collections`              | `src/features/collections`                            |
| `purchase_orders`           | `src/features/purchasing`                              |
| `purchase_order_items`      | `src/features/purchasing` (`PurchaseOrder.itens`)      |
| `products`                  | `src/features/products`                                |
| `product_variants`          | `src/features/products` (`Product.variants`)           |
| `product_sources`           | `src/features/products` (`Product.origem`) — rastreabilidade: tipo, fornecedor, coleção, código e imagem originais, pedido de compra |
| `inventory_movements`       | `src/features/inventory/store/movementsStore.ts`       |
| `locations`                 | `src/features/locations`                               |
| `categories`, `brands`      | hoje apenas texto livre em `Product` — vira tabela quando o cadastro precisar de autocomplete/consistência |
| `customers`                 | `src/features/customers` (modelado, **não conectado a UI ainda**) |
| `children`                  | `src/features/customers` (`Customer.filhos`)           |
| `sales`                     | `src/features/sales` (modelado, **não conectado a UI ainda**; já usado internamente pela Malinha Amarelinha) |
| `payment_records`           | `src/features/customers` (`Customer.historicoPagamentos`) |
| `malinhas`                  | `src/features/malinhas` (`Malinha`) — showroom móvel, conectado (`/malinha-amarelinha`) |
| `malinha_itens`             | `src/features/malinhas` (`Malinha.itens`)              |
| `employees`, `settings`     | reservados, sem código ainda                           |

### Decisões de modelagem já tomadas no código

- **Estoque nunca é criado manualmente pelo fluxo principal.** O
  Recebimento (`src/features/receiving`) cria o `Product` +
  `ProductVariant` na primeira vez que um item de Pedido de Compra é
  recebido, herdando nome/categoria/marca/cor/tamanho/localização/custo/
  preço de venda do próprio item do pedido. A tela "Cadastrar Produto"
  em `/produtos` continua existindo como caminho manual secundário
  (útil para brechó/consignado sem pedido de compra formal) — o custo
  fica zerado nesse caminho até receber uma entrada real.
- **Custo por variante, não por produto.** `ProductVariant.custo`
  reflete o custo da compra mais recente (não é custo médio ponderado
  — assumido como simplificação do MVP).
- **Origem do pedido é um campo, não um módulo separado.**
  `PurchaseOrder.origem: "manual" | "pdf" | "site" | "excel"` existe
  hoje só com `"manual"` implementado. Isso é a abstração para o
  futuro Assistente de Compras.
- **Saldo devedor é derivado, não armazenado.** `saldoDevedor` de um
  cliente = soma das vendas com `formaPagamento: "conta_cliente"` menos
  soma de `historicoPagamentos`. Evita ter dois números que podem
  divergir.
- **Malinha Amarelinha não move produtos entre localizações reais —
  ela baixa e devolve a quantidade da variante.** O modelo atual de
  `ProductVariant` tem uma única `localizacaoId` (a prateleira "de
  casa"), não uma localização por lote. Enviar uma malinha decrementa
  `quantidade` (registrando um movimento `malinha` negativo); fechar a
  malinha soma de volta a parte devolvida (movimento `malinha`
  positivo) e gera uma venda de verdade para a parte vendida — sem
  descontar o estoque de novo, pois ele já tinha saído no envio. Uma
  localização por lote/malinha é um refactor maior, fora do escopo
  deste milestone; documentado aqui para não ser "descoberto de novo".
- **`product_sources` é um objeto embutido no produto (`Product.origem`),
  não uma tabela separada nesta fase.** Cada produto guarda sua própria
  origem (1:1), então embutir evita um join extra em toda leitura de
  produto; vira tabela própria só se um produto puder ter múltiplas
  origens (ex.: reposição do mesmo produto por dois pedidos diferentes).
