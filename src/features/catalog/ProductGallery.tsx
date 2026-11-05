import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

type ProductGalleryProps = {
  images: string[]
  alts?: string[]
  name: string
}

export function ProductGallery({
  images,
  alts = [],
  name,
}: ProductGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, startScroll: 0 })
  const [index, setIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const count = images.length

  useEffect(() => {
    const track = trackRef.current
    if (!track || count < 2) return

    const handleResize = () => {
      track.scrollLeft = index * track.clientWidth
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [count, index])

  const goTo = useCallback(
    (next: number) => {
      const track = trackRef.current
      if (!track || count === 0) return
      const clamped = Math.max(0, Math.min(count - 1, next))
      track.scrollTo({
        left: clamped * track.clientWidth,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      })
      setIndex(clamped)
    },
    [count],
  )

  const handleScroll = () => {
    const track = trackRef.current
    if (!track || !track.clientWidth || drag.current.active) return
    setIndex(Math.round(track.scrollLeft / track.clientWidth))
  }

  // Glisser à la souris sur ordinateur (le tactile utilise le scroll natif).
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (event.pointerType !== 'mouse' || !track || count < 2) return
    drag.current = {
      active: true,
      startX: event.clientX,
      startScroll: track.scrollLeft,
    }
    setIsDragging(true)
    track.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!drag.current.active || !track) return
    track.scrollLeft =
      drag.current.startScroll - (event.clientX - drag.current.startX)
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!drag.current.active || !track) return
    drag.current.active = false
    setIsDragging(false)
    track.releasePointerCapture(event.pointerId)
    goTo(Math.round(track.scrollLeft / track.clientWidth))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goTo(index - 1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goTo(index + 1)
    }
  }

  const altFor = (position: number) =>
    alts[position] || `${name}, photo ${position + 1} sur ${count}`

  if (count === 0) {
    return (
      <div className="gallery gallery-empty" aria-label={`Photos de ${name}`}>
        <span className="product-image-placeholder">
          Photo bientôt disponible
        </span>
      </div>
    )
  }

  return (
    <div
      aria-label={`Photos de ${name}`}
      aria-roledescription="carrousel"
      className="gallery"
      onKeyDown={handleKeyDown}
      role="region"
      tabIndex={0}
    >
      <div className="gallery-stage">
        <div
          className={`gallery-track${isDragging ? ' is-dragging' : ''}`}
          onPointerCancel={endDrag}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onScroll={handleScroll}
          ref={trackRef}
        >
          {images.map((src, position) => (
            <div
              aria-hidden={position !== index}
              className="gallery-slide"
              key={`${src}-${position}`}
            >
              <img
                alt={altFor(position)}
                decoding="async"
                draggable={false}
                fetchPriority={position === 0 ? 'high' : undefined}
                height="1500"
                loading={position === 0 ? 'eager' : 'lazy'}
                src={src}
                width="1200"
              />
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              aria-label="Photo précédente"
              className="gallery-arrow gallery-arrow-prev"
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
              type="button"
            >
              <ChevronLeft aria-hidden="true" size={20} />
            </button>
            <button
              aria-label="Photo suivante"
              className="gallery-arrow gallery-arrow-next"
              disabled={index === count - 1}
              onClick={() => goTo(index + 1)}
              type="button"
            >
              <ChevronRight aria-hidden="true" size={20} />
            </button>
            <span aria-live="polite" className="gallery-counter">
              {index + 1} / {count}
            </span>
            <span aria-hidden="true" className="gallery-dots">
              {images.map((src, position) => (
                <span
                  className={position === index ? 'is-active' : undefined}
                  key={`${src}-dot-${position}`}
                />
              ))}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="gallery-thumbs" aria-label="Miniatures">
          {images.map((src, position) => (
            <button
              aria-label={`Voir la photo ${position + 1}`}
              aria-current={position === index}
              className={position === index ? 'is-selected' : undefined}
              key={`${src}-thumb-${position}`}
              onClick={() => goTo(position)}
              type="button"
            >
              <img alt="" height="144" loading="lazy" src={src} width="144" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
