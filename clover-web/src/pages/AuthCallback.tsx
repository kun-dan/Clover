import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { userApi } from "@/api/user";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const token = params.get("token");
    const refresh = params.get("refresh");
    const error = params.get("error");

    if (error || !token || !refresh) {
      navigate("/login?error=oauth_failed", { replace: true });
      return;
    }

    // Temporarily set token to fetch user
    useAuthStore.getState().setTokens(token, refresh);

    userApi.getMe()
      .then((user) => {
        login(user, token, refresh);
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        navigate("/login?error=user_fetch_failed", { replace: true });
      });
  }, []);

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-mist/60">
        <svg className="animate-spin h-8 w-8 text-clover-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm">Signing you in…</p>
      </div>
    </div>
  );
}
