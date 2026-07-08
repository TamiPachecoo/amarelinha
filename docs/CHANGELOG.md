# Changelog

## Milestone 5 — 2026-07-07 — CRM de Clientes conectado

### Adicionado

- **Clientes** (`/clientes`): lista com busca, cadastro completo
- **Perfil do cliente** (`/clientes/:id`): estatísticas (compras,
  valor gasto, ticket médio, marcas/categorias favoritas), Conta do
  Cliente (saldo devedor derivado, limite, vencimento, histórico de
  pagamentos), Filhos (com idade calculada), Histórico de Compras
  (distingue venda direta de venda via Malinha Amarelinha), botão
  "Nova Venda" reaproveitando o `SaleForm`
- `customers/utils.ts`: `customerStats(customer, sales, products)` e
  `calcularIdade(dataNascimento)`
- Item de navegação "Clientes" no grupo Vendas

## Milestone 4 — 2026-07-07 — Rastreabilidade de origem e Malinha Amarelinha

### Adicionado

- `Product.origem` (`ProductSource`): tipo de origem (catálogo PDF /
  site / planilha / manual), fornecedor, coleção, código original do
  fornecedor, imagem original e pedido de compra de origem. Preenchido
  automaticamente pelo Recebimento; exibido em "Ver Produto"
- **Malinha Amarelinha** (`/malinha-amarelinha` e
  `/malinha-amarelinha/:malinhaId`): showroom móvel completo —
  preparar (selecionar cliente + adicionar itens do estoque), enviar
  (baixa estoque), fechar (devolve o que sobrou, gera venda do que foi
  vendido, com forma de pagamento incluindo Conta do Cliente)
- Novo tipo de movimentação de estoque `malinha` (saída no envio,
  entrada na devolução)
- `salesStore.recordSaleWithoutStockChange` — venda gerada pelo
  fechamento de uma malinha, sem descontar o estoque de novo
- `customers/utils.ts` — `saldoDevedor(customer, sales)` extraído como
  utilitário reutilizável (usado no Painel, disponível para a futura
  tela de perfil do cliente)
- Painel: KPIs de Malinha Amarelinha e saldo a receber de clientes
  (`MalinhaKpiCards`) + alerta de malinha com devolução atrasada
- Novo grupo de navegação "Vendas" no `AppSidebar`
- Documentação (`docs/`) atualizada com o novo módulo e decisões de
  modelagem (localização por lote fora do escopo, forma de pagamento
  única por fechamento de malinha)

## Milestone 3 — 2026-07-03 — Compras: Fornecedores, Coleções, Pedidos e Recebimento

### Adicionado

- `src/config/storeSettings.ts` — nome/logo/versão da loja centralizados
- Navegação reagrupada: Principal / Compras / Operação / Gestão
  (`AppSidebar`)
- **Fornecedores** (`/fornecedores`): cadastro completo + métricas
  derivadas (coleções, pedidos em andamento, total comprado)
- **Coleções** (`/colecoes`): coleções sazonais por fornecedor, com
  status planejada/ativa/encerrada
- **Pedidos de Compra** (`/pedidos-compra`): pedido multi-item
  (`useFieldArray`), custo/frete/impostos/desconto, total calculado,
  transição de status via menu de ações
- **Recebimento** (`/recebimento`): recebimento por item com suporte a
  recebimento parcial e quantidade avariada/faltante; único ponto que
  cria Produto/Variante no estoque, herdando dados do item do pedido.
  A localização final do produto é escolhida no Recebimento (não no
  Pedido de Compra) — só ali dá para saber onde o item vai ficar
- **Montar Pedido a partir do catálogo PDF** (dentro de Coleções): tela
  dividida — catálogo renderizado (`pdfjs-dist`) de um lado, formulário
  de item do outro. Selecionar uma área da foto no catálogo recorta a
  imagem (`<canvas>`, sem OCR/IA) e anexa ao item; o pedido criado fica
  marcado com `origem: "pdf"`
- Exportar o pedido em construção como PDF (com miniatura da foto,
  código, cor, tamanho, quantidade) ou CSV (abre no Excel)
- `ProductVariant.custo` + utilitário `margemPercentual` /
  `investimentoEstoque`
- Painel: KPIs de compras (`PurchasingKpiCards`), painel de alertas
  (`AlertsPanel`) e atividade recente (`RecentActivity`)
- Componente compartilhado `KpiCardGrid` (extraído para eliminar
  duplicação entre Painel e Estoque)
- shadcn/ui: table, tabs, switch
- Documentação (`docs/`) reescrita para refletir a visão de Retail OS
  modular e o ciclo de vida do produto

### Modelado, ainda não conectado à navegação

- CRM de Clientes (`src/features/customers/`) e Vendas/Conta do
  Cliente (`src/features/sales/`) — types/schemas/stores completos,
  sem página/rota ainda (ver `ROADMAP.md` e `DECISIONS.md`)

## Milestone 2 — 2026-07-03 — Catálogo e Estoque

### Adicionado

- Produtos com variantes (`ProductVariant`: cor, tamanho, localização,
  estoque mínimo, SKU, código de barras)
- `src/features/locations/` — localizações físicas (Zustand)
- Módulo de Estoque (`/estoque`): dashboard de indicadores, tabela com
  busca/filtros/paginação, movimentação manual (`StockAdjustmentDialog`)
- `src/features/inventory/store/movementsStore.ts` — histórico de
  movimentações
- shadcn/ui: dialog, select, textarea
- CRM de Clientes e Vendas modelados como preview local (ver Milestone 3
  para o que ficou pendente de conectar)

## Milestone 1 — 2026-07-03

### Adicionado

- Projeto Vite + React 19 + TypeScript, com alias `@/*` → `src/*`
- Tailwind CSS v4 (via `@tailwindcss/vite`) com tokens de tema em
  `src/index.css` seguindo a paleta Amarelinha Kids
- shadcn/ui (estilo `new-york`): button, card, input, label, form,
  sidebar, avatar, separator, sheet, skeleton, badge, dropdown-menu,
  tooltip
- Cliente Supabase (`src/services/supabase.ts`) lendo
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- Autenticação por e-mail/senha (`LoginForm`, `AuthProvider`, store
  Zustand `useAuthStore`) e rotas protegidas (`ProtectedRoute`)
- Layout responsivo com sidebar recolhível e top navigation (busca,
  notificações, menu do usuário) — sidebar vira sheet deslizante no
  mobile
- Páginas placeholder: Painel, Produtos, Estoque, Relatórios,
  Configurações, e página 404
- Estrutura de pastas feature-based (`components`, `features`, `pages`,
  `hooks`, `services`, `lib`, `types`)
