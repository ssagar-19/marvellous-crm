import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Filter, ArrowUpDown, Plus, Users, ChevronRight } from "lucide-react";
import { PageHeader, ToolButton, PanelError, PanelLoading } from "@/components/app-shell";
import { clientsQuery, jobsQuery } from "@/lib/crm-queries";
import { CLOSED_STATUSES, formatDate, money, type JobDTO, type JobStatus } from "@/lib/crm-domain";
import type { ClientWithJobs } from "@/lib/crm.functions";

export const Route = createFileRoute("/_authenticated/clients/")({
  head: () => ({
    meta: [
      { title: "Clients | Marvellous Jewellers CRM" },
      {
        name: "description",
        content:
          "Manage recent visitors, items in exchange, expected items and unpaid invoices in one place.",
      },
      { property: "og:title", content: "Clients" },
      { property: "og:description", content: "Manage and track all client activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(clientsQuery),
      context.queryClient.ensureQueryData(jobsQuery),
    ]);
  },
  pendingComponent: () => <PanelLoading label="Loading clients…" />,
  errorComponent: ({ error }) => <PanelError message={error.message} />,
  notFoundComponent: () => <PanelError message="No clients found." />,
  component: Clients,
});

const WORKSHOP_STATUSES: JobStatus[] = [
  "IN_PROGRESS",
  "WAITING_FOR_PARTS",
  "RETURNED_TO_WORKSHOP",
  "AWAITING_QC",
  "INSPECTION",
];
const AWAITING_STATUSES: JobStatus[] = ["NEW", "AWAITING_WORKSHOP"];

type Row = { id: string; cells: string[] };

function Group({
  title,
  color,
  blurb,
  columns,
  rows,
  emptyLabel,
}: {
  title: string;
  color: string;
  blurb: string;
  columns: string[];
  rows: Row[];
  emptyLabel: string;
}) {
  return (
    <section className="glass-gold min-w-0 rounded-xl p-5">
      <div className="flex items-center gap-3">
        <span
          className="size-5 rounded-full shadow-[0_0_16px_currentColor]"
          style={{ background: color }}
        />
        <h2 className="font-display text-2xl">{title}</h2>
        <span className="rounded-full bg-accent/60 px-2 py-0.5 text-xs">{rows.length}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{blurb}</p>

      <div className="mt-4 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <table className="w-full min-w-[510px] table-fixed text-sm">
            <colgroup>
              <col className="w-[26%]" />
              <col className="w-[25%]" />
              <col className="w-[22%]" />
              <col className="w-[23%]" />
              <col className="w-[4%]" />
            </colgroup>
            <thead>
              <tr className="text-left text-[10px] uppercase text-muted-foreground">
                {columns.map((c) => (
                  <th key={c} className="pb-2 font-normal">
                    {c}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 6).map((row) => (
                <tr key={row.id} className="border-t border-border/50">
                  {row.cells.map((cell, i) => (
                    <td
                      key={i}
                      className={"py-3 " + (i === 0 ? "font-medium" : "text-muted-foreground")}
                    >
                      {i === 0 ? (
                        <Link to="/clients/$id" params={{ id: row.id }} className="hover:text-gold">
                          {cell}
                        </Link>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                  <td className="py-2.5 text-right">
                    <Link to="/clients/$id" params={{ id: row.id }}>
                      <ChevronRight className="ml-auto size-4 text-gold/70" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function Clients() {
  const { data: clients } = useSuspenseQuery(clientsQuery);
  const { data: jobs } = useSuspenseQuery(jobsQuery);

  const byClient = new Map<string, JobDTO[]>();
  for (const job of jobs) {
    const list = byClient.get(job.clientId) ?? [];
    list.push(job);
    byClient.set(job.clientId, list);
  }

  const base = (c: ClientWithJobs) => [c.fullName, c.phone, c.postcode ?? "—"];

  const weekAgo = Date.now() - 7 * 86_400_000;
  const recents: Row[] = clients
    .filter((c) => c.lastJobAt && new Date(c.lastJobAt).getTime() >= weekAgo)
    .sort((a, b) => (b.lastJobAt ?? "").localeCompare(a.lastJobAt ?? ""))
    .map((c) => ({ id: c.id, cells: [...base(c), formatDate(c.lastJobAt)] }));

  const inExchange: Row[] = clients
    .filter((c) => (byClient.get(c.id) ?? []).some((j) => WORKSHOP_STATUSES.includes(j.status)))
    .map((c) => {
      const job = (byClient.get(c.id) ?? []).find((j) => WORKSHOP_STATUSES.includes(j.status))!;
      return { id: c.id, cells: [...base(c), formatDate(job.createdAt)] };
    });

  const awaiting: Row[] = clients
    .filter((c) => (byClient.get(c.id) ?? []).some((j) => AWAITING_STATUSES.includes(j.status)))
    .map((c) => {
      const job = (byClient.get(c.id) ?? []).find((j) => AWAITING_STATUSES.includes(j.status))!;
      return { id: c.id, cells: [...base(c), formatDate(job.promisedDate)] };
    });

  const invoiced: Row[] = clients
    .map((c) => {
      const open = (byClient.get(c.id) ?? []).filter((j) => !CLOSED_STATUSES.includes(j.status));
      const outstanding = open.reduce(
        (sum, j) => sum + Math.max((j.quotedPrice ?? 0) - (j.depositAmount ?? 0), 0),
        0,
      );
      return { id: c.id, cells: [...base(c), money(outstanding)], outstanding };
    })
    .filter((r) => r.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding)
    .map(({ id, cells }) => ({ id, cells }));

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        icon={Users}
        title="Clients"
        subtitle="Manage and track all client activity"
        actions={
          <>
            <ToolButton>
              <Filter className="size-4 text-gold" /> Filter
            </ToolButton>
            <ToolButton>
              <ArrowUpDown className="size-4 text-gold" /> Sort: Name
            </ToolButton>
            <Link to="/new-job">
              <ToolButton primary>
                <Plus className="size-4" /> Add Client
              </ToolButton>
            </Link>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <Group
          title="Recents"
          color="var(--status-blue)"
          blurb="Clients in store in the last 7 days"
          columns={["Name", "Phone", "Postcode", "Last Visit"]}
          rows={recents}
          emptyLabel="No client visits in the last 7 days."
        />
        <Group
          title="In Exchange"
          color="var(--status-green)"
          blurb="Clients with items currently in exchange"
          columns={["Name", "Phone", "Postcode", "Exchange Date"]}
          rows={inExchange}
          emptyLabel="No items currently in the workshop."
        />
        <Group
          title="Awaiting Item"
          color="var(--status-violet)"
          blurb="Clients expected to bring in an item"
          columns={["Name", "Phone", "Postcode", "Expected Date"]}
          rows={awaiting}
          emptyLabel="No items expected in."
        />
        <Group
          title="Invoiced / Awaiting Payment"
          color="var(--status-amber)"
          blurb="Clients with unpaid balances"
          columns={["Name", "Phone", "Postcode", "Amount"]}
          rows={invoiced}
          emptyLabel="No outstanding balances."
        />
      </div>
    </div>
  );
}
