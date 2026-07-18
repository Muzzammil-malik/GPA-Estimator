import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, GraduationCap, Sparkles, PencilLine, ListChecks } from "lucide-react";
import { toast } from "sonner";

import { AnimatedBg } from "@/components/animated-bg";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChoiceCard, ProgressDots, StepShell } from "@/components/gpa/wizard-steps";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRANCHES, getSubjects, type Group, type Semester } from "@/data/subjects";
import { computeSgpa, evaluateGrade, evaluateMarks, GRADES, GRADE_POINTS, type Grade, type SubjectResult } from "@/lib/gpa";
import { ResultView } from "@/components/gpa/result-view";

export const Route = createFileRoute("/estimator")({
  head: () => ({
    meta: [
      { title: "GPA Estimator — MJCET" },
      { name: "description", content: "Step-by-step MJCET SGPA estimator using marks or grades." },
    ],
  }),
  component: Estimator,
});

type Mode = "marks" | "grades";
type Step = 0 | 1 | 2 | 3 | 4 | 5; // sem, group, branch, mode, inputs, result
const TOTAL_STEPS = 5;

const STORAGE_KEY = "mjcet-gpa-state";

interface Saved {
  semester?: Semester;
  group?: Group;
  branch?: string;
  mode?: Mode;
}

