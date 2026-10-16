import { useEffect, useRef, useState, type ReactNode } from "react"
import { links, projects, type Project } from "./data"

/* ---------- Routing helpers ---------- */

export function useRoute() {
  const get = () => window.location.hash.replace(/^#\/?/, "")
  const [route, setRoute] = useState(get)
  useEffect(() => {
    const on = () => {
      setRoute(get())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener("hashchange", on)
    return () => window.removeEventListener("hashchange", on)
  }, [])
  return route
}

/* ---------- Motion primitives ---------- */

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setShown(true), io.disconnect()),
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100 blur-0" : "translate-y-8 opacity-0 blur-[2px]"
      } ${className}`}
    >
      {children}
    </div>
  )
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={`size-4 ${className}`} aria-hidden>
      <path d="M4.5 11.5l7-7M5.5 4.5h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Button({
  href,
  children,
  variant = "primary",
  external,
}: {
  href: string
  children: ReactNode
  variant?: "primary" | "outline" | "light"
  external?: boolean
}) {
  const styles = {
    primary:
      "bg-alika-blue text-alika-paper shadow-[0_8px_24px_rgba(36,87,255,0.35)] hover:shadow-[0_14px_30px_rgba(36,87,255,0.5)]",
    outline:
      "border border-[rgba(10,10,10,0.5)] text-alika-ink hover:bg-alika-ink hover:text-alika-paper hover:border-alika-ink",
    light: "bg-alika-paper text-alika-ink hover:bg-white",
  }[variant]
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`group inline-flex h-12 items-center gap-2 overflow-hidden rounded-[6px] px-[22px] text-[13px] font-medium tracking-[0.4px] whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${styles}`}
    >
      {children}
      <span className="relative block size-4 overflow-hidden">
        <Arrow className="absolute inset-0 transition-transform duration-500 group-hover:translate-x-full group-hover:-translate-y-full" />
        <Arrow className="absolute inset-0 -translate-x-full translate-y-full transition-transform duration-500 group-hover:translate-x-0 group-hover:translate-y-0" />
      </span>
    </a>
  )
}

function Eyebrow({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <p
      className={`flex items-center gap-2 text-[11px] font-medium tracking-[1.1px] uppercase ${
        dark ? "text-alika-paper/60" : "text-alika-blue"
      }`}
    >
      <span className={`size-1 rounded-full ${dark ? "bg-alika-paper/60" : "bg-alika-blue"}`} />
      {children}
    </p>
  )
}

function Heading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`font-editorial text-[44px] leading-[1.02] tracking-[-1.5px] md:text-[72px] md:tracking-[-2.5px] ${className}`}
    >
      {children}
    </h2>
  )
}

/* ---------- Chrome ---------- */

const nav = [
  ["Work", "#/work"],
  ["About", "#/about"],
  ["Playground", "#/playground"],
  ["Contact", "#/contact"],
] as const

export function SiteNav({ route }: { route: string }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12)
    on()
    window.addEventListener("scroll", on, { passive: true })
    return () => window.removeEventListener("scroll", on)
  }, [])
  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-alika-paper/80 backdrop-blur-md shadow-[0_1px_0_rgba(10,10,10,0.08)]" : ""
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 md:px-8">
        <a href="#/" className="text-[15px] font-semibold tracking-[2px] text-alika-ink">
          DAVID ALIKA
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map(([label, href]) => {
            const active = route.startsWith(href.slice(2))
            return (
              <a
                key={href}
                href={href}
                className={`group relative text-[15px] uppercase transition-colors ${
                  active ? "text-alika-ink" : "text-alika-ink/50 hover:text-alika-ink"
                }`}
              >
                {label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px w-full bg-alika-ink transition-transform duration-500 ${
                    active ? "scale-x-100" : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100"
                  }`}
                />
              </a>
            )
          })}
        </nav>
        <div className="hidden md:block">
          <Button href={`mailto:${links.email}`}>LET&apos;S TALK</Button>
        </div>
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen(!open)}
          className="relative size-10 md:hidden"
        >
          <span className={`absolute left-2 h-px w-6 bg-alika-ink transition-all ${open ? "top-5 rotate-45" : "top-4"}`} />
          <span className={`absolute left-2 h-px w-6 bg-alika-ink transition-all ${open ? "top-5 -rotate-45" : "top-6"}`} />
        </button>
      </div>
      <div
        className={`grid overflow-hidden bg-alika-paper transition-all duration-500 md:hidden ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0">
          {nav.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="font-editorial block border-t border-alika-ink/10 px-5 py-4 text-[32px]"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  const socials = [
    ["Dribbble", links.dribbble],
    ["Behance", links.behance],
    ["Instagram", links.instagram],
  ]
  return (
    <footer className="bg-alika-ink text-alika-paper">
      <div className="mx-auto max-w-[1280px] px-5 pt-24 pb-10 md:px-8">
        <Reveal>
          <Eyebrow dark>Available for new projects</Eyebrow>
          <a
            href={`mailto:${links.email}`}
            className="group font-editorial mt-6 block text-[48px] leading-none tracking-[-1.5px] md:text-[120px] md:tracking-[-4px]"
          >
            Let&apos;s make it{" "}
            <span className="font-editorial-italic text-alika-blue transition-colors group-hover:text-alika-paper">
              impossible to ignore.
            </span>
          </a>
        </Reveal>
        <div className="mt-20 grid gap-10 border-t border-alika-paper/15 pt-10 md:grid-cols-4">
          <div>
            <p className="text-[11px] tracking-[1.1px] text-alika-paper/50">EMAIL</p>
            <a href={`mailto:${links.email}`} className="mt-2 block break-all hover:text-alika-blue">
              {links.email}
            </a>
          </div>
          <div>
            <p className="text-[11px] tracking-[1.1px] text-alika-paper/50">WHATSAPP</p>
            <a href={links.whatsapp} target="_blank" rel="noreferrer" className="mt-2 block hover:text-alika-blue">
              {links.whatsappLabel}
            </a>
          </div>
          <div>
            <p className="text-[11px] tracking-[1.1px] text-alika-paper/50">ELSEWHERE</p>
            <div className="mt-2 flex flex-col gap-1">
              {socials.map(([l, h]) => (
                <a key={l} href={h} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 hover:text-alika-blue">
                  {l}
                  <Arrow className="size-3 opacity-0 transition-all group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] tracking-[1.1px] text-alika-paper/50">BASED IN</p>
            <p className="mt-2">Lagos, Nigeria · Remote</p>
          </div>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 text-[13px] text-alika-paper/40">
          <span>© {new Date().getFullYear()} David Alika</span>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-alika-paper">
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  )
}

/* ---------- Project cover (typographic, colour-coded) ---------- */

function Cover({ p, large }: { p: Project; large?: boolean }) {
  return (
    <div
      className="relative overflow-hidden rounded-[10px]"
      style={{ background: p.accent, aspectRatio: large ? "16/9" : "4/3" }}
    >
      <div
        className="absolute -right-[10%] -bottom-[30%] aspect-square w-[70%] rounded-full opacity-90 blur-[2px] transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-110 group-hover:-translate-x-[6%]"
        style={{ background: p.color }}
      />
      <div
        className="absolute top-[14%] left-[8%] w-[46%] rounded-[8px] bg-white/90 p-3 shadow-[0_20px_40px_rgba(10,10,10,0.12)] transition-transform duration-700 group-hover:-translate-y-2 group-hover:-rotate-2"
      >
        <div className="h-2 w-1/3 rounded-full" style={{ background: p.color }} />
        <div className="mt-3 h-1.5 w-full rounded-full bg-alika-ink/10" />
        <div className="mt-1.5 h-1.5 w-4/5 rounded-full bg-alika-ink/10" />
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-square rounded-[4px]" style={{ background: p.accent }} />
          ))}
        </div>
      </div>
      <span
        className="font-editorial-italic absolute bottom-[8%] left-[8%] text-[clamp(32px,5vw,72px)] leading-none tracking-[-2px] text-white mix-blend-difference"
      >
        {p.name}
      </span>
    </div>
  )
}

function ProjectCard({ p, i, large }: { p: Project; i: number; large?: boolean }) {
  return (
    <Reveal delay={(i % 2) * 120}>
      <a href={`#/work/${p.slug}`} className="group block">
        <Cover p={p} large={large} />
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-editorial text-[28px] leading-tight tracking-[-0.8px]">{p.name}</h3>
            <p className="text-[15px] text-alika-ink/55">{p.tagline}</p>
          </div>
          <div className="flex items-center gap-3 pt-2 text-[11px] tracking-[1.1px] text-alika-ink/50 uppercase">
            <span className="hidden sm:inline">{p.category}</span>
            <span className="grid size-9 place-items-center rounded-full border border-alika-ink/15 transition-all duration-300 group-hover:rotate-45 group-hover:border-alika-blue group-hover:bg-alika-blue group-hover:text-white">
              <Arrow className="size-3.5" />
            </span>
          </div>
        </div>
      </a>
    </Reveal>
  )
}

