import type { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { compareChannels } from '../services/compareService.js'
import type { ApiSuccess } from '../../../shared/types/index.js'

const compareSchema = z.object({
  ids: z
    .string()
    .min(1)
    .transform((val) => val.split(',').map((id) => id.trim()).filter(Boolean)),
})

export async function handleCompareChannels(req: FastifyRequest, reply: FastifyReply) {
  const { ids } = compareSchema.parse(req.query)
  if (ids.length < 2 || ids.length > 4) {
    return reply.status(400).send({
      error: 'Provide between 2 and 4 channel IDs (comma-separated)',
      code: 'INVALID_INPUT',
      statusCode: 400,
    })
  }
  const data = await compareChannels(ids)
  const response: ApiSuccess<typeof data> = {
    data,
    cached: false,
    timestamp: new Date().toISOString(),
  }
  return reply.send(response)
}
