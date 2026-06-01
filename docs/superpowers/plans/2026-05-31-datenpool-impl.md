# WS Datenpool — Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 7 Apps speichern ihre Daten automatisch als `daten.json` in `~/iCloud Drive/WS Datenpool/<AppName>/` und laden sie beim Start.

**Architecture:** Jede App bekommt einen inline `DatenpoolManager`-Block (~70 Zeilen identischer Code + 3 app-spezifische Konstanten). Der Block definiert `dpConnect()`, `dpSave()`, `dpLoad()`, `dpUpdateUI()` und `dpInit()`. `dpSave()` wird fire-and-forget nach jedem bestehenden `localStorage.setItem`-Aufruf gehängt. FAB-Panels bekommen einen neuen „iCloud Datenpool"-Abschnitt. Die beiden Apps ohne FAB (reiseplaner, freelancer-crm) bekommen ein neues FAB-Panel.

**Tech Stack:** File System Access API (`showDirectoryPicker`, `FileSystemDirectoryHandle`), IndexedDB (Handle-Persistenz), Chrome/Edge.

---

## Wiederverwendeter Code-Block — Standard-Variante

> Dieser Block wird in Task 1–3 identisch verwendet. Nur die ersten 3 Zeilen (Konstanten) unterscheiden sich.

```javascript
// ── WS Datenpool ─────────────────────────────────────────────────────
const DP_APP  = 'PLACEHOLDER';                    // ← APP-SPEZIFISCH
const DP_DATA = () => null;                       // ← APP-SPEZIFISCH
const DP_LOAD = (d) => {};                        // ← APP-SPEZIFISCH

const _DP_FILE = 'daten.json';
const _DP_IDB  = 'ws_datenpool';
let   _dpHandle = null;

async function _dpOpenDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(_DP_IDB, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('h', { keyPath: 'k' });
    req.onsuccess = e => res(e.target.result);
    req.onerror = rej;
  });
}
async function _dpStoreHandle(h) {
  const db = await _dpOpenDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('h', 'readwrite');
    tx.objectStore('h').put({ k: 'dp_' + DP_APP, h });
    tx.oncomplete = res; tx.onerror = rej;
  });
}
async function _dpGetHandle() {
  const db = await _dpOpenDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('h', 'readonly');
    const req = tx.objectStore('h').get('dp_' + DP_APP);
    req.onsuccess = e => res(e.target.result?.h ?? null);
    req.onerror = rej;
  });
}
async function dpConnect() {
  if (!('showDirectoryPicker' in window)) {
    alert('File System Access API nicht verfügbar. Chrome/Edge erforderlich.');
    return;
  }
  try {
    const root = await window.showDirectoryPicker({ mode: 'readwrite', startIn: 'desktop' });
    _dpHandle = await root.getDirectoryHandle(DP_APP, { create: true });
    await _dpStoreHandle(_dpHandle);
    await dpSave();
    dpUpdateUI(true);
  } catch (e) {
    if (e.name !== 'AbortError') console.warn('[Datenpool] connect:', e);
  }
}
async function dpSave() {
  if (!_dpHandle) return;
  try {
    const perm = await _dpHandle.queryPermission({ mode: 'readwrite' });
    if (perm !== 'granted') return;
    const fh = await _dpHandle.getFileHandle(_DP_FILE, { create: true });
    const wr = await fh.createWritable();
    await wr.write(JSON.stringify({ version: '1.0', app: DP_APP, savedAt: new Date().toISOString(), data: DP_DATA() }, null, 2));
    await wr.close();
  } catch (e) { console.warn('[Datenpool] save:', e); }
}
async function dpLoad() {
  try {
    const handle = await _dpGetHandle();
    if (!handle) return false;
    const perm = await handle.queryPermission({ mode: 'readwrite' });
    if (perm !== 'granted') { _dpHandle = handle; return false; }
    _dpHandle = handle;
    const fh = await handle.getFileHandle(_DP_FILE);
    const file = await fh.getFile();
    const obj = JSON.parse(await file.text());
    if (obj?.data !== undefined) { DP_LOAD(obj.data); return true; }
    return false;
  } catch (e) {
    if (e.name !== 'NotFoundError') console.warn('[Datenpool] load:', e);
    return false;
  }
}
function dpUpdateUI(state) {
  const s = document.getElementById('dp-status');
  const b = document.getElementById('dp-btn');
  if (!s) return;
  if (state === true)          { s.textContent = '● verbunden';               s.style.color = '#34c759'; if (b) b.style.display = 'none'; }
  else if (state === 'prompt') { s.textContent = '⚠ Berechtigung abgelaufen'; s.style.color = '#ff9500'; if (b) { b.textContent = '☁️ Neu verbinden'; b.style.display = ''; } }
  else                         { s.textContent = '○ nicht verbunden';         s.style.color = '#999';    if (b) { b.textContent = '☁️ Mit Datenpool verbinden'; b.style.display = ''; } }
}
async function dpInit() {
  const loaded = await dpLoad();
  const handle = await _dpGetHandle();
  if (!handle)      dpUpdateUI(false);
  else if (!loaded) dpUpdateUI('prompt');
  else              dpUpdateUI(true);
}
dpInit();
// ─────────────────────────────────────────────────────────────────────
```

## Wiederverwendeter HTML-Snippet — FAB-Datenpool-Abschnitt

> Identisch in alle 5 bestehenden FAB-Panels einfügen (vor dem schließenden `</div>` des `fab-panel`-Divs).

```html
    <div style="border-top:1px solid #eee;margin-top:8px;padding-top:8px;">
      <div style="font-size:0.75rem;font-weight:700;color:#666;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;">iCloud Datenpool</div>
      <div id="dp-status" style="font-size:0.8rem;margin-bottom:6px;color:#999;">○ nicht verbunden</div>
      <button id="dp-btn" onclick="dpConnect()" style="width:100%;padding:9px;background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;border-radius:7px;font-weight:bold;cursor:pointer;font-size:0.88rem;">☁️ Mit Datenpool verbinden</button>
    </div>
```

---

## Task 1: haushaltsbuch

