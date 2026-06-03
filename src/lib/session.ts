import type { OutreachPlan, WizardInput } from '../types/plan'

const KEY = 'outreach-plan-v2'

interface Stored {
  plan: OutreachPlan
  input: WizardInput
  extraIcpTraits?: string[]
  leadApproved?: boolean
  validationEnabled?: boolean
}

export function savePlanToSession(
  plan: OutreachPlan,
  input: WizardInput,
  extraIcpTraits: string[] = [],
  meta?: { leadApproved?: boolean; validationEnabled?: boolean },
): void {
  const prev = loadPlanFromSession()
  sessionStorage.setItem(
    KEY,
    JSON.stringify({
      plan,
      input,
      extraIcpTraits,
      leadApproved: meta?.leadApproved ?? prev?.leadApproved,
      validationEnabled: meta?.validationEnabled ?? prev?.validationEnabled,
    }),
  )
  sessionStorage.removeItem('outreach-plan')
}

export function loadPlanFromSession(): Stored | null {
  const raw = sessionStorage.getItem(KEY) ?? sessionStorage.getItem('outreach-plan')
  if (!raw) return null
  try {
    const stored = JSON.parse(raw) as Stored
    if (!stored?.plan?.icpExample?.source) {
      clearPlanSession()
      return null
    }
    return stored
  } catch {
    return null
  }
}

export function clearPlanSession(): void {
  sessionStorage.removeItem(KEY)
  sessionStorage.removeItem('outreach-plan')
}

export function getExtraIcpTraitsFromStored(stored: Stored | null): string[] {
  return stored?.extraIcpTraits?.filter((t) => t.trim()) ?? []
}
