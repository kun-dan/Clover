import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Plus, Trash2, BookOpen, BookMarked } from "lucide-react";
import { seriesApi } from "@/api/series";
import { libraryApi, type LibraryStatus } from "@/api/library";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";

const STATUS_OPTIONS: { value: LibraryStatus; label: string }[] = [
  { value: "READING", label: "Reading" },
  { value: "PLAN_TO_READ", label: "Plan to Read" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DROPPED", label: "Dropped" },
];

export default function SeriesDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceLabel, setNewSourceLabel] = useState("");
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

  const addMutation = useMutation({
    mutationFn: () => libraryApi.add(id!, "PLAN_TO_READ"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["library"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { status?: LibraryStatus; currentChapter?: number }) =>
      libraryApi.update(id!, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["library"] }),
  });

  const removeMutation = useMutation({
    mutationFn: () => libraryApi.remove(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["library"] }),
  });

  const addSourceMutation = useMutation({
    mutationFn: () => seriesApi.addSource(id!, newSourceUrl, newSourceLabel),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sources", id] });
      setNewSourceUrl("");
      setNewSourceLabel("");
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
                      value={parseFloat(entry.currentChapter)}
                      min={0}
                      step={0.5}
                      onChange={(e) => updateMutation.mutate({ currentChapter: parseFloat(e.target.value) })}
                      className="w-20 text-sm bg-surface-floating border border-surface-border rounded-lg px-2 py-1 text-mist focus:outline-none focus:border-clover-500"
                    />
                  </div>
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
              <Input
                placeholder="https://asurascans.com/manga/..."
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
              sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between bg-surface-elevated border border-surface-border rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ExternalLink className="w-4 h-4 text-mist/40 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-mist">{source.label}</p>
                      <p className="text-xs text-mist/30 truncate">{source.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={source.url}
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
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}
