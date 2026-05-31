# WS Datenpool — Design-Dokument

**Datum:** 2026-05-31  
**Status:** Approved  
**Scope:** 7 Apps auf wistefa.github.io

---

## Ziel

Alle App-Daten auf iCloud Drive im Ordner `WS Datenpool` persistieren. Jede App schreibt bei jeder Änderung automatisch in einen eigenen Unterordner. Beim Öffnen wird automatisch aus dem Datenpool geladen (sofern Berechtigung vorhanden).

---

## Betroffene Apps

| App | Ordner im Datenpool | localStorage-Key | Datentyp |
|---|---|---|---|
| haushaltsbuch | `Haushaltsbuch/` | `haushaltsbuch_v1` | Array (Transaktionen) |
| muenzsammlung | `Münzsammlung/` | `muenzsammlung_v1` | Array (Münzen) |
| spesenabrechnung | `Spesenabrechnung/` | `spesenabrechnung_v1` | Array (Spesen) |
| vermoegen | `Vermögen/` | `vm_data` | Verschlüsselter Blob |
| versicherungen | `Versicherungen/` | `vs_data` | Verschlüsselter Blob |
| reiseplaner | `Reiseplaner/` | `reiseplaner_v1` | Array (Reisen) |
| freelancer-crm | `FreelancerCRM/` | `fcrm-v2` | Objekt `db` (Kunden, Projekte, Rechnungen, …) |

---

## Architektur

### Ansatz: Inline pro App

Jede App bekommt einen selbstständigen `DatenpoolManager`-Block (~80 Zeilen) direkt in ihre `index.html` eingebettet. Kein geteiltes externes Script — jede App bleibt vollständig autark.

### Drei App-spezifische Konstanten (pro App verschieden)

```javascript
const DP_APP  = 'Haushaltsbuch';        // Ordnername in WS Datenpool
const DP_DATA = () => txs;              // Getter: aktuelle App-Daten
const DP_LOAD = (d) => { txs = d; render(); }; // Setter: beim Laden
```

### Kern-Funktionen (identisch in allen 7 Apps)

```javascript
let _dpHandle = null;

async function dpConnect()       // User wählt Ordner, erstellt Unterordner
async function dpSave()          // Schreibt daten.json (fire-and-forget)
async function dpLoad()          // Liest daten.json wenn Berechtigung gilt
function  dpUpdateUI(connected)  // FAB-Status aktualisieren
async function dpInit()          // Startup: Handle aus IndexedDB + ggf. laden
```

---

## Ordnerstruktur

```
~/Library/Mobile Documents/com~apple~CloudDocs/WS Datenpool/
  Haushaltsbuch/      daten.json
  Münzsammlung/       daten.json
  Spesenabrechnung/   daten.json
  Vermögen/           daten.json
  Versicherungen/     daten.json
  Reiseplaner/        daten.json
  FreelancerCRM/      daten.json
```

---

## Dateiformat

### Klartext-Apps (haushaltsbuch, muenzsammlung, spesenabrechnung, reiseplaner, freelancer-crm)

```json
{
  "version": "1.0",
  "app": "Haushaltsbuch",
  "savedAt": "2026-05-31T10:30:00Z",
  "data": [ ...App-Daten-Array... ]
}
```

### Verschlüsselte Apps (vermoegen, versicherungen)

```json
{
  "version": "1.0",
  "app": "Vermögen",
  "savedAt": "2026-05-31T10:30:00Z",
  "data": { "v": 2, "s": "base64salt", "i": "base64iv", "d": "base64ct" }
}
```

Der verschlüsselte Blob ist identisch mit dem localStorage-Wert — kein Klartext auf iCloud Drive.

---

## Session-Persistenz

Der `FileSystemDirectoryHandle` wird in IndexedDB gespeichert:

- **DB-Name:** `ws_datenpool`  
- **Store:** `handles`  
- **Key:** `dp_<AppName>` (z.B. `dp_Haushaltsbuch`)

### Startup-Flow

```
dpInit() beim App-Start
  ├─ Handle in IndexedDB?
  │     Nein → Button „☁️ Mit Datenpool verbinden" anzeigen
  │     Ja  → queryPermission()
  │             'granted' → dpLoad() → dpUpdateUI(true)
  │             'prompt'  → Button „☁️ Neu verbinden" anzeigen
  └─ localStorage als primäre Quelle bleibt immer erhalten
```

### Konfliktauflösung

Wenn localStorage-Daten UND Datenpool-Daten vorhanden: **Datenpool gewinnt** (neuestes `savedAt`). Kein Merge, einfaches Überschreiben.

---

## Auto-Save Integration

`dpSave()` wird direkt nach dem bestehenden `localStorage.setItem()`-Aufruf eingefügt:

```javascript
// Vorher:
localStorage.setItem(KEY, JSON.stringify(txs));

// Nachher:
localStorage.setItem(KEY, JSON.stringify(txs));
dpSave(); // fire-and-forget, async, kein await
```

---

## FAB UI

### Apps mit bestehendem FAB (haushaltsbuch, muenzsammlung, spesenabrechnung, vermoegen, versicherungen)

Neuer Abschnitt im bestehenden FAB-Panel, unter dem Speichern/Laden-Bereich:

```
─────────────────────────
☁️ iCloud Datenpool
Status: ● verbunden      ← grün wenn aktiv
[☁️ Mit Datenpool verbinden]  ← nur wenn nicht verbunden
```

### Apps ohne FAB (reiseplaner, freelancer-crm)

Neues FAB-Panel im selben Stil wie bei den anderen Apps:
- Floating 💾-Button unten rechts (`position:fixed; bottom:20px; right:16px`)
- Panel mit Datenpool-Abschnitt (kein manueller JSON-Export nötig)

### Status-Zustände

| Status | Anzeige |
|---|---|
| Verbunden, Auto-Save aktiv | `● verbunden` (grün), kein Button |
| Nicht verbunden | `○ nicht verbunden` (grau) + Button „☁️ Mit Datenpool verbinden" |
| Berechtigung abgelaufen | `⚠ Berechtigung abgelaufen` (orange) + Button „☁️ Neu verbinden" |

---

## Fehlerbehandlung

| Situation | Verhalten |
|---|---|
| User bricht Ordner-Auswahl ab | Stillschweigend, kein Alert |
| `dpSave()` schlägt fehl | `console.warn`, kein Alert — localStorage ist primär |
| `daten.json` nicht vorhanden | Stilles Ignorieren, normaler App-Start |
| Format-Fehler beim Laden | Bestehende M3-Validierung greift |
| Datei > 4 MB | Bestehende Größenprüfung greift |

---

## Testing

### Automatisiert (Playwright)
- Button „☁️ Mit Datenpool verbinden" erscheint beim ersten Start
- `dpSave()` schreibt korrekte JSON-Struktur (via `page.evaluate()` Mock)
- Nach Reload mit gespeichertem Handle: Daten automatisch geladen
- Schema-Validierung der `daten.json`

### Manuell (Browser)
Da `showDirectoryPicker()` einen echten User-Gesture erfordert:
1. App im Chrome öffnen
2. „☁️ Mit Datenpool verbinden" klicken → `WS Datenpool` auswählen
3. Daten eingeben → `WS Datenpool/<App>/daten.json` in Finder prüfen
4. Tab schließen und neu öffnen → Auto-Load bestätigen

---

## Browser-Voraussetzung

- **Chrome / Edge** (primär) — File System Access API vollständig unterstützt
- `showDirectoryPicker` + `FileSystemDirectoryHandle` + IndexedDB
- Kein Fallback für Safari implementiert (explizite Entscheidung)
