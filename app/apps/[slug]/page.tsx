import Link from "next/link";
import { getWebsites, getWebsiteBySlug } from "@/app/lib/supabase/websites";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const websites = await getWebsites();
  return websites
    .filter((w) => w.site_builder !== "wordpress" && w.site_builder !== "github")
    .map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const website = await getWebsiteBySlug(slug);
  if (!website) return { title: "Not Found" };
  return {
    title: `${website.name} | JCL Project Hub`,
    description: website.description,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const website = await getWebsiteBySlug(slug);
  if (!website || website.site_builder === "wordpress") notFound();

  const isGithub = website.site_builder === "github";
  const iframeSrc = isGithub && website.external_url
    ? website.external_url
    : `/projects/${slug}/index.html`;
  const openUrl = isGithub && website.external_url
    ? website.external_url
    : `/projects/${slug}/index.html`;

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
            style={{ backgroundColor: website.color || "#8B5CF6" }}
          />
          <span className="text-sm font-medium text-white">{website.name}</span>
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
            {website.site_builder === "github" ? "vercel" : website.site_builder}
          </span>
        </div>
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-500 hover:text-white transition-colors"
        >
          {"Open in new tab \u2192"}
        </a>
      </div>

      {/* Project iframe */}
      <iframe
        src={iframeSrc}
        className="flex-1 w-full border-0"
        title={website.name}
      />
    </div>
  );
}
