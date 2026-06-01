import type { OutreachPlan, WizardInput } from '../types/plan'

const KEY = 'outreach-plan'

interface Stored {
  plan: OutreachPlan
  input: WizardInput
}

export function savePlanToSession(plan: OutreachPlan, input: WizardInput): void {
  sessionStorage.setItem(KEY, JSON.stringify({ plan, input }))
}

export function loadPlanFromSession(): Stored | null {
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Stored
  } catch {
    return null
  }
}

export function clearPlanSession(): void {
  sessionStorage.removeItem(KEY)
}
