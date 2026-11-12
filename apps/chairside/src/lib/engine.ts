/* Dose engine. Pure functions over data.ts: no DOM, no state. Covered by engine.test.ts. */
import { DRUGS, RX } from "./data.ts";
import type { Diagnosis, Drug, Form, ReadyPatient, Regimen, RxRef } from "./types.ts";

export const r1 = (n: number) => Math.round(n * 10) / 10;
export const f1 = (n: number) => r1(n).toFixed(1);
export const rng = (a: number, b: number, u?: string) =>
  (r1(a) === r1(b) ? `${r1(a)}` : `${r1(a)}–${r1(b)}`) + (u ? ` ${u}` : "");
export const ivMin = (e: number | [number, number]) => (Array.isArray(e) ? e[0] : e);
export const ivTxt = (e: number | [number, number]) =>
  Array.isArray(e) ? `every ${e[0]}–${e[1]} h` : `every ${e} h`;
export const ageTxt = (m: number) => (m < 24 ? `${m} mo` : `${Math.floor(m / 12)}y ${m % 12}m`);

/** Why this regimen can't be offered to this patient, or null when it can. */
export function gateCheck(rx: Regimen, p: ReadyPatient): string | null {
  if (rx.gate.allergy && !rx.gate.allergy.includes(p.allergy)) return rx.block?.allergy ?? "Allergy";
  if (rx.minAgeM !== undefined && p.months < rx.minAgeM)
    return rx.band ? `Age band: from ${ageTxt(rx.minAgeM)}` : (rx.block?.age ?? `From ${ageTxt(rx.minAgeM)}`);
  if (rx.maxAgeM !== undefined && p.months > rx.maxAgeM)
    return rx.band
      ? `Age band: up to ${ageTxt(rx.maxAgeM)}`
      : `Paediatric dose is up to ${ageTxt(rx.maxAgeM)} — use the adult regimen`;
  if (rx.maxKg !== undefined && p.kg > rx.maxKg)
    return rx.band
      ? `Weight band: up to ${rx.maxKg} kg`
      : `Weight-based dose is up to ${rx.maxKg} kg — use the over-${rx.maxKg} kg regimen`;
  if (rx.minKg !== undefined && p.kg < rx.minKg) return rx.band ? `Weight band: from ${rx.minKg} kg` : `From ${rx.minKg} kg`;
  return null;
}

export interface Computed {
  kind: Regimen["kind"];
  /** Final per-dose range in mg, after flat doses and caps. */
  dose?: [number, number];
  /** Per-dose range before any cap. */
  raw?: [number, number];
  /** Daily total range in mg, after caps. */
  daily?: [number, number];
  /** Doses per day used for the daily total. */
  perDay?: number;
  /** Divisor shown in the dose line ("3× daily"). */
  per?: number;
  /** Which cap lowered the dose, if any. */
  capped?: { by: "single" | "daily"; limit: number; over: number };
  flat?: boolean;
  /** Daily total above a cap the engine can't enforce by itself (as-needed dosing). */
  dailyFlag?: string;
  /** Share of the maximum single dose this dose uses (0–1). */
  headroom?: number | null;
  /** Each line of the working: [what, result]. */
  math: [string, string][];
}

export function compute(rx: Regimen, p: ReadyPatient): Computed {
  const o: Computed = { kind: rx.kind, math: [] };
  if (rx.kind === "none" || rx.kind === "topical" || rx.kind === "fixed") return o;

  let lo: number, hi: number;
  const per = rx.doses ?? 1;
  if (rx.kind === "perDay") {
    const [a, b] = rx.perDay!;
    lo = (a * p.kg) / per;
    hi = (b * p.kg) / per;
    o.math.push([`${a}–${b} mg/kg/day × ${p.kg} kg`, `${rng(a * p.kg, b * p.kg)} mg/day`]);
    o.math.push([`÷ ${per} doses`, `${rng(lo, hi)} mg/dose`]);
  } else {
    const [a, b] = rx.perDose!;
    lo = a * p.kg;
    hi = b * p.kg;
    o.math.push([`${a === b ? a : `${a}–${b}`} mg/kg × ${p.kg} kg`, `${rng(lo, hi)} mg`]);
  }
  o.raw = [lo, hi];

  if (rx.flatOverKg && p.kg > rx.flatOverKg.kg) {
    lo = hi = rx.flatOverKg.mg;
    o.flat = true;
    o.math.push([`over ${rx.flatOverKg.kg} kg — flat dose`, `${rx.flatOverKg.mg} mg`]);
  }
  if (rx.maxSingle !== undefined && hi > rx.maxSingle) {
    o.capped = { by: "single", limit: rx.maxSingle, over: r1(hi - rx.maxSingle) };
    o.math.push(["maximum single dose", `${rx.maxSingle} mg`]);
    lo = Math.min(lo, rx.maxSingle);
    hi = rx.maxSingle;
  }

  if (rx.kind !== "single") {
    const n = rx.doses ?? (rx.every ? Math.floor(24 / ivMin(rx.every)) : 1);
    o.perDay = n;
    // A fixed number of doses a day: the daily maximum caps each dose.
    if (rx.doses !== undefined && rx.maxDaily !== undefined && hi * n > rx.maxDaily) {
      const cap = rx.maxDaily / n;
      o.capped = { by: "daily", limit: rx.maxDaily, over: r1(hi * n - rx.maxDaily) };
      o.math.push([`maximum daily dose ${rx.maxDaily} mg ÷ ${n}`, `${r1(cap)} mg/dose`]);
      lo = Math.min(lo, cap);
      hi = cap;
    }
    o.daily = [lo * n, hi * n];
    // As-needed dosing: the interval sets the count, so flag rather than cap.
    if (rx.doses === undefined) {
      const caps: [number, string][] = [];
      if (rx.maxDailyPerKg) caps.push([rx.maxDailyPerKg * p.kg, `${rx.maxDailyPerKg} mg/kg daily cap (${r1(rx.maxDailyPerKg * p.kg)} mg)`]);
      if (rx.maxDaily) caps.push([rx.maxDaily, `${rx.maxDaily} mg daily maximum`]);
      const hit = caps.filter(([lim]) => o.daily![1] > lim).sort((x, y) => x[0] - y[0])[0];
      if (hit)
        o.dailyFlag = `At ${n} doses of ${r1(hi)} mg a day the total reaches ${r1(o.daily[1])} mg, above the ${hit[1]}. Give fewer doses or a lower dose.`;
    }
  }

  o.dose = [lo, hi];
  o.per = per;
  o.headroom = rx.maxSingle ? Math.min(1, hi / rx.maxSingle) : null;
  return o;
}

