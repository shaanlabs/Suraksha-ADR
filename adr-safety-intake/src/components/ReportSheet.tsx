import type { ReactNode } from "react";
import type { Report } from "../lib/model";

function Field({
  label,
  value,
  evidence,
  wide = false,
}: {
  label: string;
  value: string;
  evidence?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "field field-wide" : "field"}>
      <dt>{label}</dt>
      <dd>
        {value}
        {evidence ? <span className="evidence">{evidence}</span> : null}
      </dd>
    </div>
  );
}

function Section({ id, index, title, children }: { id: string; index: string; title: string; children: ReactNode }) {
  return (
    <section className="sheet-section" aria-labelledby={id}>
      <h2 id={id}>
        <span className="section-index">{index}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function ReportSheet({ report }: { report: Report }) {
  const medicine = report.concomitant[0];

  return (
    <article className="sheet">
      <header className="sheet-mast">
        <div>
          <p className="sheet-kicker">Suraksha Drug Safety</p>
          <h1>Suspected adverse drug reaction report</h1>
          <p className="sheet-sub">Yellow Card and MedWatch structure. Training record.</p>
        </div>
        <div className="mast-side">
          <p className="mast-id">{report.caseId}</p>
          <p className="mast-date">Prepared {report.formPrepared}</p>
          <span className="mast-flag">{report.reaction.regulatorySerious}</span>
        </div>
      </header>

      <div className="mandate-wrap">
        <p className="block-label">Mandatory fields</p>
        <div className="mandates">
          <div className="mandate">
            <span>Patient initials</span>
            <strong>{report.patient.initials}</strong>
            <em className="done">Completed</em>
          </div>
          <div className="mandate">
            <span>Age</span>
            <strong>{report.patient.ageYears} years</strong>
            <em className="done">Completed</em>
          </div>
          <div className="mandate">
            <span>Suspect drug</span>
            <strong>{report.suspect.name}</strong>
            <em className="done">Completed</em>
          </div>
          <div className="mandate">
            <span>Reaction start date</span>
            <strong>{report.reaction.startDate}</strong>
            <em className="done">Completed</em>
          </div>
          <div className="mandate">
            <span>Outcome</span>
            <strong>{report.reaction.outcomeShort}</strong>
            <em className="done">Completed</em>
          </div>
        </div>
        <dl className="fields admin-fields">
          <Field label="Report receipt date" value="Unknown" evidence="The source does not include a receipt date." />
          <Field
            label="Form prepared"
            value={report.formPrepared}
            evidence="Completion date for this training form."
          />
        </dl>
      </div>

      <div className="sheet-body">
        <Section id="patient-heading" index="A" title="Patient information">
          <dl className="fields">
            <Field label="Patient initials" value={report.patient.initials} evidence={report.patient.initialsEvidence} />
            <Field label="Age" value={`${report.patient.ageYears} years`} evidence="Age recorded in the source." />
            <Field label="Sex" value={report.patient.sex} evidence="Sex recorded in the source." />
            <Field label="Weight" value={report.patient.weight} evidence="Weight was not in the source." />
            <Field label="Height" value={report.patient.height} evidence="Height was not in the source." />
            <Field label="Ethnicity" value={report.patient.ethnicity} evidence="Ethnicity was not in the source." />
            <Field label="Pregnant" value={report.patient.pregnant} evidence="Pregnancy was not in the source." wide />
          </dl>
        </Section>

        <Section id="reaction-heading" index="B" title="Adverse reaction">
          <dl className="fields">
            <Field label="Reaction" value={report.reaction.term} evidence="Reaction term recorded in the source." />
            <Field label="Outcome" value={report.reaction.outcome} evidence={report.reaction.outcomeEvidence} />
            <Field
              label="Reaction start date"
              value={report.reaction.startDate}
              evidence={report.reaction.startEvidence}
            />
            <Field label="Onset" value={report.reaction.onsetLabel} evidence="Onset interval recorded in the source." />
            <Field label="Source seriousness" value={report.reaction.seriousness} />
            <Field label="Regulatory seriousness" value={report.reaction.regulatorySerious} />
            <Field label="Severity" value={report.reaction.severity} wide />
          </dl>
          <p className="section-note">Reaction narrative, copied from the source</p>
          <p className="narrative">{report.reaction.narrative}</p>
        </Section>

        <Section id="drug-heading" index="C" title="Suspect drug">
          <dl className="fields">
            <Field label="Suspect drug" value={report.suspect.name} />
            <Field label="Dose" value={report.suspect.dose} evidence="Dose recorded as reported." />
            <Field label="Route" value={report.suspect.route} />
            <Field label="Indication" value={report.suspect.indication} evidence="Indication recorded as reported." />
            <Field
              label="Treatment start"
              value={report.suspect.startDate}
              evidence="Training Day 0, used so the onset interval has a calendar date."
            />
            <Field label="Treatment stop" value={report.suspect.stopDate} evidence={report.suspect.stopEvidence} />
            <Field
              label="Action taken"
              value={report.suspect.actionTaken}
              evidence="The narrative says treatment was stopped."
            />
            <Field label="Batch / lot" value={report.suspect.batch} />
            <Field label="Manufacturer" value={report.suspect.manufacturer} />
            <Field
              label="Expectedness"
              value={report.suspect.expectedness}
              evidence={report.suspect.expectednessEvidence}
            />
            <Field
              label="Dechallenge"
              value={report.suspect.dechallenge}
              evidence={report.suspect.dechallengeEvidence}
            />
            <Field
              label="Rechallenge"
              value={report.suspect.rechallenge}
              evidence={report.suspect.rechallengeEvidence}
            />
          </dl>
        </Section>

        <Section id="concomitant-heading" index="D" title="Concomitant medicines">
          {medicine ? (
            <dl className="fields">
              <Field
                label="Medicine"
                value={medicine.name}
                evidence="Named in the source. No other product details were provided."
              />
              <Field label="Dose" value={medicine.dose} />
              <Field label="Route" value={medicine.route} />
              <Field label="Indication" value={medicine.indication} />
            </dl>
          ) : (
            <dl className="fields">
              <Field
                label="Concomitant medicines"
                value="None reported"
                evidence="Source field: None reported."
                wide
              />
            </dl>
          )}
        </Section>

        <Section id="history-heading" index="E" title="Relevant medical history">
          <p className="narrative">{report.history}</p>
        </Section>

        <Section id="reporter-heading" index="F" title="Reporter">
          <dl className="fields">
            <Field label="Qualification" value={report.reporter.qualification} evidence={report.reporter.evidence} />
            <Field label="Name" value={report.reporter.name} />
            <Field label="Organisation" value={report.reporter.organisation} />
            <Field label="Contact" value={report.reporter.contact} />
          </dl>
        </Section>

        <Section id="seriousness-heading" index="G" title="Seriousness criteria">
          <p className="section-note">{report.reaction.criteriaNote}</p>
          <ul className="checks">
            {report.reaction.criteria.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <strong className={item.value === "Yes" ? "check-yes" : "check-open"}>{item.value}</strong>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="validity-heading" index="H" title="Case validity">
          <p className="section-note">{report.validityNote}</p>
          <div className="table-wrap">
            <table className="validity">
              <thead>
                <tr>
                  <th scope="col">Field</th>
                  <th scope="col">Required</th>
                  <th scope="col">Entry</th>
                  <th scope="col">Source evidence</th>
                </tr>
              </thead>
              <tbody>
                {report.validity.map((row) => (
                  <tr key={row.field}>
                    <td>{row.field}</td>
                    <td>{row.required}</td>
                    <td>{row.entry}</td>
                    <td>{row.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="notes-heading" index="I" title="Classification, rationale, and limitations">
          <p className="section-note">{report.classificationLead}</p>
          <ol className="notes">
            {report.rationale.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <p className="block-label">Limitations</p>
          <ul className="notes">
            {report.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      </div>
    </article>
  );
}
