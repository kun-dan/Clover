import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bell, BookOpen, Plus } from "lucide-react";
import { libraryApi, LIBRARY_STATUSES, STATUS_LABELS, type LibraryStatus } from "@/api/library";
import { updatesApi } from "@/api/updates";
import { useAuthStore } from "@/store/authStore";
import { Topbar } from "@/components/layout/Topbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { timeAgo } from "@/lib/utils";

const STATUS_TABS: { label: string; value: LibraryStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  ...LIBRARY_STATUSES.map((value) => ({ label: STATUS_LABELS[value], value })),
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<LibraryStatus | "ALL">("ALL");

  const { data: library, isPending: libLoading } = useQuery({
    queryKey: ["library", activeTab],
    queryFn: () => libraryApi.getAll(activeTab === "ALL" ? undefined : activeTab),
  });

  const { data: updates } = useQuery({
    queryKey: ["updates-recent"],
    queryFn: () => updatesApi.getAll(true),
  });

  const unreadCount = updates?.length ?? 0;

  return (
    <>
      <Topbar
        title={`Good reading, ${user?.displayName?.split(" ")[0] ?? "reader"}`}
        actions={
          <Link
            to="/search"
            className="flex items-center gap-1.5 text-sm text-mist/60 hover:text-mist transition-colors duration-150 px-3 py-1.5 rounded-lg border border-surface-border hover:border-clover-800"
          >
            <Plus className="w-3.5 h-3.5" />
            Add series
          </Link>
        }
      />

      <div className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
        {/* Library */}
        <div className="flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-surface-elevated border border-surface-border rounded-xl p-1 w-fit">
            {STATUS_TABS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors duration-150 ${
                  activeTab === value
                    ? "bg-clover-600 text-white font-medium"
                    : "text-mist/50 hover:text-mist"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Entries grid */}
          {libLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 bg-surface-elevated border border-surface-border rounded-xl overflow-hidden">
                  <Skeleton className="aspect-[3/4]" />
                  <div className="p-3 flex flex-col gap-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : library?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-mist/30">
              <BookOpen className="w-12 h-12 mb-3" />
              <p className="text-sm font-medium">Your library is empty</p>
              <p className="text-xs mt-1">Search for a series to add it</p>
              <Link to="/search" className="mt-4 text-sm text-clover-400 hover:text-clover-300 transition-colors duration-150">
                Browse catalog →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {library?.map((entry) => (
                <Link
                  key={entry.id}
                  to={`/series/${entry.seriesId}`}
                  className="group flex flex-col bg-surface-elevated border border-surface-border rounded-xl overflow-hidden hover:border-clover-800/60 transition-colors duration-200 shadow-card hover:shadow-card-hover"
                >
                  <div className="aspect-[3/4] relative overflow-hidden bg-surface-floating">
                    {entry.series.coverUrl ? (
                      <>
                        <img
                          src={entry.series.coverUrl}
                          alt={entry.series.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-mist/20" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                      <span className="text-xs text-mist/70">Ch. {entry.currentChapter}</span>
                      {entry.series.latestChapter && parseFloat(entry.currentChapter) < parseFloat(entry.series.latestChapter) && (
                        <span className="w-2 h-2 rounded-full bg-gold-400 shadow-glow-gold" title="New chapters available" />
                      )}
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-1.5">
                    <p className="text-xs font-medium text-mist line-clamp-2 leading-snug">{entry.series.title}</p>
                    <StatusBadge status={entry.status as LibraryStatus} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Updates sidebar */}
        <aside className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-mist">
              Recent updates
              {unreadCount > 0 && (
                <span className="ml-2 bg-gold-500 text-surface-base text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h2>
            <Link to="/updates" className="text-xs text-clover-400 hover:text-clover-300 transition-colors duration-150">
              See all
            </Link>
          </div>

          {!updates || updates.length === 0 ? (
            <div className="bg-surface-elevated border border-surface-border rounded-xl p-6 flex flex-col items-center text-mist/30 text-xs text-center gap-2">
              <Bell className="w-8 h-8" />
              No new chapters
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {updates.slice(0, 8).map((u) => (
                <Link
                  key={u.id}
                  to={`/series/${u.series.id}`}
                  className="flex items-center gap-3 bg-surface-elevated border border-surface-border rounded-xl p-3 hover:border-clover-800/40 transition-colors duration-150"
                >
                  <div className="relative flex-shrink-0">
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
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gold-400 border border-surface-base" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-xs font-medium text-mist truncate">{u.series.title}</p>
                    <p className="text-xs text-clover-400">Chapter {u.chapter.number}</p>
                    <p className="text-xs text-mist/30">{timeAgo(u.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
