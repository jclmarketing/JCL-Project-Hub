"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs text-zinc-500 hover:text-white transition-colors"
    >
      Sign Out
    </button>
  );
}
