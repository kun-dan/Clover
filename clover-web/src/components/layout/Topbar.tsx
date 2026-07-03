import { Link, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface TopbarProps {
  title?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, actions }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Navigate away before ProtectedRoute re-renders on the cleared token —
  // otherwise it treats "no token" as "needs a guest session" and silently
  // provisions a brand new guest in place of the account we just left.
  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

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
          <Link to="/settings" className="hidden md:flex items-center gap-2 text-sm text-mist/60 hover:text-mist transition-colors duration-150">
            {user?.displayName ?? user?.email}
            {user?.isGuest && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gold-500/10 text-gold-300 border border-gold-500/30">
                GUEST
              </span>
            )}
          </Link>
          {!user?.isGuest && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-mist/40 hover:text-red-400 rounded-md transition-colors duration-150"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