/* ---------- Home sections ---------- */

export function HomeSections() {
  return (
    <>
      <section className="mx-auto max-w-[1280px] px-5 py-28 md:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Selected work</Eyebrow>
            <Heading className="mt-4">
              More things <span className="font-editorial-italic text-alika-blue">I&apos;ve shaped.</span>
            </Heading>
          </div>
          <Button href="#/work" variant="outline">ALL PROJECTS</Button>
        </Reveal>
        <div className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2">
          {projects.slice(1, 5).map((p, i) => (
            <ProjectCard key={p.slug} p={p} i={i} />
          ))}
        </div>
      </section>
      <Marquee />
      <AboutTeaser />
    </>
  )
}

function Marquee() {
  const words = ["Product Design", "UI/UX", "Visual Design", "Design Systems", "Prototyping", "Interaction Design"]
  return (
    <div className="overflow-hidden border-y border-alika-ink/10 py-8">
      <div className="flex w-max animate-[alika-marquee_40s_linear_infinite] gap-12 hover:[animation-play-state:paused]">
        {[...words, ...words].map((w, i) => (
          <span key={i} className="font-editorial flex items-center gap-12 text-[40px] whitespace-nowrap md:text-[64px]">
            {i % 2 ? <span className="font-editorial-italic text-alika-blue">{w}</span> : w}
            <span className="size-2 rounded-full bg-alika-ink/20" />
          </span>
        ))}
      </div>
    </div>
  )
}

