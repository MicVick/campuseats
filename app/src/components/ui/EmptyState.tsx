"use client";

export function EmptyState({
  icon = "🍽️",
  title,
  message,
  action,
}: {
  icon?: string;
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-muted text-4xl">
        {icon}
      </div>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {message && (
        <p className="mt-1.5 max-w-xs text-sm text-ink-soft">{message}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon="😕"
      title="Couldn't load this"
      message={message}
      action={
        onRetry ? (
          <button
            onClick={onRetry}
            className="h-10 rounded-xl bg-accent-500 px-5 text-sm font-semibold text-white hover:bg-accent-600"
          >
            Try again
          </button>
        ) : undefined
      }
    />
  );
}
