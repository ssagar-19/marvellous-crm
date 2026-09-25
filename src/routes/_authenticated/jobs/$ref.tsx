import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { jobQuery } from "@/lib/crm-queries";
import { useState } from "react";
import {
  ArrowLeft, Gem, Image as ImageIcon, FileText, Clock, Zap,
  Plus, Printer, Check, Wrench, PoundSterling, User, Calendar, CircleCheck, Loader2, Upload,
} from "lucide-react";
import { PanelError, PanelLoading } from "@/components/app-shell";
import { motion } from "motion/react";

import { recordJobQuote, updateJobLocation, updateJobStatus } from "@/lib/crm.functions";
import {
  JOB_LOCATIONS, allowedTransitions, formatDate, formatDateTime, locationLabels, money,
  priorityLabels, progressStages, statusLabels, statusTone, toneColor, type JobLocation, type JobStatus,
} from "@/lib/crm-domain";

export const Route = createFileRoute("/_authenticated/jobs/$ref")({
  head: ({ params }) => ({
    meta: [
      { title: `Job ${params.ref} | Marvellous Jewellers CRM` },
      { name: "description", content: `Full detail, notes and activity timeline for job ${params.ref}.` },
      { property: "og:title", content: `Job ${params.ref}` },
      { property: "og:description", content: "Job detail, notes and activity timeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(jobQuery(params.ref));
    if (!result) throw notFound();
  },
  pendingComponent: () => <PanelLoading label="Loading job…" />,
  errorComponent: ({ error }) => <PanelError message={error.message} />,
  notFoundComponent: () => (
    <div className="mx-auto max-w-[720px] space-y-4">
      <PanelError title="Job not found" message="No job exists with that reference. Check the reference and try again." />
      <Link to="/jobs" className="glass inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm">
        <ArrowLeft className="size-4 text-gold" /> Back to Jobs
      </Link>
    </div>
  ),
  component: JobDetail,
});

function Panel({ title, icon: Icon, action, children }: { title: string; icon: React.ElementType; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg border border-gold/30 bg-gold/10"><Icon className="size-4 text-gold" /></span>
        <h2 className="font-display text-xl">{title}</h2>
        {action ? <div className="ml-auto">{action}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </motion.section>
  );
}

const selectClass = "h-10 rounded-xl border border-border bg-[var(--navy-deep)]/50 px-3 text-sm outline-none focus:border-gold/60";

function JobDetail() {
  const { ref } = Route.useParams();
  const { data } = useSuspenseQuery(jobQuery(ref));
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState("");
  const jobId = data?.job.id;

  const invalidate = () => queryClient.invalidateQueries();

  const statusMutation = useMutation({
    mutationFn: (status: JobStatus) => {
      if (!jobId) throw new Error("This job is no longer available.");
      return updateJobStatus({ data: { jobId, status } });
    },
    onSuccess: () => { setError(null); void invalidate(); },
    onError: (e: Error) => setError(e.message),
  });
  const quoteMutation = useMutation({
    mutationFn: (quotedPrice: number) => {
      if (!jobId) throw new Error("This job is no longer available.");
      return recordJobQuote({ data: { jobId, quotedPrice } });
    },
    onSuccess: () => { setError(null); setQuote(""); void invalidate(); },
    onError: (e: Error) => setError(e.message),
  });
  const locationMutation = useMutation({
    mutationFn: (location: JobLocation) => {
      if (!jobId) throw new Error("This job is no longer available.");
      return updateJobLocation({ data: { jobId, location } });
    },
    onSuccess: () => { setError(null); void invalidate(); },
    onError: (e: Error) => setError(e.message),
  });

  if (!data) {
    return <PanelError title="Job not found" message="No job exists with that reference." />;
  }

  const { job, items, activity } = data;
  const next = allowedTransitions[job.status];
  const outstanding = Math.max((job.quotedPrice ?? 0) - (job.depositAmount ?? 0), 0);
  const currentStage = progressStages.findIndex((s) => s.statuses.includes(job.status));
  const busy = statusMutation.isPending;

  const workflowAction =
    job.status === "RECEIVED"
      ? { label: "Workshop", status: "IN_PROGRESS" as JobStatus }
      : job.status === "IN_PROGRESS"
        ? { label: "Completed", status: "COMPLETED" as JobStatus }
        : job.status === "COMPLETED"
          ? { label: "Collected", status: "COLLECTED" as JobStatus }
          : null;
  const awaitingQuote = job.status === "TO_QUOTE";

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.12,
            delayChildren: 0.08,
          },
        },
      }}
      className="space-y-5"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 8 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            },
          },
        }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <Link to="/jobs" className="glass flex h-11 items-center gap-2 rounded-xl px-4 text-sm">
          <ArrowLeft className="size-4 text-gold" /> Back to Jobs
        </Link>
      </motion.div>

      {error ? <PanelError title="Could not update this job" message={error} /> : null}

      <div className="glass flex flex-wrap items-center gap-5 rounded-2xl p-5">
        <div className="min-w-[300px] shrink-0">
          <div className="flex items-center gap-5">
            <div className="grid size-16 place-items-center rounded-xl border border-gold/25 bg-accent/40">
              <Gem className="size-7 text-gold" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-3xl">{job.itemType} — {job.service}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {job.reference} &nbsp;|&nbsp; Created {formatDate(job.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto flex min-w-[360px] max-w-[760px] flex-1 self-center translate-y-3 items-center">
          <div className="relative flex w-full items-start">
            <div className="absolute left-4 right-4 top-4 flex h-px items-center">
              <span className="h-px w-full bg-gold/20" />
            </div>

            {progressStages.map((s, i) => {
              const done = currentStage >= 0 && i < currentStage;
              const current = i === currentStage;

              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: i * 0.08,
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative z-10 flex flex-1 flex-col items-center text-center"
                >
                  <motion.span
                    animate={
                      current
                        ? {
                            scale: [1, 1.06, 1],
                            boxShadow: [
                              "0 0 0 0 rgba(215, 178, 94, 0)",
                              "0 0 18px 2px rgba(215, 178, 94, 0.22)",
                              "0 0 0 0 rgba(215, 178, 94, 0)",
                            ],
                          }
                        : { scale: 1 }
                    }
                    transition={
                      current
                        ? {
                            duration: 2.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                        : {
                            duration: 0.3,
                          }
                    }
                    className={
                      "grid size-8 place-items-center rounded-full border backdrop-blur-xl transition-colors " +
                      (done
                        ? "border-gold/55 bg-gold/10 text-gold"
                        : current
                          ? "border-gold/75 bg-gold/15 text-gold"
                          : "border-white/10 bg-white/[0.05] text-muted-foreground")
                    }
                  >
                    {done ? (
                      <Check className="size-3.5" />
                    ) : current ? (
                      <Wrench className="size-3.5" />
                    ) : (
                      <CircleCheck className="size-3" />
                    )}
                  </motion.span>

                  <span
                    className={
                      "mt-1.5 text-[11px] " +
                      (current ? "text-foreground" : "text-muted-foreground")
                    }
                  >
                    {s.label}
                  </span>

                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center">
          <div
            className="glass-gold flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
            style={{ color: toneColor[statusTone[job.status]] }}
          >
            <Wrench className="size-4" /> {statusLabels[job.status]}
          </div>
        </div>
      </div>

      <section className="glass-inset rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <Zap className="size-3.5 text-gold" /> Quick Actions
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => window.print()}
            className="glass flex items-center gap-2 rounded-lg px-3 py-2"
          >
            <Printer className="size-4 text-gold" /> Print Job Sheet
          </button>

          <Link
            to="/invoices/$id"
            params={{ id: ref }}
            className="glass flex items-center gap-2 rounded-lg px-3 py-2"
          >
            <FileText className="size-4 text-gold" /> Invoice
          </Link>

          <span className="glass flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground">
            <Upload className="size-4 text-gold" /> Photo upload next phase
          </span>

          {workflowAction ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => statusMutation.mutate(workflowAction.status)}
              className="glass-gold flex items-center gap-2 rounded-lg px-3 py-2 text-gold disabled:opacity-60"
            >
              <Check className="size-4" /> {workflowAction.label}
            </button>
          ) : null}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Panel title={items.length > 1 ? `Items (${items.length})` : "Item Details"} icon={Gem}>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="glass-inset rounded-xl p-4">
                  {items.length > 1 ? (
                    <div className="mb-3 text-xs uppercase tracking-[0.18em] text-gold">Item {index + 1}</div>
                  ) : null}
                  <dl className="space-y-3 text-sm">
                    {[["Item", item.itemType], ["Service", item.service], ["Metal", item.metal ?? "—"], ["Stone", item.stone ?? "—"], ["Description", item.description || "—"]].map(([k, v]) => (
                      <div key={k} className="flex gap-8">
                        <dt className="w-28 shrink-0 text-muted-foreground">{k}</dt>
                        <dd className="min-w-0">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Notes" icon={FileText}>
            <div className="glass rounded-xl p-4 text-sm">
              <p>{job.customerNotes?.trim() ? job.customerNotes : "No customer notes were recorded for this job."}</p>
            </div>
          </Panel>

          <Panel title="Activity Timeline" icon={Clock}>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-center gap-4">
                    <span className="size-2.5 shrink-0 rounded-full bg-gold" />
                    <span className="w-40 shrink-0 text-muted-foreground">{formatDateTime(a.createdAt)}</span>
                    <span className="min-w-0">{a.description}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">{a.staffName ?? "System"}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Job Information" icon={FileText}>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Accepted by</span>
                <span className="glass flex items-center gap-2 rounded-lg px-3 py-2"><User className="size-4 text-gold" /> {job.acceptedBy ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Promised date</span>
                <span className="glass flex items-center gap-2 rounded-lg px-3 py-2"><Calendar className="size-4 text-gold" /> {formatDate(job.promisedDate)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Priority</span>
                <span>{priorityLabels[job.priority]}</span>
              </div>
            </div>
          </Panel>

          <Panel title="Client Details" icon={User}>
            <dl className="space-y-3 text-sm">
              {[["Name", job.clientName], ["Number", job.clientPhone || "—"], ["Email", job.clientEmail ?? "—"], ["Postcode", job.clientPostcode ?? "—"]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="truncate">{v}</dd></div>
              ))}
            </dl>
            <Link to="/clients/$id" params={{ id: job.clientId }} className="glass mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm">
              View client record
            </Link>
          </Panel>

          <Panel title="Pricing & Payment" icon={PoundSterling}>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Quoted Price</dt><dd>{job.quotedPrice === null && awaitingQuote ? "Awaiting quote" : money(job.quotedPrice)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Deposit Paid</dt><dd>{money(job.depositAmount)}</dd></div>
              <div className="flex justify-between"><dt className="text-gold">Outstanding</dt><dd className="text-lg font-semibold text-gold">{job.quotedPrice === null && awaitingQuote ? "Awaiting quote" : money(outstanding)}</dd></div>
            </dl>
          </Panel>

          <Panel title="Photos" icon={ImageIcon}>
            <p className="text-sm text-muted-foreground">No photos have been added to this job yet.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="grid size-24 place-items-center rounded-xl border border-dashed border-border text-xs text-muted-foreground"><Plus className="size-5" /></div>
            </div>
          </Panel>
        </div>
      </div>
    </motion.div>
  );
}