function AboutTeaser() {
  return (
    <section className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 py-28 md:grid-cols-[5fr_7fr] md:px-8">
      <Reveal>
        <Portrait />
      </Reveal>
      <Reveal delay={120}>
        <Eyebrow>About</Eyebrow>
        <p className="font-editorial mt-6 text-[32px] leading-[1.15] tracking-[-1px] md:text-[48px] md:tracking-[-1.5px]">
          3+ years turning product requirements into{" "}
          <span className="font-editorial-italic text-alika-blue">clear, useful</span> interfaces across SaaS,
          fintech, e-commerce and consumer products.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="#/about">MORE ABOUT ME</Button>
          <Button href="#/contact" variant="outline">GET IN TOUCH</Button>
        </div>
      </Reveal>
    </section>
  )
}

function Portrait() {
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState({ x: 0, y: 0 })
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect()
        setT({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 })
      }}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
      className="relative aspect-[4/5] overflow-hidden rounded-[10px] bg-[#8a8a7e] [perspective:800px]"
    >
      <img
        src="/about/david.jpg"
        alt="Portrait of David Alika"
        className="size-full object-cover transition-transform duration-500 ease-out"
        style={{ transform: `scale(1.08) translate(${t.x * -14}px, ${t.y * -14}px)` }}
      />
      <span className="absolute bottom-4 left-4 rounded-[6px] bg-alika-paper/90 px-3 py-2 text-[11px] font-medium tracking-[1.1px] backdrop-blur">
        LAGOS · REMOTE
      </span>
    </div>
  )
}

/* ---------- Pages ---------- */

function PageHead({ eyebrow, title }: { eyebrow: string; title: ReactNode }) {
  return (
    <section className="mx-auto max-w-[1280px] px-5 pt-16 pb-16 md:px-8 md:pt-24">
      <div className="animate-alika-rise">
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h1
        className="font-editorial mt-6 max-w-[1000px] animate-alika-rise text-[52px] leading-[1] tracking-[-2px] md:text-[104px] md:tracking-[-2.5px]"
        style={{ animationDelay: "120ms" }}
      >
        {title}
      </h1>
    </section>
  )
}

