import type { AgentId, IcpExample, OutreachPlan, WizardInput } from '../types/plan'
import { formatEmail, formatOutreachText } from './outreachVoice'

interface ApolloPerson {
  first_name?: string
  last_name?: string
  title?: string
  city?: string
  state?: string
  country?: string
  organization?: { name?: string }
}

interface LeadContext {
  firstName: string
  fullName: string
  title: string
  company: string
  place: string
}

export async function buildOutreachPlan(
  input: WizardInput,
  apolloApiKey: string,
): Promise<OutreachPlan> {
  const person = apolloApiKey
    ? await fetchOnePerson(input, apolloApiKey)
    : null

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
  }
}

async function fetchOnePerson(
  input: WizardInput,
  apiKey: string,
): Promise<ApolloPerson | null> {
  try {
    const response = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        q_keywords: input.idealCustomer.trim(),
        person_locations: input.customerLocation.trim()
          ? [input.customerLocation.trim()]
          : undefined,
        per_page: 1,
        page: 1,
      }),
    })

    const data = (await response.json().catch(() => ({}))) as {
      people?: ApolloPerson[]
    }

    if (!response.ok || !data.people?.length) return null
    return data.people[0]
  } catch {
    return null
  }
}

function mapApolloToLead(person: ApolloPerson, input: WizardInput): IcpExample {
  const first = (person.first_name ?? '').trim()
  const last = (person.last_name ?? '').trim()
  const fullName = [first, last].filter(Boolean).join(' ') || 'This contact'
  const company = (person.organization?.name ?? '').trim() || 'a local business'
  const title = (person.title ?? '').trim() || 'Owner'
  const place = [person.city, person.state].filter(Boolean).join(', ')
  const area = input.customerLocation.trim() || input.yourLocation.trim() || 'your area'

  return {
    source: 'apollo',
    name: fullName,
    firstName: first || fullName.split(' ')[0] || 'there',
    title,
    companyName: company,
    companyType: company,
    foundVia: formatOutreachText(`Apollo search in ${area}`),
    whyFit: [
      formatOutreachText(`Works at ${company} as ${title}`),
      place
        ? formatOutreachText(`Based in ${place}`)
        : formatOutreachText(`Matches your target area: ${area}`),
      formatOutreachText(`Why they may care: ${truncate(input.whyTarget, 90)}`),
    ],
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
    foundVia: formatOutreachText('Example only. Apollo did not return a match.'),
    whyFit: [
      formatOutreachText(`Sounds like: ${truncate(input.idealCustomer, 80)}`),
      formatOutreachText(`Your why: ${truncate(input.whyTarget, 80)}`),
      formatOutreachText(`Your edge: ${truncate(input.valueProp, 80)}`),
    ],
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
  const b = input.business.trim()
  const edge = input.valueProp.trim()
  const atCompany = ctx.company ? ` at ${ctx.company}` : ''
  const inPlace = ctx.place ? ` in ${ctx.place}` : ''

  const intros: Record<AgentId, { subject: string; body: string }> = {
    warm: {
      subject: `Hey ${ctx.firstName}, quick hello`,
      body: `Hey ${ctx.firstName},

I wanted to reach out person to person.

${b}

I found you${atCompany}${inPlace}. ${edge}

I would love to chat more about this. Are you open to a short call this week?

Thanks,
[Your name]`,
    },
    punchy: {
      subject: `Hey ${ctx.firstName}`,
      body: `Hey ${ctx.firstName},

${b}

I saw you${atCompany}${inPlace}.

Can we talk for a few minutes this week?

[Your name]`,
    },
    formal: {
      subject: `Hello ${ctx.firstName}`,
      body: `Hi ${ctx.firstName},

My name is [Your name].

${b}

I came across you${atCompany}${inPlace}. ${edge}

I would appreciate a short call if you have time.

Thank you,
[Your name]`,
    },
    curious: {
      subject: `Question for you ${ctx.firstName}`,
      body: `Hey ${ctx.firstName},

I had a quick question. We help with ${b}.

I noticed you${atCompany}${inPlace}. How are you handling that today?

Happy to share what has worked for others if helpful.

[Your name]`,
    },
    urgent: {
      subject: `${ctx.firstName}, quick note`,
      body: `Hey ${ctx.firstName},

${b}

I am reaching out to a few people${atCompany ? ` like ${ctx.company}` : ''}${inPlace}.

Reply if you want to talk this week.

[Your name]`,
    },
  }

  return intros[agentId]
}

function writeFollowUp(
  _agentId: AgentId,
  input: WizardInput,
  ctx: LeadContext,
  n: 2 | 3,
): { subject: string; body: string } {
  if (n === 2) {
    return {
      subject: `Following up ${ctx.firstName}`,
      body: `Hey ${ctx.firstName},

Just bumping my last note about ${input.business.trim()}.

Still open to a quick chat?

[Your name]`,
    }
  }

  return {
    subject: `Last note ${ctx.firstName}`,
    body: `Hey ${ctx.firstName},

I will close the loop here. If you ever want to talk about ${input.business.trim()}, just reply.

Thanks,
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
    formatOutreachText(`Search Apollo in ${area} for more people like this.`),
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