export interface Option {
  ref: RxRef;
  rx: Regimen;
  drug: Drug;
  why: string | null;
}

/** Split a diagnosis's regimens into those offered and those withheld for this patient. Out-of-band regimens are dropped. */
export function resolve(dx: Diagnosis, p: ReadyPatient): { ok: Option[]; blk: Option[] } {
  const out = { ok: [] as Option[], blk: [] as Option[] };
  for (const ref of dx.rx ?? []) {
    const rx = RX[ref.k];
    if (!rx) continue;
    const why = gateCheck(rx, p);
    const item = { ref, rx, drug: DRUGS[rx.drug], why };
    if (!why) out.ok.push(item);
    else if (!(rx.band && /^(Age|Weight) band/.test(why))) out.blk.push(item);
  }
  return out;
}

export function strengthMg(f: Form): number | null {
  const m = /([\d.]+)\s*mg/.exec(f.s || "");
  return m ? parseFloat(m[1]) : null;
}
export const isLiquid = (f: Form | undefined): f is Form & { mgml: number } => !!f?.mgml;
export const isSolid = (f: Form) => !f.mgml && /tab|cap/i.test(f.t);

/** Whole or half units of a solid form that make up `mg`, or null when it doesn't divide cleanly. */
export function unitsFor(f: Form, mg: number): number | null {
  const st = strengthMg(f);
  if (!st || !isSolid(f)) return null;
  const n = mg / st;
  const nearest = Math.round(n * 2) / 2;
  return Math.abs(n - nearest) < 0.08 && nearest >= 0.5 && nearest <= 4 ? nearest : null;
}

/** Index of the formulation that gives the most practical dose: a liquid near 5 mL, else whole tablets. */
export function bestForm(d: Drug, mg: number): number {
  const fs = d.forms;
  let bi = -1, bs = Infinity;
  fs.forEach((f, i) => {
    if (!f.mgml) return;
    const v = mg / f.mgml;
    if (v > 15) return;
    const sc = v < 0.5 ? 500 + (0.5 - v) * 100 : Math.abs(v - 5);
    if (sc < bs) { bs = sc; bi = i; }
  });
  if (bi >= 0) return bi;
  let si = -1, ss = Infinity;
  fs.forEach((f, i) => {
    const u = unitsFor(f, mg);
    if (u === null) return;
    const sc = Math.abs(u - 1) + (u % 1 ? 0.4 : 0);
    if (sc < ss) { ss = sc; si = i; }
  });
  if (si >= 0) return si;
  let li = -1, lv = Infinity;
  fs.forEach((f, i) => {
    if (!f.mgml) return;
    const v = mg / f.mgml;
    if (v < lv) { lv = v; li = i; }
  });
  return li >= 0 ? li : 0;
}

/** Plain-text prescription line for the clipboard. */
export function scriptText(rx: Regimen, p: ReadyPatient, form: Form | undefined): string {
  const d = DRUGS[rx.drug];
  const c = compute(rx, p);
  const lines = [`${d.name}${form ? ` — ${form.t} ${form.s}` : ""}`];
  if (c.dose) {
    let l = `${rng(c.dose[0], c.dose[1])} mg`;
    if (isLiquid(form)) l += ` (${rng(c.dose[0] / form.mgml, c.dose[1] / form.mgml)} mL)`;
    lines.push(l);
  } else if (rx.instruction || rx.fixed) lines.push((rx.instruction || rx.fixed)!);
  const timing = [rx.every ? ivTxt(rx.every) : "", p.immuno && rx.durImmuno ? rx.durImmuno : rx.dur || ""].filter(Boolean);
  if (timing.length) lines.push(timing.join(" · "));
  lines.push(`${p.kg} kg · ${ageTxt(p.months)}`);
  return lines.join("\n");
}
