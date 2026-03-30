import Link from "next/link";
import { getWebsites, type Website } from "./lib/supabase/websites";
import { SignOutButton } from "./components/sign-out-button";
import { AIProjectsSection } from "./components/ai-projects-section";

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    static: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    vite: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    nextjs: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    wordpress: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    github: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  };
  const labels: Record<string, string> = {
    static: "HTML",
    vite: "Vite + React",
    nextjs: "Next.js",
    wordpress: "WordPress",
    github: "GitHub",
  };
  return (
    <span
      className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors[type] || ""}`}
    >
      {labels[type] || type}
    </span>
  );
}

function ProjectCard({ project }: { project: Website }) {
  const isWordpress = project.site_builder === "wordpress";
  const isGithub = project.site_builder === "github";
  const baseClasses =
    "group relative block rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-white/10 hover:bg-white/[0.04]";
  const cardClasses = isWordpress
    ? `${baseClasses} opacity-50 cursor-not-allowed`
    : baseClasses;

  const href = isWordpress
    ? "#"
    : isGithub && project.external_url
    ? project.external_url
    : `/apps/${project.slug}`;

  return (
    <Link
      href={href}
      className={cardClasses}
      {...(isGithub && project.external_url ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: project.color || "#8B5CF6" }}
        />
        <TypeBadge type={project.site_builder || "static"} />
      </div>
      <h3 className="text-sm font-medium text-white mb-1 group-hover:text-white/90">
        {project.name}
      </h3>
      <p className="text-xs text-zinc-500">{project.description}</p>
      {!isWordpress && (
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10" />
      )}
      {isWordpress && (
        <p className="text-[10px] text-zinc-600 mt-2">
          {"WordPress \u2014 requires server hosting"}
        </p>
      )}
    </Link>
  );
}

export default async function Home() {
  const websites = await getWebsites();
  const categories = [...new Set(websites.map((w) => w.category).filter(Boolean))] as string[];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black font-bold text-sm">JCL</span>
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Project Hub
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-zinc-500 text-sm">
              {websites.length} projects {"\u00B7"} JCL Marketing
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/create"
                className="text-xs px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New AI Project
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Projects Grid */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* AI-Generated Projects (dynamic from Supabase) */}
        <AIProjectsSection />

        {/* Website categories from Supabase */}
        {categories.map((category) => {
          const categoryProjects = websites.filter(
            (w) => w.category === category
          );
          return (
            <section key={category} className="mb-12">
              <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-4">
                {category}
                <span className="ml-2 text-zinc-600">
                  {categoryProjects.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryProjects.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
