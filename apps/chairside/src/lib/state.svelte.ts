/* App state: the route (from the URL hash, so back and forward work) and the patient. */
import type { Patient, ReadyPatient } from "./types.ts";

// The first screen is the patient list: pick who's in the chair, then the diagnosis.
export type Route =
  | { view: "patients" }
  | { view: "browse" }
  | { view: "dx"; dx: string }
  | { view: "dose"; dx: string; rx: string };

function parse(hash: string): Route {
  const [, a, dx, rx] = hash.replace(/^#/, "").split("/").map(decodeURIComponent);
  if (a === "dx" && dx && rx) return { view: "dose", dx, rx };
  if (a === "dx" && dx) return { view: "dx", dx };
  if (a === "diagnoses") return { view: "browse" };
  return { view: "patients" };
}

export const href = {
  patients: () => "#/",
  browse: () => "#/diagnoses",
  dx: (dx: string) => `#/dx/${encodeURIComponent(dx)}`,
  dose: (dx: string, rx: string) => `#/dx/${encodeURIComponent(dx)}/${encodeURIComponent(rx)}`,
};

export const nav = $state({ route: parse(location.hash) });
addEventListener("hashchange", () => {
  nav.route = parse(location.hash);
  scrollTo(0, 0);
});

/* The patient lives for this tab only. A new launch starts blank, so one child's
   weight is never carried over to the next child. */
const KEY = "chairside.patient";
const blank: Patient = { sample: undefined, kg: null, months: null, allergy: "none", immuno: false };

function load(): Patient {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
    if (v && typeof v === "object") return { ...blank, ...v };
  } catch {}
  return { ...blank };
}

export const patient = $state<Patient>(load());

export function savePatient() {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(patient));
  } catch {}
}

export function resetPatient() {
  Object.assign(patient, blank);
  savePatient();
}

export function loadSample(s: { id: string; kg: number; months: number; allergy: Patient["allergy"]; immuno: boolean }) {
  Object.assign(patient, { sample: s.id, kg: s.kg, months: s.months, allergy: s.allergy, immuno: s.immuno });
  savePatient();
}

export const isReady = (p: Patient): p is ReadyPatient => p.kg !== null && p.months !== null;

export const ui = $state({ sheet: false, toast: "" });

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(msg: string) {
  ui.toast = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (ui.toast = ""), 2200);
}

/* Theme: light unless the viewer picks dark. index.html applies the saved choice before first paint. */
const THEME_KEY = "chairside.theme";
const BAR = { light: "#f6f6f3", dark: "#0f0f0e" } as const;
export const theme = $state<{ value: "light" | "dark" }>({
  value: document.documentElement.dataset.theme === "dark" ? "dark" : "light",
});

export function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme.value;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", BAR[theme.value]);
  try {
    localStorage.setItem(THEME_KEY, theme.value);
  } catch {}
}
