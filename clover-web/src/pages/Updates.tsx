import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, BookOpen, CheckCheck } from "lucide-react";
import { updatesApi } from "@/api/updates";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { timeAgo } from "@/lib/utils";

export default function Updates() {
  const qc = useQueryClient();

  const { data: updates, isPending } = useQuery({
    queryKey: ["updates"],
    queryFn: () => updatesApi.getAll(false),
    refetchInterval: 60_000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => updatesApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["updates"] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => updatesApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["updates"] }),
  });

  const unread = updates?.filter((u) => !u.isRead) ?? [];

  return (
    <>
      <Topbar
        title="Updates"
        actions={
          unread.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllMutation.mutate()}
              loading={markAllMutation.isPending}
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 p-6 max-w-2xl">
        {isPending ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 bg-surface-elevated border border-surface-border rounded-xl p-4">
                <Skeleton className="w-10 h-14 flex-shrink-0 rounded-md" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !updates?.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-mist/30 gap-3">
            <Bell className="w-12 h-12" />
            <p className="text-sm font-medium">No updates yet</p>
            <p className="text-xs">Add series to your library and we'll notify you when new chapters drop.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {unread.length > 0 && (
              <p className="text-xs font-medium text-gold-400 mb-1">
                {unread.length} unread
              </p>
            )}
            {updates.map((u) => (
              <div
                key={u.id}
                className={`flex items-center gap-4 rounded-xl p-4 border transition-colors duration-150 ${
                  !u.isRead
                    ? "bg-surface-elevated border-clover-800/40"
                    : "bg-surface-base border-surface-border opacity-60"
                }`}
              >
                {/* Cover */}
                <Link to={`/series/${u.series.id}`} className="flex-shrink-0">
                  {u.series.coverUrl ? (
                    <img
                      src={u.series.coverUrl}
                      alt=""
                      className="w-10 h-14 rounded-md object-cover border border-surface-border"
                    />
                  ) : (
                    <div className="w-10 h-14 rounded-md bg-surface-floating flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-mist/20" />
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <Link
                    to={`/series/${u.series.id}`}
                    className="text-sm font-medium text-mist hover:text-clover-400 transition-colors duration-150 truncate"
                  >
                    {u.series.title}
                  </Link>
                  <p className="text-sm text-clover-400 font-medium">
                    Chapter {u.chapter.number}
                  </p>
                  <p className="text-xs text-mist/30">
                    {u.chapter.provider} · {timeAgo(u.chapter.detectedAt)}
                  </p>
                </div>

                {/* Mark read */}
                {!u.isRead && (
                  <button
                    onClick={() => markReadMutation.mutate(u.id)}
                    className="flex-shrink-0 p-2 text-mist/30 hover:text-clover-400 rounded-lg hover:bg-surface-elevated transition-colors duration-150"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
