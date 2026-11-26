# Suraksha Drug Safety

Safety-intake workspace for the Suraksha synthetic pharmacovigilance pack. Each fictional case is completed on an original form structured like a Yellow Card and a MedWatch report.

These records are for training. They are not for regulatory submission or clinical care.

## Run

```bash
npm install
npm run dev
```

Open the local site, review a case, and use **Download PDF**. **Download PDF pack** saves every completed form in one file.

## Completed forms

`submission/SURAKSHA-ADR-Reporting-Pack.pdf` is the full pack.

`submission/cases/` has one PDF per case, from `SYN-PV-007` through `SYN-PV-024`.

Regenerate them with:

```bash
npm run export-pdfs
```

## How the forms were filled

Patient initials are training codes (sex letter plus the case number), because the source has no initials. Age, sex, suspect drug, dose, route, indication, reaction, onset interval, seriousness, dechallenge, rechallenge, concomitant medicines, and reporter qualification are copied from the source.

The reaction start date uses 06 Jan 2026 as training Day 0, then adds the source onset interval. The source itself has no calendar dates. The drug stop date, medical history, reporter name, and reporter contact stay unknown. Seriousness is kept separate from severity. Dechallenge codes are stored as received. No causality assessment is made.
