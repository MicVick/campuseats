"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState, EmptyState } from "@/components/ui/EmptyState";
import { ChevronLeftIcon } from "@/components/icons";
import { Stars } from "@/components/ui/StarRating";
import { formatDate, cn } from "@/utils/format";
import type { MvrcReport } from "@/types";

interface MvrcVendorMeta {
  id: string;
  name: string;
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.round((score / 5) * 100);
  const tone =
    score >= 4 ? "bg-veg" : score >= 3 ? "bg-warning" : "bg-danger";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-bold text-ink">{score.toFixed(1)}/5</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MvrcReportPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["mvrc-reports", id],
    queryFn: () =>
      apiFetch<(MvrcReport & { vendor?: MvrcVendorMeta })[]>(
        `/vendors/${id}/mvrc-reports`
      ),
  });

  const report = data?.[0];

  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-surface/95 px-4 py-3 backdrop-blur">
        <Link
          href={`/vendors/${id}`}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-ink"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-ink">MVRC Report</h1>
      </header>

      <main className="px-4 py-5">
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        )}

        {isError && <ErrorState onRetry={() => refetch()} />}

        {!isLoading && !isError && !report && (
          <EmptyState
            icon="📋"
            title="Pending assessment"
            message="This vendor hasn't been assessed by the Mess & Vendor Review Committee yet."
          />
        )}

        {report && (
          <div className="space-y-5">
            {/* Overall */}
            <div className="rounded-2xl bg-mvrc-soft p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-mvrc">
                Overall MVRC Rating
              </p>
              <p className="mt-1 text-4xl font-black text-mvrc">
                {report.rating.toFixed(1)}
                <span className="text-xl font-bold text-mvrc/60">/5</span>
              </p>
              <div className="mt-2 flex justify-center">
                <Stars value={report.rating} size={20} />
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                Last assessed {formatDate(report.assessmentDate)} · by{" "}
                {report.createdBy}
              </p>
            </div>

            {/* Score breakdown */}
            <div className="space-y-4 rounded-2xl border border-line p-5">
              <h2 className="text-sm font-bold text-ink">Score Breakdown</h2>
              <ScoreBar label="Hygiene" score={report.hygieneScore} />
              <ScoreBar label="Food Quality" score={report.foodQualityScore} />
            </div>

            {/* Notes */}
            {report.complianceNotes && (
              <div className="rounded-2xl border border-line p-5">
                <h2 className="mb-1.5 text-sm font-bold text-ink">
                  Compliance Notes
                </h2>
                <p className="text-sm text-ink-soft">{report.complianceNotes}</p>
              </div>
            )}

            {/* Corrective actions */}
            {report.correctiveActions && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <h2 className="mb-1.5 text-sm font-bold text-warning">
                  Corrective Actions
                </h2>
                <p className="text-sm text-ink-soft">
                  {report.correctiveActions}
                </p>
              </div>
            )}

            {/* PDF link */}
            {report.reportUrl && (
              <a
                href={report.reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface py-3 text-sm font-semibold text-mvrc"
              >
                📄 Open full PDF report
              </a>
            )}

            <p className="px-2 text-center text-xs text-ink-faint">
              MVRC ratings are set by the Mess & Vendor Review Committee for
              transparency. Vendors cannot edit these reports.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
