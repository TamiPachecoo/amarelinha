# Roadmap — Amarelinha Gestor (Retail OS)

O app não é "só" um controle de estoque: é um Retail OS modular para
boutiques infantis. Amarelinha Kids é a primeira loja (tenant) a usar
essa base — ver `DECISIONS.md` sobre a arquitetura de Store Settings.

Cada milestone é construído, testado e aprovado antes de iniciar o
próximo.

## Ciclo de vida do produto

```
Fornecedor → Coleção → Pedido de Compra → Recebimento → Estoque
  → Malinha Amarelinha (opcional) → Venda → Cliente → Relatórios → BI
```

Todo módulo novo deve se encaixar em algum ponto desse ciclo, não
duplicar dados que já existem em um ponto anterior.

## Milestone 1 — Fundação (concluído)

- Setup do projeto (Vite + React + TypeScript)
- Tailwind CSS + shadcn/ui + paleta de cores Amarelinha
- Conexão com Supabase (cliente configurado, sem tabelas ainda)
- Autenticação (login por e-mail/senha) e rotas protegidas
- Layout responsivo: sidebar, top navigation
- Páginas placeholder: Painel, Produtos, Estoque, Relatórios, Configurações

## Milestone 2 — Catálogo, Estoque e preview de CRM/Vendas (concluído)

- Produtos com variantes (cor, tamanho, localização, estoque mínimo)
- Módulo de Estoque: dashboard, tabela com busca/filtros/paginação,
  movimentação manual (entrada/ajuste)
- Locations (localizações físicas) como store própria
- CRM de Clientes (tipos, schema, store) e Vendas/Conta do Cliente
  (tipos, schema, store) criados mas **ainda não conectados** a
  nenhuma página/rota — ver "Backlog imediato" abaixo
- Todos os dados deste milestone são locais (Zustand), não persistidos
  no Supabase ainda

## Milestone 3 — Compras: Fornecedores, Coleções, Pedidos e Recebimento (concluído)

- Refatoração da navegação em grupos: Principal / Compras / Operação / Gestão
- **Fornecedores**: cadastro completo + métricas derivadas (coleções,
  pedidos em andamento, total comprado)
- **Coleções**: coleções sazonais vinculadas a um fornecedor
- **Pedidos de Compra**: pedido multi-item com custo, frete, impostos,
  desconto e total calculado; status rascunho → enviado → confirmado →
  parcialmente recebido → recebido (ou cancelado)
- **Recebimento**: única porta de entrada do estoque. Recebe por item,
  com suporte a recebimento parcial e registro de avaria/falta.
  Cria o Produto + Variante automaticamente no primeiro recebimento,
  herdando dados do item do pedido (nome, categoria, marca, cor,
  tamanho, localização, custo, preço de venda planejado)
- Custo (`custo`) adicionado à variante do produto, com utilitário de
  margem (`margemPercentual`)
- Painel atualizado com KPIs de compras (pedidos em andamento,
  aguardando recebimento, valor em aberto, fornecedores ativos),
  painel de alertas e atividade recente
- `src/config/storeSettings.ts` — nome/logo da loja isolados em
  configuração, preparando o terreno para múltiplas lojas no futuro
  sem reescrever componentes

## Milestone 4 — Rastreabilidade de origem e Malinha Amarelinha (concluído)

- **Rastreabilidade de origem (`Product.origem`)**: todo produto agora
  guarda de onde veio — tipo (catálogo PDF / site / planilha / manual),
  fornecedor, coleção, código original do fornecedor, imagem original e
  pedido de compra de origem. Preenchido automaticamente no Recebimento;
  exibido na tela "Ver Produto" em Produtos. Base para reimportação de
  catálogo, histórico de compra por origem e recomendações futuras
- **Malinha Amarelinha** (`/malinha-amarelinha`): showroom móvel — um
  conjunto de produtos emprestado a uma cliente para experimentar em
  casa. Fluxo completo: Preparar (selecionar cliente + adicionar itens
  do estoque disponível) → Enviar (baixa o estoque e registra
  movimentação `malinha`) → Fechar (informa quantidade vendida por
  item; o restante volta automaticamente ao estoque, e cada item
  vendido gera uma venda de verdade, com forma de pagamento incluindo
  Conta do Cliente)
- Novo tipo de movimentação de estoque: `malinha` (saída ao enviar,
  entrada ao devolver) — nunca edita a quantidade diretamente, sempre
  via movimentação, mesma regra do Recebimento e do Ajuste Manual
- `salesStore.recordSaleWithoutStockChange` — registra a venda gerada
  pelo fechamento de uma malinha sem descontar o estoque de novo (ele já
  saiu no envio); mantém `registerSale` (venda direta) intacto
- Painel: novos indicadores (Malinhas Ativas, Produtos Fora da Loja,
  Saldo a Receber de Clientes) e alerta de malinha com devolução
  atrasada
- Novo grupo de navegação "Vendas" (Clientes + Malinha Amarelinha)

## Milestone 5 — CRM de Clientes conectado (concluído)

- **Clientes** (`/clientes`): lista com busca por nome/telefone/e-mail,
  cadastro completo (contato, endereço, Instagram/Facebook, CPF,
  observações, ativo/inativo)
- **Perfil do cliente** (`/clientes/:id`): estatísticas calculadas
  (total de compras, valor gasto, última compra, ticket médio, marcas e
  categorias favoritas, número de filhos), dados cadastrais editáveis,
  **Conta do Cliente** (saldo devedor derivado, limite de crédito, data
  de vencimento, histórico de pagamentos com "Registrar Pagamento"),
  **Filhos** (cadastro com idade calculada automaticamente a partir da
  data de nascimento) e **Histórico de Compras** (mostra se cada venda
  veio de uma venda direta ou de uma Malinha Amarelinha)
- Botão "Nova Venda" no perfil do cliente reaproveita o `SaleForm` já
  usado internamente pela Malinha Amarelinha
- `customers/utils.ts` ganhou `customerStats` e `calcularIdade`

## Backlog imediato (próximo milestone recomendado)

- Fluxo de "Registrar Venda" direta acessível também pelo Painel (hoje
  só existe dentro do perfil do cliente e da Malinha Amarelinha)
- Relatórios (Estoque, Vendas, Clientes, Financeiro) com dados reais
  em vez de páginas placeholder

## Fora do escopo por enquanto (arquitetura reservada, não implementada)

- Assistente de Compras com múltiplos workflows de importação (PDF
  com IA, site, Excel) — hoje só existe a origem `"manual"` no tipo
  `OrderOrigin`; os demais workflows entram como novos criadores de
  `PurchaseOrder` sem alterar o restante do módulo
- OCR / extração de catálogo por IA
- Business Intelligence (produtos parados, sugestão de reposição,
  previsão de compra por cliente, performance de coleção/fornecedor)
- Multi-loja real (múltiplos registros de Store Settings), múltiplos
  funcionários com papéis, múltiplos provedores de pagamento
- Modo escuro

## Módulos centrais do Retail OS (visão completa)

Painel · Fornecedores · Coleções · Pedidos de Compra · Recebimento ·
Estoque · Produtos · Malinha Amarelinha · Clientes (CRM) · Vendas ·
Financeiro · Relatórios · Configurações · (futuro: Business Intelligence)
