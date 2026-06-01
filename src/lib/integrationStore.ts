import {
  DEFAULT_INTEGRATIONS,
  type IntegrationState,
} from '../types/integrations'

const KEY = 'alwayson-integrations'
const APOLLO_KEY = 'alwayson-apollo-key'

export function loadIntegrations(): IntegrationState {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_INTEGRATIONS }
    return { ...DEFAULT_INTEGRATIONS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_INTEGRATIONS }
  }
}

export function saveIntegrations(state: IntegrationState): void {
  sessionStorage.setItem(KEY, JSON.stringify(state))
}

export function setApolloApiKey(key: string): void {
  if (key.trim()) sessionStorage.setItem(APOLLO_KEY, key.trim())
  else sessionStorage.removeItem(APOLLO_KEY)
}

export function getApolloApiKey(): string {
  return sessionStorage.getItem(APOLLO_KEY) ?? ''
}
