# TODO

## Antes de qualquer dado ir para produção

- [ ] Criar (ou conectar) o projeto Supabase real e preencher `.env.local`
- [ ] Remover/desativar `VITE_SKIP_AUTH` (bypass de login de desenvolvimento)
- [ ] Habilitar o provedor de e-mail/senha no Supabase Auth
- [ ] Criar o primeiro usuário de teste (dono da boutique)
- [ ] Desenhar e aplicar o schema real do Supabase (ver `docs/DATABASE.md`)
- [ ] Migrar os dados de todas as stores Zustand para TanStack Query + Supabase

## Próximo milestone recomendado

- [ ] Fluxo "Registrar Venda" direta acessível também do Painel (hoje
      só existe dentro do perfil do cliente e da Malinha Amarelinha) —
      o `SaleForm` já existe, é só expor em mais um lugar
- [ ] Relatórios com dados reais (ver seção "Depois")

## Depois

- [ ] Relatórios com dados reais (Estoque, Vendas, Clientes, Financeiro,
      Malinhas) substituindo a página placeholder atual
- [ ] Busca global (TopNav) ligada aos dados reais (hoje é só um input
      visual)
- [ ] Cadastro de categorias/marcas como entidades (autocomplete),
      hoje são texto livre no formulário de produto/pedido
- [ ] Assistente de Compras: workflow de importação por site ou Excel
      — usar o campo `PurchaseOrder.origem` como ponto de extensão
      (o workflow de PDF manual, com recorte de foto, já existe)
- [ ] Localização por lote na Malinha Amarelinha, se o negócio precisar
      saber fisicamente onde cada malinha está guardada (hoje ela só
      baixa/devolve a quantidade da variante — ver `DECISIONS.md`)
- [ ] Business Intelligence (produtos parados, sugestão de reposição,
      performance de coleção/fornecedor) — arquitetura reservada, sem
      código ainda
