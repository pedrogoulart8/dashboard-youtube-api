import type { FastifyInstance } from 'fastify'
import { handleCompareChannels } from '../controllers/compareController.js'

export async function compareRoutes(app: FastifyInstance) {
  app.get('/channels/compare', handleCompareChannels)
}
