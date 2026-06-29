"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useOrder, useSubmitReview, useSubmitFeedback } from "@/hooks/useOrders";
import { RequireAuth } from "@/components/student/RequireAuth";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { StarInput } from "@/components/ui/StarRating";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/EmptyState";
import { ChevronLeftIcon } from "@/components/icons";
import { cn } from "@/utils/format";

function FeedbackInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { data: order, isLoading, isError, refetch } = useOrder(id);

  // Review state
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const submitReview = useSubmitReview();

  // Feedback state
  const [foodQuality, setFoodQuality] = useState(0);
  const [hygiene, setHygiene] = useState(0);
  const [valueForMoney, setValueForMoney] = useState(0);
  const [comments, setComments] = useState("");
  const [flagForMvrc, setFlagForMvrc] = useState(false);
  const submitFeedback = useSubmitFeedback();

  const [step, setStep] = useState<"review" | "feedback">("review");

  if (isLoading) {
    return (
      <div className="min-h-dvh">
        <BackHeader orderId={id} />
        <div className="space-y-4 p-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-dvh">
        <BackHeader orderId={id} />
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const alreadyReviewed = order.hasReview || !!order.review;
  const showReview = step === "review" && !alreadyReviewed;
  const showFeedback = step === "feedback" || alreadyReviewed;

  const handleReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    try {
      await submitReview.mutateAsync({
        orderId: id,
        rating,
        text: reviewText.trim() || undefined,
      });
      toast.success("Review submitted!");
      setStep("feedback");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    }
  };

  const handleFeedback = async () => {
    if (foodQuality === 0 || hygiene === 0 || valueForMoney === 0) {
      toast.error("Please rate all categories");
      return;
    }
    try {
      await submitFeedback.mutateAsync({
        orderId: id,
        foodQuality,
        hygiene,
        valueForMoney,
        comments: comments.trim() || undefined,
        flagForMvrc,
      });
      toast.success("Thank you! Your feedback helps improve campus dining.");
      router.push(`/orders/${id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit feedback");
    }
  };

  return (
    <div className="min-h-dvh pb-24">
      <BackHeader orderId={id} />

      <div className="px-4 py-4">
        <p className="text-sm text-ink-soft">Order from <span className="font-semibold text-ink">{order.vendor?.name}</span></p>

        {/* Review section */}
        {showReview && (
          <div className="mt-6 animate-slide-up">
            <h2 className="text-lg font-bold text-ink">How was your order?</h2>
            <p className="mt-1 text-sm text-ink-soft">Rate your experience</p>

            <div className="mt-4 flex justify-center">
              <StarInput value={rating} onChange={setRating} size={40} />
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write a review (optional)"
              rows={3}
              maxLength={1000}
              className="mt-4 w-full rounded-xl border border-line bg-surface-muted px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent-400 focus:outline-none"
            />

            <Button
              fullWidth
              size="lg"
              className="mt-4"
              onClick={handleReview}
              disabled={submitReview.isPending}
            >
              {submitReview.isPending ? "Submitting…" : "Submit Review"}
            </Button>

            <button
              onClick={() => setStep("feedback")}
              className="mt-3 w-full text-center text-sm font-semibold text-ink-faint"
            >
              Skip to feedback →
            </button>
          </div>
        )}

        {/* Feedback section */}
        {showFeedback && (
          <div className="mt-6 animate-slide-up">
            <h2 className="text-lg font-bold text-ink">Food Feedback</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Help us improve campus dining quality
            </p>

            <div className="mt-5 space-y-5">
              <FeedbackCategory
                label="🍽️ Food Quality"
                value={foodQuality}
                onChange={setFoodQuality}
              />
              <FeedbackCategory
                label="🧼 Hygiene"
                value={hygiene}
                onChange={setHygiene}
              />
              <FeedbackCategory
                label="💰 Value for Money"
                value={valueForMoney}
                onChange={setValueForMoney}
              />
            </div>

            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Additional comments (optional)"
              rows={3}
              maxLength={1000}
              className="mt-5 w-full rounded-xl border border-line bg-surface-muted px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent-400 focus:outline-none"
            />

            {/* MVRC flag */}
            <label className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-surface-muted px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                checked={flagForMvrc}
                onChange={(e) => setFlagForMvrc(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-mvrc"
              />
              <div>
                <p className="text-sm font-semibold text-ink">Flag for MVRC Review</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Report serious hygiene or quality concerns to the Mess & Vendor Review Committee
                </p>
              </div>
            </label>

            <Button
              fullWidth
              size="lg"
              className="mt-5"
              onClick={handleFeedback}
              disabled={submitFeedback.isPending}
            >
              {submitFeedback.isPending ? "Submitting…" : "Submit Feedback"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedbackCategory({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold transition-colors",
              value >= n
                ? "border-accent-500 bg-accent-500 text-white"
                : "border-line bg-surface text-ink-faint"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function BackHeader({ orderId }: { orderId: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-surface/95 px-4 pb-3 pt-4 backdrop-blur">
      <Link href={`/orders/${orderId}`} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-ink">
        <ChevronLeftIcon className="h-5 w-5" />
      </Link>
      <h1 className="text-xl font-black text-ink">Rate & Feedback</h1>
    </header>
  );
}

export default function FeedbackPage() {
  return (
    <RequireAuth>
      <FeedbackInner />
    </RequireAuth>
  );
}
