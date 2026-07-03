import { authApi } from "@/api/auth";
import { userApi } from "@/api/user";
import { useAuthStore } from "@/store/authStore";

// Module-level singleton so concurrent callers (e.g. React 18 StrictMode's
// double-effect in dev, or multiple ProtectedRoute mounts) share one in-flight
// request instead of each provisioning a separate guest user.
let inFlight: Promise<void> | null = null;

export function ensureGuestSession(): Promise<void> {
  if (useAuthStore.getState().accessToken) return Promise.resolve();

  if (!inFlight) {
    inFlight = authApi
      .guest()
      .then((data) => {
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        return userApi.getMe();
      })
      .then((user) => {
        const { accessToken, refreshToken } = useAuthStore.getState();
        useAuthStore.getState().login(user, accessToken!, refreshToken!);
      })
      .finally(() => {
        // Clear regardless of outcome — this promise is only for deduping
        // concurrent callers during the request, not a permanent "already have
        // a session" cache (that's what the accessToken check above is for).
        // Leaving it set after success meant a later logout() (token cleared)
        // would replay this already-resolved promise without re-provisioning,
        // permanently stranding ProtectedRoute in its loading state.
        inFlight = null;
      });
  }
  return inFlight;
}
