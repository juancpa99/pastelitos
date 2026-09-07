/* MAREVO data-safety layer.
 * Local data is mirrored to IndexedDB. External reinstall recovery uses
 * first-party Safari cookies because iOS copies cookies into a newly created
 * Home Screen web app but does not copy localStorage or IndexedDB.
 */
(() => {
  const DB_NAME = "marevo-recovery-v1";
  const DB_STORE = "snapshots";
  const DB_KEY = "latest";
  const COOKIE_PREFIX = "marevo_recovery_";
  const COOKIE_META = "marevo_recovery_meta";

  function meaningfulDataCount(s) {
    return ["sessions", "extraSessions", "swim", "cardio", "mobility", "body", "daily", "foods", "photoMonths"]
      .reduce((n, key) => n + (Array.isArray(s?.[key]) ? s[key].length : 0), 0);
  }

  function openRecoveryDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) return reject(new Error("IndexedDB no disponible"));
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(DB_STORE)) req.result.createObjectStore(DB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbWrite(snapshot) {
    const db = await openRecoveryDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put({ savedAt: Date.now(), snapshot }, DB_KEY);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }

  async function idbRead() {
    const db = await openRecoveryDB();
    const value = await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const req = tx.objectStore(DB_STORE).get(DB_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return value;
  }

  async function requestPersistentStorage() {
    try {
      if (navigator.storage?.persist) await navigator.storage.persist();
    } catch (_) {}
  }

  function bytesToBase64Url(bytes) {
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function base64UrlToBytes(value) {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
    const binary = atob(base64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  }

  async function encodeSnapshot(text) {
    const raw = new TextEncoder().encode(text);
    if (!window.CompressionStream) return "r." + bytesToBase64Url(raw);
    const stream = new Blob([raw]).stream().pipeThrough(new CompressionStream("gzip"));
    const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
    return "g." + bytesToBase64Url(compressed);
  }

  async function decodeSnapshot(payload) {
    const mode = payload.slice(0, 2);
    const bytes = base64UrlToBytes(payload.slice(2));
    if (mode === "r.") return new TextDecoder().decode(bytes);
    if (mode !== "g." || !window.DecompressionStream) throw new Error("Formato de copia no compatible");
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new TextDecoder().decode(await new Response(stream).arrayBuffer());
  }

  function cookieMap() {
    return Object.fromEntries(document.cookie.split("; ").filter(Boolean).map((part) => {
      const i = part.indexOf("=");
      return [decodeURIComponent(part.slice(0, i)), decodeURIComponent(part.slice(i + 1))];
    }));
  }

  function recoveryCookiePayload() {
    const cookies = cookieMap();
    const meta = cookies[COOKIE_META];
    if (!meta) return null;
    const [countText, timestampText] = meta.split("|");
    const count = Number(countText);
    const timestamp = Number(timestampText) || 0;
    if (!Number.isInteger(count) || count < 1 || count > 32) return null;
    let payload = "";
    for (let i = 0; i < count; i++) {
      const part = cookies[COOKIE_PREFIX + i];
      if (!part) return null;
      payload += part;
    }
    return { payload, timestamp };
  }

  const originalSaveState = saveState;
  saveState = function marevoSafeSave(silent = false) {
    try {
      state.settings ||= {};
      state.settings.marevoSavedAt = Date.now();
    } catch (_) {}
    originalSaveState(silent);
    try { idbWrite(JSON.stringify(state)).catch(() => {}); } catch (_) {}
  };

  async function restoreSnapshotText(text, source) {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object") throw new Error("Copia no válida");
    state = normalizeState(parsed);
    state.settings ||= {};
    state.settings.marevoRestoredAt = Date.now();
    originalSaveState(true);
    await idbWrite(JSON.stringify(state)).catch(() => {});
    renderAll();
    toast(`Datos recuperados${source ? ` · ${source}` : ""}`);
  }

  async function automaticRecovery() {
    if (meaningfulDataCount(state) > 0) return false;
    const external = recoveryCookiePayload();
    if (external) {
      try {
        await restoreSnapshotText(await decodeSnapshot(external.payload), "copia de Safari");
        return true;
      } catch (_) {}
    }
    try {
      const localMirror = await idbRead();
      if (localMirror?.snapshot) {
        const parsed = JSON.parse(localMirror.snapshot);
        if (meaningfulDataCount(parsed) > 0) {
          await restoreSnapshotText(localMirror.snapshot, "copia local");
          return true;
        }
      }
    } catch (_) {}
    return false;
  }

  async function createSafariRecoveryCopy() {
    try {
      const snapshot = JSON.stringify(state);
      const payload = await encodeSnapshot(snapshot);
      if (payload.length > 90000) {
        toast("La copia es grande: usa también «Guardar archivo»");
        return;
      }
      const url = new URL("../marevo-backup.html", location.href);
      url.hash = `backup=${encodeURIComponent(payload)}&ts=${Date.now()}`;
      const opened = window.open(url.href, "_blank");
      if (!opened) {
        toast("Safari bloqueó la ventana. Vuelve a pulsar el botón.");
        return;
      }
      try { opened.opener = null; } catch (_) {}
      state.settings ||= {};
      state.settings.marevoBackupAt = Date.now();
      originalSaveState(true);
      if (activeView === "Settings") renderSettings();
    } catch (error) {
      toast("No se pudo preparar la copia externa");
      console.error(error);
    }
  }

  async function saveBackupFile() {
    const text = JSON.stringify({ app: "MAREVO", version: 1, exportedAt: new Date().toISOString(), state }, null, 2);
    const file = new File([text], `MAREVO-backup-${currentDate()}.json`, { type: "application/json" });
    try {
      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ files: [file], title: "Copia de seguridad MAREVO" });
        return;
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function chooseBackupFile() {
    let input = document.getElementById("marevoRestoreFile");
    if (!input) {
      input = document.createElement("input");
      input.id = "marevoRestoreFile";
      input.type = "file";
      input.accept = ".json,application/json";
      input.hidden = true;
      input.addEventListener("change", async () => {
        const file = input.files?.[0];
        input.value = "";
        if (!file) return;
        try {
          const parsed = JSON.parse(await file.text());
          await restoreSnapshotText(JSON.stringify(parsed.state || parsed), "archivo");
        } catch (_) {
          toast("El archivo no contiene una copia válida de MAREVO");
        }
      });
      document.body.appendChild(input);
    }
    input.click();
  }

  function formatBackupDate(value) {
    if (!value) return "Todavía no";
    try { return new Date(value).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" }); }
    catch (_) { return "Guardada"; }
  }

  function dataSafetyCard() {
    const last = state.settings?.marevoBackupAt;
    return `<h2 class="section">Protección de datos</h2>
      <div class="card marevo-data-safety">
        <div class="eyebrow">COPIA DE SEGURIDAD</div>
        <h3>Evita perder tus registros al reinstalar</h3>
        <p>iPhone puede eliminar el almacenamiento propio de una web app cuando la borras. MAREVO mantiene una copia local redundante, pero para sobrevivir a una eliminación completa necesitas una copia fuera de la app.</p>
        <div class="callout ${last ? "good" : "warn"}"><strong>${last ? "Copia externa preparada" : "Copia externa pendiente"}</strong><br><small>Último envío a Safari: ${formatBackupDate(last)}</small></div>
        <div class="actions">
          <button class="btn" type="button" onclick="marevoCreateSafariBackup()">Guardar para reinstalación</button>
          <button class="btn secondary" type="button" onclick="marevoSaveBackupFile()">Guardar archivo</button>
          <button class="btn ghost" type="button" onclick="marevoChooseBackupFile()">Restaurar archivo</button>
        </div>
        <p class="marevo-data-note">La copia para reinstalación usa cookies de Safari porque iOS sí las copia a una web app nueva. Esas cookies pueden acompañar peticiones al mismo sitio. Si prefieres una copia que quede como archivo bajo tu control, usa «Guardar archivo» y guárdala en Archivos/iCloud.</p>
      </div>`;
  }

  const previousRenderSettings = renderSettings;
  renderSettings = function marevoRenderSettingsWithSafety() {
    previousRenderSettings();
    const root = document.getElementById("viewSettings");
    if (root && !root.querySelector(".marevo-data-safety")) root.insertAdjacentHTML("beforeend", dataSafetyCard());
  };

  const style = document.createElement("style");
  style.textContent = `.marevo-data-safety h3{margin:5px 0 9px}.marevo-data-safety p{font-size:13px;line-height:1.5;color:var(--muted)}.marevo-data-safety .callout strong{font-size:13px}.marevo-data-note{margin-bottom:0}.marevo-data-safety .actions .btn{flex:1 1 180px}`;
  document.head.appendChild(style);

  window.marevoCreateSafariBackup = createSafariRecoveryCopy;
  window.marevoSaveBackupFile = saveBackupFile;
  window.marevoChooseBackupFile = chooseBackupFile;

  requestPersistentStorage();
  automaticRecovery().finally(() => {
    if (meaningfulDataCount(state) > 0) idbWrite(JSON.stringify(state)).catch(() => {});
    if (activeView === "Settings") renderSettings();
  });
})();
