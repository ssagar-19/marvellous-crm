import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, Mail, MapPin, Phone, User } from "lucide-react";
import { PanelError, PanelLoading } from "@/components/app-shell";
import { clientQuery } from "@/lib/crm-queries";
import {
  formatDate,
  money,
  statusLabels,
  statusTone,
  locationLabels,
  toneColor,
} from "@/lib/crm-domain";

export const Route = createFileRoute("/_authenticated/clients/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Client ${params.id.slice(0, 8)} | Marvellous Jewellers CRM` },
      {
        name: "description",
        content: "Client contact details and their full repair job history.",
      },
      { property: "og:title", content: "Client detail" },
      { property: "og:description", content: "Client contact details and job history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(clientQuery(params.id));
    if (!result) throw notFound();
  },
  pendingComponent: () => <PanelLoading label="Loading client…" />,
  errorComponent: ({ error }) => <PanelError message={error.message} />,
  notFoundComponent: () => (
    <PanelError title="Client not found" message="No client exists with that reference." />
  ),
  component: ClientDetail,
});

function ClientDetail() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(clientQuery(id));

  if (!data) {
    return <PanelError title="Client not found" message="No client exists with that reference." />;
  }

  const { client, jobs } = data;
  const outstanding = jobs.reduce(
    (sum, j) => sum + Math.max((j.quotedPrice ?? 0) - (j.depositAmount ?? 0), 0),
    0,
  );

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <Link to="/clients" className="glass inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm">
        <ArrowLeft className="size-4 text-gold" /> Back to Clients
      </Link>

      <section className="glass flex flex-wrap items-center gap-5 rounded-2xl p-5">
        <span className="grid size-16 place-items-center rounded-xl border border-gold/25 bg-accent/40">
          <User className="size-7 text-gold" />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-3xl">{client.fullName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Client since {formatDate(client.createdAt)}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-3 text-sm">
          <span className="glass flex items-center gap-2 rounded-xl px-4 py-3">
            <Phone className="size-4 text-gold" /> {client.phone || "—"}
          </span>
          <span className="glass flex items-center gap-2 rounded-xl px-4 py-3">
            <Mail className="size-4 text-gold" /> {client.email ?? "—"}
          </span>
          <span className="glass flex items-center gap-2 rounded-xl px-4 py-3">
            <MapPin className="size-4 text-gold" /> {client.postcode ?? "—"}
          </span>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Total jobs", String(jobs.length)],
          ["Open jobs", String(jobs.filter((j) => !j.completedAt).length)],
          ["Outstanding", money(outstanding)],
        ].map(([label, value]) => (
          <div key={label} className="glass rounded-xl px-4 py-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="display-figure mt-1 text-3xl">{value}</div>
          </div>
        ))}
      </div>

      <section className="glass-gold rounded-2xl p-5">
        <h2 className="font-display text-2xl">Jobs</h2>
        {jobs.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            This client has no jobs yet.{" "}
            <Link to="/new-job" className="text-gold">
              Create one
            </Link>
            .
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[1fr_1.4fr_1fr_.9fr_1.1fr_20px] gap-3 px-2 pb-2 text-[10px] uppercase text-muted-foreground">
                <span>Job Ref</span>
                <span>Item / Service</span>
                <span>Location</span>
                <span>Promised</span>
                <span>Status</span>
                <span />
              </div>
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  to="/jobs/$ref"
                  params={{ ref: job.reference }}
                  className="grid grid-cols-[1fr_1.4fr_1fr_.9fr_1.1fr_20px] items-center gap-3 border-t border-border/60 px-2 py-3 text-xs"
                >
                  <span className="font-medium">{job.reference}</span>
                  <span>
                    {job.itemType}
                    <span className="block text-muted-foreground">{job.service}</span>
                  </span>
                  <span className="text-muted-foreground">{locationLabels[job.location]}</span>
                  <span>{formatDate(job.promisedDate)}</span>
                  <span
                    className="w-fit rounded px-2 py-1 text-[10px]"
                    style={{
                      color: toneColor[statusTone[job.status]],
                      background: `color-mix(in oklab, ${toneColor[statusTone[job.status]]} 18%, transparent)`,
                    }}
                  >
                    {statusLabels[job.status]}
                  </span>
                  <ChevronRight className="size-4 text-gold" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
