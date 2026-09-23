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

  return (
    <aside
      className="hidden fixed left-5 top-1/2 z-50 -translate-y-1/2 flex-col items-center rounded-2xl border border-white/15 bg-white/[0.045] px-2.5 py-3 shadow-[0_20px_60px_oklch(0.02_0.02_245/0.28)] backdrop-blur-xl lg:flex"
    >
      <nav className="flex flex-col items-center gap-2">
        {nav.map((item) => {
          const active =
            item.to === "/"
              ? pathname === "/"
              : pathname.startsWith(item.to);

          return (
            <div key={item.to} className="relative size-11">
              <Link
                to={item.to}
                aria-label={item.label}
                className={
                  "group absolute inset-0 flex size-11 items-center justify-center rounded-xl border transition-[background-color,border-color,box-shadow] duration-150 " +
                  (active
                    ? "border-gold/30 bg-gold/10 text-foreground shadow-[0_8px_24px_oklch(0.75_0.12_85/0.08)]"
                    : "border-transparent bg-transparent text-muted-foreground hover:border-white/12 hover:bg-white/[0.07]")
                }
              >
                <item.icon
                  className={
                    "size-5 transition-transform duration-150 group-hover:scale-105 " +
                    (active ? "text-gold" : "text-gold/70")
                  }
                />

                <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-lg border border-white/15 bg-[oklch(0.10_0.03_245/0.82)] px-3 py-1.5 text-sm font-medium text-foreground opacity-0 shadow-[0_10px_25px_oklch(0.02_0.02_245/0.3)] backdrop-blur-xl transition-[opacity,transform] duration-150 group-hover:translate-x-0 group-hover:opacity-100">
                  {item.label}
                </span>

                {item.badge ? (
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[var(--status-green)] text-[0.65rem] font-semibold text-[var(--navy-deep)]">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="mt-3 border-t border-white/10 pt-3">
        <SidebarAccount />
      </div>
    </aside>
  );
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
          {data ? (data.fullName || data.email || "MJ").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "MJ"}
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
    <div className="app-bg relative flex min-h-screen w-full">
      <div className="absolute left-5 top-5 z-50 [&_img]:size-16">
        <Logo />
      </div>

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-20">
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