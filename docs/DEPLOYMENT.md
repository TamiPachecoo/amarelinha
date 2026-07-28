# Deployment

Hospedado na Vercel, ligado ao repositório GitHub. Todo push para
`main` gera um novo deploy automaticamente — não há passo manual.

URL de produção (estável, não muda a cada deploy):
https://amarelinha-puce.vercel.app

## Variáveis de ambiente necessárias

Configuradas em Vercel → Settings → Environment Variables:

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
