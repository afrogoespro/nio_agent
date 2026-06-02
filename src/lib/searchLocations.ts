/** Common city typos → Apollo-friendly spelling. */
const CITY_TYPOS: Record<string, string> = {
  tuscon: 'Tucson',
  pheonix: 'Phoenix',
  philidelphia: 'Philadelphia',
  pittsburg: 'Pittsburgh',
}

/** US state names — bare state searches rarely work in Apollo. Prefer city level. */
const US_STATES = new Set([
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
  'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
  'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
  'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada',
  'new hampshire', 'new jersey', 'new mexico', 'new york', 'north carolina',
  'north dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'rhode island',
  'south carolina', 'south dakota', 'tennessee', 'texas', 'utah', 'vermont',
  'virginia', 'washington', 'west virginia', 'wisconsin', 'wyoming',
])

/** Nationwide / vague areas — Apollo needs a city or metro. */
export function isBroadLocation(location: string): boolean {
  const lower = location.trim().toLowerCase()
  if (!lower) return true
  if (isStateOnly(lower)) return true
  if (/^anywhere\b/.test(lower)) return true
  if (/\b(nationwide|countrywide|whole country|entire (us|country)|all over)\b/.test(lower)) {
    return true
  }
  if (/^(the\s+)?(us|usa|u\.s\.|united states)\b/.test(lower)) return true
  if (/\bany\s+(state|city|where)\b/.test(lower)) return true
  return false
}

export function isStateOnly(location: string): boolean {
  const trimmed = location.trim().toLowerCase()
  if (!trimmed) return false
  if (US_STATES.has(trimmed)) return true
  // "TX", "CA" etc.
  if (/^[a-z]{2}$/.test(trimmed)) return true
  return false
}

/** Turn "Austin, Texas" into Apollo friendly variants. */
export function expandLocation(location: string): string[] {
  const loc = location.trim()
  if (!loc) return []

  const variants = new Set<string>([loc])

  if (loc.includes('Texas')) {
    variants.add(loc.replace('Texas', 'TX'))
  }
  if (loc.includes(', TX')) {
    variants.add(loc.replace(', TX', ', Texas'))
  }
  if (loc.includes('California')) {
    variants.add(loc.replace('California', 'CA'))
  }
  if (loc.includes(', CA')) {
    variants.add(loc.replace(', CA', ', California'))
  }
  if (loc.includes('Arizona')) {
    variants.add(loc.replace('Arizona', 'AZ'))
  }
  if (loc.includes(', AZ')) {
    variants.add(loc.replace(', AZ', ', Arizona'))
  }

  const city = loc.split(',')[0]?.trim()
  if (city && city.length > 1 && city !== loc) {
    variants.add(city)
  }

  return [...variants]
}

export function normalizeYourLocation(location: string): string {
  const trimmed = location.trim()
  if (!trimmed) return trimmed

  const parts = trimmed.split(',')
  const cityRaw = parts[0]?.trim() ?? ''
  const cityKey = cityRaw.toLowerCase()
  const fixedCity = CITY_TYPOS[cityKey] ?? cityRaw

  if (parts.length > 1) {
    return [fixedCity, ...parts.slice(1).map((p) => p.trim())].filter(Boolean).join(', ')
  }
  return fixedCity
}

export function pickSearchLocations(customerLocation: string, yourLocation: string): string[] {
  const customer = customerLocation.trim()
  const yours = normalizeYourLocation(yourLocation.trim())
  const locations: string[] = []

  const add = (loc: string) => {
    const cleaned = loc.trim()
    if (!cleaned || isBroadLocation(cleaned)) return
    if (!locations.includes(cleaned)) locations.push(cleaned)
  }

  // "Anywhere in the US" → search only near the user's city.
  if (isBroadLocation(customer) && yours) {
    for (const v of expandLocation(yours)) add(v)
    return locations.sort((a, b) => locationScore(b) - locationScore(a)).slice(0, 3)
  }

  if (isStateOnly(customer) && yours) {
    for (const v of expandLocation(yours)) add(v)
    return locations.sort((a, b) => locationScore(b) - locationScore(a)).slice(0, 3)
  }

  for (const base of [yours, customer]) {
    if (isBroadLocation(base)) continue
    for (const v of expandLocation(base)) add(v)
  }

  return locations.sort((a, b) => locationScore(b) - locationScore(a)).slice(0, 3)
}

function locationScore(location: string): number {
  let score = 0
  if (location.includes(',')) score += 2
  if (!isStateOnly(location)) score += 1
  return score
}

/** If user typed a state, prefer the city they gave in step 1. */
export function normalizeCustomerLocation(
  customerLocation: string,
  yourLocation: string,
): string {
  const customer = customerLocation.trim()
  const yours = normalizeYourLocation(yourLocation.trim())
  if (isBroadLocation(customer) && yours) return yours
  if (isStateOnly(customer) && yours.includes(',')) return yours
  return customer
}
