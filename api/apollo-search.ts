import type { VercelRequest, VercelResponse } from '@vercel/node'

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
  const apiKey = userKey || process.env.APOLLO_API_KEY || ''

  if (!apiKey) {
    return res.status(503).json({
      error: 'Add your Apollo API key or set APOLLO_API_KEY on the server.',
    })
  }

  const { keywords, location } = req.body as Body
  if (!keywords?.trim()) {
    return res.status(400).json({ error: 'Missing keywords.' })
  }

  try {
    const response = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        q_keywords: keywords.trim(),
        person_locations: location?.trim() ? [location.trim()] : undefined,
        per_page: 5,
        page: 1,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const msg =
        typeof data === 'object' && data && 'error' in data
          ? String((data as { error: string }).error)
          : 'Apollo API error'
      return res.status(response.status).json({ error: msg })
    }

    const people =
      typeof data === 'object' && data && 'people' in data
        ? (data as { people: unknown[] }).people
        : []

    return res.status(200).json({
      people,
      message:
        people.length > 0
          ? `Found ${people.length} leads from Apollo.`
          : 'No leads found. Try broader keywords or location.',
    })
  } catch {
    return res.status(500).json({ error: 'Could not reach Apollo.' })
  }
}