function Estimator() {
  const [step, setStep] = useState<Step>(0);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [branch, setBranch] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);

  // marks: subjectIdx -> { cie, see }
  const [marks, setMarks] = useState<Record<number, { cie: string; see: string }>>({});
  // grades: subjectIdx -> grade
  const [grades, setGrades] = useState<Record<number, Grade>>({});

  const [summary, setSummary] = useState<ReturnType<typeof computeSgpa> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s: Saved = JSON.parse(raw);
        if (s.semester) setSemester(s.semester);
        if (s.group) setGroup(s.group);
        if (s.branch) setBranch(s.branch);
        if (s.mode) setMode(s.mode);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const s: Saved = {
      semester: semester ?? undefined,
      group: group ?? undefined,
      branch: branch ?? undefined,
      mode: mode ?? undefined,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
  }, [semester, group, branch, mode]);

  const subjects = useMemo(
    () => (semester && group && branch ? getSubjects(semester, group, branch) : []),
    [semester, group, branch]
  );

  const canNext = () => {
    if (step === 0) return semester != null;
    if (step === 1) return group != null;
    if (step === 2) return branch != null;
    if (step === 3) return mode != null;
    if (step === 4) {
      if (mode === "marks") {
        return subjects.every((_, i) => {
          const m = marks[i];
          return m && m.cie !== "" && (subjects[i].seeMax === 0 || m.see !== "");
        });
      }
      return subjects.every((_, i) => !!grades[i]);
    }
    return false;
  };

  const next = () => {
    if (!canNext()) {
      toast.error("Please complete this step first.");
      return;
    }
    if (step === 4) {
      // compute
      const results: SubjectResult[] = subjects.map((s, i) => {
        if (mode === "marks") {
          const m = marks[i];
          const cie = Math.min(Number(m.cie) || 0, s.cieMax);
          const see = s.seeMax === 0 ? 0 : Math.min(Number(m.see) || 0, s.seeMax);
          return evaluateMarks(s, { cie, see });
        }
        return evaluateGrade(s, grades[i]);
      });
      setSummary(computeSgpa(results));
      setStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStep((s) => (Math.min(5, s + 1) as Step));
  };

  const back = () => setStep((s) => (Math.max(0, s - 1) as Step));

  const reset = () => {
    setStep(0);
    setMarks({});
    setGrades({});
    setSummary(null);
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBg />
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl brand-gradient text-white shadow-md">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-tight">MJCET GPA Estimator</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-4 sm:px-6">
        {step < 5 && (
          <div className="mb-8">
            <ProgressDots current={step} total={TOTAL_STEPS} />
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <StepShell
              key="sem"
              title="Which semester?"
              subtitle="Pick the semester you want to estimate."
              footer={<NavFooter onBack={() => {}} onNext={next} showBack={false} canNext={canNext()} />}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <ChoiceCard label="Semester 1" description="First year, first sem" active={semester === 1} onClick={() => setSemester(1)} />
                <ChoiceCard label="Semester 2" description="First year, second sem" active={semester === 2} onClick={() => setSemester(2)} />
              </div>
            </StepShell>
          )}

          {step === 1 && (
            <StepShell
              key="group"
              title="Select your group"
              subtitle="MJCET splits first-year students into two groups."
              footer={<NavFooter onBack={back} onNext={next} canNext={canNext()} />}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <ChoiceCard label="Group A" description="CSA · CSM · CSD · CIV · MECH · ECE" active={group === "A"} onClick={() => { setGroup("A"); setBranch(null); }} />
                <ChoiceCard label="Group B" description="CSE" active={group === "B"} onClick={() => { setGroup("B"); setBranch("CSE"); }} />
              </div>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell
              key="branch"
              title="Choose your branch"
              subtitle="Subjects are tailored per branch."
              footer={<NavFooter onBack={back} onNext={next} canNext={canNext()} />}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                {(group ? BRANCHES[group] : []).map((b) => (
                  <ChoiceCard key={b} label={b} active={branch === b} onClick={() => setBranch(b)} />
                ))}
              </div>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell
              key="mode"
              title="How do you want to estimate?"
              subtitle="Pick the input mode you're most comfortable with."
              footer={<NavFooter onBack={back} onNext={next} canNext={canNext()} />}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <ModeCard
                  active={mode === "marks"}
                  onClick={() => setMode("marks")}
                  icon={<PencilLine className="h-5 w-5" />}
                  title="Marks input"
                  desc="Enter expected CIE + SEE marks per subject. Grades computed automatically."
                />
                <ModeCard
                  active={mode === "grades"}
                  onClick={() => setMode("grades")}
                  icon={<ListChecks className="h-5 w-5" />}
                  title="Grade input"
                  desc="Pick the grade you expect per subject."
                />
              </div>
            </StepShell>
          )}

          {step === 4 && (
            <StepShell
              key="inputs"
              title={mode === "marks" ? "Enter your expected marks" : "Pick expected grades"}
              subtitle={`${subjects.length} subjects · Semester ${semester} · ${branch}`}
              footer={<NavFooter onBack={back} onNext={next} nextLabel="Calculate SGPA" canNext={canNext()} />}
            >
              <div className="space-y-3">
                {subjects.map((s, i) =>
                  mode === "marks" ? (
                    <MarksRow
                      key={i}
                      idx={i}
                      subject={s}
                      value={marks[i] ?? { cie: "", see: "" }}
                      onChange={(v) => setMarks((m) => ({ ...m, [i]: v }))}
                    />
                  ) : (
                    <GradeRow
                      key={i}
                      subject={s}
                      value={grades[i]}
                      onChange={(g) => setGrades((old) => ({ ...old, [i]: g }))}
                    />
                  )
                )}
              </div>
            </StepShell>
          )}

          {step === 5 && summary && semester && group && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultView summary={summary} semester={semester} group={group} onReset={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavFooter({
  onBack, onNext, canNext, showBack = true, nextLabel = "Continue",
}: { onBack: () => void; onNext: () => void; canNext: boolean; showBack?: boolean; nextLabel?: string }) {
  return (
    <>
      {showBack ? (
        <button onClick={onBack} className="glass inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium transition hover:scale-[1.02]">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      ) : <span />}
      <motion.button
        onClick={onNext}
        whileTap={{ scale: 0.97 }}
        disabled={!canNext}
        className="group inline-flex items-center gap-2 rounded-full brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50 hover:enabled:scale-[1.02]"
      >
        {nextLabel === "Calculate SGPA" && <Sparkles className="h-4 w-4" />}
        {nextLabel}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </motion.button>
    </>
  );
}

function ModeCard({
  active, onClick, icon, title, desc,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={[
        "group relative overflow-hidden rounded-2xl border p-6 text-left transition-all",
        active
          ? "border-transparent bg-gradient-to-br from-primary/15 to-accent/40 shadow-[0_10px_30px_-15px_oklch(0.55_0.22_275_/_0.6)]"
          : "border-border/70 bg-card/40 hover:border-primary/50",
      ].join(" ")}
    >
      <div className="grid h-11 w-11 place-items-center rounded-2xl brand-gradient text-white">{icon}</div>
      <div className="mt-4 text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
    </motion.button>
  );
}

function subjectMeta(s: import("@/data/subjects").Subject) {
  const type =
    s.type === "theory" ? "Theory" :
    s.type === "lab" ? "Lab" :
    s.type === "drawing" ? "Drawing" :
    s.type === "skill" ? "Skill Course" : "Non-credit";
  return `${type} · ${s.credits} credit${s.credits !== 1 ? "s" : ""}`;
}

function MarksRow({
  idx, subject, value, onChange,
}: { idx: number; subject: import("@/data/subjects").Subject; value: { cie: string; see: string }; onChange: (v: { cie: string; see: string }) => void }) {
  const cieNum = Number(value.cie);
  const seeNum = Number(value.see);
  const cieInvalid = value.cie !== "" && (isNaN(cieNum) || cieNum < 0 || cieNum > subject.cieMax);
  const seeInvalid = subject.seeMax > 0 && value.see !== "" && (isNaN(seeNum) || seeNum < 0 || seeNum > subject.seeMax);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03 }}
      className="rounded-2xl border border-border/60 bg-background/40 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <div className="truncate font-medium">{subject.name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{subjectMeta(subject)}</div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">CIE /{subject.cieMax}</Label>
            <Input
              inputMode="numeric"
              className={`w-24 ${cieInvalid ? "border-destructive" : ""}`}
              value={value.cie}
              onChange={(e) => onChange({ ...value, cie: e.target.value })}
              placeholder="0"
              aria-invalid={cieInvalid}
            />
          </div>
          {subject.seeMax > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">SEE /{subject.seeMax}</Label>
              <Input
                inputMode="numeric"
                className={`w-24 ${seeInvalid ? "border-destructive" : ""}`}
                value={value.see}
                onChange={(e) => onChange({ ...value, see: e.target.value })}
                placeholder="0"
                aria-invalid={seeInvalid}
              />
            </div>
          )}
        </div>
      </div>
      {(cieInvalid || seeInvalid) && (
        <div className="mt-2 text-xs text-destructive">Enter a value between 0 and the maximum.</div>
      )}
    </motion.div>
  );
}

function GradeRow({
  subject, value, onChange,
}: { subject: import("@/data/subjects").Subject; value?: Grade; onChange: (g: Grade) => void }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <div className="truncate font-medium">{subject.name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{subjectMeta(subject)}</div>
        </div>
        <Select value={value} onValueChange={(v) => onChange(v as Grade)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Choose grade" />
          </SelectTrigger>
          <SelectContent>
            {GRADES.map((g) => (
              <SelectItem key={g} value={g}>{g}-{GRADE_POINTS[g]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
