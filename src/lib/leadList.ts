import type { ApolloPerson } from './apolloSearch.js'
import { apolloDisplayName } from './apolloSearch.js'
import type { IcpExample, WizardInput } from '../types/plan.js'

export interface QueueLead {
  id: string
  name: string
  title: string
  company: string
  place: string
  source: 'apollo' | 'example'
}

export function leadSearchKeywords(idealCustomer: string): string {
  const trimmed = idealCustomer.trim()
  const lower = trimmed.toLowerCase()
  if (lower.includes('dental') && lower.includes('owner')) return 'dental office owner'
  if (lower.includes('dentist')) return 'dentist'
  if (lower.includes('restaurant') && lower.includes('owner')) return 'restaurant owner'
  if (lower.includes('office manager')) return 'office manager'
  if (lower.includes('owner')) return 'business owner'
  const first = trimmed.split(/[.!?]/)[0]?.trim() ?? trimmed
  return first.replace(/\s+(in|near|around|with)\s+[\w\s,'-]+$/i, '').trim() || trimmed
}

export function mapApolloPersonToQueueLead(person: ApolloPerson, index: number): QueueLead {
  const { fullName } = apolloDisplayName(person)
  const company = (person.organization?.name ?? '').trim() || 'Local business'
  const title = (person.title ?? '').trim() || 'Owner'
  const place = [person.city, person.state].filter(Boolean).join(', ') || 'Your area'
  return {
    id: person.id ?? `apollo-${index}`,
    name: fullName,
    title,
    company,
    place,
    source: 'apollo',
  }
}

const DEMO_NAMES = [
  'Frank Miller',
  'Lisa Chen',
  'James Ortiz',
  'Nina Patel',
  'Chris Webb',
  'Amanda Brooks',
  'Ryan Torres',
  'Elena Kim',
  'Mike Sullivan',
  'Sarah Nguyen',
]

export function buildDemoLeadList(
  input: WizardInput,
  seed: IcpExample,
  count = 10,
): QueueLead[] {
  const area = input.customerLocation.trim() || input.yourLocation.trim() || 'your area'
  const titleBase = seed.title || 'Owner'
  const companyBase = seed.companyName || seed.companyType || 'local business'

  return Array.from({ length: count }, (_, i) => {
    const name = DEMO_NAMES[i] ?? `Contact ${i + 1}`
    return {
      id: `demo-${i}`,
      name,
      title: i === 0 ? titleBase : titleBase,
      company: i === 0 ? companyBase : `${companyBase.replace(/\.$/, '')} (${i + 1})`,
      place: area,
      source: 'example' as const,
    }
  })
}

export function padLeadList(
  leads: QueueLead[],
  input: WizardInput,
  seed: IcpExample,
  target = 10,
): QueueLead[] {
  if (leads.length >= target) return leads.slice(0, target)
  const demos = buildDemoLeadList(input, seed, target)
  const seen = new Set(leads.map((l) => l.name.toLowerCase()))
  for (const d of demos) {
    if (leads.length >= target) break
    if (!seen.has(d.name.toLowerCase())) {
      leads.push(d)
      seen.add(d.name.toLowerCase())
    }
  }
  return leads.slice(0, target)
}
