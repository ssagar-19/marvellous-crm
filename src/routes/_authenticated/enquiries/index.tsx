import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { outlook } from "@/lib/crm-data";

export const Route = createFileRoute("/_authenticated/enquiries/")({
  head: () => ({
    meta: [
      { title: "Enquiries | Marvellous Jewellers CRM" },
      {
        name: "description",
        content:
          "Customer enquiries, repair approvals and collection updates for the workshop team.",
      },
      { property: "og:title", content: "Enquiries" },
      {
        property: "og:description",
        content: "Customer enquiries and workshop updates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Enquiries,
});

function Enquiries() {
  return (
    <div>
      <PageHeader
        icon={MessageSquare}
        title="Enquiries"
        subtitle="Customer enquiries and internal workshop notes"
      />

      <div className="glass divide-y divide-border/50 rounded-2xl">
        {outlook.map((m) => (
          <Link
            key={m.title}
            to="/enquiries/$id"
            params={{ id: m.title }}
            className="flex gap-4 p-5 transition-colors hover:bg-white/5"
          >
            <span className="mt-2 size-2.5 rounded-full bg-gold" />

            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-4">
                <div className="font-semibold">{m.title}</div>
                <div className="text-xs text-muted-foreground">{m.when}</div>
              </div>

              <div className="text-sm text-muted-foreground">{m.who}</div>

              <p className="mt-1 text-sm text-muted-foreground">{m.body}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}