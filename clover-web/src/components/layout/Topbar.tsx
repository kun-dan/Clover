import { Link } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface TopbarProps {
  title?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, actions }: TopbarProps) {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 bg-surface-elevated/80 backdrop-blur-sm border-b border-surface-border flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-base font-semibold text-mist">{title}</h1>
      <div className="flex items-center gap-3">
        {actions}
        <div className="flex items-center gap-2">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-surface-border" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-clover-800 flex items-center justify-center border border-clover-700">
              <User className="w-4 h-4 text-clover-400" />
            </div>
          )}
          <Link to="/settings" className="text-sm text-mist/60 hover:text-mist transition-colors duration-150 hidden md:block">
            {user?.displayName ?? user?.email}
          </Link>
          <button
            onClick={logout}
            className="p-1.5 text-mist/40 hover:text-red-400 rounded-md transition-colors duration-150"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
