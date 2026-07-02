import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf } from "lucide-react";
import { authApi } from "@/api/auth";
import { userApi } from "@/api/user";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.register(email, password, displayName);
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
      const user = await userApi.getMe();
      login(user, data.accessToken, data.refreshToken);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-clover-600 flex items-center justify-center shadow-glow-green mb-2">
            <Leaf className="w-6 h-6 text-mist" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-mist">Create account</h1>
          <p className="text-sm text-mist/50">Start tracking your manga library</p>
        </div>

        <div className="bg-surface-elevated border border-surface-border rounded-2xl p-6 shadow-card flex flex-col gap-4">
          {error && (
            <div className="text-sm text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
              Create account
            </Button>
          </form>

          <div className="relative flex items-center">
            <div className="flex-1 border-t border-surface-border" />
            <span className="px-3 text-xs text-mist/30">or</span>
            <div className="flex-1 border-t border-surface-border" />
          </div>

          <a
            href="/api/auth/google"
            className="flex items-center justify-center gap-3 w-full border border-surface-border rounded-lg px-4 py-2.5 text-sm font-medium text-mist/70 hover:text-mist hover:bg-surface-floating transition-colors duration-150"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>
        </div>

        <p className="text-center text-sm text-mist/40 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-clover-400 hover:text-clover-300 transition-colors duration-150">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
