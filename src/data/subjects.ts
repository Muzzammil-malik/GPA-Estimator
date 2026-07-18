export type SubjectType = "theory" | "lab" | "drawing" | "skill" | "noncredit";

export interface Subject {
  name: string;
  credits: number;
  cieMax: number;
  seeMax: number;
  type: SubjectType;
}

export type Group = "A" | "B";
export type Semester = 1 | 2;

export const BRANCHES: Record<Group, string[]> = {
  A: ["CSA", "CSM", "CSD", "CIV", "MECH", "ECE"],
  B: ["CSE"],
};

const t = (name: string, credits: number): Subject => ({
  name, credits, cieMax: 40, seeMax: 60, type: "theory",
});
const eng = (name: string): Subject => ({
  name, credits: 2, cieMax: 40, seeMax: 60, type: "theory",
});
const lab = (name: string, credits = 1): Subject => ({
  name, credits, cieMax: 25, seeMax: 50, type: "lab",
});
const drawing = (name: string, credits: number): Subject => ({
  name, credits, cieMax: 25, seeMax: 50, type: "drawing",
});
const skill = (name: string, credits = 1): Subject => ({
  name, credits, cieMax: 50, seeMax: 0, type: "skill",
});
const nc = (name: string): Subject => ({
  name, credits: 0, cieMax: 50, seeMax: 0, type: "noncredit",
});

// Semester 1 - Group A (all branches share the same set)
const S1_A: Subject[] = [
  nc("Indian Constitution"),
  t("Matrices & Differential Calculus", 4),
  t("Engineering Physics", 4),
  t("Programming for Problem Solving", 3),
  t("Basic Electrical Engineering", 4),
  lab("Engineering Physics Lab", 1),
  lab("Programming for Problem Solving Lab", 1),
  drawing("Engineering Graphics", 2),
  lab("Basic Electrical Engineering Lab", 1),
];

// Semester 1 - Group B (CSE)
const S1_B: Subject[] = [
  nc("Environmental Sciences"),
  nc("Essence of Indian Traditional Knowledge"),
  eng("English"),
  t("Matrices & Differential Calculus", 4),
  t("Engineering Chemistry", 4),
  t("Programming for Problem Solving", 3),
  lab("English Lab", 1),
  lab("Engineering Chemistry Lab", 1),
  drawing("Engineering Workshop Practice", 2),
  lab("Programming for Problem Solving Lab", 1),
];

// Semester 2 - Group A - CSA/CSM/CSD
const S2_A_CS: Subject[] = [
  nc("Environmental Sciences"),
  nc("Essence of Indian Traditional Knowledge"),
  eng("English"),
  t("Differential Equations & Numerical Methods", 4),
  t("Engineering Chemistry", 4),
  t("Scientific Programming", 3),
  lab("English Lab", 1),
  lab("Engineering Chemistry Lab", 1),
  drawing("Engineering Workshop Practice", 2),
  lab("Scientific Programming Lab", 1),
];

// Semester 2 - Group A - CIV
const S2_A_CIV: Subject[] = [
  nc("Environmental Sciences"),
  nc("Essence of Indian Traditional Knowledge"),
  eng("English"),
  t("Differential Equations & Numerical Methods", 4),
  t("Engineering Chemistry", 4),
  t("Engineering Mechanics", 3),
  lab("English Lab", 1),
  lab("Engineering Chemistry Lab", 1),
  drawing("Engineering Workshop Practice", 2),
  skill("Basics of Building Drawing Lab", 1),
];

// Semester 2 - Group A - MECH
const S2_A_MECH: Subject[] = [
  nc("Environmental Sciences"),
  nc("Essence of Indian Traditional Knowledge"),
  eng("English"),
  t("Differential Equations & Numerical Methods", 4),
  t("Engineering Chemistry", 4),
  t("Engineering Mechanics", 3),
  lab("English Lab", 1),
  lab("Engineering Chemistry Lab", 1),
  drawing("Engineering Workshop Practice", 2),
  skill("Skill Development Course-1 (Concepts of Machine Drawing)", 1),
];

// Semester 2 - Group A - ECE
const S2_A_ECE: Subject[] = [
  nc("Environmental Sciences"),
  nc("Essence of Indian Traditional Knowledge"),
  eng("English"),
  t("Differential Equations & Numerical Methods", 4),
  t("Engineering Chemistry", 4),
  t("Electronic Devices", 3),
  lab("English Lab", 1),
  lab("Engineering Chemistry Lab", 1),
  drawing("Engineering Workshop Practice", 2),
  lab("Electronic Devices Lab", 1),
];

// Semester 2 - Group B - CSE
const S2_B_CSE: Subject[] = [
  nc("Indian Constitution"),
  t("Basic Electrical Engineering", 4),
  t("Engineering Physics", 4),
  t("Differential Equations & Numerical Methods", 4),
  t("Scientific Programming", 3),
  lab("Engineering Physics Lab", 1),
  drawing("Engineering Graphics", 2),
  lab("Basic Electrical Engineering Lab", 1),
  lab("Scientific Programming Lab", 1),
];

export function getSubjects(sem: Semester, group: Group, branch: string): Subject[] {
  if (sem === 1) return group === "A" ? S1_A : S1_B;
  // sem 2
  if (group === "B") return S2_B_CSE;
  if (["CSA", "CSM", "CSD"].includes(branch)) return S2_A_CS;
  if (branch === "CIV") return S2_A_CIV;
  if (branch === "MECH") return S2_A_MECH;
  if (branch === "ECE") return S2_A_ECE;
  return S2_A_CS;
}
