import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { staffSignUp, verifyInviteCode } from "@/lib/auth.functions";
import { Logo } from "@/components/app-shell";
import type { AppRole } from "@/lib/auth.functions";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Staff Sign In | Marvellous Jewellers CRM" },
      {
        name: "description",
        content:
          "Secure staff sign in for the Marvellous Jewellers repair and workshop CRM.",
      },
      { property: "og:title", content: "Staff Sign In" },
      {
        property: "og:description",
        content: "Secure staff access to the Marvellous Jewellers CRM.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const field =
  "h-11 w-full rounded-xl border border-border bg-[var(--navy-deep)]/50 px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-gold/60";

type Mode = "signin" | "referral" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      if (data.user) navigate({ to: "/", replace: true });
      else setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === "forgot") {
      if (!email.trim()) return setError("Enter your work email address.");
      setBusy(true);
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setBusy(false);
      if (err) return setError(err.message);
      return setNotice("If that email is registered, a reset link is on its way.");
    }

    if (mode === "referral") {
      if (!inviteCode.trim()) return setError("Enter your referral code.");
      setBusy(true);
      try {
        const result = await verifyInviteCode({
          data: { inviteCode: inviteCode.trim() },
        });
        setInviteRole(result.role);
        setError(null);
        setNotice(null);
        setMode("signup");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not verify that referral code.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (mode === "signup") {
      if (!fullName.trim() || !email.trim() || !password || !inviteCode.trim()) {
        return setError("All account fields are required.");
      }
      if (password.length < 8) return setError("Password must be at least 8 characters.");
      if (password !== confirm) return setError("Those passwords do not match.");
      setBusy(true);
      try {
        await staffSignUp({
          data: {
            fullName: fullName.trim(),
            email: email.trim(),
            password,
            inviteCode: inviteCode.trim(),
          },
        });
        setBusy(false);
        switchMode("signin");
        return setNotice(
          "Account created. Please check your email and verify your address before signing in.",
        );
      } catch (err) {
        setBusy(false);
        setError(err instanceof Error ? err.message : "Could not create that account.");
      }
      return;
    }

    if (!email.trim() || !password) return setError("Enter your email and password.");
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (err) {
      return setError(
        err.message.toLowerCase().includes("invalid")
          ? "That email and password combination was not recognised."
          : err.message,
      );
    }
    navigate({ to: "/", replace: true });
  }

  if (checking) {
    return (
      <div className="app-bg grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="app-bg grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="glass rounded-3xl p-7">
          <div className="flex items-center gap-3">
            {mode === "signup" ? (
              <UserPlus className="size-7 text-gold" strokeWidth={1.5} />
            ) : mode === "forgot" ? (
              <Mail className="size-7 text-gold" strokeWidth={1.5} />
            ) : (
              <ShieldCheck className="size-7 text-gold" strokeWidth={1.5} />
            )}
            <div>
              <h1 className="font-display text-3xl leading-none">
                {mode === "signup"
                  ? "Create Staff Account"
                  : mode === "referral"
                    ? "Enter Referral Code"
                    : mode === "forgot"
                      ? "Reset Password"
                      : "Staff Sign In"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "signup"
                  ? "Complete your staff account using your approved invitation."
                  : mode === "referral"
                    ? "Enter the referral code provided by a Marvellous administrator."
                    : mode === "forgot"
                      ? "We will email you a secure link to set a new password."
                      : "Secure access to the Marvellous Jewellers CRM."}
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            {mode === "signup" ? (
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                  Full Name
                </span>
                <input
                  className={field}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </label>
            ) : null}

            {mode !== "referral" ? (
            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                Work Email
              </span>
              <input
                className={field}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            ) : null}

            {mode !== "forgot" && mode !== "referral" ? (
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                  Password
                </span>
                <input
                  className={field}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </label>
            ) : null}

            {mode === "referral" ? (
              <label className="block text-sm">
                <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                  Referral Code
                </span>
                <input
                  className={field}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="MJ-XXX-XXXXXX"
                  autoComplete="off"
                />
              </label>
            ) : null}

            {mode === "signup" ? (
              <>
                <label className="block text-sm">
                  <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                    Access Level
                  </span>
                  <input
                    className={field}
                    value={inviteRole ? roleLabels[inviteRole] : ""}
                    readOnly
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
              </>
            ) : null}

            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-foreground">
                {notice}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="btn-gold flex w-full items-center justify-center gap-2 disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
              {mode === "signup"
                ? "Create Account"
                : mode === "referral"
                  ? "Verify Referral"
                  : mode === "forgot"
                    ? "Send Reset Link"
                    : "Sign In"}
            </button>
          </form>

          <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm">
            {mode === "signin" ? (
              <>
                <button
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => switchMode("forgot")}
                >
                  Forgot password?
                </button>
                <button className="text-gold" onClick={() => switchMode("referral")}>
                  Have a referral code?
                </button>
              </>
            ) : mode === "signup" ? (
              <button
                className="text-gold"
                onClick={() => switchMode("referral")}
              >
                Back to referral code
              </button>
            ) : (
              <button
                className="text-gold"
                onClick={() => switchMode("signin")}
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Marvellous Jewellers &nbsp;|&nbsp; Authorised staff only &nbsp;|&nbsp;{" "}
          <Link to="/auth" className="hover:text-foreground">
            CRM v1.0.0
          </Link>
        </p>
      </div>
    </div>
  );
}
