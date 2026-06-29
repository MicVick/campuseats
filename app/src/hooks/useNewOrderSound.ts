"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to play a notification sound when new orders arrive.
 * Uses the Web Audio API to generate a simple chime.
 */
export function useNewOrderSound(orderCount: number | undefined) {
  const prevCountRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Skip first render (initialization)
    if (prevCountRef.current === undefined) {
      prevCountRef.current = orderCount ?? 0;
      return;
    }

    const current = orderCount ?? 0;
    const prev = prevCountRef.current;
    prevCountRef.current = current;

    // Play sound only when count increases
    if (current > prev) {
      playChime();
    }
  }, [orderCount]);
}

function playChime() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
    oscillator.frequency.setValueAtTime(1047, ctx.currentTime + 0.1); // C6
    oscillator.frequency.setValueAtTime(1319, ctx.currentTime + 0.2); // E6

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not supported — silent
  }
}
