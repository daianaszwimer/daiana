import { HeroEffects } from "@/app/components/hero/hero-effects";
import { InfoTip } from "@/app/components/info-tip";
import { PhaseSelect } from "@/app/components/phase-select";
import { Metadata } from "next";

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

const SECTIONS = [
  {
    heading: "Lorem ipsum dolor sit amet",
    items: [
      {
        subheading: "Consectetur adipiscing elit",
        body: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      },
      {
        subheading: "Duis aute irure dolor",
        body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      },
    ],
  },
  {
    heading: "Sed ut perspiciatis unde omnis",
    items: [
      {
        subheading: "Nemo enim ipsam voluptatem",
        body: "Quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.",
      },
      {
        subheading: "Ut enim ad minima veniam",
        body: "Quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.",
      },
    ],
  },
];

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
      jobTitle: 'Senior Software Engineer',
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
      sameAs: [
        'https://github.com/daianaszwimer',
        'https://www.linkedin.com/in/daiana-szwimer/',
      ],
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
      <section className="bg-neutral-950 text-neutral-100">
        <div className="mx-auto max-w-3xl space-y-20 px-4 py-24">
          {SECTIONS.map(({ heading, items }) => (
            <article key={heading} className="space-y-10">
              <h2 className="text-4xl font-semibold tracking-tight">{heading}</h2>
              {items.map(({ subheading, body }) => (
                <div key={subheading} className="space-y-3">
                  <h3 className="text-xl font-medium">{subheading}</h3>
                  <p className="leading-relaxed opacity-80">{body}</p>
                </div>
              ))}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
