import { useState } from "react";

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
        <>
          <button
            type="button"
            aria-label="Close dropdown"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-gold/40 bg-[var(--sidebar)] p-1 shadow-xl backdrop-blur-xl">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors " +
                  (value === option.value
                    ? "bg-gold/15 text-gold"
                    : "text-foreground hover:bg-white/5")
                }
              >
                <span>{option.label}</span>
                {value === option.value ? (
                  <span className="text-gold">✓</span>
                ) : null}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
