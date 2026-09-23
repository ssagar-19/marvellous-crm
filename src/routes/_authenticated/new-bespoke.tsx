import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft, User, Gem, FileText, Image as ImageIcon, MessageSquare, Search,
  Barcode, History, Zap, Save, CheckCircle2, Trash2, Info, Lock, Plus, Loader2,
} from "lucide-react";
import { searchClients } from "@/lib/crm.functions";
import type { ClientDTO } from "@/lib/crm-domain";

export const Route = createFileRoute("/_authenticated/new-bespoke")({
  head: () => ({
    meta: [
      { title: "Create Bespoke Project | Marvellous Jewellers CRM" },
      { name: "description", content: "Create a bespoke jewellery project with design notes, research and inspiration." },
      { property: "og:title", content: "Create Bespoke Project" },
      { property: "og:description", content: "Create a bespoke jewellery project with design notes, research and inspiration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewJob,
});

function Card({ step, title, icon: Icon, children }: { step?: string; title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg border border-gold/30 bg-gold/10">
          <Icon className="size-4 text-gold" />
        </span>
        <div>
          <h2 className="font-display text-xl">{title}</h2>
          {step ? <p className="text-xs text-muted-foreground">{step}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

const field = "h-11 w-full rounded-xl border border-border bg-[var(--navy-deep)]/50 px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-gold/60";
const area = "w-full rounded-xl border border-border bg-[var(--navy-deep)]/50 p-4 text-sm outline-none placeholder:text-muted-foreground focus:border-gold/60";

const empty = {
  fullName: "",
  phone: "",
  email: "",
  projectName: "",
  pieceType: "",
  brief: "",
  research: "",
  notes: "",
  nextAction: "",
  nextActionDate: "",
};

type InspirationImage = {
  id: number;
  name: string;
  type: "Inspiration" | "Sketch" | "Existing Piece" | "Design";
  url: string;
};

function NewJob() {
  const [form, setForm] = useState({ ...empty });
  const [clientId, setClientId] = useState<string | null>(null);
  const [matches, setMatches] = useState<ClientDTO[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [images, setImages] = useState<InspirationImage[]>([]);
  const [status, setStatus] = useState("Enquiry");
  const [saved, setSaved] = useState(false);

  const set = (key: keyof typeof empty) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (key === "phone" || key === "fullName") setClientId(null);
  };

  async function findClient() {
    setSearching(true);
    try {
      const result = await searchClients({
        data: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
        },
      });
      setMatches(result ?? []);
    } finally {
      setSearching(false);
    }
  }

  function useMatch(c: ClientDTO) {
    setClientId(c.id);
    setForm((f) => ({
      ...f,
      fullName: c.fullName,
      phone: c.phone,
      email: c.email ?? f.email,
    }));
    setMatches(null);
  }

  function addImage(type: InspirationImage["type"]) {
    setImages((current) => [
      ...current,
      {
        id: Date.now(),
        name: `${type} reference`,
        type,
        url: "",
      },
    ]);
  }

  return (
    <div>
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
        <Link to="/jobs" className="glass flex h-11 items-center gap-2 rounded-xl px-4 text-sm">
          <ArrowLeft className="size-4 text-gold" /> Back to Jobs
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <Card title="Customer" icon={User}>
            <div className="grid gap-4 md:grid-cols-3">
              {([
                ["Name", "e.g. Sarah Hamilton", "fullName"],
                ["Number", "e.g. 07700 900123", "phone"],
                ["Email", "e.g. sarah@example.com", "email"],
              ] as const).map(([label, ph, key]) => (
                <label key={key} className="block text-sm">
                  <span className="mb-2 block text-muted-foreground">{label}</span>
                  <input className={field} placeholder={ph} value={form[key]} onChange={set(key)} />
                </label>
              ))}
            </div>

            <div className="glass-gold mt-4 flex flex-wrap items-center gap-4 rounded-xl p-4">
              <span className="grid size-10 place-items-center rounded-full border border-gold/40">
                <Search className="size-4 text-gold" />
              </span>
              <div className="text-sm">
                <div className="font-semibold">
                  {clientId ? "Existing customer linked" : "Existing customer?"}
                </div>
                <div className="text-muted-foreground">
                  {clientId
                    ? "This bespoke project will be linked to their record."
                    : "Search to see if this customer already exists."}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void findClient()}
                className="glass-gold ml-auto rounded-lg px-4 py-2.5 text-sm text-gold"
              >
                {searching ? "Searching…" : "Search Customer →"}
              </button>
            </div>

            {matches ? (
              <div className="glass mt-3 rounded-xl p-2 text-sm">
                {matches.length === 0 ? (
                  <p className="p-2 text-muted-foreground">
                    No existing customer matched.
                  </p>
                ) : (
                  matches.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => useMatch(c)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-accent/40"
                    >
                      <User className="size-4 text-gold" />
                      <span>
                        <b className="block">{c.fullName}</b>
                        <span className="text-xs text-muted-foreground">
                          {c.phone}{c.postcode ? ` · ${c.postcode}` : ""}
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </Card>

          <Card title="Bespoke Project" icon={Gem}>
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
          </Card>

          <Card title="Design & Inspiration" icon={ImageIcon}>
            <div className="rounded-2xl border border-dashed border-gold/40 bg-gold/5 p-8 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full border border-gold/30 bg-gold/10">
                <ImageIcon className="size-6 text-gold" />
              </span>
              <h3 className="mt-4 font-display text-xl">Build the visual direction</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                Inspiration photos, sketches, existing pieces and design concepts will live here.
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {(["Inspiration", "Sketch", "Existing Piece", "Design"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className="glass-gold rounded-xl px-4 py-2.5 text-sm text-gold"
                    onClick={() =>
                      setImages((current) => [
                        ...current,
                        {
                          id: Date.now(),
                          name: `${type} reference`,
                          type,
                          url: "",
                        },
                      ])
                    }
                  >
                    <Plus className="mr-2 inline size-4" />
                    Add {type}
                  </button>
                ))}
              </div>
            </div>

            {images.length > 0 ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image) => (
                  <div key={image.id} className="glass-inset rounded-xl p-3">
                    <div className="grid aspect-[4/3] place-items-center rounded-lg border border-border bg-accent/30">
                      <ImageIcon className="size-7 text-gold/60" />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium">{image.name}</div>
                        <div className="text-xs text-muted-foreground">{image.type}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImages((current) => current.filter((item) => item.id !== image.id))}
                        className="text-xs text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>

          <div className="grid gap-5 md:grid-cols-2">
            <Card title="Research" icon={Search}>
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
            </Card>

            <Card title="Notes" icon={MessageSquare}>
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
            </Card>
          </div>
        </div>

        <div className="space-y-5">
          <Card title="Project Status" icon={Zap}>
            <div className="space-y-2">
              {["Enquiry", "Research", "Design", "Approval", "Workshop", "Completed"].map((stage, index) => {
                const active = status === stage;
                const reached = ["Enquiry", "Research", "Design", "Approval", "Workshop", "Completed"].indexOf(status) >= index;

                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setStatus(stage)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      active
                        ? "border-gold/50 bg-gold/10 text-gold"
                        : reached
                          ? "border-border bg-accent/20"
                          : "border-border/60 bg-transparent text-muted-foreground"
                    }`}
                  >
                    <span className={`grid size-7 place-items-center rounded-full border ${
                      reached ? "border-gold/50 text-gold" : "border-border"
                    }`}>
                      {reached ? "✓" : index + 1}
                    </span>
                    <span className="text-sm font-medium">{stage}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Next Action" icon={FileText}>
            <div className="space-y-4">
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
          </Card>

          <Card title="Project Reference" icon={Barcode}>
            <p className="-mt-2 mb-3 text-xs text-muted-foreground">
              A permanent project reference will be added when this workflow is connected to Supabase.
            </p>
            <div className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-gold/40 py-4 font-display text-2xl text-gold">
              BSP-*****
              <Lock className="size-4" />
            </div>
          </Card>

          <Card title="Save Project" icon={CheckCircle2}>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setSaved(true)}
                className="glass-gold flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm text-gold"
              >
                <Save className="size-4" />
                Save Bespoke Project
              </button>

              {saved ? (
                <div className="rounded-xl border border-gold/30 bg-gold/10 p-3 text-center text-sm text-gold">
                  Temporary project saved for this session.
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );


}
