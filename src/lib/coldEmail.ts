import type { AgentId, WizardInput } from '../types/plan.js'
import { inferLeadIndustryContext } from './industryPainPoints.js'
import { formatOutreachText } from './outreachVoice.js'

export interface EmailContext {
  firstName: string
  title: string
  company: string
  place: string
}

const MAX_WORDS = 140

export const COLD_EMAIL_BRIEF = {
  goal: 'Simple cold read, then value, then soft ask',
  framework: 'Hey name, saw you do Y, might need help with Z',
  maxWords: MAX_WORDS,
  readingLevel: '5th grade',
  rules: [
    'Line 2 must be: Saw you [role/company] and might need help with [pain].',
    'Do not repeat the sender wizard why-target text.',
    'Sign with the sender name from the wizard.',
  ],
} as const

export function writeColdOpeningEmail(
  agentId: AgentId,
  input: WizardInput,
  ctx: EmailContext,
): { subject: string; body: string } {
  return formatEmailDraft(buildPersonalEmail(agentId, input, ctx))
}

function buildPersonalEmail(
  agentId: AgentId,
  input: WizardInput,
  ctx: EmailContext,
): { subject: string; body: string } {
  const seed = `${ctx.firstName}${ctx.company}${ctx.title}`
  const coldRead = simpleColdRead(ctx, input, seed)
  const value = valueFirstBlock(agentId, input)
  const close = softClose(agentId)

  const body = [
    greetingFor(agentId, ctx.firstName),
    '',
    coldRead,
    '',
    value,
    '',
    close,
    '',
    signOffFor(agentId, input.senderName),
  ].join('\n')

  return { subject: subjectFor(agentId, ctx), body }
}

/** "Saw you're the manager at Office Depot and might need help with …" */
function simpleColdRead(ctx: EmailContext, input: WizardInput, seed: string): string {
  const company = displayCompany(ctx)
  const title = ctx.title.trim()
  const pain = shortPainClause(ctx, input, seed)

  let y: string
  if (title && title !== 'Owner') {
    y = `you're the ${lowerFirst(title)} at ${company}`
  } else if (isLargeBrand(ctx.company)) {
    y = `you're on the team at ${company}`
  } else {
    y = `you're running things at ${company}`
  }

  return `Saw ${y} and might need help with ${pain}.`
}

function shortPainClause(ctx: EmailContext, input: WizardInput, seed: string): string {
  const industry = inferLeadIndustryContext({
    companyName: ctx.company,
    title: ctx.title,
    idealCustomer: input.idealCustomer,
  })

  const pains: Record<string, string[]> = {
    dental: [
      'keeping new patient calls steady',
      'filling the schedule without more front desk chaos',
    ],
    restaurant: [
      'getting more reservations from people who find you online',
      'smoothing out slow nights on payroll',
    ],
    property: [
      'filling vacancies faster',
      'faster answers on maintenance and leasing',
    ],
    healthcare: [
      'fewer empty slots on the schedule',
      'keeping recall visits from going cold',
    ],
    professional_services: [
      'a steadier pipeline beyond referrals',
      'more qualified conversations, not just busy work',
    ],
    retail: [
      'steadier foot traffic without racing on price',
      'repeat buyers who actually come back',
    ],
    corporate_ops: [
      'clear ROI before signing new vendor deals',
      'too many vendors for the same floor',
    ],
    general: [
      'growth that does not depend on luck',
      'marketing that actually gets replies',
    ],
  }

  const list = pains[industry.id] ?? pains.general
  return list[seedChar(seed, list.length)]
}

function valueFirstBlock(agentId: AgentId, input: WizardInput): string {
  const help = plainWhatWeDo(input.business)
  const proof = plainProof(input.valueProp)
  const free = freeLeadHook(input)

  if (free) {
    const lines: Record<AgentId, string> = {
      warm: `I know your inbox is noisy. ${free} Then you decide if you want more.`,
      relatable: `I know you get pitched a lot. ${free}`,
      punchy: `Value first: ${free}`,
      formal: `To respect your time: ${free}`,
      curious: `Quick idea: ${free} Would that help?`,
      urgent: `${free} Reply if you want us to start.`,
    }
    return lines[agentId]
  }

  const ask = softOfferAsk(input)
  const lines: Record<AgentId, string> = {
    warm: `We ${help}. ${proof} ${ask}`,
    relatable: `We help with ${help}. ${proof} ${ask}`,
    punchy: `${help}. ${proof} ${ask}`,
    formal: `We ${help}. ${proof} ${ask}`,
    curious: `We ${help}. ${proof} ${ask}`,
    urgent: `${help}. ${proof} ${ask}`,
  }
  return lines[agentId]
}

