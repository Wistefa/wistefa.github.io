# 💼 FreelancerCRM

Einfaches CRM für Freelancer — Kundenprojekte, Kontakte und Aufgaben verwalten.

**Live:** https://wistefa.github.io/freelancer-crm  
**Teil von:** https://wistefa.github.io

## Features

- Kunden und Kontakte erfassen
- Projekte mit Status, Stundensatz, Budget
- Aufgaben-Tracking
- Auto-Save in localStorage
- WS Datenpool: automatischer Sync bei Datenänderung (falls verbunden)

## Datenpool

Der ☁️-Button unten rechts verbindet die App mit dem WS Datenpool-Ordner (FileSystem Access API). Bei Verbindung werden Änderungen automatisch als `daten.json` gesichert und beim nächsten Öffnen wiederhergestellt.

## Technik

- React (CDN/Babel), reines HTML, kein Build-Prozess, kein Service Worker
- localStorage für Datenpersistenz
