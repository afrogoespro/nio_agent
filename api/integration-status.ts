import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getServerApolloKey } from './lib/apolloEnv.js'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    apolloServer: Boolean(getServerApolloKey()),
    emailServer: Boolean(process.env.RESEND_API_KEY),
  })
}
