import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { outlook } from "@/lib/crm-data";

export const Route = createFileRoute("/_authenticated/outlook")({
  head: () => ({
    meta: [
      { title: "Outlook Inbox | Marvellous Jewellers CRM" },
      {
        name: "description",
        content:
          "Bookings, enquiries, approvals and customer emails synced into the jewellers CRM.",
      },
      { property: "og:title", content: "Outlook Inbox" },
      {
        property: "og:description",
        content: "Bookings, enquiries and customer emails.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Outlook,
});

const filters = ["All (12)", "Unread (4)", "Bookings (6)", "Enquiries (4)", "Approvals (2)"];

function Outlook() {
  return (
    <div>
      <PageHeader
        icon={Mail}
        title="Outlook"
        subtitle="Bookings, enquiries and customer emails"
      />
      <div className="glass rounded-2xl p-5">
        <div className="flex flex-wrap gap-2">
          {filters.map((f, i) => (
            <span
              key={f}
              className={
                "rounded-full px-4 py-1.5 text-xs " +
                (i === 0 ? "glass-gold text-gold" : "glass text-muted-foreground")
              }
            >
              {f}
            </span>
          ))}
        </div>
        <div className="mt-4 divide-y divide-border/50">
          {outlook.map((m) => (
            <div key={m.title} className="flex items-start gap-4 py-4">
              <Mail className="mt-1 size-4 text-gold" />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-4">
                  <div className="font-semibold">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.when}</div>
                </div>
                <div className="text-sm text-muted-foreground">{m.who}</div>
                <p className="mt-1 text-sm text-muted-foreground">{m.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
