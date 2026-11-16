import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PROJECTS, getProject } from "@/app/lib/projects";

export function generateStaticParams() {
  return PROJECTS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  const url = `/projects/${project.slug}`;
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: {
      siteName: "Daiana Szwimer",
      type: "article",
      url,
      title: `${project.title} · Daiana Szwimer`,
      description: project.summary,
    },
  };
}

const LINK = "underline decoration-neutral-500 underline-offset-4 transition-colors hover:decoration-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-100 block";

// The frame and back link are the same for every project, so they stay in the
// shared App Shell; only the part that reads `params` waits behind Suspense.
export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <main className="min-h-dvh bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-24">
        <Link href="/#projects" className={`text-sm opacity-80 ${LINK}`}>
          ← All projects
        </Link>
        <Suspense fallback={<ProjectSkeleton />}>
          <ProjectDetails params={params} />
        </Suspense>
      </div>
    </main>
  );
}

function ProjectSkeleton() {
  return (
    <div aria-hidden className="space-y-6">
      <div className="h-12 w-3/4 rounded-lg bg-white/5 sm:h-14" />
      <div className="h-16 rounded-lg bg-white/5" />
    </div>
  );
}

async function ProjectDetails({ params }: Pick<PageProps<"/projects/[slug]">, "params">) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  return (
    <article className="space-y-14">
      <header className="space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{project.title}</h1>
        <p className="text-xl leading-relaxed opacity-80">{project.summary}</p>
        <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="opacity-60">Role</dt>
          <dd>{project.role} · {project.period}</dd>
          <dt className="opacity-60">Built with</dt>
          <dd>{project.tech.join(", ")}</dd>
          {project.links && project.links.length > 0 && (
            <>
              <dt className="opacity-60">Links</dt>
              <dd className="flex flex-wrap gap-x-4 gap-y-1">
                {project.links.map(({ label, href }) => (
                  <a key={href} href={href} className={LINK}>{label}</a>
                ))}
              </dd>
            </>
          )}
        </dl>
      </header>
      {project.sections.map(({ heading, body, list }) => (
        <section key={heading} className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
          {body?.map((p) => (
            <p key={p} className="leading-relaxed opacity-80">{p}</p>
          ))}
          {list && (
            <ul className="list-disc space-y-2 pl-5 leading-relaxed opacity-80 marker:text-neutral-500">
              {list.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
