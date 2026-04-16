import type { FastifyInstance } from 'fastify'
import { handleGetChannelById, handleSearchChannel } from '../controllers/channelController.js'

export async function channelRoutes(app: FastifyInstance) {
  app.get('/channel/search', handleSearchChannel)
  app.get('/channel/:id', handleGetChannelById)
}
