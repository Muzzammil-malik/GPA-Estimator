import type { Subject } from "@/data/subjects";

export type Grade = "S" | "A" | "B" | "C" | "D" | "E" | "F";

export const GRADE_POINTS: Record<Grade, number> = {
  S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0,
};

export const GRADES: Grade[] = ["S", "A", "B", "C", "D", "E", "F"];

export function percentToGrade(p: number): Grade {
  if (p >= 90) return "S";
  if (p >= 80) return "A";
  if (p >= 70) return "B";
  if (p >= 60) return "C";
  if (p >= 50) return "D";
  if (p >= 40) return "E";
  return "F";
}

export interface SubjectResult {
  subject: Subject;
  cie?: number;
  see?: number;
  total?: number;
  percent: number;
  grade: Grade;
  gradePoint: number;
  passed: boolean;
  failReason?: string;
  contribution: number; // gradePoint * credits
}

export interface MarksInput {
  cie: number;
  see: number;
}

// MJCET rule: minimum 40% in SEE for theory (of SEE max), and 40% aggregate
export function evaluateMarks(subject: Subject, input: MarksInput): SubjectResult {
  const { cie, see } = input;
  const total = cie + see;
  const totalMax = subject.cieMax + subject.seeMax;
  const percent = totalMax > 0 ? (total / totalMax) * 100 : 0;

  let passed = true;
  let failReason: string | undefined;

  if (subject.type === "theory") {
    if (see < subject.seeMax * 0.4) {
      passed = false;
      failReason = `SEE below 40% (need ${Math.ceil(subject.seeMax * 0.4)}/${subject.seeMax})`;
    } else if (percent < 40) {
      passed = false;
      failReason = "Aggregate below 40%";
    }
  } else if (subject.type === "lab") {
    if (percent < 40) {
      passed = false;
      failReason = "Aggregate below 40%";
    }
  } else if (subject.type === "drawing") {
    if (percent < 40) {
      passed = false;
      failReason = "Aggregate below 40%";
    }
  } else if (subject.type === "skill" || subject.type === "noncredit") {
    if (cie < subject.cieMax * 0.4) {
      passed = false;
      failReason = "CIE below 40%";
    }
  }

  const grade: Grade = passed ? percentToGrade(percent) : "F";
  const gradePoint = GRADE_POINTS[grade];
  return {
    subject, cie, see, total, percent, grade, gradePoint, passed, failReason,
    contribution: gradePoint * subject.credits,
  };
}

export function evaluateGrade(subject: Subject, grade: Grade): SubjectResult {
  const gradePoint = GRADE_POINTS[grade];
  const passed = grade !== "F";
  // Approx percent from grade (midpoint of band)
  const approx: Record<Grade, number> = { S: 95, A: 85, B: 75, C: 65, D: 55, E: 45, F: 20 };
  return {
    subject,
    percent: approx[grade],
    grade,
    gradePoint,
    passed,
    failReason: passed ? undefined : "Failed",
    contribution: gradePoint * subject.credits,
  };
}

export interface SgpaSummary {
  sgpa: number;
  totalCredits: number;
  earnedCredits: number;
  passedCount: number;
  failedCount: number;
  results: SubjectResult[];
  allPassed: boolean;
}

export function computeSgpa(results: SubjectResult[]): SgpaSummary {
  // Only credited subjects count toward SGPA
  const credited = results.filter((r) => r.subject.credits > 0);
  const totalCredits = credited.reduce((s, r) => s + r.subject.credits, 0);
  const totalPoints = credited.reduce((s, r) => s + r.contribution, 0);
  const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  const earned = credited.filter((r) => r.passed).reduce((s, r) => s + r.subject.credits, 0);
  const allPassed = results.every((r) => r.passed);
  return {
    sgpa: allPassed ? Math.round(sgpa * 100) / 100 : 0,
    totalCredits,
    earnedCredits: earned,
    passedCount: passed,
    failedCount: failed,
    results,
    allPassed,
  };
}

export function performanceLabel(sgpa: number): { label: string; tone: string } {
  if (sgpa >= 9) return { label: "Outstanding", tone: "from-emerald-400 to-teal-500" };
  if (sgpa >= 8) return { label: "Excellent", tone: "from-sky-400 to-indigo-500" };
  if (sgpa >= 7) return { label: "Very Good", tone: "from-violet-400 to-fuchsia-500" };
  if (sgpa >= 6) return { label: "Good", tone: "from-amber-400 to-orange-500" };
  if (sgpa >= 5) return { label: "Average", tone: "from-orange-400 to-rose-500" };
  return { label: "Needs Improvement", tone: "from-rose-500 to-red-600" };
}

export function computeCgpa(prevSgpa: number, prevCredits: number, currSgpa: number, currCredits: number): number {
  const total = prevCredits + currCredits;
  if (total === 0) return 0;
  return Math.round(((prevSgpa * prevCredits + currSgpa * currCredits) / total) * 100) / 100;
}
