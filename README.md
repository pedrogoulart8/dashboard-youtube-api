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
