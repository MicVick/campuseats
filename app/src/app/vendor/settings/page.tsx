"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useVendorProfile,
  useUpdateVendorProfile,
  useChangeVendorPassword,
} from "@/hooks/useVendorApi";
import { useVendorAuthStore } from "@/stores/vendorAuthStore";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPrice } from "@/utils/format";

export default function VendorSettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const vendorAuth = useVendorAuthStore();
  const { data: profile, isLoading } = useVendorProfile();
  const updateProfile = useUpdateVendorProfile();
  const changePassword = useChangeVendorPassword();

  // Profile form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [upiId, setUpiId] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [packagingFee, setPackagingFee] = useState("");
  const [avgPrepTime, setAvgPrepTime] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Password form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  if (profile && !initialized) {
    setName(profile.name);
    setDescription(profile.description || "");
    setArea(profile.area);
    setUpiId(profile.upiId || "");
    setMinOrder(String((profile.minOrder || 0) / 100));
    setPackagingFee(String((profile.packagingFee || 0) / 100));
    setAvgPrepTime(String(profile.avgPrepTimeMins || 15));
    setInitialized(true);
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        area: area.trim(),
        upiId: upiId.trim() || null,
        minOrder: Math.round(parseFloat(minOrder || "0") * 100),
        packagingFee: Math.round(parseFloat(packagingFee || "0") * 100),
        avgPrepTimeMins: parseInt(avgPrepTime || "15"),
      });
      toast.success("Profile updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.error("Please fill both password fields");
      return;
    }
    try {
      await changePassword.mutateAsync({ oldPassword, newPassword });
      toast.success("Password changed");
      setOldPassword("");
      setNewPassword("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    }
  };

  const handleLogout = () => {
    vendorAuth.logout();
    router.push("/vendor/login");
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 lg:px-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <h1 className="text-2xl font-black text-ink">Settings</h1>

      {/* Profile section */}
      <section className="mt-6">
        <h2 className="text-lg font-bold text-ink">Shop Profile</h2>
        <div className="mt-4 space-y-4 rounded-xl bg-surface p-4 shadow-sm">
          <Field label="Shop Name" value={name} onChange={setName} />
          <Field label="Description" value={description} onChange={setDescription} multiline />
          <Field label="Location / Area" value={area} onChange={setArea} />
          <Field label="Avg Prep Time (minutes)" value={avgPrepTime} onChange={setAvgPrepTime} type="number" />
        </div>
      </section>

      {/* Fees */}
      <section className="mt-6">
        <h2 className="text-lg font-bold text-ink">Pricing</h2>
        <div className="mt-4 space-y-4 rounded-xl bg-surface p-4 shadow-sm">
          <Field label="Minimum Order (₹)" value={minOrder} onChange={setMinOrder} type="number" />
          <Field label="Packaging Fee (₹)" value={packagingFee} onChange={setPackagingFee} type="number" />
        </div>
      </section>

      {/* UPI */}
      <section className="mt-6">
        <h2 className="text-lg font-bold text-ink">UPI Settings</h2>
        <div className="mt-4 space-y-4 rounded-xl bg-surface p-4 shadow-sm">
          <Field label="UPI ID" value={upiId} onChange={setUpiId} placeholder="yourname@upi" />
        </div>
      </section>

      <Button
        fullWidth
        size="lg"
        className="mt-6"
        onClick={handleSaveProfile}
        disabled={updateProfile.isPending}
      >
        {updateProfile.isPending ? "Saving…" : "Save Profile"}
      </Button>

      {/* Account section */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-ink">Account</h2>
        <div className="mt-4 rounded-xl bg-surface p-4 shadow-sm">
          <p className="text-sm text-ink-soft">
            Email: <span className="font-medium text-ink">{vendorAuth.vendor?.email}</span>
          </p>

          <div className="mt-4 space-y-4">
            <Field label="Current Password" value={oldPassword} onChange={setOldPassword} type="password" />
            <Field label="New Password" value={newPassword} onChange={setNewPassword} type="password" />
          </div>

          <Button
            variant="secondary"
            fullWidth
            className="mt-4"
            onClick={handleChangePassword}
            disabled={changePassword.isPending}
          >
            {changePassword.isPending ? "Changing…" : "Change Password"}
          </Button>
        </div>
      </section>

      {/* Hours link */}
      <section className="mt-6">
        <a
          href="/vendor/hours"
          className="block rounded-xl bg-surface p-4 text-sm font-semibold text-accent-600 shadow-sm hover:bg-accent-50 transition-colors"
        >
          ⏰ Manage Operating Hours →
        </a>
      </section>

      {/* Logout */}
      <Button
        variant="secondary"
        fullWidth
        size="lg"
        className="mt-8 text-danger"
        onClick={handleLogout}
      >
        Log out
      </Button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full rounded-xl border border-line bg-surface-muted px-3 py-2.5 text-sm focus:outline-none focus:border-accent-400"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-line bg-surface-muted px-3 text-sm focus:outline-none focus:border-accent-400"
        />
      )}
    </div>
  );
}
