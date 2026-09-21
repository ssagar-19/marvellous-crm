import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  Loader2,
} from "lucide-react";
import { StaffAccessPanel } from "@/components/staff-access-panel";
import { supabase } from "@/integrations/supabase/client";

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

type BusinessSettings = {
  id?: number;
  business_name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  postcode: string;
  phone: string;
  email: string;
  website: string;
  vat_number: string;
  logo_url: string;
};

const emptyBusinessSettings: BusinessSettings = {
  business_name: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  postcode: "",
  phone: "",
  email: "",
  website: "",
  vat_number: "",
  logo_url: "",
};

function Settings() {
  const [active, setActive] = useState("Business");
  const [business, setBusiness] =
    useState<BusinessSettings>(emptyBusinessSettings);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBusinessSettings() {
      setLoadingBusiness(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from("marvellous_business_settings")
        .select(
          "id, business_name, address_line_1, address_line_2, city, postcode, phone, email, website, vat_number, logo_url",
        )
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setErrorMessage(error.message);
        setLoadingBusiness(false);
        return;
      }

      if (data) {
        setBusiness({
          id: data.id,
          business_name: data.business_name ?? "",
          address_line_1: data.address_line_1 ?? "",
          address_line_2: data.address_line_2 ?? "",
          city: data.city ?? "",
          postcode: data.postcode ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
          website: data.website ?? "",
          vat_number: data.vat_number ?? "",
          logo_url: data.logo_url ?? "",
        });
      }

      setLoadingBusiness(false);
    }

    loadBusinessSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateBusiness = (
    key: keyof BusinessSettings,
    value: string,
  ) => {
    setBusiness((current) => ({
      ...current,
      [key]: value,
    }));

    setSaveMessage(null);
    setErrorMessage(null);
  };

  const saveBusinessSettings = async () => {
    setSavingBusiness(true);
    setSaveMessage(null);
    setErrorMessage(null);

    const payload = {
      business_name: business.business_name.trim(),
      address_line_1: business.address_line_1.trim(),
      address_line_2: business.address_line_2.trim() || null,
      city: business.city.trim(),
      postcode: business.postcode.trim(),
      phone: business.phone.trim(),
      email: business.email.trim(),
      website: business.website.trim() || null,
      vat_number: business.vat_number.trim() || null,
      logo_url: business.logo_url.trim() || null,
    };

    const query = business.id
      ? supabase
          .from("marvellous_business_settings")
          .update(payload)
          .eq("id", business.id)
          .select()
          .single()
      : supabase
          .from("marvellous_business_settings")
          .insert(payload)
          .select()
          .single();

    const { data, error } = await query;

    if (error) {
      setErrorMessage(error.message);
      setSavingBusiness(false);
      return;
    }

    if (data) {
      setBusiness({
        id: data.id,
        business_name: data.business_name ?? "",
        address_line_1: data.address_line_1 ?? "",
        address_line_2: data.address_line_2 ?? "",
        city: data.city ?? "",
        postcode: data.postcode ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        website: data.website ?? "",
        vat_number: data.vat_number ?? "",
        logo_url: data.logo_url ?? "",
      });
    }

    setSaveMessage("Business details saved.");
    setSavingBusiness(false);
  };

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center gap-4">
        <SettingsIcon className="size-8 text-gold" />

        <div>
          <h1 className="font-display text-3xl leading-none">
            Settings
          </h1>

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
              type="button"
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
                  {active === "Business"
                    ? "Business Settings"
                    : active}
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Manage your business details and contact information.
                </p>
              </div>
            </div>

            {active === "Business" ? (
              loadingBusiness ? (
                <div className="mt-8 flex items-center justify-center py-12 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 size-4 animate-spin text-gold" />
                  Loading business details...
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <label className="block text-sm">
                    <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                      Business Name
                    </span>

                    <input
                      className={field}
                      value={business.business_name}
                      onChange={(e) =>
                        updateBusiness(
                          "business_name",
                          e.target.value,
                        )
                      }
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                      Address Line 1
                    </span>

                    <input
                      className={field}
                      value={business.address_line_1}
                      onChange={(e) =>
                        updateBusiness(
                          "address_line_1",
                          e.target.value,
                        )
                      }
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                      Address Line 2
                    </span>

                    <input
                      className={field}
                      placeholder="Optional"
                      value={business.address_line_2}
                      onChange={(e) =>
                        updateBusiness(
                          "address_line_2",
                          e.target.value,
                        )
                      }
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    {(
                      [
                        ["city", "City"],
                        ["postcode", "Postcode"],
                        ["phone", "Phone"],
                        ["email", "Email"],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className="block text-sm">
                        <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                          {label}
                        </span>

                        <input
                          className={field}
                          value={business[key]}
                          onChange={(e) =>
                            updateBusiness(key, e.target.value)
                          }
                        />
                      </label>
                    ))}
                  </div>

                  <label className="block text-sm">
                    <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                      Website
                    </span>

                    <input
                      className={field}
                      placeholder="Optional"
                      value={business.website}
                      onChange={(e) =>
                        updateBusiness("website", e.target.value)
                      }
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                      VAT Number
                    </span>

                    <input
                      className={field}
                      placeholder="Optional"
                      value={business.vat_number}
                      onChange={(e) =>
                        updateBusiness(
                          "vat_number",
                          e.target.value,
                        )
                      }
                    />
                  </label>

                  <div className="flex items-center justify-between gap-4 pt-2">
                    <div className="text-sm">
                      {errorMessage && (
                        <span className="text-red-400">
                          {errorMessage}
                        </span>
                      )}

                      {saveMessage && (
                        <span className="text-gold">
                          {saveMessage}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={saveBusinessSettings}
                      disabled={savingBusiness}
                      className="glass-gold flex items-center gap-2 rounded-xl px-5 py-3 text-sm text-gold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingBusiness ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}

                      {savingBusiness
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="mt-8 rounded-xl border border-white/10 p-5 text-sm text-muted-foreground">
                This settings section is not connected yet.
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}