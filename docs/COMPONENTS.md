# Componentes

## UI base (shadcn/ui)

Ficam em `src/components/ui/` e não devem ser editados manualmente para
lógica de negócio — apenas para ajuste de estilo. Adicionar novos com:

```
npx shadcn@latest add <componente>
```

## Layout

- `src/components/layout/AppLayout.tsx` — casca da área autenticada
  (`SidebarProvider` + `AppSidebar` + `SidebarInset`)
- `src/components/layout/AppSidebar.tsx` — navegação principal (Painel,
  Produtos, Estoque, Relatórios, Configurações)
- `src/components/layout/TopNav.tsx` — busca global, notificações, menu
  do usuário (sair)

## Compartilhados

- `src/components/shared/PageHeader.tsx` — título + descrição no topo
  de cada página
- `src/components/shared/EmptyState.tsx` — estado vazio reutilizável
  (ícone + título + descrição), usado nas páginas placeholder e, depois,
  em listas sem resultados

## Autenticação (`src/features/auth/`)

- `components/LoginForm.tsx` — formulário com React Hook Form + Zod
- `components/AuthProvider.tsx` — sincroniza sessão do Supabase com a
  store
- `components/ProtectedRoute.tsx` — bloqueia rotas sem sessão ativa
- `store/authStore.ts` — estado de sessão (Zustand)
- `schemas/loginSchema.ts` — validação Zod do formulário de login

## Convenções

- Todo texto visível ao usuário em português (pt-BR)
- Sem `any`; sem estilos inline
- Formulários sempre com React Hook Form + Zod
- Ícones: `lucide-react`
