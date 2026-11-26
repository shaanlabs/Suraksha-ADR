import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Report } from "./model";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 40;
const BOTTOM = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;

const INK = rgb(18 / 255, 20 / 255, 26 / 255);
const MUTED = rgb(106 / 255, 114 / 255, 130 / 255);
const LINE = rgb(229 / 255, 231 / 255, 235 / 255);
const WASH = rgb(228 / 255, 232 / 255, 239 / 255);
const WHITE = rgb(1, 1, 1);
const SOFT = rgb(0.89, 0.91, 0.94);

function pdfSafe(value: string): string {
  return value.replace(/\s+/g, " ").replace(/[^\x20-\x7E]/g, "").trim();
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const clean = pdfSafe(text);
  if (!clean) return [""];
  const words = clean.split(" ");
  const lines: string[] = [];
  let line = "";

  const pushWord = (word: string) => {
    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      line = word;
      return;
    }
    let chunk = "";
    for (const character of word) {
      const trial = chunk + character;
      if (chunk && font.widthOfTextAtSize(trial, size) > maxWidth) {
        lines.push(chunk);
        chunk = character;
      } else {
        chunk = trial;
      }
    }
    line = chunk;
  };

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      pushWord(word);
    }
  }
  if (line) lines.push(line);
  return lines.length > 0 ? lines : [""];
}

class FormDocument {
  private page: PDFPage;
  private readonly pages: PDFPage[] = [];
  private y = PAGE_H;

  constructor(
    private readonly doc: PDFDocument,
    private readonly font: PDFFont,
    private readonly bold: PDFFont,
    private readonly serif: PDFFont,
    private readonly footerId: string,
  ) {
    this.page = doc.addPage([PAGE_W, PAGE_H]);
    this.pages.push(this.page);
  }

  banner(kicker: string, title: string, subtitle: string, meta: string): void {
    this.page.drawRectangle({ x: 0, y: PAGE_H - 98, width: PAGE_W, height: 98, color: INK });
    this.page.drawText(pdfSafe(kicker), {
      x: MARGIN,
      y: PAGE_H - 28,
      size: 9,
      font: this.bold,
      color: WHITE,
    });
    const metaText = pdfSafe(meta);
    const metaWidth = this.bold.widthOfTextAtSize(metaText, 10);
    this.page.drawText(metaText, {
      x: PAGE_W - MARGIN - metaWidth,
      y: PAGE_H - 28,
      size: 10,
      font: this.bold,
      color: WHITE,
    });
    this.page.drawText(pdfSafe(title), {
      x: MARGIN,
      y: PAGE_H - 54,
      size: 18,
      font: this.serif,
      color: WHITE,
    });
    this.page.drawText(pdfSafe(subtitle), {
      x: MARGIN,
      y: PAGE_H - 76,
      size: 9,
      font: this.font,
      color: SOFT,
    });
    this.y = PAGE_H - 120;
  }

  mandates(items: { label: string; value: string }[]): void {
    const gap = 6;
    const boxWidth = (CONTENT_W - gap * (items.length - 1)) / items.length;
    const boxHeight = 50;
    this.ensure(boxHeight + 14);
    this.page.drawText("Mandatory fields", {
      x: MARGIN,
      y: this.y - 10,
      size: 8,
      font: this.bold,
      color: MUTED,
    });
    this.y -= 16;
    items.forEach((item, index) => {
      const x = MARGIN + index * (boxWidth + gap);
      this.page.drawRectangle({
        x,
        y: this.y - boxHeight,
        width: boxWidth,
        height: boxHeight,
        borderColor: LINE,
        borderWidth: 0.8,
      });
      this.page.drawText(pdfSafe(item.label), {
        x: x + 6,
        y: this.y - 14,
        size: 7,
        font: this.bold,
        color: MUTED,
      });
      wrap(item.value, this.bold, 9, boxWidth - 12)
        .slice(0, 2)
        .forEach((line, lineIndex) => {
          this.page.drawText(line, {
            x: x + 6,
            y: this.y - 28 - lineIndex * 11,
            size: 9,
            font: this.bold,
            color: INK,
          });
        });
    });
    this.y -= boxHeight + 12;
  }

