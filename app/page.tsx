import Link from "next/link";
import { projects, categories } from "./config/projects";
import { SignOutButton } from "./components/sign-out-button";

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

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  const isWordpress = project.type === "wordpress";
  const baseClasses =
    "group relative block rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-white/10 hover:bg-white/[0.04]";
  const cardClasses = isWordpress
    ? `${baseClasses} opacity-50 cursor-not-allowed`
    : baseClasses;

  return (
    <Link
      href={isWordpress ? "#" : `/apps/${project.slug}`}
      className={cardClasses}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: project.color }}
        />
        <TypeBadge type={project.type} />
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

export default function Home() {
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
              {projects.length} projects {"\u00B7"} JCL Marketing
            </p>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Projects Grid */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {categories.map((category) => {
          const categoryProjects = projects.filter(
            (p) => p.category === category
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
