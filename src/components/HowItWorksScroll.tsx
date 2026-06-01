import { useRef, type ReactNode } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from 'framer-motion'
import './HowItWorksScroll.css'

export interface WorkflowStep {
  id: string
  title: string
  description: string
  icon: ReactNode
}

const defaultSteps: WorkflowStep[] = [
  {
    id: 'try',
    title: "Ok, let's try it",
    description: 'One click to start. No signup required to see your plan.',
    icon: <RocketIcon />,
  },
  {
    id: 'about',
    title: 'Tell us about you',
    description: 'A few quick questions. About 1 to 2 minutes. What you do and what makes you different.',
    icon: <BriefcaseIcon />,
  },
  {
    id: 'target',
    title: 'Who to target and why',
    description: 'Who you want as customers and why they need you now.',
    icon: <TargetIcon />,
  },
  {
    id: 'plan',
    title: 'Your plan',
    description: 'Your rep finds a lead, writes emails, and maps your follow-ups.',
    icon: <MailIcon />,
  },
  {
    id: 'launch',
    title: 'Launch',
    description: 'Copy your emails and start reaching out today.',
    icon: <RocketIcon />,
  },
]

interface HowItWorksScrollProps {
  steps?: WorkflowStep[]
}

export function HowItWorksScroll({ steps = defaultSteps }: HowItWorksScrollProps) {
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.75', 'end 0.35'],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  })

  const lineProgress = useTransform(smoothProgress, [0, 1], [0, 1])
  const lineOpacity = useTransform(smoothProgress, [0, 0.05], [0, 1])

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="how-scroll"
      aria-labelledby="how-it-works-title"
    >
      <div className="how-scroll__header">
        <p className="how-scroll__eyebrow">How your rep works</p>
        <h2 id="how-it-works-title" className="how-scroll__title">
          Five steps. Try it to launch.
        </h2>
        <p className="how-scroll__subtitle">
          Scroll to see the path — most people finish in under five minutes.
        </p>
      </div>

      <div className="how-scroll__track">
        <div className="how-scroll__line-col" aria-hidden="true">
          <svg
            className="how-scroll__svg"
            viewBox="0 0 4 1000"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <filter id="glow" x="-200%" y="-20%" width="500%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <motion.path
              d="M 2 0 L 2 1000"
              fill="none"
              stroke="url(#lineGlow)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#glow)"
              style={{
                pathLength: lineProgress,
                opacity: lineOpacity,
              }}
            />
            <path
              d="M 2 0 L 2 1000"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <ol className="how-scroll__steps">
          {steps.map((step, index) => (
            <WorkflowStepCard
              key={step.id}
              step={step}
              index={index}
              scrollProgress={smoothProgress}
              total={steps.length}
            />
          ))}
        </ol>
      </div>
    </section>
  )
}

interface WorkflowStepCardProps {
  step: WorkflowStep
  index: number
  scrollProgress: ReturnType<typeof useSpring>
  total: number
}

function WorkflowStepCard({
  step,
  index,
  scrollProgress,
  total,
}: WorkflowStepCardProps) {
  const ref = useRef<HTMLLIElement>(null)
  const inView = useInView(ref, { once: false, margin: '-15% 0px -15% 0px' })
  const side = index % 2 === 0 ? 'left' : 'right'

  const stepStart = index / total
  const stepEnd = (index + 1) / total
  const dotScale = useTransform(
    scrollProgress,
    [stepStart, stepStart + 0.08, stepEnd],
    [0.6, 1.15, 1],
  )
  const dotOpacity = useTransform(
    scrollProgress,
    [stepStart - 0.02, stepStart + 0.05],
    [0.35, 1],
  )

  return (
    <li
      ref={ref}
      className={`how-scroll__step how-scroll__step--${side}`}
    >
      <motion.span
        className="how-scroll__dot"
        style={{ scale: dotScale, opacity: dotOpacity }}
        aria-hidden="true"
      />

      <motion.article
        className="how-scroll__card"
        initial={{ opacity: 0, x: side === 'left' ? -48 : 48, y: 24 }}
        animate={
          inView
            ? { opacity: 1, x: 0, y: 0 }
            : { opacity: 0.25, x: side === 'left' ? -24 : 24, y: 12 }
        }
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="how-scroll__icon">{step.icon}</div>
        <div className="how-scroll__card-body">
          <span className="how-scroll__step-num">Step {index + 1}</span>
          <h3 className="how-scroll__card-title">{step.title}</h3>
          <p className="how-scroll__card-desc">{step.description}</p>
        </div>
      </motion.article>
    </li>
  )
}

function BriefcaseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  )
}

function RocketIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}
