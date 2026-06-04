# ✈️ Reiseplaner

Reisen planen und verwalten — Destinationen, Zeiträume, Aktivitäten und Budget.

**Live:** https://wistefa.github.io/reiseplaner  
**Teil von:** https://wistefa.github.io

## Features

- Reisen anlegen mit Destination, Datum, Budget
- Aktivitäten und Unterkünfte planen
- Packliste
- Auto-Save in localStorage
- **💾 FAB-Button** – Reisedaten mit eigenem Dateinamen als JSON sichern; bei Datenpool-Verbindung direkt in iCloud-Ordner
- **iCloud Datenpool** – automatischer Sync als `daten.json` bei jeder Datenänderung (Chrome/Edge)
- **← Apps** – Zurück zur wistefa.github.io Übersicht

## Datenpool

Der 💾-Button unten rechts öffnet das FAB-Panel. Dateiname vergeben → Speichern schreibt direkt in den verbundenen iCloud-Ordner oder löst einen Download aus. Änderungen werden zusätzlich automatisch als `daten.json` gesichert.

## Technik

- React (CDN/Babel), reines HTML, kein Build-Prozess
- PWA mit Service Worker (v5, skipWaiting aktiv)
- localStorage für Datenpersistenz
