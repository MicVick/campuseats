"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/hooks/api";
import { useVendorAuthStore, type VendorIdentity } from "@/stores/vendorAuthStore";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";

export default function VendorLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const login = useVendorAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; vendor: VendorIdentity }>(
        "/vendor/auth/login",
        { method: "POST", body: { email, password } }
      );
      login(data.token, data.vendor);
      router.push("/vendor");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-muted px-6">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500 text-2xl shadow-lg shadow-accent-500/30">
            🍴
          </div>
          <p className="text-2xl font-black text-accent-600">CampusEats</p>
          <p className="mt-1 text-sm font-semibold text-ink-soft">Vendor Portal</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="rounded-2xl bg-surface p-6 shadow-lg">
          <h1 className="text-lg font-bold text-ink">Vendor Login</h1>
          <p className="mt-1 text-sm text-ink-soft">Sign in to manage your orders and menu</p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vendor@example.com"
                className="h-11 w-full rounded-xl border border-line bg-surface-muted px-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="h-11 w-full rounded-xl border border-line bg-surface-muted px-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent-400 focus:outline-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            className="mt-6"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-faint">
          Student? <a href="/" className="font-semibold text-accent-600">Go to student app →</a>
        </p>
      </div>
    </div>
  );
}
