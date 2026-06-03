import './FlowProgress.css'

const STAGES = [
  'Try it',
  'About you',
  'Target & why',
  'Your plan',
  'Warm up drip',
  'Your list',
  'Preview',
] as const

export type FlowStage = 1 | 2 | 3 | 4 | 5 | 6 | 7

interface FlowProgressProps {
  current: FlowStage
}

export function FlowProgress({ current }: FlowProgressProps) {
  return (
    <ol className="flow-progress" aria-label="Progress">
      {STAGES.map((label, i) => {
        const step = (i + 1) as FlowStage
        const done = step < current
        const active = step === current
        return (
          <li
            key={label}
            className={`flow-progress__item ${done ? 'flow-progress__item--done' : ''} ${active ? 'flow-progress__item--active' : ''}`}
            aria-current={active ? 'step' : undefined}
          >
            <span className="flow-progress__dot" aria-hidden="true">
              {done ? '✓' : step}
            </span>
            <span className="flow-progress__label">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
