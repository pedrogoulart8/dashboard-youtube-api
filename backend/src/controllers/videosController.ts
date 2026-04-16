import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { searchVideos } from '../services/videosService.js'
import type { ApiSuccess } from '../../../shared/types/index.js'

const searchSchema = z.object({
  q: z.string().min(1),
  order: z.enum(['relevance', 'date', 'viewCount', 'rating']).optional(),
  duration: z.enum(['any', 'short', 'medium', 'long']).optional(),
  pageToken: z.string().optional(),
  maxResults: z.coerce.number().int().min(1).max(50).optional(),
})

export async function handleSearchVideos(req: FastifyRequest, reply: FastifyReply) {
  const params = searchSchema.parse(req.query)
  const data = await searchVideos(params)
  const response: ApiSuccess<typeof data> = {
    data,
    cached: false,
    timestamp: new Date().toISOString(),
  }
  return reply.send(response)
}
