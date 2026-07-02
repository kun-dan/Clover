import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { User, Mail, Leaf } from "lucide-react";
import { userApi } from "@/api/user";
import { useAuthStore } from "@/store/authStore";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold text-mist/40 uppercase tracking-widest">{title}</h2>
      <div className="bg-surface-elevated border border-surface-border rounded-xl p-5 flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, setUser, logout } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: () => userApi.updateMe({ displayName }),
    onSuccess: (updated) => {
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  return (
    <>
      <Topbar title="Settings" />
      <div className="flex-1 p-6 max-w-lg flex flex-col gap-6">

        <Section title="Account">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-12 h-12 rounded-full border border-surface-border" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-clover-800 border border-clover-700 flex items-center justify-center">
                <User className="w-6 h-6 text-clover-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-mist">{user?.displayName ?? "—"}</p>
              <p className="text-xs text-mist/40">{user?.email}</p>
            </div>
          </div>

          <Input
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />

          <Button
            onClick={() => updateMutation.mutate()}
            loading={updateMutation.isPending}
            disabled={displayName === user?.displayName}
            className="w-fit"
          >
            {saved ? "Saved!" : "Save changes"}
          </Button>
        </Section>

        <Section title="Email">
          <div className="flex items-center gap-3 text-sm text-mist/60">
            <Mail className="w-4 h-4" />
            <span>{user?.email}</span>
          </div>
          <p className="text-xs text-mist/30">Email address cannot be changed in this version.</p>
        </Section>

        <Section title="Connected accounts">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <div>
                <p className="text-sm text-mist">Google</p>
                <p className="text-xs text-mist/40">
                  {user?.hasGoogleLinked ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            {!user?.hasGoogleLinked && (
              <a
                href="/api/auth/google?action=link"
                className="text-xs text-clover-400 hover:text-clover-300 transition-colors duration-150"
              >
                Link →
              </a>
            )}
          </div>
        </Section>

        <Section title="Danger zone">
          <p className="text-xs text-mist/40">Signing out will clear your session from this device.</p>
          <Button variant="danger" onClick={logout} className="w-fit">
            <Leaf className="w-3.5 h-3.5" /> Sign out
          </Button>
        </Section>
      </div>
    </>
  );
}
