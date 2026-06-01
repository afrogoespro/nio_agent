import { useCallback, useEffect, useState, type FormEvent } from 'react'
import type { AgentId, WizardInput } from '../types/plan'
import { BrandMark } from './BrandMark'
import { FlowProgress } from './FlowProgress'
import type { FlowStage } from './FlowProgress'
import { AgentPicker } from './AgentPicker'
import './Wizard.css'

export interface WizardDraft {
  step: 1 | 2 | 3
  business: string
  valueProp: string
  yourLocation: string
  idealCustomer: string
  whyTarget: string
  customerLocation: string
  agentId: AgentId | null
}

interface WizardProps {
  onComplete: (input: WizardInput) => void
  onBack: () => void
  resume?: WizardDraft | null
  errorMessage?: string | null
}

export function Wizard({ onComplete, onBack, resume, errorMessage }: WizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(resume?.step ?? 1)
  const [business, setBusiness] = useState(resume?.business ?? '')
  const [valueProp, setValueProp] = useState(resume?.valueProp ?? '')
  const [yourLocation, setYourLocation] = useState(resume?.yourLocation ?? '')
  const [idealCustomer, setIdealCustomer] = useState(resume?.idealCustomer ?? '')
  const [whyTarget, setWhyTarget] = useState(resume?.whyTarget ?? '')
  const [customerLocation, setCustomerLocation] = useState(resume?.customerLocation ?? '')
  const [agentId, setAgentId] = useState<AgentId | null>(resume?.agentId ?? null)

  const flowStage: FlowStage = step <= 2 ? ((step + 1) as FlowStage) : 3

  const canNext =
    (step === 1 &&
      business.trim().length > 2 &&
      valueProp.trim().length > 2 &&
      yourLocation.trim().length > 1) ||
    (step === 2 &&
      idealCustomer.trim().length > 2 &&
      whyTarget.trim().length > 2 &&
      customerLocation.trim().length > 1) ||
    (step === 3 && agentId !== null)

  const handleNext = useCallback(() => {
    if (!canNext) return
    if (step < 3) {
      setStep((step + 1) as 1 | 2 | 3)
      return
    }
    if (agentId) {
      onComplete({
        business: business.trim(),
        valueProp: valueProp.trim(),
        yourLocation: yourLocation.trim(),
        idealCustomer: idealCustomer.trim(),
        whyTarget: whyTarget.trim(),
        customerLocation: customerLocation.trim(),
        agentId,
      })
    }
  }, [
    canNext,
    step,
    agentId,
    business,
    valueProp,
    yourLocation,
    idealCustomer,
    whyTarget,
    customerLocation,
    onComplete,
  ])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    handleNext()
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Enter') return

      const el = e.target as HTMLElement
      const tag = el.tagName

      if (tag === 'TEXTAREA') {
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault()
          handleNext()
        }
        return
      }

      if (tag === 'BUTTON' || el.getAttribute('role') === 'radio') return

      if (canNext) {
        e.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [canNext, handleNext])

  function handleBack() {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3)
    else onBack()
  }

  return (
    <div className="wizard">
      <header className="wizard__header">
        <button type="button" className="wizard__back" onClick={handleBack}>
          ← Back
        </button>
        <BrandMark size="sm" />
        <p className="wizard__progress">~2 min</p>
      </header>

      <div className="wizard__flow">
        <FlowProgress current={flowStage} />
      </div>

      <form className="wizard__form" onSubmit={handleSubmit}>
      <main className="wizard__main">
        {step === 1 && (
          <div className="wizard__panel">
            <p className="wizard__step-label">Step 2 of 5 · About you</p>
            <h1>Tell us about you</h1>
            <p className="wizard__hint">
              A few quick questions. Takes about a minute.
            </p>
            <label className="wizard__label" htmlFor="business">
              What does your business do?
            </label>
            <textarea
              id="business"
              className="wizard__input"
              rows={2}
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder="I help dentists get more patients from Google."
              autoFocus
            />
            <label className="wizard__label" htmlFor="valueProp">
              What makes you different?
            </label>
            <textarea
              id="valueProp"
              className="wizard__input"
              rows={2}
              value={valueProp}
              onChange={(e) => setValueProp(e.target.value)}
              placeholder="We are local, fast, and do not lock you into contracts."
            />
            <label className="wizard__label" htmlFor="yourLocation">
              Where are you based?
            </label>
            <input
              id="yourLocation"
              type="text"
              className="wizard__input wizard__input--single"
              value={yourLocation}
              onChange={(e) => setYourLocation(e.target.value)}
              placeholder="Austin, Texas"
            />
          </div>
        )}

        {step === 2 && (
          <div className="wizard__panel">
            <p className="wizard__step-label">Step 3 of 5 · Target & why</p>
            <h1>Who do we want to reach and why?</h1>
            <p className="wizard__hint">
              Your rep uses this to find the right people and angle your emails.
            </p>
            <label className="wizard__label" htmlFor="customer">
              Who is your ideal customer?
            </label>
            <textarea
              id="customer"
              className="wizard__input"
              rows={2}
              value={idealCustomer}
              onChange={(e) => setIdealCustomer(e.target.value)}
              placeholder="Owners of dental offices with 2 to 10 people in Texas."
              autoFocus
            />
            <label className="wizard__label" htmlFor="whyTarget">
              Why them? Why now?
            </label>
            <textarea
              id="whyTarget"
              className="wizard__input"
              rows={2}
              value={whyTarget}
              onChange={(e) => setWhyTarget(e.target.value)}
              placeholder="They need more patients and are actively looking online."
            />
            <label className="wizard__label" htmlFor="customerLocation">
              Where are your customers?
            </label>
            <input
              id="customerLocation"
              type="text"
              className="wizard__input wizard__input--single"
              value={customerLocation}
              onChange={(e) => setCustomerLocation(e.target.value)}
              placeholder="Texas, or anywhere in the US"
            />
          </div>
        )}

        {step === 3 && (
          <div className="wizard__panel">
            <p className="wizard__step-label">Pick your rep. Then we build your plan.</p>
            <h1>Who should be your 24/7 rep?</h1>
            <p className="wizard__hint">
              Choose the personality that sounds like you.
            </p>
            <AgentPicker value={agentId} onChange={setAgentId} />
          </div>
        )}
      </main>

      <footer className="wizard__footer">
        {errorMessage && step === 3 && (
          <p className="wizard__error" role="alert">
            {errorMessage}
          </p>
        )}
        <button
          type="submit"
          className="wizard__cta"
          disabled={!canNext}
        >
          {step < 3 ? 'Next' : 'Build my plan'}
        </button>
      </footer>
      </form>
    </div>
  )
}
