import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Gem, Plus, ArrowRight } from "lucide-react";
import { PageHeader, PanelError, PanelLoading } from "@/components/app-shell";
import { bespokeProjectsQuery } from "@/lib/crm-queries";

type BespokeProject = {
  id: string;
  project_reference: string;
  full_name: string;
  project_name: string | null;
  piece_type: string | null;
  status: string;
  next_action: string | null;
  next_action_date: string | null;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/bespoke/")({
  head: () => ({
    meta: [{ title: "Bespoke Projects | Marvellous Jewellers" }],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(bespokeProjectsQuery),
  pendingComponent: () => <PanelLoading label="Loading bespoke projects…" />,
  errorComponent: ({ error }) => <PanelError message={error instanceof Error ? error.message : "Unable to load bespoke projects."} />,
  component: BespokeProjects,
});

const stages = [
  "ENQUIRY",
  "RESEARCH",
  "DESIGN",
  "APPROVAL",
  "WORKSHOP",
  "COMPLETED",
];

function BespokeProjects() {
  const { data } = useSuspenseQuery(bespokeProjectsQuery);
  const projects = data as BespokeProject[];

  return (
    <div>
      <PageHeader
        title="Bespoke Projects"
        subtitle="Manage custom jewellery projects from enquiry to completion."
        icon={Gem}
        actions={
          <Link
            to="/new-bespoke"
            className="inline-flex items-center gap-2 rounded-xl border border-gold/40 px-4 py-2 text-sm text-foreground hover:bg-white/10"
          >
            <Plus className="size-4 text-gold" />
            New Bespoke Project
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {stages.map((stage) => (
          <span
            key={stage}
            className="rounded-full border border-white/15 px-3 py-1 text-xs text-muted-foreground"
          >
            {stage.charAt(0) + stage.slice(1).toLowerCase()} ·{" "}
            {projects.filter((p) => p.status === stage).length}
          </span>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="glass-tile rounded-xl p-8 text-center">
          <Gem className="mx-auto mb-3 size-8 text-gold" />
          <p className="text-foreground">No bespoke projects yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first bespoke project to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to="/bespoke/$ref"
              params={{ ref: project.project_reference }}
              className="glass-tile flex flex-wrap items-center justify-between gap-4 rounded-xl p-5 transition-transform hover:-translate-y-0.5"
            >
              <div>
                <p className="text-xs tracking-wider text-gold">
                  {project.project_reference}
                </p>
                <h2 className="mt-1 text-lg font-medium text-foreground">
                  {project.project_name || project.piece_type || "Untitled project"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {project.full_name}
                </p>
                {project.next_action && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Next: {project.next_action}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full border border-gold/30 px-3 py-1 text-xs text-foreground">
                  {project.status}
                </span>
                <ArrowRight className="size-4 text-gold/60" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
