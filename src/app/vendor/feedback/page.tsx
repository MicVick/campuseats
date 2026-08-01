"use client";

import { useState } from "react";
import {
  useVendorReviews,
  useVendorFeedbackList,
  useVendorProfile,
} from "@/hooks/useVendorApi";
import { Stars } from "@/components/ui/StarRating";
import { RatingBadge, MvrcBadge, Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, cn } from "@/utils/format";

export default function VendorFeedbackPage() {
  const [tab, setTab] = useState<"reviews" | "feedback">("reviews");
  const { data: profile } = useVendorProfile();
  const { data: reviews, isLoading: loadingReviews } = useVendorReviews();
  const { data: feedback, isLoading: loadingFeedback } = useVendorFeedbackList();

  return (
    <div className="px-4 py-6 lg:px-8">
      <h1 className="text-2xl font-black text-ink">Ratings & Feedback</h1>

      {/* Overview */}
      {profile && (
        <div className="mt-4 flex flex-wrap gap-4 rounded-xl bg-surface p-4 shadow-sm">
          <div>
            <p className="text-xs text-ink-faint">User Rating</p>
            <div className="mt-1 flex items-center gap-2">
              <RatingBadge rating={profile.avgRating} count={profile.ratingCount} />
            </div>
          </div>
          <div>
            <p className="text-xs text-ink-faint">MVRC Rating</p>
            <div className="mt-1">
              <MvrcBadge rating={profile.mvrcRating} />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl bg-surface-muted p-1">
        {(["reviews", "feedback"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors capitalize",
              tab === t ? "bg-surface text-ink shadow-sm" : "text-ink-faint"
            )}
          >
            {t === "reviews" ? `Reviews (${reviews?.length ?? 0})` : `Feedback (${feedback?.length ?? 0})`}
          </button>
        ))}
      </div>

      {/* Reviews tab */}
      {tab === "reviews" && (
        <div className="mt-4 space-y-3">
          {loadingReviews && [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          {!loadingReviews && reviews && reviews.length === 0 && (
            <EmptyState icon="⭐" title="No reviews yet" message="Student reviews will appear here after completed orders." />
          )}
          {reviews?.map((review) => (
            <div key={review.id} className="rounded-xl bg-surface p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stars value={review.rating} />
                  <span className="text-sm font-semibold text-ink">{review.user.name}</span>
                </div>
                <span className="text-xs text-ink-faint">{formatDate(review.createdAt)}</span>
              </div>
              {review.text && (
                <p className="mt-2 text-sm text-ink-soft">{review.text}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Feedback tab */}
      {tab === "feedback" && (
        <div className="mt-4 space-y-3">
          {loadingFeedback && [1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          {!loadingFeedback && feedback && feedback.length === 0 && (
            <EmptyState icon="📝" title="No feedback yet" message="Food quality feedback from students will appear here." />
          )}
          {feedback?.map((fb) => (
            <div key={fb.id} className="rounded-xl bg-surface p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">{fb.user.name}</span>
                <div className="flex items-center gap-2">
                  {fb.isFlaggedForMvrc && (
                    <Badge tone="danger">MVRC Flag</Badge>
                  )}
                  <span className="text-xs text-ink-faint">{formatDate(fb.createdAt)}</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <ScoreBox label="Food Quality" score={fb.foodQuality} />
                <ScoreBox label="Hygiene" score={fb.hygiene} />
                <ScoreBox label="Value" score={fb.valueForMoney} />
              </div>
              {fb.comments && (
                <p className="mt-3 text-sm text-ink-soft">{fb.comments}</p>
              )}
              {fb.itemComments && (
                <p className="mt-1 text-xs text-ink-faint italic">Item notes: {fb.itemComments}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreBox({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-lg bg-surface-muted p-2">
      <p className="text-lg font-black text-ink">{score}/5</p>
      <p className="text-[10px] text-ink-faint">{label}</p>
    </div>
  );
}
