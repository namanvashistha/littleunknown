export type SourceKey = "meds" | "prophy" | "therapy" | "outside";

export interface Source {
  label: string;
  cite: string;
  rev: string;
}

export interface Form {
  /** Form type, e.g. "Syrup", "Tablet". */
  t: string;
  /** Strength as printed, e.g. "125 mg / 5 mL". */
  s: string;
  /** mg per mL for liquids; absent or null for solids and topicals. */
  mgml?: number | null;
  /** True when the strength itself is stated in the AAPD document. */
  fromGuideline?: boolean;
}

export interface Drug {
  name: string;
  cls: string;
  /** Common Indian trade names. Not from the guideline: a dispensing aid only. */
  brands?: string[];
  forms: Form[];
  note?: string;
  src: SourceKey;
  page: string;
}

export type Allergy = "none" | "mild" | "typeI";

export type RegimenKind = "perDose" | "perDay" | "single" | "fixed" | "topical" | "none";

export interface Regimen {
  drug: string;
  label: string;
  kind: RegimenKind;
  /** A band regimen is one of several age or weight bands: out-of-band ones are hidden, not shown as withheld. */
  band?: boolean;
  perDay?: [number, number];
  perDay_unit?: string;
  perDose?: [number, number];
  perDose_unit?: string;
  doses?: number;
  every?: number | [number, number];
  maxSingle?: number;
  maxDaily?: number;
  maxDailyPerKg?: number;
  minAgeM?: number;
  maxAgeM?: number;
  minKg?: number;
  maxKg?: number;
  flatOverKg?: { kg: number; mg: number };
  fixed?: string;
  instruction?: string;
  dur?: string;
  durImmuno?: string;
  followOn?: { perDose: [number, number]; label: string };
  verbatim?: string;
  caution?: string;
  gap?: string;
  note?: string;
  gate: { allergy?: Allergy[] };
  block?: { allergy?: string; age?: string };
  src: SourceKey;
  page: string;
}

export type Verdict = "none" | "antibiotic" | "antifungal" | "antiviral" | "topical" | "gate" | "emergency";
export type Coverage = "aapd" | "adjacent" | "outside";
export type Role = "first" | "alt" | "adjunct";

export interface RxRef {
  k: string;
  role: Role;
  note?: string;
}

export interface Diagnosis {
  id: string;
  g: string;
  n: string;
  verdict: Verdict;
  coverage: Coverage;
  why: string;
  quote?: string;
  plan?: string[];
  analgesia?: boolean;
  escalate?: string;
  red?: string[];
  noAntibiotic?: boolean;
  prophylaxis?: boolean;
  rx?: RxRef[];
  src: SourceKey;
  page?: string;
}

export interface CardiacGroup {
  g: string;
  items: string[];
}

export interface Patient {
  /** Set when a sample patient is loaded. */
  sample?: string;
  /** Weight in kg; null until entered. */
  kg: number | null;
  /** Age in whole months; null until entered. */
  months: number | null;
  allergy: Allergy;
  immuno: boolean;
}

/** A patient whose weight and age are both entered. */
export interface ReadyPatient extends Patient {
  kg: number;
  months: number;
}
