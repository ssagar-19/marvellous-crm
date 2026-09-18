import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, User, Wrench } from "lucide-react";
import { globalSearch } from "@/lib/crm.functions";
import { locationLabels, statusLabels, statusTone, toneColor } from "@/lib/crm-domain";

export function GlobalSearch() {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 250);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const enabled = debounced.length >= 2;
  const { data, isFetching, isError } = useQuery({
    queryKey: ["global-search", debounced],
    queryFn: () => globalSearch({ data: { term: debounced } }),
    enabled,
  });

  const clients = data?.clients ?? [];
  const jobs = data?.jobs ?? [];
  const showPanel = open && enabled;

  return (
    <div ref={boxRef} className="relative flex-1">
      <label className="glass flex h-12 items-center gap-3 rounded-2xl px-4">
        <Search className="size-[18px] text-gold" />
        <input
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          placeholder="Search by name, number, postcode or job reference..."
        />
        {isFetching && enabled ? (
          <Loader2 className="size-4 animate-spin text-gold" />
        ) : (
          <span className="hidden rounded-md bg-foreground/5 px-2 py-0.5 text-xs text-muted-foreground sm:inline">
            ⌘ K
          </span>
        )}
      </label>

      {showPanel ? (
        <div className="glass absolute left-0 right-0 top-14 z-50 max-h-[70vh] overflow-y-auto rounded-2xl p-2 shadow-2xl">
          {isError ? (
            <p className="px-3 py-4 text-sm text-destructive">Search is unavailable right now.</p>
          ) : isFetching && !data ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">Searching…</p>
          ) : clients.length === 0 && jobs.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              No clients or jobs match “{debounced}”.
            </p>
          ) : (
            <>
              {jobs.length > 0 ? (
                <div className="p-1">
                  <div className="meta-label px-2 py-1 text-[10px] uppercase text-muted-foreground">
                    Jobs
                  </div>
                  {jobs.map((j) => (
                    <Link
                      key={j.reference}
                      to="/jobs/$ref"
                      params={{ ref: j.reference }}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-accent/40"
                    >
                      <Wrench className="size-4 shrink-0 text-gold" />
                      <span className="min-w-0">
                        <b className="block font-medium">
                          {j.reference} · {j.title}
                        </b>
                        <span className="text-xs text-muted-foreground">
                          {j.client} ·{" "}
                          {locationLabels[j.location as keyof typeof locationLabels] ?? j.location}
                        </span>
                      </span>
                      <span
                        className="ml-auto shrink-0 rounded px-2 py-1 text-[10px]"
                        style={{
                          color: toneColor[statusTone[j.status]],
                          background: `color-mix(in oklab, ${toneColor[statusTone[j.status]]} 18%, transparent)`,
                        }}
                      >
                        {statusLabels[j.status]}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}

              {clients.length > 0 ? (
                <div className="p-1">
                  <div className="meta-label px-2 py-1 text-[10px] uppercase text-muted-foreground">
                    Clients
                  </div>
                  {clients.map((c) => (
                    <Link
                      key={c.id}
                      to="/clients/$id"
                      params={{ id: c.id }}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-accent/40"
                    >
                      <User className="size-4 shrink-0 text-gold" />
                      <span className="min-w-0">
                        <b className="block font-medium">{c.name}</b>
                        <span className="text-xs text-muted-foreground">
                          {c.phone}
                          {c.postcode ? ` · ${c.postcode}` : ""}
                        </span>
                      </span>
                      <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                        Client
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
