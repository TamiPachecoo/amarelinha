# Deployment

Ainda não configurado. Este é o plano para quando o app estiver pronto
para ir ao ar.

## Variáveis de ambiente necessárias

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Build local

```bash
npm install
npm run build   # gera dist/
npm run preview # serve o build de produção localmente
```

## Hospedagem (sugestão)

Qualquer host de site estático (Vercel, Netlify, Cloudflare Pages)
funciona bem com Vite. Configurar as duas variáveis acima no painel do
provedor antes do primeiro deploy.
