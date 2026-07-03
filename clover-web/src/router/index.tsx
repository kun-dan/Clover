import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ensureGuestSession } from "@/lib/guestSession";

export function ProtectedRoute() {
  const { accessToken } = useAuthStore();
  const location = useLocation();
  const [guestFailed, setGuestFailed] = useState(false);

  useEffect(() => {
    if (accessToken) return;
    ensureGuestSession().catch(() => setGuestFailed(true));
  }, [accessToken]);

  if (!accessToken) {
    if (guestFailed) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <div className="w-6 h-6 border-2 border-clover-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return <Outlet />;
}
