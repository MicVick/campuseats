"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import {
  useRequestOtp,
  useVerifyOtp,
  useGoogleAuth,
  useUpdateProfile,
} from "@/hooks/useAuth";
import { OtpInput } from "@/components/OtpInput";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { ApiError } from "@/hooks/api";

const IIMA_DOMAIN = "@iima.ac.in";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const toast = useToast();

  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);

  const [step, setStep] = useState<"email" | "otp" | "name">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [resendIn, setResendIn] = useState(0);

  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();
  const googleAuth = useGoogleAuth();
  const updateProfile = useUpdateProfile();

  // Already logged in → leave the login screen.
  useEffect(() => {
    if (hydrated && token && step !== "name") router.replace(next);
  }, [hydrated, token, next, router, step]);

  // Resend countdown
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (resendIn <= 0) return;
    timerRef.current = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resendIn]);

  const emailValid = email.trim().toLowerCase().endsWith(IIMA_DOMAIN);

  const sendOtp = async () => {
    if (!emailValid) {
      toast.error(`Only ${IIMA_DOMAIN} email addresses are allowed`);
      return;
    }
    try {
      await requestOtp.mutateAsync(email.trim().toLowerCase());
      setStep("otp");
      setResendIn(60);
      toast.success("OTP sent! Check the dev console (123456 in dev).");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't send OTP");
    }
  };

  const submitOtp = async (value?: string) => {
    const finalCode = (value ?? code).replace(/\s/g, "");
    if (finalCode.length !== 6) return;
    try {
      const res = await verifyOtp.mutateAsync({
        email: email.trim().toLowerCase(),
        code: finalCode,
      });
      if (res.isNewUser) {
        setName("");
        setStep("name");
      } else {
        toast.success(`Welcome back, ${res.user.name.split(" ")[0]}!`);
        router.replace(next);
      }
    } catch (e) {
      setCode("");
      toast.error(e instanceof ApiError ? e.message : "Invalid OTP");
    }
  };

  const saveName = async () => {
    if (name.trim().length < 1) {
      toast.error("Please enter your name");
      return;
    }
    try {
      await updateProfile.mutateAsync({ name: name.trim() });
      toast.success("You're all set!");
      router.replace(next);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't save name");
    }
  };

  // Demo Google sign-in: crafts an unsigned JWT the dev backend decodes.
  // In production this is replaced by Google Identity Services credential.
  const demoGoogle = async () => {
    const payload = {
      email: "demo.google@iima.ac.in",
      name: "Demo Google User",
    };
    const fakeJwt = `eyJhbGciOiJub25lIn0.${btoa(JSON.stringify(payload))}.sig`;
    try {
      const res = await googleAuth.mutateAsync(fakeJwt);
      if (res.isNewUser) {
        setName(res.user.name);
        setStep("name");
      } else {
        router.replace(next);
      }
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Google sign-in failed");
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-surface px-6">
      {/* Brand */}
      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-500 text-3xl shadow-lg shadow-accent-500/30">
            🍴
          </div>
          <h1 className="text-2xl font-black text-ink">CampusEats</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Order from campus vendors. Pickup, fast.
          </p>
        </div>

        {step === "email" && (
          <div className="animate-fade-in space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">
                IIMA Email
              </label>
              <input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                placeholder={`yourname${IIMA_DOMAIN}`}
                className="h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-200"
              />
              {email.length > 0 && !emailValid && (
                <p className="mt-1.5 text-xs text-danger">
                  Only {IIMA_DOMAIN} addresses are allowed.
                </p>
              )}
            </div>
            <Button
              fullWidth
              size="lg"
              onClick={sendOtp}
              loading={requestOtp.isPending}
              disabled={!emailValid}
            >
              Continue with IIMA Email
            </Button>

            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-line" />
              <span className="text-xs font-medium text-ink-faint">OR</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <Button
              fullWidth
              size="lg"
              variant="secondary"
              onClick={demoGoogle}
              loading={googleAuth.isPending}
            >
              <span className="text-base">G</span>
              Sign in with Google
            </Button>
            <p className="text-center text-xs text-ink-faint">
              Restricted to IIMA Google accounts ({IIMA_DOMAIN}).
            </p>
          </div>
        )}

        {step === "otp" && (
          <div className="animate-fade-in space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-bold text-ink">Enter the code</h2>
              <p className="mt-1 text-sm text-ink-soft">
                We sent a 6-digit code to
                <br />
                <span className="font-semibold text-ink">{email}</span>
              </p>
            </div>
            <OtpInput
              value={code}
              onChange={setCode}
              onComplete={submitOtp}
              disabled={verifyOtp.isPending}
            />
            <Button
              fullWidth
              size="lg"
              onClick={() => submitOtp()}
              loading={verifyOtp.isPending}
              disabled={code.replace(/\s/g, "").length !== 6}
            >
              Verify & Continue
            </Button>
            <div className="text-center text-sm">
              {resendIn > 0 ? (
                <span className="text-ink-faint">Resend code in {resendIn}s</span>
              ) : (
                <button
                  onClick={sendOtp}
                  className="font-semibold text-accent-600"
                >
                  Resend code
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setStep("email");
                setCode("");
              }}
              className="mx-auto block text-sm font-medium text-ink-soft"
            >
              ← Change email
            </button>
          </div>
        )}

        {step === "name" && (
          <div className="animate-fade-in space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-bold text-ink">What's your name?</h2>
              <p className="mt-1 text-sm text-ink-soft">
                So vendors know who's picking up.
              </p>
            </div>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              placeholder="Your full name"
              className="h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-200"
            />
            <Button
              fullWidth
              size="lg"
              onClick={saveName}
              loading={updateProfile.isPending}
            >
              Get Started
            </Button>
          </div>
        )}
      </div>

      <p className="pb-8 text-center text-xs text-ink-faint">
        By continuing you agree to CampusEats' campus dining guidelines.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
