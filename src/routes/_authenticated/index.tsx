import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  PackageCheck,
  Wrench,
} from "lucide-react";

import { PanelError, PanelLoading, ToolButton } from "@/components/app-shell";
import { jobsQuery } from "@/lib/crm-queries";
import {
  formatDate,
  locationLabels,
  statusLabels,
  statusTone,
  toneColor,
  type JobStatus,
} from "@/lib/crm-domain";
import jewellerySheet from "@/assets/jewellery-sheet.jpg";
import { GlobalSearch } from "@/components/global-search";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Marvellous Jewellers CRM" },
      {
        name: "description",
        content: "Marvellous Jewellers CRM dashboard.",
      },
      {
        property: "og:title",
        content: "Marvellous Jewellers CRM Dashboard",
      },
      {
        property: "og:description",
        content: "Marvellous Jewellers CRM dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(jobsQuery),
  pendingComponent: () => <PanelLoading label="Loading dashboard…" />,
  errorComponent: ({ error }) => <PanelError message={error.message} />,
  notFoundComponent: () => <PanelError message="Nothing to show yet." />,
  component: Dashboard,
});

const photoClasses = [
  "jewel-diamond",
  "jewel-bracelet",
  "jewel-watch",
  "jewel-pendant",
  "jewel-chain",
];

const receivedStatuses: JobStatus[] = [
  "NEW",
  "TO_QUOTE",
  "AWAITING_WORKSHOP",
  "RECEIVED",
  "INSPECTION",
];

const workshopStatuses: JobStatus[] = [
  "IN_PROGRESS",
  "WAITING_FOR_PARTS",
  "RETURNED_TO_WORKSHOP",
  "AWAITING_APPROVAL",
  "ON_HOLD",
];

const completedStatuses: JobStatus[] = [
  "READY_FOR_COLLECTION",
  "COMPLETED",
];

const collectedStatuses: JobStatus[] = ["COLLECTED"];

function Dashboard() {
  const { data: jobs } = useSuspenseQuery(jobsQuery);
  const stats = [
    {
      label: "Received",
      value: jobs.filter((job) => receivedStatuses.includes(job.status)).length,
      icon: BriefcaseBusiness,
    },
    {
      label: "In Workshop",
      value: jobs.filter((job) => workshopStatuses.includes(job.status)).length,
      icon: Wrench,
    },
    {
      label: "Completed",
      value: jobs.filter((job) => completedStatuses.includes(job.status)).length,
      icon: CheckCircle2,
    },
    {
      label: "Collected",
      value: jobs.filter((job) => collectedStatuses.includes(job.status)).length,
      icon: PackageCheck,
    },
  ];

  const recentJobs = [...jobs]
    .sort((a, b) => {
      const aDate = a.createdAt ?? "";
      const bDate = b.createdAt ?? "";
      return bDate.localeCompare(aDate);
    })
    .slice(0, 8);

  return (
    <div className="w-full max-w-none">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

          <h1 className="mt-1 font-display text-5xl leading-none">
            Welcome, <span className="gold-text">Divya.</span>
          </h1>

          <p className="mt-1 text-base text-muted-foreground">
            Here’s what’s happening today.
          </p>
        </div>

        <Link to="/new-job">
          <ToolButton>+ &nbsp; New Job</ToolButton>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Link
            key={label}
            to="/jobs"
            className="glass group flex min-h-24 items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300 hover:border-gold/40 hover:bg-white/[0.07]"
          >
            <span className="glass-gold grid size-11 shrink-0 place-items-center rounded-full">
              <Icon className="size-5 text-gold" />
            </span>

            <div>
              <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {label}
              </div>
              <div className="display-figure mt-1 text-3xl">{value}</div>
            </div>

            <ArrowRight className="ml-auto size-4 text-gold opacity-50 transition group-hover:translate-x-1 group-hover:opacity-100" />
          </Link>
        ))}
      </div>

      <section className="glass mt-6 min-w-0 rounded-2xl p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="glass-gold grid size-9 place-items-center rounded-full">
                <Clock3 className="size-4 text-gold" />
              </span>

              <div>
                <h2 className="font-display text-2xl leading-none">
                  Recent Jobs
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  The latest jobs entered into Marvellous.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/jobs"
            className="flex items-center gap-1 text-sm text-foreground"
          >
            View all
            <ArrowRight className="size-3.5 text-gold" />
          </Link>
        </div>

        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[760px] space-y-2">
            {recentJobs.length === 0 ? (
              <p className="px-3 py-8 text-sm text-muted-foreground">
                No jobs have been created yet.
              </p>
            ) : (
              recentJobs.map((job, i) => (
                <Link
                  key={job.id}
                  to="/jobs/$ref"
                  params={{ ref: job.reference }}
                  className="group grid grid-cols-[1fr_1.2fr_1.25fr_.85fr_.9fr_20px] items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-2.5 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)]"
                >
                  <span className="flex items-center gap-3 font-medium">
                    <span
                      className={`jewel-thumb size-9 ${
                        photoClasses[i % photoClasses.length]
                      }`}
                    >
                      <img
                        src={jewellerySheet}
                        alt=""
                        width={1536}
                        height={1024}
                      />
                    </span>
                    {job.reference}
                  </span>

                  <span>
                    <b className="font-medium">{job.clientName}</b>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {job.clientPhone}
                    </span>
                  </span>

                  <span>
                    {job.itemType}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {job.service}
                    </span>
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {locationLabels[job.location]}
                  </span>

                  <span
                    className="w-fit rounded-full px-2.5 py-1 text-xs"
                    style={{
                      color: toneColor[statusTone[job.status]],
                      background: `color-mix(in oklab, ${
                        toneColor[statusTone[job.status]]
                      } 18%, transparent)`,
                    }}
                  >
                    {statusLabels[job.status]}
                  </span>

                  <ArrowRight className="size-3.5 text-gold opacity-60 transition group-hover:translate-x-1 group-hover:opacity-100" />
                </Link>
              ))
            )}
          </div>
        </div>

      </section>
    </div>
  );
}
