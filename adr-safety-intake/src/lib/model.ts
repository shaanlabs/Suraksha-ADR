/** Fixed Day 0 so an onset interval can be shown as a reaction start date. */
const TRAINING_DAY_ZERO_UTC = Date.UTC(2026, 0, 6);
export const TRAINING_DAY_ZERO_LABEL = "06 Jan 2026";
export const FORM_PREPARED_LABEL = "26 Nov 2026";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

const REQUIRED_COLUMNS = [
  "CaseID",
  "Narrative",
  "Age",
  "Sex",
  "SuspectProduct",
  "Dose",
  "Route",
  "Indication",
  "Reaction",
  "OnsetDays",
  "ExpectednessReference",
  "Seriousness",
  "Dechallenge",
  "Rechallenge",
  "ConcomitantMedicines",
  "Reporter",
] as const;

type SourceKey = (typeof REQUIRED_COLUMNS)[number];
type SourceRow = Record<SourceKey, string>;

export type Criterion = {
  label: string;
  value: "Yes" | "Not reported";
};

export type ValidityRow = {
  field: string;
  required: "Yes" | "No";
  entry: string;
  evidence: string;
};

export type Report = {
  caseId: string;
  formPrepared: string;
  patient: {
    initials: string;
    initialsEvidence: string;
    ageYears: string;
    sex: string;
    weight: string;
    height: string;
    ethnicity: string;
    pregnant: string;
  };
  reaction: {
    term: string;
    narrative: string;
    startDate: string;
    startEvidence: string;
    onsetDays: number;
    onsetLabel: string;
    outcomeShort: string;
    outcome: string;
    outcomeEvidence: string;
    seriousness: string;
    regulatorySerious: "Serious" | "Not serious";
    severity: string;
    criteria: Criterion[];
    criteriaNote: string;
  };
  suspect: {
    name: string;
    dose: string;
    route: string;
    indication: string;
    startDate: string;
    stopDate: string;
    stopEvidence: string;
    actionTaken: string;
    batch: string;
    manufacturer: string;
    dechallenge: string;
    dechallengeEvidence: string;
    rechallenge: string;
    rechallengeEvidence: string;
    expectedness: string;
    expectednessReference: string;
    expectednessEvidence: string;
  };
  concomitantSource: string;
  concomitantStatement: string;
  concomitant: { name: string; dose: string; route: string; indication: string }[];
  history: string;
  reporter: {
    qualification: string;
    name: string;
    organisation: string;
    contact: string;
    evidence: string;
  };
  validityNote: string;
  validity: ValidityRow[];
  classificationLead: string;
  rationale: string[];
  limitations: string[];
};

const CRITERIA = [
  "Death",
  "Life-threatening",
  "Hospitalisation",
  "Disability or permanent damage",
  "Congenital anomaly or birth defect",
  "Other medically important condition",
] as const;

export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const source = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (inQuotes) {
      if (character === '"') {
        if (source[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += character;
      }
      continue;
    }
    if (character === '"') {
      inQuotes = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell);
      cell = "";
      if (row.some((value) => value.trim().length > 0)) rows.push(row);
      row = [];
    } else {
      cell += character;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((value) => value.trim().length > 0)) rows.push(row);
  }

  const [header, ...body] = rows;
  if (!header) return [];
  return body.map((values) =>
    Object.fromEntries(header.map((name, index) => [name.trim(), (values[index] ?? "").trim()])),
  );
}

