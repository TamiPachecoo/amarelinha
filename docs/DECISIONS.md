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
isolados — o Amarelinha Gestor deve usar seu próprio projeto Supabase,
ainda não criado. Ver `docs/DATABASE.md`.

## `noValidate` no formulário de login

O Chrome exibe uma dica nativa de validação de e-mail em inglês antes
que o React Hook Form/Zod consiga rodar, escondendo a mensagem em
português. Adicionamos `noValidate` no `<form>` para que apenas a
validação Zod controle as mensagens de erro.

## Estrutura feature-based

Autenticação vive em `src/features/auth/` (componentes, store, schema
próprios). Funcionalidades futuras (produtos, estoque) devem seguir o
mesmo padrão em vez de crescer dentro de `src/pages/`.
