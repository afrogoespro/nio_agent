import type { AgentId, IcpExample, OutreachPlan, WizardInput } from '../types/plan.js'
import { APOLLO_PLAN_SAMPLE_SIZE } from './apolloConfig.js'
import {
  apolloDisplayName,
  apolloSearchReason,
  searchApolloPeople,
  type ApolloPerson,
} from './apolloSearch.js'
import { writeColdOpeningEmail } from './coldEmail.js'
import {
  normalizeCustomerLocation,
  normalizeYourLocation,
  pickSearchLocations,
} from './searchLocations.js'
import { buildLeadWhyFit } from './industryPainPoints.js'
import { formatEmail, formatOutreachText } from './outreachVoice.js'

interface LeadContext {
  firstName: string
  fullName: string
  title: string
  company: string
  place: string
}

type ApolloFetchOk = { ok: true; person: ApolloPerson }
type ApolloFetchFail = { ok: false; reason: string }
type ApolloFetchResult = ApolloFetchOk | ApolloFetchFail

function apolloFetchReason(result: ApolloFetchFail): string {
  return result.reason
}

export async function buildOutreachPlan(
  input: WizardInput,
  apolloApiKey: string,
): Promise<OutreachPlan> {
  const normalizedInput = normalizeWizardInput(input)

  try {
    return await buildOutreachPlanCore(normalizedInput, apolloApiKey)
  } catch (err) {
    console.error('buildOutreachPlan failed:', err)
    return buildOutreachPlanCore(normalizedInput, '', {
      apolloNote:
        'We hit a snag finding a live lead. Here is a demo plan so you can still review the emails.',
    })
  }
}

function normalizeWizardInput(input: WizardInput): WizardInput {
  const yourLocation = normalizeYourLocation(input.yourLocation)
  return {
    ...input,
    yourLocation,
    customerLocation: normalizeCustomerLocation(input.customerLocation, yourLocation),
  }
}

async function buildOutreachPlanCore(
  input: WizardInput,
  apolloApiKey: string,
  overrides?: { apolloNote?: string | null; person?: ApolloPerson | null },
): Promise<OutreachPlan> {
  let apolloNote: string | null = overrides?.apolloNote ?? null
  let person: ApolloPerson | null = overrides?.person ?? null

  if (!overrides && !apolloApiKey.trim()) {
    apolloNote =
      'Apollo key not found on server. Add APOLLO_API_KEY in Vercel, redeploy, then Start over.'
  } else if (!overrides) {
    const result = await fetchOnePerson(input, apolloApiKey)
    if (result.ok) {
      person = result.person
    } else {
      apolloNote = apolloFetchReason(result)
    }
  }

  const lead = person ? mapApolloToLead(person, input) : mapExampleLead(input)
  const ctx = leadContextFromIcp(lead)

  const sampleEmail = formatEmail(writeOpeningEmail(input.agentId, input, ctx))
  const drip = [
    { dayLabel: 'Day 1', ...sampleEmail },
    { dayLabel: 'Day 4', ...formatEmail(writeFollowUp(input.agentId, input, ctx, 2)) },
    { dayLabel: 'Day 8', ...formatEmail(writeFollowUp(input.agentId, input, ctx, 3)) },
  ]

  return {
    icpExample: lead,
    sampleEmail,
    icpTraits: buildTraits(input),
    findLeadsTips: buildFindTips(input.customerLocation, input.yourLocation),
    drip,
    apolloNote,
  }
}

async function fetchOnePerson(
  input: WizardInput,
  apiKey: string,
): Promise<ApolloFetchResult> {
  const keywords = buildApolloKeywordSets(input.idealCustomer).slice(0, 3)
  if (keywords.length === 0) keywords.push('business owner')

  const locations = pickSearchLocations(input.customerLocation, input.yourLocation)

  type Attempt = { keywords: string; location: string; skipTitles: boolean }
  const attempts: Attempt[] = []

  for (const kw of keywords) {
    for (const location of locations.length ? locations : ['']) {
      attempts.push({ keywords: kw, location, skipTitles: false })
      attempts.push({ keywords: kw, location, skipTitles: true })
    }
  }
  attempts.push({ keywords: keywords[0] ?? 'business owner', location: '', skipTitles: true })

  const MAX_ATTEMPTS = 6
  for (const attempt of attempts.slice(0, MAX_ATTEMPTS)) {
    const result = await apolloSearch(
      apiKey,
      attempt.keywords,
      attempt.location,
      attempt.skipTitles,
    )
    if (result.ok) return result
  }

  return {
    ok: false,
    reason:
      'No leads found. Use a city like Austin, Texas (not just a state) and a short job title like dental office owner.',
  }
}

function buildApolloKeywordSets(idealCustomer: string): string[] {
  const primary = simplifyIdealCustomer(idealCustomer)
  const lower = primary.toLowerCase()
  const fallbacks: string[] = [primary]

  if (lower.includes('dental')) {
    fallbacks.push('dentist', 'dental practice owner', 'dental office owner')
  } else if (lower.includes('restaurant')) {
    fallbacks.push('restaurant owner', 'restaurant manager')
  } else if (lower.includes('office manager')) {
    fallbacks.push('office manager', 'operations manager')
  } else if (lower.includes('owner')) {
    fallbacks.push('business owner', 'founder')
  }

  return [...new Set(fallbacks)]
}

