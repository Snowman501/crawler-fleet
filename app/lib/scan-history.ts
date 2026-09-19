export type ScanHistoryItem = {
  url: string;
  title: string;
  checked_at: string;
  score: number;
  total: number;
  missing: string[];
};

const HISTORY_KEY = "crawler-fleet.scan-history";
const HISTORY_LIMIT = 12;

export function summarizeReportForHistory(report: {
  url: string;
  title: string;
  checked_at: string;
  team_summary: Record<string, { passed: number; total: number; missing: string[] }>;
}): ScanHistoryItem {
  const summaries = Object.values(report.team_summary);
  return {
    url: report.url,
    title: report.title || "Untitled page",
    checked_at: report.checked_at,
    score: summaries.reduce((total, summary) => total + summary.passed, 0),
    total: summaries.reduce((total, summary) => total + summary.total, 0),
    missing: summaries.flatMap((summary) => summary.missing),
  };
}

export function readScanHistory() {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const parsed = JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as ScanHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveScanHistoryItem(item: ScanHistoryItem) {
  if (typeof window === "undefined") {
    return [];
  }
  const history = readScanHistory().filter((existing) => existing.url !== item.url);
  const nextHistory = [item, ...history].slice(0, HISTORY_LIMIT);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
  window.dispatchEvent(new Event("crawler-fleet:history-updated"));
  return nextHistory;
}

export function clearScanHistory() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(HISTORY_KEY);
  window.dispatchEvent(new Event("crawler-fleet:history-updated"));
}
