"use client";

import { useEffect, useState } from "react";
import { clearScanHistory, readScanHistory, ScanHistoryItem } from "../lib/scan-history";

export default function ScanHistoryPanel() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  useEffect(() => {
    function loadHistory() {
      setHistory(readScanHistory());
    }
    loadHistory();
    window.addEventListener("storage", loadHistory);
    window.addEventListener("crawler-fleet:history-updated", loadHistory);
    return () => {
      window.removeEventListener("storage", loadHistory);
      window.removeEventListener("crawler-fleet:history-updated", loadHistory);
    };
  }, []);

  return (
    <section className="panel">
      <div className="section-head split-head">
        <div>
          <p className="eyebrow">Scan History</p>
          <h2>Recent browser checks</h2>
        </div>
        {history.length ? (
          <button className="secondary-button compact-button" type="button" onClick={clearScanHistory}>
            Clear
          </button>
        ) : null}
      </div>

      {history.length ? (
        <div className="history-list">
          {history.map((item) => (
            <article className="history-card" key={`${item.url}-${item.checked_at}`}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.url}</p>
              </div>
              <div className="history-meta">
                <strong>
                  {item.score}/{item.total}
                </strong>
                <span>{new Date(item.checked_at).toLocaleString()}</span>
              </div>
              <p>{item.missing.length ? `Missing: ${item.missing.join(", ")}` : "No missing checks detected."}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-state">Run a check from this browser and it will appear here.</p>
      )}
    </section>
  );
}
