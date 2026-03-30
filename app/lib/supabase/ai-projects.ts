import { createClient } from "./client";

export interface AIProject {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color: string;
  files: Record<string, string>;
  messages: { role: "user" | "assistant"; content: string }[];
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
}

export async function getAIProjects(): Promise<AIProject[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ai_projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as AIProject[]) || [];
}

export async function getAIProject(id: string): Promise<AIProject | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ai_projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as AIProject;
}

export async function createAIProject(
  name: string,
  description: string
): Promise<AIProject> {
  const supabase = createClient();
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const colors = [
    "#8B5CF6", "#EC4899", "#F59E0B", "#10B981",
    "#3B82F6", "#EF4444", "#06B6D4", "#D946EF",
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];

  const { data, error } = await supabase
    .from("ai_projects")
    .insert({ slug, name, description, color })
    .select()
    .single();

  if (error) throw error;
  return data as AIProject;
}

export async function updateAIProject(
  id: string,
  updates: Partial<Pick<AIProject, "name" | "description" | "files" | "messages" | "status" | "color">>
): Promise<AIProject> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ai_projects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as AIProject;
}

export async function deleteAIProject(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("ai_projects").delete().eq("id", id);
  if (error) throw error;
}
