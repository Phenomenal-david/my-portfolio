import OmyKraShowcase from './omykra/OmyKraShowcase'
import AlikaHero from './portfolio/AlikaHero'
import {
  AboutPage,
  CaseStudyPage,
  ContactPage,
  Footer,
  HomeSections,
  PlaygroundPage,
  SiteNav,
  WorkPage,
  useRoute,
} from './portfolio/Site'

/**
 * Alika portfolio. Home: hero + OmyKra folder showcase + remaining sections.
 * Other pages use hash routes (#/work, #/work/:slug, #/about, #/playground, #/contact).
 */
export default function App() {
  const route = useRoute()
  const [page, slug] = route.split('/')

  if (!page) {
    return (
      <main className="min-h-screen bg-alika-paper text-alika-ink">
        <OmyKraShowcase tone="light" intro={<AlikaHero />}>
          <HomeSections />
        </OmyKraShowcase>
        <Footer />
      </main>
    )
  }

  const body =
    page === 'work' && slug ? <CaseStudyPage slug={slug} />
    : page === 'work' ? <WorkPage />
    : page === 'about' ? <AboutPage />
    : page === 'playground' ? <PlaygroundPage />
    : <ContactPage />

  return (
    <main key={route} className="min-h-screen bg-alika-paper font-['Inter',sans-serif] text-alika-ink">
      <SiteNav route={route} />
      {body}
      <Footer />
    </main>
  )
}
