import { useEffect, useState } from 'react'
import { Landing } from './components/Landing'
import { Wizard } from './components/Wizard'
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

export default function App() {
  const [view, setView] = useState<View>('landing')
  const [plan, setPlan] = useState<OutreachPlan | null>(null)
  const [input, setInput] = useState<WizardInput | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = loadPlanFromSession()
    if (stored?.input?.business) {
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
    setInput(wizardInput)
    setError(null)
    setView('loading')

    try {
      const result = await generatePlan(wizardInput)
      setPlan(result)
      savePlanToSession(result, wizardInput)
      setView('plan')
    } catch {
      setError('Something went wrong. Please try again.')
      setView('wizard')
    }
  }

  function handleStartOver() {
    clearPlanSession()
    setPlan(null)
    setInput(null)
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
      <>
        {error && (
          <p className="app-error" role="alert">
            {error}
          </p>
        )}
        <Wizard
          onComplete={handleWizardComplete}
          onBack={() => {
            setError(null)
            setView('landing')
          }}
        />
      </>
    )
  }

  return <Landing onTry={() => setView('wizard')} />
}
