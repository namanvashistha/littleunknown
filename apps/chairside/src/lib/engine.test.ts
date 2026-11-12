import { test } from "node:test";
import assert from "node:assert/strict";
import { DRUGS, DX, RX } from "./data.ts";
import { SAMPLES } from "./samples.ts";
import { bestForm, compute, gateCheck, r1, resolve, scriptText, unitsFor } from "./engine.ts";
import type { ReadyPatient } from "./types.ts";

const kid = (o: Partial<ReadyPatient> = {}): ReadyPatient => ({ kg: 18, months: 60, allergy: "none", immuno: false, ...o });

test("data: every reference resolves", () => {
  const ids = new Set(DX.map((d) => d.id));
  assert.equal(ids.size, DX.length, "diagnosis ids are unique");
  for (const d of DX) {
    for (const ref of d.rx ?? []) assert.ok(RX[ref.k], `${d.id} → regimen ${ref.k}`);
    if (d.escalate) assert.ok(ids.has(d.escalate), `${d.id} escalates to ${d.escalate}`);
  }
  for (const [k, rx] of Object.entries(RX)) {
    assert.ok(DRUGS[rx.drug], `${k} → drug ${rx.drug}`);
    if (rx.kind === "perDay") assert.ok(rx.perDay && rx.doses, `${k} has perDay and doses`);
    if (rx.kind === "perDose" || rx.kind === "single") assert.ok(rx.perDose, `${k} has perDose`);
    if (rx.kind === "topical") assert.ok(rx.instruction, `${k} has an instruction`);
  }
});

test("amoxicillin q8h: 20–40 mg/kg/day in 3 doses", () => {
  const c = compute(RX.amox_q8, kid({ kg: 18 }));
  assert.deepEqual(c.dose!.map(r1), [120, 240]);
  assert.equal(c.capped, undefined);
});

test("maximum single dose caps the top of the range", () => {
  const c = compute(RX.amox_q8, kid({ kg: 39 })); // 40×39/3 = 520 > 500
  assert.equal(c.dose![1], 500);
  assert.equal(c.capped?.by, "single");
  assert.equal(c.capped?.over, 20);
});

test("maximum daily dose caps each dose when the dose count is fixed", () => {
  const c = compute(RX.penv_std, kid({ kg: 50, months: 160 })); // 50×50 = 2500/day > 2000
  assert.equal(c.dose![1], 500);
  assert.equal(c.daily![1], 2000);
  assert.equal(c.capped?.by, "daily");
  const az = compute(RX.azithro_perio, kid({ kg: 50, months: 160 })); // 12×50 = 600 once daily > 500
  assert.equal(az.dose![1], 500);
});

test("as-needed paracetamol flags the daily cap rather than capping", () => {
  const c = compute(RX.para, kid({ kg: 20 })); // 15×20=300 mg q4h → 6×300=1800 > 75×20=1500
  assert.deepEqual(c.dose!.map(r1), [200, 300]);
  assert.match(c.dailyFlag!, /75 mg\/kg daily cap \(1500 mg\)/);
});

test("doxycycline prophylaxis: flat 100 mg over 45 kg", () => {
  const c = compute(RX.px_doxy, kid({ kg: 50, months: 150 }));
  assert.deepEqual(c.dose, [100, 100]);
  assert.ok(c.flat);
});

test("penicillin allergy withholds penicillins; type I also withholds cephalosporins", () => {
  const abscess = DX.find((d) => d.id === "abscess-systemic")!;
  const mild = resolve(abscess, kid({ allergy: "mild" }));
  assert.ok(mild.blk.some((o) => o.rx.drug === "amoxicillin"));
  assert.ok(mild.ok.some((o) => o.rx.drug === "cephalexin"));
  const typeI = resolve(abscess, kid({ allergy: "typeI" }));
  assert.ok(typeI.blk.some((o) => o.rx.drug === "cephalexin"));
  assert.ok(typeI.ok.some((o) => o.rx.drug === "clindamycin"));
});

test("age gates: doxycycline from 8 years", () => {
  assert.equal(gateCheck(RX.doxy, kid({ months: 95 })), "Under 8 years");
  assert.equal(gateCheck(RX.doxy, kid({ months: 96 })), null);
});

test("band regimens out of band are hidden, not withheld", () => {
  const thrush = DX.find((d) => d.id === "candidiasis")!;
  const infant = resolve(thrush, kid({ months: 6, kg: 7 }));
  assert.ok(infant.ok.some((o) => o.ref.k === "nyst_infant"));
  assert.ok(!infant.blk.some((o) => o.ref.k === "nyst_child"));
});

test("formulation choice and whole tablets", () => {
  const amox = DRUGS.amoxicillin;
  assert.equal(amox.forms[bestForm(amox, 125)].s, "125 mg / 5 mL");
  assert.equal(unitsFor({ t: "Tablet", s: "250 mg" }, 500), 2);
  assert.equal(unitsFor({ t: "Tablet", s: "250 mg" }, 300), null);
  assert.equal(unitsFor({ t: "Syrup", s: "250 mg / 5 mL", mgml: 50 }, 500), null);
});

test("script text handles topical regimens and interval ranges", () => {
  const p = kid();
  assert.match(scriptText(RX.tri_paste, p, DRUGS.triamcinolone.forms[0]), /Apply to ulcers/);
  assert.match(scriptText(RX.para, p, DRUGS.paracetamol.forms[0]), /every 4–6 h/);
  assert.match(scriptText(RX.amox_q8, p, DRUGS.amoxicillin.forms[0]), /\(\d+(\.\d)?–\d+(\.\d)? mL\)/);
});

test("immunocompromised duration goes on the script", () => {
  assert.match(scriptText(RX.acy_pghs, kid({ immuno: true }), DRUGS.acyclovir.forms[0]), /7–10 days/);
});

test("sample patients open real diagnoses and show what they claim", () => {
  assert.equal(new Set(SAMPLES.map((s) => s.id)).size, SAMPLES.length);
  const byId = (id: string) => SAMPLES.find((s) => s.id === id)!;
  const dx = (id: string) => DX.find((d) => d.id === id)!;
  for (const s of SAMPLES) assert.ok(dx(s.dx), `${s.id} → ${s.dx}`);
  const meera = byId("meera"), kabir = byId("kabir"), zoya = byId("zoya"), ishaan = byId("ishaan"), vihaan = byId("vihaan");
  assert.ok(resolve(dx(meera.dx), meera).blk.some((o) => o.ref.k === "clotri_loz"));
  const k = resolve(dx(kabir.dx), kabir);
  assert.ok(k.blk.some((o) => o.ref.k === "amox_q8") && k.blk.some((o) => o.ref.k === "doxy"));
  assert.ok(resolve(dx(zoya.dx), zoya).blk.some((o) => o.rx.drug === "cephalexin"));
  assert.equal(compute(RX.px_amox, ishaan).dose![1], 2000);
  assert.equal(compute(RX.metro_perio, vihaan).dose![1], 250);
});