function formatUtc(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function requireRow(record: Record<string, string>, index: number): SourceRow {
  for (const key of REQUIRED_COLUMNS) {
    if (!record[key]) {
      throw new Error(`Case row ${index + 1} is missing ${key}.`);
    }
  }
  return record as SourceRow;
}

function outcomeFromNarrative(narrative: string, caseId: string): { short: string; full: string } {
  if (/not recovered/i.test(narrative)) {
    return { short: "Not recovered", full: "Not recovered / not resolved" };
  }
  if (/recovering/i.test(narrative)) {
    return { short: "Recovering", full: "Recovering / resolving" };
  }
  if (/was recovered/i.test(narrative)) {
    return { short: "Recovered", full: "Recovered / resolved" };
  }
  throw new Error(`${caseId} has no outcome sentence.`);
}

function outcomeSentence(narrative: string): string {
  const sentence = narrative
    .split(".")
    .map((part) => part.trim())
    .find((part) => /recover/i.test(part));
  return sentence ? `${sentence}.` : narrative;
}

function criteriaFor(seriousness: string): Criterion[] {
  return CRITERIA.map((label) => ({
    label,
    value:
      (seriousness === "Hospitalisation" && label === "Hospitalisation") ||
      (seriousness === "Medically important" && label === "Other medically important condition")
        ? "Yes"
        : "Not reported",
  }));
}

function expectednessValue(reference: string): string {
  if (reference === "Known") return "Expected";
  if (reference === "Unexpected") return "Unexpected";
  return reference;
}

function buildReport(row: SourceRow): Report {
  const onsetDays = Number(row.OnsetDays);
  if (!Number.isInteger(onsetDays) || onsetDays < 0) {
    throw new Error(`${row.CaseID} has an invalid onset interval.`);
  }
  if (!["Male", "Female", "Unknown"].includes(row.Sex)) {
    throw new Error(`${row.CaseID} has an unexpected sex value.`);
  }
  if (!["Hospitalisation", "Medically important", "Not serious"].includes(row.Seriousness)) {
    throw new Error(`${row.CaseID} has an unexpected seriousness value.`);
  }

  const sexLetter = row.Sex === "Male" ? "M" : row.Sex === "Female" ? "F" : "U";
  const initials = `${sexLetter}${row.CaseID.slice(-2)}`;
  const reactionStart = formatUtc(new Date(TRAINING_DAY_ZERO_UTC + onsetDays * 86400000));
  const outcome = outcomeFromNarrative(row.Narrative, row.CaseID);
  const regulatorySerious = row.Seriousness === "Not serious" ? "Not serious" : "Serious";
  const onsetLabel = onsetDays === 1 ? "1 day after treatment start" : `${onsetDays} days after treatment start`;
  const concomitantNone = row.ConcomitantMedicines === "None reported";

  return {
    caseId: row.CaseID,
    formPrepared: FORM_PREPARED_LABEL,
    patient: {
      initials,
      initialsEvidence: `The source has no initials. ${initials} is a training code: the sex letter plus the case number.`,
      ageYears: row.Age,
      sex: row.Sex,
      weight: "Unknown",
      height: "Unknown",
      ethnicity: "Unknown",
      pregnant: "Unknown",
    },
    reaction: {
      term: row.Reaction,
      narrative: row.Narrative,
      startDate: reactionStart,
      startEvidence: `Training Day 0 is ${TRAINING_DAY_ZERO_LABEL}. The source onset interval is ${onsetDays} day(s), so the reaction start date is ${reactionStart}.`,
      onsetDays,
      onsetLabel,
      outcomeShort: outcome.short,
      outcome: outcome.full,
      outcomeEvidence: `Narrative outcome sentence: "${outcomeSentence(row.Narrative)}"`,
      seriousness: row.Seriousness,
      regulatorySerious,
      severity: "Unknown. The source gives a regulatory seriousness category and no severity grade.",
      criteria: criteriaFor(row.Seriousness),
      criteriaNote:
        "A criterion is marked Yes when the source seriousness value names it. Every other criterion stays Not reported.",
    },
    suspect: {
      name: row.SuspectProduct,
      dose: row.Dose,
      route: row.Route,
      indication: row.Indication,
      startDate: TRAINING_DAY_ZERO_LABEL,
      stopDate: "Unknown",
      stopEvidence: "The narrative says treatment was stopped. It does not give the stop date.",
      actionTaken: "Drug withdrawn",
      batch: "Unknown",
      manufacturer: "Unknown",
      dechallenge: row.Dechallenge,
      dechallengeEvidence: `Source dechallenge code "${row.Dechallenge}", stored as received.`,
      rechallenge: row.Rechallenge,
      rechallengeEvidence: `Source rechallenge code "${row.Rechallenge}", stored as received.`,
      expectedness: expectednessValue(row.ExpectednessReference),
      expectednessReference: row.ExpectednessReference,
      expectednessEvidence: `Source expectedness reference: ${row.ExpectednessReference}. No separate label review was done.`,
    },
    concomitantSource: row.ConcomitantMedicines,
    concomitantStatement: concomitantNone
      ? "None reported"
      : `${row.ConcomitantMedicines}. Dose, route, and indication were not provided.`,
    concomitant: concomitantNone
      ? []
      : [{ name: row.ConcomitantMedicines, dose: "Unknown", route: "Unknown", indication: "Unknown" }],
    history:
      "Unknown. The source says medical history sits in companion fields, and no history field was supplied. The indication stays with the suspect drug.",
    reporter: {
      qualification: row.Reporter,
      name: "Unknown",
      organisation: "Unknown",
      contact: "Unknown",
      evidence: `Reporter qualification in the source: ${row.Reporter}. Name, organisation, and contact details were not supplied.`,
    },
    validityNote:
      "The first four rows are the minimum elements for a valid training case. Chronology, seriousness, and outcome are documented as well.",
    validity: [
      {
        field: "Identifiable patient",
        required: "Yes",
        entry: "Yes",
        evidence: `Age ${row.Age} years. Sex ${row.Sex}. Training initials ${initials}.`,
      },
      {
        field: "Identifiable reporter",
        required: "Yes",
        entry: "Yes",
        evidence: `Qualification ${row.Reporter}. Contact details are unknown.`,
      },
      {
        field: "Suspect product",
        required: "Yes",
        entry: "Yes",
        evidence: `${row.SuspectProduct}, ${row.Dose}, ${row.Route}.`,
      },
      {
        field: "Adverse event",
        required: "Yes",
        entry: "Yes",
        evidence: row.Reaction,
      },
      {
        field: "Chronology",
        required: "No",
        entry: "Interval known",
        evidence: `Onset ${row.OnsetDays} day(s) after treatment began. Calendar date uses the training anchor.`,
      },
      {
        field: "Seriousness",
        required: "No",
        entry: row.Seriousness,
        evidence: `Regulatory category: ${regulatorySerious}.`,
      },
      {
        field: "Outcome",
        required: "No",
        entry: outcome.full,
        evidence: outcomeSentence(row.Narrative),
      },
    ],
    classificationLead: "These notes record why each field was completed, and which source limits still apply.",
    rationale: [
      `Patient initials ${initials} are a training code. Age is ${row.Age} years. Sex is ${row.Sex}.`,
      `Reporter qualification is ${row.Reporter}. Name, organisation, and contact details are unknown.`,
      `Suspect product is ${row.SuspectProduct}, ${row.Dose}, ${row.Route}, for ${row.Indication}.`,
      `The reported reaction is ${row.Reaction}. Onset is ${onsetLabel}. On the training calendar the reaction start date is ${reactionStart}. Outcome is ${outcome.full}.`,
      `Source seriousness is ${row.Seriousness}, so the regulatory category is ${regulatorySerious}. Severity is unknown.`,
      `Dechallenge code is ${row.Dechallenge}. Rechallenge code is ${row.Rechallenge}. Expectedness reference is ${row.ExpectednessReference}, recorded as ${expectednessValue(row.ExpectednessReference)}.`,
    ],
    limitations: [
      "This is a fictional, de-identified training record for intake practice.",
      `The training calendar sets treatment Day 0 at ${TRAINING_DAY_ZERO_LABEL}. The source gave the onset interval in days.`,
      "Treatment was stopped. The stop date is unknown.",
      "Medical history is unknown. The indication is stored with the suspect drug.",
      "Dose and indication are the source values, including values that are atypical for the product.",
      "Reporter contact details are unknown.",
      "No causality assessment was performed. This report does not establish that the product caused the event.",
    ],
  };
}

export function buildReports(csvText: string): Report[] {
  return parseCsv(csvText).map((record, index) => buildReport(requireRow(record, index)));
}

export function assertReports(reports: Report[]): void {
  if (reports.length !== 18) {
    throw new Error(`Expected 18 reports and found ${reports.length}.`);
  }
  const ids = new Set(reports.map((report) => report.caseId));
  for (let number = 7; number <= 24; number += 1) {
    const caseId = `SYN-PV-${String(number).padStart(3, "0")}`;
    if (!ids.has(caseId)) throw new Error(`Missing ${caseId}.`);
  }

  for (const report of reports) {
    const letter = report.patient.sex === "Male" ? "M" : report.patient.sex === "Female" ? "F" : "U";
    if (report.patient.initials !== `${letter}${report.caseId.slice(-2)}`) {
      throw new Error(`${report.caseId} initials do not match the training code.`);
    }
    if (!/^\d+$/.test(report.patient.ageYears)) throw new Error(`${report.caseId} age is empty.`);
    if (!report.suspect.name) throw new Error(`${report.caseId} has no suspect drug.`);
    if (!/^\d{2} [A-Z][a-z]{2} \d{4}$/.test(report.reaction.startDate)) {
      throw new Error(`${report.caseId} reaction start date is not formatted.`);
    }
    const startUtc = Date.UTC(
      Number(report.reaction.startDate.slice(-4)),
      MONTHS.indexOf(report.reaction.startDate.slice(3, 6) as (typeof MONTHS)[number]),
      Number(report.reaction.startDate.slice(0, 2)),
    );
    const diff = Math.round((startUtc - TRAINING_DAY_ZERO_UTC) / 86400000);
    if (diff !== report.reaction.onsetDays) {
      throw new Error(`${report.caseId} reaction date does not preserve the onset interval.`);
    }
    if (/not recovered/i.test(report.reaction.narrative) && report.reaction.outcomeShort !== "Not recovered") {
      throw new Error(`${report.caseId} outcome missed "not recovered".`);
    }
    if (
      !/not recovered/i.test(report.reaction.narrative) &&
      /recovering/i.test(report.reaction.narrative) &&
      report.reaction.outcomeShort !== "Recovering"
    ) {
      throw new Error(`${report.caseId} outcome missed "recovering".`);
    }
    if (/was recovered/i.test(report.reaction.narrative) && report.reaction.outcomeShort !== "Recovered") {
      throw new Error(`${report.caseId} outcome missed "recovered".`);
    }
    if (!report.reaction.narrative.includes(report.suspect.name)) {
      throw new Error(`${report.caseId} narrative does not name the suspect drug.`);
    }
    if (!report.reaction.narrative.includes(report.reaction.term)) {
      throw new Error(`${report.caseId} narrative does not name the reaction.`);
    }
    const yes = report.reaction.criteria.filter((item) => item.value === "Yes").map((item) => item.label);
    if (report.reaction.seriousness === "Hospitalisation" && yes.join("|") !== "Hospitalisation") {
      throw new Error(`${report.caseId} hospitalisation criterion is wrong.`);
    }
    if (
      report.reaction.seriousness === "Medically important" &&
      yes.join("|") !== "Other medically important condition"
    ) {
      throw new Error(`${report.caseId} medically important criterion is wrong.`);
    }
    if (report.reaction.seriousness === "Not serious" && yes.length !== 0) {
      throw new Error(`${report.caseId} marked a seriousness criterion on a non-serious case.`);
    }
    if (report.reaction.regulatorySerious === "Serious" && report.reaction.seriousness === "Not serious") {
      throw new Error(`${report.caseId} seriousness category conflicts.`);
    }
    if (report.suspect.expectednessReference === "Known" && report.suspect.expectedness !== "Expected") {
      throw new Error(`${report.caseId} expectedness mapping is wrong.`);
    }
    if (report.suspect.expectednessReference === "Unexpected" && report.suspect.expectedness !== "Unexpected") {
      throw new Error(`${report.caseId} unexpected mapping is wrong.`);
    }
    if (report.concomitantSource === "None reported" && report.concomitant.length !== 0) {
      throw new Error(`${report.caseId} invented a concomitant medicine.`);
    }
    if (report.concomitantSource !== "None reported" && report.concomitant[0]?.name !== report.concomitantSource) {
      throw new Error(`${report.caseId} dropped a concomitant medicine.`);
    }
    if (report.patient.weight !== "Unknown" || report.history.startsWith("Unknown") === false) {
      throw new Error(`${report.caseId} filled an unknown field.`);
    }
  }
}
