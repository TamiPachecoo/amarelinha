-- Amarelinha Gestor — schema inicial
-- Ciclo: Fornecedor -> Coleção -> Pedido de Compra -> Recebimento ->
-- Estoque (Produto/Variante) -> Venda -> Cliente -> Relatórios
-- Ver docs/DATABASE.md para o modelo completo e decisões de modelagem.

create extension if not exists "pgcrypto";

-- stores (multi-loja futura; hoje um único registro)
create table stores (
  id text primary key,
  nome_exibicao text not null,
  nome_curto text not null,
  logo_emoji text not null,
  versao text not null
);

create table locations (
  id uuid primary key default gen_random_uuid(),
  nome text not null
);

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  store_id text references stores(id),
  nome text not null,
  contato_nome text,
  telefone text not null,
  whatsapp text not null,
  email text,
  instagram text,
  website text,
  condicoes_pagamento text not null,
  lead_time_dias integer not null,
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table collections (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id),
  nome text not null,
  temporada text not null,
  ano integer not null,
  status text not null check (status in ('planejada', 'ativa', 'encerrada')),
  catalogo_pdf_url text,
  catalogo_pdf_nome text,
  data_importacao timestamptz,
  created_at timestamptz not null default now()
);

create table purchase_orders (
  id uuid primary key default gen_random_uuid(),
  numero text not null,
  supplier_id uuid not null references suppliers(id),
  collection_id uuid references collections(id),
  status text not null check (status in (
    'rascunho', 'enviado', 'confirmado', 'parcialmente_recebido', 'recebido', 'cancelado'
  )),
  origem text not null check (origem in ('manual', 'pdf', 'site', 'excel')),
  data_pedido timestamptz not null,
  previsao_entrega timestamptz,
  nota_fiscal text,
  frete numeric(12, 2) not null default 0,
  desconto numeric(12, 2) not null default 0,
  impostos numeric(12, 2) not null default 0,
  observacoes text,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  sku text not null unique,
  categoria text not null,
  marca text not null,
  preco_venda numeric(12, 2) not null,
  status text not null check (status in ('ativo', 'inativo')) default 'ativo',
  foto text,
  -- product_sources: embutido como JSONB, ver docs/DATABASE.md (1:1, evita join extra)
  origem jsonb not null,
  created_at timestamptz not null default now()
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  cor text not null,
  tamanho text not null,
  sku text not null unique,
  codigo_barras text,
  localizacao_id uuid not null references locations(id),
  quantidade integer not null default 0,
  estoque_minimo integer not null default 0,
  custo numeric(12, 2) not null default 0,
  purchase_order_item_id uuid
);

create table purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references purchase_orders(id) on delete cascade,
  codigo_fornecedor text not null,
  nome text not null,
  categoria text not null,
  marca text not null,
  cor text not null,
  tamanho text not null,
  quantidade_pedida integer not null,
  quantidade_recebida integer not null default 0,
  custo_unitario numeric(12, 2) not null,
  preco_venda numeric(12, 2) not null,
  foto text,
  product_id uuid references products(id),
  variant_id uuid references product_variants(id)
);

alter table product_variants
  add constraint product_variants_purchase_order_item_id_fkey
  foreign key (purchase_order_item_id) references purchase_order_items(id);

create table inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants(id),
  product_id uuid not null references products(id),
  tipo text not null check (tipo in ('entrada', 'venda', 'ajuste', 'malinha')),
  quantidade integer not null,
  observacao text,
  data timestamptz not null default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  nome_completo text not null,
  telefone text not null,
  whatsapp text not null,
  email text not null,
  instagram text,
  facebook text,
  cpf text,
  -- endereco: embutido como JSONB (Address), sem necessidade de tabela própria
  endereco jsonb not null,
  observacoes text,
  cliente_desde timestamptz not null default now(),
  ativo boolean not null default true,
  limite_credito numeric(12, 2) not null default 0,
  data_vencimento timestamptz
);

create table children (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  nome text not null,
  sexo text not null check (sexo in ('feminino', 'masculino')),
  data_nascimento date not null,
  tamanho_roupa text not null,
  numeracao_calcado text not null,
  observacoes text
);

