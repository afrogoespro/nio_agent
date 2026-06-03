import type { VercelRequest, VercelResponse } from '@vercel/node'
import { APOLLO_MAX_RESULTS } from '../src/lib/apolloConfig.js'
import { apolloSearchReason, searchApolloPeople } from '../src/lib/apolloSearch.js'
import { getServerApolloKey } from './lib/apolloEnv.js'

interface Body {
  keywords?: string
  location?: string
  limit?: number
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const headerKey = req.headers['x-apollo-key']
  const userKey = typeof headerKey === 'string' ? headerKey : ''
  const apiKey = userKey || getServerApolloKey()

  if (!apiKey) {
    return res.status(503).json({
      error: 'Add your Apollo API key or set APOLLO_API_KEY on the server.',
    })
  }

  const body = req.body as Body
  const { keywords, location } = body
  if (!keywords?.trim()) {
    return res.status(400).json({ error: 'Missing keywords.' })
  }

  const requested = Number(body.limit)
  const limit = Number.isFinite(requested)
    ? Math.min(APOLLO_MAX_RESULTS, Math.max(1, requested))
    : APOLLO_MAX_RESULTS

  const result = await searchApolloPeople(apiKey, keywords.trim(), location?.trim() ?? '', {
    perPage: limit,
  })

  if (result.ok === false) {
    return res.status(502).json({ error: apolloSearchReason(result) })
  }

  return res.status(200).json({
    people: result.people,
    message: `Found ${result.people.length} leads from Apollo.`,
  })
}
