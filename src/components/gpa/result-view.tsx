import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, RotateCcw, TrendingUp } from "lucide-react";
import type { SgpaSummary } from "@/lib/gpa";
import { GRADES, performanceLabel, computeCgpa } from "@/lib/gpa";
import confetti from "canvas-confetti";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function AnimatedNumber({ value, decimals = 2 }: { value: number; decimals?: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => v.toFixed(decimals));
  useEffect(() => {
    const c = animate(mv, value, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
    return c.stop;
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}

function Ring({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const size = 220;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="drop-shadow-xl">
      <defs>
        <linearGradient id="ring-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.7 0.22 275)" />
          <stop offset="100%" stopColor="oklch(0.72 0.2 320)" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(0.7 0.02 265 / 0.15)" strokeWidth={stroke} fill="none" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        stroke="url(#ring-g)" strokeWidth={stroke} fill="none" strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - pct) }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

export function ResultView({
  summary, semester, group, onReset,
}: { summary: SgpaSummary; semester: 1 | 2; group: "A" | "B"; onReset: () => void }) {
  const perf = performanceLabel(summary.sgpa);
  const [prevSgpa, setPrevSgpa] = useState<string>("");
  const prevCredits = group === "A" ? 20 : 18;

  useEffect(() => {
    if (summary.allPassed && summary.sgpa >= 9) {
      const end = Date.now() + 800;
      const frame = () => {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#8b5cf6", "#ec4899", "#06b6d4"] });
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#8b5cf6", "#ec4899", "#06b6d4"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [summary.sgpa, summary.allPassed]);

  const gradeCounts = GRADES.map((g) => ({
    g,
    n: summary.results.filter((r) => r.grade === g).length,
  }));

  const cgpa = prevSgpa && !isNaN(+prevSgpa)
    ? computeCgpa(+prevSgpa, prevCredits, summary.sgpa, summary.totalCredits)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-4xl space-y-6"
    >
      {/* Hero SGPA card */}
      <div className="glass relative overflow-hidden rounded-[2rem] p-8 sm:p-12">
        <div className={`absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br ${perf.tone} opacity-30 blur-3xl`} />

        {!summary.allPassed && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="text-sm">
              <div className="font-semibold text-destructive">SGPA not generated</div>
              <div className="mt-1 text-muted-foreground">
                One or more subjects didn't meet MJCET passing rules. Review the failing subjects below.
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 sm:grid-cols-2 sm:items-center">
          <div className="relative grid place-items-center">
            <Ring value={summary.allPassed ? summary.sgpa : 0} />
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Predicted SGPA
                </div>
                <div className="mt-1 font-display text-6xl leading-none text-brand">
                  {summary.allPassed ? <AnimatedNumber value={summary.sgpa} /> : "—"}
                </div>
                <div className={`mt-2 inline-flex rounded-full bg-gradient-to-r ${perf.tone} px-3 py-1 text-xs font-semibold text-white`}>
                  {summary.allPassed ? perf.label : "Attempt again"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Total Credits" value={summary.totalCredits} />
            <Stat label="Earned Credits" value={summary.earnedCredits} />
            <Stat label="Subjects Passed" value={summary.passedCount} tone="text-emerald-600 dark:text-emerald-400" />
            <Stat label="Subjects Failed" value={summary.failedCount} tone={summary.failedCount ? "text-destructive" : ""} />
          </div>
        </div>
      </div>

      {/* CGPA calculator for Sem 2 */}
      {semester === 2 && summary.allPassed && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Estimate overall CGPA</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Enter your Semester 1 SGPA to see your combined CGPA. (Sem 1 credits: {prevCredits} for Group {group})</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:items-end">
            <div>
              <Label htmlFor="prev-sgpa">Sem 1 SGPA</Label>
              <Input id="prev-sgpa" inputMode="decimal" placeholder="e.g. 8.75" value={prevSgpa} onChange={(e) => setPrevSgpa(e.target.value)} />
            </div>
            <div className="rounded-2xl brand-gradient p-4 text-white">
              <div className="text-xs uppercase tracking-wider opacity-80">Estimated CGPA</div>
              <div className="mt-1 text-3xl font-bold">{cgpa != null ? cgpa.toFixed(2) : "—"}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grade distribution */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg font-semibold">Grade distribution</h3>
        <div className="mt-4 grid grid-cols-7 gap-2">
          {gradeCounts.map(({ g, n }) => {
            const max = Math.max(1, ...gradeCounts.map((x) => x.n));
            const h = 24 + (n / max) * 100;
            return (
              <div key={g} className="flex flex-col items-center gap-2">
                <div className="flex h-32 w-full items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}px` }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className={`w-full rounded-t-lg ${
                      g === "F" ? "bg-gradient-to-t from-rose-500 to-rose-400" : "brand-gradient"
                    }`}
                  />
                </div>
                <div className="text-sm font-semibold">{g}</div>
                <div className="text-xs text-muted-foreground">{n}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per subject */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg font-semibold">Subject breakdown</h3>
        <div className="mt-4 space-y-2">
          {summary.results.map((r, i) => {
            const maxContribution = Math.max(1, ...summary.results.map((x) => x.contribution || 1));
            const w = (r.contribution / maxContribution) * 100;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-border/60 bg-background/40 p-4"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate font-medium">{r.subject.name}</div>
                      {r.passed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {r.subject.credits} credit{r.subject.credits !== 1 ? "s" : ""}
                      {r.subject.credits === 0 && " · Non-credit"}
                      {" · "}{Math.round(r.percent)}%
                      {r.failReason && <span className="text-destructive"> · {r.failReason}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`grid h-9 w-9 place-items-center rounded-xl text-sm font-bold text-white ${
                      r.grade === "F" ? "bg-gradient-to-br from-rose-500 to-rose-600" : "brand-gradient"
                    }`}>
                      {r.grade}
                    </div>
                    <div className="w-20 text-right text-sm tabular-nums">
                      <div className="font-semibold">{r.gradePoint}×{r.subject.credits}</div>
                      <div className="text-xs text-muted-foreground">= {r.contribution}</div>
                    </div>
                  </div>
                </div>
                {r.subject.credits > 0 && (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${w}%` }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.03 }}
                      className={`h-full ${r.grade === "F" ? "bg-rose-500" : "brand-gradient"}`}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={onReset}
          className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition hover:scale-[1.02]"
        >
          <RotateCcw className="h-4 w-4" /> Estimate again
        </button>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, tone = "" }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-3xl font-bold tabular-nums ${tone}`}>{value}</div>
    </div>
  );
}
