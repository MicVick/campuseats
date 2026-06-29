"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/api";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/types";

interface VerifyOtpResult {
  token: string;
  user: User;
  isNewUser: boolean;
}

export function useRequestOtp() {
  return useMutation({
    mutationFn: (email: string) =>
      apiFetch<{ message: string }>("/auth/request-otp", {
        method: "POST",
        body: { email },
      }),
  });
}

export function useVerifyOtp() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      apiFetch<VerifyOtpResult>("/auth/verify-otp", {
        method: "POST",
        body: { email, code },
      }),
    onSuccess: (data) => login(data.token, data.user),
  });
}

export function useGoogleAuth() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: (idToken: string) =>
      apiFetch<VerifyOtpResult>("/auth/google", {
        method: "POST",
        body: { idToken },
      }),
    onSuccess: (data) => login(data.token, data.user),
  });
}

/** Update the current user's profile (name). */
export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (patch: { name: string }) =>
      apiFetch<User>("/me", { method: "PATCH", auth: "student", body: patch }),
    onSuccess: (user) => setUser(user),
  });
}
