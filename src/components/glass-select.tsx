import { useState } from "react";
import { motion } from "motion/react";

type GlassSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
};

export function GlassSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
}: GlassSelectProps) {
  const [open, setOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const selected = options.find((option) => option.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-gold/50 bg-black/10 px-4 py-3 text-sm outline-none transition-colors hover:border-gold focus:border-gold"
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground"}>
          {selected?.label ?? placeholder}
        </span>

        <span
          className={
            "text-gold transition-transform duration-200 " +
            (open ? "rotate-180" : "")
          }
        >
          ▾
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-[60] mt-2 w-full overflow-hidden rounded-xl border border-gold/40 bg-[var(--sidebar)] p-1 shadow-xl backdrop-blur-xl">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange(option.value);
                  setOpen(false);
                }}
                onMouseEnter={() => setHoveredOption(option.value)}
                onMouseLeave={() => setHoveredOption(null)}
                className={
                  "relative flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors " +
                  (value === option.value
                    ? "text-gold"
                    : "text-foreground")
                }
              >
                {hoveredOption === option.value ? (
                  <motion.div
                    layoutId="glass-select-hover"
                    className="pointer-events-none absolute inset-0 rounded-lg border border-white/15 bg-white/[0.09] shadow-[0_8px_30px_oklch(0.95_0.02_245/0.08)] backdrop-blur-xl"
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-10">{option.label}</span>
                {value === option.value ? (
                  <span className="relative z-10 text-gold">✓</span>
                ) : null}
              </button>
            ))}
          </div>
      ) : null}
    </div>
  );
}
