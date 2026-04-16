import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { getTrending } from '../services/trendingService.js'
import type { ApiSuccess } from '../../../shared/types/index.js'

const trendingSchema = z.object({
  regionCode: z.string().length(2).toUpperCase().optional(),
  categoryId: z.string().optional(),
  maxResults: z.coerce.number().int().min(1).max(50).optional(),
})

export async function handleGetTrending(req: FastifyRequest, reply: FastifyReply) {
  const params = trendingSchema.parse(req.query)
  const data = await getTrending(params)
  const response: ApiSuccess<typeof data> = {
    data,
    cached: false,
    timestamp: new Date().toISOString(),
  }
  return reply.send(response)
}
