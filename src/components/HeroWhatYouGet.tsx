import './HeroWhatYouGet.css'

const STEPS = [
  {
    verb: 'Find',
    line: 'We look for a real person who fits your target.',
  },
  {
    verb: 'Write',
    line: 'Your opening email and follow ups in plain words.',
  },
  {
    verb: 'Launch',
    line: 'Copy, test send, and line up Day 4 and Day 8.',
  },
] as const

export function HeroWhatYouGet() {
  return (
    <ul className="hero-steps" aria-label="What you get">
      {STEPS.map((step) => (
        <li key={step.verb} className="hero-steps__card">
          <span className="hero-steps__verb">{step.verb}</span>
          <p className="hero-steps__line">{step.line}</p>
        </li>
      ))}
    </ul>
  )
}
