# 🍽️ Meine Rezepte

Persönliche Rezeptverwaltung als PWA.

**Live:** https://wistefa.github.io/rezepte  
**Teil von:** https://wistefa.github.io

## Features

- Rezepte erfassen mit Titel, Beschreibung, Zutaten, Zubereitung
- Suche und Kategorien
- Offline-Nutzung via Service Worker
- Datenpersistenz in localStorage + IndexedDB (Fotos/PDFs)
- **💾 FAB-Button** – Vollständiges Backup (inkl. Fotos/PDFs) mit eigenem Dateinamen als JSON; bei Datenpool-Verbindung direkt in iCloud-Ordner
- **iCloud Datenpool** – Backup-Zielordner einmalig verbinden (Chrome/Edge)
- **← Apps** – Zurück zur wistefa.github.io Übersicht

## Datenpool

Der 💾-Button unten rechts öffnet das FAB-Panel. Dateiname vergeben → Speichern exportiert alle Rezepte inkl. Fotos/PDFs. Bei verbundenem Datenpool wird die Datei direkt im iCloud-Ordner gespeichert.

## Technik

- React (CDN/Babel), reines HTML, kein Build-Prozess
- PWA mit Service Worker (v1)
- localStorage für Datenpersistenz
