import { useContext, useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode, type RefObject } from 'react'
import { a } from './assets'
import { CountUp, DesignFrame, LiveContext, Reveal, StaticContext, useInView, zoomOf } from './motion'

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

const container = 'mx-auto w-full max-w-[1280px] px-5 @3xl:px-8 @7xl:px-0'
const h2 = 'font-spectral text-[34px] leading-[1.15] text-black @3xl:text-[48px] @3xl:leading-[normal]'
const lead = 'font-inter text-[17px] leading-[28px] text-[#808080] @3xl:text-[20px] @3xl:leading-[32px]'

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function Arrow({ src }: { src: string }) {
  return (
    <span className="relative flex size-[24px] shrink-0 items-center justify-center overflow-hidden">
      <img
        alt=""
        src={src}
        className="block size-[24px] max-w-none rotate-90 transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-y-[-130%]"
      />
      <img
        alt=""
        src={src}
        className="absolute block size-[24px] max-w-none translate-y-[130%] rotate-90 transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-y-0"
      />
    </span>
  )
}

type ButtonTone = 'forest' | 'lime'

function PrimaryButton({ tone = 'forest', children, className = '', onClick }: { tone?: ButtonTone; children: ReactNode; className?: string; onClick?: () => void }) {
  const tones: Record<ButtonTone, string> = {
    forest: 'bg-omy-forest text-white hover:shadow-[0_14px_30px_-10px_rgba(8,71,52,0.65)]',
    lime: 'bg-omy-lime text-omy-forest hover:shadow-[0_14px_30px_-10px_rgba(206,241,123,0.8)]',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative isolate flex h-[56px] shrink-0 cursor-pointer items-center justify-center gap-[10px] overflow-hidden rounded-[48px] p-[20px] transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${tones[tone]} ${className}`}
    >
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 -z-10 w-1/3 -skew-x-12 bg-white/25 opacity-0 transition-all duration-700 ease-out group-hover:left-[120%] group-hover:opacity-100" />
      <Arrow src={tone === 'forest' ? a.arrowWhite : a.arrowForest} />
      <span className="font-inter-semibold whitespace-nowrap text-[16px] leading-[24px]">{children}</span>
    </button>
  )
}

/** Pulls its child gently toward the pointer. */
function Magnetic({ children, strength = 0.25 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    el.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * strength) / zoomOf(el)}px, ${((e.clientY - r.top - r.height / 2) * strength) / zoomOf(el)}px)`
  }
  const reset = () => {
    if (ref.current) ref.current.style.transform = ''
  }
  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={reset} className="transition-transform duration-300 ease-out">
      {children}
    </div>
  )
}

/** Card with a soft green spotlight that follows the pointer. */
function Spotlight({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--sx', `${(e.clientX - r.left) / zoomOf(el)}px`)
    el.style.setProperty('--sy', `${(e.clientY - r.top) / zoomOf(el)}px`)
  }
  return (
    <div ref={ref} onPointerMove={onMove} className={`group relative overflow-hidden ${className}`} style={style}>
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(260px_circle_at_var(--sx)_var(--sy),rgba(0,171,69,0.14),transparent_70%)]" />
      {children}
    </div>
  )
}

