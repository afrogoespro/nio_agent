export type AgentId =
  | 'warm'
  | 'relatable'
  | 'punchy'
  | 'formal'
  | 'curious'
  | 'urgent'

export interface IcpExample {
  source: 'apollo' | 'example'
  name: string
  firstName: string
  title: string
  companyName: string
  companyType: string
  foundVia: string
  whyFit: string[]
}

export interface EmailMessage {
  subject: string
  body: string
}

export interface DripEmail extends EmailMessage {
  dayLabel: string
}

export interface OutreachPlan {
  icpExample: IcpExample
  sampleEmail: EmailMessage
  icpTraits: string[]
  findLeadsTips: string[]
  drip: DripEmail[]
  /** Why example lead was used instead of Apollo (null if Apollo worked) */
  apolloNote?: string | null
}

export interface WizardInput {
  business: string
  /** What makes you different / why people buy from you */
  valueProp: string
  yourLocation: string
  /** Who signs the emails */
  senderName: string
  idealCustomer: string
  whyTarget: string
  customerLocation: string
  agentId: AgentId
}
