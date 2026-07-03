import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search as SearchIcon, Plus, Check, ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import { seriesApi, type SearchSort } from "@/api/series";
import { libraryApi } from "@/api/library";
import { Topbar } from "@/components/layout/Topbar";
import { SeriesCard, SeriesCardSkeleton } from "@/components/series/SeriesCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GENRES } from "@/lib/genres";

const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Rating" },
  { value: "title", label: "Title A-Z" },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState<SearchSort>("relevance");
  const [nsfw, setNsfw] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const qc = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["search", debouncedQuery, page, genre, sort, nsfw],
    queryFn: () => seriesApi.search(debouncedQuery, page, { genre: genre || undefined, sort, nsfw }),
    enabled: debouncedQuery.length >= 2,
  });

  // Track which series are in library
  const { data: library } = useQuery({
    queryKey: ["library"],
    queryFn: () => libraryApi.getAll(),
  });

  const inLibrary = new Set(library?.map((e) => e.seriesId) ?? []);

  const addMutation = useMutation({
    mutationFn: (seriesId: string) => libraryApi.add(seriesId, "PLAN_TO_READ"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["library"] }),
  });

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1);
  }, []);

  return (
    <>
      <Topbar title="Search catalog" />
      <div className="flex-1 p-6 flex flex-col gap-6">
        <div className="max-w-md">
          <Input
            value={query}
            onChange={handleQueryChange}
            placeholder="Search manga, manhwa…"
            icon={<SearchIcon className="w-4 h-4" />}
            autoFocus
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);
              setPage(1);
            }}
            className="text-sm bg-surface-floating border border-surface-border rounded-lg px-2 py-1.5 text-mist focus:outline-none focus:border-clover-500"
          >
            <option value="">All genres</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SearchSort);
              setPage(1);
            }}
            className="text-sm bg-surface-floating border border-surface-border rounded-lg px-2 py-1.5 text-mist focus:outline-none focus:border-clover-500"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>Sort: {o.label}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setNsfw((v) => !v);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-400 active:scale-[0.97] transition-transform duration-150 ${
              nsfw
                ? "border-gold-500/60 bg-gold-500/10 text-gold-300"
                : "border-surface-border text-mist/40 hover:text-mist/70"
            }`}
            title={nsfw ? "Showing adult content" : "Adult content hidden"}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {nsfw ? "NSFW: shown" : "NSFW: hidden"}
          </button>
        </div>

        {debouncedQuery.length < 2 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-mist/30 text-sm gap-2 py-24">
            <SearchIcon className="w-10 h-10 mb-2" />
            Type at least 2 characters to search
          </div>
        ) : isPending ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <SeriesCardSkeleton key={i} />)}
          </div>
        ) : !data?.results.length ? (
          <div className="flex-1 flex items-center justify-center text-mist/30 text-sm py-24">
            No results for "{debouncedQuery}"
          </div>
        ) : (
          <>
            <p className="text-xs text-mist/40">{data.pageInfo.total} results</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {data.results.map((series) => {
                const added = inLibrary.has(series.id);
                return (
                  <SeriesCard
                    key={series.id}
                    series={series}
                    action={
                      <Button
                        size="sm"
                        variant={added ? "secondary" : "primary"}
                        className="w-full text-xs"
                        onClick={() => !added && addMutation.mutate(series.id)}
                        disabled={added || addMutation.isPending}
                      >
                        {added ? <><Check className="w-3 h-3" /> In library</> : <><Plus className="w-3 h-3" /> Add</>}
                      </Button>
                    }
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {data.pageInfo.lastPage > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-mist/50">
                  Page {page} of {data.pageInfo.lastPage}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.pageInfo.hasNextPage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