export function WorkPage() {
  const cats = ["All", "Web", "Dashboard", "Mobile", "SaaS"]
  const [f, setF] = useState("All")
  const list = projects.filter((p) => f === "All" || p.category.toLowerCase().includes(f.toLowerCase()) || (f === "Web" && /web|e-commerce|edtech/i.test(p.category)))
  return (
    <>
      <PageHead eyebrow="Work · 2025 — 2026" title={<>Selected <span className="font-editorial-italic text-alika-blue">projects.</span></>} />
      <section className="mx-auto max-w-[1280px] px-5 pb-28 md:px-8">
        <div className="mb-12 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setF(c)}
              className={`h-10 rounded-[6px] px-4 text-[13px] font-medium transition-all ${
                f === c ? "bg-alika-ink text-alika-paper" : "border border-alika-ink/15 hover:border-alika-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div key={f} className="grid gap-x-8 gap-y-16 md:grid-cols-2">
          {list.map((p, i) => (
            <ProjectCard key={p.slug} p={p} i={i} large={i === 0} />
          ))}
        </div>
      </section>
    </>
  )
}

export function CaseStudyPage({ slug }: { slug: string }) {
  const idx = Math.max(0, projects.findIndex((p) => p.slug === slug))
  const p = projects[idx]
  const next = projects[(idx + 1) % projects.length]
  const meta = [
    ["Role", p.role],
    ["Year", p.year],
    ["Category", p.category],
    ["Scope", p.scope.join(", ")],
  ]
  return (
    <>
      <PageHead eyebrow={p.category} title={<>{p.name} — <span className="font-editorial-italic" style={{ color: p.color }}>{p.tagline.toLowerCase()}.</span></>} />
      <section className="mx-auto max-w-[1280px] px-5 md:px-8">
        <Reveal><Cover p={p} large /></Reveal>
        <div className="mt-12 grid gap-6 border-b border-alika-ink/10 pb-12 sm:grid-cols-2 md:grid-cols-4">
          {meta.map(([k, v], i) => (
            <Reveal key={k} delay={i * 80}>
              <p className="text-[11px] tracking-[1.1px] text-alika-ink/50 uppercase">{k}</p>
              <p className="mt-2">{v}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="mx-auto grid max-w-[1280px] gap-16 px-5 py-24 md:grid-cols-[4fr_8fr] md:px-8">
        <Reveal><Eyebrow>Overview</Eyebrow></Reveal>
        <Reveal><p className="font-editorial text-[30px] leading-[1.2] tracking-[-1px] md:text-[40px]">{p.summary}</p></Reveal>
        <Reveal><Eyebrow>The problem</Eyebrow></Reveal>
        <Reveal><p className="text-[18px] leading-[30px] text-alika-ink/70">{p.problem}</p></Reveal>
        <Reveal><Eyebrow>Approach</Eyebrow></Reveal>
        <ol className="space-y-6">
          {p.approach.map((a, i) => (
            <Reveal key={a} delay={i * 100}>
              <li className="flex gap-6 border-t border-alika-ink/10 pt-6">
                <span className="font-editorial-italic text-[28px] leading-none" style={{ color: p.color }}>0{i + 1}</span>
                <span className="text-[18px] leading-[30px]">{a}</span>
              </li>
            </Reveal>
          ))}
        </ol>
        <Reveal><Eyebrow>Outcome</Eyebrow></Reveal>
        <Reveal>
          <p className="text-[18px] leading-[30px] text-alika-ink/70">{p.outcome}</p>
          {p.figma && (
            <div className="mt-8"><Button href={p.figma} external variant="outline">VIEW IN FIGMA</Button></div>
          )}
        </Reveal>
      </section>
      <a href={`#/work/${next.slug}`} className="group block border-t border-alika-ink/10">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-20 md:px-8">
          <div>
            <p className="text-[11px] tracking-[1.1px] text-alika-ink/50">NEXT PROJECT</p>
            <p className="font-editorial mt-3 text-[56px] tracking-[-2px] transition-transform duration-500 group-hover:translate-x-4 md:text-[96px]">
              {next.name}
            </p>
          </div>
          <span className="grid size-16 place-items-center rounded-full text-white transition-transform duration-500 group-hover:rotate-45" style={{ background: next.color }}>
            <Arrow className="size-6" />
          </span>
        </div>
      </a>
    </>
  )
}

export function AboutPage() {
  const exp = [
    ["Lead Product Designer", "Manna", "Nov 2025 — Present"],
    ["Product Designer", "OmyKra", "2026"],
    ["UI/UX Design Lead", "Talent Faculty", "2025 — 2026"],
    ["UI/UX Designer", "Trueminds", "2025"],
    ["Product Design Volunteer", "DevCareer", ""],
  ]
  const skills = ["User Flows", "Wireframing", "Prototyping", "Design Systems", "Information Architecture", "Responsive Design", "Interaction Design", "Visual Design", "Design Handoff", "Figma", "FigJam", "Photoshop", "Illustrator", "Notion"]
  return (
    <>
      <PageHead eyebrow="About" title={<>Designer, problem-solver, <span className="font-editorial-italic text-alika-blue">geologist-in-training.</span></>} />
      <section className="mx-auto grid max-w-[1280px] gap-12 px-5 pb-24 md:grid-cols-[5fr_7fr] md:px-8">
        <Reveal><Portrait /></Reveal>
        <Reveal delay={120} className="space-y-6 text-[18px] leading-[30px] text-alika-ink/70">
          <p className="font-editorial text-[32px] leading-[1.2] tracking-[-1px] text-alika-ink">
            I&apos;m David — a product designer with 3+ years of experience designing digital products across SaaS, fintech, e-commerce and consumer products.
          </p>
          <p>I translate product requirements and user needs into intuitive user flows, wireframes, high-fidelity interfaces and interactive prototypes — with a strong focus on usability, visual quality and practical solutions.</p>
          <p>Alongside design, I&apos;m studying Geology at Obafemi Awolowo University, where I was named Overall Best Student in the department (OAU STAR Award, 2026). Reading rock layers turns out to be good practice for reading systems.</p>
          <div className="pt-4"><Button href="#/contact">WORK WITH ME</Button></div>
        </Reveal>
      </section>
      <section className="mx-auto max-w-[1280px] px-5 pb-24 md:px-8">
        <Reveal><Eyebrow>Experience</Eyebrow></Reveal>
        <div className="mt-8">
          {exp.map(([r, c, d], i) => (
            <Reveal key={r + c} delay={i * 60}>
              <div className="group grid grid-cols-[1fr_auto] items-baseline gap-4 border-t border-alika-ink/10 py-6 transition-colors hover:bg-alika-blue/[0.04] md:grid-cols-[2fr_2fr_1fr]">
                <span className="font-editorial text-[26px] tracking-[-0.5px] transition-transform duration-500 group-hover:translate-x-2 md:text-[32px]">{r}</span>
                <span className="hidden text-alika-ink/60 md:block">{c}</span>
                <span className="text-right text-[13px] tracking-[0.4px] text-alika-ink/50">{d || c}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-[1280px] px-5 pb-28 md:px-8">
        <Reveal><Eyebrow>Toolkit</Eyebrow></Reveal>
        <div className="mt-8 flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <Reveal key={s} delay={i * 30}>
              <span className="inline-block rounded-[6px] border border-alika-ink/15 px-4 py-2.5 text-[14px] transition-all duration-300 hover:-translate-y-1 hover:border-alika-blue hover:text-alika-blue">{s}</span>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}

export function PlaygroundPage() {
  const tiles = projects.map((p, i) => ({ p, h: [320, 420, 280, 380][i % 4] }))
  return (
    <>
      <PageHead eyebrow="Playground" title={<>Explorations, shots &amp; <span className="font-editorial-italic text-alika-blue">visual experiments.</span></>} />
      <section className="mx-auto max-w-[1280px] px-5 pb-12 md:px-8">
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {tiles.map(({ p, h }, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 100} className="mb-6 break-inside-avoid">
              <a href={links.dribbble} target="_blank" rel="noreferrer" className="group relative block overflow-hidden rounded-[10px]" style={{ height: h, background: p.accent }}>
                <div className="absolute inset-0 transition-transform duration-[1200ms] group-hover:scale-110" style={{ background: `radial-gradient(circle at ${30 + i * 9}% ${70 - i * 5}%, ${p.color}, transparent 60%)` }} />
                <span className="font-editorial-italic absolute top-6 left-6 text-[40px] tracking-[-1px] text-white mix-blend-difference">{p.name}</span>
                <span className="absolute right-4 bottom-4 translate-y-3 rounded-[6px] bg-alika-paper px-3 py-2 text-[11px] font-medium tracking-[1.1px] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">VIEW ON DRIBBBLE ↗</span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="mx-auto flex max-w-[1280px] flex-wrap gap-4 px-5 pb-28 md:px-8">
        <Button href={links.dribbble} external>DRIBBBLE</Button>
        <Button href={links.behance} external variant="outline">BEHANCE</Button>
        <Button href={links.instagram} external variant="outline">INSTAGRAM</Button>
      </section>
    </>
  )
}

export function ContactPage() {
  const [copied, setCopied] = useState(false)
  const [sent, setSent] = useState(false)
  return (
    <>
      <PageHead eyebrow="Contact" title={<>Have an idea? <span className="font-editorial-italic text-alika-blue">Let&apos;s talk.</span></>} />
      <section className="mx-auto grid max-w-[1280px] gap-16 px-5 pb-28 md:grid-cols-2 md:px-8">
        <Reveal className="space-y-8">
          <div>
            <p className="text-[11px] tracking-[1.1px] text-alika-ink/50">EMAIL</p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(links.email)
                setCopied(true)
                setTimeout(() => setCopied(false), 1800)
              }}
              className="font-editorial group mt-2 flex items-center gap-3 text-left text-[26px] tracking-[-0.5px] break-all md:text-[34px]"
            >
              {links.email}
              <span className={`shrink-0 rounded-[6px] px-2 py-1 font-sans text-[11px] tracking-[1.1px] transition-all ${copied ? "bg-alika-blue text-white" : "bg-alika-ink/5 text-alika-ink/60 group-hover:bg-alika-ink/10"}`}>
                {copied ? "COPIED" : "COPY"}
              </span>
            </button>
          </div>
          <div>
            <p className="text-[11px] tracking-[1.1px] text-alika-ink/50">WHATSAPP</p>
            <a href={links.whatsapp} target="_blank" rel="noreferrer" className="font-editorial mt-2 block text-[34px] tracking-[-0.5px] hover:text-alika-blue">{links.whatsappLabel}</a>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href={links.dribbble} external variant="outline">DRIBBBLE</Button>
            <Button href={links.behance} external variant="outline">BEHANCE</Button>
            <Button href={links.instagram} external variant="outline">INSTAGRAM</Button>
          </div>
        </Reveal>
        <Reveal delay={120}>
          {sent ? (
            <div className="grid h-full min-h-[360px] place-items-center rounded-[10px] bg-alika-blue/10 p-10 text-center">
              <p className="font-editorial text-[40px] tracking-[-1px]">Your mail app is open — <span className="font-editorial-italic text-alika-blue">talk soon.</span></p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const d = new FormData(e.currentTarget)
                const body = `${d.get("message")}\n\n— ${d.get("name")} (${d.get("email")})`
                window.location.href = `mailto:${links.email}?subject=${encodeURIComponent("Project enquiry from " + d.get("name"))}&body=${encodeURIComponent(body)}`
                setSent(true)
              }}
              className="space-y-6"
            >
              {[["name", "Your name", "text"], ["email", "Email address", "email"]].map(([n, l, t]) => (
                <label key={n} className="block">
                  <span className="text-[11px] tracking-[1.1px] text-alika-ink/50 uppercase">{l}</span>
                  <input required name={n} type={t} className="mt-2 h-12 w-full border-b border-alika-ink/20 bg-transparent text-[18px] outline-none transition-colors focus:border-alika-blue" />
                </label>
              ))}
              <label className="block">
                <span className="text-[11px] tracking-[1.1px] text-alika-ink/50 uppercase">Tell me about the project</span>
                <textarea required name="message" rows={4} className="mt-2 w-full resize-none border-b border-alika-ink/20 bg-transparent py-2 text-[18px] outline-none transition-colors focus:border-alika-blue" />
              </label>
              <button type="submit" className="h-12 rounded-[6px] bg-alika-blue px-[22px] text-[13px] font-medium tracking-[0.4px] text-alika-paper shadow-[0_8px_24px_rgba(36,87,255,0.35)] transition-all hover:-translate-y-0.5 active:scale-[0.98]">
                SEND MESSAGE
              </button>
            </form>
          )}
        </Reveal>
      </section>
    </>
  )
}
