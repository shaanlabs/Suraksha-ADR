import csvText from "../data/intake_cases.csv?raw";
import { assertReports, buildReports, type Report } from "./model";

export const reports: Report[] = buildReports(csvText);
assertReports(reports);

export function getReport(caseId: string): Report | undefined {
  return reports.find((report) => report.caseId === caseId);
}
