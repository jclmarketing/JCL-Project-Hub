import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore in read-only contexts
          }
        },
      },
    }
  );
}

// GET /api/projects - List all AI projects
export async function GET() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("ai_projects")
    .select("id, slug, name, description, color, status, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/projects - Create a new AI project
export async function POST(req: NextRequest) {
  const supabase = await getSupabase();
  const body = await req.json();

  const { data, error } = await supabase
    .from("ai_projects")
    .insert({
      slug: body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      name: body.name,
      description: body.description || null,
      files: body.files || {},
      messages: body.messages || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
