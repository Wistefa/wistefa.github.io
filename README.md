# 🧰 Wilfried's Werkzeugkiste

Persönliche Web-App-Sammlung — gehostet auf GitHub Pages.

**Live:** https://wistefa.github.io  
**GitHub:** https://github.com/Wistefa/wistefa.github.io

## Apps

### 💶 Finanzen & Haushalt
| App | Beschreibung | Link |
|-----|-------------|------|
| [Haushaltsbuch](haushaltsbuch/) | Einnahmen & Ausgaben, Monatssaldo | [→ Live](https://wistefa.github.io/haushaltsbuch) |
| [Spesenabrechnung](spesenabrechnung/) | Geschäftsspesen mit Beleg-Foto, CSV/PDF-Export | [→ Live](https://wistefa.github.io/spesenabrechnung) |
| [Vermögensverwaltung](vermoegen/) | Konten, Depot, Anlagen im Überblick | [→ Live](https://wistefa.github.io/vermoegen) |
| [Versicherungsübersicht](versicherungen/) | Alle Versicherungen auf einen Blick | [→ Live](https://wistefa.github.io/versicherungen) |

### 🎯 Freizeit & Hobby
| App | Beschreibung | Link |
|-----|-------------|------|
| [Münzsammlung](muenzsammlung/) | Münzen erfassen, bewerten und verwalten | [→ Live](https://wistefa.github.io/muenzsammlung) |
| [Reiseplaner](reiseplaner/) | Reisen planen mit Budget und Aktivitäten | [→ Live](https://wistefa.github.io/reiseplaner) |
| [Skat Strichliste](https://wistefa.github.io/skat-strichliste) | 4 Spieler, Geberrotation, Bockrunden | [→ Live](https://wistefa.github.io/skat-strichliste) |

### 💼 Arbeit & Organisation
| App | Beschreibung | Link |
|-----|-------------|------|
| [FreelancerCRM](freelancer-crm/) | Kunden, Projekte und Aufgaben verwalten | [→ Live](https://wistefa.github.io/freelancer-crm) |
| [WS Dashboard](dashboard/) | Options-Trades analysieren (TSV-Import, Charts) | [→ Live](https://wistefa.github.io/dashboard) |

### 🏆 Sport
| App | Beschreibung | Link |
|-----|-------------|------|
| [KVU Storchencup](storchencup/) | Mixed Doppel Turnierverwaltung mit K.o.-Phase | [→ Live](https://wistefa.github.io/storchencup) |

### 🛠️ Tools & Sonstiges
| App | Beschreibung | Link |
|-----|-------------|------|
| [Drohnenshow](drohnenshow/) | Formationen und Übergänge visualisieren | [→ Live](https://wistefa.github.io/drohnenshow) |
| [Einmaleins](einmaleins/) | Interaktives Mathe-Lernspiel für Kinder | [→ Live](https://wistefa.github.io/einmaleins) |
| [Fitness-App](fitness-app/) | Tägliches 40-Minuten-Programm in 5 Bereichen | [→ Live](https://wistefa.github.io/fitness-app) |
| [Meine Rezepte](rezepte/) | Persönliche Rezeptverwaltung (PWA) | [→ Live](https://wistefa.github.io/rezepte) |
| [SmartCut Video](video/) | Video-Schnitt Mockup | [→ Live](https://wistefa.github.io/video) |

## WS Datenpool

Fünf Apps (Haushaltsbuch, Spesenabrechnung, Vermögen, Versicherungen, Münzsammlung) unterstützen den **WS Datenpool**: ein lokaler Ordner (z.B. iCloud) wird per FileSystem Access API verknüpft. Daten werden automatisch als JSON gesichert und beim nächsten Öffnen wiederhergestellt. Funktioniert in Chrome und Edge.

## Technik

- Alle Apps: reines HTML/JS, kein zentrales Build-System
- Deployment: GitHub Pages (automatisch bei Push auf `main`)
- PWA-fähige Apps: Haushaltsbuch, Spesenabrechnung, Münzsammlung, Rezepte, Reiseplaner
