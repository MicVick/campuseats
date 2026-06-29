"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { XIcon } from "@/components/icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Non-intrusive PWA install banner.
 * Shown after the `beforeinstallprompt` event fires (i.e., the browser
 * has determined the app meets installability criteria).
 * Dismissed for 7 days if the user closes it.
 */
export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user recently dismissed
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const ts = parseInt(dismissed, 10);
      if (Date.now() - ts < 7 * 24 * 60 * 60 * 1000) return; // 7 days
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("pwa-install-dismissed", String(Date.now()));
  };

  if (!show) return null;

  return (
    <div className="animate-slide-up fixed bottom-20 left-4 right-4 z-40 flex items-center gap-3 rounded-2xl bg-ink p-4 shadow-lg sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="flex-1">
        <p className="text-sm font-bold text-white">Add CampusEats to Home</p>
        <p className="mt-0.5 text-xs text-white/70">
          Quick access, works offline
        </p>
      </div>
      <Button size="sm" onClick={handleInstall} className="shrink-0">
        Install
      </Button>
      <button
        onClick={handleDismiss}
        className="shrink-0 text-white/50 hover:text-white"
        aria-label="Dismiss"
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
