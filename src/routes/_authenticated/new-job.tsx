import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, Gem } from "lucide-react";

export const Route = createFileRoute("/_authenticated/new-job")({
  component: NewJobPage,
});

function NewJobPage() {
  return (
    <div className="min-h-full p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">
            Marvellous Jewellers
          </p>

          <h1 className="font-display text-4xl leading-none">
            Create New
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Choose the type of work you want to create.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            to="/new-repair"
            className="glass group rounded-2xl p-8 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-muted">
              <Wrench className="size-6 text-gold" />
            </div>

            <h2 className="font-display text-2xl">
              Repair Job
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Repairs, resizing, polishing, servicing, engraving and other
              standard workshop work.
            </p>

            <div className="mt-8 text-xs font-medium uppercase tracking-wider text-gold">
              Create Repair Job →
            </div>
          </Link>

          <Link to="/new-bespoke" className="glass group block rounded-2xl p-8 transition hover:border-gold/50">
            <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-muted">
              <Gem className="size-6 text-gold" />
            </div>

            <h2 className="font-display text-2xl">
              Bespoke Commission
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Custom jewellery commissions with dedicated quoting, approval,
              design and production stages.
            </p>

            <div className="mt-8 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-gold">
              Open Bespoke Project
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}