import { createBrowserClient } from "@supabase/ssr";

export interface Website {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  site_builder: string | null;
  category: string | null;
  color: string | null;
  status: string | null;
  url: string | null;
  external_url: string | null;
}

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getWebsites(): Promise<Website[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("websites")
    .select("id, slug, name, description, site_builder, category, color, status, url, external_url")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data as Website[]) || [];
}

export async function getWebsiteBySlug(slug: string): Promise<Website | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("websites")
    .select("id, slug, name, description, site_builder, category, color, status, url, external_url")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Website;
}
