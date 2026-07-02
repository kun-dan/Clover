import { NavLink } from "react-router-dom";
import { LayoutDashboard, Search, Bell, Settings, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/updates", icon: Bell, label: "Updates" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-surface-elevated border-r border-surface-border flex flex-col z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-clover-600 flex items-center justify-center shadow-glow-green">
            <Leaf className="w-4 h-4 text-mist" />
          </div>
          <span className="font-display text-lg font-semibold text-mist tracking-tight">Clover</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-clover-900/60 text-clover-400 border border-clover-800/50"
                  : "text-mist/50 hover:text-mist hover:bg-surface-floating"
              )
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
