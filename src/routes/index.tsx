import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, GraduationCap, Sparkles, Calculator, BarChart3 } from "lucide-react";
import { AnimatedBg } from "@/components/animated-bg";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBg />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl brand-gradient text-white shadow-md">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-tight">MJCET GPA Estimator</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-8 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="glass mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Built for MJCET Autonomous Batch
          </motion.div>

          <h1 className="mt-6 font-display text-6xl leading-[1.05] sm:text-7xl md:text-8xl">
            Predict your <span className="text-brand italic">SGPA</span>
            <br /> before results.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground">
            Enter your expected marks or grades — get an accurate semester GPA
            estimate in seconds, tailored to MJCET's official grading system.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/estimator"
              className="group inline-flex items-center gap-2 rounded-full brand-gradient px-7 py-3.5 text-base font-semibold text-white shadow-[0_10px_40px_-10px_oklch(0.55_0.22_275_/_0.6)] transition-all hover:scale-[1.02] hover:shadow-[0_15px_50px_-10px_oklch(0.55_0.22_275_/_0.8)]"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="glass rounded-full px-6 py-3.5 text-sm font-medium text-foreground transition hover:scale-[1.02]"
            >
              How it works
            </a>
          </motion.div>
        </motion.div>

        {/* Preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mx-auto mt-20 max-w-4xl"
        >
          <div className="glass relative overflow-hidden rounded-[2rem] p-8 sm:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full brand-gradient opacity-30 blur-3xl" />
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Predicted SGPA
                </div>
                <div className="mt-2 font-display text-7xl leading-none text-brand">9.17</div>
                <div className="mt-3 inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Outstanding
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { g: "S", n: 4, c: "from-emerald-400 to-teal-500" },
                    { g: "A", n: 3, c: "from-sky-400 to-indigo-500" },
                    { g: "B", n: 2, c: "from-violet-400 to-fuchsia-500" },
                    { g: "Credits", n: 20, c: "from-amber-400 to-orange-500" },
                  ].map((x, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.08 }}
                      className="rounded-2xl border border-border/60 bg-background/40 p-4"
                    >
                      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${x.c} text-xs font-bold text-white`}>
                        {typeof x.g === "string" && x.g.length <= 2 ? x.g : x.g[0]}
                      </div>
                      <div className="mt-3 text-2xl font-bold">{x.n}</div>
                      <div className="text-xs text-muted-foreground">{typeof x.g === "string" && x.g.length > 2 ? x.g : `Grade ${x.g}`}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <section id="features" className="mt-28 grid gap-6 sm:grid-cols-3">
          {[
            { icon: Calculator, title: "Marks or Grades", desc: "Estimate using expected CIE + SEE marks, or pick a grade directly." },
            { icon: GraduationCap, title: "MJCET syllabus", desc: "Auto-loads subjects for your semester, group and branch." },
            { icon: BarChart3, title: "Visual results", desc: "See grade distribution, per-subject contribution and CGPA impact." },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-3xl p-6 transition-transform hover:-translate-y-1"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl brand-gradient text-white">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </section>

        <footer className="mt-24 text-center text-xs text-muted-foreground">
          Not affiliated with MJCET. Estimates are indicative only.
          <br />
          Made with ❤️ by Muzzammil
        </footer>
      </main>
    </div>
  );
}
