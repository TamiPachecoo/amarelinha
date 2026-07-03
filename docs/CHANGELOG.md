# Changelog

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
