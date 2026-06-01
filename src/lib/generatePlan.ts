import type { AgentId, OutreachPlan, WizardInput } from '../types/plan'
import { formatEmail, formatOutreachText } from './outreachVoice'

/** Demo generator. Swap with /api/generate + OUTREACH_SYSTEM_PROMPT when OpenAI is wired up. */
export async function generatePlan(input: WizardInput): Promise<OutreachPlan> {
  await delay(2200)
  return buildMockPlan(input)
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildMockPlan(input: WizardInput): OutreachPlan {
  const { business, idealCustomer, whyTarget, valueProp, yourLocation, customerLocation, agentId } = input
  const icpExample = {
    name: 'Jordan Lee',
    title: 'Owner',
    companyType: formatOutreachText(companyHint(idealCustomer)),
    whyFit: [
      formatOutreachText(`Sounds like who you described: ${truncate(idealCustomer, 80)}`),
      formatOutreachText(`Why you picked them: ${truncate(whyTarget, 80)}`),
      formatOutreachText(`What you do best: ${truncate(valueProp, 80)}`),
    ],
  }

  const sampleEmail = formatEmail(emailForAgent(agentId, business, idealCustomer))
  const drip = [
    { dayLabel: 'Day 1', ...formatEmail(emailForAgent(agentId, business, idealCustomer)) },
    { dayLabel: 'Day 4', ...formatEmail(followUp(agentId, business, 2)) },
    { dayLabel: 'Day 8', ...formatEmail(followUp(agentId, business, 3)) },
  ]

  return {
    icpExample,
    sampleEmail,
    icpTraits: [
      formatOutreachText(truncate(idealCustomer, 100)),
      formatOutreachText('They can say yes or no to buying'),
      formatOutreachText('They have the problem you fix'),
      formatOutreachText('You can find them online'),
      formatOutreachText('The team is small so one email can reach the boss'),
    ],
    findLeadsTips: buildFindTips(customerLocation, yourLocation),
    drip,
  }
}

function buildFindTips(customerLocation: string, yourLocation: string): string[] {
  const area = customerLocation.trim() || yourLocation.trim() || 'your area'
  return [
    formatOutreachText(`Google the job title and ${area}. Open company websites.`),
    formatOutreachText(`Look at business lists and directories in ${area}.`),
    formatOutreachText('See who your competitors show as customers.'),
    formatOutreachText('Search LinkedIn for the job title. Find email on their website.'),
    formatOutreachText('Check the Contact or About page. Many list the owner.'),
  ]
}

function companyHint(idealCustomer: string): string {
  const lower = idealCustomer.toLowerCase()
  if (lower.includes('dental') || lower.includes('dentist')) return 'A local dentist office'
  if (lower.includes('restaurant') || lower.includes('cafe')) return 'A local restaurant'
  if (lower.includes('saas') || lower.includes('software')) return 'A software company'
  return 'A small business like the ones you described'
}

function truncate(s: string, n: number): string {
  const t = s.trim()
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`
}

function emailForAgent(
  agentId: AgentId,
  business: string,
  idealCustomer: string,
): { subject: string; body: string } {
  const b = business.trim()
  const icp = idealCustomer.trim()

  const templates: Record<AgentId, { subject: string; body: string }> = {
    warm: {
      subject: 'A quick note for you',
      body: `Hi Jordan,

I help people like you with ${b}. You seem like the kind of ${icp} I work with.

Can we talk for 10 minutes this week? No rush. I can share one tip even if now is not a good time.

Thanks,
[Your name]`,
    },
    punchy: {
      subject: 'Quick question',
      body: `Hi Jordan,

I do ${b}. I work with ${icp}.

Can you talk Thursday or Friday?

[Your name]`,
    },
    formal: {
      subject: 'Hello from my company',
      body: `Hi Jordan,

My company does ${b}. You look like the ${icp} we help.

Can we set up a short call when you have time?

Thanks,
[Your name]`,
    },
    curious: {
      subject: 'Can I ask you something',
      body: `Hi Jordan,

How do you handle your day to day as ${icp}?

I work on ${b}. I wondered if that is on your mind right now.

I can tell you what works for others if you want.

[Your name]`,
    },
    urgent: {
      subject: 'This week only',
      body: `Hi Jordan,

I can help ${icp} with ${b} this week.

If you are the right person at your company, reply yes. I will send times.

[Your name]`,
    },
  }

  return templates[agentId]
}

function followUp(
  agentId: AgentId,
  business: string,
  n: 2 | 3,
): { subject: string; body: string } {
  if (n === 2) {
    const subjects: Record<AgentId, string> = {
      warm: 'Just checking in',
      punchy: 'Following up',
      formal: 'Following up on my note',
      curious: 'About my question',
      urgent: 'Still this week',
    }
    return {
      subject: subjects[agentId],
      body: `Hi Jordan,

I wrote about ${business}. Still ok to chat?

[Your name]`,
    }
  }

  return {
    subject: 'Last note from me',
    body: `Hi Jordan,

I will stop emailing about ${business}. If you need help later, just reply.

Have a good week,
[Your name]`,
  }
}
