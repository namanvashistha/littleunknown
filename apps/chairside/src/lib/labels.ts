import type { Coverage, Verdict } from "./types.ts";

export const VERDICT: Record<Verdict, { label: string; tone: "stop" | "go" | "hold" | "plain" }> = {
  none: { label: "No drug", tone: "stop" },
  antibiotic: { label: "Antibiotic", tone: "go" },
  antifungal: { label: "Antifungal", tone: "plain" },
  antiviral: { label: "Antiviral", tone: "plain" },
  topical: { label: "Topical", tone: "plain" },
  gate: { label: "Conditional", tone: "hold" },
  emergency: { label: "Emergency", tone: "hold" },
};

export const COVERAGE: Record<Coverage, string> = {
  aapd: "DOSE IN AAPD MED DOC",
  adjacent: "AAPD POLICY · DOSE BORROWED",
  outside: "NOT IN AAPD MED DOC",
};

export const ROLE = { first: "FIRST", alt: "ALT", adjunct: "ADJUNCT" } as const;
