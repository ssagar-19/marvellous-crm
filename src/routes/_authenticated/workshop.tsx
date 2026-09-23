import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Check, Package, Wrench } from "lucide-react";
import { PageHeader, PanelError, PanelLoading } from "@/components/app-shell";
import { jobsQuery } from "@/lib/crm-queries";
import { formatDate, workshopColumns, type JobDTO } from "@/lib/crm-domain";

export const Route = createFileRoute("/_authenticated/workshop")({
  head: () => ({
    meta: [
      { title: "Workshop Board | Marvellous Jewellers CRM" },
      {
        name: "description",
        content: "Jobs currently in the workshop.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(jobsQuery),
  pendingComponent: () => <PanelLoading label="Loading the workshop board…" />,
  errorComponent: ({ error }) => <PanelError message={error.message} />,
  notFoundComponent: () => <PanelError message="No workshop jobs found." />,
  component: Workshop,
});

function WorkshopCard({ job }: { job: JobDTO }) {
  return (
    <Link
      to="/jobs/$ref"
      params={{ ref: job.reference }}
      className="group grid grid-cols-[0.8fr_1.4fr_1.5fr_1fr] items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)]"
    >
      <span className="font-semibold">{job.reference}</span>
      <span className="truncate">{job.clientName}</span>
      <span className="truncate text-sm">{job.service}</span>
      <span className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
        {formatDate(job.promisedDate)}
        <span className="text-gold opacity-60 transition group-hover:translate-x-1 group-hover:opacity-100">
          →
        </span>
      </span>
    </Link>
  );
}

function Workshop() {
  const { data: jobs } = useSuspenseQuery(jobsQuery);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        icon={Wrench}
        title="Workshop"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {workshopColumns.map((col) => {
          const list = jobs.filter((job) =>
            (col.statuses as readonly string[]).includes(job.status),
          );

          const isCompleted = col.key === "completed";

          return (
            <section
              key={col.key}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-full bg-white/[0.06]">
                  {isCompleted ? (
                    <Check className="size-6 text-gold" />
                  ) : (
                    <Package className="size-6 text-gold" />
                  )}
                </div>

                <div>
                  <h2 className="font-display text-3xl">{col.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {col.blurb}
                  </p>
                </div>

                <span className="ml-auto rounded-full bg-white/[0.06] px-3 py-1 text-sm">
                  {list.length}
                </span>
              </div>

              <div className="mt-6">
                {list.length === 0 ? (
                  <p className="px-2 py-6 text-sm text-muted-foreground">
                    Nothing here right now.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {list.map((job) => (
                      <WorkshopCard key={job.id} job={job} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
