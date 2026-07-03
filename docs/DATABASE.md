# Banco de dados — Supabase

Nenhuma tabela foi criada ainda. Este documento será preenchido a partir
do Milestone 2, quando o schema for aplicado.

## Projeto Supabase

- Ainda não conectado a um projeto real. Preencha `.env.local` com
  `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` do seu projeto.
- Auth por e-mail/senha deve estar habilitado no painel do Supabase
  (Authentication → Providers → Email).

## Modelo de dados planejado (Milestone 2+)

```
products (1) ──< product_variants (N)
product_variants (N) >── (1) locations
product_variants (1) ──< inventory_movements (N)

products >── categories
products >── brands
products >── collections
```

Tabelas previstas: `products`, `product_variants`, `inventory_movements`,
`categories`, `brands`, `collections`, `locations`. O DDL completo será
adicionado aqui quando o Milestone 2 for implementado.
