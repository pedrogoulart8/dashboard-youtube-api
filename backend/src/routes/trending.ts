import type { FastifyInstance } from 'fastify'
import { handleGetTrending } from '../controllers/trendingController.js'

export async function trendingRoutes(app: FastifyInstance) {
  app.get('/trending', handleGetTrending)
}
