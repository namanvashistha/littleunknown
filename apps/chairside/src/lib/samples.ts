/* Sample patients for showing Chairside. Fictional: any likeness to a real child is chance.
   Each one is picked to show a different part of the engine. */
import type { Allergy } from "./types.ts";

export interface Sample {
  id: string;
  name: string;
  kg: number;
  months: number;
  allergy: Allergy;
  immuno: boolean;
  /** What the parent says, in their words. */
  complaint: string;
  /** The diagnosis this visit opens on. */
  dx: string;
  /** What this patient shows off in the app. */
  shows: string;
}

export const SAMPLES: Sample[] = [
  {
    id: "aarav", name: "Aarav", kg: 18.4, months: 50, allergy: "none", immuno: false,
    complaint: "Cheek swollen since last night, fever 38.6 °C, lower molar decayed.",
    dx: "abscess-systemic",
    shows: "Amoxicillin by weight, with the mL for each syrup strength",
  },
  {
    id: "meera", name: "Meera", kg: 8.2, months: 9, allergy: "none", immuno: false,
    complaint: "White patches on the tongue and cheeks that don't wipe off, feeding less.",
    dx: "candidiasis",
    shows: "Infant nystatin band; the lozenge is withheld under 3 years",
  },
  {
    id: "kabir", name: "Kabir", kg: 22, months: 86, allergy: "mild", immuno: false,
    complaint: "Fell off his bike 40 minutes ago, upper front tooth knocked out, brought in milk.",
    dx: "avulsion",
    shows: "Penicillin allergy withholds amoxicillin; doxycycline waits until 8 years",
  },
  {
    id: "zoya", name: "Zoya", kg: 34, months: 124, allergy: "typeI", immuno: false,
    complaint: "Pain and swelling three days after an extraction, bad taste.",
    dx: "post-extraction-infection",
    shows: "Anaphylaxis to penicillin withholds cephalexin as well",
  },
  {
    id: "ishaan", name: "Ishaan", kg: 52, months: 162, allergy: "none", immuno: false,
    complaint: "Prosthetic pulmonary valve. Booked for an extraction today.",
    dx: "ie-prophylaxis",
    shows: "Both prophylaxis gates; amoxicillin capped at 2,000 mg",
  },
  {
    id: "anaya", name: "Anaya", kg: 14, months: 36, allergy: "none", immuno: true,
    complaint: "On chemotherapy. Painful ulcers on the gums and lips, refusing drinks since yesterday.",
    dx: "pghs",
    shows: "Antiviral, not antibiotic; immunocompromised course length",
  },
  {
    id: "vihaan", name: "Vihaan", kg: 61, months: 186, allergy: "none", immuno: false,
    complaint: "Bleeding, painful gums with grey ulcers between the teeth, foul breath.",
    dx: "necrotising-gingivitis",
    shows: "Metronidazole capped at the 250 mg maximum; chlorhexidine allowed",
  },
];
