import type { LibraryStatus } from "@/api/library";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<LibraryStatus, string> = {
  READING: "Reading",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
  PLAN_TO_READ: "Plan to Read",
};

const STATUS_STYLES: Record<LibraryStatus, string> = {
  READING: "bg-clover-900 text-clover-300 border-clover-700",
  COMPLETED: "bg-surface-floating text-mist/60 border-surface-border",
  DROPPED: "bg-red-950 text-red-400 border-red-900",
  PLAN_TO_READ: "bg-surface-elevated text-mist/50 border-surface-border",
};

export function StatusBadge({ status, className }: { status: LibraryStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
