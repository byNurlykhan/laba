// Google Apps Script сервистерінің жеңіл эмуляторы – Code.gs-ті Node.js-те тексеру үшін.
// Тек Code.gs қолданатын әдістер іске асырылған.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..');
const signed = buf => Array.from(buf, b => (b > 127 ? b - 256 : b));
const toBuf = v => (typeof v === 'string' ? Buffer.from(v, 'utf8') : Buffer.from(v.map(b => b & 255)));

class Range {
  constructor(sh, r, c, nr, nc) {
    if (r < 1 || c < 1 || r + nr - 1 > sh.maxRows || c + nc - 1 > sh.maxCols) {
      throw new Error(`Range out of bounds: ${sh.name} r${r} c${c} ${nr}x${nc} (max ${sh.maxRows}x${sh.maxCols})`);
    }
    Object.assign(this, { sh, r, c, nr, nc });
  }
  cell(i, j) { const row = this.sh.data[this.r - 1 + i] || []; const v = row[this.c - 1 + j]; return v == null ? '' : v; }
  getValues() { const o = []; for (let i = 0; i < this.nr; i++) { const row = []; for (let j = 0; j < this.nc; j++) row.push(this.cell(i, j)); o.push(row); } return o; }
  getDisplayValues() { return this.getValues().map(r => r.map(v => String(v))); }
  getDisplayValue() { return this.getDisplayValues()[0][0]; }
  setValues(vals) {
    if (vals.length !== this.nr || vals.some(r => r.length !== this.nc)) throw new Error('setValues: size mismatch');
    vals.forEach((row, i) => {
      const ri = this.r - 1 + i;
      this.sh.data[ri] = this.sh.data[ri] || [];
      row.forEach((v, j) => { this.sh.data[ri][this.c - 1 + j] = v; });
    });
    this.sh.ss.writes++;
    return this;
  }
  setValue(v) { return this.setValues([[v]]); }
  clearContent() { return this.setValues(Array.from({ length: this.nr }, () => Array(this.nc).fill(''))); }
  getRow() { return this.r; }
  createTextFinder(t) {
    const self = this;
    return {
      matchEntireCell() { return this; },
      findNext() {
        for (let i = 0; i < self.nr; i++) for (let j = 0; j < self.nc; j++) {
          if (String(self.cell(i, j)) === String(t)) return new Range(self.sh, self.r + i, self.c + j, 1, 1);
        }
        return null;
      },
      findAll() {
        const out = [];
        for (let i = 0; i < self.nr; i++) for (let j = 0; j < self.nc; j++) {
          if (String(self.cell(i, j)) === String(t)) out.push(new Range(self.sh, self.r + i, self.c + j, 1, 1));
        }
        return out;
      }
    };
  }
}
['setNumberFormat', 'setFontWeight', 'setBackground', 'setFontColor', 'setWrap', 'setVerticalAlignment', 'setNote',
 'setDataValidation', 'setFontSize'].forEach(m => { Range.prototype[m] = function () { return this; }; });

class Sheet {
  constructor(ss, name) { Object.assign(this, { ss, name, data: [], maxRows: 1000, maxCols: 26 }); }
  getName() { return this.name; }
  setName(n) { this.name = n; return this; }
  getLastRow() { for (let i = this.data.length - 1; i >= 0; i--) { if ((this.data[i] || []).some(v => v !== '' && v != null)) return i + 1; } return 0; }
  getLastColumn() { let m = 0; this.data.forEach(r => (r || []).forEach((v, j) => { if (v !== '' && v != null) m = Math.max(m, j + 1); })); return m; }
  getMaxRows() { return this.maxRows; }
  getMaxColumns() { return this.maxCols; }
  insertRowsAfter(_, n) { this.maxRows += n; }
  insertColumnsAfter(_, n) { this.maxCols += n; }
  getRange(r, c, nr = 1, nc = 1) { return new Range(this, r, c, nr, nc); }
  getDataRange() { return new Range(this, 1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); }
  appendRow(row) { const r = this.getLastRow() + 1; if (r > this.maxRows) this.maxRows = r; if (row.length > this.maxCols) this.maxCols = row.length; this.getRange(r, 1, 1, row.length).setValues([row]); }
  clear() { this.data = []; }
  deleteRow(r) { return this.deleteRows(r, 1); }
  deleteRows(r, n) {
    // Google Sheets: қатырылмаған жолдардың бәрін өшіруге болмайды
    if (this.maxRows - n < 2) throw new Error('Sorry, it is not possible to delete all non-frozen rows.');
    this.data.splice(r - 1, n); this.maxRows -= n;
  }
  protect() { return { setDescription() { return this; }, removeEditors() { return this; }, getEditors() { return []; }, canDomainEdit() { return false; }, setDomainEdit() { return this; } }; }
}
['setFrozenRows', 'setFrozenColumns', 'setRowHeight', 'setColumnWidth', 'setColumnWidths'].forEach(m => { Sheet.prototype[m] = function () { return this; }; });

