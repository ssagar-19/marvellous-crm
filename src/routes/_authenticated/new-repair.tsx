import { GlassSelect } from "@/components/glass-select";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft, User, Gem, FileText, Image as ImageIcon, MessageSquare, Search,
  Barcode, History, Zap, Save, CheckCircle2, Trash2, Info, Lock, Plus, Loader2,
} from "lucide-react";
import { createJob, searchClients } from "@/lib/crm.functions";
import { JOB_PRIORITIES, priorityLabels, type ClientDTO } from "@/lib/crm-domain";

export const Route = createFileRoute("/_authenticated/new-repair")({
  head: () => ({
    meta: [
      { title: "Create Repair Job | Marvellous Jewellers CRM" },
      { name: "description", content: "Book in a new customer repair or service job with photos, notes and an auto-generated job reference." },
      { property: "og:title", content: "Create New Job" },
      { property: "og:description", content: "Add a new customer and job to the system." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewJob,
});

function Card({ step, title, icon: Icon, children, action }: { step?: string; title: string; icon: React.ElementType; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg border border-gold/30 bg-gold/10"><Icon className="size-4 text-gold" /></span>
          <h2 className="font-display text-xl">{step ? `${step}. ` : ""}{title}</h2>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const field = "h-11 w-full rounded-xl border border-border bg-[var(--navy-deep)]/50 px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-gold/60";
const area = "w-full rounded-xl border border-border bg-[var(--navy-deep)]/50 p-4 text-sm outline-none placeholder:text-muted-foreground focus:border-gold/60";

const empty = {
  fullName: "", phone: "", email: "", postcode: "",
  quotedPrice: "", depositAmount: "", promisedDate: "",
  priority: "NORMAL", customerNotes: "",
};

type ItemForm = {
  itemType: string;
  service: string;
  metal: string;
  stone: string;
  description: string;
  quantity: number;
};

const emptyItem: ItemForm = {
  itemType: "",
  service: "",
  metal: "",
  stone: "",
  description: "",
  quantity: 1,
};

const ITEM_TYPES = [
  "Bracelet",
  "Chain",
  "Earrings",
  "Necklace",
  "Pendant",
  "Ring",
  "Watch",
];

const SERVICES = [
  "Battery",
  "Chain Repair",
  "Clasp Repair",
  "Engraving",
  "Full Service",
  "Polish",
  "Plating",
  "Polishing & Plating",
  "Resize",
  "Stone Replacement",
  "Valuation",
];

function NewJob() {
  const [form, setForm] = useState({ ...empty });
  const [items, setItems] = useState<ItemForm[]>([{ ...emptyItem }]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState<null | "job" | "draft">(null);
  const [matches, setMatches] = useState<ClientDTO[] | null>(null);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const set = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (key === "phone" || key === "fullName") setClientId(null);
  };

  function extractJewelleryDetails(description: string) {
  const metalPatterns = [
    /\b\d{1,2}\s?ct\s?(?:white|yellow|rose)?\s?gold\b/i,
    /\b(?:white|yellow|rose)\s?gold\b/i,
    /\bplatinum\b/i,
    /\bsilver\b/i,
  ];

  const stonePatterns = [
    /\bdiamonds?\b/i,
    /\bsapphires?\b/i,
    /\brub(?:y|ies)\b/i,
    /\bemeralds?\b/i,
    /\bopals?\b/i,
    /\bamethysts?\b/i,
    /\baquamarines?\b/i,
    /\btanzanites?\b/i,
    /\btopazes?\b/i,
  ];

  const metal = metalPatterns
    .map((pattern) => description.match(pattern)?.[0])
    .find(Boolean) ?? "";

  const stone = stonePatterns
    .map((pattern) => description.match(pattern)?.[0])
    .find(Boolean) ?? "";

  return { metal, stone };
}

  const setItem = (index: number, key: keyof ItemForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setItems((list) => list.map((it, i) => (i === index ? { ...it, [key]: value } : it)));
  };

  function removeItem(index: number) {
    setItems((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : list));
  }

  async function findClient() {
    const term = form.fullName.trim() || form.phone.trim() || form.postcode.trim();
    if (term.length < 2) { setErrors(["Enter a name, number or postcode to search."]); return; }
    setSearching(true);
    try {
      setMatches(await searchClients({ data: { term } }));
    } catch {
      setErrors(["Customer search is unavailable right now."]);
    } finally {
      setSearching(false);
    }
  }

  function useMatch(c: ClientDTO) {
    setClientId(c.id);
    setForm((f) => ({ ...f, fullName: c.fullName, phone: c.phone, email: c.email ?? f.email, postcode: c.postcode ?? f.postcode }));
    setMatches(null);
  }

  function validate(): string[] {
  const problems: string[] = [];

  if (form.fullName.trim().length < 2)
    problems.push("Customer name is required.");

  if (form.phone.trim().length > 0 && form.phone.trim().length < 6)
    problems.push("Customer phone number must be at least 6 characters.");

  if (!form.promisedDate.trim())
    problems.push("Promised completion date is required.");

  items.forEach((item, index) => {
    const n = items.length > 1 ? `Item ${index + 1}: ` : "";

    if (!item.itemType.trim())
      problems.push(`${n}choose an item type.`);

    if (!item.service.trim())
      problems.push(`${n}choose the requested work.`);

    if (!item.description.trim())
      problems.push(`${n}add a description.`);
  });

  return problems;
}

  async function submit(isDraft: boolean) {
    const problems = validate();
    if (problems.length > 0) {
      setErrors(problems);
      setBusy(null);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors([]);
    setBusy(isDraft ? "draft" : "job");
    try {
      const { reference } = await createJob({
        data: {
          clientId,
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          postcode: form.postcode.trim(),
   items: items.map((i) => {
  const description = i.description.trim();
  const extracted = extractJewelleryDetails(description);

      return {
      itemType: i.itemType.trim(),
      service: i.service.trim(),
      metal: extracted.metal,
      stone: extracted.stone,
      description,
    };
  }),
  quotedPrice: form.quotedPrice.trim() === "" ? null : Number(form.quotedPrice),
          depositAmount: form.depositAmount.trim() === "" ? null : Number(form.depositAmount),
          promisedDate: form.promisedDate,
          priority: form.priority as (typeof JOB_PRIORITIES)[number],
          customerNotes: form.customerNotes.trim(),
          isDraft,
        },
      });
      await queryClient.invalidateQueries();
      if (isDraft) {
        setErrors([]);
        setForm({ ...empty });
        setItems([{ ...emptyItem }]);
        setClientId(null);
        setBusy(null);
        setSavedDraft(reference);
        return;
      }
      await navigate({ to: "/jobs/$ref", params: { ref: reference } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save this job.";
      try {
        const parsed = JSON.parse(message) as { message: string }[];
        setErrors(parsed.map((p) => p.message));
      } catch {
        setErrors([message]);
      }
      setBusy(null);
    }
  }

  const [savedDraft, setSavedDraft] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-display text-4xl leading-none">Create New Job</h1>
   
          </div>
        </div>
        <Link to="/jobs" className="glass flex h-11 items-center gap-2 rounded-xl px-4 text-sm"><ArrowLeft className="size-4 text-gold" /> Back</Link>
      </div>

      {errors.length > 0 ? (
        <div className="glass mb-5 rounded-2xl border border-destructive/40 p-4 text-sm text-destructive" role="alert">
          <ul className="list-inside list-disc space-y-1">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      ) : null}
      {savedDraft ? (
        <div className="glass-gold mb-5 rounded-2xl p-4 text-sm text-gold">Draft saved as {savedDraft}.</div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <Card
            step="1"
            title="Customer Details"
            icon={User}
            action={
              <button
                type="button"
                onClick={() => void findClient()}
                className="glass-gold rounded-lg px-4 py-2.5 text-sm text-gold"
              >
                {searching ? "Searching…" : "Search Customer →"}
              </button>
            }
          >
            <div className="grid gap-4 md:grid-cols-4">
              {([
                ["Name", "e.g. Sarah Hamilton", "fullName", true],
                ["Number", "e.g. 07700 900123", "phone", false],
                ["Email", "e.g. sarah@example.com", "email", false],
                ["Postcode", "e.g. SW1A 1AA", "postcode", false],
              ] as const).map(([label, ph, key, required]) => (
                <label key={key} className="block text-sm">
                  <span className="mb-2 block text-muted-foreground">
                    {label}
                  </span>
                  <input className={field} placeholder={ph} value={form[key]} onChange={set(key)} />
                </label>
              ))}
            </div>
            {matches ? (
              <div className="glass mt-3 rounded-xl p-2 text-sm">
                {matches.length === 0 ? <p className="p-2 text-muted-foreground">No existing customer matched. A new client will be created.</p> : matches.map((c) => (
                  <button key={c.id} type="button" onClick={() => useMatch(c)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-accent/40">
                    <User className="size-4 text-gold" />
                    <span><b className="block">{c.fullName}</b><span className="text-xs text-muted-foreground">{c.phone}{c.postcode ? ` · ${c.postcode}` : ""}</span></span>
                  </button>
                ))}
              </div>
            ) : null}
          </Card>

          <Card step="2" title="Items" icon={Gem}>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="glass-inset rounded-xl p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-[0.18em] text-gold">Item {index + 1}</span>
                    {items.length > 1 ? (
                      <button type="button" onClick={() => removeItem(index)} className="flex items-center gap-1.5 text-xs text-destructive">
                        <Trash2 className="size-3.5" /> Remove
                      </button>
                    ) : null}
                  </div>
                  <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
                    <label className="text-sm"><span className="mb-2 block text-muted-foreground">Item type <span className="text-gold">*</span></span>
                      <GlassSelect
                        value={item.itemType}
                        onChange={(value) => setItems((list) =>
                          list.map((entry, i) =>
                            i === index ? { ...entry, itemType: value } : entry
                          )
                        )}
                        options={[
                          { value: "", label: "Select item" },
                          ...ITEM_TYPES.map((o) => ({ value: o, label: o })),
                        ]}
                        placeholder="Select item"
                      />
                    </label>

                    <div className="text-sm">
                      <span className="mb-2 block text-muted-foreground">Quantity</span>
                      <div className="flex h-11 items-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
                        <button
                          type="button"
                          onClick={() => setItems((list) => list.map((entry, i) => i === index ? { ...entry, quantity: Math.max(1, entry.quantity - 1) } : entry))}
                          className="grid h-full w-10 place-items-center text-lg text-muted-foreground transition hover:bg-white/10 hover:text-gold"
                        >
                          −
                        </button>
                        <span className="grid h-full min-w-10 place-items-center border-x border-white/10 text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setItems((list) => list.map((entry, i) => i === index ? { ...entry, quantity: entry.quantity + 1 } : entry))}
                          className="grid h-full w-10 place-items-center text-lg text-muted-foreground transition hover:bg-white/10 hover:text-gold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <label className="text-sm"><span className="mb-2 block text-muted-foreground">Requested work <span className="text-gold">*</span></span>
                      <GlassSelect
                        value={item.service}
                        onChange={(value) => setItems((list) =>
                          list.map((entry, i) =>
                            i === index ? { ...entry, service: value } : entry
                          )
                        )}
                        options={[
                          { value: "", label: "Repair / Service" },
                          ...SERVICES.map((o) => ({ value: o, label: o })),
                        ]}
                        placeholder="Repair / Service"
                      />
                    </label>
                  </div>
                  <label className="mt-4 block text-sm">
                    <span className="mb-2 block text-muted-foreground">Description <span className="text-gold">*</span></span>
                    <textarea rows={3} maxLength={1000} className={area} value={item.description} onChange={setItem(index, "description")}
                      placeholder="Identifying characteristics, condition and the issue to address for this piece." />
                    <span className="mt-1 block text-right text-xs text-muted-foreground">{item.description.length}/1000</span>
                  </label>
                </div>
              ))}
              <button type="button" onClick={() => setItems((list) => [...list, { ...emptyItem }])}
                className="glass-gold flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-gold">
                <Plus className="size-4" /> Add Another Item
              </button>
            </div>
          </Card>



          <Card step="4" title="Photos" icon={ImageIcon}>
            <div className="flex flex-wrap gap-4">
              <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-border p-8 text-center text-sm">
                <ImageIcon className="mb-2 size-6 text-gold" />
                <div>Photo upload arrives in the next phase</div>
                <div className="text-muted-foreground">Job photos can be added from the job page later.</div>
              </div>
              {[0, 1, 2].map((i) => (
                <div key={i} className="grid w-24 place-items-center rounded-xl border border-border bg-accent/40 text-muted-foreground"><Plus className="size-5" /></div>
              ))}
            </div>
          </Card>

          <Card step="5" title="Notes from Admin / Client" icon={MessageSquare}>
            <textarea rows={3} maxLength={1000} className={area} value={form.customerNotes} onChange={set("customerNotes")}
              placeholder="Add any notes from the client or internal notes for the workshop." />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>e.g. Customer needs this back before a specific date, particular issues to look at, prior work, etc.</span>
              <span>{form.customerNotes.length}/1000</span>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Job Reference" icon={Barcode}>
            <p className="-mt-2 mb-3 text-xs text-muted-foreground">This is generated automatically once the job is created.</p>
            <div className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-gold/40 py-4 font-display text-2xl text-gold">MJ-***** <Lock className="size-4" /></div>
          </Card>



          <Card step="3" title="Job Details" icon={FileText}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm"><span className="mb-2 block text-muted-foreground">Quoted price</span>
                <input className={`${field} appearance-none`} type="number" min="0" step="0.01" placeholder="0" value={form.quotedPrice} onChange={set("quotedPrice")} onBlur={() => { if (!form.quotedPrice) setForm((f) => ({ ...f, quotedPrice: "0" })); }} />
              </label>
              <label className="text-sm"><span className="mb-2 block text-muted-foreground">Deposit taken</span>
                <input className={`${field} appearance-none`} type="number" min="0" step="0.01" placeholder="0" value={form.depositAmount} onChange={set("depositAmount")} onBlur={() => { if (!form.depositAmount) setForm((f) => ({ ...f, depositAmount: "0" })); }} />
              </label>
              <label className="text-sm"><span className="mb-2 block text-muted-foreground">Promised completion date <span className="text-gold">*</span></span>
                <input className={field} type="date" value={form.promisedDate} onChange={set("promisedDate")} />
              </label>
              
              <label className="text-sm"><span className="mb-2 block text-muted-foreground">Priority <span className="text-gold">*</span></span>
                <GlassSelect
                  value={form.priority}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      priority: value as typeof current.priority,
                    }))
                  }
                  options={JOB_PRIORITIES.map((p) => ({
                    value: p,
                    label: priorityLabels[p],
                  }))}
                />
              </label>
            </div>
          </Card>



          <Card title="Quick Actions" icon={Zap}>
            <div className="space-y-2 text-sm">
              <button type="button" disabled={busy !== null} onClick={() => void submit(false)} className="glass-gold flex w-full items-center gap-3 rounded-xl px-4 py-3 text-gold disabled:opacity-60">
                {busy === "job" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Create Job
              </button>

              <button type="button" disabled={busy !== null} onClick={() => void submit(true)} className="glass flex w-full items-center gap-3 rounded-xl px-4 py-3 disabled:opacity-60">
                {busy === "draft" ? <Loader2 className="size-4 animate-spin text-gold" /> : <Save className="size-4 text-gold" />} Save as Draft
              </button>

              <button type="button" onClick={() => { setForm({ ...empty }); setItems([{ ...emptyItem }]); setClientId(null); setErrors([]); setMatches(null); setSavedDraft(null); }} className="glass flex w-full items-center gap-3 rounded-xl px-4 py-3 text-destructive">
                <Trash2 className="size-4" /> Clear Form
              </button>
            </div>
          </Card>

          <Card title="Next Steps" icon={Info}>
            <p className="-mt-2 text-sm text-muted-foreground">After creating the job, you'll be able to:</p>
            <ol className="mt-3 space-y-3 text-sm">
              {["View and print the job sheet", "Generate QR code / barcode", "Add to workshop queue", "Track progress and updates"].map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className="grid size-6 place-items-center rounded-full border border-gold/40 text-xs text-gold">{i + 1}</span>{s}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
