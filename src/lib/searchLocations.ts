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

  const city = loc.split(',')[0]?.trim()
  if (city && city.length > 1 && city !== loc) {
    variants.add(city)
  }

  return [...variants]
}

export function pickSearchLocations(customerLocation: string, yourLocation: string): string[] {
  const customer = customerLocation.trim()
  const yours = yourLocation.trim()
  const locations: string[] = []

  const add = (loc: string) => {
    if (loc && !locations.includes(loc)) locations.push(loc)
  }

  // State only (e.g. "Texas") → use city from step 1 instead.
  if (isStateOnly(customer) && yours) {
    for (const v of expandLocation(yours)) add(v)
    return locations
  }

  for (const base of [yours, customer]) {
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
  const yours = yourLocation.trim()
  if (isStateOnly(customer) && yours.includes(',')) return yours
  return customer
}
