# 💰 Vermögensverwaltung

Übersicht über Vermögenswerte, Konten und Anlagen.

**Live:** https://wistefa.github.io/vermoegen  
**Teil von:** https://wistefa.github.io

## Features

- Vermögenswerte erfassen (Konten, Depot, Immobilien, Sonstiges)
- Gesamtvermögen-Berechnung
- Entwicklung über Zeit
- Speichern/Laden als JSON (WS Datenpool oder direkter Download)
- Auto-Save in localStorage (verschlüsselt)

## Datenpool

Der 💾-Button unten rechts öffnet das Datenpool-Panel:
- **Speichern (JSON):** benannte Datei direkt in verbundenen Datenpool-Ordner oder Download
- **Laden (JSON):** Datei wiederherstellen
- **Mit Datenpool verbinden:** Ordner via FileSystem Access API verknüpfen (Chrome/Edge)

## Technik

- Reines HTML/JS, kein Build-Prozess, kein Service Worker
- localStorage für Datenpersistenz
