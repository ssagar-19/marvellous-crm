import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, Link2, Loader2, ShieldAlert, Users } from "lucide-react";
import {
  createInviteCode,
  revokeInviteCode,
} from "@/lib/auth.functions";
import { inviteCodesQuery, myAccessQuery, staffAccountsQuery } from "@/lib/auth-queries";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function StaffAccessPanel({ tab }: { tab: "Staff & Access" | "Referral Codes" }) {
  const access = useQuery(myAccessQuery);
  const isAdmin = access.data?.roles.includes("admin") ?? false;

  if (access.isPending) {
    return (
      <section className="glass flex items-center gap-3 rounded-2xl p-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-gold" /> Checking your access…
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="glass rounded-2xl p-6" role="alert">
        <div className="flex items-center gap-3">
          <ShieldAlert className="size-6 text-gold" />
          <h2 className="font-display text-2xl leading-none">Administrator only</h2>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Staff accounts and referral codes can only be managed by an administrator.
        </p>
      </section>
    );
  }

  return tab === "Staff & Access" ? <StaffList /> : <InviteCodes />;
}

function StaffList() {
  const { data, isPending, isError } = useQuery(staffAccountsQuery);

  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <Users className="size-8 text-gold" />
        <div>
          <h2 className="font-display text-2xl leading-none">Staff &amp; Access</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Everyone with an account on the Marvellous Jewellers CRM.
          </p>
        </div>
      </div>

      <div className="mt-6">
        {isPending ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-gold" /> Loading staff…
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">Could not load staff accounts.</p>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No staff accounts yet.</p>
        ) : (
          <div className="space-y-2">
            {data.map((s) => (
              <div
                key={s.id}
                className="glass-tile flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="text-sm">{s.fullName}</div>
                  <div className="truncate text-xs text-muted-foreground">{s.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  {s.roles.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No role</span>
                  ) : (
                    s.roles.map((r) => (
                      <span
                        key={r}
                        className="rounded-full border border-gold/30 px-3 py-1 text-xs text-gold"
                      >
                        {roleLabels[r]}
                      </span>
                    ))
                  )}
                  <span className="text-xs text-muted-foreground">
                    Joined {formatDate(s.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function InviteCodes() {
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useQuery(inviteCodesQuery);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => createInviteCode({ data: {} }),
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: inviteCodesQuery.queryKey });
    },
    onError: (e: unknown) =>
      setError(e instanceof Error ? e.message : "Could not create a referral code."),
  });

  const revoke = useMutation({
    mutationFn: (id: string) => revokeInviteCode({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inviteCodesQuery.queryKey }),
    onError: (e: unknown) =>
      setError(e instanceof Error ? e.message : "Could not revoke that code."),
  });

  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <Link2 className="size-8 text-gold" />
        <div>
          <h2 className="font-display text-2xl leading-none">Referral Codes</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Generate a single-use code so a new staff member can create their account.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <button
          onClick={() => create.mutate()}
          disabled={create.isPending}
          className="btn-gold flex items-center gap-2 disabled:opacity-60"
        >
          {create.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Generate Code
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-6">
        {isPending ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-gold" /> Loading codes…
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">Could not load referral codes.</p>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No referral codes yet.</p>
        ) : (
          <div className="space-y-2">
            {data.map((c) => {
              const status = c.revokedAt
                ? "Revoked"
                : c.usedAt
                  ? "Used"
                  : c.expiresAt && new Date(c.expiresAt).getTime() < Date.now()
                    ? "Expired"
                    : "Active";
              return (
                <div
                  key={c.id}
                  className="glass-tile flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-sm text-gold">{c.code}</div>
                    <div className="text-xs text-muted-foreground">
                      {roleLabels[c.role]} · expires {formatDate(c.expiresAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{status}</span>
                    <button
                      onClick={() => {
                        void navigator.clipboard?.writeText(c.code);
                        setCopied(c.id);
                      }}
                      className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Copy className="size-3.5" /> {copied === c.id ? "Copied" : "Copy"}
                    </button>
                    {status === "Active" ? (
                      <button
                        onClick={() => revoke.mutate(c.id)}
                        disabled={revoke.isPending}
                        className="text-xs text-destructive disabled:opacity-60"
                      >
                        Revoke
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
