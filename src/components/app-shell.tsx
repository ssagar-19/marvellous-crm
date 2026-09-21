import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GlobalSearch } from "@/components/global-search";
import { supabase } from "@/integrations/supabase/client";
import { roleLabels } from "@/lib/auth.functions";
import { myAccessQuery } from "@/lib/auth-queries";
import marvellousLogo from "@/assets/marvellous-logo-mark.png";

import {
  Home,
  ClipboardList,
  PlusCircle,
  Wrench,
  BarChart3,
  Mail,
  Settings as SettingsIcon,
  LogOut,
  AlertTriangle,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const nav: { label: string; to: string; icon: LucideIcon; badge?: number }[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "New Job", to: "/new-job", icon: PlusCircle },
  { label: "Jobs", to: "/jobs", icon: ClipboardList },
  { label: "Workshop", to: "/workshop", icon: Wrench },
  { label: "Reports", to: "/reports", icon: BarChart3 },
  { label: "Enquiries", to: "/enquiries", icon: Mail, badge: 2 },
  { label: "Settings", to: "/settings", icon: SettingsIcon },
];

export function Logo() {
  return (
    <div className="flex items-center justify-center">
      <img
        src={marvellousLogo}
        alt="Marvellous Jewellers"
        className="size-11 object-contain"
      />
    </div>
  );
}

function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={
        "hidden shrink-0 flex-col justify-between bg-[var(--sidebar)] px-3 py-6 shadow-[1px_0_0_0_oklch(0.9755_0.0045_258.3/0.05)] backdrop-blur-2xl transition-[width] duration-300 ease-out lg:flex " +
        (expanded ? "w-64" : "w-20")
      }
    >
      <div>
        <div
          className={
            "flex items-center transition-all duration-300 " +
            (expanded ? "justify-start gap-3 px-1" : "justify-center")
          }
        >
          <Logo />

          <span
            className={
              "whitespace-nowrap text-sm font-medium tracking-[0.28em] text-gold transition-all duration-300 " +
              (expanded
                ? "translate-x-0 opacity-100"
                : "pointer-events-none absolute -translate-x-2 opacity-0")
            }
          >
            MARVELLOUS
          </span>
        </div>

        <nav className="mt-8 space-y-2">
          {nav.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                aria-label={item.label}
                className={
                  "relative flex w-full items-center rounded-xl p-3 transition-all duration-300 " +
                  (expanded ? "justify-start gap-4" : "justify-center") +
                  " " +
                  (active
                    ? "glass-gold text-foreground"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground")
                }
              >
                <span className="flex w-8 shrink-0 items-center justify-center">
                  <item.icon
                    className={
                      "size-5 " + (active ? "text-gold" : "text-gold/70")
                    }
                  />
                </span>

                <span
                  className={
                    "whitespace-nowrap text-sm font-medium transition-all duration-200 overflow-hidden " +
                    (expanded
                      ? "max-w-[160px] translate-x-0 opacity-100"
                      : "max-w-0 pointer-events-none -translate-x-2 opacity-0")
                  }
                >
                  {item.label}
                </span>

                {item.badge ? (
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[var(--status-green)] text-[0.65rem] font-semibold text-[var(--navy-deep)]">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <SidebarAccount />
    </aside>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function SidebarAccount() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery(myAccessQuery);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const name =
    data?.fullName || data?.email || (isPending ? "Loading…" : "Signed in");
  const role = data?.roles?.[0] ? roleLabels[data.roles[0]] : "Staff";

  return (
    <div className="glass-tile rounded-2xl p-2">
      <div className="flex justify-center">
        <div className="grid size-9 place-items-center rounded-full border border-gold/30 text-xs font-semibold text-gold">
          {data ? initials(data.fullName || data.email || "MJ") : "MJ"}
        </div>
      </div>

      <button
        onClick={handleSignOut}
        title="Log out"
        aria-label="Log out"
        className="mt-3 flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <LogOut className="size-[18px] text-gold/80" />
      </button>
    </div>
  );
}

function TopBar() {
  const [time, setTime] = useState(() =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date())
  );

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Europe/London",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(new Date())
      );
    };

    const interval = window.setInterval(updateTime, 30000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center gap-4 px-4 pt-5 lg:px-8">
      <GlobalSearch />

      <div className="ml-auto hidden items-center sm:flex">
        <div className="display-figure flex items-baseline gap-2 text-4xl tracking-wide text-foreground">
          <span>{time.split(" ")[0]}</span>
          <span className="text-xl tracking-widest text-gold/90">
            {time.split(" ")[1]?.toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-bg flex min-h-screen w-full">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />

        <main className="flex-1 px-4 pb-10 pt-6 lg:px-8">{children}</main>

        <footer className="hairline-none px-8 pb-5 text-right text-xs text-muted-foreground">
          Marvellous Jewellers &nbsp;|&nbsp; CRM System &nbsp;|&nbsp; v1.0.0
        </footer>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-4">
        {Icon ? (
          <Icon className="size-8 text-gold" strokeWidth={1.5} />
        ) : null}

        <div>
          <h1 className="font-display text-4xl font-medium leading-none tracking-[0.01em] text-foreground">
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="flex flex-wrap gap-3">{actions}</div>
      ) : null}
    </div>
  );
}

export function ToolButton({
  children,
  primary,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  primary?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={
        (primary ? "btn-gold" : "btn-glass") +
        (disabled ? " opacity-60" : "")
      }
    >
      {children}
    </button>
  );
}

export function PanelLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl p-6 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin text-gold" /> {label}
    </div>
  );
}

export function PanelEmpty({ label }: { label: string }) {
  return (
    <div className="glass rounded-2xl p-6 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

export function PanelError({
  title = "Something went wrong",
  message,
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="glass rounded-2xl p-6" role="alert">
      <div className="flex items-center gap-3">
        <AlertTriangle className="size-5 text-destructive" />
        <h2 className="font-display text-xl">{title}</h2>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        {message || "Please try again in a moment."}
      </p>
    </div>
  );
}