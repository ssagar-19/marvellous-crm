import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Gem, User, FileText, Search, Calendar, ClipboardList } from "lucide-react";
import { PageHeader, PanelError, PanelLoading } from "@/components/app-shell";
import { bespokeProjectQuery } from "@/lib/crm-queries";

export const Route = createFileRoute("/_authenticated/bespoke/$ref")({
  head: ({ params }) => ({
    meta: [{ title: `${params.ref} | Marvellous Bespoke` }],
  }),
  loader: async ({ context, params }) => {
    const project = await context.queryClient.ensureQueryData(
      bespokeProjectQuery(params.ref)
    );
    if (!project) throw notFound();
  },
  pendingComponent: () => <PanelLoading label="Loading bespoke project…" />,
  errorComponent: ({ error }) => (
    <PanelError message={error instanceof Error ? error.message : "Unable to load project."} />
  ),
  notFoundComponent: () => <PanelError message="Bespoke project not found." />,
  component: BespokeDetail,
});

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Gem;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-3">
        <Icon className="size-5 text-gold" />
        <h2 className="font-display text-xl text-foreground">{title}</h2>
      </div>
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
        {children}
      </div>
    </section>
  );
}

function BespokeDetail() {
  const { ref } = Route.useParams();
  const { data: project } = useSuspenseQuery(bespokeProjectQuery(ref));

  if (!project) return <PanelError message="Project not found." />;

  return (
    <div>
      <Link
        to="/bespoke"
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Bespoke Projects
      </Link>

      <PageHeader
        title={project.project_name || "Untitled Bespoke Project"}
        subtitle={project.project_reference}
        icon={Gem}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-gold/40 px-4 py-2 text-sm text-gold">
          {project.status}
        </span>
        {project.piece_type && (
          <span className="rounded-full border border-white/20 px-4 py-2 text-sm">
            {project.piece_type}
          </span>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Customer" icon={User}>
          <p>{project.full_name}</p>
          {project.phone && <p className="mt-2">{project.phone}</p>}
          {project.email && <p className="mt-2">{project.email}</p>}
        </Section>

        <Section title="Project Brief" icon={FileText}>
          {project.brief || "No brief recorded."}
        </Section>

        <Section title="Research" icon={Search}>
          {project.research || "No research recorded."}
        </Section>

        <Section title="Notes" icon={ClipboardList}>
          {project.notes || "No notes recorded."}
        </Section>

        <Section title="Next Action" icon={Calendar}>
          <p>{project.next_action || "No next action set."}</p>
          {project.next_action_date && (
            <p className="mt-2 text-gold">
              Due: {project.next_action_date}
            </p>
          )}
        </Section>
      </div>
    </div>
  );
}
