import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './PlanCarousel.css'

export interface PlanSlide {
  id: string
  title: string
  content: ReactNode
}

interface PlanCarouselProps {
  slides: PlanSlide[]
  onFinish: () => void
  finishLabel?: string
  /** Slide id where Next stays disabled until gate clears */
  gateSlideId?: string
  canAdvance?: boolean
}

export function PlanCarousel({
  slides,
  onFinish,
  finishLabel = 'Review warm up drip →',
  gateSlideId,
  canAdvance = true,
}: PlanCarouselProps) {
  const [index, setIndex] = useState(0)
  const total = slides.length
  const isFirst = index === 0
  const isLast = index === total - 1

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1))
  }, [])

  const gated = Boolean(
    gateSlideId && slides[index]?.id === gateSlideId && !canAdvance,
  )

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(total - 1, i + 1))
  }, [total])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight' && !isLast && !gated) goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext, isLast, gated])

  return (
    <div className="plan-carousel">
      <div className="plan-carousel__top">
        <p className="plan-carousel__counter">
          {index + 1} of {total}
        </p>
        <h2 className="plan-carousel__title">{slides[index].title}</h2>
      </div>

      <div className="plan-carousel__viewport">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slides[index].id}
            className="plan-carousel__slide"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {slides[index].content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="plan-carousel__dots" role="tablist" aria-label="Plan sections">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`${slide.title}, slide ${i + 1}`}
            className={`plan-carousel__dot ${i === index ? 'plan-carousel__dot--active' : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

      <nav className="plan-carousel__nav" aria-label="Browse plan">
        <button
          type="button"
          className="plan-carousel__arrow"
          onClick={goPrev}
          disabled={isFirst}
          aria-label="Previous"
        >
          ← Back
        </button>
        {isLast ? (
          <button
            type="button"
            className="plan-carousel__launch"
            onClick={onFinish}
          >
            {finishLabel}
          </button>
        ) : (
          <button
            type="button"
            className="plan-carousel__arrow plan-carousel__arrow--next"
            onClick={goNext}
            disabled={gated}
            aria-label="Next"
          >
            Next →
          </button>
        )}
      </nav>
    </div>
  )
}