  section(title: string): void {
    this.ensure(32);
    this.y -= 6;
    this.page.drawRectangle({
      x: MARGIN,
      y: this.y - 18,
      width: CONTENT_W,
      height: 18,
      color: WASH,
    });
    this.page.drawText(pdfSafe(title), {
      x: MARGIN + 8,
      y: this.y - 13,
      size: 9,
      font: this.bold,
      color: INK,
    });
    this.y -= 28;
  }

  fields(left: { label: string; value: string }, right?: { label: string; value: string }): void {
    const columnWidth = (CONTENT_W - 18) / 2;
    const leftLines = wrap(left.value, this.font, 10, columnWidth);
    const rightLines = right ? wrap(right.value, this.font, 10, columnWidth) : [];
    const lineCount = Math.max(leftLines.length, rightLines.length, 1);
    const height = 22 + lineCount * 12;
    this.ensure(height);
    this.drawField(left.label, leftLines, MARGIN, columnWidth);
    if (right) this.drawField(right.label, rightLines, MARGIN + columnWidth + 18, columnWidth);
    this.y -= height;
  }

  note(text: string): void {
    const lines = wrap(text, this.font, 8, CONTENT_W);
    this.ensure(lines.length * 11 + 2);
    lines.forEach((line, index) => {
      this.page.drawText(line, {
        x: MARGIN,
        y: this.y - 9 - index * 11,
        size: 8,
        font: this.font,
        color: MUTED,
      });
    });
    this.y -= lines.length * 11 + 6;
  }

  body(text: string): void {
    const lines = wrap(text, this.font, 10, CONTENT_W);
    this.ensure(lines.length * 13 + 2);
    lines.forEach((line, index) => {
      this.page.drawText(line, {
        x: MARGIN,
        y: this.y - 11 - index * 13,
        size: 10,
        font: this.font,
        color: INK,
      });
    });
    this.y -= lines.length * 13 + 8;
  }

  narrative(text: string): void {
    const lines = wrap(text, this.font, 10, CONTENT_W - 20);
    const height = lines.length * 13 + 16;
    this.ensure(height + 4);
    this.page.drawRectangle({
      x: MARGIN,
      y: this.y - height,
      width: CONTENT_W,
      height,
      borderColor: LINE,
      borderWidth: 0.8,
    });
    lines.forEach((line, index) => {
      this.page.drawText(line, {
        x: MARGIN + 10,
        y: this.y - 16 - index * 13,
        size: 10,
        font: this.font,
        color: INK,
      });
    });
    this.y -= height + 8;
  }

  checks(items: { label: string; value: string }[]): void {
    for (const item of items) {
      this.ensure(18);
      this.page.drawText(pdfSafe(item.label), {
        x: MARGIN,
        y: this.y - 12,
        size: 10,
        font: this.font,
        color: INK,
      });
      const value = pdfSafe(item.value);
      const width = this.bold.widthOfTextAtSize(value, 10);
      this.page.drawText(value, {
        x: MARGIN + CONTENT_W - width,
        y: this.y - 12,
        size: 10,
        font: this.bold,
        color: INK,
      });
      this.page.drawLine({
        start: { x: MARGIN, y: this.y - 18 },
        end: { x: MARGIN + CONTENT_W, y: this.y - 18 },
        thickness: 0.4,
        color: LINE,
      });
      this.y -= 18;
    }
    this.y -= 6;
  }

