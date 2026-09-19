# Crawler Fleet

The first fleet component is an evidence-based website checkup. It inspects one public HTML page and saves a JSON report. It does not contact businesses, charge customers, or claim that a feature is absent from an entire website.

```bash
python -m pip install -r requirements.txt
python fleet.py https://example.com --output report.json
python fleet.py https://example.com --output report.json --text-output report.txt
python -m unittest discover -s tests
```

`crawler.py` is the original local-business prototype; its old scores and outreach drafts are not validated. `fleet.py` does not depend on Ollama. It records the final URL, timestamp, page title, description, team summaries, and six narrowly scoped checks. A request failure produces no speculative report.

The current fleet teams are:

- `technical`: HTTPS and mobile viewport basics.
- `content`: title and meta description basics.
- `trust`: visible contact path on the inspected page.
- `conversion`: form detection on the inspected page.

The JSON report is meant for software. The optional text report is meant for a plain-English customer preview or internal review.

Before accepting arbitrary customer URLs on a public server, isolate outbound network access and defend against DNS rebinding and other server-side request forgery. The hostname checks here are a local CLI safeguard, not a production security boundary. Before selling a report, add browser verification, a clear example, payment fulfillment, support and refund handling, and a review process for uncertain findings.
