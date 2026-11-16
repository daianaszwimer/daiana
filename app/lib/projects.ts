export type ProjectSection = {
  heading: string;
  body?: string[];
  list?: string[];
};

export type Project = {
  slug: string;
  title: string;
  /** One line for the homepage card and the page description. */
  summary: string;
  role: string;
  period: string;
  tech: string[];
  links?: { label: string; href: string }[];
  sections: ProjectSection[];
};

export const PROJECTS: Project[] = [
  // {
  //   slug: "onboarding",
  //   title: "Redesigning the onboarding",
  //   summary:
  //     "Fewer steps, fewer concepts, and a flow for each reason people sign up. Conversion went up 20%.",
  //   role: "Senior Product Engineer",
  //   // TODO(daiana): when did this ship?
  //   period: "Daffy",
  //   tech: ["Remix", "TypeScript", "Tailwind CSS", "Ruby on Rails", "Heap"],
  //   sections: [
  //     {
  //       heading: "What it is",
  //       body: [
  //         "Daffy is a donor-advised fund: you put money aside for giving, it gets invested, and you donate to charities whenever you want. That’s a lot of new ideas to take in before you’ve even set up an account.",
  //         "I redesigned the onboarding flow. I cut it down to the steps and concepts people actually need on day one, then added separate flows for the main reasons people come to Daffy.",
  //       ],
  //       list: [
  //         // TODO(daiana): name the specific steps/concepts that were removed or deferred.
  //         "A shorter main flow with fewer steps and fewer concepts up front",
  //         // TODO(daiana): list the intents (e.g. giving to a specific charity, moving an existing fund…).
  //         "Dedicated flows for specific user intents",
  //         "Rolled out behind a feature flag and measured in Heap",
  //       ],
  //     },
  //     {
  //       heading: "Why",
  //       body: [
  //         // TODO(daiana): what signal started this? Drop-off data, support tickets, user interviews?
  //         "The old onboarding asked people to understand how Daffy works before they could do the thing they came for. A lot of people dropped off along the way.",
  //         "The goal was simple: get more people from sign-up to a funded account without hiding anything they need to know.",
  //       ],
  //     },
  //     {
  //       heading: "Spotlight: shipping it safely",
  //       body: [
  //         "Onboarding is the front door of the product, so a full replacement on day one was too risky. The new flow shipped behind a feature flag, ran alongside the old one, and both were instrumented in Heap so we could compare conversion step by step.",
  //         // TODO(daiana): how were intents detected/routed? Any tricky state, routing, or Rails ↔ Remix boundary problems worth a paragraph for developers?
  //         "Intent-specific flows meant onboarding stopped being one linear sequence. Each flow had to reuse the same building blocks and still end up in a consistent account state.",
  //       ],
  //     },
  //     {
  //       heading: "Results",
  //       body: [
  //         "The new flow increased onboarding conversion by 20%. It replaced the old flow for everyone.",
  //       ],
  //     },
  //     {
  //       heading: "What I learned",
  //       list: [
  //         "Removing steps is usually worth more than polishing them.",
  //         "Measure before you argue. Having Heap funnels in place before launch turned design debates into numbers.",
  //         // TODO(daiana): a lesson about working with design/product, or about accessibility testing, if it applies.
  //         "Feature flags aren’t only for safety. They let you learn while you ship.",
  //       ],
  //     },
  //   ],
  // },
  {
    slug: "talks-and-workshops",
    title: "Talks & workshops",
    summary:
      "Conference talks, a React course I wrote and taught, and teenagers shipping their first app.",
    role: "Speaker & teacher",
    period: "2020 – present",
    tech: ["React", "v0"],
    links: [
      // TODO(daiana): add YouTube links to the talks.
    ],
    sections: [
      {
        heading: "What it is",
        body: [
          "Alongside my day job, I teach. Explaining something from scratch is the fastest way I know to find out whether I really understand it.",
        ],
        list: [
          // TODO(daiana): name the conferences and talk titles.
          "2020–2021: virtual conference talks (recordings on YouTube)",
          "2022: created and taught “Crea tu primera app con React” at Código Facilito",
          "Puerta 18: taught teenagers to build their first app with v0",
        ],
      },
      {
        heading: "Spotlight: Crea tu primera app con React",
        body: [
          // TODO(daiana): length, number of students, how you structured it, what the final project was.
          "I designed this course from zero for people writing their first React app: the curriculum, the examples and the final project. The hard part wasn’t the content. It was choosing what to leave out so beginners could get something working before they got overwhelmed.",
        ],
      },
      {
        heading: "Spotlight: Puerta 18",
        body: [
          // TODO(daiana): what did they build? a moment that stuck with you?
          "With AI tools, the hard part for a teenager isn’t syntax anymore. It’s knowing what to ask for and recognising when the result is wrong. I built the workshop around that: describe the app, generate it with v0, then read and change what came out.",
        ],
      },
      {
        heading: "What I learned",
        list: [
          "A good explanation starts from what the audience already knows.",
          "Live demos fail. Prepare a recovery path, not just a script.",
          "Teaching made me a better reviewer. I explain the why in PR comments now, not just the what.",
        ],
      },
    ],
  },
];

export function getProject(slug: string) {
  return PROJECTS.find((p) => p.slug === slug);
}
