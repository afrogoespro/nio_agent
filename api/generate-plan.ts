import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getServerApolloKey } from './lib/apolloEnv.js'
import { buildOutreachPlan } from '../src/lib/planBuilder.js'
import type { WizardInput } from '../src/types/plan'

export const config = {
  maxDuration: 30,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const headerKey = req.headers['x-apollo-key']
  const userKey = typeof headerKey === 'string' ? headerKey : ''
  const apiKey = userKey || getServerApolloKey()

  const input = req.body as WizardInput
  if (!input?.business?.trim() || !input?.idealCustomer?.trim()) {
    return res.status(400).json({ error: 'Missing business or ideal customer.' })
  }

  try {
    const plan = await buildOutreachPlan(input, apiKey)
    return res.status(200).json(plan)
  } catch (err) {
    console.error('generate-plan failed:', err)
    return res.status(500).json({ error: 'Could not build your plan. Please try again.' })
  }
}