create table payment_records (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  data timestamptz not null default now(),
  valor numeric(12, 2) not null,
  observacao text
);

create table malinhas (
  id uuid primary key default gen_random_uuid(),
  numero text not null,
  cliente_id uuid not null references customers(id),
  status text not null check (status in ('preparando', 'com_cliente', 'fechada')),
  data_preparo timestamptz not null default now(),
  data_envio timestamptz,
  previsao_devolucao timestamptz,
  data_devolucao timestamptz,
  observacoes text,
  created_at timestamptz not null default now()
);

create table malinha_itens (
  id uuid primary key default gen_random_uuid(),
  malinha_id uuid not null references malinhas(id) on delete cascade,
  product_id uuid not null references products(id),
  variant_id uuid not null references product_variants(id),
  quantidade integer not null,
  quantidade_vendida integer not null default 0,
  quantidade_devolvida integer not null default 0
);

create table sales (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references customers(id),
  product_id uuid not null references products(id),
  variant_id uuid not null references product_variants(id),
  quantidade integer not null,
  preco_unitario numeric(12, 2) not null,
  total numeric(12, 2) not null,
  forma_pagamento text not null check (forma_pagamento in ('pix', 'dinheiro', 'cartao', 'conta_cliente')),
  data timestamptz not null default now(),
  malinha_id uuid references malinhas(id)
);

create index idx_collections_supplier_id on collections(supplier_id);
create index idx_purchase_orders_supplier_id on purchase_orders(supplier_id);
create index idx_purchase_orders_collection_id on purchase_orders(collection_id);
create index idx_purchase_order_items_purchase_order_id on purchase_order_items(purchase_order_id);
create index idx_product_variants_product_id on product_variants(product_id);
create index idx_inventory_movements_variant_id on inventory_movements(variant_id);
create index idx_children_customer_id on children(customer_id);
create index idx_payment_records_customer_id on payment_records(customer_id);
create index idx_malinha_itens_malinha_id on malinha_itens(malinha_id);
create index idx_sales_cliente_id on sales(cliente_id);
create index idx_malinhas_cliente_id on malinhas(cliente_id);

insert into stores (id, nome_exibicao, nome_curto, logo_emoji, versao)
values ('amarelinha-kids', 'Amarelinha Gestor', 'Amarelinha', '🧸', 'v1.0');

-- RLS: habilitado em todas as tabelas; acesso liberado para usuários autenticados
-- (app é single-tenant/uso interno hoje — refinar por papel quando necessário)
alter table stores enable row level security;
alter table locations enable row level security;
alter table suppliers enable row level security;
alter table collections enable row level security;
alter table purchase_orders enable row level security;
alter table purchase_order_items enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table inventory_movements enable row level security;
alter table customers enable row level security;
alter table children enable row level security;
alter table payment_records enable row level security;
alter table malinhas enable row level security;
alter table malinha_itens enable row level security;
alter table sales enable row level security;

create policy "authenticated full access" on stores for all to authenticated using (true) with check (true);
create policy "authenticated full access" on locations for all to authenticated using (true) with check (true);
create policy "authenticated full access" on suppliers for all to authenticated using (true) with check (true);
create policy "authenticated full access" on collections for all to authenticated using (true) with check (true);
create policy "authenticated full access" on purchase_orders for all to authenticated using (true) with check (true);
create policy "authenticated full access" on purchase_order_items for all to authenticated using (true) with check (true);
create policy "authenticated full access" on products for all to authenticated using (true) with check (true);
create policy "authenticated full access" on product_variants for all to authenticated using (true) with check (true);
create policy "authenticated full access" on inventory_movements for all to authenticated using (true) with check (true);
create policy "authenticated full access" on customers for all to authenticated using (true) with check (true);
create policy "authenticated full access" on children for all to authenticated using (true) with check (true);
create policy "authenticated full access" on payment_records for all to authenticated using (true) with check (true);
create policy "authenticated full access" on malinhas for all to authenticated using (true) with check (true);
create policy "authenticated full access" on malinha_itens for all to authenticated using (true) with check (true);
create policy "authenticated full access" on sales for all to authenticated using (true) with check (true);
