import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Loader2, Lock, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { staffSignUp, verifyInviteCode } from "@/lib/auth.functions";
import { Logo } from "@/components/app-shell";
import type { AppRole } from "@/lib/auth.functions";
import { roleLabels } from "@/lib/auth.functions";

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

type Mode = "signin" | "referral" | "signup" | "forgot" | "mfa";

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
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaChallengeId, setMfaChallengeId] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaQrCode, setMfaQrCode] = useState("");
  const [mfaSetup, setMfaSetup] = useState(false);
  const [mfaVerified, setMfaVerified] = useState(false);
  const mfaDigits = Array.from({ length: 6 }, (_, index) => mfaCode[index] ?? "");

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const { data, error } = await supabase.auth.getUser();

      if (cancelled) return;

      if (error || !data.user) {
        setChecking(false);
        return;
      }

      const { data: assurance } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (cancelled) return;

      if (assurance?.currentLevel === "aal2") {
        navigate({ to: "/", replace: true });
        return;
      }

      setChecking(false);
    }

    void checkSession();

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
          data: { inviteCode: inviteCode.trim(), email: email.trim() },
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
    const { data: assurance, error: assuranceError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (assuranceError) {
      return setError(assuranceError.message);
    }

    if (assurance.currentLevel === "aal2") {
      navigate({ to: "/", replace: true });
      return;
    }

    const { data: factors, error: factorsError } =
      await supabase.auth.mfa.listFactors();

    if (factorsError) {
      return setError(factorsError.message);
    }

    const totpFactor = factors.all.find(
      (factor) => factor.factor_type === "totp",
    );

    let factorId = totpFactor?.id;

    if (!totpFactor) {
      const { data: enrolled, error: enrollError } =
        await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "Marvellous Jewellers",
        });

      if (enrollError) {
        return setError(enrollError.message);
      }

      factorId = enrolled.id;
      setMfaQrCode(enrolled.totp.qr_code);
      setMfaSetup(true);
    } else {
      setMfaQrCode("");
      setMfaSetup(totpFactor.status !== "verified");
    }

    if (!factorId) {
      return setError("Could not find or create your authenticator.");
    }

    const verifiedFactorId: string = factorId;

    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({
        factorId: verifiedFactorId,
      });

    if (challengeError) {
      return setError(challengeError.message);
    }

    setMfaFactorId(verifiedFactorId);
    setMfaChallengeId(challenge.id);
    setMfaCode("");
    setMode("mfa");
  }

  async function verifyMfaCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!mfaCode.trim()) {
      return setError("Enter the verification code.");
    }

    if (!mfaFactorId || !mfaChallengeId) {
      return setError("Your security verification session has expired. Please sign in again.");
    }

    setBusy(true);

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: mfaFactorId,
      challengeId: mfaChallengeId,
      code: mfaCode.trim(),
    });

    setBusy(false);

    if (verifyError) {
      return setError("That verification code was not accepted. Please try again.");
    }

    setMfaVerified(true);

    setTimeout(() => {
      navigate({ to: "/", replace: true });
    }, 1800);
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
      <div className="w-full max-w-md -translate-y-8">
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
              {mode !== "mfa" ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {mode === "signup"
                    ? "Complete your staff account using your approved invitation."
                    : mode === "referral"
                      ? "Enter the referral code provided by a Marvellous administrator."
                      : mode === "forgot"
                        ? "We will email you a secure link to set a new password."
                        : "Secure access to the Marvellous Jewellers CRM."}
                </p>
              ) : null}
            </div>
          </div>

            {mode === "mfa" ? (
              mfaVerified ? (
                <div className="mt-6 flex min-h-[260px] flex-col items-center justify-center text-center animate-[mfa-enter_500ms_cubic-bezier(0.22,1,0.36,1)]">
                  <div className="relative flex size-24 items-center justify-center">
                    <span className="absolute inset-0 rounded-full bg-gold/10 animate-[success-glow_1.8s_ease-out_forwards]" />
                    <span className="absolute inset-2 rounded-full border border-gold/30 animate-[success-ring_1.2s_ease-out_forwards]" />
                    <span className="relative flex size-16 items-center justify-center rounded-full border border-gold/50 bg-gold/10 animate-[success-icon_500ms_cubic-bezier(0.22,1,0.36,1)_forwards]">
                      <Check className="size-8 text-gold" strokeWidth={1.7} />
                    </span>
                  </div>

                  <h2 className="mt-7 font-display text-2xl">
                    Verified
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Secure access confirmed.
                  </p>
                </div>
              ) : (
              <form
                className="mt-6 animate-[mfa-enter_500ms_cubic-bezier(0.22,1,0.36,1)] space-y-4"
                onSubmit={verifyMfaCode}
                noValidate
              >
                <div className="rounded-2xl bg-[var(--navy-deep)]/15 px-5 py-4 text-center">
                  <ShieldCheck
                    className="mx-auto size-10 text-gold animate-[shield-breathe_3s_ease-in-out_infinite]"
                    strokeWidth={1.5}
                  />
                  {mfaSetup && mfaQrCode ? (
                    <>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Scan this QR code with Apple Passwords on your iPhone.
                      </p>

                      <div className="mx-auto mt-5 flex size-48 items-center justify-center rounded-2xl bg-white p-3">
                        <img
                          src={mfaQrCode}
                          alt="Marvellous Jewellers MFA setup QR code"
                          className="size-full"
                        />
                      </div>

                      <p className="mt-4 text-xs text-muted-foreground">
                        After scanning, Apple Passwords will generate a
                        six-digit verification code for Marvellous Jewellers.
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Enter your six-digit verification code.
                    </p>
                  )}
                </div>

                <label className="block text-sm">
                  <span className="sr-only">Verification Code</span>

                  <div className="mx-auto flex max-w-xs justify-center gap-3">
                    {mfaDigits.map((digit, index) => (
                      <div
                        key={index}
                        className="relative flex h-12 w-9 items-end justify-center"
                      >
                        <span
                          className={`mb-1 text-2xl font-medium transition-all duration-300 ${
                            digit
                              ? "translate-y-0 text-foreground opacity-100"
                              : "translate-y-1 text-transparent opacity-0"
                          }`}
                        >
                          {digit}
                        </span>

                        <span
                          className={`absolute bottom-0 left-0 h-px w-full transition-all duration-300 ${
                            digit
                              ? "bg-gold shadow-[0_0_10px_rgba(212,175,55,0.45)]"
                              : "bg-white/25"
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  <input
                    className="absolute h-px w-px opacity-0"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={mfaCode}
                    onChange={(e) =>
                      setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                    autoFocus
                    aria-label="Verification Code"
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
                  disabled={busy || mfaCode.length < 6}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 text-sm font-medium text-[var(--navy-deep)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                  Verify & Continue
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMfaCode("");
                    setError(null);
                    setMode("signin");
                    void supabase.auth.signOut();
                  }}
                  className="w-full text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancel and return to sign in
                </button>
              </form>
              )
            ) : (
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
            )}

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
