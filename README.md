# Amarelinha Gestor

Sistema de gestão de estoque para boutiques infantis. PWA em
React + TypeScript + Vite, com Tailwind CSS, shadcn/ui e Supabase.

Veja `docs/ROADMAP.md` para o plano de milestones e `docs/CHANGELOG.md`
para o que já foi construído.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com seu projeto Supabase
npm run dev
```

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção (`tsc -b && vite build`)
- `npm run preview` — serve o build de produção localmente
- `npm run lint` — Oxlint
