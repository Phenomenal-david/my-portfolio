import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { a } from './assets'
import { LiveContext } from './motion'
import OmyKraSite from './OmyKraSite'

// Glass front panel of the folder, cut from the same image.
const FRONT_PANEL =
  'polygon(3.4% 36.5%, 4.6% 34.2%, 7.2% 33.2%, 53.5% 33.2%, 56% 34.6%, 61.2% 42.6%, 63.6% 44.2%, 95.6% 44.6%, 97.8% 46.4%, 100% 100%, 0% 100%)'

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
const lerp = (from: number, to: number, t: number) => from + (to - from) * t
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeIn = (t: number) => t * t * t
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/** Intro phase split: 0 → RISE pulls the sheet out of the folder, RISE → 1 expands it to full screen. */
const RISE = 0.38
/** Outro phase split: 0 → SHRINK pulls the sheet back to card size, SHRINK → SINK drops it into the folder. */
const SHRINK = 0.4
const SINK = 0.72
/** With a custom `intro`, the first part of the scroll lifts the intro away and brings the folder up to centre. */
const APPROACH = 0.2

/** Colour treatments for the stage around the folder, so it sits on dark or light pages. */
const TONES = {
  dark: {
    background: '#05070f',
    dots: 'opacity-[0.35] [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)]',
    glow: 'bg-[radial-gradient(closest-side,rgba(37,99,235,0.45),rgba(37,99,235,0.12)_55%,transparent)]',
    kicker: 'text-blue-300/80',
    title: 'text-white',
    accent: 'text-omy-lime',
    body: 'text-white/55',
    hintBorder: 'border-white/30',
    hintDot: 'bg-white/70',
    hintText: 'text-white/50',
    meta: 'text-white/35',
    shadow: 0.55,
  },
  light: {
    background: '#f5f4ef',
    dots: 'opacity-60 [background-image:radial-gradient(rgba(10,10,10,0.09)_1px,transparent_1px)]',
    glow: 'bg-[radial-gradient(closest-side,rgba(36,87,255,0.3),rgba(36,87,255,0.08)_55%,transparent)]',
    kicker: 'text-[#2457ff]',
    title: 'text-[#0a0a0a]',
    accent: 'text-[#2457ff]',
    body: 'text-[rgba(10,10,10,0.5)]',
    hintBorder: 'border-[rgba(10,10,10,0.25)]',
    hintDot: 'bg-[rgba(10,10,10,0.55)]',
    hintText: 'text-[rgba(10,10,10,0.5)]',
    meta: 'text-[rgba(10,10,10,0.35)]',
    shadow: 0.28,
  },
} as const
type Tone = keyof typeof TONES
type ToneStyles = (typeof TONES)[Tone]

type Pointer = { x: number; y: number; hover: number; hoverTarget: number }

/* ------------------------------------------------------------------ */
/* Shared folder stage                                                 */
/* ------------------------------------------------------------------ */

type StageRefs = {
  stage: RefObject<HTMLDivElement | null>
  back: RefObject<HTMLDivElement | null>
  front: RefObject<HTMLDivElement | null>
  frontImg: RefObject<HTMLImageElement | null>
  sheet: RefObject<HTMLDivElement | null>
  inner: RefObject<HTMLDivElement | null>
  bar: RefObject<HTMLDivElement | null>
  glow: RefObject<HTMLDivElement | null>
}

function useStageRefs(): StageRefs {
  return {
    stage: useRef<HTMLDivElement>(null),
    back: useRef<HTMLDivElement>(null),
    front: useRef<HTMLDivElement>(null),
    frontImg: useRef<HTMLImageElement>(null),
    sheet: useRef<HTMLDivElement>(null),
    inner: useRef<HTMLDivElement>(null),
    bar: useRef<HTMLDivElement>(null),
    glow: useRef<HTMLDivElement>(null),
  }
}

