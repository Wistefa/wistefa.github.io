# 🛡️ Versicherungsübersicht

Überblick über alle persönlichen Versicherungen.

**Live:** https://wistefa.github.io/versicherungen  
**Teil von:** https://wistefa.github.io

## Features

- Versicherungen erfassen mit Typ, Anbieter, Beitrag, Fälligkeit, Notizen
- Gesamtkosten-Übersicht (monatlich/jährlich)
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
