/* Plain-language words for the UI. Clinical terms stay where a dentist expects them. */
import type { Allergy, Coverage, Role, Verdict } from "./types.ts";

export type Tone = "red" | "green" | "amber" | "neutral";

export const VERDICT: Record<Verdict, { label: string; tone: Tone; headline: string }> = {
  none: { label: "No antibiotic", tone: "red", headline: "No antibiotic needed" },
  antibiotic: { label: "Antibiotic", tone: "green", headline: "Antibiotic needed" },
  antifungal: { label: "Antifungal", tone: "neutral", headline: "Antifungal treatment" },
  antiviral: { label: "Antiviral", tone: "neutral", headline: "Antiviral treatment" },
  topical: { label: "Other care", tone: "neutral", headline: "Other treatment, no antibiotic" },
  gate: { label: "Depends", tone: "amber", headline: "Only in some cases" },
  emergency: { label: "Emergency", tone: "red", headline: "Emergency: send to hospital now" },
};

export const COVERAGE: Record<Coverage, string> = {
  aapd: "Dose from the AAPD medicines guide.",
  adjacent: "Named in an AAPD policy; the dose comes from the AAPD medicines guide.",
  outside: "Not covered by the AAPD medicines guide.",
};

export const ROLE: Record<Role, string> = { first: "First choice", alt: "Alternatives", adjunct: "Add-ons" };

export const ALLERGY: Record<Allergy, string> = {
  none: "No allergy",
  mild: "Penicillin allergy",
  typeI: "Severe penicillin allergy",
};

export function ageLong(m: number): string {
  if (m < 24) return `${m} month${m === 1 ? "" : "s"}`;
  const y = Math.floor(m / 12), mo = m % 12;
  return `${y} years${mo ? `, ${mo} mo` : ""}`;
}

const TIMES: Record<number, string> = { 1: "Once a day", 2: "Twice a day", 3: "3 times a day", 4: "4 times a day" };
export const timesADay = (n: number) => TIMES[n] ?? `${n} times a day`;
