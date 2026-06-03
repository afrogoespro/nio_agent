import type { AgentId } from '../types/plan'

export interface Agent {
  id: AgentId
  /** First name shown on hero circle */
  displayName: string
  name: string
  tagline: string
  sampleSubject: string
  image: string
}

export const AGENTS: Agent[] = [
  {
    id: 'warm',
    displayName: 'Sofia',
    name: 'Warm & helpful',
    tagline: 'Your rep sounds like a friend who wants to help',
    sampleSubject: 'Quick idea for your team',
    image: '/agents/agent-warm.png',
  },
  {
    id: 'relatable',
    displayName: 'Maya',
    name: 'Relatable & real',
    tagline: 'Your rep sounds natural, like a real person checking in',
    sampleSubject: 'Quick thought for you',
    image: '/agents/agent-relatable.png',
  },
  {
    id: 'punchy',
    displayName: 'Marcus',
    name: 'Short & punchy',
    tagline: 'Your rep keeps it short and direct',
    sampleSubject: 'Worth 2 minutes?',
    image: '/agents/agent-punchy.png',
  },
  {
    id: 'formal',
    displayName: 'David',
    name: 'Professional & formal',
    tagline: 'Your rep stays polished and businesslike',
    sampleSubject: 'Hello from my company',
    image: '/agents/agent-formal.png',
  },
  {
    id: 'curious',
    displayName: 'Alex',
    name: 'Curious question asker',
    tagline: 'Your rep leads with curiosity, not a pitch',
    sampleSubject: 'Quick question about your process',
    image: '/agents/agent-curious.png',
  },
  {
    id: 'urgent',
    displayName: 'Jordan',
    name: 'Urgent & direct',
    tagline: 'Your rep is clear about the next step',
    sampleSubject: 'Opening a few slots this week',
    image: '/agents/agent-urgent.png',
  },
]

export function getAgent(id: AgentId): Agent | undefined {
  return AGENTS.find((a) => a.id === id)
}
