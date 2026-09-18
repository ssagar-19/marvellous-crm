import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Archive, ArrowUpDown, BarChart3, Box, Check, Filter, LayoutGrid, MessageSquare, Plus, PoundSterling, ShoppingBag, Wrench, type LucideIcon } from "lucide-react";
import { PageHeader, PanelError, PanelLoading, ToolButton } from "@/components/app-shell";
import { jobsQuery } from "@/lib/crm-queries";
import { boardColumns, formatDate, type JobDTO } from "@/lib/crm-domain";
import jewellerySheet from "@/assets/jewellery-sheet.jpg";

export const Route = createFileRoute("/_authenticated/jobs/")({
  head: () => ({ meta: [
    { title: "Job Status Board | Marvellous Jewellers CRM" },
    { name: "description", content: "Track every jewellery repair job through the workshop, from intake to collection." },
    { property: "og:title", content: "Job Status Board" },
    { property: "og:description", content: "Track every jewellery repair job through the workshop." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(jobsQuery),
  pendingComponent: () => <PanelLoading label="Loading jobs…" />,
  errorComponent: ({ error }) => <PanelError message={error.message} />,
  notFoundComponent: () => <PanelError message="No jobs found." />,
  component: JobsBoard,
});

const icons: Record<string, LucideIcon> = { quote: PoundSterling, received: Box, workshop: Wrench, approval: MessageSquare, qc: Check, ready: ShoppingBag };
const photos = ["jewel-diamond", "jewel-chain", "jewel-watch", "jewel-emerald", "jewel-bracelet", "jewel-diamond", "jewel-pendant"];

function JobCard({ job, index }: { job: JobDTO; index: number }) {
  return <Link to="/jobs/$ref" params={{ ref: job.reference }} className="glass-tile grid min-h-[88px] grid-cols-[58px_1fr] gap-3 rounded-lg p-2.5 transition-transform hover:-translate-y-0.5">
    <span className={`jewel-thumb ${photos[index % photos.length]}`}><img src={jewellerySheet} alt={job.itemType} width={1536} height={1024} loading="lazy" /></span>
    <div className="relative min-w-0 pr-2 text-xs"><div>{job.reference}</div><div className="mt-0.5 truncate font-semibold">{job.itemType} — {job.service}</div><div className="mt-1 truncate text-muted-foreground">{job.clientName}</div><div className="text-muted-foreground">Due: {formatDate(job.promisedDate)}</div></div>
  </Link>;
}

function JobsBoard() {
  const { data: jobs } = useSuspenseQuery(jobsQuery);

  return <div className="mx-auto max-w-[1580px]">
    <PageHeader title="Job Status Board" subtitle="Track and manage every job through the workshop" actions={<><ToolButton><Filter className="size-4 text-gold" /> Filter</ToolButton><ToolButton><ArrowUpDown className="size-4 text-gold" /> Sort: Due Date</ToolButton><ToolButton><LayoutGrid className="size-4 text-gold" /> View</ToolButton><ToolButton primary><Archive className="size-4" /> View Completed</ToolButton></>} />
    <div className="overflow-x-auto pb-2"><div className="grid min-w-[1320px] grid-cols-6 gap-3">
      {boardColumns.map(col => { const list = jobs.filter(job => (col.statuses as readonly string[]).includes(job.status)); const Icon = icons[col.key]!; return <section key={col.key} className="glass min-h-[510px] rounded-xl p-3">
        <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full" style={{ background: `color-mix(in oklab, ${col.color} 30%, transparent)` }}><Icon className="size-4" style={{ color: col.color }} /></span><h2 className="font-display text-lg">{col.label}</h2><span className="ml-auto rounded-full bg-accent/60 px-2 py-0.5 text-xs">{list.length}</span></div>
        <p className="mt-1 text-[10px] text-muted-foreground">{col.blurb}</p>
        <div className="mt-3 space-y-2">{list.map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
          <Link to="/new-job" className="flex h-12 items-center justify-center gap-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground"><Plus className="size-4" /> {col.key === "received" ? "Add New Job" : col.key === "workshop" ? "Add Job to Workshop" : "Add Job"}</Link>
        </div>
      </section>; })}
    </div></div>
    <section className="glass mt-3 flex min-w-0 items-center gap-4 rounded-xl p-3 lg:max-w-[80%]">
      <BarChart3 className="size-7 shrink-0 text-gold" /><div className="mr-auto"><h2 className="font-display text-lg">Workflow Overview</h2><p className="text-[10px] text-muted-foreground">Total jobs in system</p></div>
      <div className="flex flex-1 gap-2 overflow-x-auto">{boardColumns.map(col => <div key={col.key} className="glass-inset flex min-w-[132px] items-center gap-2 rounded-lg px-3 py-2"><span className="size-2.5 rounded-full" style={{ background: col.color }} /><div><div className="text-sm">{jobs.filter(j => (col.statuses as readonly string[]).includes(j.status)).length}</div><div className="text-[9px] text-muted-foreground">{col.label}</div></div></div>)}</div>
    </section>
  </div>;
}
