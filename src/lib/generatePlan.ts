import type { OutreachPlan, WizardInput } from '../types/plan'
import { getApolloApiKey } from './integrationStore'

export async function generatePlan(input: WizardInput): Promise<OutreachPlan> {
  const res = await fetch('/api/generate-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-apollo-key': getApolloApiKey(),
    },
    body: JSON.stringify(input),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg =
      typeof data === 'object' && data && 'error' in data
        ? String((data as { error: string }).error)
        : 'Could not build plan'
    throw new Error(msg)
  }

  return data as OutreachPlan
}
