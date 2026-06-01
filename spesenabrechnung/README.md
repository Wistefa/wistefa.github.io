# 🧾 Spesenabrechnung

Digitale Spesenerfassung für Geschäftsreisen und Ausgaben.

**Live:** https://wistefa.github.io/spesenabrechnung  
**Teil von:** https://wistefa.github.io

## Features

- Spesen erfassen mit Datum, Betrag, Kategorie, Zahlungsart, Projekt/Kostenstelle
- Beleg-Foto anhängen (Kamera oder Galerie)
- Zeitraumfilter (Monat, Vormonat, Jahr, Alle) und Kategorie-Filter
- Summierung nach Kategorie und Zahlungsart
- Export als CSV und PDF
- Speichern/Laden als JSON (WS Datenpool oder direkter Download)
- Auto-Save in localStorage

## Datenpool

Der 💾-Button unten rechts öffnet das Datenpool-Panel:
- **Speichern (JSON):** benannte Datei direkt in verbundenen Datenpool-Ordner oder Download
- **Laden (JSON):** Datei wiederherstellen
- **Mit Datenpool verbinden:** Ordner via FileSystem Access API verknüpfen (Chrome/Edge)

## Technik

- Reines HTML/JS + jsPDF, kein Build-Prozess
- PWA mit Service Worker (v3, skipWaiting aktiv)
- localStorage für Datenpersistenz
