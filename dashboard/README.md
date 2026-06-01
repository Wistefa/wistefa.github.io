# 📊 WS Dashboard – Options-Analyse

Analyse-Dashboard für Options-Trades aus Google Sheets (Cash Secured Puts / Covered Calls).

**Live:** https://wistefa.github.io/dashboard  
**Quellcode:** ~/Projekte/WS/WS_Dashboard/ (React/Vite)  
**GitHub:** https://github.com/Wistefa/dashboard

## Features

- TSV-Import: Paste aus Google Sheet oder Datei-Upload
- Aggregation nach Ticker-Symbol, Call/Put getrennt
- KPIs: Gesamt G/V, Prämie, Calls/Puts G/V, Kontrakte, Ticker-Anzahl
- Tabelle: sortierbar, filterbar (Alle/Calls/Puts), Rendite farbkodiert
- Charts: G/V nach Ticker, Rendite % nach Ticker (Recharts)
- Rendite = G/V / (Ø Strike × Kontrakte × 100) × 100

## Datenformat (Google Sheet)

Spalten: Ticker | Aktie | Call/Put | Investment | DateIn | DateOut | Weekly/Monthly | Kaufpreis | Strike | Anzahl | Prämie/Opt | Gebühren | G/V Option

## Technik

- React + Vite, Recharts
- Build: `npm run build` im Quellcode-Verzeichnis, dann Output nach `dashboard/` kopieren
