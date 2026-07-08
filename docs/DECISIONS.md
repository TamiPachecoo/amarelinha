# Decisões técnicas

## Tailwind CSS v4 em vez de v3

O pacote instalado foi a v4 (`tailwindcss@4`), que usa o plugin
`@tailwindcss/vite` em vez de PostCSS/`tailwind.config.js`. A
configuração de tema vive em `src/index.css` via `@theme inline` e
`:root`, não em um arquivo `tailwind.config.ts`. Isso é o padrão atual
do shadcn/ui para projetos Vite novos.

## Supabase próprio para o Amarelinha Gestor

Este projeto é separado do Camarim Mineiro (outro app do mesmo usuário,
feito em HTML puro). A decisão foi manter os dados completamente
isolados — o Amarelinha Gestor deve usar seu próprio projeto Supabase.
Ver `docs/DATABASE.md`.

## `noValidate` no formulário de login

O Chrome exibe uma dica nativa de validação de e-mail em inglês antes
que o React Hook Form/Zod consiga rodar, escondendo a mensagem em
português. Adicionamos `noValidate` no `<form>` para que apenas a
validação Zod controle as mensagens de erro.

## Estrutura feature-based

Cada módulo de negócio vive em `src/features/<modulo>/` com sua própria
`types.ts`, `schemas/`, `store/` e `components/`. Módulos novos
(fornecedores, coleções, compras, recebimento, estoque) seguem esse
padrão. `src/pages/` fica fino — só compõe componentes de feature.

## Bypass de autenticação em desenvolvimento (`VITE_SKIP_AUTH`)

Antes de haver um projeto Supabase real conectado, `ProtectedRoute`
aceita `VITE_SKIP_AUTH=true` em `.env.local` para pular a checagem de
sessão e permitir navegar por todas as páginas. É uma flag **temporária
de desenvolvimento**, não uma feature — remover (ou deixar `false`)
assim que o login real estiver configurado.

## Amarelinha Gestor é o primeiro tenant de uma base "Retail OS", não um app de nicho único

