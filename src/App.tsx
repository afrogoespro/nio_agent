import { useEffect, useState } from 'react'
import { Landing } from './components/Landing'
import { Wizard, type WizardDraft } from './components/Wizard'
import { LoadingState } from './components/LoadingState'
import { Playbook } from './components/Playbook'
import { Launch } from './components/Launch'
import { generatePlan } from './lib/generatePlan'
import {
  loadPlanFromSession,
  savePlanToSession,
  clearPlanSession,
} from './lib/session'
import type { OutreachPlan, WizardInput } from './types/plan'
import './App.css'

type View = 'landing' | 'wizard' | 'loading' | 'plan' | 'launch'

function toDraft(input: WizardInput): WizardDraft {
  return {
    step: 3,
    business: input.business,
    valueProp: input.valueProp,
    yourLocation: input.yourLocation,
    idealCustomer: input.idealCustomer,
    whyTarget: input.whyTarget,
    customerLocation: input.customerLocation,
    agentId: input.agentId,
  }
}

export default function App() {
  const [view, setView] = useState<View>('landing')
  const [plan, setPlan] = useState<OutreachPlan | null>(null)
  const [input, setInput] = useState<WizardInput | null>(null)
  const [wizardResume, setWizardResume] = useState<WizardDraft | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = loadPlanFromSession()
    if (stored?.input?.business && stored.plan.icpExample.source) {
      const isStaleExample =
        stored.plan.icpExample.source === 'example' &&
        (stored.plan.icpExample.name === 'Jordan Lee' || Boolean(stored.plan.apolloNote))
      if (isStaleExample) {
        clearPlanSession()
        return
      }
      setPlan(stored.plan)
      setInput({
        ...stored.input,
        yourLocation: stored.input.yourLocation ?? '',
        customerLocation: stored.input.customerLocation ?? '',
      })
      setView('plan')
    }
  }, [])

  useEffect(() => {
    if (!plan || view === 'launch') return

    function warn(e: BeforeUnloadEvent) {
      e.preventDefault()
    }

    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [view, plan])

  async function handleWizardComplete(wizardInput: WizardInput) {
    clearPlanSession()
    setPlan(null)
    setInput(wizardInput)
    setWizardResume(toDraft(wizardInput))
    setError(null)
    setView('loading')

    try {
      const result = await generatePlan(wizardInput)
      if (!result?.icpExample?.name || !result?.sampleEmail?.body) {
        throw new Error('Plan came back incomplete. Please try again.')
      }
      setPlan(result)
      savePlanToSession(result, wizardInput)
      setWizardResume(null)
      setView('plan')
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Something went wrong. Please try again.'
      setError(message)
      setView('wizard')
    }
  }

  function handleStartOver() {
    clearPlanSession()
    setPlan(null)
    setInput(null)
    setWizardResume(null)
    setError(null)
    setView('landing')
  }

  if (view === 'loading') {
    return <LoadingState />
  }

  if (view === 'launch' && plan && input) {
    return <Launch plan={plan} input={input} onStartOver={handleStartOver} />
  }

  if (view === 'plan' && plan && input) {
    return (
      <Playbook
        plan={plan}
        input={input}
        onLaunch={() => setView('launch')}
        onStartOver={handleStartOver}
      />
    )
  }

  if (view === 'wizard') {
    return (
      <Wizard
        onComplete={handleWizardComplete}
        onBack={() => {
          setError(null)
          setWizardResume(null)
          setView('landing')
        }}
        resume={wizardResume}
        errorMessage={error}
      />
    )
  }

  return <Landing onTry={() => setView('wizard')} />
}
