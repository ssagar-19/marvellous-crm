import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpDown, Filter, MoreHorizontal, Wrench } from "lucide-react";
import { PageHeader, PanelError, PanelLoading, ToolButton } from "@/components/app-shell";
import { jobsQuery } from "@/lib/crm-queries";
import { formatDate, locationLabels, workshopColumns, type JobDTO } from "@/lib/crm-domain";
import jewellerySheet from "@/assets/jewellery-sheet.jpg";

export const Route = createFileRoute("/_authenticated/workshop")({
  head: () => ({ meta: [
    { title: "Workshop Board | Marvellous Jewellers CRM" },
    { name: "description", content: "Bench-level view of jewellery jobs in progress, quality checks and pieces ready for collection." },
    { property: "og:title", content: "Workshop Board" }, { property: "og:description", content: "Bench-level view of every job moving through the workshop." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(jobsQuery),
  pendingComponent: () => <PanelLoading label="Loading the workshop board…" />,
  errorComponent: ({ error }) => <PanelError message={error.message} />,
  notFoundComponent: () => <PanelError message="No workshop jobs found." />,
  component: Workshop,
});

const photos = ["jewel-diamond", "jewel-chain", "jewel-watch", "jewel-bracelet", "jewel-emerald", "jewel-pendant"];

function WorkshopCard({ job, index, color }: { job: JobDTO; index: number; color: string }) {
  return <Link to="/jobs/$ref" params={{ ref: job.reference }} className="glass-tile grid min-h-[112px] grid-cols-[1fr_76px] gap-3 rounded-lg p-3 transition-transform hover:-translate-y-0.5">
    <div className="min-w-0 text-sm"><div>{job.reference}</div><div className="mt-0.5 truncate font-semibold">{job.itemType} — {job.service}</div><div className="mt-1 truncate text-muted-foreground">{job.clientName}</div><div className="text-muted-foreground">Due: {formatDate(job.promisedDate)}</div><div className="text-xs text-muted-foreground">{locationLabels[job.location]}</div></div>
    <span className={`jewel-thumb relative ${photos[index % photos.length]}`}><img src={jewellerySheet} alt={job.itemType} width={1536} height={1024} loading="lazy" /><i className="absolute right-1 top-1 size-2 rounded-full" style={{ background: color }} /></span>
  </Link>;
}

function Workshop() {
  const { data: jobs } = useSuspenseQuery(jobsQuery);

  return <div className="mx-auto max-w-[1500px]">
    <PageHeader icon={Wrench} title="Workshop Board" subtitle="Track and manage every job through the workshop" actions={<><ToolButton><Filter className="size-4 text-gold" /> Filter</ToolButton><ToolButton><ArrowUpDown className="size-4 text-gold" /> Sort: Due Date</ToolButton><ToolButton><MoreHorizontal className="size-4 text-gold" /></ToolButton></>} />
    <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
      {workshopColumns.map((col, ci) => { const list = jobs.filter(j => (col.statuses as readonly string[]).includes(j.status)); return <section key={col.key}>
        <div className="flex items-center gap-3"><span className="size-4 rounded-full shadow-[0_0_14px_currentColor]" style={{ background: col.color, color: col.color }} /><h2 className="font-display text-2xl">{col.title}</h2><span className="rounded-full bg-accent/60 px-2 py-0.5 text-xs">{list.length}</span></div>
        <p className="mt-1 text-sm text-muted-foreground">{col.blurb}</p>
        <div className="mt-4 space-y-4">
          {list.length === 0 ? <p className="text-sm text-muted-foreground">Nothing here right now.</p> : list.map((job, i) => <WorkshopCard key={job.id} job={job} index={i + ci} color={col.color} />)}
        </div>
      </section>; })}
    </div>
  </div>;
}