  bullets(items: string[]): void {
    for (const item of items) {
      const lines = wrap(item, this.font, 9.5, CONTENT_W - 14);
      this.ensure(lines.length * 12 + 3);
      this.page.drawText("-", {
        x: MARGIN,
        y: this.y - 10,
        size: 10,
        font: this.font,
        color: INK,
      });
      lines.forEach((line, index) => {
        this.page.drawText(line, {
          x: MARGIN + 12,
          y: this.y - 10 - index * 12,
          size: 9.5,
          font: this.font,
          color: INK,
        });
      });
      this.y -= lines.length * 12 + 4;
    }
  }

  table(headers: string[], rows: string[][], widths: number[]): void {
    const drawRow = (cells: string[], header: boolean) => {
      const font = header ? this.bold : this.font;
      const wrapped = cells.map((cell, index) => wrap(cell, font, 8, widths[index] - 8));
      const lineCount = Math.max(...wrapped.map((lines) => lines.length));
      const height = lineCount * 10 + 8;
      this.ensure(height);
      if (header) {
        this.page.drawRectangle({
          x: MARGIN,
          y: this.y - height,
          width: CONTENT_W,
          height,
          color: WASH,
        });
      }
      let x = MARGIN;
      wrapped.forEach((lines, index) => {
        lines.forEach((line, lineIndex) => {
          this.page.drawText(line, {
            x: x + 4,
            y: this.y - 12 - lineIndex * 10,
            size: 8,
            font,
            color: header ? MUTED : INK,
          });
        });
        x += widths[index];
      });
      this.page.drawLine({
        start: { x: MARGIN, y: this.y - height },
        end: { x: MARGIN + CONTENT_W, y: this.y - height },
        thickness: 0.4,
        color: LINE,
      });
      this.y -= height;
    };

    drawRow(headers, true);
    rows.forEach((row) => drawRow(row, false));
    this.y -= 8;
  }

  stamp(): void {
    const total = this.pages.length;
    this.pages.forEach((page, index) => {
      page.drawLine({
        start: { x: MARGIN, y: 42 },
        end: { x: PAGE_W - MARGIN, y: 42 },
        thickness: 0.4,
        color: LINE,
      });
      page.drawText("Synthetic training record. Not for regulatory submission or clinical care.", {
        x: MARGIN,
        y: 26,
        size: 8,
        font: this.font,
        color: MUTED,
      });
      const label = `${this.footerId}    ${index + 1} / ${total}`;
      const width = this.font.widthOfTextAtSize(label, 8);
      page.drawText(label, {
        x: PAGE_W - MARGIN - width,
        y: 26,
        size: 8,
        font: this.font,
        color: MUTED,
      });
    });
  }

  private drawField(label: string, lines: string[], x: number, width: number): void {
    this.page.drawText(pdfSafe(label), {
      x,
      y: this.y - 10,
      size: 8,
      font: this.bold,
      color: MUTED,
    });
    lines.forEach((line, index) => {
      this.page.drawText(line, {
        x,
        y: this.y - 24 - index * 12,
        size: 10,
        font: this.font,
        color: INK,
      });
    });
    void width;
  }

  private ensure(height: number): void {
    if (this.y - height >= BOTTOM) return;
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.pages.push(this.page);
    this.page.drawText(pdfSafe(`${this.footerId} continued`), {
      x: MARGIN,
      y: PAGE_H - 32,
      size: 9,
      font: this.bold,
      color: INK,
    });
    this.page.drawLine({
      start: { x: MARGIN, y: PAGE_H - 40 },
      end: { x: PAGE_W - MARGIN, y: PAGE_H - 40 },
      thickness: 0.6,
      color: LINE,
    });
    this.y = PAGE_H - 56;
  }
}

async function openForm(
  serifBytes: ArrayBuffer | Uint8Array,
  footerId: string,
): Promise<{ doc: PDFDocument; form: FormDocument }> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let serif = await doc.embedFont(StandardFonts.TimesRomanBold);
  try {
    const fontkit = (await import("@pdf-lib/fontkit")).default;
    doc.registerFontkit(fontkit as Parameters<PDFDocument["registerFontkit"]>[0]);
    serif = await doc.embedFont(serifBytes, { subset: true });
  } catch (error) {
    console.warn("Heading font fell back to Times.", error);
  }
  return { doc, form: new FormDocument(doc, font, bold, serif, footerId) };
}

