"use client";

import { useRef, useState } from "react";
import { cn } from "@/utils/format";

/** Resize an image File to a compressed JPEG data URL (client-side, no upload
 *  server needed). Keeps the longest edge <= maxDim so it fits comfortably in
 *  the DB's imageUrl field and renders fast. */
function fileToResizedDataUrl(file: File, maxDim = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unsupported"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({
  value,
  onChange,
  label,
  hint,
  aspect = "wide",
  rounded = "xl",
  className,
}: {
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
  label?: string;
  hint?: string;
  aspect?: "wide" | "square";
  rounded?: "xl" | "full";
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be under 8 MB");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError("Couldn't process that image");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div
          className={cn(
            "group relative overflow-hidden border border-line bg-surface-muted",
            aspect === "wide" ? "aspect-[16/9]" : "aspect-square",
            rounded === "full" ? "rounded-full" : "rounded-xl"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-white shadow"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-1.5 border-2 border-dashed border-line bg-surface-muted text-ink-faint transition-colors hover:border-accent-300 hover:bg-accent-50",
            aspect === "wide" ? "aspect-[16/9]" : "aspect-square",
            rounded === "full" ? "rounded-full" : "rounded-xl"
          )}
        >
          {busy ? (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent-400 border-t-transparent" />
          ) : (
            <>
              <span className="text-2xl">📷</span>
              <span className="text-xs font-semibold">Upload photo</span>
            </>
          )}
        </button>
      )}

      {hint && !error && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
