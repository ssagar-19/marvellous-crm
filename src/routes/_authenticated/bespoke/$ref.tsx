import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Barcode, Gem, Loader2, Lock, Save, Search, User } from "lucide-react";
import { PanelError, PanelLoading } from "@/components/app-shell";
import { BespokeProgress, BESPOKE_STAGES, type BespokeStage } from "@/components/bespoke-progress";
import { searchClients, updateBespokeProject } from "@/lib/crm.functions";
import { bespokeProjectQuery } from "@/lib/crm-queries";
import type { ClientDTO } from "@/lib/crm-domain";

export const Route = createFileRoute("/_authenticated/bespoke/$ref")({
  head: ({ params }) => ({ meta: [{ title: `${params.ref} | Marvellous Bespoke` }] }),
  loader: async ({ context, params }) => {
    const project = await context.queryClient.ensureQueryData(bespokeProjectQuery(params.ref));
    if (!project) throw notFound();
  },
  pendingComponent: () => <PanelLoading label="Loading bespoke project…" />,
  errorComponent: ({ error }) => (
    <PanelError message={error instanceof Error ? error.message : "Unable to load project."} />
  ),
  notFoundComponent: () => <PanelError message="Bespoke project not found." />,
  component: BespokeDetail,
});

const field =
  "h-11 w-full rounded-xl border border-border bg-[var(--navy-deep)]/50 px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-gold/60";
const area =
  "w-full rounded-xl border border-border bg-[var(--navy-deep)]/50 p-4 text-sm outline-none placeholder:text-muted-foreground focus:border-gold/60";
