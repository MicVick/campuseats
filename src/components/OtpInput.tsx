"use client";

import { useRef } from "react";

/** 6-box OTP entry with auto-advance, paste support, and auto-submit. */
export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");

  const setDigit = (i: number, d: string) => {
    const arr = value.padEnd(6, " ").slice(0, 6).split("");
    arr[i] = d || " ";
    const next = arr.join("").replace(/\s+$/g, "");
    onChange(next.trimEnd());
    const clean = next.replace(/\s/g, "");
    if (clean.length === 6) onComplete?.(clean);
  };

  const handleChange = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, "").slice(-1);
    setDigit(i, d);
    if (d && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i].trim() && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    onChange(text);
    if (text.length === 6) onComplete?.(text);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={d.trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          aria-label={`Digit ${i + 1}`}
          className="h-14 w-12 rounded-xl border border-line bg-white text-center text-xl font-bold text-ink outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-200 disabled:opacity-50"
        />
      ))}
    </div>
  );
}
