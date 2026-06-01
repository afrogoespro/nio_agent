import type { VercelRequest, VercelResponse } from '@vercel/node'
import { searchApolloPeople } from '../src/lib/apolloSearch.js'
import { getServerApolloKey } from './lib/apolloEnv.js'

interface Body {
  keywords?: string
  location?: string
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

  const { keywords, location } = req.body as Body
  if (!keywords?.trim()) {
    return res.status(400).json({ error: 'Missing keywords.' })
  }

  const result = await searchApolloPeople(apiKey, keywords.trim(), location?.trim() ?? '')

  if (!result.ok) {
    return res.status(502).json({ error: result.reason })
  }

  return res.status(200).json({
    people: result.people,
    message: `Found ${result.people.length} leads from Apollo.`,
  })
}
