# ✈️ Reiseplaner

Reisen planen und verwalten — Destinationen, Zeiträume, Aktivitäten und Budget.

**Live:** https://wistefa.github.io/reiseplaner  
**Teil von:** https://wistefa.github.io

## Features

- Reisen anlegen mit Destination, Datum, Budget
- Aktivitäten und Unterkünfte planen
- Packliste
- Auto-Save in localStorage
- WS Datenpool: automatischer Sync bei Datenänderung (falls verbunden)

## Datenpool

Der ☁️-Button unten rechts verbindet die App mit dem WS Datenpool-Ordner (FileSystem Access API). Bei Verbindung werden Änderungen automatisch als `daten.json` gesichert und beim nächsten Öffnen wiederhergestellt.

## Technik

- React (CDN/Babel), reines HTML, kein Build-Prozess
- PWA mit Service Worker (v5, skipWaiting aktiv)
- localStorage für Datenpersistenz