function SectionHeading({ title, body, className = '' }: { title: ReactNode; body: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto flex w-full max-w-[1062px] flex-col items-center gap-[24px] px-5 text-center @3xl:px-8 @7xl:px-0 ${className}`}>
      <Reveal as="h2" className={`w-full ${h2}`}>
        {title}
      </Reveal>
      <Reveal as="p" delay={120} className={`w-full ${lead}`}>
        {body}
      </Reveal>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Nav + Hero                                                          */
/* ------------------------------------------------------------------ */

function Nav({ forceStuck = false }: { forceStuck?: boolean }) {
  const live = useContext(LiveContext)
  const ref = useRef<HTMLElement>(null)
  const [scrolledStuck, setStuck] = useState(false)
  const stuck = forceStuck || scrolledStuck

  useEffect(() => {
    if (!live) return
    const onScroll = () => setStuck((ref.current?.getBoundingClientRect().top ?? 1) <= 0.5)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [live])

  const links: [string, string][] = [
    ['Product', 'omy-coworker'],
    ['Blog', 'omy-faq'],
    ['About Us', 'omy-founder'],
  ]

  return (
    <header
      ref={ref}
      className={`sticky top-0 z-40 w-full transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
        stuck ? 'bg-white/80 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.25)] backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className={`${container} flex items-center justify-between transition-[padding] duration-500 ${stuck ? 'py-2' : 'py-0'}`}>
        <a
          href="#omy-top"
          onClick={(e) => {
            e.preventDefault()
            scrollToId('omy-top')
          }}
          className={`relative block shrink-0 transition-all duration-500 ${stuck ? 'h-[56px] w-[176px]' : 'h-[56px] w-[176px] @3xl:h-[80px] @3xl:w-[252px]'}`}
        >
          <img alt="OmyKra" src={a.logo} className="absolute inset-0 size-full max-w-none object-cover" />
        </a>
        <div className="hidden items-center gap-[46px] @5xl:flex">
          {links.map(([label, id]) => (
            <button
              key={label}
              type="button"
              onClick={() => scrollToId(id)}
              className="group relative flex h-[56px] cursor-pointer items-center justify-center p-[10px] font-inter text-[18px] leading-[30px] text-black"
            >
              {label}
              <span className="absolute inset-x-[10px] bottom-[12px] h-[2px] origin-right scale-x-0 rounded-full bg-omy-green transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:origin-left group-hover:scale-x-100" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-[16px]">
          <PrimaryButton className="hidden @min-[40rem]:flex" onClick={() => scrollToId('omy-pricing')}>
            Book a Walkthrough
          </PrimaryButton>
          <button
            type="button"
            className="flex h-[48px] cursor-pointer items-center justify-center rounded-[48px] border border-solid border-omy-forest px-[20px] font-inter-semibold text-[16px] leading-[24px] text-omy-forest transition-colors duration-300 hover:bg-omy-forest hover:text-white @min-[40rem]:h-[56px] @min-[40rem]:p-[20px]"
          >
            Sign In
          </button>
        </div>
      </nav>
    </header>
  )
}

function PatternTiles({ offsets }: { offsets: string[] }) {
  return (
    <>
      {offsets.map((left) => (
        <div key={left} className="absolute top-1/2 h-[680px] w-[686px] -translate-x-1/2 -translate-y-1/2" style={{ left }}>
          <img alt="" src={a.heroPattern} className="pointer-events-none absolute inset-0 size-full max-w-none animate-omy-drift object-cover opacity-10" />
        </div>
      ))}
    </>
  )
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--hx', `${(e.clientX - r.left) / zoomOf(el)}px`)
    el.style.setProperty('--hy', `${(e.clientY - r.top) / zoomOf(el)}px`)
  }

  return (
    <div className={container}>
      <div
        ref={ref}
        onPointerMove={onMove}
        className="group relative flex min-h-[560px] items-center overflow-hidden rounded-[32px] bg-omy-green py-16 @3xl:h-[680px] @3xl:rounded-[64px] @3xl:py-0"
      >
        <PatternTiles offsets={['calc(50% - 686px)', '50%', 'calc(50% + 686px)']} />
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 [background:radial-gradient(520px_circle_at_var(--hx)_var(--hy),rgba(206,241,123,0.28),transparent_65%)]" />
        <div className="relative mx-auto flex w-full max-w-[1280px] flex-col items-center gap-[40px] @3xl:gap-[48px]">
          <div className="flex w-full flex-col items-center gap-[24px] px-6 text-center text-white @3xl:px-[40px]">
            <h1 className="font-spectral text-[40px] leading-[46px] tracking-[-0.8px] @3xl:text-[72px] @3xl:leading-[80px] @3xl:tracking-[-1.44px]">
              Stop Losing Customers to Inconsistent Customer Experience.
            </h1>
            <p className="font-inter text-[17px] leading-[28px] @3xl:text-[20px] @3xl:leading-[32px]">
              Whether it is a new hire’s first day or your busiest support queue, OmyKra equips every agent with the knowledge, guidance, and communication standards to deliver the customer experience your business is known for.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-[16px] @3xl:gap-[24px]">
            <Magnetic>
              <PrimaryButton tone="lime" onClick={() => scrollToId('omy-pricing')}>
                Book a Walkthrough
              </PrimaryButton>
            </Magnetic>
            <Magnetic>
              <button
                type="button"
                onClick={() => scrollToId('omy-coworker')}
                className="group flex h-[56px] cursor-pointer items-center justify-center gap-[10px] rounded-[48px] border-2 border-solid border-white p-[20px] transition-colors duration-300 hover:bg-white/15"
              >
                <span className="relative flex size-[24px] items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-white/40 opacity-0 group-hover:animate-ping group-hover:opacity-100" />
                  <img alt="" src={a.play} className="relative block size-[24px] max-w-none transition-transform duration-300 group-hover:scale-110" />
                </span>
                <span className="font-inter-semibold whitespace-nowrap text-[16px] leading-[24px] text-white">See How It Works</span>
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Section 2 — Poor CX                                                  */
/* ------------------------------------------------------------------ */

const personaCards: { title: string; body: string; bg: string; icon: ReactNode }[] = [
  {
    title: 'New Hire',
    body: 'Still learning the company’s communication standards and relying heavily on teammates for guidance.',
    bg: 'bg-[rgba(0,171,69,0.1)]',
    icon: (
      <div className="absolute left-1/2 top-1/2 size-[24px] -translate-x-1/2 -translate-y-1/2">
        <img alt="" src={a.supportAgent} className="absolute inset-0 block size-full max-w-none" />
      </div>
    ),
  },
  {
    title: 'Busy Agent',
    body: 'Under pressure to reply quickly, increasing the risk of inconsistent communication.',
    bg: 'bg-[rgba(245,158,11,0.1)]',
    icon: (
      <div className="absolute left-[12px] top-[12px] size-[24px] overflow-clip">
        <div className="absolute inset-[16.67%]">
          <img alt="" src={a.notifications} className="absolute inset-0 block size-full max-w-none" />
        </div>
      </div>
    ),
  },
  {
    title: 'Experienced Agent',
    body: 'Deliver great customer experiences, but their knowledge often stays with them.',
    bg: 'bg-[rgba(59,130,246,0.1)]',
    icon: (
      <div className="absolute left-[12px] top-[12px] size-[24px] overflow-clip">
        <div className="absolute inset-[6.25%_9.55%_6.25%_8.21%]">
          <div className="absolute inset-[-4.76%_-5.05%_-4.76%_-5.07%]">
            <img alt="" src={a.support7} className="block size-full max-w-none" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'CX Manager',
    body: 'Constantly answering repeat questions instead of focusing on strategic improvements.',
    bg: 'bg-[rgba(239,68,68,0.1)]',
    icon: (
      <div className="absolute left-[12px] top-[12px] size-[24px]">
        <img alt="" src={a.supervisor} className="absolute inset-0 block size-full max-w-none" />
      </div>
    ),
  },
]

function VerticalDash({ left, top, src, drawn, delay }: { left: string; top: number; src: string; drawn: boolean; delay: number }) {
  return (
    <div
      className="absolute flex h-[30px] w-0 origin-top items-center justify-center transition-transform duration-500 ease-out"
      style={{ left, top, transform: drawn ? 'scaleY(1)' : 'scaleY(0)', transitionDelay: `${delay}ms` }}
    >
      <div className="flex-none rotate-90">
        <div className="relative h-0 w-[30px]">
          <div className="absolute inset-[-2px_0_0_0]">
            <img alt="" src={src} className="block size-full max-w-none" />
          </div>
        </div>
      </div>
    </div>
  )
}

function PoorCX() {
  const [diagramRef, drawn] = useInView<HTMLDivElement>({ threshold: 0.4 })
  return (
    <section className="flex w-full flex-col items-center gap-[48px] @3xl:gap-[60px]">
      <SectionHeading
        title={
          <>
            That Poor Customer Experience Could Have Been <span className="text-omy-green">Prevented.</span>
          </>
        }
        body="Customer experience shouldn’t depend on who replies, how experienced they are, or whether they’re having a good day. Yet that’s exactly what happens in most support teams."
      />
      <div className={container}>
        <div className="grid grid-cols-1 gap-6 @min-[40rem]:grid-cols-2 @5xl:grid-cols-4">
          {personaCards.map((c, i) => (
            <Reveal key={c.title} delay={i * 110} y={40}>
              <div className="group flex h-full min-h-[260px] flex-col gap-[24px] overflow-clip rounded-[16px] bg-white px-[30px] py-[40px] shadow-omy-card transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-2 hover:shadow-[-7px_34px_60px_0px_rgba(0,0,0,0.14)] @5xl:h-[300px]">
                <div className={`relative size-[48px] shrink-0 overflow-clip rounded-[8px] transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 ${c.bg}`}>{c.icon}</div>
                <div className="flex flex-1 flex-col justify-between gap-4 text-black">
                  <p className="font-spectral-medium text-[28px] leading-[36px]">{c.title}</p>
                  <p className="font-inter-medium text-[14px] leading-[22px]">{c.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div ref={diagramRef} className="relative hidden h-[60px] @5xl:block">
          {['11.797%', '37.266%', '62.734%', '88.203%'].map((left, i) => (
            <VerticalDash key={left} left={left} top={0} src={i === 2 ? a.dashShortAlt : a.dashShort} drawn={drawn} delay={i * 90} />
          ))}
          <div
            className="absolute left-[11.797%] top-[30px] h-0 w-[76.406%] transition-[clip-path] duration-700 ease-out"
            style={{ clipPath: drawn ? 'inset(-4px 0 -4px 0)' : 'inset(-4px 50% -4px 50%)', transitionDelay: '380ms' }}
          >
            <div className="absolute inset-[-2px_0_0_0]">
              <img alt="" src={a.dashLong} className="block size-full max-w-none" />
            </div>
          </div>
          <VerticalDash left="50.39%" top={30} src={a.dashShort} drawn={drawn} delay={900} />
        </div>

        <Reveal delay={drawn ? 1000 : 300} y={24} scale={0.96} className="mx-auto mt-8 w-full max-w-[676px] @5xl:mt-0">
          <div className="flex flex-col items-start gap-4 overflow-clip rounded-[24px] bg-white px-[28px] py-[26px] shadow-omy-card transition-shadow duration-500 hover:shadow-[-7px_34px_60px_0px_rgba(0,0,0,0.14)] @min-[40rem]:flex-row @min-[40rem]:items-center @min-[40rem]:justify-between @3xl:px-[50px] @3xl:py-[30px]">
            <div className="flex items-center gap-[8px]">
              <div className="relative size-[64px] shrink-0 rounded-[60px]">
                <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[60px]">
                  <div className="absolute inset-0 rounded-[60px] bg-omy-green" />
                  <div className="absolute inset-0 overflow-hidden rounded-[60px]">
                    <img alt="" src={a.userPic} className="absolute left-0 top-[-9.37%] h-[150%] w-full max-w-none" />
                  </div>
                </div>
                <span className="absolute bottom-0.5 right-0.5 size-3 rounded-full border-2 border-white bg-omy-lime" />
              </div>
              <p className="font-inter-medium whitespace-nowrap text-[14px] leading-[22px] text-omy-green">Sarah T.</p>
            </div>
            <div className="flex flex-col text-black @min-[40rem]:w-[292px] @min-[40rem]:items-end @min-[40rem]:text-right">
              <p className="font-spectral-medium w-full text-[28px] leading-[36px]">One Customer</p>
              <p className="font-inter w-full text-[16px] leading-[28px]">Four completely different experiences.</p>
            </div>
          </div>
        </Reveal>
      </div>
      <Reveal as="p" className={`${container} font-spectral-medium text-center text-[20px] leading-[30px] text-black @3xl:text-[24px] @3xl:leading-[32px]`}>
        Every escalation, bad review and missed CSAT target have one thing in common. The quality of the experience depended on who answered the conversation. One customer, different experience depending on who attends to them.
      </Reveal>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Section 3 — AI Coworker                                              */
/* ------------------------------------------------------------------ */

const steps = [
  {
    title: 'Rewrite',
    body: 'Improve tone, clarity, grammar, and empathy in seconds',
    icon: (
      <div className="relative size-[24px] shrink-0 overflow-clip">
        <div className="absolute inset-[4.17%_4.18%_8.33%_8.33%]">
          <div className="absolute inset-[-4.76%]">
            <img alt="" src={a.pen} className="block size-full max-w-none" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Get Help',
    body: 'Search company knowledge, policies, past resolutions, and more.',
    icon: (
      <div className="relative size-[24px] shrink-0">
        <img alt="" src={a.help} className="absolute inset-0 block size-full max-w-none" />
      </div>
    ),
  },
  {
    title: 'Insert',
    body: 'The improved reply appears instantly in the agent’s message.',
    icon: (
      <div className="relative size-[24px] shrink-0">
        <img alt="" src={a.insert} className="absolute inset-0 block size-full max-w-none" />
      </div>
    ),
  },
]

const STEP_MS = 4200

function Coworker() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.35 })
  const [active, setActive] = useState(0)
  const [cycle, setCycle] = useState(0)
  const shotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => {
      setActive((s) => (s + 1) % steps.length)
      setCycle((c) => c + 1)
    }, STEP_MS)
    return () => clearTimeout(t)
  }, [inView, active, cycle])

  const select = (i: number) => {
    setActive(i)
    setCycle((c) => c + 1)
  }

  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    const el = shotRef.current
    if (!el || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(1200px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.01)`
  }

  return (
    <section id="omy-coworker" className="flex w-full scroll-mt-24 flex-col items-center gap-[48px] @3xl:gap-[60px]">
      <SectionHeading
        title={
          <>
            Meet Your <span className="text-omy-green">AI Coworker.</span>
          </>
        }
        body="Omykra supports your agents while they are replying, helping them find the right answer and communicate it with confidence regardless of who is behind it, how long they have been there and how they are feeling at the moment."
      />
      <div ref={ref} className={`${container} flex flex-col items-center gap-10 @5xl:flex-row @5xl:gap-[64px]`}>
        <Reveal x={-40} y={0} className="w-full @5xl:w-[720px] @5xl:shrink-0">
          <div
            ref={shotRef}
            onPointerMove={tilt}
            onPointerLeave={() => shotRef.current && (shotRef.current.style.transform = '')}
            className="relative aspect-[720/443] w-full transition-transform duration-500 ease-out"
          >
            <img alt="OmyKra product interface" src={a.productShot} className="pointer-events-none absolute inset-0 size-full max-w-none object-cover" />
          </div>
        </Reveal>
        <div className="flex w-full flex-col gap-6 @5xl:h-[340px] @5xl:w-[411px] @5xl:shrink-0 @5xl:justify-between @5xl:gap-0">
          {steps.map((s, i) => {
            const on = i === active
            return (
              <Reveal key={s.title} delay={150 + i * 120} x={30} y={0}>
                <button type="button" onClick={() => select(i)} className="group flex w-full cursor-pointer items-center justify-between gap-6 text-left">
                  <div className="relative h-[100px] w-[4px] shrink-0 overflow-hidden rounded-[10px] bg-[rgba(8,71,52,0.1)]">
                    <div
                      key={on ? `on-${cycle}` : 'off'}
                      className="absolute inset-x-0 top-0 rounded-[10px] bg-omy-forest"
                      style={{
                        height: on ? '100%' : '0%',
                        animation: on && inView ? `omy-step-fill ${STEP_MS}ms linear forwards` : undefined,
                      }}
                    />
                  </div>
                  <div className="flex flex-1 items-center gap-[24px] @5xl:w-[340px] @5xl:flex-none">
                    <div
                      className={`flex size-[48px] shrink-0 items-center justify-center rounded-[12px] bg-omy-green transition-transform duration-500 ${
                        on ? 'scale-105 shadow-[0_10px_24px_-8px_rgba(0,171,69,0.7)]' : 'group-hover:scale-105'
                      }`}
                    >
                      {s.icon}
                    </div>
                    <div className="flex flex-1 flex-col gap-[4px]">
                      <p className={`font-inter-semibold text-[22px] leading-[28px] transition-colors duration-500 @3xl:text-[24px] ${on ? 'text-black' : 'text-[#808080] group-hover:text-[#4d4d4d]'}`}>{s.title}</p>
                      <p className={`font-inter-medium text-[14px] leading-[22px] transition-colors duration-500 ${on ? 'text-[#808080]' : 'text-[#b3b3b3]'}`}>{s.body}</p>
                    </div>
                  </div>
                </button>
              </Reveal>
            )
          })}
        </div>
      </div>
      <style>{`@keyframes omy-step-fill { from { height: 0% } to { height: 100% } }`}</style>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Section 4 — Consistency                                              */
/* ------------------------------------------------------------------ */

const teamPoints = [
  'Handle hundreds or thousands of customer conversations every month',
  'Want every agent to deliver consistent customer experiences',
  'Want to onboard new hires faster and give them the confidence as soon as possible',
  'Are scaling customer support without sacrificing quality',
  'See customer experience as a competitive advantage',
]

function Consistency() {
  return (
    <section className="flex w-full flex-col items-center gap-[48px] @3xl:gap-[60px]">
      <SectionHeading
        title="Built For Teams That Care About Consistency."
        body="Whether you’re onboarding new agents, scaling rapidly or supporting thousands of conservations every month, OmyKra helps your team deliver the same standard every time."
      />
      <div className={`${container} grid grid-cols-1 gap-[16px] @3xl:grid-cols-2 @5xl:grid-cols-3 @5xl:gap-x-[10px] @5xl:gap-y-[24px]`}>
        {teamPoints.map((text, i) => (
          <Reveal key={text} delay={(i % 3) * 110} y={36}>
            <Spotlight className={`flex flex-col justify-center gap-[24px] rounded-[16px] bg-[rgba(0,171,69,0.05)] p-[32px] transition-all duration-500 hover:-translate-y-1 hover:bg-[rgba(0,171,69,0.09)] @3xl:p-[40px] ${i < 3 ? '@5xl:h-[272px]' : '@5xl:h-[236px]'} @5xl:w-[420px]`}>
              <div className="relative flex flex-col gap-[16px]">
                <p className="font-spectral-medium text-[24px] leading-[32px] text-omy-green transition-transform duration-500 group-hover:translate-x-1.5">0{i + 1}</p>
                <p className="font-spectral-medium text-[24px] leading-[32px] text-black @3xl:text-[28px] @3xl:leading-[36px]">{text}</p>
              </div>
            </Spotlight>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Section 5 — Integrations marquee                                     */
/* ------------------------------------------------------------------ */

const logos: { name: string; box: string; src: string; img: string; crop?: boolean }[] = [
  { name: 'Zendesk', box: 'h-[31px] w-[120px]', src: a.zendesk, img: 'inset-0 size-full object-cover' },
  { name: 'Knowledge base', box: 'h-[62px] w-[120px]', src: a.knowledgeBase, img: 'left-0 top-0 size-full', crop: true },
  { name: 'Intercom', box: 'h-[30px] w-[110px]', src: a.intercom, img: 'h-[400%] left-[-4.55%] top-[-150%] w-[109.09%]', crop: true },
  { name: 'Gmail', box: 'h-[27px] w-[110px]', src: a.gmail, img: 'h-[444.44%] left-[-4.55%] top-[-174.07%] w-[109.09%]', crop: true },
  { name: 'PDF', box: 'size-[60px]', src: a.pdf, img: 'inset-0 size-full object-cover' },
  { name: 'Help center', box: 'h-[43px] w-[120px]', src: a.helpCenter, img: 'inset-0 size-full object-cover' },
  { name: 'Freshdesk', box: 'h-[37px] w-[120px]', src: a.freshdesk, img: 'h-[324.32%] left-0 top-[-110.81%] w-full', crop: true },
  { name: 'HubSpot', box: 'h-[49px] w-[120px]', src: a.hubspot, img: 'h-[137.29%] left-0 top-[-18.65%] w-full', crop: true },
  { name: 'Salesforce', box: 'h-[25px] w-[120px]', src: a.salesforce, img: 'h-[480%] left-0 top-[-192%] w-full', crop: true },
  { name: 'API', box: 'h-[45px] w-[56px]', src: a.api, img: 'h-[133.33%] left-[-3.57%] top-[-17.78%] w-[107.14%]', crop: true },
]

function Integrations() {
  return (
    <section className="flex w-full flex-col items-center gap-[48px] @3xl:gap-[60px]">
      <SectionHeading
        title="Built Into The Tools You Already Use."
        body="OmyKra works alongside the platforms your team already relies on, so agents stay in their existing workflow while receiving guidance exactly when they need it."
      />
      <Reveal className={container}>
        <div className="group/marquee relative h-[62px] w-full overflow-clip [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div className="absolute left-0 top-0 flex w-max animate-omy-marquee items-center group-hover/marquee:[animation-play-state:paused]">
            {[0, 1].map((set) => (
              <div key={set} className="flex items-center gap-[60px] pr-[60px]" aria-hidden={set === 1}>
                {logos.map((l) => (
                  <div key={l.name} title={l.name} className={`relative shrink-0 grayscale-[60%] opacity-80 transition-all duration-300 hover:scale-110 hover:opacity-100 hover:grayscale-0 ${l.box}`}>
                    {l.crop ? (
                      <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <img alt={l.name} src={l.src} className={`absolute max-w-none ${l.img}`} />
                      </div>
                    ) : (
                      <img alt={l.name} src={l.src} className={`pointer-events-none absolute max-w-none ${l.img}`} />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Section 6 — With / Without                                           */
/* ------------------------------------------------------------------ */

const without = ['Different replies', 'Long onboarding', 'Knowledge trapped in people', 'Repeat supervisor questions', 'Slower replies', 'Customer frustration']
const withList = ['Consistent replies', 'Faster Onboarding', 'Shared knowledge', 'Higher confidence', 'AI guidance', 'Better customer experience']

function Comparison() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.25 })
  const item = (i: number, base: number): CSSProperties => ({
    opacity: inView ? 1 : 0,
    transform: inView ? 'none' : 'translateX(-14px)',
    transition: `opacity 600ms ease ${base + i * 90}ms, transform 600ms cubic-bezier(.2,.8,.2,1) ${base + i * 90}ms`,
  })

  return (
    <section className={`${container} flex flex-col gap-12 @5xl:flex-row @5xl:items-center @5xl:justify-between`}>
      <div className="flex w-full flex-col items-start gap-[40px] @5xl:w-[435px] @5xl:gap-[48px]">
        <div className="flex w-full flex-col gap-[24px]">
          <Reveal as="h2" className={`w-full ${h2}`}>
            CX Without <span className="text-omy-green">OmyKra?</span>
          </Reveal>
          <Reveal as="p" delay={120} className={`w-full ${lead}`}>
            The difference isn’t how hard your team works. It’s whether every agent has the same support when helping customers.
          </Reveal>
        </div>
        <Reveal delay={220}>
          <PrimaryButton onClick={() => scrollToId('omy-pricing')}>Book a Walkthrough</PrimaryButton>
        </Reveal>
      </div>
      <div ref={ref} className="flex w-full flex-col items-center gap-6 @min-[40rem]:flex-row @min-[40rem]:items-stretch @min-[40rem]:justify-between @5xl:w-[737px]">
        <Reveal y={40} className="w-full @min-[40rem]:w-[350px]">
          <div className="flex h-full flex-col items-center gap-[40px] overflow-clip rounded-[24px] bg-[#f3f3f3] p-[40px] shadow-omy-card transition-all duration-500 hover:-translate-y-1 @5xl:p-[60px]">
            <p className="font-spectral w-full text-center text-[32px] leading-[40px] text-black @3xl:text-[36px] @3xl:leading-[44px]">Without OmyKra</p>
            <div className="flex w-full flex-col gap-[24px]">
              {without.map((t, i) => (
                <div key={t} className="flex items-center gap-[24px] @5xl:gap-[36px]" style={item(i, 200)}>
                  <img alt="" src={a.xFilled} className="block size-[24px] shrink-0 max-w-none" />
                  <p className="font-inter flex-1 text-[18px] leading-[28px] text-black @3xl:text-[20px] @3xl:leading-[32px]">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal y={60} delay={150} className="w-full @min-[40rem]:w-[354px]">
          <div className="animate-omy-float">
            <div
              className="relative flex flex-col items-center gap-[40px] overflow-clip rounded-[24px] p-[40px] shadow-[-7px_24px_48px_0px_rgba(0,171,69,0.3)] transition-transform duration-500 hover:scale-[1.02] @5xl:h-[688px] @5xl:p-[60px]"
              style={{ backgroundImage: 'linear-gradient(112.79819741498527deg, rgb(0, 171, 69) 15.804%, rgb(8, 71, 52) 102.68%)' }}
            >
              <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-omy-lime/20 blur-3xl" />
              <div className="font-spectral relative w-full text-center text-[32px] leading-[40px] text-white @3xl:text-[36px] @3xl:leading-[44px]">
                <p>With</p>
                <p>OmyKra</p>
              </div>
              <div className="relative flex w-full flex-col gap-[20px]">
                {withList.map((t, i) => (
                  <div key={t} className="flex items-center gap-[24px] @5xl:gap-[36px]" style={item(i, 450)}>
                    <span
                      className="block size-[24px] shrink-0 transition-transform duration-500"
                      style={{ transform: inView ? 'scale(1)' : 'scale(0)', transitionDelay: `${550 + i * 90}ms`, transitionTimingFunction: 'cubic-bezier(.34,1.56,.64,1)' }}
                    >
                      <img alt="" src={a.check} className="block size-[24px] max-w-none" />
                    </span>
                    <p className="font-inter flex-1 text-[18px] leading-[28px] text-white @3xl:text-[20px] @3xl:leading-[32px]">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Section 7 — Security                                                 */
/* ------------------------------------------------------------------ */

const security: { title: string; body: string; icon: ReactNode }[] = [
  { title: 'Enterprise Security', body: 'Modern security purchase.', icon: <img alt="" src={a.shield} className="absolute inset-0 block size-full max-w-none" /> },
  { title: 'Human Review', body: 'Nothing is ever sent automatically.', icon: <img alt="" src={a.eye} className="absolute inset-0 block size-full max-w-none" /> },
  {
    title: 'Company Knowledge',
    body: 'Only uses information you’ve approved.',
    icon: (
      <div className="absolute inset-[8.33%_12.5%]">
        <img alt="" src={a.database} className="absolute inset-0 block size-full max-w-none" />
      </div>
    ),
  },
  { title: 'GDPR Ready', body: 'Privacy-first architecture.', icon: <img alt="" src={a.documentIcon} className="absolute inset-0 block size-full max-w-none" /> },
]

function Security() {
  return (
    <section className="flex w-full flex-col items-center gap-[48px] @3xl:gap-[60px]">
      <SectionHeading title="Secured From Day One!" body="Designed with enterprise teams in mind. Built around transparency, security, and human control." />
      <div className={`${container} grid grid-cols-1 gap-6 @min-[40rem]:grid-cols-2 @5xl:grid-cols-4`}>
        {security.map((c, i) => (
          <Reveal key={c.title} delay={i * 110} y={40}>
            <Spotlight className="flex h-full min-h-[220px] flex-col gap-[24px] rounded-[16px] bg-white px-[30px] py-[40px] shadow-omy-card transition-all duration-500 hover:-translate-y-2 hover:shadow-[-7px_34px_60px_0px_rgba(0,0,0,0.14)] @5xl:h-[300px]">
              <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-omy-green transition-transform duration-500 group-hover:scale-x-100" />
              <div className="relative size-[36px] shrink-0 overflow-clip transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110">{c.icon}</div>
              <div className="relative flex flex-1 flex-col gap-[8px] text-black">
                <p className="font-spectral-medium text-[28px] leading-[36px]">{c.title}</p>
                <p className="font-inter text-[16px] leading-[28px]">{c.body}</p>
              </div>
            </Spotlight>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Section 8 — AI CX vs Assisted                                        */
/* ------------------------------------------------------------------ */

function MessageBars({ tone, short, drawn }: { tone: 'grey' | 'green'; short: string; drawn: boolean }) {
  const colour = tone === 'grey' ? 'rgba(230,230,230,1)' : 'rgba(0,171,69,0.1)'
  const shine = tone === 'grey' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.85)'
  return (
    <div className="flex w-full flex-col gap-[8px]">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="h-[16px] animate-omy-shimmer rounded-[24px] transition-[width] duration-700 ease-out"
          style={{
            width: drawn ? (i === 6 ? short : '100%') : '0%',
            transitionDelay: `${300 + i * 120}ms`,
            backgroundImage: `linear-gradient(90deg, ${colour} 0%, ${colour} 40%, ${shine} 50%, ${colour} 60%, ${colour} 100%)`,
            backgroundSize: '200% 100%',
            animationDelay: `${i * 90}ms`,
          }}
        />
      ))}
    </div>
  )
}

function AiVsAssisted() {
  const [ref, drawn] = useInView<HTMLDivElement>({ threshold: 0.3 })
  const traditional = ['Automatically replies to customers', 'No human replies or oversight', 'Can hallucinate or give wrong answers', 'Generic responses without context', 'Lack of understanding of your business']
  const assistedList = ['Agent approves every response', 'Uses your company knowledge and policies', 'Supports agent confidence and consistency', 'Context-aware and accurate guidance', 'Human remains in control, always']

  return (
    <section className="flex w-full flex-col items-center gap-[48px] @3xl:gap-[60px]">
      <SectionHeading
        title={
          <>
            AI CX or <span className="text-omy-green">AI Assisted CX (OmyKra)?</span>
          </>
        }
        body="We believe AI shouldn’t replace your customer support team. It should help them become better."
      />
      <div ref={ref} className={`${container} grid grid-cols-1 gap-8 @5xl:grid-cols-2 @5xl:gap-[60px]`}>
        <Reveal x={-40} y={0}>
          <div className="flex h-full flex-col items-center gap-[48px] rounded-[24px] bg-[rgba(239,68,68,0.05)] p-6 shadow-omy-card @min-[40rem]:p-10 @5xl:gap-[80px] @5xl:p-[60px]">
            <div className="flex w-full max-w-[450px] items-center justify-between gap-4">
              <div className="relative h-[97px] w-[80px] shrink-0 animate-omy-float @min-[40rem]:h-[146px] @min-[40rem]:w-[120px]">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <img alt="" src={a.robot} className="absolute left-[-33.33%] top-[-11.64%] h-[136.99%] w-[166.67%] max-w-none" />
                </div>
              </div>
              <div className="flex h-[250px] w-full max-w-[294px] flex-col gap-[24px] rounded-[16px] border border-solid border-[#d1d1d1] bg-white p-[20px]">
                <p className="font-inter-medium text-[12px] leading-[20px] text-black">Here is the answer</p>
                <MessageBars tone="grey" short="150px" drawn={drawn} />
              </div>
            </div>
            <div className="flex w-full flex-col gap-[36px]">
              <div className="flex w-full items-center justify-center rounded-[40px] bg-[rgba(239,68,68,0.1)] px-[30px] py-[15px]">
                <p className="font-spectral-medium text-center text-[20px] leading-[32px] text-[#ef4444] @3xl:text-[24px]">TRADITIONAL AI CX</p>
              </div>
              <div className="flex w-full flex-col gap-[24px]">
                {traditional.map((t, i) => (
                  <Reveal key={t} delay={200 + i * 80} y={10} blur={false} className="flex items-center gap-[16px]">
                    <img alt="" src={a.cancel} className="block size-[24px] shrink-0 max-w-none" />
                    <p className="font-inter flex-1 text-[18px] leading-[28px] text-black @3xl:text-[20px] @3xl:leading-[32px]">{t}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal x={40} y={0} delay={120}>
          <div className="flex h-full flex-col items-center gap-[48px] rounded-[24px] bg-[rgba(0,171,69,0.05)] p-6 shadow-omy-card @min-[40rem]:p-10 @5xl:gap-[80px] @5xl:p-[60px]">
            <div className="flex w-full max-w-[450px] items-center justify-between gap-4">
              <div className="relative size-[140px] shrink-0 @min-[40rem]:size-[240px]">
                <img alt="" src={a.assisted} className="pointer-events-none absolute inset-0 size-full max-w-none object-cover" />
              </div>
              <div className="flex h-[250px] w-full max-w-[196px] flex-col gap-[24px] rounded-[16px] border border-solid border-omy-green bg-white p-[20px] shadow-[0_0_0_0_rgba(0,171,69,0.4)] transition-shadow duration-500 hover:shadow-[0_0_0_6px_rgba(0,171,69,0.12)]">
                <p className="font-inter-medium flex items-center gap-1.5 text-[12px] leading-[20px] text-omy-green">
                  Here is the answer
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-omy-green opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-omy-green" />
                  </span>
                </p>
                <MessageBars tone="green" short="100px" drawn={drawn} />
              </div>
            </div>
            <div className="flex w-full flex-col gap-[36px]">
              <div className="flex w-full items-center justify-center rounded-[40px] bg-[rgba(0,171,69,0.05)] px-[30px] py-[15px]">
                <p className="font-spectral-medium text-center text-[20px] leading-[32px] text-omy-green @3xl:text-[24px]">OMYKRA AI ASSISTED CX</p>
              </div>
              <div className="flex w-full flex-col gap-[24px] @5xl:w-[490px]">
                {assistedList.map((t, i) => (
                  <Reveal key={t} delay={300 + i * 80} y={10} blur={false} className="flex items-center gap-[16px]">
                    <img alt="" src={a.checkFill} className="block size-[24px] shrink-0 max-w-none" />
                    <p className="font-inter flex-1 text-[18px] leading-[28px] text-black @3xl:text-[20px] @3xl:leading-[32px]">{t}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Section 9 — Founder                                                  */
/* ------------------------------------------------------------------ */

function Founder() {
  return (
    <section id="omy-founder" className="flex w-full scroll-mt-24 flex-col items-center gap-[48px] @3xl:gap-[60px]">
      <SectionHeading title="Built By Someone Who Lived The Problem." body="We believe AI shouldn’t replace your customer support team. It should help them become better." />
      <div className={`${container} flex flex-col @5xl:flex-row @5xl:items-center`}>
        <Reveal y={0} scale={1.04} className="w-full @5xl:w-[595px] @5xl:shrink-0">
          <div className="group relative aspect-square w-full overflow-clip bg-omy-lime @5xl:aspect-auto @5xl:h-[640px]">
            <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-105 @5xl:left-[-33px] @5xl:right-auto @5xl:size-[640px]">
              <img alt="Geoffery Nnalue, founder of OmyKra" src={a.founder} className="pointer-events-none absolute inset-0 size-full max-w-none object-cover" />
            </div>
          </div>
        </Reveal>
        <div className="flex w-full flex-col justify-between gap-10 border border-t-0 border-solid border-[#d1d1d1] p-6 @3xl:p-[40px] @5xl:h-[640px] @5xl:w-[685px] @5xl:border-l-0 @5xl:border-t">
          <Reveal as="p" className="font-spectral text-[26px] leading-[34px] text-black @3xl:text-[36px] @3xl:leading-[44px]">
            {'“I built the communication standard I wish I had access to when I was running CX. '}
            <span className="text-[#808080]">Not another chatbot, the thing I needed on the floor while engaging customers.”</span>
          </Reveal>
          <div className="flex w-full flex-col items-end gap-[8px]">
            <div className="flex w-full flex-col gap-[24px]">
              <Reveal y={0} blur={false} className="relative h-0 w-full">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img alt="" src={a.line605} className="block size-full max-w-none" />
                </div>
              </Reveal>
              <Reveal delay={150} className="flex w-full flex-col gap-[4px] leading-[32px]">
                <p className="font-spectral-medium text-[24px] text-black">Geoffery Nnalue</p>
                <p className="font-inter text-[18px] text-[#808080] @3xl:text-[20px]">
                  Founder at OmyKra
                  <br aria-hidden />
                  Lead Customer Executive at Goodlord.
                </p>
              </Reveal>
            </div>
            <Reveal delay={300} x={20} y={20} className="relative size-[96px] shrink-0 @3xl:size-[160px]">
              <img alt="" src={a.quotes} className="absolute inset-0 block size-full max-w-none" />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Section 10 — Pricing                                                 */
/* ------------------------------------------------------------------ */

const options = [
  {
    title: 'Tailored to your team',
    body: 'We configure OmyKra around your workflows, standards, and communication guidelines.',
    icon: (
      <div className="absolute left-1/2 top-1/2 size-[36px] -translate-x-1/2 -translate-y-1/2">
        <img alt="" src={a.people} className="absolute inset-0 block size-full max-w-none" />
      </div>
    ),
  },
  {
    title: 'Guided by your goals',
    body: 'We align the solution to your priorities, team structure, and support objectives.',
    icon: (
      <div className="absolute left-[26px] top-[26px] size-[36px]">
        <img alt="" src={a.guide} className="absolute inset-0 block size-full max-w-none" />
      </div>
    ),
  },
  {
    title: 'Built to grow with you',
    body: 'From onboarding to scale, we’re with you every step of the way.',
    icon: (
      <div className="absolute left-[26px] top-[26px] size-[36px]">
        <img alt="" src={a.grow} className="absolute inset-0 block size-full max-w-none" />
      </div>
    ),
  },
]

function Pricing() {
  return (
    <section id="omy-pricing" className="flex w-full scroll-mt-24 flex-col items-center gap-[48px] @3xl:gap-[60px]">
      <SectionHeading
        title="Built For Teams Who Already Have A Standard Worth Protecting."
        body="Everyone organisation is different. We’ll tailor OmyKra to your team, your workflow, and your standards."
      />
      <div className="mx-auto flex w-full max-w-[1062px] flex-col items-center gap-12 px-5 @3xl:px-8 @5xl:flex-row @5xl:justify-between @5xl:px-0">
        <Reveal y={50} scale={0.97} className="w-full max-w-[520px]">
          <div className="group flex flex-col items-center gap-[24px] rounded-[24px] bg-white p-8 drop-shadow-[-7px_24px_24px_rgba(0,0,0,0.1)] transition-transform duration-500 hover:-translate-y-1 @3xl:p-[60px]">
            <div className="flex items-center justify-center rounded-[25px] bg-[rgba(0,171,69,0.05)] px-[20px] py-[10px]">
              <p className="font-inter-medium whitespace-nowrap text-[14px] leading-[22px] text-omy-green">STARTS FROM</p>
            </div>
            <div className="flex items-center gap-[12px] whitespace-nowrap">
              <p className="font-spectral text-[48px] leading-[56px] text-black @3xl:text-[56px] @3xl:leading-[64px]">
                <CountUp to={2500} prefix="£" />
              </p>
              <p className="font-inter text-[20px] leading-[32px] text-[#808080]">/month</p>
            </div>
            <p className="font-inter-medium text-center text-[14px] leading-[22px] text-[#808080]">
              Every organization is different. That’s why OmyKra is customized to your team, your workflow, and your standards.
            </p>
            <div className="flex w-full flex-col items-center gap-[16px]">
              <PrimaryButton className="w-full">Book a Walkthrough</PrimaryButton>
              <div className="flex items-center gap-[8px]">
                <img alt="" src={a.shieldSmall} className="block size-[16px] shrink-0 max-w-none" />
                <p className="font-inter-medium text-center text-[12px] leading-[20px] text-[#808080]">No commitment. Just a 30-minute conversation.</p>
              </div>
            </div>
          </div>
        </Reveal>
        <div className="flex w-full max-w-[430px] flex-col items-center gap-[36px]">
          {options.map((o, i) => (
            <div key={o.title} className="flex w-full flex-col items-center gap-[36px]">
              {i > 0 && (
                <Reveal y={0} blur={false} className="relative h-0 w-full max-w-[410px]">
                  <div className="absolute inset-[-1px_0_0_0]">
                    <img alt="" src={a.line410} className="block size-full max-w-none" />
                  </div>
                </Reveal>
              )}
              <Reveal delay={i * 130} x={30} y={0} className="group flex w-full items-center gap-6 @3xl:gap-[36px]">
                <div className="relative size-[87.828px] shrink-0 overflow-clip rounded-[54px] bg-[rgba(0,171,69,0.05)] transition-all duration-500 group-hover:rotate-[10deg] group-hover:bg-[rgba(0,171,69,0.12)]">{o.icon}</div>
                <div className="flex flex-1 flex-col gap-[16px]">
                  <p className="font-spectral-medium text-[24px] leading-[32px] text-black">{o.title}</p>
                  <p className="font-inter-medium text-[14px] leading-[22px] text-[#808080]">{o.body}</p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Section 11 — FAQ                                                     */
/* ------------------------------------------------------------------ */

const faqs: [string, string][] = [
  ['Does OmyKra replace our customer support agents?', 'No. OmyKra assists your agents by improving responses while they remain fully in control.'],
  ['Can OmyKra generate answers that aren’t in our knowledge base?', 'No. OmyKra only uses information you’ve approved, so guidance stays accurate and on-brand.'],
  ['Which tools does OmyKra work with?', 'OmyKra works alongside Zendesk, Intercom, Gmail, Freshdesk, HubSpot, Salesforce and more, plus an API for custom setups.'],
  ['How long does implementation take?', 'We tailor OmyKra to your team, workflow and standards, and walk you through every step of getting started.'],
  ['Is our customer data secure?', 'Yes. OmyKra is built with enterprise security, a privacy-first, GDPR-ready architecture and human review on every reply.'],
  ['Can we customize OmyKra for our communication standards?', 'Yes. We configure OmyKra around your workflows, standards and communication guidelines.'],
  ['Will OmyKra help onboard new support agents?', 'Yes. New hires get guidance from day one, so they reply with confidence much sooner.'],
  ['How do we get started?', 'Book a walkthrough. No commitment, just a 30-minute conversation.'],
]

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="omy-faq" className={`${container} flex scroll-mt-24 flex-col items-start gap-10 @5xl:flex-row @5xl:justify-between`}>
      <div className="flex w-full flex-col gap-[24px] @5xl:sticky @5xl:top-28 @5xl:w-[430px]">
        <Reveal as="h2" className={`w-full ${h2}`}>
          Frequently Asked Questions.
        </Reveal>
        <Reveal as="p" delay={120} className={`w-full ${lead}`}>
          Everything you need to know before bringing OmyKra into your customer experience workflow. If you don’t see your question here, we’d happy to walk you through it.
        </Reveal>
      </div>
      <div className="flex w-full flex-col gap-[24px] @5xl:w-[737px]">
        {faqs.map(([q, ans], i) => {
          const isOpen = open === i
          return (
            <Reveal key={q} delay={i * 60} y={24}>
              <div
                className={`relative overflow-hidden rounded-[24px] drop-shadow-[-7px_24px_24px_rgba(0,0,0,0.1)] transition-transform duration-300 ${isOpen ? '' : 'hover:-translate-y-0.5'}`}
              >
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{ opacity: isOpen ? 1 : 0, backgroundImage: 'linear-gradient(165.47345315316306deg, rgb(0, 171, 69) 15.804%, rgb(8, 71, 52) 102.68%)' }}
                />
                <div className="absolute inset-0 bg-white transition-opacity duration-500" style={{ opacity: isOpen ? 0 : 1 }} />
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="relative flex w-full cursor-pointer items-center gap-[24px] p-6 text-left @3xl:p-[30px]"
                >
                  <div className="flex flex-1 flex-col">
                    <p className={`font-spectral-medium flex text-[20px] leading-[28px] transition-colors duration-500 @3xl:text-[24px] @3xl:leading-[32px] ${isOpen ? 'text-white' : 'text-black'}`}>
                      <span className="w-[36px] shrink-0">{i + 1}.</span>
                      <span>{q}</span>
                    </p>
                    <div className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.8,.2,1)]" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                      <div className="overflow-hidden">
                        <p
                          className="font-inter pt-[8px] text-[16px] leading-[28px] text-white transition-all duration-500"
                          style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? 'none' : 'translateY(-6px)' }}
                        >
                          {ans}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className="relative block size-[24px] shrink-0 self-start @3xl:self-center">
                    <img alt="" src={a.plus} className="absolute inset-0 block size-full max-w-none transition-all duration-500" style={{ opacity: isOpen ? 0 : 1, transform: isOpen ? 'rotate(90deg)' : 'none' }} />
                    <img alt="" src={a.minus} className="absolute inset-0 block size-full max-w-none transition-all duration-500" style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? 'none' : 'rotate(-90deg)' }} />
                  </span>
                </button>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Section 13 — CTA + Footer                                            */
/* ------------------------------------------------------------------ */

function Cta() {
  return (
    <section className="relative flex w-full items-center overflow-clip bg-omy-green py-20 @3xl:h-[680px] @3xl:py-0">
      <PatternTiles offsets={['calc(50% - 747px)', 'calc(50% - 70px)', 'calc(50% + 607px)']} />
      <div className="relative mx-auto flex w-full max-w-[567px] flex-col items-center gap-[40px] px-5 @3xl:gap-[48px]">
        <div className="flex w-full flex-col items-center gap-[24px] text-center text-white">
          <Reveal as="h2" className="font-spectral text-[38px] leading-[46px] @3xl:text-[56px] @3xl:leading-[64px]">
            From Their First Day,
            <br />
            To Your Busiest Day,
            <br />
            Same Quality.
          </Reveal>
          <Reveal as="p" delay={150} className="font-inter max-w-[360px] text-[18px] leading-[30px] @3xl:text-[20px] @3xl:leading-[32px]">
            Build a walkthrough and see how OmyKra helps every agent deliver the same communication standard.
          </Reveal>
        </div>
        <Reveal delay={280} className="flex flex-wrap items-center justify-center gap-[16px] @3xl:gap-[24px]">
          <Magnetic>
            <PrimaryButton tone="lime" className="drop-shadow-[-7px_24px_24px_rgba(0,0,0,0.1)]" onClick={() => scrollToId('omy-pricing')}>
              Book a Walkthrough
            </PrimaryButton>
          </Magnetic>
          <Magnetic>
            <button
              type="button"
              className="flex h-[56px] cursor-pointer items-center justify-center rounded-[48px] border-2 border-solid border-white p-[20px] font-inter-semibold whitespace-nowrap text-[16px] leading-[24px] text-white transition-colors duration-300 hover:bg-white hover:text-omy-forest"
            >
              Talk to Sales
            </button>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  )
}

const footerCols: [string, string[]][] = [
  ['Product', ['Product', 'Features', 'Integrations', 'Security']],
  ['Company', ['About Us', 'Blog', 'Careers', 'Contact']],
  ['Resources', ['Help Center', 'Documentation', 'API', 'Book a Walkthrough']],
  ['Legal', ['Privacy Policy', 'Terms of Service', 'Cookie Policy']],
]

function Footer() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  return (
    <footer className={`${container} flex flex-col gap-[48px] @3xl:gap-[60px]`}>
      <Reveal className="grid grid-cols-2 gap-x-6 gap-y-10 @3xl:grid-cols-4 @7xl:flex @7xl:items-start @7xl:justify-between">
        <div className="col-span-2 flex flex-col gap-[15px] @3xl:col-span-4 @7xl:w-[292px]">
          <div className="relative h-[80px] w-[252px] shrink-0">
            <img alt="OmyKra" src={a.logo} className="pointer-events-none absolute inset-0 size-full max-w-none object-cover" />
          </div>
          <div className="flex flex-col gap-[8px] text-black">
            <p className="font-inter-semibold text-[16px] leading-[24px]">AI Coworker For CX Teams.</p>
            <p className="font-inter-medium text-[14px] leading-[22px]">Empowering customer experience teams to deliver consistent, confident conversations every time.</p>
          </div>
          <div className="flex items-center gap-[16px]">
            <a href="#" aria-label="LinkedIn" className="relative block size-[16px] transition-transform duration-300 hover:-translate-y-0.5 hover:scale-110">
              <img alt="" src={a.linkedin} className="absolute inset-0 block size-full max-w-none" />
            </a>
            <a href="#" aria-label="X" className="relative block size-[14px] overflow-clip transition-transform duration-300 hover:-translate-y-0.5 hover:scale-110">
              <div
                className="absolute inset-[4.69%_0] [mask-repeat:no-repeat] [mask-size:14px_14px] [mask-position:0px_-0.656px] [mask-mode:alpha]"
                style={{ maskImage: `url("${a.twitterMask}")` }}
              >
                <img alt="" src={a.twitter} className="absolute inset-0 block size-full max-w-none" />
              </div>
            </a>
          </div>
        </div>
        {footerCols.map(([head, items]) => (
          <div key={head} className="flex flex-col gap-[16px] @7xl:min-w-[102px]">
            <p className="font-inter text-[18px] leading-[30px] text-black">{head}</p>
            {items.map((it) => (
              <a key={it} href="#" className="group relative w-fit font-inter-medium whitespace-nowrap text-[14px] leading-[22px] text-black transition-colors duration-300 hover:text-omy-green">
                {it}
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-omy-green transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" />
              </a>
            ))}
          </div>
        ))}
        <div className="col-span-2 flex flex-col gap-[24px] @3xl:col-span-4 @7xl:w-[371px]">
          <div className="flex flex-col gap-[8px] text-black @7xl:w-[344px]">
            <p className="font-inter text-[18px] leading-[30px]">Stay ahead in Customer Experience</p>
            <p className="font-inter-medium text-[14px] leading-[22px]">Get practical insights, product updates, and customer experience best practices delivered straight to your inbox.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (email.includes('@')) setDone(true)
            }}
            className="flex w-full items-center justify-between gap-3 rounded-[72px] border border-solid border-[#d1d1d1] py-[10px] pl-[20px] pr-[10px] transition-[border-color,box-shadow] duration-300 focus-within:border-omy-green focus-within:shadow-[0_0_0_4px_rgba(0,171,69,0.12)]"
          >
            <input
              type="email"
              required
              value={email}
              disabled={done}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email"
              className="font-inter-medium min-w-0 flex-1 bg-transparent text-[14px] leading-[22px] text-black outline-none placeholder:text-black"
            />
            <button
              type="submit"
              className={`group relative flex h-[56px] shrink-0 cursor-pointer items-center justify-center gap-[10px] overflow-hidden rounded-[48px] p-[20px] drop-shadow-[-7px_24px_24px_rgba(0,0,0,0.1)] transition-all duration-500 ${done ? 'bg-omy-green' : 'bg-omy-forest hover:-translate-y-0.5'}`}
            >
              {done ? (
                <span className="font-inter-semibold whitespace-nowrap text-[16px] leading-[24px] text-white">Subscribed ✓</span>
              ) : (
                <>
                  <Arrow src={a.arrowWhite} />
                  <span className="font-inter-semibold whitespace-nowrap text-[16px] leading-[24px] text-white">Subscribe</span>
                </>
              )}
            </button>
          </form>
        </div>
      </Reveal>
      <div className="font-inter flex flex-col gap-2 text-[16px] leading-[28px] text-black @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:text-[18px] @3xl:leading-[30px]">
        <p>© 2026 Omykra. All rights reserved.</p>
        <p>Designed for customer experience teams.</p>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

function ScrollProgress({ targetRef }: { targetRef: RefObject<HTMLDivElement | null> }) {
  const live = useContext(LiveContext)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!live) return
    let raf = 0
    const update = () => {
      raf = 0
      const root = targetRef.current
      if (!root || !ref.current) return
      const r = root.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)))
      ref.current.style.transform = `scaleX(${p})`
      // Fade out once the page has scrolled past its end (the folder is closing).
      ref.current.style.opacity = r.bottom < window.innerHeight - 1 ? '0' : '1'
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [live, targetRef])

  return (
    <div className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] ${live ? '' : 'hidden'}`}>
      <div ref={ref} className="h-full origin-left bg-gradient-to-r transition-opacity duration-300 from-omy-green to-omy-lime" style={{ transform: 'scaleX(0)' }} />
    </div>
  )
}

const pageRoot = 'relative flex w-full flex-col items-center gap-[72px] bg-white pb-[48px] @3xl:gap-[100px] @3xl:pb-[64px]'

type SiteProps = {
  /**
   * `full` – the whole interactive site.
   * `preview` – only the top of the page (the miniature that rises out of the folder).
   * `tail` – the last screen of the page, pinned to the bottom (the frame that sinks back in).
   */
  variant?: 'full' | 'preview' | 'tail'
  /** @deprecated use `variant="preview"` */
  preview?: boolean
}

/**
 * The OmyKra marketing site, laid out at its original 1440px design width and
 * scaled to fit the screen (see `DesignFrame`).
 */
export default function OmyKraSite({ variant, preview = false }: SiteProps) {
  const mode = variant ?? (preview ? 'preview' : 'full')
  const rootRef = useRef<HTMLDivElement>(null)

  if (mode === 'tail') {
    return (
      <StaticContext.Provider value>
        <div className="relative size-full overflow-hidden bg-white">
          <DesignFrame className="absolute inset-x-0 bottom-0">
            <div className={pageRoot}>
              <Cta />
              <Footer />
            </div>
          </DesignFrame>
          <DesignFrame className="absolute inset-x-0 top-0 z-10">
            <Nav forceStuck />
          </DesignFrame>
        </div>
      </StaticContext.Provider>
    )
  }

  const full = mode === 'full'
  return (
    <>
      {full && <ScrollProgress targetRef={rootRef} />}
      <DesignFrame>
        <div ref={rootRef} id={full ? 'omy-top' : undefined} className={`${pageRoot} pt-[24px] @3xl:pt-[64px]`}>
          <Nav />
          <Hero />
          <PoorCX />
          {full && (
            <>
              <Coworker />
              <Consistency />
              <Integrations />
              <Comparison />
              <Security />
              <AiVsAssisted />
              <Founder />
              <Pricing />
              <Faq />
              <Cta />
              <Footer />
            </>
          )}
        </div>
      </DesignFrame>
    </>
  )
}
