import { useState, type CSSProperties, type ReactNode } from "react"
import { DesignFrame } from "../omykra/motion"

const assetPathPrefix = "/assets"
const imgArrowUpRight = `${assetPathPrefix}/17f4d.svg`

const buttonText =
  "font-['Inter:Medium'] font-medium text-[13px] leading-[18px] tracking-[0.4px] whitespace-nowrap"

const rise = (delay: number): CSSProperties => ({
  animationDelay: `${delay}ms`,
})

function scrollToWork() {
  document
    .getElementById("omy-top")
    ?.scrollIntoView({ behavior: "smooth", block: "start" })
}

/** Blue pill button with the up-right arrow (the "LET'S TALK" / "VIEW SELECTED WORK" component). */
function PrimaryButton({
  children,
  onClick,
  href,
}: {
  children: ReactNode
  onClick?: () => void
  href?: string
}) {
  const className =
    "group relative isolate flex shrink-0 cursor-pointer items-center gap-[8px] overflow-hidden h-[48px] rounded-[6px] bg-alika-blue px-[22px] text-alika-paper drop-shadow-[0px_8px_24px_rgba(36,87,255,0.4)] transition-[transform,filter] duration-300 ease-out hover:-translate-y-0.5 hover:drop-shadow-[0px_14px_30px_rgba(36,87,255,0.55)] active:translate-y-0 active:scale-[0.98]"
  const inner = (
    <>
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 -z-10 w-1/3 -skew-x-12 bg-white/25 opacity-0 transition-all duration-700 ease-out group-hover:left-[120%] group-hover:opacity-100" />
      <span className={buttonText}>{children}</span>
      <span className="relative block size-[24px] shrink-0 overflow-hidden">
        <img
          alt=""
          src={imgArrowUpRight}
          className="absolute inset-0 block size-full max-w-none transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-x-[120%] group-hover:-translate-y-[120%]"
        />
        <img
          alt=""
          src={imgArrowUpRight}
          className="absolute inset-0 block size-full max-w-none -translate-x-[120%] translate-y-[120%] transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-x-0 group-hover:translate-y-0"
        />
      </span>
    </>
  )
  return href ? (
    <a href={href} className={className}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  )
}

function OutlineButton({
  children,
  href,
}: {
  children: ReactNode
  href: string
}) {
  return (
    <a
      href={href}
      className="flex shrink-0 cursor-pointer items-center justify-center h-[48px] rounded-[6px] border border-solid border-[rgba(10,10,10,0.5)] bg-alika-paper px-[22px] text-alika-ink transition-colors duration-300 hover:border-alika-ink hover:bg-alika-ink hover:text-alika-paper"
    >
      <span className={buttonText}>{children}</span>
    </a>
  )
}

const navLinks = ["WORK", "ABOUT", "PLAYGROUND", "CONTACT"] as const

function Nav() {
  const [active, setActive] = useState<string>("")
  return (
    <nav className="mx-auto flex w-full max-w-[1280px] animate-alika-rise items-center justify-between px-5 pt-[32px] @3xl:px-8 @3xl:pt-[60px] @7xl:px-0">
      <a href="#/" className="font-['Inter:Semi_Bold'] text-[15px] font-semibold tracking-[2px] text-alika-ink">
        DAVID ALIKA
      </a>
      <div className="hidden @3xl:flex items-center gap-[16px] font-['Inter:Regular'] text-[16px] leading-[30px] font-normal whitespace-nowrap @min-[40rem]:gap-[24px] @min-[40rem]:text-[18px]">
        {navLinks.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              setActive(label)
              if (label === "WORK") scrollToWork()
              else window.location.hash = "#/" + label.toLowerCase()
            }}
            className={`group relative cursor-pointer transition-colors duration-300 ${
              active === label
                ? "text-alika-ink"
                : "text-[rgba(10,10,10,0.5)] hover:text-alika-ink"
            }`}
          >
            {label}
            <span
              className={`absolute -bottom-0.5 left-0 h-px w-full bg-alika-ink transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
                active === label
                  ? "origin-left scale-x-100"
                  : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100"
              }`}
            />
          </button>
        ))}
      </div>
      <PrimaryButton href="mailto:davidtemisanalika@gmail.com">
        LET&apos;S TALK
      </PrimaryButton>
    </nav>
  )
}

function Eyebrow() {
  const items = ["PRODUCT DESIGN", "UI/UX", "VISUAL DESIGN"]
  return (
    <div
      className="flex animate-alika-rise flex-wrap items-center justify-center gap-[8px] rounded-[40px] bg-[rgba(36,87,255,0.1)] px-[15px] py-[10px]"
      style={rise(120)}
    >
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-[8px]">
          {i > 0 && (
            <span className="size-[4px] shrink-0 rounded-[21px] bg-alika-blue" />
          )}
          <span className="font-['Inter:Medium'] text-[11px] leading-[16px] font-medium tracking-[1.1px] whitespace-nowrap text-alika-blue">
            {item}
          </span>
        </span>
      ))}
    </div>
  )
}

/**
 * Alika portfolio first screen: nav + hero (Figma node 1:2).
 * Laid out on the original 1440px frame and scaled to the screen, like the OmyKra site.
 */
export default function AlikaHero() {
  return (
    <DesignFrame>
      <header className="w-full">
        <Nav />
        <div className="mx-auto flex w-full max-w-[894px] flex-col items-center gap-[32px] px-5 pt-[48px] @3xl:gap-[48px] @3xl:pt-[55px]">
          <Eyebrow />
          <div className="flex w-full flex-col items-start gap-[16px] text-center">
            <h1
              className="font-editorial w-full animate-alika-rise text-[48px] leading-[52px] tracking-[-1.2px] text-alika-ink @min-[40rem]:text-[64px] @min-[40rem]:leading-[68px] @min-[40rem]:tracking-[-1.6px] @5xl:text-[88px] @5xl:leading-[92px] @5xl:tracking-[-2.5px]"
              style={rise(220)}
            >
              {/* Line breaks follow the Figma composition on desktop. */}I
              design digital <br className="hidden @5xl:block" />
              experiences that make <br className="hidden @5xl:block" />
              <span className="font-editorial-italic text-alika-blue">
                ideas impossible to ignore.
              </span>
            </h1>
            <p
              className="w-full animate-alika-rise font-['Inter:Regular'] text-[16px] leading-[28px] font-normal text-[rgba(10,10,10,0.5)] @min-[40rem]:text-[18px] @min-[40rem]:leading-[30px]"
              style={rise(340)}
            >
              I’m David Alika — a product and visual designer focused on turning
              complex problems into clear, useful and beautifully crafted
              experiences
            </p>
          </div>
          <div
            className="flex animate-alika-rise flex-wrap items-center justify-center gap-[20px] @min-[40rem]:gap-[36px]"
            style={rise(460)}
          >
            <PrimaryButton onClick={scrollToWork}>
              VIEW SELECTED WORK
            </PrimaryButton>
            <OutlineButton href="mailto:davidtemisanalika@gmail.com">
              LET&apos;S TALK
            </OutlineButton>
          </div>
        </div>
      </header>
    </DesignFrame>
  )
}
