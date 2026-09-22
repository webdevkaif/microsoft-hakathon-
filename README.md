# FinGuard AI

A full-stack finance copilot prototype for the Track 3: Finance hackathon challenge.

## Run locally

```bash
cd finguard-ai
python3 backend/main.py
```

Open http://localhost:8000

## Included MVP flow

- Financial overview with revenue, expenses, cash and risk KPIs
- AI attention queue for anomalies, cash reserve trajectory and invoice review
- Vendor spend signals
- 90-day cash forecast
- Interactive What-if simulator for expense and sales scenarios
- Invoice intelligence review queue
- JSON API endpoints for summary, forecast, and scenario analysis

The frontend uses vanilla HTML/CSS/JS to keep the prototype dependency-free and the backend uses Python's standard library so it runs in a clean environment.
