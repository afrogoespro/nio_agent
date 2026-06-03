export type UserTier = 'trial' | 'premium'

const TIER_KEY = 'neo-user-tier'

export function getUserTier(): UserTier {
  if (typeof window !== 'undefined') {
    const q = new URLSearchParams(window.location.search).get('tier')
    if (q === 'premium') return 'premium'
  }
  const stored = sessionStorage.getItem(TIER_KEY)
  return stored === 'premium' ? 'premium' : 'trial'
}

export function setUserTier(tier: UserTier): void {
  sessionStorage.setItem(TIER_KEY, tier)
}
