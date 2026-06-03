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

/** User facing spec for future OpenAI wiring. */
export const COLD_EMAIL_BRIEF = {
  goal: 'Sound like a real person reaching out on their own time, not a campaign',
  framework: 'Cold read their world, add value, soft ask',
  maxWords: MAX_WORDS,
  readingLevel: '5th grade',
  rules: [
    'Open with something specific you noticed about them (role, place, business).',
    'Name a real pressure for their job or industry. Do not repeat the sender wizard text.',
    'Offer value before a ask. Mention inbox noise if offering something free.',
    'No sales jargon. No fake urgency. Short paragraphs.',
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
  const opener = coldReadOpener(ctx, seed)
  const read = coldReadObservation(ctx, input, seed)
  const pain = recipientPressureLine(ctx, input, seed)
  const compliment = softCompliment(ctx, seed)
  const value = valueFirstBlock(agentId, input)
  const close = softClose(agentId)

  const body = [
    greetingFor(agentId, ctx.firstName),
    '',
    opener,
    '',
    [read, pain, compliment].filter(Boolean).join(' '),
    '',
    value,
    '',
    close,
    '',
    signOffFor(agentId),
  ].join('\n')

  return { subject: subjectFor(agentId, ctx), body }
}

function coldReadOpener(ctx: EmailContext, seed: string): string {
  const slot = seedChar(seed, 5)
  const company = displayCompany(ctx)
  const place = ctx.place.trim()

  if (place && !isLargeBrand(ctx.company) && slot === 0) {
    return `I was near ${place} recently and ${company} caught my eye.`
  }
  if (slot === 1 && ctx.title && ctx.title !== 'Owner') {
    return `I saw you are the ${ctx.title} at ${company}.`
  }
  if (slot === 2) {
    return `Hey, I was looking at ${company} online and had to reach out.`
  }
  if (slot === 3) {
    return `Someone in your space mentioned ${company}, so I poked around.`
  }
  return `I came across ${company} and wanted to say hi on my own time, not as a blast.`
}

function coldReadObservation(
  ctx: EmailContext,
  input: WizardInput,
  seed: string,
): string {
  const company = displayCompany(ctx)
  const slot = seedChar(seed, 7)

  if (isLargeBrand(ctx.company)) {
    return `Teams like yours at ${company} usually juggle a lot of vendors and approvals.`
  }

  if (slot % 3 === 0 && ctx.place) {
    return `${company} looks like a solid spot from the outside. I will have to stop in and say hi sometime.`
  }

  if (ctx.title && ctx.title !== 'Owner') {
    return `From the outside it looks like you run a tight ship as ${ctx.title}.`
  }

  const label = inferLeadIndustryContext({
    companyName: ctx.company,
    title: ctx.title,
    idealCustomer: input.idealCustomer,
  }).label

  return `You fit the kind of ${label} we have been helping lately.`
}

function recipientPressureLine(
  ctx: EmailContext,
  input: WizardInput,
  seed: string,
): string {
  const industry = inferLeadIndustryContext({
    companyName: ctx.company,
    title: ctx.title,
    idealCustomer: input.idealCustomer,
  })

  const pressures: Record<string, string[]> = {
    dental: [
      'feels like new patient calls are harder to predict than they should be',
      'is juggling front desk work and still trying to fill the schedule',
    ],
    restaurant: [
      'might be losing covers when people cannot book or see the menu fast online',
      'has slow nights that make staffing and food cost a guessing game',
    ],
    property: [
      'has vacancy or turnover eating into margin',
      'needs faster answers on maintenance and leasing questions',
    ],
    healthcare: [
      'has schedule gaps when recall outreach is not consistent',
      'is fielding intake questions with a lean front office team',
    ],
    professional_services: [
      'does good work but pipeline still depends on referrals and hustle',
      'gets compared online before anyone takes a meeting',
    ],
    retail: [
      'is fighting traffic swings and margin pressure on core SKUs',
      'only hears from repeat buyers during promos',
    ],
    corporate_ops: [
      'is stuck coordinating too many vendors for the same floor',
      'needs clear ROI before signing anything new',
    ],
    general: [
      'is passionate but growth still feels choppy',
      'is tired of marketing that does not turn into real replies',
    ],
  }

  const list = pressures[industry.id] ?? pressures.general
  const line = list[seedChar(seed, list.length)]
  return `You ${line}.`
}

function softCompliment(ctx: EmailContext, seed: string): string {
  if (seedChar(seed, 4) !== 0) return ''
  const company = displayCompany(ctx)
  if (isLargeBrand(ctx.company)) return 'Looks like a serious operation.'
  return `Overall ${company} comes across well.`
}

function valueFirstBlock(agentId: AgentId, input: WizardInput): string {
  const help = plainWhatWeDo(input.business)
  const proof = plainProof(input.valueProp)
  const free = freeLeadHook(input)

  const pitchGuard =
    'I am sure you get pitched all day, so I would rather add value first.'

  if (free) {
    const lines: Record<AgentId, string> = {
      warm: `${pitchGuard} ${free} After that you can decide if you want to keep going.`,
      relatable: `${pitchGuard} ${free} No pressure either way.`,
      punchy: `${pitchGuard} ${free}`,
      formal: `${pitchGuard} ${free} You may review and decide at your convenience.`,
      curious: `${pitchGuard} ${free} Would that be useful?`,
      urgent: `${pitchGuard} ${free} Reply if you want us to start.`,
    }
    return lines[agentId]
  }

  const ask = softOfferAsk(input)
  const lines: Record<AgentId, string> = {
    warm: `${pitchGuard} ${help}. ${proof} ${ask}`,
    relatable: `${pitchGuard} We help with ${help}. ${proof} ${ask}`,
    punchy: `${pitchGuard} ${help}. ${proof} ${ask}`,
    formal: `${pitchGuard} We provide ${help}. ${proof} ${ask}`,
    curious: `${pitchGuard} We built ${help}. ${proof} ${ask}`,
    urgent: `${pitchGuard} ${help}. ${proof} ${ask}`,
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

  return `Send your packages and we will get your first 5 ${noun} lined up on us. No call, no subscription.`
}

function softOfferAsk(input: WizardInput): string {
  const outcome = plainOutcome(input.business)
  return `If we could help you ${outcome}, would that be worth a quick reply?`
}

function softClose(agentId: AgentId): string {
  const lines: Record<AgentId, string> = {
    warm: 'No rush. Just reply if this is interesting.',
    relatable: 'Either way, hope your week is going well.',
    punchy: 'Worth a reply?',
    formal: 'Thank you for your time.',
    curious: 'Curious if this is on your radar.',
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
