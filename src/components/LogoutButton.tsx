"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      title="Sair"
      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-danger-100 hover:text-danger-500"
    >
      <LogOut size={15} />
    </button>
  );
}
