import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/app-shell";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a New Password | Marvellous Jewellers CRM" },
      {
        name: "description",
        content: "Choose a new password for your Marvellous Jewellers CRM staff account.",
      },
      { property: "og:title", content: "Set a New Password" },
      {
        property: "og:description",
        content: "Choose a new password for your CRM staff account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

const field =
  "h-11 w-full rounded-xl border border-border bg-[var(--navy-deep)]/50 px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-gold/60";

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [linkValid, setLinkValid] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setLinkValid(Boolean(data.session));
      setReady(true);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setLinkValid(true);
        setReady(true);
      }
    });
    void check();
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Those passwords do not match.");
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(err.message);
    setDone(true);
    setTimeout(() => navigate({ to: "/", replace: true }), 1200);
  }

  return (
    <div className="app-bg grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="glass rounded-3xl p-7">
          <div className="flex items-center gap-3">
            <KeyRound className="size-7 text-gold" strokeWidth={1.5} />
            <div>
              <h1 className="font-display text-3xl leading-none">Set a New Password</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a strong password of at least 8 characters.
              </p>
            </div>
          </div>

          {!ready ? (
            <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-gold" /> Checking your link…
            </div>
          ) : !linkValid ? (
            <p className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              This reset link is invalid or has expired. Please request a new one from the
              sign in screen.
            </p>
          ) : done ? (
            <p className="mt-6 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm">
              Password updated. Taking you into the CRM…
            </p>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                  New Password
                </span>
                <input
                  className={field}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                  Confirm Password
                </span>
                <input
                  className={field}
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </label>
              {error ? (
                <p
                  role="alert"
                  className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="btn-gold flex w-full items-center justify-center gap-2 disabled:opacity-60"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
