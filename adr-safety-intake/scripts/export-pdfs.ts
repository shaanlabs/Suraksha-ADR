import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";
import { assertReports, buildReports } from "../src/lib/model";
import { renderPackPdf, renderReportPdf } from "../src/lib/pdf";

const root = fileURLToPath(new URL("..", import.meta.url));
const csv = await readFile(path.join(root, "src/data/intake_cases.csv"), "utf8");
const font = await readFile(path.join(root, "src/assets/SourceSerif4-Bold.ttf"));
const reports = buildReports(csv);
assertReports(reports);

const casesDir = path.join(root, "submission", "cases");
await mkdir(casesDir, { recursive: true });

for (const report of reports) {
  const bytes = await renderReportPdf(report, font);
  await writeFile(path.join(casesDir, `${report.caseId}.pdf`), bytes);
  const doc = await PDFDocument.load(bytes);
  console.log(
    `${report.caseId}  ${report.patient.initials}  ${report.patient.ageYears}  ${report.suspect.name}  ${report.reaction.term}  ${report.reaction.startDate}  ${report.reaction.outcomeShort}  pages=${doc.getPageCount()}`,
  );
}

const pack = await renderPackPdf(reports, font);
const packPath = path.join(root, "submission", "SURAKSHA-ADR-Reporting-Pack.pdf");
await writeFile(packPath, pack);
const packDoc = await PDFDocument.load(pack);
console.log(`Pack pages=${packDoc.getPageCount()}  ${packPath}`);