function simplifyIdealCustomer(text: string): string {
  const trimmed = text.trim()
  const lower = trimmed.toLowerCase()

  if (lower.includes('dental') && lower.includes('owner')) return 'dental office owner'
  if (lower.includes('dentist')) return 'dentist'
  if (lower.includes('restaurant') && lower.includes('manager')) return 'restaurant manager'
  if (lower.includes('restaurant') && lower.includes('owner')) return 'restaurant owner'
  if (lower.includes('cafe') && lower.includes('owner')) return 'cafe owner'
  if (lower.includes('property') && lower.includes('manager')) return 'property manager'
  if (lower.includes('office manager')) return 'office manager'
  if (lower.includes('owner')) return 'business owner'

  const firstSentence = trimmed.split(/[.!?]/)[0]?.trim() ?? trimmed
  return firstSentence.replace(/\s+(in|near|around|with)\s+[\w\s,'-]+$/i, '').trim() || trimmed
}

async function apolloSearch(
  apiKey: string,
  keywords: string,
  location: string,
  skipTitles: boolean,
): Promise<ApolloFetchResult> {
  const result = await searchApolloPeople(apiKey, keywords, location, {
    skipTitles,
    perPage: APOLLO_PLAN_SAMPLE_SIZE,
  })
  if (result.ok === false) {
    return { ok: false, reason: apolloSearchReason(result) }
  }
  const person = result.people[0]
  if (!person) {
    return { ok: false, reason: 'No leads found for these keywords.' }
  }
  return { ok: true, person }
}

function mapApolloToLead(person: ApolloPerson, input: WizardInput): IcpExample {
  const { firstName, fullName } = apolloDisplayName(person)
  const company = (person.organization?.name ?? '').trim() || 'a local business'
  const title = (person.title ?? '').trim() || 'Owner'
  const place = [person.city, person.state].filter(Boolean).join(', ')
  const area = input.customerLocation.trim() || input.yourLocation.trim() || 'your area'

  return {
    source: 'apollo',
    name: fullName,
    firstName,
    title,
    companyName: company,
    companyType: company,
    foundVia: formatOutreachText(
      place ? `Matched in ${place}` : `Matched near ${area}`,
    ),
    whyFit: buildLeadWhyFit({
      idealCustomer: input.idealCustomer,
      business: input.business,
      whyTarget: input.whyTarget,
      companyName: company,
      title,
      place,
      area,
      seed: fullName,
    }).map((line) => formatOutreachText(line)),
  }
}

function mapExampleLead(input: WizardInput): IcpExample {
  return {
    source: 'example',
    name: 'Jordan Lee',
    firstName: 'Jordan',
    title: 'Owner',
    companyName: 'a sample business',
    companyType: formatOutreachText(companyHint(input.idealCustomer)),
    foundVia: formatOutreachText('Example profile for your target market'),
    whyFit: buildLeadWhyFit({
      idealCustomer: input.idealCustomer,
      business: input.business,
      whyTarget: input.whyTarget,
      companyName: companyHint(input.idealCustomer),
      title: 'Owner',
      place: '',
      area: input.customerLocation.trim() || input.yourLocation.trim() || 'your area',
      seed: input.idealCustomer,
    }).map((line) => formatOutreachText(line)),
  }
}

function leadContextFromIcp(lead: IcpExample): LeadContext {
  const place =
    lead.whyFit.find((w) => w.toLowerCase().startsWith('based in'))?.replace(/^based in /i, '') ??
    ''
  return {
    firstName: lead.firstName,
    fullName: lead.name,
    title: lead.title,
    company: lead.companyName,
    place,
  }
}

function writeOpeningEmail(
  agentId: AgentId,
  input: WizardInput,
  ctx: LeadContext,
): { subject: string; body: string } {
  return writeColdOpeningEmail(agentId, input, ctx)
}

function writeFollowUp(
  _agentId: AgentId,
  _input: WizardInput,
  ctx: LeadContext,
  n: 2 | 3,
): { subject: string; body: string } {
  if (n === 2) {
    return {
      subject: `Re: quick note`,
      body: `Hey ${ctx.firstName},

Still on my mind. If you want those free leads lined up, just reply with your packages.

No call needed.

[Your name]`,
    }
  }

  return {
    subject: `Closing the loop`,
    body: `Hey ${ctx.firstName},

Last note from me. If a steady stream of leads ever matters, reply anytime.

[Your name]`,
  }
}

function buildTraits(input: WizardInput): string[] {
  return [
    formatOutreachText(truncate(input.idealCustomer, 100)),
    formatOutreachText('They can say yes or no'),
    formatOutreachText('They have the problem you fix'),
    formatOutreachText('You can reach the decision maker'),
  ]
}

function buildFindTips(customerLocation: string, yourLocation: string): string[] {
  const area = customerLocation.trim() || yourLocation.trim() || 'your area'
  return [
    formatOutreachText(`Search LinkedIn or Google for similar titles in ${area}.`),
    formatOutreachText(`Google the job title and ${area}.`),
    formatOutreachText('Check the company website Contact page.'),
    formatOutreachText('Look at local business directories.'),
  ]
}

function companyHint(idealCustomer: string): string {
  const lower = idealCustomer.toLowerCase()
  if (lower.includes('dental') || lower.includes('dentist')) return 'a local dentist office'
  if (lower.includes('restaurant') || lower.includes('cafe')) return 'a local restaurant'
  return 'a small business like the ones you described'
}

function truncate(s: string, n: number): string {
  const t = s.trim()
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`
}
