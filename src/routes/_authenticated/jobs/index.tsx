import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowUpDown,
  BarChart3,
  Box,
  Check,
  Filter,
  LayoutGrid,
  MessageSquare,
  Plus,
  PoundSterling,
  ShoppingBag,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  PageHeader,
  PanelError,
  PanelLoading,
  ToolButton,
} from "@/components/app-shell";
import { jobsQuery } from "@/lib/crm-queries";
import {
  boardColumns,
  formatDate,
  type JobDTO,
} from "@/lib/crm-domain";
import jewellerySheet from "@/assets/jewellery-sheet.jpg";

export const Route = createFileRoute("/_authenticated/jobs/")({
  head: () => ({
    meta: [
      {
        title: "Job Status Board | Marvellous Jewellers CRM",
      },
      {
        name: "description",
        content:
          "Track every jewellery repair job through the workshop, from intake to collection.",
      },
      {
        property: "og:title",
        content: "Job Status Board",
      },
      {
        property: "og:description",
        content:
          "Track every jewellery repair job through the workshop.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
  }),

  loader: ({ context }) =>
    context.queryClient.ensureQueryData(jobsQuery),

  pendingComponent: () => (
    <PanelLoading label="Loading jobs…" />
  ),

  errorComponent: ({ error }) => (
    <PanelError message={error.message} />
  ),

  notFoundComponent: () => (
    <PanelError message="No jobs found." />
  ),

  component: JobsBoard,
});

const icons: Record<string, LucideIcon> = {
  quote: PoundSterling,
  received: Box,
  workshop: Wrench,
  completed: Check,
  collected: ShoppingBag,
  approval: MessageSquare,
  qc: Check,
  ready: ShoppingBag,
};

const photos = [
  "jewel-diamond",
  "jewel-chain",
  "jewel-watch",
  "jewel-emerald",
  "jewel-bracelet",
  "jewel-diamond",
  "jewel-pendant",
];

function JobCard({
  job,
  index,
}: {
  job: JobDTO;
  index: number;
}) {
  return (
    <Link
      to="/jobs/$ref"
      params={{ ref: job.reference }}
      className="glass-tile grid min-h-[104px] grid-cols-[72px_1fr] gap-3 rounded-xl p-3 transition-transform hover:-translate-y-0.5"
    >
      <span
        className={`jewel-thumb ${photos[index % photos.length]}`}
      >
        <img
          src={jewellerySheet}
          alt={job.itemType}
          width={1536}
          height={1024}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </span>

      <div className="relative min-w-0 pr-1 text-sm">
        <div className="text-white/70">{job.reference}</div>

        <div className="mt-1 truncate font-semibold text-foreground">
          {job.itemType} — {job.service}
        </div>

        <div className="mt-1 truncate text-muted-foreground">
          {job.clientName}
        </div>

        <div className="text-muted-foreground">
          Due: {formatDate(job.promisedDate)}
        </div>
      </div>
    </Link>
  );
}

function JobsBoard() {
  const { data: jobs } = useSuspenseQuery(jobsQuery);

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<
    "dueDate" | "received" | "customer"
  >("dueDate");

  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [itemFilter, setItemFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [overdueOnly, setOverdueOnly] = useState(false);

    const today = new Date();

  const filteredJobs = jobs
    .filter((job) => {
      if (
        statusFilter !== "all" &&
        job.status !== statusFilter
      ) {
        return false;
      }

      if (
        serviceFilter !== "all" &&
        job.service !== serviceFilter
      ) {
        return false;
      }

      if (
        itemFilter !== "all" &&
        job.itemType !== itemFilter
      ) {
        return false;
      }

      if (
        priorityFilter !== "all" &&
        job.priority !== priorityFilter
      ) {
        return false;
      }

      if (overdueOnly) {
        if (!job.promisedDate) {
          return false;
        }

        const dueDate = new Date(job.promisedDate);

        if (dueDate >= today) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "customer") {
        return a.clientName.localeCompare(b.clientName);
      }

      if (sortBy === "received") {
        return (
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
        );
      }

      if (!a.promisedDate && !b.promisedDate) {
        return 0;
      }

      if (!a.promisedDate) {
        return 1;
      }

      if (!b.promisedDate) {
        return -1;
      }

      return (
        new Date(a.promisedDate).getTime() -
        new Date(b.promisedDate).getTime()
      );
    });
  return (
    <div className="w-full max-w-none">
      <PageHeader
        title="Job Status Board"
        actions={
          <>
            <ToolButton onClick={() => setFilterOpen((open) => !open)}>
              <Filter className="size-4 text-gold" />
              Filter
            </ToolButton>

            <ToolButton
              onClick={() =>
                setSortBy((current) =>
                  current === "dueDate"
                    ? "received"
                    : current === "received"
                      ? "customer"
                      : "dueDate",
                )
              }
            >
              <ArrowUpDown className="size-4 text-gold" />
              Sort:{" "}
              {sortBy === "dueDate"
                ? "Due Date"
                : sortBy === "received"
                  ? "Date Received"
                  : "Customer"}
            </ToolButton>

            <ToolButton>
              <LayoutGrid className="size-4 text-gold" />
              View
            </ToolButton>
          </>
        }
      />

      {filterOpen ? (
  <div className="glass mb-5 rounded-2xl p-5">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <label className="space-y-2">
        <span className="text-xs text-muted-foreground">Status</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#0d2737]/80 px-3 py-2.5 text-sm text-foreground outline-none"
        >
          <option value="all">All statuses</option>
          {boardColumns.map((col) => (
            <option key={col.key} value={col.statuses[0]}>
              {col.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-xs text-muted-foreground">Service</span>
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#0d2737]/80 px-3 py-2.5 text-sm text-foreground outline-none"
        >
          <option value="all">All services</option>
          {[...new Set(jobs.map((job) => job.service))].map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-xs text-muted-foreground">Item Type</span>
        <select
          value={itemFilter}
          onChange={(e) => setItemFilter(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#0d2737]/80 px-3 py-2.5 text-sm text-foreground outline-none"
        >
          <option value="all">All items</option>
          {[...new Set(jobs.map((job) => job.itemType))].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-xs text-muted-foreground">Priority</span>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#0d2737]/80 px-3 py-2.5 text-sm text-foreground outline-none"
        >
          <option value="all">All priorities</option>
          {[...new Set(jobs.map((job) => job.priority))].map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </label>
    </div>

    <div className="mt-4 flex items-center justify-between">
      <label className="flex cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={overdueOnly}
          onChange={(e) => setOverdueOnly(e.target.checked)}
          className="size-4 accent-[var(--gold)]"
        />
        Show overdue jobs only
      </label>

      <button
        type="button"
        onClick={() => {
          setStatusFilter("all");
          setServiceFilter("all");
          setItemFilter("all");
          setPriorityFilter("all");
          setOverdueOnly(false);
        }}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Clear filters
      </button>
    </div>
  </div>
) : null}

      <div className="overflow-x-auto pb-4">
        <div className="grid min-w-[1200px] grid-cols-4 gap-6">
          {boardColumns.map((col) => {
            const list = filteredJobs.filter((job) =>
              (col.statuses as readonly string[]).includes(job.status),
            );

            const Icon = icons[col.key]!;

            return (
              <section
                key={col.key}
                className="min-w-0"
              >
                {/* Column Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full"
                      style={{
                        background: `color-mix(in oklab, ${col.color} 30%, transparent)`,
                      }}
                    >
                      <Icon
                        className="size-4"
                        style={{ color: col.color }}
                      />
                    </span>

                    <h2 className="font-display text-xl text-foreground">
                      {col.label}
                    </h2>

                    <span className="rounded-full bg-accent/60 px-2.5 py-0.5 text-xs">
                      {list.length}
                    </span>
                  </div>

                  <p className="mt-1 pl-12 text-xs text-muted-foreground">
                    {col.blurb}
                  </p>
                </div>

                {/* Jobs */}
                <div className="space-y-3">
                  {list.map((job, i) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      index={i}
                    />
                  ))}

                  {/* Add Job */}
                  <Link
                    to="/new-job"
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-gold/40 hover:text-foreground"
                  >
                    <Plus className="size-4" />

                    {col.key === "received"
                      ? "Add New Job"
                      : col.key === "workshop"
                        ? "Add Job to Workshop"
                        : "Add Job"}
                  </Link>
                </div>
              </section>
            );
          })}
        </div>
      </div>

    </div>

  );
}