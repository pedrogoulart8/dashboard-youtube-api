import 'dotenv/config'
import { buildServer } from './server.js'

const port = parseInt(process.env.PORT ?? '3001', 10)
const host = '0.0.0.0'

const app = buildServer()

app.listen({ port, host }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
