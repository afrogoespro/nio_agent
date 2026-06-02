import type { AgentId } from '../types/plan'

export interface DemoExample {
  id: string
  label: string
  business: string
  valueProp: string
  yourLocation: string
  idealCustomer: string
  whyTarget: string
  customerLocation: string
  agentId: AgentId
}

export const DEMO_EXAMPLES: DemoExample[] = [
  {
    id: 'dental',
    label: 'Dental marketing',
    business: 'I help dental offices get more new patient calls from Google and their website.',
    valueProp: 'We are local, fast to start, and never lock you into long contracts.',
    yourLocation: 'Austin, Texas',
    idealCustomer: 'Dental office owner',
    whyTarget: 'They need a steady flow of new patients and are already investing in marketing.',
    customerLocation: 'Austin, Texas',
    agentId: 'warm',
  },
  {
    id: 'dog-walking',
    label: 'Dog walking',
    business: 'I run a dog walking and pet care service for busy professionals.',
    valueProp: 'Same walker every visit, photo updates after each walk, and easy online booking.',
    yourLocation: 'Austin, Texas',
    idealCustomer: 'Office manager',
    whyTarget: 'They feel guilty leaving their dog alone and want someone reliable they can trust.',
    customerLocation: 'Austin, Texas',
    agentId: 'punchy',
  },
  {
    id: 'web-design',
    label: 'Web design',
    business: 'I build simple, modern websites for local restaurants and cafes.',
    valueProp: 'Live in two weeks, mobile-friendly menus, and no jargon — just a site that brings in reservations.',
    yourLocation: 'Los Angeles, California',
    idealCustomer: 'Restaurant owner',
    whyTarget: 'They lose walk-ins and reservations when people cannot find hours, menus, or booking online.',
    customerLocation: 'Los Angeles, California',
    agentId: 'curious',
  },
]
