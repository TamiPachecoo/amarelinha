# Roadmap — Amarelinha Gestor

Escopo do MVP v1.0, dividido em milestones. Cada milestone é construído,
testado e aprovado antes de iniciar o próximo.

## Milestone 1 — Fundação (concluído)

- Setup do projeto (Vite + React + TypeScript)
- Tailwind CSS + shadcn/ui + paleta de cores Amarelinha
- Conexão com Supabase (cliente configurado, sem tabelas ainda)
- Autenticação (login por e-mail/senha) e rotas protegidas
- Layout responsivo: sidebar, top navigation
- Páginas placeholder: Painel, Produtos, Estoque, Relatórios, Configurações

## Milestone 2 — Banco de dados e Produtos (próximo)

- Schema Supabase: `products`, `product_variants`, `categories`, `brands`,
  `collections`, `locations`
- CRUD de produtos (nome, SKU, categoria, marca, coleção, preços, foto,
  descrição, status)
- Cadastro de variantes (cor, tamanho, quantidade, localização, código de
  barras, SKU)
- Card de produto e página de detalhe

## Milestone 3 — Estoque

- Tabela `inventory_movements`
- Movimentações: entrada, venda, ajuste manual
- Histórico de movimentações por variante
- Estoque nunca editado manualmente — apenas via movimentação

## Milestone 4 — Busca e Localização

- Busca global (nome, SKU, código de barras, categoria, marca, cor,
  tamanho, localização)
- Exibição de localização física por variante
- Gerenciamento de localizações customizadas

## Milestone 5 — Dashboard e Relatórios

- Cards do painel: total de produtos, total de peças, valor do estoque,
  estoque baixo, sem estoque, últimas movimentações
- Relatórios: produtos sem estoque, abaixo do mínimo, valor do estoque,
  movimentações recentes

## Backlog / fora do escopo do MVP

- Multi-loja / multi-usuário com papéis (roles)
- Notificações reais (hoje é apenas visual)
- Modo escuro
