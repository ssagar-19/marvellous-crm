export const BESPOKE_STAGES = [
  "Enquiry",
  "Research",
  "Design",
  "Approval",
  "Workshop",
  "Completed",
] as const;

export type BespokeStage = (typeof BESPOKE_STAGES)[number];

export function BespokeProgress({
  status,
  onChange,
}: {
  status: BespokeStage;
  onChange: (status: BespokeStage) => void;
}) {
  return (
    <section className="glass mb-5 rounded-2xl px-5 pt-3 pb-2" aria-label="Project status">
      <div className="flex w-full items-start">
        {BESPOKE_STAGES.map((stage, index) => {
          const current = status === stage;
          const reached = BESPOKE_STAGES.indexOf(status) > index;
          return (
            <button
              key={stage}
              type="button"
              onClick={() => onChange(stage)}
              aria-current={current ? "step" : undefined}
              aria-label={`Set status to ${stage}`}
              className="relative flex min-w-0 flex-1 flex-col items-center gap-1 text-center"
            >
              {index < BESPOKE_STAGES.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[calc(50%+16px)] right-[calc(-50%+16px)] top-4 h-px ${reached ? "bg-gold/65" : "bg-gold/20"}`}
                />
              )}
              <span
                className={`relative z-10 grid size-8 place-items-center rounded-full border text-xs transition-colors ${
                  current
                    ? "border-gold/75 bg-gold/15 text-gold"
                    : reached
                      ? "border-gold/55 bg-gold/10 text-gold"
                      : "border-white/10 bg-white/[0.05] text-muted-foreground"
                }`}
              >
                {reached ? "✓" : index + 1}
              </span>
              <span
                className={`text-[11px] ${current ? "text-foreground" : "text-muted-foreground"}`}
              >
                {stage}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
