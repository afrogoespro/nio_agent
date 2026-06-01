export type AgentId = 'warm' | 'punchy' | 'formal' | 'curious' | 'urgent'

export interface IcpExample {
  name: string
  title: string
  companyType: string
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
}

export interface WizardInput {
  business: string
  /** What makes you different / why people buy from you */
  valueProp: string
  yourLocation: string
  idealCustomer: string
  whyTarget: string
  customerLocation: string
  agentId: AgentId
}
