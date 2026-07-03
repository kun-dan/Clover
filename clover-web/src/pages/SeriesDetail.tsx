import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, BookOpen, BookMarked, Radio, CheckCircle2 } from "lucide-react";
import { seriesApi, type ReadingSourceDto } from "@/api/series";
import { libraryApi, type LibraryStatus } from "@/api/library";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { timeAgo } from "@/lib/utils";

const STATUS_OPTIONS: { value: LibraryStatus; label: string }[] = [
  { value: "READING", label: "Reading" },
  { value: "PLAN_TO_READ", label: "Plan to Read" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DROPPED", label: "Dropped" },
];

// Best-effort: only providers with a predictable numeric chapter URL (AsuraScans)
// support jumping straight to the next chapter; everything else just opens the
// source's page since there's no reliable "+1" URL to build.
function openHref(source: ReadingSourceDto, currentChapter: string | undefined): string {
  if (source.provider === "asurascans" && currentChapter !== undefined) {
    const next = Math.floor(parseFloat(currentChapter)) + 1;
    return `${source.url.replace(/\/$/, "")}/chapter/${next}`;
  }
  return source.url;
}

export default function SeriesDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceLabel, setNewSourceLabel] = useState("");
  const [newSourceProvider, setNewSourceProvider] = useState<"custom" | "asurascans">("custom");
  const [showAddSource, setShowAddSource] = useState(false);

  const { data: series, isPending } = useQuery({
    queryKey: ["series", id],
    queryFn: () => seriesApi.getById(id!),
    enabled: !!id,
  });

  const { data: sources } = useQuery({
    queryKey: ["sources", id],
    queryFn: () => seriesApi.getSources(id!),
    enabled: !!id,
  });

  const { data: library } = useQuery({
    queryKey: ["library"],
    queryFn: () => libraryApi.getAll(),
  });

  const entry = library?.find((e) => e.seriesId === id);
  const latestKnownChapter = series?.selectedSource?.latestChapter ?? series?.latestChapter ?? null;

  const addMutation = useMutation({
    mutationFn: () => libraryApi.add(id!, "PLAN_TO_READ"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["library"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { status?: LibraryStatus; currentChapter?: number; selectedSourceId?: string | null }) =>
      libraryApi.update(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["library"] });
      qc.invalidateQueries({ queryKey: ["series", id] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => libraryApi.remove(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["library"] }),
  });

  const addSourceMutation = useMutation({
    mutationFn: () => seriesApi.addSource(id!, newSourceUrl, newSourceLabel, newSourceProvider),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sources", id] });
      setNewSourceUrl("");
      setNewSourceLabel("");
      setNewSourceProvider("custom");
      setShowAddSource(false);
    },
  });

  const deleteSourceMutation = useMutation({
    mutationFn: (sourceId: string) => seriesApi.deleteSource(id!, sourceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sources", id] }),
  });

  if (isPending) {
    return (
      <>
        <Topbar title="Series" />
        <div className="p-6 flex gap-8">
          <Skeleton className="w-48 h-72 flex-shrink-0 rounded-xl" />
          <div className="flex flex-col gap-4 flex-1">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </>
    );
  }

  if (!series) return null;

  return (
    <>
      <Topbar title={series.title} />
      <div className="flex-1 p-6 max-w-4xl">
        {/* Banner */}
        {series.bannerUrl && (
          <div className="relative h-32 rounded-xl overflow-hidden mb-6 -mt-0">
            <img src={series.bannerUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/30 to-transparent" />
          </div>
        )}

        {/* Top section */}
        <div className="flex gap-6 mb-8">
          {/* Cover */}
          <div className="flex-shrink-0 w-36 md:w-48">
            {series.coverUrl ? (
              <img
                src={series.coverUrl}
                alt={series.title}
                className="w-full rounded-xl shadow-card border border-surface-border"
              />
            ) : (
              <div className="w-full aspect-[3/4] rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-mist/20" />
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-col gap-3 min-w-0 flex-1">
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-mist leading-tight tracking-tight">
              {series.title}
            </h1>
            {series.titleRomaji && series.titleRomaji !== series.title && (
              <p className="text-sm text-mist/40">{series.titleRomaji}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {series.seriesStatus && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                  series.seriesStatus === "RELEASING"
                    ? "bg-clover-900 text-clover-400 border-clover-700"
                    : "bg-surface-floating text-mist/50 border-surface-border"
                }`}>
                  {series.seriesStatus}
                </span>
              )}
              {series.latestChapter && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-floating text-mist/60 border border-surface-border">
                  Latest: Ch. {series.latestChapter}
                </span>
              )}
            </div>

            {series.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {series.genres.map((g) => (
                  <span key={g} className="text-xs text-mist/50 bg-surface-floating px-2 py-0.5 rounded border border-surface-border/50">
                    {g}
                  </span>
                ))}
              </div>
            )}

            {series.description && (
              <p className="text-sm text-mist/60 leading-reading line-clamp-4 mt-1">
                {series.description.replace(/<[^>]*>/g, "")}
              </p>
            )}

            {/* Library actions */}
            <div className="flex flex-col gap-3 mt-auto pt-2">
              {!entry ? (
                <Button onClick={() => addMutation.mutate()} loading={addMutation.isPending} className="w-fit">
                  <BookMarked className="w-4 h-4" /> Add to library
                </Button>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={entry.status as LibraryStatus} />
                  <select
                    value={entry.status}
                    onChange={(e) => updateMutation.mutate({ status: e.target.value as LibraryStatus })}
                    className="text-sm bg-surface-floating border border-surface-border rounded-lg px-2 py-1 text-mist focus:outline-none focus:border-clover-500"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-mist/50">Chapter</label>
                    <input
                      type="number"
                      value={Math.round(parseFloat(entry.currentChapter))}
                      min={0}
                      step={1}
                      onChange={(e) => updateMutation.mutate({ currentChapter: Math.round(parseFloat(e.target.value) || 0) })}
                      className="w-20 text-sm bg-surface-floating border border-surface-border rounded-lg px-2 py-1 text-mist focus:outline-none focus:border-clover-500"
                    />
                  </div>
                  {latestKnownChapter && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateMutation.mutate({ currentChapter: Math.floor(parseFloat(latestKnownChapter)) })}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Caught up
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeMutation.mutate()}
                    loading={removeMutation.isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reading Sources */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-mist">Reading sources</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowAddSource((v) => !v)}>
              <Plus className="w-3.5 h-3.5" /> Add link
            </Button>
          </div>

          {showAddSource && (
            <div className="bg-surface-elevated border border-surface-border rounded-xl p-4 mb-3 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-mist/50">Provider</label>
                <select
                  value={newSourceProvider}
                  onChange={(e) => setNewSourceProvider(e.target.value as "custom" | "asurascans")}
                  className="text-sm bg-surface-floating border border-surface-border rounded-lg px-2 py-1.5 text-mist focus:outline-none focus:border-clover-500"
                >
                  <option value="custom">Custom link (no auto chapter tracking)</option>
                  <option value="asurascans">AsuraScans</option>
                </select>
              </div>
              <Input
                placeholder="https://asurascans.com/comics/..."
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                label="URL"
              />
              <Input
                placeholder="e.g. AsuraScans"
                value={newSourceLabel}
                onChange={(e) => setNewSourceLabel(e.target.value)}
                label="Label"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => addSourceMutation.mutate()}
                  disabled={!newSourceUrl || !newSourceLabel}
                  loading={addSourceMutation.isPending}
                >
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddSource(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {!sources || sources.length === 0 ? (
              <p className="text-sm text-mist/30 py-4">No reading sources added yet.</p>
            ) : (
              sources.map((source) => {
                const isTracked = entry?.selectedSourceId === source.id;
                return (
                  <div
                    key={source.id}
                    className={`flex items-center justify-between bg-surface-elevated border rounded-xl px-4 py-3 ${
                      isTracked ? "border-clover-600" : "border-surface-border"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-mist">{source.label}</p>
                        {isTracked && source.latestChapter && (
                          <p className="text-xs text-clover-400 mt-0.5">
                            Ch. {source.latestChapter}
                            {source.lastCheckedAt && ` · checked ${timeAgo(source.lastCheckedAt)}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {entry && (
                        <button
                          onClick={() =>
                            updateMutation.mutate({ selectedSourceId: isTracked ? null : source.id })
                          }
                          title={isTracked ? "Stop tracking this source" : "Track this source"}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors duration-150 ${
                            isTracked
                              ? "border-clover-600 bg-clover-900 text-clover-400"
                              : "border-surface-border text-mist/40 hover:text-mist/70"
                          }`}
                        >
                          <Radio className="w-3 h-3" /> {isTracked ? "Tracked" : "Track"}
                        </button>
                      )}
                      <a
                        href={openHref(source, entry?.currentChapter)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-clover-400 hover:text-clover-300 transition-colors duration-150 px-2 py-1"
                      >
                        Open →
                      </a>
                      {source.isUserDefined && (
                        <button
                          onClick={() => deleteSourceMutation.mutate(source.id)}
                          className="p-1.5 text-mist/30 hover:text-red-400 transition-colors duration-150 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </>
  );
}
