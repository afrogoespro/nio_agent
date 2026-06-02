import type { AgentId, WizardInput } from '../types/plan.js'
import { formatOutreachText } from './outreachVoice.js'

export interface EmailContext {
  firstName: string
  title: string
  company: string
  place: string
}

const CTA = 'Would you be open to a quick chat this week?'
const MAX_WORDS = 140

/** User facing spec for future OpenAI wiring. */
export const COLD_EMAIL_BRIEF = {
  goal: 'Start a conversation or get a reply',
  framework: 'PAS or AIDA',
  maxWords: MAX_WORDS,
  cta: CTA,
  readingLevel: '5th grade',
  rules: [
    'Clear and conversational. No sales fluff or exaggerated claims.',
    'First line mentions something relevant about the recipient business or role.',
    'Personalize naturally. Skip generic compliments.',
    'Simple CTA. Avoid robotic phrasing and overly formal greetings.',
  ],
} as const

export function writeColdOpeningEmail(
  agentId: AgentId,
  input: WizardInput,
  ctx: EmailContext,
): { subject: string; body: string } {
  const framework = pickFramework(agentId)
  const draft =
    framework === 'PAS'
      ? buildPasEmail(agentId, input, ctx)
      : buildAidaEmail(agentId, input, ctx)

  return formatEmailDraft(draft)
}

function pickFramework(agentId: AgentId): 'PAS' | 'AIDA' {
  if (agentId === 'punchy' || agentId === 'curious') return 'AIDA'
  return 'PAS'
}

function buildPasEmail(
  agentId: AgentId,
  input: WizardInput,
  ctx: EmailContext,
): { subject: string; body: string } {
  const service = shorten(input.business)
  const edge = shorten(input.valueProp)
  const pain = shorten(input.whyTarget)
  const industry = guessIndustry(input)
  const opener = businessOpener(ctx, input)
  const greeting = greetingFor(agentId, ctx.firstName)
  const signOff = signOffFor(agentId)

  const problem =
    agentId === 'formal'
      ? `Many ${industry} leaders tell us ${pain.toLowerCase()}`
      : `A lot of ${titleLabel(ctx.title)}s deal with this: ${pain.toLowerCase()}`

  const solution =
    agentId === 'punchy'
      ? `${service}. ${edge}.`
      : `We help with ${service.toLowerCase()}. ${edge}`

  const body = [
    greeting,
    '',
    opener,
    '',
    problem,
    '',
    solution,
    '',
    CTA,
    '',
    signOff,
  ].join('\n')

  return { subject: subjectFor(agentId, ctx, input), body }
}

function buildAidaEmail(
  agentId: AgentId,
  input: WizardInput,
  ctx: EmailContext,
): { subject: string; body: string } {
  const service = shorten(input.business)
  const edge = shorten(input.valueProp)
  const pain = shorten(input.whyTarget)
  const greeting = greetingFor(agentId, ctx.firstName)
  const signOff = signOffFor(agentId)
  const opener = businessOpener(ctx, input)

  if (agentId === 'curious') {
    const body = [
      greeting,
      '',
      opener,
      '',
      `We work on ${service.toLowerCase()}. I am curious how you handle ${pain.toLowerCase()} today.`,
      '',
      `Happy to share what has worked for other ${guessIndustry(input)} if it helps.`,
      '',
      CTA,
      '',
      signOff,
    ].join('\n')
    return { subject: subjectFor(agentId, ctx, input), body }
  }

  // punchy AIDA
  const body = [
    greeting,
    '',
    opener,
    '',
    `${service}. ${edge}`,
    '',
    CTA,
    '',
    signOff,
  ].join('\n')

  return { subject: subjectFor(agentId, ctx, input), body }
}

function businessOpener(ctx: EmailContext, input: WizardInput): string {
  const company = ctx.company && ctx.company !== 'a local business' && ctx.company !== 'a sample business'
    ? ctx.company
    : companyHint(input.idealCustomer)
  const place = ctx.place ? ` in ${ctx.place}` : ''
  const title = ctx.title || 'leader'

  const industry = guessIndustry(input)

  if (industry === 'dental') {
    return `I saw you are the ${title} at ${company}${place}. Growing a dental office takes steady new patient flow.`
  }
  if (industry === 'restaurants') {
    return `I noticed ${company}${place} and how much online presence matters for reservations and walk ins.`
  }
  if (industry === 'pet care') {
    return `I saw you work as ${title} at ${company}${place}. Busy teams often need reliable help with daily routines.`
  }

  return `I came across ${company}${place} and your work as ${title}. It looks like ${shorten(input.whyTarget, 70).toLowerCase()}.`
}

function subjectFor(agentId: AgentId, ctx: EmailContext, input: WizardInput): string {
  const company =
    ctx.company && !ctx.company.startsWith('a ')
      ? ctx.company.split(' ').slice(0, 3).join(' ')
      : guessIndustry(input)

  const subjects: Record<AgentId, string> = {
    warm: `Quick idea for ${company}`,
    punchy: `${ctx.firstName}, worth a quick look?`,
    formal: `Note for ${ctx.firstName} at ${company}`,
    curious: `Question about ${company}`,
    urgent: `${ctx.firstName}, quick note about ${company}`,
  }

  return subjects[agentId]
}

function greetingFor(agentId: AgentId, firstName: string): string {
  if (agentId === 'formal') return `Hi ${firstName},`
  return `Hey ${firstName},`
}

function signOffFor(agentId: AgentId): string {
  if (agentId === 'formal') return 'Thank you,\n[Your name]'
  if (agentId === 'warm') return 'Thanks,\n[Your name]'
  return '[Your name]'
}

function guessIndustry(input: WizardInput): string {
  const text = `${input.business} ${input.idealCustomer}`.toLowerCase()
  if (text.includes('dental') || text.includes('dentist')) return 'dental'
  if (text.includes('restaurant') || text.includes('cafe') || text.includes('food'))
    return 'restaurants'
  if (text.includes('dog') || text.includes('pet')) return 'pet care'
  if (text.includes('web') || text.includes('website')) return 'local businesses'
  return 'local businesses'
}

function companyHint(idealCustomer: string): string {
  const lower = idealCustomer.toLowerCase()
  if (lower.includes('dental') || lower.includes('dentist')) return 'a local dental office'
  if (lower.includes('restaurant') || lower.includes('cafe')) return 'a local restaurant'
  return 'a local business like yours'
}

function titleLabel(title: string): string {
  const t = title.trim().toLowerCase()
  if (t.includes('owner')) return 'owner'
  if (t.includes('manager')) return 'manager'
  if (t.includes('dentist')) return 'dentist'
  return 'leader'
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