type Project = {
  project_reference: string;
  updated_at?: string | null;
  client_id?: string | null;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  project_name?: string | null;
  piece_type?: string | null;
  brief?: string | null;
  research?: string | null;
  notes?: string | null;
  next_action?: string | null;
  next_action_date?: string | null;
  status: string;
};
function stageFromDb(status: string): BespokeStage | null {
  return BESPOKE_STAGES.find((stage) => stage.toUpperCase() === status?.toUpperCase()) ?? null;
}
function draftFromProject(project: Project) {
  return {
    clientId: project.client_id ?? null,
    fullName: project.full_name ?? "",
    phone: project.phone ?? "",
    email: project.email ?? "",
    projectName: project.project_name ?? "",
    pieceType: project.piece_type ?? "",
    brief: project.brief ?? "",
    research: project.research ?? "",
    notes: project.notes ?? "",
    nextAction: project.next_action ?? "",
    nextActionDate: project.next_action_date ?? "",
    status: stageFromDb(project.status) ?? "Enquiry",
  };
}
function BespokeDetail() {
  const { ref } = Route.useParams();
  const { data: project } = useSuspenseQuery(bespokeProjectQuery(ref));
  if (!project) return <PanelError message="Project not found." />;
  return <BespokeEditor key={project.project_reference} initialProject={project as Project} />;
}
function BespokeEditor({ initialProject }: { initialProject: Project }) {
  const queryClient = useQueryClient();
  const [baseline, setBaseline] = useState(initialProject);
  const [form, setForm] = useState(() => draftFromProject(initialProject));
  const [matches, setMatches] = useState<ClientDTO[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const dirty = JSON.stringify(form) !== JSON.stringify(draftFromProject(baseline));
  const knownStatus = stageFromDb(baseline.status) !== null;
  const canSave = dirty && !saving && !!baseline.updated_at && knownStatus;

  const set =
    (key: keyof Omit<typeof form, "clientId" | "status">) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((current) => ({
        ...current,
        [key]: event.target.value,
        ...(key === "phone" || key === "fullName" ? { clientId: null } : {}),
      }));
      setMessage("");
      setError("");
    };
  async function findClient() {
    setSearching(true);
    setError("");
    try {
      const result = await searchClients({
        data: { fullName: form.fullName.trim(), phone: form.phone.trim() },
      });
      setMatches(result ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Customer search failed.");
    } finally {
      setSearching(false);
    }
  }
  async function save() {
    if (!canSave) return;
    const submitted = form;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await updateBespokeProject({
        data: {
          reference: baseline.project_reference,
          expectedUpdatedAt: baseline.updated_at!,
          ...form,
          status: form.status as BespokeStage,
        },
      });
      setBaseline(updated as Project);
      setForm((current) =>
        JSON.stringify(current) === JSON.stringify(submitted)
          ? draftFromProject(updated as Project)
          : current,
      );
      queryClient.setQueryData(bespokeProjectQuery(baseline.project_reference).queryKey, updated);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bespoke-project", baseline.project_reference.toUpperCase()],
        }),
        queryClient.invalidateQueries({ queryKey: ["bespoke-projects"] }),
      ]);
      setMessage("Changes saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Link
        to="/bespoke"
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Bespoke Projects
      </Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid size-11 place-items-center rounded-full border border-gold/40 bg-gold/10">
            <Gem className="size-5 text-gold" />
          </span>
          <div>
            <h1 className="font-display text-4xl leading-none">Bespoke Project</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Build the customer's bespoke piece through research, inspiration and design.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass flex h-11 items-center gap-2 rounded-xl px-4 text-sm text-gold">
            <Barcode className="size-4" />
            <span className="font-medium">{baseline.project_reference}</span>
            <Lock className="size-3.5 text-muted-foreground" />
          </div>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => void save()}
            className="glass-gold flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm text-gold disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
      {!baseline.updated_at && (
        <p
          className="mb-4 rounded-xl border border-gold/30 bg-gold/10 p-3 text-sm text-gold"
          role="status"
        >
          Saving is unavailable because this project has no updated-at timestamp.
        </p>
      )}
      {!knownStatus && (
        <p
          className="mb-4 rounded-xl border border-gold/30 bg-gold/10 p-3 text-sm text-gold"
          role="status"
        >
          The saved status ({baseline.status}) needs review before editing.
        </p>
      )}
      {error && (
        <p
          className="mb-4 rounded-xl border border-destructive/40 p-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 rounded-xl border border-gold/30 p-3 text-sm text-gold" role="status">
          {message}
        </p>
      )}
      {knownStatus && (
        <BespokeProgress
          status={form.status as BespokeStage}
          onChange={(status) => {
            setForm((current) => ({ ...current, status }));
            setError("");
            setMessage("");
          }}
        />
      )}
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <section className="glass rounded-2xl p-4">
            <div className="grid gap-3 md:grid-cols-3">
              {(
                [
                  ["Name", "e.g. Sarah Hamilton", "fullName"],
                  ["Number", "e.g. 07700 900123", "phone"],
                  ["Email", "e.g. sarah@example.com", "email"],
                ] as const
              ).map(([label, placeholder, key]) => (
                <label key={key} className="block text-sm">
                  <span className="mb-2 block text-muted-foreground">{label}</span>
                  <input
                    className={field}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={set(key)}
                  />
                </label>
              ))}
            </div>
            <div className="glass-gold mt-4 flex flex-wrap items-center gap-4 rounded-xl p-4">
              <span className="grid size-10 place-items-center rounded-full border border-gold/40">
                <Search className="size-4 text-gold" />
              </span>
              <div className="text-sm">
                <div className="font-semibold">
                  {form.clientId ? "Existing customer linked" : "Existing customer?"}
                </div>
                <div className="text-muted-foreground">
                  {form.clientId
                    ? "This bespoke project is linked to their record."
                    : "Search to link an existing customer."}
                </div>
              </div>
              <button
                type="button"
                disabled={searching}
                onClick={() => void findClient()}
                className="glass-gold ml-auto rounded-lg px-4 py-2.5 text-sm text-gold disabled:opacity-60"
              >
                {searching ? "Searching…" : "Search Customer →"}
              </button>
            </div>
            {matches && (
              <div className="glass mt-3 rounded-xl p-2 text-sm">
                {matches.length === 0 ? (
                  <p className="p-2 text-muted-foreground">No existing customer matched.</p>
                ) : (
                  matches.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-accent/40"
                      onClick={() => {
                        setForm((current) => ({
                          ...current,
                          clientId: client.id,
                          fullName: client.fullName,
                          phone: client.phone,
                          email: client.email ?? current.email,
                        }));
                        setMatches(null);
                      }}
                    >
                      <User className="size-4 text-gold" />
                      <span>
                        <b className="block">{client.fullName}</b>
                        <span className="text-xs text-muted-foreground">{client.phone}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </section>
          <section className="glass rounded-2xl p-4">
            <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
              <label className="block text-sm">
                <span className="mb-2 block text-muted-foreground">Action</span>
                <input
                  className={field}
                  placeholder="e.g. Research emerald options"
                  value={form.nextAction}
                  onChange={set("nextAction")}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-muted-foreground">Due date</span>
                <input
                  className={field}
                  type="date"
                  value={form.nextActionDate}
                  onChange={set("nextActionDate")}
                />
              </label>
            </div>
          </section>
        </div>
        <section className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg border border-gold/30 bg-gold/10">
              <Gem className="size-4 text-gold" />
            </span>
            <h2 className="font-display text-xl">Bespoke Project</h2>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-2 block text-muted-foreground">Project name</span>
                <input
                  className={field}
                  placeholder="e.g. Sarah's Emerald Ring"
                  value={form.projectName}
                  onChange={set("projectName")}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-muted-foreground">Piece type</span>
                <select className={field} value={form.pieceType} onChange={set("pieceType")}>
                  <option value="">Select piece type</option>
                  {!["Ring", "Necklace", "Bracelet", "Earrings", "Pendant", "Other"].includes(
                    form.pieceType,
                  ) &&
                    form.pieceType && <option value={form.pieceType}>{form.pieceType}</option>}
                  {["Ring", "Necklace", "Bracelet", "Earrings", "Pendant", "Other"].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-2 block text-muted-foreground">Customer brief</span>
              <textarea
                rows={5}
                maxLength={2000}
                className={area}
                value={form.brief}
                onChange={set("brief")}
                placeholder="Describe what the customer wants, the story behind the piece, preferences, requirements and initial ideas."
              />
              <span className="mt-1 block text-right text-xs text-muted-foreground">
                {form.brief.length}/2000
              </span>
            </label>
          </div>
          <div className="mt-5 border-t border-border/50 pt-4">
            <h3 className="mb-4 text-sm font-medium text-gold">Research & Notes</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-2 block text-muted-foreground">Research</span>
                <textarea
                  rows={8}
                  maxLength={3000}
                  className={area}
                  value={form.research}
                  onChange={set("research")}
                  placeholder="Materials, stones, references, suppliers, design research and ideas to explore..."
                />
                <span className="mt-1 block text-right text-xs text-muted-foreground">
                  {form.research.length}/3000
                </span>
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-muted-foreground">Notes</span>
                <textarea
                  rows={8}
                  maxLength={3000}
                  className={area}
                  value={form.notes}
                  onChange={set("notes")}
                  placeholder="Customer conversations, design decisions, internal notes and follow-ups..."
                />
                <span className="mt-1 block text-right text-xs text-muted-foreground">
                  {form.notes.length}/3000
                </span>
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