function describe(doc: PDFDocument, title: string): void {
  doc.setTitle(title);
  doc.setAuthor("Suraksha Drug Safety");
  doc.setSubject("Synthetic training record. Not for regulatory submission or clinical care.");
  doc.setCreator("Suraksha Drug Safety");
  doc.setCreationDate(new Date(Date.UTC(2026, 10, 26)));
}

function drawReport(form: FormDocument, report: Report): void {
  form.banner(
    "SURAKSHA DRUG SAFETY",
    "Suspected adverse drug reaction report",
    "Yellow Card and MedWatch structure  |  Training record",
    report.caseId,
  );
  form.mandates([
    { label: "Patient initials", value: report.patient.initials },
    { label: "Age", value: `${report.patient.ageYears} years` },
    { label: "Suspect drug", value: report.suspect.name },
    { label: "Reaction start", value: report.reaction.startDate },
    { label: "Outcome", value: report.reaction.outcomeShort },
  ]);

  form.section("A    Patient information");
  form.fields(
    { label: "Patient initials", value: report.patient.initials },
    { label: "Age", value: `${report.patient.ageYears} years` },
  );
  form.note(report.patient.initialsEvidence);
  form.fields(
    { label: "Sex", value: report.patient.sex },
    { label: "Weight", value: report.patient.weight },
  );
  form.fields(
    { label: "Height", value: report.patient.height },
    { label: "Ethnicity", value: report.patient.ethnicity },
  );
  form.fields(
    { label: "Pregnant", value: report.patient.pregnant },
    { label: "Report receipt date", value: "Unknown" },
  );

  form.section("B    Adverse reaction");
  form.fields(
    { label: "Reaction", value: report.reaction.term },
    { label: "Outcome", value: report.reaction.outcome },
  );
  form.note(report.reaction.outcomeEvidence);
  form.fields(
    { label: "Reaction start date", value: report.reaction.startDate },
    { label: "Onset", value: report.reaction.onsetLabel },
  );
  form.note(report.reaction.startEvidence);
  form.fields(
    { label: "Source seriousness", value: report.reaction.seriousness },
    { label: "Regulatory seriousness", value: report.reaction.regulatorySerious },
  );
  form.fields({ label: "Severity", value: report.reaction.severity });
  form.note("Reaction narrative, copied from the source");
  form.narrative(report.reaction.narrative);

  form.section("C    Suspect drug");
  form.fields(
    { label: "Suspect drug", value: report.suspect.name },
    { label: "Dose", value: report.suspect.dose },
  );
  form.fields(
    { label: "Route", value: report.suspect.route },
    { label: "Indication", value: report.suspect.indication },
  );
  form.note("Dose, route, and indication are transcribed as reported.");
  form.fields(
    { label: "Treatment start", value: report.suspect.startDate },
    { label: "Treatment stop", value: report.suspect.stopDate },
  );
  form.note(report.suspect.stopEvidence);
  form.fields(
    { label: "Action taken", value: report.suspect.actionTaken },
    { label: "Batch / lot", value: report.suspect.batch },
  );
  form.fields(
    { label: "Manufacturer", value: report.suspect.manufacturer },
    { label: "Expectedness", value: report.suspect.expectedness },
  );
  form.note(report.suspect.expectednessEvidence);
  form.fields(
    { label: "Dechallenge", value: report.suspect.dechallenge },
    { label: "Rechallenge", value: report.suspect.rechallenge },
  );
  form.note(`${report.suspect.dechallengeEvidence} ${report.suspect.rechallengeEvidence}`);

  form.section("D    Concomitant medicines");
  form.body(report.concomitantStatement);
  if (report.concomitant.length > 0) {
    const medicine = report.concomitant[0];
    form.fields(
      { label: "Medicine", value: medicine.name },
      { label: "Dose", value: medicine.dose },
    );
    form.fields(
      { label: "Route", value: medicine.route },
      { label: "Indication", value: medicine.indication },
    );
  }

  form.section("E    Relevant medical history");
  form.body(report.history);

  form.section("F    Reporter");
  form.fields(
    { label: "Qualification", value: report.reporter.qualification },
    { label: "Name", value: report.reporter.name },
  );
  form.fields(
    { label: "Organisation", value: report.reporter.organisation },
    { label: "Contact", value: report.reporter.contact },
  );
  form.note(report.reporter.evidence);
  form.fields(
    { label: "Form prepared", value: report.formPrepared },
    { label: "Case identifier", value: report.caseId },
  );

  form.section("G    Seriousness criteria");
  form.note(report.reaction.criteriaNote);
  form.checks(report.reaction.criteria);

  form.section("H    Case validity");
  form.note(report.validityNote);
  form.table(
    ["Field", "Required", "Entry", "Source evidence"],
    report.validity.map((row) => [row.field, row.required, row.entry, row.evidence]),
    [110, 58, 92, CONTENT_W - 260],
  );

  form.section("I    Classification, rationale, and limitations");
  form.body(report.classificationLead);
  form.bullets(report.rationale);
  form.note("Limitations");
  form.bullets(report.limitations);
}

