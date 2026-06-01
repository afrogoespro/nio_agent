import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    apolloServer: Boolean(process.env.APOLLO_API_KEY),
    emailServer: Boolean(process.env.RESEND_API_KEY),
  })
}
