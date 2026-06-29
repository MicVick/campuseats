"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

/** Wrap protected student pages. Once auth state is hydrated, redirect
 *  unauthenticated users to /login, remembering where they were headed. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, token, router, pathname]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-accent-400 border-t-transparent" />
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}
