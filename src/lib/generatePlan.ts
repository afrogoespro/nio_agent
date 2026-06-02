import type { OutreachPlan, WizardInput } from '../types/plan'
import { getApolloApiKey } from './integrationStore'

export async function generatePlan(input: WizardInput): Promise<OutreachPlan> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 25000)

  let res: Response
  try {
    res = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-apollo-key': getApolloApiKey(),
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('That took too long. Click Build my plan again, or use Try an example.')
    }
    throw new Error('Could not reach the server. Check your connection and try again.')
  } finally {
    clearTimeout(timer)
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg =
      typeof data === 'object' && data && 'error' in data
        ? String((data as { error: string }).error)
        : 'Could not build your plan. Please try again.'
    throw new Error(msg)
  }

  return data as OutreachPlan
}