class Spreadsheet {
  constructor() { this.sheets = []; this.writes = 0; }
  getSheetByName(n) { return this.sheets.find(s => s.name === n) || null; }
  insertSheet(n) { if (this.getSheetByName(n)) throw new Error('Sheet exists: ' + n); const s = new Sheet(this, n); this.sheets.push(s); return s; }
  getSheets() { return this.sheets.slice(); }
  deleteSheet(s) { this.sheets = this.sheets.filter(x => x !== s); }
  toast() {}
}

function fmtDate(d, tz, fmt) {
  const t = new Date(d.getTime() + 5 * 3600000);              // Asia/Almaty (UTC+5)
  const p = n => String(n).padStart(2, '0');
  return fmt.replace('yyyy', t.getUTCFullYear()).replace('MM', p(t.getUTCMonth() + 1)).replace('dd', p(t.getUTCDate()))
    .replace('HH', p(t.getUTCHours())).replace('mm', p(t.getUTCMinutes())).replace('ss', p(t.getUTCSeconds()));
}

function createEnv(opts = {}) {
  const ss = opts.spreadsheet || new Spreadsheet();
  const cacheStore = new Map(), props = new Map(), logs = [];
  const ctx = {
    console, logs,
    SpreadsheetApp: {
      getActive: () => ss, getActiveSpreadsheet: () => ss,
      getUi: () => { throw new Error('No UI in emulator'); },
      newDataValidation: () => { const b = { requireValueInList() { return b; }, build() { return {}; } }; return b; }
    },
    Utilities: {
      getUuid: () => crypto.randomUUID(),
      DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
      computeDigest: (alg, v) => signed(crypto.createHash(alg).update(toBuf(v)).digest()),
      computeHmacSha256Signature: (v, k) => signed(crypto.createHmac('sha256', toBuf(k)).update(toBuf(v)).digest()),
      newBlob: s => ({ getBytes: () => signed(Buffer.from(String(s), 'utf8')) }),
      formatDate: fmtDate, sleep() {}, base64Encode: v => toBuf(v).toString('base64')
    },
    CacheService: { getScriptCache: () => ({
      get: k => (cacheStore.has(k) ? cacheStore.get(k) : null),
      put: (k, v) => { if (String(v).length > 100000) throw new Error('Cache value too large: ' + k); cacheStore.set(k, String(v)); },
      getAll: ks => { const o = {}; ks.forEach(k => { if (cacheStore.has(k)) o[k] = cacheStore.get(k); }); return o; },
      putAll: o => Object.keys(o).forEach(k => { if (String(o[k]).length > 100000) throw new Error('Cache value too large'); cacheStore.set(k, String(o[k])); }),
      remove: k => cacheStore.delete(k), removeAll: ks => ks.forEach(k => cacheStore.delete(k))
    }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, tryLock() { return true; }, releaseLock() {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => (props.has(k) ? props.get(k) : null), setProperty: (k, v) => props.set(k, String(v)) }) },
    UrlFetchApp: { fetch: url => {
      const m = String(url).match(/\/data\/(.+)$/);
      const f = m ? path.join(ROOT, 'data', m[1]) : '';
      const ok = f && fs.existsSync(f);
      return { getResponseCode: () => (ok ? 200 : 404), getContentText: () => (ok ? fs.readFileSync(f, 'utf8') : '') };
    } },
    ContentService: { createTextOutput: t => ({ setMimeType() { return this; }, getContent: () => t }), MimeType: { JSON: 'json', JAVASCRIPT: 'js' } },
    Session: { getScriptTimeZone: () => 'Asia/Almaty' },
    Logger: { log: m => logs.push(String(m)) },
    ScriptApp: { getProjectTriggers: () => [], newTrigger: () => ({}) }
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'apps-script', 'Code.gs'), 'utf8'), ctx, { filename: 'Code.gs' });
  // Веб-қосымшаға сұрау жіберу
  ctx.post = body => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(body) } }).getContent());
  ctx.get = params => ctx.doGet({ parameter: params }).getContent();
  ctx.ss = ss; ctx.cacheStore = cacheStore; ctx.props = props;
  return ctx;
}

module.exports = { createEnv, Spreadsheet };
