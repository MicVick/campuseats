"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/student/RequireAuth";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { apiFetch } from "@/hooks/api";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { EditIcon, CheckIcon } from "@/components/icons";
import type { User } from "@/types";

function ProfileInner() {
  const router = useRouter();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const clearCart = useCartStore((s) => s.clear);

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);

  const onLogout = () => {
    logout();
    clearCart();
    router.replace("/login");
  };

  const onSaveName = async () => {
    if (!nameInput.trim()) {
      toast.error("Name can't be empty");
      return;
    }
    setSaving(true);
    try {
      const updated = await apiFetch<User>("/me", {
        method: "PATCH",
        auth: "student",
        body: { name: nameInput.trim() },
      });
      setUser(updated);
      setEditing(false);
      toast.success("Name updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header className="sticky top-0 z-20 bg-surface/95 px-4 pb-3 pt-4 backdrop-blur">
        <h1 className="text-xl font-black text-ink">Profile</h1>
      </header>

      <div className="px-4 py-4">
        <div className="rounded-card bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-2xl font-black text-accent-600">
              {user?.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    autoFocus
                    className="h-9 flex-1 rounded-lg border border-line bg-surface-muted px-2 text-sm font-bold text-ink focus:outline-none focus:border-accent-400"
                    onKeyDown={(e) => e.key === "Enter" && onSaveName()}
                  />
                  <button
                    onClick={onSaveName}
                    disabled={saving}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-500 text-white"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="truncate text-lg font-bold text-ink">{user?.name}</p>
                  <button
                    onClick={() => {
                      setNameInput(user?.name ?? "");
                      setEditing(true);
                    }}
                    className="text-ink-faint hover:text-ink"
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
              <p className="truncate text-sm text-ink-soft">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-card bg-surface shadow-sm">
          <Link
            href="/orders"
            className="flex items-center justify-between px-4 py-3.5 active:bg-surface-muted"
          >
            <span className="font-medium text-ink">🧾 My Orders</span>
            <span className="text-ink-faint">›</span>
          </Link>
        </div>

        <Button
          variant="secondary"
          fullWidth
          size="lg"
          className="mt-6 text-danger"
          onClick={onLogout}
        >
          Log out
        </Button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  );
}
