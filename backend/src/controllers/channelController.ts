import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { getChannelById, searchChannel } from '../services/channelService.js'
import type { ApiSuccess } from '../../../shared/types/index.js'

const idSchema = z.object({ id: z.string().min(1) })
const searchSchema = z.object({ q: z.string().min(1) })

export async function handleGetChannelById(req: FastifyRequest, reply: FastifyReply) {
  const { id } = idSchema.parse(req.params)
  const data = await getChannelById(id)
  const response: ApiSuccess<typeof data> = {
    data,
    cached: false,
    timestamp: new Date().toISOString(),
  }
  return reply.send(response)
}

export async function handleSearchChannel(req: FastifyRequest, reply: FastifyReply) {
  const { q } = searchSchema.parse(req.query)
  const data = await searchChannel(q)
  const response: ApiSuccess<typeof data> = {
    data,
    cached: false,
    timestamp: new Date().toISOString(),
  }
  return reply.send(response)
}
