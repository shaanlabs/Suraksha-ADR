import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { downloadBytes } from "../lib/download";
import { loadSerifFont } from "../lib/font";
import type { Report } from "../lib/model";
import { renderPackPdf } from "../lib/pdf";
import { reports } from "../lib/reports";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "serious", label: "Serious" },
  { id: "not-serious", label: "Not serious" },
  { id: "hospitalisation", label: "Hospitalisation" },
  { id: "important", label: "Medically important" },
  { id: "physician", label: "Physician" },
  { id: "pharmacist", label: "Pharmacist" },
  { id: "consumer", label: "Consumer" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

function matches(report: Report, filter: FilterId, query: string): boolean {
  const haystack = [
    report.caseId,
    report.suspect.name,
    report.reaction.term,
    report.patient.sex,
    report.reporter.qualification,
  ]
    .join(" ")
    .toLowerCase();
  if (query.trim() && !haystack.includes(query.trim().toLowerCase())) return false;
  if (filter === "serious") return report.reaction.regulatorySerious === "Serious";
  if (filter === "not-serious") return report.reaction.regulatorySerious === "Not serious";
  if (filter === "hospitalisation") return report.reaction.seriousness === "Hospitalisation";
  if (filter === "important") return report.reaction.seriousness === "Medically important";
  if (filter === "physician") return report.reporter.qualification === "Physician";
  if (filter === "pharmacist") return report.reporter.qualification === "Pharmacist";
  if (filter === "consumer") return report.reporter.qualification === "Consumer";
  return true;
}

function outcomeClass(outcome: string): string {
  if (outcome === "Recovered") return "outcome-recovered";
  if (outcome === "Recovering") return "outcome-recovering";
  return "";
}

export function HomePage() {
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Suraksha — ADR reports";
  }, []);

  const visible = useMemo(
    () => reports.filter((report) => matches(report, filter, query)),
    [filter, query],
  );

  async function onDownloadPack() {
    setBusy(true);
    setError("");
    try {
      const font = await loadSerifFont();
      const bytes = await renderPackPdf(reports, font);
      downloadBytes("SURAKSHA-ADR-Reporting-Pack.pdf", bytes, "application/pdf");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The PDF pack could not be created.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap page">
      <section className="hero">
        <p className="kicker">Pharmacovigilance safety intake</p>
        <h1>Complete the adverse reaction report.</h1>
        <p className="lede">
          A Yellow Card and MedWatch style intake for every case in the Suraksha synthetic pack. The five
          mandatory fields are filled, and source gaps stay unknown.
        </p>
        <div className="hero-actions">
          <Link to="/cases/SYN-PV-007" className="btn btn-primary">
            Open SYN-PV-007
          </Link>
          <button type="button" className="btn btn-secondary" onClick={onDownloadPack} disabled={busy}>
            {busy ? "Preparing PDF pack" : "Download PDF pack"}
          </button>
        </div>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="search-row">
          <label className="sr-only" htmlFor="case-search">
            Search cases
          </label>
          <input
            id="case-search"
            className="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search case, drug, or reaction"
            autoComplete="off"
          />
        </div>
      </section>

      <div className="filters" role="toolbar" aria-label="Filter reports">
        {FILTERS.map((item) => {
          const count = reports.filter((report) => matches(report, item.id, query)).length;
          return (
            <button
              key={item.id}
              type="button"
              className={filter === item.id ? "chip chip-active" : "chip"}
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
              <span>{count}</span>
            </button>
          );
        })}
      </div>

      <p className="count">
        {visible.length} reports in view. Counts are pack totals, not incidence, and they are not evidence of
        causation.
      </p>

      {visible.length === 0 ? (
        <p className="empty">No report matches that search.</p>
      ) : (
        <div className="grid">
          {visible.map((report) => (
            <Link key={report.caseId} to={`/cases/${report.caseId}`} className="case-card">
              <div className="card-top">
                <span className="case-id">{report.caseId}</span>
                <span className={report.reaction.regulatorySerious === "Serious" ? "pill pill-ink" : "pill"}>
                  {report.reaction.seriousness}
                </span>
              </div>
              <h2>{report.suspect.name}</h2>
              <p className="reaction">{report.reaction.term}</p>
              <p className="meta">
                {report.patient.ageYears} years · {report.patient.sex} · {report.suspect.route}
              </p>
              <p className={`meta ${outcomeClass(report.reaction.outcomeShort)}`}>
                Outcome · {report.reaction.outcomeShort}
              </p>
              <p className="meta">Reporter · {report.reporter.qualification}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
