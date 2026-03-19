import Link from "next/link";
import { projects } from "@/app/config/projects";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return projects
    .filter((p) => p.type !== "wordpress")
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Not Found" };
  return {
    title: `${project.name} | JCL Project Hub`,
    description: project.description,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project || project.type === "wordpress") notFound();

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <span className="text-sm font-medium text-white">{project.name}</span>
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
            {project.type}
          </span>
        </div>
        <a
          href={`/projects/${slug}/index.html`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-500 hover:text-white transition-colors"
        >
          {"Open in new tab \u2192"}
        </a>
      </div>

      {/* Project iframe */}
      <iframe
        src={`/projects/${slug}/index.html`}
        className="flex-1 w-full border-0"
        title={project.name}
      />
    </div>
  );
}