function freeLeadHook(input: WizardInput): string | null {
  const blob = `${input.business} ${input.valueProp}`.toLowerCase()
  if (!/lead|patient|client|booking|customer|account/.test(blob)) return null

  const noun = blob.includes('patient')
    ? 'patient leads'
    : blob.includes('restaurant') || blob.includes('reservation')
      ? 'booking leads'
      : 'leads'

  return `Send your packages and we will line up your first 5 ${noun} on us. No call, no subscription.`
}

function softOfferAsk(input: WizardInput): string {
  return `If we could help you ${plainOutcome(input.business)}, worth a reply?`
}

function softClose(agentId: AgentId): string {
  const lines: Record<AgentId, string> = {
    warm: 'No rush.',
    relatable: 'No pressure either way.',
    punchy: 'Worth a reply?',
    formal: 'Thank you for reading.',
    curious: 'On your radar?',
    urgent: 'Reply this week if you want in.',
  }
  return lines[agentId]
}

function isLargeBrand(company: string): boolean {
  return /office depot|staples|walmart|target|amazon|homedepot|costco|fedex|ups store/i.test(
    company,
  )
}

function displayCompany(ctx: EmailContext): string {
  if (
    ctx.company &&
    ctx.company !== 'a local business' &&
    ctx.company !== 'a sample business' &&
    ctx.company.length > 3
  ) {
    return ctx.company
  }
  return 'your place'
}

function seedChar(seed: string, mod: number): number {
  let n = 0
  for (let i = 0; i < seed.length; i++) n = (n + seed.charCodeAt(i)) % mod
  return n
}

function plainWhatWeDo(business: string): string {
  let t = business.trim()
  t = t.replace(/^(i|we)\s+(help|build|run|make|do)\s+/i, '')
  t = t.replace(/^(i|we)\s+/i, '')
  t = t.replace(/\.$/, '')
  return shorten(lowerFirst(t), 72)
}

function plainProof(valueProp: string): string {
  return shorten(lowerFirst(valueProp.trim()), 65)
}

function plainOutcome(business: string): string {
  const t = business.toLowerCase()
  if (t.includes('lead')) return 'get a steadier stream of reliable leads'
  if (t.includes('patient')) return 'fill more new patient slots'
  if (t.includes('website') || t.includes('web')) return 'get more bookings from your site'
  return 'grow without living on marketplaces'
}

function lowerFirst(text: string): string {
  if (!text) return text
  return text.charAt(0).toLowerCase() + text.slice(1)
}

function subjectFor(agentId: AgentId, ctx: EmailContext): string {
  const company = displayCompany(ctx)
  const subjects: Record<AgentId, string[]> = {
    warm: [`Quick note, ${ctx.firstName}`, `Saw ${company}`, `${ctx.firstName}, quick hello`],
    relatable: [`${ctx.firstName}, quick thought`, `Saw your spot`, `Hey ${ctx.firstName}`],
    punchy: [`${ctx.firstName}, quick idea`, `For ${company}`, `Quick note`],
    formal: [`Note for ${ctx.firstName}`, `Hello ${ctx.firstName}`],
    curious: [`Question for ${ctx.firstName}`, `About ${company}`],
    urgent: [`${ctx.firstName}, quick note`, `For ${company}`],
  }
  const list = subjects[agentId]
  return list[seedChar(ctx.firstName + company, list.length)]
}

function greetingFor(agentId: AgentId, firstName: string): string {
  const greetings: Record<AgentId, string> = {
    warm: `Hey ${firstName},`,
    relatable: `Hey ${firstName},`,
    punchy: `Hey ${firstName},`,
    formal: `Hi ${firstName},`,
    curious: `Hey ${firstName},`,
    urgent: `Hey ${firstName},`,
  }
  return greetings[agentId]
}

function signOffFor(agentId: AgentId, senderName: string): string {
  const name = senderName.trim() || 'Your name'
  if (agentId === 'formal') return `Thank you,\n${name}`
  return name
}

function shorten(text: string, max = 100): string {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1).trim()}…`
}

function trimToWordLimit(body: string, maxWords: number): string {
  const words = body.split(/\s+/)
  if (words.length <= maxWords) return body
  return `${words.slice(0, maxWords).join(' ')}…`
}

function formatEmailDraft(email: { subject: string; body: string }): {
  subject: string
  body: string
} {
  return {
    subject: formatOutreachText(email.subject),
    body: formatOutreachText(trimToWordLimit(email.body, MAX_WORDS)),
  }
}

export function emailContextFromLead(lead: {
  firstName?: string
  name: string
  title: string
  companyName?: string
  company?: string
  place?: string
}): EmailContext {
  const first =
    lead.firstName?.trim() ||
    lead.name.split(' ')[0]?.trim() ||
    'there'
  return {
    firstName: first,
    title: lead.title.trim() || 'Owner',
    company: (lead.companyName ?? lead.company ?? '').trim() || 'a local business',
    place: lead.place?.trim() ?? '',
  }
}
