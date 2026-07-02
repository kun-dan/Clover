import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import type { SeriesDto } from "@/api/series";

interface SeriesCardProps {
  series: SeriesDto;
  action?: React.ReactNode;
}

export function SeriesCard({ series, action }: SeriesCardProps) {
  return (
    <div className="group relative flex flex-col bg-surface-elevated border border-surface-border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover hover:border-clover-700/60 transition-shadow duration-200">
      <Link to={`/series/${series.id}`} className="block aspect-[3/4] relative overflow-hidden bg-surface-floating">
        {series.coverUrl ? (
          <>
            <img
              src={series.coverUrl}
              alt={series.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-mist/20" />
          </div>
        )}
        {series.latestChapter && (
          <span className="absolute bottom-2 left-2 bg-clover-900/90 text-clover-300 text-xs font-medium px-2 py-0.5 rounded-full border border-clover-700/50">
            Ch. {series.latestChapter}
          </span>
        )}
        {series.seriesStatus === "RELEASING" && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-clover-400 shadow-glow-green" />
        )}
      </Link>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <Link to={`/series/${series.id}`} className="hover:text-clover-400 transition-colors duration-150">
          <h3 className="text-sm font-medium text-mist leading-snug line-clamp-2">
            {series.title}
          </h3>
        </Link>
        {series.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {series.genres.slice(0, 3).map((g) => (
              <span key={g} className="text-xs text-mist/40 bg-surface-floating px-1.5 py-0.5 rounded">
                {g}
              </span>
            ))}
          </div>
        )}
        {action && <div className="mt-auto pt-1">{action}</div>}
      </div>
    </div>
  );
}

export function SeriesCardSkeleton() {
  return (
    <div className="flex flex-col bg-surface-elevated border border-surface-border rounded-xl overflow-hidden">
      <div className="aspect-[3/4] bg-surface-floating animate-pulse" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 bg-surface-floating animate-pulse rounded w-3/4" />
        <div className="h-3 bg-surface-floating animate-pulse rounded w-1/2" />
      </div>
    </div>
  );
}
