# YouTube Insights Dashboard

Dashboard fullstack para análise de canais e vídeos do YouTube consumindo a YouTube Data API v3 em tempo real.

---

## Sobre o projeto

Dashboard que consome dados do Youtube (YouTube Data API v3) e exibe métricas reais de canais do YouTube. Quatro modos: análise detalhada de canal com gráficos de performance, busca de vídeos com filtros, trending por região com distribuição por categoria, e comparador lado a lado de até 4 canais.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts, React Query |
| Backend | Node.js, TypeScript, Fastify, googleapis SDK |
| Cache | Redis (15 min TTL) com fallback em memória |
| Validação | Zod |
| Testes | Vitest |
| Deploy | Vercel + Railway |

---

## Algumas decisões que tomei

**Cache com fallback** — a YouTube API tem limite de 10k unidades por dia. Sem cache, uma sessão de testes esgota a quota em minutos. Implementei Redis com TTL de 15 minutos e um fallback automático para memória quando o Redis não está disponível, então o app funciona em dev sem configuração extra.

**Fastify em vez de Express** — suporte nativo a TypeScript, plugins composáveis e mais rápido em benchmarks. Queria experimentar algo além do Express que é o padrão de todo tutorial.

**Monorepo com shared/types** — frontend e backend compartilham as mesmas interfaces TypeScript. Se eu renomear um campo, o TypeScript reclama nos dois lugares ao mesmo tempo.

**React Query** — gerencia loading, erro e cache no cliente sem boilerplate. Combinado com o cache de 15 min do backend, o consumo de quota cai drasticamente.

---

## Rodando localmente

```bash
git clone https://github.com/pedrogoulart8/dashboard-youtube-api.git
cd dashboard-youtube-api
npm install

cp backend/.env.example backend/.env
# Adicione sua chave da YouTube API no .env

npm run dev
```

- Frontend → http://localhost:5173
- Backend → http://localhost:3001

Para os testes: `npm test`

### Chave da YouTube API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto e ative a **YouTube Data API v3**
3. Gere uma chave em **Credenciais → Criar credenciais → Chave de API**
4. Cole em `backend/.env` como `YOUTUBE_API_KEY`

> Quota gratuita: 10.000 unidades/dia. Uma busca de canal custa ~5 unidades.

---

## Licença

MIT
