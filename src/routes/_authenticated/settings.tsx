import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  Users,
  Link2,
  Wrench,
  Tag,
  Package,
  Bell,
  QrCode,
  Puzzle,
  ShieldCheck,
  Save,
} from "lucide-react";
import { StaffAccessPanel } from "@/components/staff-access-panel";


export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Marvellous Jewellers CRM" },
      {
        name: "description",
        content:
          "Manage business details, staff access, job settings, notifications and integrations.",
      },
      { property: "og:title", content: "Settings" },
      {
        property: "og:description",
        content: "Manage your business and system preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});

const tabs = [
  { label: "Business", icon: Building2 },
  { label: "Staff & Access", icon: Users },
  { label: "Referral Codes", icon: Link2 },
  { label: "Job Settings", icon: Wrench },
  { label: "Service Options", icon: Tag },
  { label: "Item Categories", icon: Package },
  { label: "Notifications", icon: Bell },
  { label: "Barcode / QR", icon: QrCode },
  { label: "Integrations", icon: Puzzle },
  { label: "Security", icon: ShieldCheck },
];

const field =
  "h-11 w-full rounded-xl border border-border bg-[var(--navy-deep)]/50 px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-gold/60";

function Settings() {
  const [active, setActive] = useState("Business");

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center gap-4">
        <SettingsIcon className="size-8 text-gold" />
        <div>
          <h1 className="font-display text-3xl leading-none">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your business and system preferences.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[16rem_1fr]">
        <nav className="glass space-y-1 rounded-2xl p-3">
          {tabs.map((t) => (
            <button
              key={t.label}
              onClick={() => setActive(t.label)}
              className={
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors " +
                (active === t.label
                  ? "glass-gold text-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              <t.icon className="size-[18px] text-gold/80" />
              {t.label}
            </button>
          ))}
        </nav>

        {active === "Staff & Access" || active === "Referral Codes" ? (
          <StaffAccessPanel tab={active} />
        ) : (
        <section className="glass rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <Building2 className="size-8 text-gold" />
            <div>
              <h2 className="font-display text-2xl leading-none">
                {active === "Business" ? "Business Settings" : active}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage your business details and contact information.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                Business Name
              </span>
              <input className={field} defaultValue="Marvellous Jewellers" />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                Address Line 1
              </span>
              <input className={field} defaultValue="42 Goldsmith's Row" />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                Address Line 2
              </span>
              <input className={field} placeholder="Optional" />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["City", "Edinburgh"],
                ["Postcode", "EH1 1AA"],
                ["Phone", "+44 131 555 0100"],
                ["Email", "hello@marvellous-jewellers.co.uk"],
              ].map(([label, value]) => (
                <label key={label} className="block text-sm">
                  <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                    {label}
                  </span>
                  <input className={field} defaultValue={value} />
                </label>
              ))}
            </div>
            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                VAT Number
              </span>
              <input className={field} defaultValue="GB 123 456 789" />
            </label>

            <div className="flex justify-end pt-2">
              <button className="glass-gold flex items-center gap-2 rounded-xl px-5 py-3 text-sm text-gold">
                <Save className="size-4" /> Save Changes
              </button>
            </div>
          </div>
        </section>
        )}

      </div>
    </div>
  );
}
