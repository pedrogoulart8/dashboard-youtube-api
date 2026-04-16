import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { ZodError } from 'zod'
import { channelRoutes } from './routes/channel.js'
import { videosRoutes } from './routes/videos.js'
import { trendingRoutes } from './routes/trending.js'
import { compareRoutes } from './routes/compare.js'

export function buildServer() {
  const app = Fastify({ logger: true })

  // ─── Plugins ────────────────────────────────────────────────────────────────

  app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET'],
  })

  app.register(rateLimit, {
    max: 60,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      error: 'Too many requests — please wait a moment',
      code: 'RATE_LIMITED',
      statusCode: 429,
    }),
  })

  // ─── Routes ─────────────────────────────────────────────────────────────────

  app.register(channelRoutes, { prefix: '/api' })
  app.register(videosRoutes, { prefix: '/api' })
  app.register(trendingRoutes, { prefix: '/api' })
  app.register(compareRoutes, { prefix: '/api' })

  // ─── Health check ────────────────────────────────────────────────────────────

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // ─── Centralised error handler ───────────────────────────────────────────────

  app.setErrorHandler((error, _req, reply) => {
    app.log.error(error)

    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: error.flatten().fieldErrors,
      })
    }

    // YouTube API quota exceeded
    if ((error as any).code === 403 || error.message?.includes('quota')) {
      return reply.status(429).send({
        error: 'YouTube API quota exceeded. Please try again later.',
        code: 'QUOTA_EXCEEDED',
        statusCode: 429,
      })
    }

    // YouTube not found
    if (error.message?.includes('not found')) {
      return reply.status(404).send({
        error: error.message,
        code: 'NOT_FOUND',
        statusCode: 404,
      })
    }

    const statusCode = (error as any).statusCode ?? 500
    return reply.status(statusCode).send({
      error: statusCode === 500 ? 'Internal server error' : error.message,
      code: 'SERVER_ERROR',
      statusCode,
    })
  })

  return app
}
