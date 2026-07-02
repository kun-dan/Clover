import { Link } from "react-router-dom";
import { BookOpen, Bell, Search, Leaf, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Personal Library",
    description: "Track every series you're reading, completed, or planning to start. Set your current chapter and never lose your place.",
  },
  {
    icon: Bell,
    title: "Chapter Alerts",
    description: "Know the moment a new chapter drops on AsuraScans or MangaPlus. Your updates feed keeps you in sync automatically.",
  },
  {
    icon: Search,
    title: "Catalog Search",
    description: "Search thousands of manga and manhwa titles with cover art, genres, and metadata from AniList.",
  },
];

// Placeholder cover URLs to illustrate the shelf
const SHELF_COVERS = [
  "https://placehold.co/150x220/0f4e2c/34a05a?text=Manga",
  "https://placehold.co/150x220/0a2e1a/7dd4a5?text=Manhwa",
  "https://placehold.co/150x220/156338/b4e8c8?text=Action",
  "https://placehold.co/150x220/0c3d22/34a05a?text=Fantasy",
  "https://placehold.co/150x220/0f4e2c/7dd4a5?text=Romance",
  "https://placehold.co/150x220/0a2e1a/34a05a?text=Thriller",
  "https://placehold.co/150x220/156338/b4e8c8?text=Drama",
  "https://placehold.co/150x220/0c3d22/7dd4a5?text=Comedy",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-base font-body flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 h-16 border-b border-surface-border/50 sticky top-0 bg-surface-base/80 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-clover-600 flex items-center justify-center shadow-glow-green">
            <Leaf className="w-4 h-4 text-mist" />
          </div>
          <span className="font-display text-xl font-semibold text-mist tracking-tight">Clover</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-mist/60 hover:text-mist transition-colors duration-150 px-3 py-1.5 rounded-lg hover:bg-surface-elevated"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 font-medium rounded-lg bg-clover-500 text-white hover:bg-clover-400 shadow-glow-green px-3 py-1.5 text-sm transition-colors duration-150"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-12 relative overflow-hidden">
        {/* Radial background */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(26,122,69,0.18) 0%, transparent 70%)",
          }}
        />

        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-clover-400 border border-clover-800 bg-clover-950/60 px-3 py-1 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-clover-400" />
          Open beta — free to use
        </span>

        <h1 className="font-display text-4xl md:text-6xl font-bold text-mist tracking-tightest leading-[1.1] max-w-2xl mb-5">
          Your manga library,{" "}
          <span className="text-gradient-green">always in sync</span>
        </h1>

        <p className="text-base md:text-lg text-mist/50 max-w-xl leading-reading mb-8">
          Track what you're reading, get notified when new chapters drop on AsuraScans and MangaPlus, and keep your progress synced across every series.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 font-medium rounded-lg bg-clover-500 text-white hover:bg-clover-400 shadow-glow-green px-6 py-3 text-base transition-colors duration-150"
          >
            Start tracking free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="text-sm text-mist/50 hover:text-mist transition-colors duration-150 px-4 py-3"
          >
            Already have an account →
          </Link>
        </div>
      </section>

      {/* Cover shelf — the signature element */}
      <section className="relative overflow-hidden py-10" aria-hidden>
        <div className="flex gap-4 animate-[scroll_30s_linear_infinite] w-max">
          {[...SHELF_COVERS, ...SHELF_COVERS].map((src, i) => (
            <div
              key={i}
              className="relative w-[120px] h-[180px] md:w-[150px] md:h-[220px] rounded-lg overflow-hidden flex-shrink-0 shadow-card border border-surface-border/50"
              style={{ transform: `rotate(${(i % 5 - 2) * 0.8}deg)` }}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          ))}
        </div>
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-surface-base to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-surface-base to-transparent pointer-events-none" />
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-20 max-w-4xl mx-auto w-full">
        <p className="text-xs font-medium text-clover-500 tracking-widest uppercase mb-3 text-center">Features</p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-mist text-center mb-12 tracking-tight">
          Everything you need to read better
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-surface-elevated border border-surface-border rounded-xl p-6 flex flex-col gap-3 hover:border-clover-800/60 transition-colors duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-clover-900/60 border border-clover-800/40 flex items-center justify-center">
                <Icon className="w-5 h-5 text-clover-400" />
              </div>
              <h3 className="font-semibold text-mist text-base">{title}</h3>
              <p className="text-sm text-mist/50 leading-reading">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-mist mb-4 tracking-tight">
          Ready to start?
        </h2>
        <p className="text-mist/50 text-sm mb-6 max-w-sm mx-auto">
          Create your account in seconds and add your first series.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center justify-center gap-2 font-medium rounded-lg bg-clover-500 text-white hover:bg-clover-400 shadow-glow-green px-6 py-3 text-base transition-colors duration-150"
        >
          Create free account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border px-6 py-6 flex items-center justify-between text-xs text-mist/30 mt-auto">
        <div className="flex items-center gap-2">
          <Leaf className="w-3.5 h-3.5 text-clover-700" />
          <span>Clover</span>
        </div>
        <span>Built for readers, by readers</span>
      </footer>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
