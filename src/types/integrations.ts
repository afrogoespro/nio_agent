export type IntegrationId = 'email' | 'apollo'

export interface EmailConnection {
  connected: boolean
  address: string
  fromName: string
}

export interface ApolloConnection {
  connected: boolean
  /** User key stored in session for beta. Prefer server APOLLO_API_KEY in production. */
  hasKey: boolean
}

export interface IntegrationState {
  email: EmailConnection
  apollo: ApolloConnection
  dripWarmupEnabled: boolean
}

export const DEFAULT_INTEGRATIONS: IntegrationState = {
  email: { connected: false, address: '', fromName: '' },
  apollo: { connected: false, hasKey: false },
  dripWarmupEnabled: false,
}

export type SocialChannelId = 'linkedin' | 'x' | 'instagram'

export interface SocialChannel {
  id: SocialChannelId
  name: string
  status: 'soon' | 'live'
}

export const SOCIAL_CHANNELS: SocialChannel[] = [
  { id: 'linkedin', name: 'LinkedIn', status: 'soon' },
  { id: 'x', name: 'X', status: 'soon' },
  { id: 'instagram', name: 'Instagram', status: 'soon' },
]
