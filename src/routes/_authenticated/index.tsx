import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight, BriefcaseBusiness, Clock3, Facebook, Instagram,
  MessageSquare, Search, ShoppingBag, Star, Wrench,
} from "lucide-react";
import { PanelError, PanelLoading, ToolButton } from "@/components/app-shell";
import { jobsQuery } from "@/lib/crm-queries";
import {
  CLOSED_STATUSES, daysOverdue, formatDate, locationLabels, statusLabels, statusTone, toneColor,
  type JobStatus,
} from "@/lib/crm-domain";
import jewellerySheet from "@/assets/jewellery-sheet.jpg";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({ meta: [
    { title: "Dashboard | Marvellous Jewellers CRM" },
    { name: "description", content: "Live overview of jewellery repairs, workshop activity and customer messages." },
    { property: "og:title", content: "Marvellous Jewellers CRM Dashboard" },
    { property: "og:description", content: "Live overview of repairs, workshop activity and customer messages." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(jobsQuery),
  pendingComponent: () => <PanelLoading label="Loading today's workshop overview…" />,
  errorComponent: ({ error }) => <PanelError message={error.message} />,
  notFoundComponent: () => <PanelError message="Nothing to show yet." />,
  component: Dashboard,
});

const WORKSHOP: JobStatus[] = ["IN_PROGRESS", "WAITING_FOR_PARTS", "RETURNED_TO_WORKSHOP"];
const photoClasses = ["jewel-diamond", "jewel-bracelet", "jewel-watch", "jewel-pendant", "jewel-chain"];

function SectionTitle({ icon: Icon, title, subtitle, link }: { icon: React.ElementType; title: string; subtitle: string; link?: "/jobs" | "/outlook" }) {
  return <div className="flex items-start gap-3">
    <span className="glass-gold grid size-10 shrink-0 place-items-center rounded-full"><Icon className="size-5 text-gold" /></span>
    <div><h2 className="font-display text-2xl leading-none">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p></div>
    {link ? <Link to={link} className="ml-auto flex items-center gap-1 text-xs text-foreground">View all <ArrowRight className="size-3.5 text-gold" /></Link> : null}
  </div>;
}


function Dashboard() {
  const { data: jobs } = useSuspenseQuery(jobsQuery);
  const now = new Date();

  const active = jobs.filter((j) => !CLOSED_STATUSES.includes(j.status));
  const stats = [
    { label: "Active", value: active.length, icon: BriefcaseBusiness, tone: "blue" },
    { label: "Workshop", value: jobs.filter((j) => WORKSHOP.includes(j.status)).length, icon: Wrench, tone: "amber" },
    { label: "QC", value: jobs.filter((j) => j.status === "AWAITING_QC").length, icon: Search, tone: "blue" },
    { label: "Awaiting Approval", value: jobs.filter((j) => j.status === "AWAITING_APPROVAL").length, icon: MessageSquare, tone: "violet" },
    { label: "Awaiting Collection", value: jobs.filter((j) => j.status === "READY_FOR_COLLECTION").length, icon: ShoppingBag, tone: "amber" },
  ];

  const queue = [...active].sort((a, b) => (a.promisedDate ?? "9999").localeCompare(b.promisedDate ?? "9999")).slice(0, 5);
  const overdueJobs = active
    .map((j) => ({ job: j, days: daysOverdue(j.promisedDate, j.status) }))
    .filter((x) => x.days > 0)
    .sort((a, b) => b.days - a.days)
    .slice(0, 5);

  return <div className="mx-auto max-w-[1500px]">
    <div className="mb-4 flex items-end justify-between gap-4">
      <div><div className="text-xs text-muted-foreground">{now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
        <h1 className="mt-1 font-display text-5xl leading-none">Welcome, <span className="gold-text">Marv.</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">Here’s what’s happening in the workshop today.</p>
      </div>
      <Link to="/new-job"><ToolButton primary>+ &nbsp; New Job</ToolButton></Link>
    </div>

    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
      {stats.map(({ label, value, icon: Icon, tone }) => <Link key={label} to="/jobs" className="glass flex min-h-20 items-center gap-4 rounded-xl px-4 py-3">
        <span className="glass-gold grid size-11 shrink-0 place-items-center rounded-full"><Icon className="size-5" style={{ color: toneColor[tone] }} /></span>
        <div><div className="text-xs text-muted-foreground">{label}</div><div className="display-figure mt-1 text-3xl">{value}</div></div>
        <ArrowRight className="ml-auto size-4 text-gold" />
      </Link>)}
    </div>

    <div className="mt-3 grid gap-3 xl:grid-cols-3">
      <section className="glass-gold min-w-0 rounded-xl p-4 xl:col-span-2">
        <SectionTitle icon={BriefcaseBusiness} title="Work Queue" subtitle="View and manage jobs by status." link="/jobs" />
        <div className="mt-4 overflow-x-auto"><div className="min-w-[690px]">
          <div className="grid grid-cols-[1.05fr_1.25fr_1.35fr_.85fr_.7fr_1fr_20px] gap-3 px-2 pb-2 text-[10px] uppercase text-muted-foreground"><span>Job Ref</span><span>Customer</span><span>Item / Service</span><span>Location</span><span>Due</span><span>Status</span><span /></div>
          {queue.length === 0 ? <p className="px-2 py-6 text-xs text-muted-foreground">No active jobs in the workshop.</p> : queue.map((job, i) => {
            const late = daysOverdue(job.promisedDate, job.status) > 0;
            return <Link key={job.id} to="/jobs/$ref" params={{ ref: job.reference }} className="grid grid-cols-[1.05fr_1.25fr_1.35fr_.85fr_.7fr_1fr_20px] items-center gap-3 border-t border-border/60 px-2 py-2 text-xs">
              <span className="flex items-center gap-2 font-medium"><span className={`jewel-thumb size-10 ${photoClasses[i % photoClasses.length]}`}><img src={jewellerySheet} alt="" width={1536} height={1024} /></span>{job.reference}</span>
              <span><b className="block font-medium">{job.clientName}</b><span className="text-[10px] text-muted-foreground">{job.clientPhone}</span></span>
              <span>{job.itemType}<span className="block text-muted-foreground">{job.service}</span></span>
              <span className="text-muted-foreground">{locationLabels[job.location]}</span>
              <span className={late ? "text-status-red" : ""}>{formatDate(job.promisedDate)}</span>
              <span className="w-fit rounded px-2 py-1 text-[10px]" style={{ color: toneColor[statusTone[job.status]], background: `color-mix(in oklab, ${toneColor[statusTone[job.status]]} 18%, transparent)` }}>{statusLabels[job.status]}</span>
              <ArrowRight className="size-3.5 text-gold" />
            </Link>;
          })}
        </div></div>
      </section>

      <div className="grid min-w-0 gap-3">
        <section className="glass-gold min-w-0 rounded-xl p-4"><SectionTitle icon={Clock3} title="Overdue" subtitle="Jobs past their promised date." />
          {overdueJobs.length === 0 ? <p className="mt-4 text-xs text-muted-foreground">Nothing is overdue. Well done.</p> : <>
            <div className="mt-3 grid grid-cols-[.8fr_1.2fr_1.1fr_.65fr_.35fr_16px] gap-2 pb-2 text-[9px] uppercase text-muted-foreground"><span>Job Ref</span><span>Customer</span><span>Item / Service</span><span>Due</span><span>Days</span><span /></div>
            {overdueJobs.map(({ job, days }) => <Link key={job.id} to="/jobs/$ref" params={{ ref: job.reference }} className="grid grid-cols-[.8fr_1.2fr_1.1fr_.65fr_.35fr_16px] items-center gap-2 border-t border-border/60 py-2 text-[10px]">
              <span>{job.reference}</span><span className="truncate">{job.clientName}</span><span className="truncate">{job.service}</span><span>{formatDate(job.promisedDate)}</span>
              <span className="grid size-5 place-items-center rounded-full bg-status-red">{days}</span><ArrowRight className="size-3 text-gold" />
            </Link>)}
          </>}
        </section>

        <section className="glass min-w-0 rounded-xl p-4"><SectionTitle icon={Instagram} title="Social Health" subtitle="Reviews, messages and social media activity." />
          <div className="mt-4 grid grid-cols-4 gap-2">{[
            { icon: Search, n: "4.9", text: "248 reviews" }, { icon: Instagram, n: "2", text: "new messages" }, { icon: Facebook, n: "3", text: "new notifications" }, { icon: MessageSquare, n: "1", text: "new message" },
          ].map(({ icon: Icon, n, text }, i) => <div key={text} className="glass-inset rounded-lg p-2"><Icon className="size-5 text-gold" /><div className="mt-2 text-xl font-semibold">{n}</div>{i === 0 ? <div className="flex text-[8px] text-gold"><Star className="size-2.5 fill-current" /><Star className="size-2.5 fill-current" /><Star className="size-2.5 fill-current" /></div> : null}<div className="mt-1 text-[9px] text-muted-foreground">{text}</div></div>)}</div>
        </section>
      </div>
    </div>
  </div>;
}
