import type { AgentId, WizardInput } from '../types/plan.js'
import { formatOutreachText } from './outreachVoice.js'

export interface EmailContext {
  firstName: string
  title: string
  company: string
  place: string
}

const CTA = 'Open to a quick chat this week?'
const MAX_WORDS = 75

/** User facing spec for future OpenAI wiring. */
export const COLD_EMAIL_BRIEF = {
  goal: 'Start a conversation or get a reply',
  framework: 'Short PAS style',
  maxWords: MAX_WORDS,
  cta: CTA,
  readingLevel: '5th grade',
  rules: [
    'Keep the first outreach email very short (about 4 sentences).',
    'Plain talk. No sales fluff.',
    'Mention their world in line one. Offer + CTA in the last lines.',
  ],
} as const

export function writeColdOpeningEmail(
  agentId: AgentId,
  input: WizardInput,
  ctx: EmailContext,
): { subject: string; body: string } {
  return formatEmailDraft(buildShortEmail(agentId, input, ctx))
}

function buildShortEmail(
  agentId: AgentId,
  input: WizardInput,
  ctx: EmailContext,
): { subject: string; body: string } {
  const industry = guessIndustry(input)
  const pain = plainPain(input.whyTarget)
  const offer = plainOffer(input.valueProp)
  const peers = peersLikeYou(industry)

  const core = [
    greetingFor(agentId, ctx.firstName),
    '',
    hookLine(agentId, ctx, industry, pain, peers),
    '',
    offerLine(agentId, input, offer),
    '',
    ctaLine(agentId),
    '',
    signOffFor(agentId),
  ].join('\n')

  return { subject: subjectFor(agentId, ctx, input), body: core }
}

function hookLine(
  agentId: AgentId,
  ctx: EmailContext,
  _industry: string,
  pain: string,
  peers: string,
): string {
  const company = displayCompany(ctx)

  if (agentId === 'curious') {
    return `Quick question about ${company} — I keep seeing ${peers} struggle with ${pain}. How are you handling that?`
  }
  if (agentId === 'punchy') {
    return `I notice ${peers} often lose out when ${pain}.`
  }
  if (agentId === 'urgent') {
    return `I am reaching out to a few ${peers} near you. Many are dealing with ${pain}.`
  }
  if (agentId === 'formal') {
    return `I work with ${peers}. A common issue is ${pain}.`
  }
  if (agentId === 'relatable') {
    return `I have been talking with a few ${peers}. A lot of them mention ${pain}.`
  }
  return `I notice a lot of ${peers} like ${company} are dealing with ${pain}.`
}

function offerLine(agentId: AgentId, input: WizardInput, offer: string): string {
  const whatWeDo = plainWhatWeDo(input.business)

  const lines: Record<AgentId, string> = {
    warm: `We built something to help: ${whatWeDo}. ${offer}.`,
    relatable: `We help with ${whatWeDo} — ${offer}.`,
    punchy: `We built ${whatWeDo} — ${offer}.`,
    formal: `We offer ${whatWeDo}. ${offer}.`,
    curious: `We built something to help: ${whatWeDo}. ${offer}.`,
    urgent: `We built something to help: ${whatWeDo}. ${offer}.`,
  }

  return lines[agentId]
}

function ctaLine(agentId: AgentId): string {
  const lines: Record<AgentId, string> = {
    warm: CTA,
    relatable: 'Would a quick chat this week work?',
    punchy: 'Worth a quick chat?',
    formal: CTA,
    curious: CTA,
    urgent: 'Reply if you want to talk this week.',
  }

  return lines[agentId]
}

function displayCompany(ctx: EmailContext): string {
  if (
    ctx.company &&
    ctx.company !== 'a local business' &&
    ctx.company !== 'a sample business' &&
    !ctx.company.toLowerCase().includes('restaurant') &&
    ctx.company.length > 3
  ) {
    return ctx.company
  }
  return 'your place'
}

function peersLikeYou(industry: string): string {
  if (industry === 'restaurants') return 'restaurants like yours'
  if (industry === 'dental') return 'dental offices like yours'
  if (industry === 'pet care') return 'teams like yours'
  return 'businesses like yours'
}

function plainPain(whyTarget: string): string {
  const t = whyTarget.trim().replace(/^(because|since)\s+/i, '')
  return shorten(lowerFirst(t), 90)
}

function plainOffer(valueProp: string): string {
  return shorten(lowerFirst(valueProp.trim()), 70)
}

function plainWhatWeDo(business: string): string {
  let t = business.trim()
  t = t.replace(/^(i|we)\s+(help|build|run|make|do)\s+/i, '')
  t = t.replace(/^(i|we)\s+/i, '')
  t = t.replace(/\.$/, '')
  return shorten(lowerFirst(t), 60)
}

function lowerFirst(text: string): string {
  if (!text) return text
  return text.charAt(0).toLowerCase() + text.slice(1)
}

function subjectFor(agentId: AgentId, ctx: EmailContext, input: WizardInput): string {
  const company =
    ctx.company && !ctx.company.startsWith('a ')
      ? ctx.company.split(' ').slice(0, 3).join(' ')
      : guessIndustryLabel(input)

  const subjects: Record<AgentId, string> = {
    warm: `Quick note for ${ctx.firstName}`,
    relatable: `Quick thought, ${ctx.firstName}`,
    punchy: `${ctx.firstName}, quick idea`,
    formal: `Hello ${ctx.firstName}`,
    curious: `Question for ${ctx.firstName}`,
    urgent: `${ctx.firstName}, quick note`,
  }

  void company
  return subjects[agentId]
}

function guessIndustryLabel(input: WizardInput): string {
  const industry = guessIndustry(input)
  if (industry === 'restaurants') return 'your restaurant'
  if (industry === 'dental') return 'your office'
  return 'your business'
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

function signOffFor(agentId: AgentId): string {
  const signOffs: Record<AgentId, string> = {
    warm: '[Your name]',
    relatable: '[Your name]',
    punchy: '[Your name]',
    formal: 'Thank you,\n[Your name]',
    curious: '[Your name]',
    urgent: '[Your name]',
  }

  return signOffs[agentId]
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
