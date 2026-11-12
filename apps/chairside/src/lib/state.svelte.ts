/* App state: the route (from the URL hash, so back and forward work) and the patient. */
import type { Patient, ReadyPatient } from "./types.ts";

export type Route =
  | { view: "browse" }
  | { view: "dx"; dx: string }
  | { view: "dose"; dx: string; rx: string };

function parse(hash: string): Route {
  const [, a, dx, rx] = hash.replace(/^#/, "").split("/").map(decodeURIComponent);
  if (a === "dx" && dx && rx) return { view: "dose", dx, rx };
  if (a === "dx" && dx) return { view: "dx", dx };
  return { view: "browse" };
}

export const href = {
  browse: () => "#/",
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
const blank: Patient = { kg: null, months: null, allergy: "none", immuno: false };

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

export const isReady = (p: Patient): p is ReadyPatient => p.kg !== null && p.months !== null;

export const ui = $state({ sheet: false, toast: "" });

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(msg: string) {
  ui.toast = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (ui.toast = ""), 2200);
}
