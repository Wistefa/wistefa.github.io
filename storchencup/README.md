# 🐣 KVU Storchencup 2026 – Mixed Doppel

Turnierverwaltung für den KVU Storchencup Mixed Doppel.

**Live:** https://wistefa.github.io/storchencup  
**WordPress-Plugin:** ~/Projekte/KVU/plugins/kvu-storchencup/ (Shortcode `[kvu_storchencup]`)  
**GitHub:** https://github.com/Wistefa/kvu-storchencup-plugin

## Features

- Teilnehmer-Verwaltung (Paare)
- Automatische Auslosung
- Rundenspiel R1–R3 mit Zufallspaarung
- K.o.-Phase: Viertelfinale, Halbfinale, Platz 3, Finale
- Einzelwertung
- PDF-Export der Ergebnisse
- Passwortschutz (Einstellungen → KVU Storchencup, Standard: `kVU1906`)
- **💾 FAB-Button** – Turnier mit eigenem Dateinamen als JSON sichern und wiederherstellen; iCloud Datenpool unterstützt (Chrome/Edge)
- **← Apps** – Zurück zur wistefa.github.io Übersicht

## Hinweis

Diese Standalone-Version (`storchencup/index.html`) entspricht der WordPress-Plugin-Version. Änderungen am Plugin im Pfad `~/Projekte/KVU/plugins/kvu-storchencup/` vornehmen und als ZIP deployen.

## Technik

- Reines HTML/JS, kein Build-Prozess, kein Service Worker