**Files:**
- Modify: `haushaltsbuch/index.html:287-288` (save-Funktion)
- Modify: `haushaltsbuch/index.html:786` (FAB-Panel HTML)
- Modify: `haushaltsbuch/index.html:~289` (DatenpoolManager-Block einfügen)

- [ ] **Schritt 1: DatenpoolManager-Block vor `function fabToggle` einfügen**

  Suche in `haushaltsbuch/index.html` nach:
  ```javascript
  function fabToggle(){const p=document.getElementById('fab-panel');
  ```
  Davor einfügen (vollständiger Block aus dem Abschnitt „Standard-Variante" oben, mit diesen Konstanten):
  ```javascript
  // ── WS Datenpool ─────────────────────────────────────────────────────
  const DP_APP  = 'Haushaltsbuch';
  const DP_DATA = () => txs;
  const DP_LOAD = (d) => { if (Array.isArray(d)) { txs = d; render(); } };
  // ... (restliche 65 Zeilen identisch wie im „Standard-Variante"-Block) ...
  dpInit();
  // ─────────────────────────────────────────────────────────────────────
  ```

- [ ] **Schritt 2: `dpSave()` in save()-Funktion einhängen**

  Ändere (Zeile 287–288):
  ```javascript
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(txs)); } catch(e) {}
  }
  ```
  Zu:
  ```javascript
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(txs)); } catch(e) {}
    dpSave();
  }
  ```

- [ ] **Schritt 3: Datenpool-Abschnitt ins FAB-Panel einfügen**

  Suche in `haushaltsbuch/index.html`:
  ```html
      <label style="display:block;width:100%;padding:9px;background:#f5f5f5;border:1px solid #ddd;border-radius:7px;font-weight:bold;cursor:pointer;text-align:center;font-size:0.88rem;box-sizing:border-box;">📂 Laden (JSON)<input type="file" accept=".json" style="display:none" onchange="fabImport(this)"></label>
    </div>
  ```
  Ersetze durch (FAB-HTML-Snippet aus dem Abschnitt oben einfügen zwischen label und schließendem `</div>`):
  ```html
      <label style="display:block;width:100%;padding:9px;background:#f5f5f5;border:1px solid #ddd;border-radius:7px;font-weight:bold;cursor:pointer;text-align:center;font-size:0.88rem;box-sizing:border-box;">📂 Laden (JSON)<input type="file" accept=".json" style="display:none" onchange="fabImport(this)"></label>
      <div style="border-top:1px solid #eee;margin-top:8px;padding-top:8px;">
        <div style="font-size:0.75rem;font-weight:700;color:#666;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;">iCloud Datenpool</div>
        <div id="dp-status" style="font-size:0.8rem;margin-bottom:6px;color:#999;">○ nicht verbunden</div>
        <button id="dp-btn" onclick="dpConnect()" style="width:100%;padding:9px;background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;border-radius:7px;font-weight:bold;cursor:pointer;font-size:0.88rem;">☁️ Mit Datenpool verbinden</button>
      </div>
    </div>
  ```

- [ ] **Schritt 4: Smoke-Test im Browser**

  ```
  open ~/Projekte/WS/wistefa.github.io/haushaltsbuch/index.html
  ```
  Prüfen: 💾-Button öffnet Panel → „iCloud Datenpool"-Abschnitt mit „○ nicht verbunden" sichtbar. Keine JS-Fehler in DevTools-Console.

- [ ] **Schritt 5: Commit**

  ```bash
  cd ~/Projekte/WS/wistefa.github.io
  git add haushaltsbuch/index.html
  git commit -m "feat(datenpool): haushaltsbuch — Auto-Save + FAB-Datenpool-UI"
  ```

---

## Task 2: muenzsammlung

**Files:**
- Modify: `muenzsammlung/index.html:393-394` (save-Funktion)
- Modify: `muenzsammlung/index.html:~1099` (FAB-Panel HTML)
- Modify: `muenzsammlung/index.html:~1057` (DatenpoolManager-Block)

- [ ] **Schritt 1: DatenpoolManager-Block vor `function fabToggle` einfügen**

  Suche: `function fabToggle(){const p=document.getElementById('fab-panel');`
  Davor (vollständiger Standard-Block mit diesen Konstanten):
  ```javascript
  // ── WS Datenpool ─────────────────────────────────────────────────────
  const DP_APP  = 'Münzsammlung';
  const DP_DATA = () => coins;
  const DP_LOAD = (d) => { if (Array.isArray(d)) { coins = d; applyFilters(); } };
  // ... (restliche 65 Zeilen identisch) ...
  dpInit();
  // ─────────────────────────────────────────────────────────────────────
  ```

- [ ] **Schritt 2: `dpSave()` in save()-Funktion einhängen**

  Ändere (Zeile 393–395):
  ```javascript
  function save(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(coins)); } catch(e){}
  }
  ```
  Zu:
  ```javascript
  function save(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(coins)); } catch(e){}
    dpSave();
  }
  ```

- [ ] **Schritt 3: Datenpool-Abschnitt ins FAB-Panel einfügen**

  Suche (Zeile ~1105):
  ```html
      <label style="display:block;width:100%;padding:9px;background:#f5f5f5;border:1px solid #ddd;border-radius:7px;font-weight:bold;cursor:pointer;text-align:center;font-size:0.88rem;box-sizing:border-box;">📂 Laden (JSON)<input type="file" accept=".json" style="display:none" onchange="fabImport(this)"></label>
    </div>
  ```
  Ersetze durch:
  ```html
      <label style="display:block;width:100%;padding:9px;background:#f5f5f5;border:1px solid #ddd;border-radius:7px;font-weight:bold;cursor:pointer;text-align:center;font-size:0.88rem;box-sizing:border-box;">📂 Laden (JSON)<input type="file" accept=".json" style="display:none" onchange="fabImport(this)"></label>
      <div style="border-top:1px solid #eee;margin-top:8px;padding-top:8px;">
        <div style="font-size:0.75rem;font-weight:700;color:#666;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;">iCloud Datenpool</div>
        <div id="dp-status" style="font-size:0.8rem;margin-bottom:6px;color:#999;">○ nicht verbunden</div>
        <button id="dp-btn" onclick="dpConnect()" style="width:100%;padding:9px;background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;border-radius:7px;font-weight:bold;cursor:pointer;font-size:0.88rem;">☁️ Mit Datenpool verbinden</button>
      </div>
    </div>
  ```

- [ ] **Schritt 4: Smoke-Test im Browser**

  ```
  open ~/Projekte/WS/wistefa.github.io/muenzsammlung/index.html
  ```
  Prüfen: FAB öffnet → Datenpool-Abschnitt sichtbar, keine Konsolen-Fehler.

- [ ] **Schritt 5: Commit**

  ```bash
  git add muenzsammlung/index.html
  git commit -m "feat(datenpool): muenzsammlung — Auto-Save + FAB-Datenpool-UI"
  ```

---

## Task 3: spesenabrechnung

**Files:**
- Modify: `spesenabrechnung/index.html:324` (save-Funktion)
- Modify: `spesenabrechnung/index.html:~768` (FAB-Panel HTML)
- Modify: `spesenabrechnung/index.html:~757` (DatenpoolManager-Block)

- [ ] **Schritt 1: DatenpoolManager-Block vor `function fabToggle` einfügen**

  Suche: `function fabToggle(){const p=document.getElementById('fab-panel');`
  Davor (vollständiger Standard-Block mit diesen Konstanten):
  ```javascript
  // ── WS Datenpool ─────────────────────────────────────────────────────
  const DP_APP  = 'Spesenabrechnung';
  const DP_DATA = () => spesen;
  const DP_LOAD = (d) => { if (Array.isArray(d)) { spesen = d; applyFilters(); } };
  // ... (restliche 65 Zeilen identisch) ...
  dpInit();
  // ─────────────────────────────────────────────────────────────────────
  ```

- [ ] **Schritt 2: `dpSave()` in save()-Funktion einhängen**

  Ändere (Zeile 324):
  ```javascript
  function save(){ try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(spesen)); }catch(e){} }
  ```
  Zu:
  ```javascript
  function save(){ try{ localStorage.setItem(STORAGE_KEY,JSON.stringify(spesen)); }catch(e){} dpSave(); }
  ```

- [ ] **Schritt 3: Datenpool-Abschnitt ins FAB-Panel einfügen**

  Suche (Zeile ~768):
  ```html
      <label style="display:block;width:100%;padding:9px;background:#f5f5f5;border:1px solid #ddd;border-radius:7px;font-weight:bold;cursor:pointer;text-align:center;font-size:0.88rem;box-sizing:border-box;">📂 Laden (JSON)<input type="file" accept=".json" style="display:none" onchange="fabImport(this)"></label>
    </div>
  ```
  Ersetze durch:
  ```html
      <label style="display:block;width:100%;padding:9px;background:#f5f5f5;border:1px solid #ddd;border-radius:7px;font-weight:bold;cursor:pointer;text-align:center;font-size:0.88rem;box-sizing:border-box;">📂 Laden (JSON)<input type="file" accept=".json" style="display:none" onchange="fabImport(this)"></label>
      <div style="border-top:1px solid #eee;margin-top:8px;padding-top:8px;">
        <div style="font-size:0.75rem;font-weight:700;color:#666;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;">iCloud Datenpool</div>
        <div id="dp-status" style="font-size:0.8rem;margin-bottom:6px;color:#999;">○ nicht verbunden</div>
        <button id="dp-btn" onclick="dpConnect()" style="width:100%;padding:9px;background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;border-radius:7px;font-weight:bold;cursor:pointer;font-size:0.88rem;">☁️ Mit Datenpool verbinden</button>
      </div>
    </div>
  ```

- [ ] **Schritt 4: Smoke-Test im Browser**

  ```
  open ~/Projekte/WS/wistefa.github.io/spesenabrechnung/index.html
  ```
  Prüfen: FAB öffnet → Datenpool-Abschnitt sichtbar, keine Konsolen-Fehler.

- [ ] **Schritt 5: Commit**

  ```bash
  git add spesenabrechnung/index.html
  git commit -m "feat(datenpool): spesenabrechnung — Auto-Save + FAB-Datenpool-UI"
  ```

---

## Task 4: vermoegen (verschlüsselte Variante)

**Besonderheit:** `DP_DATA` liest den verschlüsselten Blob direkt aus localStorage. `DP_LOAD` schreibt ihn zurück — kein `render()`, da PIN noch nicht eingegeben.

**Files:**
- Modify: `vermoegen/index.html:596-603` (async save-Funktion)
- Modify: `vermoegen/index.html:~1116` (FAB-Panel HTML)
- Modify: `vermoegen/index.html:~1067` (DatenpoolManager-Block)

- [ ] **Schritt 1: DatenpoolManager-Block vor `function fabToggle` einfügen**

  Suche: `function fabToggle(){const p=document.getElementById('fab-panel');`
  Davor (vollständiger Standard-Block mit verschlüsselten Konstanten):
  ```javascript
  // ── WS Datenpool ─────────────────────────────────────────────────────
  const DP_APP  = 'Vermögen';
  const DP_DATA = () => { const r = localStorage.getItem('vm_data'); return r ? JSON.parse(r) : null; };
  const DP_LOAD = (d) => { if (d && d.v === 2 && d.s && d.i && d.d) localStorage.setItem('vm_data', JSON.stringify(d)); };

  const _DP_FILE = 'daten.json';
  const _DP_IDB  = 'ws_datenpool';
  let   _dpHandle = null;

  async function _dpOpenDB() {
    return new Promise((res, rej) => {
      const req = indexedDB.open(_DP_IDB, 1);
      req.onupgradeneeded = e => e.target.result.createObjectStore('h', { keyPath: 'k' });
      req.onsuccess = e => res(e.target.result);
      req.onerror = rej;
    });
  }
  async function _dpStoreHandle(h) {
    const db = await _dpOpenDB();
    return new Promise((res, rej) => {
      const tx = db.transaction('h', 'readwrite');
      tx.objectStore('h').put({ k: 'dp_' + DP_APP, h });
      tx.oncomplete = res; tx.onerror = rej;
    });
  }
  async function _dpGetHandle() {
    const db = await _dpOpenDB();
    return new Promise((res, rej) => {
      const tx = db.transaction('h', 'readonly');
      const req = tx.objectStore('h').get('dp_' + DP_APP);
      req.onsuccess = e => res(e.target.result?.h ?? null);
      req.onerror = rej;
    });
  }
  async function dpConnect() {
    if (!('showDirectoryPicker' in window)) {
      alert('File System Access API nicht verfügbar. Chrome/Edge erforderlich.');
      return;
    }
    try {
      const root = await window.showDirectoryPicker({ mode: 'readwrite', startIn: 'desktop' });
      _dpHandle = await root.getDirectoryHandle(DP_APP, { create: true });
      await _dpStoreHandle(_dpHandle);
      await dpSave();
      dpUpdateUI(true);
    } catch (e) {
      if (e.name !== 'AbortError') console.warn('[Datenpool] connect:', e);
    }
  }
  async function dpSave() {
    if (!_dpHandle) return;
    try {
      const perm = await _dpHandle.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') return;
      const fh = await _dpHandle.getFileHandle(_DP_FILE, { create: true });
      const wr = await fh.createWritable();
      await wr.write(JSON.stringify({ version: '1.0', app: DP_APP, savedAt: new Date().toISOString(), data: DP_DATA() }, null, 2));
      await wr.close();
    } catch (e) { console.warn('[Datenpool] save:', e); }
  }
  async function dpLoad() {
    try {
      const handle = await _dpGetHandle();
      if (!handle) return false;
      const perm = await handle.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') { _dpHandle = handle; return false; }
      _dpHandle = handle;
      const fh = await handle.getFileHandle(_DP_FILE);
      const file = await fh.getFile();
      const obj = JSON.parse(await file.text());
      if (obj?.data !== undefined) { DP_LOAD(obj.data); return true; }
      return false;
    } catch (e) {
      if (e.name !== 'NotFoundError') console.warn('[Datenpool] load:', e);
      return false;
    }
  }
  function dpUpdateUI(state) {
    const s = document.getElementById('dp-status');
    const b = document.getElementById('dp-btn');
    if (!s) return;
    if (state === true)          { s.textContent = '● verbunden';               s.style.color = '#34c759'; if (b) b.style.display = 'none'; }
    else if (state === 'prompt') { s.textContent = '⚠ Berechtigung abgelaufen'; s.style.color = '#ff9500'; if (b) { b.textContent = '☁️ Neu verbinden'; b.style.display = ''; } }
    else                         { s.textContent = '○ nicht verbunden';         s.style.color = '#999';    if (b) { b.textContent = '☁️ Mit Datenpool verbinden'; b.style.display = ''; } }
  }
  async function dpInit() {
    const loaded = await dpLoad();
    const handle = await _dpGetHandle();
    if (!handle)      dpUpdateUI(false);
    else if (!loaded) dpUpdateUI('prompt');
    else              dpUpdateUI(true);
  }
  dpInit();
  // ─────────────────────────────────────────────────────────────────────
  ```

- [ ] **Schritt 2: `dpSave()` in async save()-Funktion einhängen**

  Ändere (Zeile 596–603):
  ```javascript
  async function save() {
    if (!currentPin || data === null) return;
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv   = crypto.getRandomValues(new Uint8Array(12));
    const key  = await _deriveKey(currentPin, salt);
    const ct   = await crypto.subtle.encrypt({name:'AES-GCM',iv}, key, new TextEncoder().encode(JSON.stringify(data)));
    localStorage.setItem('vm_data', JSON.stringify({v:2, s:_b64e(salt), i:_b64e(iv), d:_b64e(ct)}));
  }
  ```
  Zu:
  ```javascript
  async function save() {
    if (!currentPin || data === null) return;
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv   = crypto.getRandomValues(new Uint8Array(12));
    const key  = await _deriveKey(currentPin, salt);
    const ct   = await crypto.subtle.encrypt({name:'AES-GCM',iv}, key, new TextEncoder().encode(JSON.stringify(data)));
    localStorage.setItem('vm_data', JSON.stringify({v:2, s:_b64e(salt), i:_b64e(iv), d:_b64e(ct)}));
    dpSave();
  }
  ```

- [ ] **Schritt 3: Datenpool-Abschnitt ins FAB-Panel einfügen**

  Suche (Zeile ~1116):
  ```html
      <label style="display:block;width:100%;padding:9px;background:#f5f5f5;border:1px solid #ddd;border-radius:7px;font-weight:bold;cursor:pointer;text-align:center;font-size:0.88rem;box-sizing:border-box;">📂 Laden (JSON)<input type="file" accept=".json" style="display:none" onchange="fabImport(this)"></label>
    </div>
  ```
  Ersetze durch:
  ```html
      <label style="display:block;width:100%;padding:9px;background:#f5f5f5;border:1px solid #ddd;border-radius:7px;font-weight:bold;cursor:pointer;text-align:center;font-size:0.88rem;box-sizing:border-box;">📂 Laden (JSON)<input type="file" accept=".json" style="display:none" onchange="fabImport(this)"></label>
      <div style="border-top:1px solid #eee;margin-top:8px;padding-top:8px;">
        <div style="font-size:0.75rem;font-weight:700;color:#666;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;">iCloud Datenpool</div>
        <div id="dp-status" style="font-size:0.8rem;margin-bottom:6px;color:#999;">○ nicht verbunden</div>
        <button id="dp-btn" onclick="dpConnect()" style="width:100%;padding:9px;background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;border-radius:7px;font-weight:bold;cursor:pointer;font-size:0.88rem;">☁️ Mit Datenpool verbinden</button>
      </div>
    </div>
  ```

- [ ] **Schritt 4: Smoke-Test**

  ```
  open ~/Projekte/WS/wistefa.github.io/vermoegen/index.html
  ```
  Prüfen: PIN-Screen erscheint. Nach PIN-Eingabe: FAB öffnet → Datenpool-Abschnitt sichtbar, keine Konsolen-Fehler.

- [ ] **Schritt 5: Commit**

  ```bash
  git add vermoegen/index.html
  git commit -m "feat(datenpool): vermoegen — Auto-Save (encrypted) + FAB-Datenpool-UI"
  ```

---

## Task 5: versicherungen (verschlüsselte Variante)

**Files:**
- Modify: `versicherungen/index.html` (async save, FAB, DatenpoolManager)

- [ ] **Schritt 1: DatenpoolManager-Block vor `function fabToggle` einfügen**

  Suche: `function fabToggle(){const p=document.getElementById('fab-panel');`
  Davor (vollständiger Block — identisch wie Task 4, nur Konstanten abweichend):
  ```javascript
  // ── WS Datenpool ─────────────────────────────────────────────────────
  const DP_APP  = 'Versicherungen';
  const DP_DATA = () => { const r = localStorage.getItem('vs_data'); return r ? JSON.parse(r) : null; };
  const DP_LOAD = (d) => { if (d && d.v === 2 && d.s && d.i && d.d) localStorage.setItem('vs_data', JSON.stringify(d)); };
  // ... (restliche 65 Zeilen identisch wie Task 4) ...
  dpInit();
  // ─────────────────────────────────────────────────────────────────────
  ```

- [ ] **Schritt 2: `dpSave()` in async save()-Funktion einhängen**

  Suche in `versicherungen/index.html`:
  ```javascript
  async function save() {
    if (!currentPin || data === null) return;
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv   = crypto.getRandomValues(new Uint8Array(12));
    const key  = await _deriveKey(currentPin, salt);
    const ct   = await crypto.subtle.encrypt({name:'AES-GCM',iv}, key, new TextEncoder().encode(JSON.stringify(data)));
    localStorage.setItem('vs_data', JSON.stringify({v:2, s:_b64e(salt), i:_b64e(iv), d:_b64e(ct)}));
  }
  ```
  Ersetze durch:
  ```javascript
  async function save() {
    if (!currentPin || data === null) return;
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv   = crypto.getRandomValues(new Uint8Array(12));
    const key  = await _deriveKey(currentPin, salt);
    const ct   = await crypto.subtle.encrypt({name:'AES-GCM',iv}, key, new TextEncoder().encode(JSON.stringify(data)));
    localStorage.setItem('vs_data', JSON.stringify({v:2, s:_b64e(salt), i:_b64e(iv), d:_b64e(ct)}));
    dpSave();
  }
  ```

- [ ] **Schritt 3: Datenpool-Abschnitt ins FAB-Panel einfügen**

  Suche (Zeile ~785):
  ```html
      <label style="display:block;width:100%;padding:9px;background:#f5f5f5;border:1px solid #ddd;border-radius:7px;font-weight:bold;cursor:pointer;text-align:center;font-size:0.88rem;box-sizing:border-box;">📂 Laden (JSON)<input type="file" accept=".json" style="display:none" onchange="fabImport(this)"></label>
    </div>
  ```
  Ersetze durch:
  ```html
      <label style="display:block;width:100%;padding:9px;background:#f5f5f5;border:1px solid #ddd;border-radius:7px;font-weight:bold;cursor:pointer;text-align:center;font-size:0.88rem;box-sizing:border-box;">📂 Laden (JSON)<input type="file" accept=".json" style="display:none" onchange="fabImport(this)"></label>
      <div style="border-top:1px solid #eee;margin-top:8px;padding-top:8px;">
        <div style="font-size:0.75rem;font-weight:700;color:#666;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px;">iCloud Datenpool</div>
        <div id="dp-status" style="font-size:0.8rem;margin-bottom:6px;color:#999;">○ nicht verbunden</div>
        <button id="dp-btn" onclick="dpConnect()" style="width:100%;padding:9px;background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;border-radius:7px;font-weight:bold;cursor:pointer;font-size:0.88rem;">☁️ Mit Datenpool verbinden</button>
      </div>
    </div>
  ```

- [ ] **Schritt 4: Smoke-Test**

  ```
  open ~/Projekte/WS/wistefa.github.io/versicherungen/index.html
  ```
  Prüfen: PIN-Screen, dann FAB → Datenpool-Abschnitt sichtbar.

- [ ] **Schritt 5: Commit**

  ```bash
  git add versicherungen/index.html
  git commit -m "feat(datenpool): versicherungen — Auto-Save (encrypted) + FAB-Datenpool-UI"
  ```

---

## Task 6: reiseplaner (React-App + neues FAB)

**Besonderheit:** React liest localStorage beim Mount. `DP_LOAD` setzt localStorage und löst einen einmaligen Page-Reload aus (via sessionStorage-Guard gegen Endlosschleifen). `dpSave()` wird im `useLocalStorage`-Hook nach dem `STORAGE_KEY`-Schreibvorgang aufgerufen. Der DatenpoolManager läuft in einem normalen `<script>`-Tag (nicht Babel).

**Files:**
- Modify: `reiseplaner/index.html:244-250` (useLocalStorage set-Funktion)
- Modify: `reiseplaner/index.html` (DatenpoolManager-Block als `<script>` vor `</body>`)
- Modify: `reiseplaner/index.html` (neues FAB-HTML vor `</body>`)

- [ ] **Schritt 1: DatenpoolManager-Block als normales `<script>` vor `</body>` einfügen**

  Suche: `</body>` am Ende von `reiseplaner/index.html`
  Davor einfügen:
  ```html
  <script>
  // ── WS Datenpool ─────────────────────────────────────────────────────
  const DP_APP  = 'Reiseplaner';
  const DP_DATA = () => { const r = localStorage.getItem('reiseplaner_v1'); return r ? JSON.parse(r) : []; };
  const DP_LOAD = (d) => {
    if (!Array.isArray(d) || d.length === 0) return;
    if (sessionStorage.getItem('_dp_loaded_Reiseplaner')) return;
    localStorage.setItem('reiseplaner_v1', JSON.stringify(d));
    sessionStorage.setItem('_dp_loaded_Reiseplaner', '1');
    window.location.reload();
  };

  const _DP_FILE = 'daten.json';
  const _DP_IDB  = 'ws_datenpool';
  let   _dpHandle = null;

  async function _dpOpenDB() {
    return new Promise((res, rej) => {
      const req = indexedDB.open(_DP_IDB, 1);
      req.onupgradeneeded = e => e.target.result.createObjectStore('h', { keyPath: 'k' });
      req.onsuccess = e => res(e.target.result);
      req.onerror = rej;
    });
  }
  async function _dpStoreHandle(h) {
    const db = await _dpOpenDB();
    return new Promise((res, rej) => {
      const tx = db.transaction('h', 'readwrite');
      tx.objectStore('h').put({ k: 'dp_' + DP_APP, h });
      tx.oncomplete = res; tx.onerror = rej;
    });
  }
  async function _dpGetHandle() {
    const db = await _dpOpenDB();
    return new Promise((res, rej) => {
      const tx = db.transaction('h', 'readonly');
      const req = tx.objectStore('h').get('dp_' + DP_APP);
      req.onsuccess = e => res(e.target.result?.h ?? null);
      req.onerror = rej;
    });
  }
  async function dpConnect() {
    if (!('showDirectoryPicker' in window)) {
      alert('File System Access API nicht verfügbar. Chrome/Edge erforderlich.');
      return;
    }
    try {
      const root = await window.showDirectoryPicker({ mode: 'readwrite', startIn: 'desktop' });
      _dpHandle = await root.getDirectoryHandle(DP_APP, { create: true });
      await _dpStoreHandle(_dpHandle);
      await dpSave();
      dpUpdateUI(true);
    } catch (e) {
      if (e.name !== 'AbortError') console.warn('[Datenpool] connect:', e);
    }
  }
  async function dpSave() {
    if (!_dpHandle) return;
    try {
      const perm = await _dpHandle.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') return;
      const fh = await _dpHandle.getFileHandle(_DP_FILE, { create: true });
      const wr = await fh.createWritable();
      await wr.write(JSON.stringify({ version: '1.0', app: DP_APP, savedAt: new Date().toISOString(), data: DP_DATA() }, null, 2));
      await wr.close();
    } catch (e) { console.warn('[Datenpool] save:', e); }
  }
  async function dpLoad() {
    try {
      const handle = await _dpGetHandle();
      if (!handle) return false;
      const perm = await handle.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') { _dpHandle = handle; return false; }
      _dpHandle = handle;
      const fh = await handle.getFileHandle(_DP_FILE);
      const file = await fh.getFile();
      const obj = JSON.parse(await file.text());
      if (obj?.data !== undefined) { DP_LOAD(obj.data); return true; }
      return false;
    } catch (e) {
      if (e.name !== 'NotFoundError') console.warn('[Datenpool] load:', e);
      return false;
    }
  }
  function dpUpdateUI(state) {
    const s = document.getElementById('dp-status');
    const b = document.getElementById('dp-btn');
    if (!s) return;
    if (state === true)          { s.textContent = '● verbunden';               s.style.color = '#34c759'; if (b) b.style.display = 'none'; }
    else if (state === 'prompt') { s.textContent = '⚠ Berechtigung abgelaufen'; s.style.color = '#ff9500'; if (b) { b.textContent = '☁️ Neu verbinden'; b.style.display = ''; } }
    else                         { s.textContent = '○ nicht verbunden';         s.style.color = '#999';    if (b) { b.textContent = '☁️ Mit Datenpool verbinden'; b.style.display = ''; } }
  }
  async function dpInit() {
    const loaded = await dpLoad();
    const handle = await _dpGetHandle();
    if (!handle)      dpUpdateUI(false);
    else if (!loaded) dpUpdateUI('prompt');
    else              dpUpdateUI(true);
  }
  dpInit();
  // ─────────────────────────────────────────────────────────────────────
  </script>
  ```

- [ ] **Schritt 2: `dpSave()` im `useLocalStorage`-Hook einhängen**

  Suche (Zeile 244–250):
  ```javascript
        const set = (val) => {
          setState(prev => {
            const next = typeof val === "function" ? val(prev) : val;
            try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
            return next;
          });
        };
  ```
  Ersetze durch:
  ```javascript
        const set = (val) => {
          setState(prev => {
            const next = typeof val === "function" ? val(prev) : val;
            try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
            if (key === STORAGE_KEY) dpSave();
            return next;
          });
        };
  ```

- [ ] **Schritt 3: Neues FAB-Panel vor `</body>` einfügen** (direkt vor dem `<script>`-Block aus Schritt 1)

  ```html
  <div id="fab-wrap" style="position:fixed;bottom:20px;right:16px;z-index:9000;display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
    <div id="fab-panel" style="display:none;background:white;border:1px solid #ddd;border-radius:12px;padding:14px;box-shadow:0 4px 24px rgba(0,0,0,0.18);width:230px;">
      <div style="font-size:0.75rem;font-weight:700;color:#666;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px;">iCloud Datenpool</div>
      <div id="dp-status" style="font-size:0.8rem;margin-bottom:6px;color:#999;">○ nicht verbunden</div>
      <button id="dp-btn" onclick="dpConnect()" style="width:100%;padding:9px;background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;border-radius:7px;font-weight:bold;cursor:pointer;font-size:0.88rem;">☁️ Mit Datenpool verbinden</button>
    </div>
    <button onclick="document.getElementById('fab-panel').style.display=document.getElementById('fab-panel').style.display==='none'?'block':'none'" style="width:50px;height:50px;border-radius:50%;background:#141921;color:#D4A44C;border:2px solid #D4A44C;font-size:1.4rem;cursor:pointer;box-shadow:0 3px 14px rgba(0,0,0,0.3);" title="iCloud Datenpool">☁️</button>
  </div>
  ```

- [ ] **Schritt 4: Smoke-Test**

  ```
  open ~/Projekte/WS/wistefa.github.io/reiseplaner/index.html
  ```
  Prüfen: ☁️-Button unten rechts sichtbar → Panel öffnet → Datenpool-Status „○ nicht verbunden". Keine Konsolen-Fehler.

- [ ] **Schritt 5: Commit**

  ```bash
  git add reiseplaner/index.html
  git commit -m "feat(datenpool): reiseplaner — Auto-Save + neues FAB-Panel"
  ```

---

## Task 7: freelancer-crm (neues FAB)

**Besonderheit:** `db` ist ein Objekt (nicht Array). Reload-Trick wie bei reiseplaner.

**Files:**
- Modify: `freelancer-crm/index.html:991` (persist-Funktion)
- Modify: `freelancer-crm/index.html` (DatenpoolManager-Block + FAB vor `</body>`)

- [ ] **Schritt 1: DatenpoolManager-Block als normales `<script>` vor `</body>` einfügen**

  Suche: `</body>` am Ende von `freelancer-crm/index.html`
  Davor einfügen:
  ```html
  <script>
  // ── WS Datenpool ─────────────────────────────────────────────────────
  const DP_APP  = 'FreelancerCRM';
  const DP_DATA = () => { const r = localStorage.getItem('fcrm-v2'); return r ? JSON.parse(r) : null; };
  const DP_LOAD = (d) => {
    if (!d || typeof d !== 'object' || Array.isArray(d)) return;
    if (sessionStorage.getItem('_dp_loaded_FreelancerCRM')) return;
    localStorage.setItem('fcrm-v2', JSON.stringify(d));
    sessionStorage.setItem('_dp_loaded_FreelancerCRM', '1');
    window.location.reload();
  };

  const _DP_FILE = 'daten.json';
  const _DP_IDB  = 'ws_datenpool';
  let   _dpHandle = null;

  async function _dpOpenDB() {
    return new Promise((res, rej) => {
      const req = indexedDB.open(_DP_IDB, 1);
      req.onupgradeneeded = e => e.target.result.createObjectStore('h', { keyPath: 'k' });
      req.onsuccess = e => res(e.target.result);
      req.onerror = rej;
    });
  }
  async function _dpStoreHandle(h) {
    const db = await _dpOpenDB();
    return new Promise((res, rej) => {
      const tx = db.transaction('h', 'readwrite');
      tx.objectStore('h').put({ k: 'dp_' + DP_APP, h });
      tx.oncomplete = res; tx.onerror = rej;
    });
  }
  async function _dpGetHandle() {
    const db = await _dpOpenDB();
    return new Promise((res, rej) => {
      const tx = db.transaction('h', 'readonly');
      const req = tx.objectStore('h').get('dp_' + DP_APP);
      req.onsuccess = e => res(e.target.result?.h ?? null);
      req.onerror = rej;
    });
  }
  async function dpConnect() {
    if (!('showDirectoryPicker' in window)) {
      alert('File System Access API nicht verfügbar. Chrome/Edge erforderlich.');
      return;
    }
    try {
      const root = await window.showDirectoryPicker({ mode: 'readwrite', startIn: 'desktop' });
      _dpHandle = await root.getDirectoryHandle(DP_APP, { create: true });
      await _dpStoreHandle(_dpHandle);
      await dpSave();
      dpUpdateUI(true);
    } catch (e) {
      if (e.name !== 'AbortError') console.warn('[Datenpool] connect:', e);
    }
  }
  async function dpSave() {
    if (!_dpHandle) return;
    try {
      const perm = await _dpHandle.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') return;
      const fh = await _dpHandle.getFileHandle(_DP_FILE, { create: true });
      const wr = await fh.createWritable();
      await wr.write(JSON.stringify({ version: '1.0', app: DP_APP, savedAt: new Date().toISOString(), data: DP_DATA() }, null, 2));
      await wr.close();
    } catch (e) { console.warn('[Datenpool] save:', e); }
  }
  async function dpLoad() {
    try {
      const handle = await _dpGetHandle();
      if (!handle) return false;
      const perm = await handle.queryPermission({ mode: 'readwrite' });
      if (perm !== 'granted') { _dpHandle = handle; return false; }
      _dpHandle = handle;
      const fh = await handle.getFileHandle(_DP_FILE);
      const file = await fh.getFile();
      const obj = JSON.parse(await file.text());
      if (obj?.data !== undefined) { DP_LOAD(obj.data); return true; }
      return false;
    } catch (e) {
      if (e.name !== 'NotFoundError') console.warn('[Datenpool] load:', e);
      return false;
    }
  }
  function dpUpdateUI(state) {
    const s = document.getElementById('dp-status');
    const b = document.getElementById('dp-btn');
    if (!s) return;
    if (state === true)          { s.textContent = '● verbunden';               s.style.color = '#34c759'; if (b) b.style.display = 'none'; }
    else if (state === 'prompt') { s.textContent = '⚠ Berechtigung abgelaufen'; s.style.color = '#ff9500'; if (b) { b.textContent = '☁️ Neu verbinden'; b.style.display = ''; } }
    else                         { s.textContent = '○ nicht verbunden';         s.style.color = '#999';    if (b) { b.textContent = '☁️ Mit Datenpool verbinden'; b.style.display = ''; } }
  }
  async function dpInit() {
    const loaded = await dpLoad();
    const handle = await _dpGetHandle();
    if (!handle)      dpUpdateUI(false);
    else if (!loaded) dpUpdateUI('prompt');
    else              dpUpdateUI(true);
  }
  dpInit();
  // ─────────────────────────────────────────────────────────────────────
  </script>
  ```

- [ ] **Schritt 2: `dpSave()` in persist()-Funktion einhängen**

  Ändere (Zeile 991):
  ```javascript
  function persist() { localStorage.setItem('fcrm-v2', JSON.stringify(db)); }
  ```
  Zu:
  ```javascript
  function persist() { localStorage.setItem('fcrm-v2', JSON.stringify(db)); dpSave(); }
  ```

- [ ] **Schritt 3: Neues FAB-Panel vor dem `<script>`-Block aus Schritt 1 einfügen**

  ```html
  <div id="fab-wrap" style="position:fixed;bottom:20px;right:16px;z-index:9000;display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
    <div id="fab-panel" style="display:none;background:white;border:1px solid #ddd;border-radius:12px;padding:14px;box-shadow:0 4px 24px rgba(0,0,0,0.18);width:230px;">
      <div style="font-size:0.75rem;font-weight:700;color:#666;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px;">iCloud Datenpool</div>
      <div id="dp-status" style="font-size:0.8rem;margin-bottom:6px;color:#999;">○ nicht verbunden</div>
      <button id="dp-btn" onclick="dpConnect()" style="width:100%;padding:9px;background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;border-radius:7px;font-weight:bold;cursor:pointer;font-size:0.88rem;">☁️ Mit Datenpool verbinden</button>
    </div>
    <button onclick="document.getElementById('fab-panel').style.display=document.getElementById('fab-panel').style.display==='none'?'block':'none'" style="width:50px;height:50px;border-radius:50%;background:#1e1b4b;color:#c7d2fe;border:2px solid #6366f1;font-size:1.4rem;cursor:pointer;box-shadow:0 3px 14px rgba(0,0,0,0.3);" title="iCloud Datenpool">☁️</button>
  </div>
  ```

- [ ] **Schritt 4: Smoke-Test**

  ```
  open ~/Projekte/WS/wistefa.github.io/freelancer-crm/index.html
  ```
  Prüfen: ☁️-Button sichtbar → Panel öffnet → Status „○ nicht verbunden". Keine Konsolen-Fehler.

- [ ] **Schritt 5: Commit**

  ```bash
  git add freelancer-crm/index.html
  git commit -m "feat(datenpool): freelancer-crm — Auto-Save + neues FAB-Panel"
  ```

---

## Task 8: Playwright-Test (automatisiert)

**Files:**
- Create: `/tmp/playwright-test-datenpool.js`

- [ ] **Schritt 1: Test-Script schreiben**

  ```javascript
  // /tmp/playwright-test-datenpool.js
  const { chromium } = require('playwright');
  const BASE = 'file:///Users/stefanwilfried/Projekte/WS/wistefa.github.io';

  const APPS = [
    { name: 'haushaltsbuch',   url: `${BASE}/haushaltsbuch/index.html` },
    { name: 'muenzsammlung',   url: `${BASE}/muenzsammlung/index.html` },
    { name: 'spesenabrechnung',url: `${BASE}/spesenabrechnung/index.html` },
    { name: 'reiseplaner',     url: `${BASE}/reiseplaner/index.html` },
    { name: 'freelancer-crm',  url: `${BASE}/freelancer-crm/index.html` },
  ];

  (async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 200 });
    for (const app of APPS) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', e => { if (!e.message.includes('ServiceWorker')) errors.push(e.message.slice(0,80)); });

      await page.goto(app.url);
      await page.waitForTimeout(1000);

      // 1. dp-status Element vorhanden
      const statusEl = await page.locator('#dp-status').isVisible().catch(() => false);
      const btnEl    = await page.locator('#dp-btn').isVisible().catch(() => false);
      const status   = statusEl ? await page.locator('#dp-status').textContent() : 'FEHLT';

      // 2. dpSave / dpLoad im globalen Scope verfügbar
      const hasDpSave = await page.evaluate(() => typeof dpSave === 'function');
      const hasDpLoad = await page.evaluate(() => typeof dpLoad === 'function');

      // 3. dpSave fire-and-forget ohne Fehler (kein Handle → früher Return)
      const saveCrash = await page.evaluate(async () => {
        try { await dpSave(); return false; } catch(e) { return e.message; }
      });

      const ok = statusEl && btnEl && hasDpSave && hasDpLoad && saveCrash === false && errors.length === 0;
      console.log(`${ok ? '✅' : '❌'} ${app.name}: status="${status}" dpSave=${hasDpSave} dpLoad=${hasDpLoad} errors=${errors.length}`);
      if (!ok && errors.length) console.log(`   Fehler: ${errors[0]}`);
      await page.close();
    }
    await browser.close();
  })();
  ```

- [ ] **Schritt 2: Test ausführen**

  ```bash
  cd /Users/stefanwilfried/.claude/plugins/cache/playwright-skill/playwright-skill/4.1.0/skills/playwright-skill
  node run.js /tmp/playwright-test-datenpool.js
  ```
  Erwartete Ausgabe: 5× `✅` (vermoegen/versicherungen haben PIN-Screen, brauchen separaten manuellen Test).

- [ ] **Schritt 3: Fehler beheben falls vorhanden, dann erneut testen**

---

## Task 9: iCloud-Ordner anlegen, Push und manueller Abnahmetest

**Files:**
- Create: `~/Library/Mobile Documents/com~apple~CloudDocs/WS Datenpool/<AppName>/` (7 Ordner)

- [ ] **Schritt 1: iCloud-Unterordner anlegen**

  ```bash
  BASE=~/Library/Mobile\ Documents/com~apple~CloudDocs/WS\ Datenpool
  mkdir -p "$BASE/Haushaltsbuch" \
           "$BASE/Münzsammlung" \
           "$BASE/Spesenabrechnung" \
           "$BASE/Vermögen" \
           "$BASE/Versicherungen" \
           "$BASE/Reiseplaner" \
           "$BASE/FreelancerCRM"
  ls "$BASE"
  ```
  Erwartete Ausgabe: 7 Ordner gelistet.

- [ ] **Schritt 2: Alles committen und pushen**

  ```bash
  cd ~/Projekte/WS/wistefa.github.io
  git push
  ```

- [ ] **Schritt 3: Manueller Abnahmetest (Chrome, jede App)**

  Für jede der 7 Apps:
  1. App in Chrome öffnen (`wistefa.github.io/<app>/` oder lokal)
  2. FAB-Button (💾 oder ☁️) klicken → Panel öffnet sich
  3. Status zeigt „○ nicht verbunden"
  4. Auf „☁️ Mit Datenpool verbinden" klicken
  5. Im Picker: `WS Datenpool` auswählen → „Öffnen" klicken
  6. Status wechselt zu „● verbunden"
  7. Einen Datensatz anlegen/ändern
  8. In Finder prüfen: `~/iCloud Drive/WS Datenpool/<AppName>/daten.json` existiert und hat korrekten Inhalt
  9. Tab schließen, App neu öffnen → Status zeigt „● verbunden", Daten geladen
