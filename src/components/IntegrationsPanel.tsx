import { useEffect, useState } from 'react'
import type { EmailMessage, OutreachPlan } from '../types/plan'
import type { IntegrationState } from '../types/integrations'
import {
  getApolloApiKey,
  loadIntegrations,
  saveIntegrations,
  setApolloApiKey,
} from '../lib/integrationStore'
import {
  fetchIntegrationStatus,
  searchApolloLeads,
  sendTestEmail,
} from '../lib/integrationsApi'
import './IntegrationsPanel.css'

interface IntegrationsPanelProps {
  plan: OutreachPlan
  customerLocation: string
  idealCustomer: string
  previewEmail?: EmailMessage
  defaultFromName?: string
}

export function IntegrationsPanel({
  plan,
  customerLocation,
  idealCustomer,
  previewEmail,
  defaultFromName = '',
}: IntegrationsPanelProps) {
  const [state, setState] = useState<IntegrationState>(() => loadIntegrations())
  const [apolloKeyInput, setApolloKeyInput] = useState(() => getApolloApiKey())
  const [serverReady, setServerReady] = useState({ apolloServer: false, emailServer: false })
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [apolloPreview, setApolloPreview] = useState<string | null>(null)

  useEffect(() => {
    fetchIntegrationStatus().then(setServerReady)
  }, [])

  function patch(partial: Partial<IntegrationState>) {
    const next = { ...state, ...partial }
    setState(next)
    saveIntegrations(next)
  }

  function connectEmail() {
    const address = state.email.address.trim()
    if (!address.includes('@')) {
      setStatus('Enter a valid email address.')
      return
    }
    patch({
      email: {
        ...state.email,
        connected: true,
        address,
        fromName:
          state.email.fromName.trim() || defaultFromName.trim() || 'My team',
      },
    })
    setStatus('Email connected. You can send a test below.')
  }

  function connectApollo() {
    const key = apolloKeyInput.trim()
    if (!key && !serverReady.apolloServer) {
      setStatus('Add your Apollo API key or set APOLLO_API_KEY on the server.')
      return
    }
    setApolloApiKey(key)
    patch({
      apollo: { connected: true, hasKey: Boolean(key) },
    })
    setStatus('Apollo connected. Try a lead search below.')
  }

  async function handleTestEmail() {
    if (!state.email.connected) {
      setStatus('Connect your email first.')
      return
    }
    setBusy(true)
    setStatus(null)
    const email = previewEmail ?? plan.sampleEmail
    const result = await sendTestEmail({
      to: state.email.address,
      subject: email.subject,
      body: email.body,
      fromName: state.email.fromName.trim() || defaultFromName.trim(),
    })
    setBusy(false)
    setStatus(result.message)
  }

  async function handleApolloSearch() {
    if (!state.apollo.connected) {
      setStatus('Connect Apollo first.')
      return
    }
    setBusy(true)
    setStatus(null)
    setApolloPreview(null)
    const result = await searchApolloLeads({
      keywords: idealCustomer,
      location: customerLocation,
    })
    setBusy(false)
    if (!result.ok) {
      setStatus(result.message ?? 'Search failed.')
      return
    }
    const people = Array.isArray(result.people) ? result.people : []
    const first = people[0] as {
      first_name?: string
      last_name?: string
      organization?: { name?: string }
    } | undefined
    const name = first
      ? [first.first_name, first.last_name].filter(Boolean).join(' ')
      : ''
    const co = first?.organization?.name
    setApolloPreview(
      people.length > 0 && name
        ? `Found ${name}${co ? ` at ${co}` : ''} and others. Your plan uses the first match.`
        : people.length > 0
          ? `Found ${people.length} leads. Your next plan will use the first match.`
          : 'No leads returned. Try broader keywords or location.',
    )
    setStatus(
      people.length > 0
        ? `Found ${Math.min(people.length, 10)} leads (max 10 during beta).`
        : (result.message ?? 'Search complete.'),
    )
  }

  function toggleDrip() {
    if (!state.email.connected) {
      setStatus('Connect your email to turn on warm up drips.')
      return
    }
    const next = !state.dripWarmupEnabled
    patch({ dripWarmupEnabled: next })
    setStatus(
      next
        ? 'Warm up drip is on. Auto send from your inbox is coming soon. Use test emails for now.'
        : 'Warm up drip is off.',
    )
  }

  return (
    <section className="integrations" aria-labelledby="integrations-title">
      <h2 id="integrations-title" className="integrations__title">
        Connect your tools
      </h2>
      <p className="integrations__lede">
        Hook up email and Apollo to send tests and find leads. LinkedIn, X, and
        Instagram are next.
      </p>

      {status && (
        <p className="integrations__status" role="status">
          {status}
        </p>
      )}

      <div className="integrations__card">
        <h3>Your email</h3>
        <p className="integrations__hint">
          Send test emails and prep your Day 1, 4, and 8 warm up drip.
        </p>
        <label className="integrations__label" htmlFor="email-address">
          Your email address
        </label>
        <input
          id="email-address"
          type="email"
          className="integrations__input"
          value={state.email.address}
          onChange={(e) =>
            patch({ email: { ...state.email, address: e.target.value } })
          }
          placeholder="you@company.com"
        />
        <label className="integrations__label" htmlFor="from-name">
          Your name (shows in emails)
        </label>
        <input
          id="from-name"
          type="text"
          className="integrations__input"
          value={state.email.fromName}
          onChange={(e) =>
            patch({ email: { ...state.email, fromName: e.target.value } })
          }
          placeholder="Alex"
        />
        <div className="integrations__row">
          <button
            type="button"
            className="integrations__btn integrations__btn--secondary"
            onClick={connectEmail}
          >
            {state.email.connected ? 'Update email' : 'Connect email'}
          </button>
          <button
            type="button"
            className="integrations__btn"
            disabled={busy || !state.email.connected}
            onClick={handleTestEmail}
          >
            Send test email
          </button>
        </div>
        {!serverReady.emailServer && (
          <p className="integrations__note">
            Server needs RESEND_API_KEY on Vercel to send. Copy still works without it.
          </p>
        )}
      </div>

      <div className="integrations__card">
        <h3>Apollo</h3>
        <p className="integrations__hint">
          Find real leads that match your target and location.
        </p>
        <label className="integrations__label" htmlFor="apollo-key">
          Apollo API key
        </label>
        <input
          id="apollo-key"
          type="password"
          className="integrations__input"
          value={apolloKeyInput}
          onChange={(e) => setApolloKeyInput(e.target.value)}
          placeholder="Paste from Apollo settings"
          autoComplete="off"
        />
        <div className="integrations__row">
          <button
            type="button"
            className="integrations__btn integrations__btn--secondary"
            onClick={connectApollo}
          >
            {state.apollo.connected ? 'Update Apollo' : 'Connect Apollo'}
          </button>
          <button
            type="button"
            className="integrations__btn"
            disabled={busy || !state.apollo.connected}
            onClick={handleApolloSearch}
          >
            Find leads
          </button>
        </div>
        {apolloPreview && <p className="integrations__preview">{apolloPreview}</p>}
      </div>

      <div className="integrations__card integrations__card--drip">
        <div className="integrations__drip-head">
          <div>
            <h3>Warm up drip</h3>
            <p className="integrations__hint">
              Day 1, Day 4, and Day 8 emails from your plan.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={state.dripWarmupEnabled}
            className={`integrations__toggle ${state.dripWarmupEnabled ? 'integrations__toggle--on' : ''}`}
            onClick={toggleDrip}
          >
            <span className="integrations__toggle-knob" />
          </button>
        </div>
        {state.dripWarmupEnabled && (
          <ul className="integrations__drip-list">
            {plan.drip.map((d) => (
              <li key={d.dayLabel}>
                <strong>{d.dayLabel}</strong> {d.subject}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="integrations__social">
        <p className="integrations__social-label">Coming next</p>
        <div className="integrations__social-pills">
          <span>LinkedIn</span>
          <span>X</span>
          <span>Instagram</span>
        </div>
      </div>
    </section>
  )
}
