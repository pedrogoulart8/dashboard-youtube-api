import type { FastifyInstance } from 'fastify'
import { handleSearchVideos } from '../controllers/videosController.js'

export async function videosRoutes(app: FastifyInstance) {
  app.get('/videos/search', handleSearchVideos)
}
