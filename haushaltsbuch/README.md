# 📒 Haushaltsbuch

Einfaches Haushaltsbuch zur Einnahmen- und Ausgabenverfolgung.

**Live:** https://wistefa.github.io/haushaltsbuch  
**Teil von:** https://wistefa.github.io

## Features

- Einnahmen und Ausgaben erfassen mit Datum, Kategorie, Betrag, Notiz
- Monatsübersicht und Saldo
- Kategorie-Filter
- Speichern/Laden als JSON (WS Datenpool oder direkter Download)
- Auto-Save in localStorage

## Datenpool

Der 💾-Button unten rechts öffnet das Datenpool-Panel:
- **Speichern (JSON):** benannte Datei direkt in verbundenen Datenpool-Ordner oder Download
- **Laden (JSON):** Datei wiederherstellen
- **Mit Datenpool verbinden:** Ordner via FileSystem Access API verknüpfen (Chrome/Edge)

## Technik

- Reines HTML/JS, kein Build-Prozess
- PWA mit Service Worker (v3, skipWaiting aktiv)
- localStorage für Datenpersistenz