/** Folder + sheet geometry for the current viewport. */
function geometry(vw: number, vh: number) {
  const F = Math.min(vh * 0.6, vw * 0.8, 620)
  const folderTop0 = (vh - F) / 2 + vh * 0.07
  const s0 = (F * 0.72) / vw
  const sMid = s0 * 1.3
  const topMid = Math.max(vh * 0.05, folderTop0 - sMid * vh * 0.55)
  return { F, folderTop0, s0, sMid, topMid }
}

type StagePose = {
  vw: number
  vh: number
  /** 0 = folder gone (below), 1 = folder in place. */
  present: number
  /** 0 = glass panel shut, 1 = folded open. */
  open: number
  /** 0 = sheet is a card, 1 = sheet is full screen (no radius, no chrome). */
  expand: number
  scale: number
  top: number
  /** How much the folder reacts to the pointer (only while it is resting). */
  idle: number
  /** Short springy squash after the lid snaps shut. */
  squash: number
  /** Opacity of the sheet's drop shadow while it is a card. */
  shadow: number
  /** Extra vertical offset of the whole folder + sheet (used while it waits below the intro). */
  shift?: number
  ptr: Pointer
}

function applyStage(r: StageRefs, pose: StagePose) {
  const { vw, vh, present, open, expand, scale, idle, squash, shadow, ptr } = pose
  const shift = pose.shift ?? 0
  const top = pose.top + shift
  const { F, folderTop0 } = geometry(vw, vh)
  const exit = 1 - present
  const folderY = shift + exit * vh * 0.6 + ptr.hover * F * 0.015 * idle
  const px = ptr.x * idle
  const py = ptr.y * idle
  const base = 1 - 0.14 * exit
  const folderTransform = `translate3d(calc(-50% + ${px * 10}px), ${folderY + py * 8}px, 0) scale(${base * (1 + squash * 0.6)}, ${base * (1 - squash)})`

  for (const el of [r.back.current, r.front.current]) {
    if (!el) continue
    el.style.top = `${folderTop0}px`
    el.style.width = `${F}px`
    el.style.height = `${F}px`
    el.style.transform = folderTransform
    el.style.opacity = `${present}`
  }
  if (r.frontImg.current) {
    r.frontImg.current.style.transform = `perspective(900px) rotateX(${-(open * 34 + ptr.hover * 9 * idle)}deg)`
  }
  if (r.glow.current) {
    r.glow.current.style.opacity = `${1 - exit * 0.8}`
    r.glow.current.style.top = `${folderTop0 + F * 0.15 + folderY}px`
  }

  const sheet = r.sheet.current
  const inner = r.inner.current
  if (!sheet || !inner) return
  inner.style.width = `${vw}px`
  inner.style.height = `${vh}px`
  sheet.style.width = `${vw}px`
  sheet.style.transform = `translate3d(${px * 16}px, ${top + py * 12}px, 0) scale(${scale})`

  // Keep the bottom of the sheet tucked behind the folder while the folder is on screen.
  if (exit < 1) {
    const tuck = folderTop0 + folderY + F * 0.8
    const visible = (tuck - top) / scale
    const y = vh - Math.max(0, vh - visible) * (1 - exit)
    sheet.style.clipPath = `polygon(-400px -400px, calc(100% + 400px) -400px, calc(100% + 400px) ${y}px, -400px ${y}px)`
  } else {
    sheet.style.clipPath = 'none'
  }

  const radius = 22 * (1 - expand)
  inner.style.borderRadius = `0 0 ${radius / scale}px ${radius / scale}px`
  inner.style.boxShadow = `0 ${40 / scale}px ${90 / scale}px ${-20 / scale}px rgba(0,0,0,${shadow * (1 - expand)})`

  if (r.bar.current) {
    const barT = clamp(expand / 0.92)
    r.bar.current.style.opacity = `${1 - barT}`
    r.bar.current.style.borderRadius = `${radius / scale}px ${radius / scale}px 0 0`
    r.bar.current.style.transform = `translateY(${-100 + barT * 40}%)`
  }
}

