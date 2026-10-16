export type Project = {
  slug: string
  name: string
  tagline: string
  category: string
  year: string
  role: string
  color: string
  accent: string
  figma: string
  summary: string
  problem: string
  approach: string[]
  outcome: string
  scope: string[]
}

export const projects: Project[] = [
  {
    slug: "omykra",
    name: "OmyKra",
    tagline: "AI coworker for customer experience teams",
    category: "SaaS · Product Design",
    year: "2026",
    role: "Product Designer",
    color: "#2457ff",
    accent: "#dfe7ff",
    figma: "",
    summary:
      "A SaaS product experience spanning marketing pages, authentication, core product flows and an administrative dashboard.",
    problem:
      "CX teams juggle tickets, macros and knowledge bases across too many tools. OmyKra needed to feel like a capable teammate, not another inbox.",
    approach: [
      "Mapped the agent-to-AI handoff end to end before touching UI.",
      "Built reusable interface patterns so the dashboard and marketing site speak one language.",
      "Prototyped key behaviours to validate decisions with the client early.",
    ],
    outcome:
      "A coherent product surface from first visit to daily use, with a component library the team can extend.",
    scope: ["Marketing site", "Auth", "Core flows", "Admin dashboard"],
  },
  {
    slug: "flavordash",
    name: "FlavorDash",
    tagline: "Food ordering, from craving to doorstep",
    category: "Web Platform · Food",
    year: "2025",
    role: "Product Designer",
    color: "#ff5a1f",
    accent: "#ffe6db",
    figma: "https://www.figma.com/design/OJrtErijokkQvHFgRSefxv/FlavorDash",
    summary:
      "A web-based food ordering experience: landing page, restaurant discovery, menu, cart, checkout, order tracking and restaurant/rider tools.",
    problem:
      "Ordering flows often bury the food behind filters. Hungry people want fewer decisions, faster.",
    approach: [
      "Led with appetite: large food imagery and short paths to the menu.",
      "Designed a cart and checkout that never hide the total.",
      "Extended the system to restaurant and rider experiences.",
    ],
    outcome:
      "A three-sided platform with one consistent visual system across customers, kitchens and riders.",
    scope: ["Landing", "Discovery", "Checkout", "Order tracking"],
  },
  {
    slug: "talent-faculty",
    name: "Talent Faculty",
    tagline: "Learning experiences by Trueminds",
    category: "EdTech · Website & Dashboard",
    year: "2025",
    role: "UI/UX Design Lead",
    color: "#7c3aed",
    accent: "#ede4ff",
    figma: "https://www.figma.com/design/fI5r54Rpf8lmH2oIjPkz2i/Talent-Faculty-By-Trueminds",
    summary:
      "I designed the marketing website and the learner's dashboard for a digital learning platform.",
    problem:
      "Prospective learners needed clarity on programmes; enrolled learners needed to know exactly what to do next.",
    approach: [
      "Structured the marketing site around outcomes, not course catalogues.",
      "Designed the learner dashboard around a single 'next step' focus.",
      "Kept information architecture shallow for easy navigation.",
    ],
    outcome:
      "A marketing site and dashboard that feel like one product journey.",
    scope: ["Marketing website", "Learner's dashboard"],
  },
  {
    slug: "manna",
    name: "Manna",
    tagline: "Farm-fresh food marketplace",
    category: "E-commerce · Marketplace",
    year: "2025 —",
    role: "Lead Product Designer",
    color: "#2f7d32",
    accent: "#e1f1dc",
    figma: "https://www.figma.com/design/eS8jtUDDOF8NIPoOsR8rKS/Manna",
    summary:
      "My very first official website design, and now a product I lead: a marketplace connecting customers with farm-fresh food.",
    problem:
      "Fresh produce online lives or dies on trust. Shoppers need to see freshness and price before they commit.",
    approach: [
      "Designed discovery, shopping, cart and checkout end to end.",
      "Maintained visual consistency while improving clarity screen by screen.",
      "Refined requirements with stakeholders into practical flows.",
    ],
    outcome: "A marketplace that grew with me from first site to lead role.",
    scope: ["Discovery", "Shopping", "Cart", "Checkout"],
  },
  {
    slug: "meatika",
    name: "Meatika",
    tagline: "Operations dashboard for a meat supply business",
    category: "Dashboard · B2B",
    year: "2025",
    role: "Product Designer",
    color: "#b91c1c",
    accent: "#fbe1e1",
    figma: "https://www.figma.com/design/IPkwQ5IgSXS2jj29TFhPUe/Meatika",
    summary:
      "A dashboard design for tracking inventory, orders and performance at a glance.",
    problem:
      "Operators were reading spreadsheets to answer simple questions like 'what sold today?'.",
    approach: [
      "Prioritised the five numbers that drive daily decisions.",
      "Designed dense tables that stay readable.",
      "Used colour sparingly to flag what needs attention.",
    ],
    outcome: "A calm, scannable dashboard that surfaces problems first.",
    scope: ["Overview", "Inventory", "Orders", "Reports"],
  },
  {
    slug: "bridge",
    name: "Bridge",
    tagline: "Hackathon concept, built against the clock",
    category: "Hackathon · Concept",
    year: "2025",
    role: "Product Designer",
    color: "#0e7490",
    accent: "#d9f1f6",
    figma: "https://www.figma.com/design/GeQyX4K7uHb1iOrxa6e1wC/Bridge",
    summary:
      "A hackathon product designed in a compressed timeline, from problem framing to pitch-ready screens.",
    problem:
      "Limited time means every screen has to earn its place in the demo.",
    approach: [
      "Framed one core journey and designed only what the story needed.",
      "Worked in tight loops with developers.",
      "Polished the moments the judges would see first.",
    ],
    outcome: "A focused, demo-ready product story.",
    scope: ["Concept", "Core flow", "Pitch screens"],
  },
  {
    slug: "optrix",
    name: "Optrix",
    tagline: "A mobile app experience",
    category: "Mobile App",
    year: "2025",
    role: "Product Designer",
    color: "#111827",
    accent: "#e5e7eb",
    figma: "https://www.figma.com/design/hWIq7BfuxU6Igfln9vtgZu/Optrix",
    summary:
      "A mobile app designed for thumbs first: clear hierarchy, generous targets and quick paths.",
    problem: "Small screens punish clutter. Every tap should move the user forward.",
    approach: [
      "Designed around one-handed reach.",
      "Built a compact component set for consistency.",
      "Prototyped transitions to communicate behaviour.",
    ],
    outcome: "A focused mobile experience with a reusable component set.",
    scope: ["Onboarding", "Home", "Core flows"],
  },
  {
    slug: "abode",
    name: "ABODE",
    tagline: "Finding a place to call home",
    category: "Real Estate · Web",
    year: "2025",
    role: "Product Designer",
    color: "#a16207",
    accent: "#f6ecd6",
    figma: "",
    summary: "A property experience designed around trust, imagery and quick comparison.",
    problem: "House hunting is stressful; listings rarely answer the questions that matter.",
    approach: [
      "Led with photography and essential facts.",
      "Designed comparison-friendly listing cards.",
      "Simplified enquiry to a single step.",
    ],
    outcome: "A calm, image-led browsing experience.",
    scope: ["Listings", "Property detail", "Enquiry"],
  },
]

export const links = {
  email: "davidtemisanalika@gmail.com",
  whatsapp: "https://wa.me/2347084644071",
  whatsappLabel: "+234 708 464 4071",
  dribbble: "https://dribbble.com/davidalika",
  behance: "https://www.behance.net/alikadavid",
  instagram: "https://www.instagram.com/davidalika.aligned",
}
