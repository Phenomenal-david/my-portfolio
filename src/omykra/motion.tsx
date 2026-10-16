import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ElementType, type ReactNode } from 'react'

/**
 * `live` is false while the site is a miniature inside the folder, so scroll
 * reveals wait until the site is full screen, then play for real.
 */
export const LiveContext = createContext(true)

/** Forces every reveal into its finished state (used for the frame that sinks back into the folder). */
export const StaticContext = createContext(false)

/* ------------------------------------------------------------------ */
/* Design frame: keep the original 1440px layout, scaled to the screen */
/* ------------------------------------------------------------------ */

/** Width of the original Figma frame. */
export const DESIGN_WIDTH = 1440
/** Below this viewport width the site switches to its responsive (mobile/tablet) layout instead of scaling. */
export const DESIGN_MIN_VIEWPORT = 768

const subscribeWidth = (cb: () => void) => {
  window.addEventListener('resize', cb)
  return () => window.removeEventListener('resize', cb)
}
const getWidth = () => document.documentElement.clientWidth

export function useViewportWidth() {
  return useSyncExternalStore(subscribeWidth, getWidth, () => DESIGN_WIDTH)
}

/** Returns the layout width and zoom used to render the design at its original proportions. */
export function useDesignScale() {
  const vw = useViewportWidth()
  if (vw < DESIGN_MIN_VIEWPORT) return { width: vw, zoom: 1 }
  return { width: DESIGN_WIDTH, zoom: vw / DESIGN_WIDTH }
}

/**
 * Lays children out at exactly 1440px (the Figma frame) and zooms them to fill
 * the viewport, so the site always looks like the original design. It is also
 * the container for the site's `@3xl:`/`@5xl:`/`@7xl:` container-query breakpoints.
 */
export function DesignFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { width, zoom } = useDesignScale()
  return (
    <div className={`overflow-x-clip ${className}`}>
      <div className="@container" style={{ width, zoom }}>
        {children}
      </div>
    </div>
  )
}

/** Effective CSS zoom of an element, to convert pointer offsets into local px. */
export function zoomOf(el: Element) {
  return (el as Element & { currentCSSZoom?: number }).currentCSSZoom ?? 1
}

export function useInView<T extends Element>(options: { once?: boolean; margin?: string; threshold?: number } = {}) {
  const { once = true, margin = '0px 0px -12% 0px', threshold = 0.15 } = options
  const live = useContext(LiveContext)
  const forced = useContext(StaticContext)
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || !live || forced) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin: margin, threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [live, forced, once, margin, threshold])

  return [ref, inView || forced] as const
}

type RevealProps = {
  children: ReactNode
  as?: ElementType
  className?: string
  style?: CSSProperties
  delay?: number
  /** Starting offset in px. */
  y?: number
  x?: number
  scale?: number
  blur?: boolean
}

export function Reveal({ children, as: Tag = 'div', className = '', style, delay = 0, y = 28, x = 0, scale = 1, blur = true }: RevealProps) {
  const [ref, inView] = useInView<HTMLElement>()
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        filter: blur && !inView ? 'blur(8px)' : 'none',
        transition: `opacity 900ms cubic-bezier(.2,.7,.2,1) ${delay}ms, transform 1000ms cubic-bezier(.2,.7,.2,1) ${delay}ms, filter 900ms cubic-bezier(.2,.7,.2,1) ${delay}ms`,
        willChange: inView ? undefined : 'opacity, transform',
      }}
    >
      {children}
    </Tag>
  )
}

export function CountUp({ to, prefix = '', duration = 1600 }: { to: number; prefix?: string; duration?: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.6 })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setValue(Math.round(to * (1 - Math.pow(1 - t, 4))))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {value.toLocaleString('en-GB')}
    </span>
  )
}
