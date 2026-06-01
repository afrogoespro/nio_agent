import { getApolloApiKey } from './integrationStore'

export async function fetchIntegrationStatus(): Promise<{
  apolloServer: boolean
  emailServer: boolean
}> {
  const res = await fetch('/api/integration-status')
  if (!res.ok) return { apolloServer: false, emailServer: false }
  return res.json()
}

export async function sendTestEmail(payload: {
  to: string
  subject: string
  body: string
  fromName?: string
}): Promise<{ ok: boolean; message: string }> {
  const res = await fetch('/api/send-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return { ok: false, message: data.error ?? 'Could not send test email.' }
  }
  return { ok: true, message: data.message ?? 'Test email sent. Check your inbox.' }
}

export async function searchApolloLeads(payload: {
  keywords: string
  location: string
}): Promise<{ ok: boolean; people?: unknown[]; message?: string }> {
  const res = await fetch('/api/apollo-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-apollo-key': getApolloApiKey(),
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return { ok: false, message: data.error ?? 'Apollo search failed.' }
  }
  return { ok: true, people: data.people, message: data.message }
}