export async function renderReportPdf(
  report: Report,
  serifBytes: ArrayBuffer | Uint8Array,
): Promise<Uint8Array> {
  const { doc, form } = await openForm(serifBytes, report.caseId);
  drawReport(form, report);
  form.stamp();
  describe(doc, `${report.caseId} suspected ADR report`);
  return doc.save();
}

export async function renderIndexPdf(
  reports: Report[],
  serifBytes: ArrayBuffer | Uint8Array,
): Promise<Uint8Array> {
  const { doc, form } = await openForm(serifBytes, "Pack index");
  form.banner(
    "SURAKSHA DRUG SAFETY",
    "Completed ADR reporting pack",
    `${reports.length} Yellow Card and MedWatch style training forms`,
    reports[0]?.formPrepared ?? "",
  );
  form.body(
    "Each following report completes patient initials, age, suspect drug, reaction start date, and outcome. Facts the source left out stay unknown. Counts in this pack are report totals. They are not incidence, and they are not evidence of causation.",
  );
  const fixed = [68, 88, 88, 96, 90];
  form.table(
    ["Case", "Patient", "Suspect drug", "Reaction", "Seriousness", "Outcome"],
    reports.map((report) => [
      report.caseId,
      `${report.patient.initials}, ${report.patient.ageYears}y, ${report.patient.sex}`,
      report.suspect.name,
      report.reaction.term,
      report.reaction.seriousness,
      report.reaction.outcomeShort,
    ]),
    [...fixed, CONTENT_W - fixed.reduce((sum, width) => sum + width, 0)],
  );
  form.note("Individual reports follow in case-number order.");
  form.stamp();
  describe(doc, "Suraksha ADR reporting pack index");
  return doc.save();
}

export async function renderPackPdf(
  reports: Report[],
  serifBytes: ArrayBuffer | Uint8Array,
): Promise<Uint8Array> {
  if (reports.length === 0) throw new Error("No cases to render.");
  const pack = await PDFDocument.create();
  const chunks = [await renderIndexPdf(reports, serifBytes)];
  for (const report of reports) chunks.push(await renderReportPdf(report, serifBytes));
  for (const bytes of chunks) {
    const source = await PDFDocument.load(bytes);
    const pages = await pack.copyPages(source, source.getPageIndices());
    pages.forEach((page) => pack.addPage(page));
  }
  describe(pack, "Suraksha ADR reporting pack");
  return pack.save();
}
