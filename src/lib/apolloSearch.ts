export interface ApolloPerson {
  id?: string
  first_name?: string
  last_name?: string
  last_name_obfuscated?: string
  title?: string
  city?: string
  state?: string
  country?: string
  organization?: { name?: string }
}

export type ApolloSearchResult =
  | { ok: true; people: ApolloPerson[] }
  | { ok: false; reason: string }

const APOLLO_SEARCH_URL = 'https://api.apollo.io/api/v1/mixed_people/api_search'
const SEARCH_TIMEOUT_MS = 6000

export async function searchApolloPeople(
  apiKey: string,
  keywords: string,
  location: string,
): Promise<ApolloSearchResult> {
  try {
    const params = new URLSearchParams()
    params.set('q_keywords', keywords)
    params.set('per_page', '5')
    params.set('page', '1')

    if (location.trim()) {
      params.append('person_locations[]', location.trim())
    }

    for (const title of guessTitles(keywords)) {
      params.append('person_titles[]', title)
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS)

    const response = await fetch(`${APOLLO_SEARCH_URL}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apiKey,
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timer))

    const data = (await response.json().catch(() => ({}))) as {
      people?: ApolloPerson[]
      contacts?: ApolloPerson[]
      error?: string
      message?: string
    }

    if (!response.ok) {
      const msg = data.error ?? data.message ?? `Apollo error ${response.status}`
      return { ok: false, reason: shortenApolloError(msg) }
    }

    const people = (data.people ?? data.contacts ?? []).filter((p) => p.first_name?.trim())
    if (people.length === 0) {
      return {
        ok: false,
        reason: location.trim()
          ? `No leads found near ${location.trim()}. Try simpler words or a wider area.`
          : 'No leads found for these keywords.',
      }
    }

    return { ok: true, people }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { ok: false, reason: 'Apollo took too long. Try again or use a simpler search.' }
    }
    return { ok: false, reason: 'Could not reach Apollo. Check your API key and plan.' }
  }
}

/** Prefer first name; use obfuscated last initial when Apollo hides full name. */
export function apolloDisplayName(person: ApolloPerson): {
  firstName: string
  fullName: string
} {
  const first = (person.first_name ?? '').trim()
  const last = (person.last_name ?? '').trim()
  if (first && last) {
    return { firstName: first, fullName: `${first} ${last}` }
  }
  if (first && person.last_name_obfuscated) {
    const ob = person.last_name_obfuscated.trim()
    return { firstName: first, fullName: `${first} ${ob}` }
  }
  if (first) {
    return { firstName: first, fullName: first }
  }
  return { firstName: 'there', fullName: 'This contact' }
}

function guessTitles(keywords: string): string[] {
  const lower = keywords.toLowerCase()
  const titles: string[] = []
  if (lower.includes('owner') || lower.includes('founder')) titles.push('owner')
  if (lower.includes('dentist') || lower.includes('dental')) titles.push('dentist')
  if (lower.includes('manager')) titles.push('manager')
  if (lower.includes('director')) titles.push('director')
  return titles.slice(0, 2)
}

function shortenApolloError(msg: string): string {
  if (msg.includes('deprecated') || msg.includes('api_search')) {
    return 'Apollo search needs an update on our side. Using an example lead for now.'
  }
  if (msg.length > 120) {
    return `${msg.slice(0, 117)}…`
  }
  return msg
}
