import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarDays,
  Download,
  PoundSterling,
  FileText,
  PieChart,
  Users,
  Clock,
  ArrowRight,
} from "lucide-react";
import { PageHeader, ToolButton } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports | Marvellous Jewellers CRM" },
      {
        name: "description",
        content:
          "Revenue, completed jobs, service mix, customer activity and workshop turnaround insights.",
      },
      { property: "og:title", content: "Reports" },
      {
        property: "og:description",
        content: "Insights into your jewellery business performance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Reports,
});

const cards = [
  {
    icon: PoundSterling,
    title: "Revenue Overview",
    body: "View total revenue, payments received and outstanding amounts.",
    tone: "var(--status-green)",
  },
  {
    icon: FileText,
    title: "Jobs Completed",
    body: "Track completed jobs over time with key trends.",
    tone: "var(--status-blue)",
  },
  {
    icon: PieChart,
    title: "Jobs by Type",
    body: "See a breakdown of jobs by service type (e.g. resize, repair, clean, etc).",
    tone: "var(--status-violet)",
  },
  {
    icon: Users,
    title: "Customer Activity",
    body: "New vs returning customers and overall client activity.",
    tone: "var(--gold)",
  },
  {
    icon: Clock,
    title: "Outstanding Payments",
    body: "View invoices that are awaiting payment.",
    tone: "var(--status-red)",
  },
  {
    icon: BarChart3,
    title: "Workshop Performance",
    body: "Understand workshop workload and turnaround times.",
    tone: "var(--muted-foreground)",
  },
];

function Reports() {
  return (
    <div>
      <PageHeader
        icon={BarChart3}
        title="Reports"
        subtitle="Insights into your business performance"
        actions={
          <>
            <ToolButton>
              <CalendarDays className="size-4 text-gold" /> Last 30 Days
            </ToolButton>
            <ToolButton primary>
              <Download className="size-4" /> Export
            </ToolButton>
          </>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <article
            key={c.title}
            className="glass group flex flex-col rounded-2xl p-6 transition-transform hover:-translate-y-1"
          >
            <span
              className="grid size-14 place-items-center rounded-full"
              style={{
                background: `color-mix(in oklab, ${c.tone} 22%, transparent)`,
              }}
            >
              <c.icon className="size-6" style={{ color: c.tone }} />
            </span>
            <h2 className="mt-5 font-display text-2xl">{c.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{c.body}</p>
            <button className="glass mt-6 grid size-10 place-items-center self-end rounded-lg">
              <ArrowRight className="size-4 text-gold" />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