O app foi desenhado para, no futuro, atender mais de uma boutique com o
mesmo código. Isso não significa que o projeto foi renomeado hoje —
foi tomada a decisão deliberada de **preparar a arquitetura sem fazer
o rename visível ainda** (ver opção escolhida pelo usuário: "preparar
arquitetura, não fazer rebrand agora"). Na prática:

- `src/config/storeSettings.ts` centraliza nome de exibição, nome curto,
  emoji de logo e versão. Componentes (`AppSidebar`, `index.html`) leem
  daqui em vez de ter strings soltas.
- Uma segunda loja no futuro é, na teoria, um novo registro de
  `StoreSettings` (ou uma linha na tabela `stores`), não uma reescrita
  de componentes — mas isso só vale para o que já foi migrado; nem
  todo texto do app passa por `storeSettings` ainda (ex.: `index.html`
  ainda tem "Amarelinha Gestor" no `<title>`/meta description
  hardcoded, e widgets como o rodapé do sidebar combinam
  `storeSettings.nomeExibicao` com dados fixos). Migrar 100% dos pontos
  de branding é trabalho para quando existir de fato uma segunda loja
  — não antes, para não gerar abstração sem uso real.

## Ciclo de vida do produto controla a modelagem de dados

Toda decisão de schema segue o fluxo `Fornecedor → Coleção → Pedido de
Compra → Recebimento → Estoque → Venda → Cliente → Relatórios`. Isso
levou a duas decisões concretas:

1. **Estoque nunca nasce solto.** O caminho "correto" é sempre um
   Pedido de Compra recebido via `src/features/receiving`, que cria o
   `Product`/`ProductVariant` herdando dados do item do pedido (nome,
   categoria, marca, cor, tamanho, localização, custo, preço de venda).
   O cadastro manual em `/produtos` continua existindo como via
   secundária (útil sem um fornecedor formal), mas não é o caminho
   principal — produtos criados assim ficam com `custo = 0` até
   receberem uma entrada real.
2. **Origem do pedido é um campo, não um módulo.** `PurchaseOrder.origem`
   é `"manual" | "pdf" | "site" | "excel"`. Só `"manual"` está
   implementado. Isso existe para que o futuro Assistente de Compras
   (upload de PDF com IA, importação de site, Excel) crie o mesmo tipo
   `PurchaseOrder` por um caminho diferente, sem exigir refatorar
   Pedidos de Compra, Recebimento ou Estoque.

## CRM de Clientes e Vendas foram modelados, mas não conectados nesta rodada

Os dois módulos existem como `types`/`schemas`/`store` completos em
`src/features/customers/` e `src/features/sales/`, incluindo cálculo de
saldo devedor. Eles não têm página, rota nem item de navegação ainda.
A decisão foi deliberada: o pedido deste milestone era especificamente
o módulo de Compras (Fornecedores → Coleções → Pedidos → Recebimento) e
a orientação explícita foi preferir "vertical slices completos" a
vários módulos pela metade. Conectar Clientes/Vendas é o próximo
milestone recomendado (ver `ROADMAP.md`).

## Saldo devedor do cliente é derivado, não armazenado

`saldoDevedor` de um `Customer` não é um campo persistido — é calculado
a partir de `sales` com `formaPagamento: "conta_cliente"` menos
`historicoPagamentos`. Evita ter dois números (saldo salvo vs. soma das
vendas/pagamentos) que podem divergir com o tempo.

## Localização física é escolhida no Recebimento, não no Pedido de Compra

Pedidos de Compra não têm campo de localização por item — só o
Recebimento pergunta "onde isso vai ficar na loja". Faz mais sentido
operacionalmente (quem recebe a mercadoria decide o lugar físico, não
quem faz o pedido) e evita que a mesma decisão seja tomada duas vezes.

## CSV em vez de `.xlsx` para exportar o pedido

A forma padrão de gerar um `.xlsx` no navegador (pacote `xlsx`/SheetJS)
tem duas vulnerabilidades de alta severidade sem correção disponível no
registro do npm (prototype pollution, ReDoS). Como só precisávamos
*escrever* uma planilha simples — não interpretar arquivos de terceiros
— optamos por gerar um CSV com BOM UTF-8 e delimitador `;` (o que o
Excel em português espera), sem nenhuma dependência nova. Abre
corretamente no Excel; se no futuro for necessário um `.xlsx` "de
verdade" (múltiplas abas, formatação), reavaliar com uma fonte corrigida.

## Malinha Amarelinha não modela localização por lote — só baixa/devolve quantidade

O pedido original descreve a Malinha como "estoque transferido para uma
localização temporária associada ao cliente". O modelo atual de
`ProductVariant` só suporta uma `localizacaoId` por variante (a
prateleira "de casa"), não uma localização por lote/remessa. Modelar
uma localização de verdade por malinha exigiria reestruturar
`ProductVariant` para ter quantidade por localização (uma tabela de
junção variante↔localização), o que é um refactor maior do que este
milestone pedia.

Em vez disso: enviar uma malinha decrementa `variant.quantidade` (com
um movimento `malinha` negativo, igual a uma venda tira do estoque);
fechar a malinha soma de volta a parte devolvida (movimento `malinha`
positivo) e gera uma venda real para a parte vendida — sem descontar o
estoque de novo. O rastro de "onde cada unidade foi parar" existe no
histórico de movimentações, mesmo sem uma localização formal. Se o
negócio precisar saber "quais malinhas estão com produtos agora" de
forma mais rica (ex.: relatório por malinha em aberto), isso já é
possível hoje pela tela de detalhe da malinha — o refactor de
localização por lote só vale a pena se surgir uma necessidade real de
múltiplas localizações simultâneas por variante.

## Fechamento da malinha usa uma forma de pagamento única para toda a venda

Ao fechar uma Malinha Amarelinha, o usuário informa quanto de cada item
foi vendido e escolhe **uma** forma de pagamento para o fechamento
inteiro (não uma por item). Isso reflete o caso de uso real — a cliente
decide o que vai ficar e paga tudo de uma vez — e evita uma tela de
fechamento com N seletores de forma de pagamento. Se o negócio
precisar de pagamento misto (parte PIX, parte conta do cliente) no
fechamento de uma mesma malinha, isso vira um formulário mais rico no
futuro.

## Recebimento parcial e avarias não usam uma tabela própria de "avarias"

Ao receber um item de Pedido de Compra, o usuário informa a quantidade
recebida agora e, dentro dela, quantas vieram avariadas/faltando. As
unidades avariadas contam para "recebido" no pedido (fecham o pedido
corretamente), mas **não** entram no estoque vendável. Não existe um
registro separado de avarias com motivo/foto — é uma simplificação
deliberada do MVP, documentada aqui para não ser reinventada sem
necessidade; se o negócio precisar rastrear avarias com mais detalhe,
isso vira uma tabela própria no futuro.
