"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAIProjects, type AIProject } from "@/app/lib/supabase/ai-projects";

function AIProjectCard({ project }: { project: AIProject }) {
  return (
    <Link
      href={`/create?id=${project.id}`}
      className="group relative block rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-white/10 hover:bg-white/[0.04]"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: project.color }}
        />
        <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/20">
          AI Generated
        </span>
      </div>
      <h3 className="text-sm font-medium text-white mb-1 group-hover:text-white/90">
        {project.name}
      </h3>
      <p className="text-xs text-zinc-500">
        {project.description || "AI-generated project"}
      </p>
      <p className="text-[10px] text-zinc-600 mt-2">
        {Object.keys(project.files).length} files {"\u00B7"}{" "}
        {project.messages.length} messages
      </p>
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10" />
    </Link>
  );
}

export function AIProjectsSection() {
  const [projects, setProjects] = useState<AIProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAIProjects()
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-4">
          AI Generated
          <span className="ml-2 text-zinc-600">...</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-5 animate-pulse"
            >
              <div className="w-3 h-3 rounded-full bg-white/5 mb-3" />
              <div className="h-4 bg-white/5 rounded w-2/3 mb-2" />
              <div className="h-3 bg-white/5 rounded w-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (projects.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-4">
        AI Generated
        <span className="ml-2 text-zinc-600">{projects.length}</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {projects.map((project) => (
          <AIProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
