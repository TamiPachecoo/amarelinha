create table purchase_order_payments (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references purchase_orders(id) on delete cascade,
  forma_pagamento text not null check (forma_pagamento in ('avista', 'prazo', 'cartao_parcelado', 'boleto')),
  numero_parcela integer not null default 1,
  total_parcelas integer not null default 1,
  valor numeric(12, 2) not null,
  data_vencimento date not null,
  pago boolean not null default false,
  data_pagamento date,
  created_at timestamptz not null default now()
);

create index idx_purchase_order_payments_order_id on purchase_order_payments(purchase_order_id);

alter table purchase_order_payments enable row level security;
create policy "authenticated full access" on purchase_order_payments for all to authenticated using (true) with check (true);
