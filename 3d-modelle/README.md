# FORM3D — 3D Modell Viewer & Editor

Browser-basierter 3D-Viewer mit Mesh-Reparatur, maßstabsgerechtem Export und iCloud-Integration.
Läuft vollständig lokal — kein Server, kein Backend.

**Live:** [wistefa.github.io/3d-modelle](https://wistefa.github.io/3d-modelle/)

---

## Unterstützte Formate

### Import

| Format | Beschreibung |
|--------|-------------|
| **STL** | 3D-Druck-Standard (binär & ASCII) |
| **OBJ** | Polygonmesh ohne Materialien |
| **OBJ + MTL** | Beide Dateien gleichzeitig auswählen → Farben aus MTL werden angezeigt |
| **GLB / GLTF** | Modernes Web-3D-Format (MakerWorld, Sketchfab) — Vertex-Colors inklusive |
| **PLY** | Stanford-Format, Photogrammetrie-Scans mit Vertex-Farben |
| **3MF** | Bambu Studio / Prusa-Format mit Druckeinstellungen |
| **STEP / STP** | CAD-Format (FreeCAD, Fusion 360) — via WebAssembly (occt-import-js, ~8 MB) |

### Export

| Format | Beschreibung |
|--------|-------------|
| **STL** | Binär, in eingestellter mm-Größe |
| **OBJ** | Textformat, in eingestellter mm-Größe |
| **3MF** | Bambu-empfohlenes Format, in eingestellter mm-Größe |
| USDZ / STEP | Nicht im Browser generierbar |

Alle Exporte werden in der eingestellten **Druckgröße (mm)** gespeichert — Bambu Studio bekommt das Modell exakt in der richtigen Größe.

---

## Features

### Druckgröße (B × T × H in mm)
- 3 editierbare Felder: Breite, Tiefe, Höhe in Millimeter
- 🔒 Lock-Ratio: Seitenverhältnis automatisch mitziehen
- 🔓 Freie Eingabe: Jede Achse unabhängig ändern
- Default: 100 mm Höhe beim Laden eines Modells

### Mesh-Reparatur
- **ANALYSIEREN**: Findet doppelte Vertices (Spatial Hash, ε = 0.1 µm) und entartete Dreiecke (Fläche ≈ 0)
- **REPARIEREN**: Verschmilzt Vertices, entfernt Null-Flächen-Dreiecke, berechnet Normalen neu
- Ergebnis-Report: z. B. „1.847 Vertices verschmolzen · 12 Dreiecke entfernt"

### Mesh-Optimierung
| Funktion | Details |
|----------|---------|
| **Polygon-Reduktion** | Vertex-Voxel-Grid mit Binärsuche — 1–90 %, kein Artefakt |
| **Verfeinerung** | Midpoint-Subdivision — +10–300 % |
| **Glättung** | Laplacian Smoothing — räumliche Hash-Adjazenz |
| **Boden entfernen** | Horizontaler Trim-Slider für saubere Druckbasis |
| **Snapshots** | Zwischenstände speichern und wiederherstellen |

### WS Datenpool (iCloud)
- 💾-FAB-Button öffnet das Datenpool-Panel
- Einmalig einen iCloud-Ordner verbinden (FileSystem Access API)
- STL / OBJ / 3MF-Exporte landen direkt im iCloud-Ordner `3D-Modelle/`
- Fallback: normaler Browser-Download wenn kein Datenpool verbunden
- Funktioniert in Chrome / Edge (Safari: Download-Fallback)

### 3D-Viewer
- Three.js r128 mit OrbitControls (Drehen, Zoomen, Doppelklick zum Zentrieren)
- Wireframe-Modus, Auto-Rotation
- 4-Punkt-Beleuchtung (ACES Filmic Tone Mapping)
- Vertex-Colors werden angezeigt (PLY / GLB)
- HUD: Modellname, Polygon-Anzahl, Format

---

## App starten

```bash
# Direkt im Browser öffnen (ohne lokalen Server — STEP-Import und Auto-Load nicht verfügbar)
open index.html

# Mit lokalem HTTP-Server (empfohlen)
python3 -m http.server 3000 --directory "WS 3D-Modelle"
# → http://localhost:3000
```

---

## Photogrammetrie-Workflow (macOS / Apple Silicon)

Aus eigenen iPhone-Fotos ein druckfertiges 3D-Modell erzeugen:

### 1. Fotos aufnehmen
- Objekt von allen Seiten fotografieren (mind. 50 Fotos)
- Gleichmäßiger Abstand, konstante Belichtung
- Fotos in `photos/` ablegen

### 2. Swift-Tools kompilieren
```bash
swiftc -framework RealityKit -framework Foundation reconstruct.swift -o reconstruct
swiftc -framework ModelIO  -framework Foundation convert_model.swift -o convert_model
```

### 3. Rekonstruktion starten
```bash
./reconstruct ./photos ./mein_objekt.usdz
# ~15–25 Min. auf M4 Mac (Neural Engine + Metal)
```

### 4. In STL / OBJ konvertieren
```bash
# Pfade in convert_model.swift anpassen, dann:
./convert_model
```

### 5. In FORM3D laden
STL oder OBJ über **⬡ MODELL LADEN** auswählen, Größe einstellen, exportieren.

---

## Projekt-Inhalt

```
WS 3D-Modelle/
├── index.html              # App (Single File, kein Build-Schritt)
├── reconstruct.swift       # RealityKit Photogrammetrie (Swift CLI)
├── convert_model.swift     # USDZ → OBJ + STL Konverter (Swift CLI)
├── bali_guardian.stl       # Beispielmodell: Balinesischer Steinwächter (7.5 MB)
├── bali_guardian.obj       # OBJ-Version (15 MB)
├── bali_guardian.usdz      # AR Quick Look (312 MB)
├── Texture_*.png           # PBR-Texturen (diffuse, normal, AO, roughness)
└── photos/                 # 70 iPhone-Fotos (IMG_6230–IMG_6299)
```

---

## Technologien

| Komponente | Technologie |
|-----------|-------------|
| App | HTML / CSS / JS — Single File, kein Framework, kein Build |
| 3D-Rendering | [Three.js r128](https://threejs.org) |
| STEP-Import | [occt-import-js](https://github.com/kovacsv/occt-import-js) (WASM) |
| 3MF-Export | [JSZip](https://stuk.github.io/jszip/) |
| Photogrammetrie | Apple RealityKit `PhotogrammetrySession` |
| Speicherung | FileSystem Access API (iCloud Datenpool) |

---

## Algorithmen

**Vertex-Voxel-Dezimierung**: Vertices in derselben Voxel-Zelle werden zu ihrem Schwerpunkt zusammengefasst. Zellgröße per Binärsuche kalibriert, sodass genau der gewünschte Poly-Anteil überlebt.

**Midpoint-Subdivision**: Jedes ausgewählte Dreieck wird in 4 Teildreiecke zerlegt. Die größten Dreiecke werden zuerst unterteilt. Kalibriert auf exakten Prozentsatz: +100 % → 2× Polygone.

**Laplacian Smoothing**: Räumliche Hash-Adjazenz (Radius = Ø-Kantenlänge × 1.2). Funktioniert auf Soup-Meshes (iPhone STL: alle Vertices einzigartig).

**Vertex-Welding**: Spatial-Hash mit ε = 0.1 µm — O(n) statt O(n²). Verschmilzt numerisch identische Vertices, die STL-Exporter typischerweise duplizieren.

---

## Voraussetzungen

- **Browser**: Chrome oder Edge (für FileSystem Access API / iCloud Datenpool)
- **Photogrammetrie**: macOS 12+, Apple Silicon (M1–M4), Xcode CLT

## Lizenz

MIT — freie Verwendung, auch kommerziell.
