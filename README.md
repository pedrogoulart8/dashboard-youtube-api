# YouTube Insights Dashboard

Dashboard fullstack para análise de canais e vídeos do YouTube consumindo a YouTube Data API v3 em tempo real.

[![Ver demo](https://img.shields.io/badge/Demo-ao_vivo-FF0033?style=for-the-badge)](https://SUA_URL.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)]()
[![Fastify](https://img.shields.io/badge/Fastify-4-000000?logo=fastify&logoColor=white&style=flat-square)]()
[![Redis](https://img.shields.io/badge/Redis-cache-DC382D?logo=redis&logoColor=white&style=flat-square)]()

![Demo](./docs/demo.gif)

---

## Sobre o projeto

Construí esse projeto pra praticar desenvolvimento fullstack com integração de API externa. A ideia foi ir além do frontend e montar um backend real com cache, validação e tratamento de erros — tudo que um projeto em produção precisaria ter.

O app tem quatro modos: análise de canal, busca de vídeos com filtros, trending por região e comparador de até 4 canais lado a lado.

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