/** Scroll progress through a pinned track, lightly smoothed and snapped at both ends. */
function trackProgress(track: HTMLElement, vh: number, s: { p: number; init: boolean }) {
  const rect = track.getBoundingClientRect()
  const raw = clamp(-rect.top / (rect.height - vh))
  if (!s.init || raw >= 1 || raw <= 0) {
    s.p = raw
    s.init = true
  } else {
    s.p += (raw - s.p) * 0.2
    if (Math.abs(raw - s.p) < 0.0005) s.p = raw
  }
  return { raw, p: s.p }
}

function FolderStage({
  refs,
  sheet,
  children,
  className = '',
  background,
  ui,
  ...handlers
}: {
  refs: StageRefs
  sheet: ReactNode
  children?: ReactNode
  className?: string
  background?: string
  ui: ToneStyles
  onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerLeave?: () => void
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}) {
  return (
    <div ref={refs.stage} {...handlers} style={{ background }} className={`sticky top-0 h-screen overflow-hidden select-none ${className}`}>
      {/* Atmosphere */}
      <div className={`pointer-events-none absolute inset-0 ${ui.dots} [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]`} />
      <div ref={refs.glow} className="pointer-events-none absolute left-1/2 h-[60vh] w-[80vw] max-w-[900px] animate-omy-pulse">
        <div className={`size-full rounded-full ${ui.glow} blur-2xl`} />
      </div>

      {/* Folder back */}
      <div ref={refs.back} className="pointer-events-none absolute left-1/2 z-10 origin-bottom will-change-transform">
        <img alt="" src={a.folder} draggable={false} className="absolute inset-0 size-full" />
      </div>

      {/* The site, as a sheet */}
      <div ref={refs.sheet} className="absolute left-0 top-0 z-20 origin-top will-change-transform">
        <div ref={refs.bar} className="absolute inset-x-0 top-0 flex h-[44px] items-center gap-3 bg-[#eef1f4] px-5" style={{ transform: 'translateY(-100%)' }}>
          <span className="flex gap-2">
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
          </span>
          <span className="font-inter-medium mx-auto rounded-full bg-white px-6 py-1 text-[13px] text-[#808080]">omykra.com</span>
          <span className="w-[52px]" />
        </div>
        <div ref={refs.inner} className="relative overflow-hidden bg-white">
          <div className="pointer-events-none size-full">
            <LiveContext.Provider value={false}>{sheet}</LiveContext.Provider>
          </div>
        </div>
      </div>

      {/* Folder front (glass) */}
      <div ref={refs.front} className="pointer-events-none absolute left-1/2 z-30 origin-bottom will-change-transform">
        <img
          ref={refs.frontImg}
          alt=""
          src={a.folder}
          draggable={false}
          className="absolute inset-0 size-full origin-bottom"
          style={{ clipPath: FRONT_PANEL }}
        />
      </div>

      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Showcase                                                            */
/* ------------------------------------------------------------------ */

/**
 * Scroll-driven case study: the live OmyKra site sits in a glossy folder,
 * rises out and expands to its original 1440px design (scaled to the screen),
 * plays as the real interactive page, then — once the footer is reached —
 * sinks back into the folder, the lid snaps shut, and the page carries on
 * with whatever you render as `children`.
 */
export default function OmyKraShowcase({
  intro: introSlot,
  trackHeight = introSlot ? '420vh' : '340vh',
  outroHeight = '260vh',
  tone = 'dark',
  background,
  children,
}: {
  /**
   * Optional content shown above the folder on the first screen (e.g. your hero).
   * The folder waits just beneath it; scrolling lifts it away, then the folder opens.
   * Replaces the default "Case Study" title and scroll hint.
   */
  intro?: ReactNode
  /** Scroll distance of the opening animation. */
  trackHeight?: string
  /** Scroll distance of the closing animation. */
  outroHeight?: string
  /** `dark` (default) or `light` stage styling around the folder. */
  tone?: Tone
  /** Backdrop behind the folder; defaults to the tone's background. */
  background?: string
  /** Your page content that continues after the folder closes. */
  children?: ReactNode
}) {
  const introTrack = useRef<HTMLDivElement>(null)
  const outroTrack = useRef<HTMLDivElement>(null)
  const ui = TONES[tone]
  const bg = background ?? ui.background
  const shadowRef = useRef<number>(ui.shadow)
  shadowRef.current = ui.shadow
  const intro = useStageRefs()
  const outro = useStageRefs()
  const introCopy = useRef<HTMLDivElement>(null)
  const introSlotRef = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLDivElement>(null)
  const meta = useRef<HTMLDivElement>(null)
  const outroCopy = useRef<HTMLDivElement>(null)

  const [live, setLive] = useState(false)
  const [closing, setClosing] = useState(false)
  const state = useRef({ live: false, closing: false, introP: 0, outroP: 0, closedAt: -1, wasClosed: false })
  const pointer = useRef<Pointer>({ x: 0, y: 0, hover: 0, hoverTarget: 0 })
  const introSmooth = useRef({ p: 0, init: false })
  const outroSmooth = useRef({ p: 0, init: false })

  useEffect(() => {
    let raf = 0
    const frame = (time: number) => {
      raf = requestAnimationFrame(frame)
      const st = state.current
      const ptr = pointer.current
      ptr.hover += (ptr.hoverTarget - ptr.hover) * 0.12
      const vw = document.documentElement.clientWidth

      /* ---------- Intro: folder opens, site rises and fills the screen ---------- */
      const iTrack = introTrack.current
      const iStage = intro.stage.current
      if (iTrack && iStage) {
        const vh = iStage.offsetHeight
        const { p: rawP } = trackProgress(iTrack, vh, introSmooth.current)
        st.introP = rawP
        const isLive = rawP >= 0.9995
        if (isLive !== st.live) {
          st.live = isLive
          setLive(isLive)
        }
        // Skip the work while the stage is hidden under the live site.
        if (!isLive) {
          const g = geometry(vw, vh)
          const slot = introSlotRef.current
          const A = slot ? APPROACH : 0
          const approach = easeInOut(clamp(rawP / (A || 1)))
          // Progress of the opening itself, after the approach.
          const p = clamp((rawP - A) / (1 - A))
          let shift = 0
          if (slot) {
            const slotBottom = slot.offsetHeight
            // Highest point the miniature can reach while resting: hover lift, idle bob and pointer tilt included.
            const folderVisibleTop = g.folderTop0 + g.F * 0.07 - g.F * 0.09 - g.F * 0.012 - 8
            // Always start fully below the intro (never overlapping it), even if that is below the fold.
            const startShift = Math.max(0, slotBottom + 40 - folderVisibleTop)
            shift = startShift * (1 - approach)
            // The intro moves up at least as far as the folder does, so the gap between them never closes.
            const lift = (startShift + vh * 0.25) * approach
            slot.style.transform = `translate3d(0, ${-lift}px, 0)`
            slot.style.opacity = `${1 - clamp(approach * 1.4)}`
            slot.style.filter = `blur(${approach * 6}px)`
            slot.style.pointerEvents = approach > 0.3 ? 'none' : 'auto'
          }
          const idle = 1 - clamp(rawP / (A + 0.08))
          const e1 = easeInOut(clamp(p / RISE))
          const e2 = easeInOut(clamp((p - RISE) / (1 - RISE)))
          const exit = easeIn(clamp((p - 0.26) / 0.38))
          const bob = Math.sin(time / 650) * g.F * 0.012 * idle
          const lift = ptr.hover * g.F * 0.09 * idle
          const topStart = g.folderTop0 + g.F * 0.07 - bob - lift
          applyStage(intro, {
            vw,
            vh,
            present: 1 - exit,
            open: e1,
            expand: e2,
            scale: p < RISE ? lerp(g.s0, g.sMid, e1) : lerp(g.sMid, 1, e2),
            top: p < RISE ? lerp(topStart, g.topMid, e1) : lerp(g.topMid, 0, e2),
            idle,
            squash: 0,
            shadow: shadowRef.current,
            shift,
            ptr,
          })
          if (introCopy.current) {
            const t = clamp(p / 0.16)
            introCopy.current.style.opacity = `${1 - t}`
            introCopy.current.style.transform = `translate3d(-50%, ${-t * 60}px, 0)`
            introCopy.current.style.filter = `blur(${t * 8}px)`
          }
          if (hint.current) hint.current.style.opacity = `${1 - clamp(p / 0.06)}`
          if (meta.current) meta.current.style.opacity = `${1 - clamp(p / 0.3)}`
          iStage.style.cursor = idle > 0.5 ? 'pointer' : 'default'
        }
      }

      /* ---------- Outro: footer reached, site sinks back and the folder shuts ---------- */
      const oTrack = outroTrack.current
      const oStage = outro.stage.current
      if (oTrack && oStage) {
        const vh = oStage.offsetHeight
        const { raw, p: q } = trackProgress(oTrack, vh, outroSmooth.current)
        st.outroP = q
        const isClosing = raw > 0
        if (isClosing !== st.closing) {
          st.closing = isClosing
          setClosing(isClosing)
        }
        if (isClosing) {
          const g = geometry(vw, vh)
          const a1 = easeInOut(clamp(q / SHRINK))
          const b1 = easeInOut(clamp((q - SHRINK) / (SINK - SHRINK)))
          const open = 1 - easeInOut(clamp((q - 0.5) / 0.24))
          const idle = clamp((q - 0.8) / 0.12)
          const bob = Math.sin(time / 650) * g.F * 0.012 * idle
          const lift = ptr.hover * g.F * 0.09 * idle
          const topStart = g.folderTop0 + g.F * 0.07 - bob - lift

          // Springy "thud" the moment the lid shuts.
          const closed = open < 0.002
          if (closed && !st.wasClosed) st.closedAt = time
          if (!closed) st.closedAt = -1
          st.wasClosed = closed
          const dt = st.closedAt < 0 ? Infinity : time - st.closedAt
          const squash = dt === Infinity ? 0 : Math.exp(-dt / 170) * Math.sin(dt / 55) * 0.05

          applyStage(outro, {
            vw,
            vh,
            present: easeOut(clamp((q - 0.1) / 0.36)),
            open,
            expand: 1 - a1,
            scale: q < SHRINK ? lerp(1, g.sMid, a1) : lerp(g.sMid, g.s0, b1),
            top: q < SHRINK ? lerp(0, g.topMid, a1) : lerp(g.topMid, topStart, b1),
            idle,
            squash,
            shadow: shadowRef.current,
            ptr,
          })
          if (outroCopy.current) {
            const t = easeOut(clamp((q - 0.76) / 0.14))
            outroCopy.current.style.opacity = `${t}`
            outroCopy.current.style.transform = `translate3d(-50%, ${(1 - t) * 24}px, 0)`
            outroCopy.current.style.filter = `blur(${(1 - t) * 8}px)`
          }
          oStage.style.cursor = idle > 0.5 ? 'pointer' : 'default'
        }
      }
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // Refs are stable for the component's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ptr = pointer.current
    ptr.x = e.clientX / window.innerWidth - 0.5
    ptr.y = e.clientY / window.innerHeight - 0.5
    ptr.hoverTarget = e.pointerType === 'mouse' ? 1 : 0
  }
  const onPointerLeave = () => {
    const ptr = pointer.current
    ptr.x = 0
    ptr.y = 0
    ptr.hoverTarget = 0
  }
  const scrollToSiteTop = () => {
    const track = introTrack.current
    const stage = intro.stage.current
    if (!track || !stage) return
    const end = track.getBoundingClientRect().top + window.scrollY + track.offsetHeight - stage.offsetHeight
    window.scrollTo({ top: end, behavior: 'smooth' })
  }
  const openFolder = (e?: React.MouseEvent) => {
    if ((e?.target as Element | null)?.closest('[data-omy-intro]')) return
    if (state.current.introP <= 0.08) scrollToSiteTop()
  }
  const reopenFolder = () => {
    if (state.current.outroP >= 0.85) scrollToSiteTop()
  }

  return (
    <div className="omy-root relative" style={{ background: bg }}>
      {/* Opening: scroll track with the pinned stage */}
      <div ref={introTrack} className="relative" style={{ height: trackHeight }}>
        <FolderStage
          refs={intro}
          sheet={<OmyKraSite variant="preview" />}
          ui={ui}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onClick={openFolder}
        >
          {introSlot ? (
            <div ref={introSlotRef} data-omy-intro className="absolute inset-x-0 top-0 z-40 will-change-transform">
              {introSlot}
            </div>
          ) : (
          <>
          <div ref={introCopy} className="pointer-events-none absolute left-1/2 top-[7vh] z-40 w-full max-w-xl px-6 text-center">
            <p className={`font-inter-medium text-[12px] uppercase tracking-[0.32em] ${ui.kicker}`}>Case Study · Web Design</p>
            <h1 className={`font-spectral mt-3 text-[38px] leading-[1.05] ${ui.title} md:text-[56px]`}>
              OmyKra<span className={ui.accent}>.</span>
            </h1>
            <p className={`font-inter mt-3 text-[15px] leading-[24px] ${ui.body} md:text-[17px]`}>AI coworker for customer experience teams</p>
          </div>

          <div ref={hint} className="pointer-events-none absolute bottom-[4vh] left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-3">
            <div className={`flex h-9 w-[22px] justify-center rounded-full border pt-2 ${ui.hintBorder}`}>
              <span className={`h-2 w-[3px] animate-omy-bob rounded-full ${ui.hintDot}`} />
            </div>
            <span className={`font-inter-medium text-[11px] uppercase tracking-[0.3em] ${ui.hintText}`}>Scroll to open</span>
          </div>

          <div ref={meta} className="pointer-events-none absolute inset-x-0 bottom-[4vh] z-40 hidden justify-between px-10 md:flex">
            <span className={`font-inter-medium text-[12px] uppercase tracking-[0.25em] ${ui.meta}`}>Brand · Web · Product</span>
            <span className={`font-inter-medium text-[12px] uppercase tracking-[0.25em] ${ui.meta}`}>2026</span>
          </div>
          </>
          )}
        </FolderStage>
      </div>

      {/* The real, interactive site. It sits exactly over the final frame of the opening stage. */}
      <div className="relative z-10 -mt-[100vh]" style={{ visibility: live ? 'visible' : 'hidden' }} aria-hidden={!live}>
        <LiveContext.Provider value={live}>
          <OmyKraSite />
        </LiveContext.Provider>
      </div>

      {/* Closing: overlaps the last screen of the site, so it takes over exactly when the footer is fully in view. */}
      <div ref={outroTrack} className="pointer-events-none relative z-[60] -mt-[100vh]" style={{ height: outroHeight }}>
        <FolderStage
          refs={outro}
          sheet={<OmyKraSite variant="tail" />}
          ui={ui}
          background={bg}
          className={closing ? "pointer-events-auto" : "invisible"}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onClick={reopenFolder}
        >
          <div ref={outroCopy} className="pointer-events-none absolute left-1/2 top-[7vh] z-40 w-full max-w-xl px-6 text-center opacity-0">
            <p className={`font-inter-medium text-[12px] uppercase tracking-[0.32em] ${ui.kicker}`}>Case study complete</p>
            <h2 className={`font-spectral mt-3 text-[34px] leading-[1.05] ${ui.title} md:text-[48px]`}>
              That was OmyKra<span className={ui.accent}>.</span>
            </h2>
            <p className={`font-inter mt-3 text-[15px] leading-[24px] ${ui.body} md:text-[17px]`}>Click the folder to open it again, or keep scrolling.</p>
          </div>
        </FolderStage>
      </div>

      {children}
    </div>
  )
}
