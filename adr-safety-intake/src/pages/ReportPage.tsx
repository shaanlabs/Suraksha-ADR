import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ReportSheet } from "../components/ReportSheet";
import { downloadBytes } from "../lib/download";
import { loadSerifFont } from "../lib/font";
import { renderReportPdf } from "../lib/pdf";
import { getReport } from "../lib/reports";

export function ReportPage() {
  const { caseId = "" } = useParams();
  const report = getReport(caseId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = report ? `${report.caseId} ADR report` : "Report not found";
  }, [report]);

  if (!report) {
    return (
      <div className="wrap page">
        <h1 className="plain-title">This case is not in the pack.</h1>
        <Link to="/" className="btn btn-primary">
          Back to cases
        </Link>
      </div>
    );
  }

  const current = report;

  async function onDownload() {
    setBusy(true);
    setError("");
    try {
      const font = await loadSerifFont();
      const bytes = await renderReportPdf(current, font);
      downloadBytes(`${current.caseId}-adr-report.pdf`, bytes, "application/pdf");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The PDF could not be created.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap page">
      <div className="toolbar no-print">
        <Link to="/" className="text-link">
          All cases
        </Link>
        <div className="toolbar-actions">
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
            Print
          </button>
          <button type="button" className="btn btn-primary" onClick={onDownload} disabled={busy}>
            {busy ? "Preparing PDF" : "Download PDF"}
          </button>
        </div>
      </div>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <ReportSheet report={current} />
    </div>
  );
}
