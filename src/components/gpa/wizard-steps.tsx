import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

export function StepShell({
  title, subtitle, children, footer,
}: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="glass mx-auto w-full max-w-3xl rounded-[2rem] p-8 sm:p-10"
    >
      <h2 className="font-display text-4xl sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      <div className="mt-8">{children}</div>
      {footer && <div className="mt-8 flex items-center justify-between gap-3">{footer}</div>}
    </motion.div>
  );
}

export function ChoiceCard({
  label, description, active, onClick,
}: { label: string; description?: string; active?: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={[
        "group relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-all",
        active
          ? "border-transparent bg-gradient-to-br from-primary/15 to-accent/40 shadow-[0_10px_30px_-15px_oklch(0.55_0.22_275_/_0.6)]"
          : "border-border/70 bg-card/40 hover:border-primary/50 hover:bg-card/70",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">{label}</div>
          {description && <div className="mt-1 text-sm text-muted-foreground">{description}</div>}
        </div>
        <div className={[
          "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition",
          active ? "border-transparent brand-gradient text-white" : "border-border",
        ].join(" ")}>
          {active && <Check className="h-3.5 w-3.5" />}
        </div>
      </div>
    </motion.button>
  );
}

export function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="mx-auto flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 28 : 8,
            opacity: i <= current ? 1 : 0.35,
          }}
          transition={{ duration: 0.3 }}
          className={[
            "h-2 rounded-full",
            i <= current ? "brand-gradient" : "bg-muted-foreground/40",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
