import { CreeperVine } from "@/app/components/creeper-vine";
import { HeroEffects } from "@/app/components/hero/hero-effects";
import { InfoTip } from "@/app/components/info-tip";
import { PhaseSelect } from "@/app/components/phase-select";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "@/app/lib/contact";
import { PROJECTS } from "@/app/lib/projects";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: 'Daiana Szwimer' },
  alternates: { canonical: '/' },
  openGraph: {
    siteName: 'Daiana Szwimer',
    type: 'profile',
    url: '/',
    title: 'Daiana Szwimer',
    description: 'Senior product engineer based in Buenos Aires, focused on frontend. Building great apps for the web.',
    firstName: 'Daiana',
    lastName: 'Szwimer',
  },
}

const EXPERIENCE: { role: string; company: string; period: string; body?: string }[] = [
  {
    role: "Senior Product Engineer",
    company: "Daffy",
    period: "April 2022 – Present",
    body: "Working with Remix, TypeScript, Tailwind CSS and Ruby on Rails.",
  },
  { role: "Senior Web Developer", company: "PSh", period: "July 2021 – April 2022" },
  { role: "Software Engineer", company: "Standard Notes", period: "March 2021 – May 2021" },
  { role: "Web Developer", company: "Distillery", period: "October 2020 – March 2021" },
  { role: "Full Stack Engineer", company: "PSh", period: "February 2017 – October 2020" },
];

const LINK =
  "underline decoration-neutral-500 underline-offset-4 transition-colors hover:decoration-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-100";

// A full-height rail per side; the vine sits at the rail's end and sticks
// to the viewport bottom, so it never leaves the content block. Sized to
// fit the gutter beside the max-w-3xl content column.
const VINE_RAIL =
  "pointer-events-none absolute inset-y-0 hidden w-[calc(min(18rem,(100vw-48rem)/2-1rem)*0.8)] flex-col justify-end xl:flex";
const VINE = "sticky bottom-0 aspect-[348/739] w-full opacity-20";

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfilePage',
      '@id': "https://www.daiana.dev/#profile",
      url: "https://www.daiana.dev",
      name: 'Daiana Szwimer',
      mainEntity: { '@id': "https://www.daiana.dev/#person" },
    },
    {
      '@type': 'Person',
      '@id': 'https://www.daiana.dev/#person',
      name: 'Daiana Szwimer',
      url: 'https://www.daiana.dev',
      image: 'https://www.daiana.dev/opengraph-image',
      jobTitle: 'Senior Product Engineer',
      worksFor: { '@type': 'Organization', name: 'Daffy' },
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: 'Universidad Tecnológica Nacional',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Buenos Aires',
        addressCountry: 'AR',
      },
      knowsAbout: ['React', 'Remix', 'Next.js', 'TypeScript', 'Ruby on Rails', 'Frontend architecture'],
      sameAs: [GITHUB_URL, LINKEDIN_URL],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.daiana.dev/#website',
      url: 'https://www.daiana.dev',
      name: 'Daiana Szwimer',
      author: { '@id': 'https://www.daiana.dev/#person' },
    },
  ],
}


export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <main className="sky relative h-[calc(100dvh+8rem)] w-full overflow-hidden">
        <HeroEffects className="grid size-full place-items-center pb-32">
          <h1 className="select-none px-4 text-center text-[clamp(4rem,18vw,16rem)] font-semibold leading-none tracking-tight text-[var(--fg)]">
            Daiana
          </h1>
        </HeroEffects>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 sky-fade"
        />
        <PhaseSelect className="absolute right-4 top-4" />
        <InfoTip className="absolute bottom-36 right-4" />
      </main>
      <div className="bg-neutral-950 text-neutral-100">
        <div className="vine-scope relative">
          <div aria-hidden className="vine-track" />
          <div aria-hidden className={`${VINE_RAIL} left-0`}>
            <CreeperVine side="left" className={VINE} />
          </div>
          <div aria-hidden className={`${VINE_RAIL} right-0`}>
            <CreeperVine side="right" className={`${VINE} -scale-x-100`} />
          </div>
          <div className="mx-auto max-w-3xl space-y-24 px-4 py-24">
            <section id="about" aria-labelledby="about-heading" className="space-y-6">
              <h2 id="about-heading" className="text-4xl font-semibold tracking-tight">Hi, I’m Daiana</h2>
              {/* TODO(daiana): the story of how you got into programming is the strongest hook here. Add it as a paragraph. */}
              <p className="text-lg leading-relaxed opacity-80">
                I’m a product engineer in Buenos Aires. I’ve been building for the web since 2017, and
                these days I work at Daffy, mostly on the frontend: the flows people click through when
                they set up their giving.
              </p>
              <p className="text-lg leading-relaxed opacity-80">
                The part of the job I like most is when a screen gets simpler and the numbers go up
                because of it. I studied at UTN, and on the side I teach: conference talks, a React
                course, and workshops for teenagers building their first app.
              </p>
              <p className="text-lg leading-relaxed opacity-80">
                When I’m not coding I paint, mostly Argentine animals and places I’ve walked through.
                There’s a <Link href="/gallery" className={LINK}>gallery</Link> if you want to take a look.
                And the sky at the top of this page follows your local time.
              </p>
            </section>

            <section id="projects" aria-labelledby="projects-heading" className="space-y-8">
              <h2 id="projects-heading" className="text-4xl font-semibold tracking-tight">Projects</h2>
              <ul className="grid gap-4">
                {PROJECTS.map(({ slug, title, summary, tech }) => (
                  <li key={slug}>
                    <Link
                      href={`/projects/${slug}`}
                      className="group block space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-[background-color,border-color,translate] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-100 active:translate-y-0 motion-reduce:transition-colors motion-reduce:hover:translate-y-0"
                    >
                      <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
                      <p className="leading-relaxed opacity-80">{summary}</p>
                      <p className="flex items-center justify-between gap-4 text-sm">
                        <span className="opacity-60">{tech.join(" · ")}</span>
                        <span aria-hidden className="shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                          Read more →
                        </span>
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="experience-heading" className="space-y-8">
              <h2 id="experience-heading" className="text-4xl font-semibold tracking-tight">Experience</h2>
              <ol className="divide-y divide-white/10">
                {EXPERIENCE.map(({ role, company, period, body }) => (
                  <li key={`${company}-${period}`} className="space-y-1 py-4 first:pt-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <h3 className="text-lg font-medium">{role} · {company}</h3>
                      <p className="text-sm opacity-60">{period}</p>
                    </div>
                    {body && <p className="leading-relaxed opacity-80">{body}</p>}
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
        <footer id="contact" className="border-t border-white/10">
          <div className="mx-auto max-w-3xl space-y-4 px-4 py-16">
            <h2 className="text-2xl font-semibold tracking-tight">Say hi</h2>
            <p className="leading-relaxed opacity-80">
              Want to work together, or just talk about frontend, teaching or painting? My inbox is open.
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li><a href={`mailto:${EMAIL}`} className={LINK}>{EMAIL}</a></li>
              <li><a href={GITHUB_URL} className={LINK}>GitHub</a></li>
              <li><a href={LINKEDIN_URL} className={LINK}>LinkedIn</a></li>
            </ul>
          </div>
        </footer>
      </div>
    </>
  );
}
