import type { VercelRequest, VercelResponse } from '@vercel/node'
import { buildOutreachPlan } from '../src/lib/planBuilder'
import type { WizardInput } from '../src/types/plan'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const headerKey = req.headers['x-apollo-key']
  const userKey = typeof headerKey === 'string' ? headerKey : ''
  const apiKey = userKey || process.env.APOLLO_API_KEY || ''

  const input = req.body as WizardInput
  if (!input?.business?.trim() || !input?.idealCustomer?.trim()) {
    return res.status(400).json({ error: 'Missing business or ideal customer.' })
  }

  try {
    const plan = await buildOutreachPlan(input, apiKey)
    return res.status(200).json(plan)
  } catch {
    return res.status(500).json({ error: 'Could not build your plan.' })
  }
}
