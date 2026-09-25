/**
 * ═══════════════════════════════════════════════════════════════
 *  LABA — Library and Book Analytics · басқару жүйесі
 *  Google Apps Script backend (Code.gs)
 *
 *  Сайттың БАРЛЫҚ деректері осы кестеден оқылады.
 *  Парақтар:
 *    Мета          — жыл, күні
 *    Сандар        — барлық бөлімнің жеке көрсеткіштері
 *    Өңірлер       — 23 өңірдің толық кестесі (3,4,5,6,7,9-бөлімдер)
 *    Тізімдер      — диаграммалардың тізімді деректері
 *    Ведомстволар  — 13-бөлімнің салыстыру кестесі
 *    Оқиғалар      — 14-бөлім: жаңалық және хабарландыру
 *    Паспорттар    — «Кітапханалар паспорты» бөлімі (әр жол — бір кітапхана)
 *    Мәтіндер      — сайттағы кез келген жазуды өзгерту
 *    Аудармалар    — атаулардың ru/en нұсқасы
 *    Статистика    — қолданушылардың қаралымы (автоматты)
 *    Есеп          — статистиканың жиынтығы
 *
 *  ОРНАТУ: setup() функциясын бір рет іске қосыңыз — парақтар
 *  құрылып, бүкіл дерек автоматты жазылады. Сосын
 *  Deploy → New deployment → Web app (Anyone).
 *  «Паспорттар» парағын бөлек құру үшін: setupPassportSheet().
 * ═══════════════════════════════════════════════════════════════
 */

const CFG = {
  SH: {
    META:     'Мета',
    NUMS:     'Сандар',
    REGIONS:  'Өңірлер',
    LISTS:    'Тізімдер',
    AGENCIES: 'Ведомстволар',
    EVENTS:   'Оқиғалар',
    PASSPORTS:'Паспорттар',
    TXT:      'Мәтіндер',
    NAMES:    'Аудармалар',
    STATS:    'Статистика',
    REPORT:   'Есеп'
  },
  CACHE_SEC: 300,
  STATS_MAX: 50000
};

/** Тізім түрлерінің құрылымы: қай баған қай өріске түседі */
const LIST_SHAPE = {"agencyCount": ["name", "count"], "network.oblastTypes": ["name", "v"], "fund.carriers": ["name", "v", "pct"], "fund.topKazakhRegions": ["name", "pct"], "acq.byType": ["name", "v"], "subjects": ["name", "fund", "fundPct", "loans", "loansPct"], "digital.abis": ["name", "count", "pct"], "digital.hardware": ["name", "v"], "staff.age": ["name", "v", "pct"], "staff.topSpecial": ["name", "pct"], "publish.items": ["name", "v"], "method.kostanay": ["name", "v"], "infra.repairByRegion": ["name", "v"], "infra.modernByRegion": ["name", "v"]};

/** Қай тізім DATA-ның қай тармағына жазылады */
const LIST_TARGET = {
  'agencyCount':           ['agencyCount'],
  'network.oblastTypes':   ['network', 'oblastTypes'],
  'fund.carriers':         ['fund', 'carriers'],
  'fund.topKazakhRegions': ['fund', 'topKazakhRegions'],
  'acq.byType':            ['acq', 'byType'],
  'subjects':              ['subjects'],
  'digital.abis':          ['digital', 'abis'],
  'digital.hardware':      ['digital', 'hardware'],
  'staff.age':             ['staff', 'age'],
  'staff.topSpecial':      ['staff', 'topSpecial'],
  'publish.items':         ['publish', 'items'],
  'method.kostanay':       ['method', 'kostanay'],
  'infra.repairByRegion':  ['infra', 'repairByRegion'],
  'infra.modernByRegion':  ['infra', 'modernByRegion']
};

/** «Кітапханалар паспорты»: құжаттағы тармақтар (код, атауы) */
const PASSPORT_FIELDS = [
  ['1.1',  'Кітапхананың атауы'],
  ['1.2',  'Кітапхананың суреті (сілтеме)'],
  ['1.3',  'Кітапхананың мекен-жайы'],
  ['1.4',  'Байланыс телефоны'],
  ['1.5',  'E-mail'],
  ['1.6',  'Кітапхана сайты'],
  ['2.1',  'Кітапхананың құрылған жылы'],
  ['2.2',  'Кітапхана орналасқан ғимарат'],
  ['2.3',  'Кітапхана көлемі'],
  ['2.4',  'Оқырман залының болуы (иә, жоқ, абонемент бөлімімен біріктірілген)'],
  ['3.1',  'Интернетке қолжетімділік'],
  ['3.2',  'Кітапхананың автоматтандырылған кітапханалық ақпараттық жүйесінің атауы'],
  ['3.3',  'Электрондық кітапханаларға қолжетімділік'],
  ['3.4',  'Кітапхана пайдаланатын электронды кітапханалардың ақпараттық ресурстары'],
  ['3.5',  'Компьютер (дана)'],
  ['3.6',  'Сканер'],
  ['3.7',  'Принтер'],
  ['3.8',  'Көпфункционалды құрылғы (МФУ)'],
  ['3.9',  'Телевизор'],
  ['3.10', 'Бейнекамера'],
  ['3.11', 'Фотоаппарат'],
  ['4.1',  'Кітапхананың жалпы қоры'],
  ['4.2',  'Мерзімді басылымдар'],
  ['4.3',  'Электронды ресурстар'],
  ['4.4',  'Электрондық каталогтың болуы'],
  ['5.1',  'Штат саны'],
  ['5.2',  'Кітапхана директорының, кітапхана-филиалының меңгерушісінің аты-жөні, байланыс телефоны'],
  ['6.1',  'Пайдаланушылар саны'],
  ['6.2',  'Берілген құжат саны'],
  ['6.3',  'Келушілер саны']
];

// ═══════════════ ВЕБ-ҚОСЫМША ═══════════════

function doGet(e) {
  const p = (e && e.parameter) || {};
  const action = p.action || 'data';
  let out;
  try {
    if (action === 'hit') { logHit_(p); out = { ok: true }; }
    else if (action === 'stats') { out = { ok: true, stats: statsSummary_(Number(p.days) || 30) }; }
    else if (action === 'ping') { out = { ok: true, time: new Date().toISOString() }; }
    else if (action === 'passports') { out = { ok: true, passports: getPassports_() }; }
    else { out = getPayload_(); }
  } catch (err) {
    out = { ok: false, error: String(err && err.message || err) };
  }
  return reply_(out, p.callback);
}

function reply_(obj, callback) {
  const json = JSON.stringify(obj);
  if (callback && /^[\w$.]+$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

// ═══════════════ ДЕРЕКТІ ЖИНАУ ═══════════════

function getPayload_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('payload');
  if (hit) return JSON.parse(hit);

  const out = { ok: true, data: {}, txt: {}, names: {} };
  const D = {};

  // ── Мета ──
  const meta = kvSheet_(CFG.SH.META);
  if (meta.year) {
    D.meta = {
      years: String(meta.years || meta.year).split(',').map(s => Number(String(s).trim())).filter(Boolean),
      periods: ['period'],
      current: { year: Number(meta.year), period: 'period' },
      asOf: String(meta.asOf || '')
    };
  }

  // ── Сандар: нүктелі кілттерді кірістірілген объектіге жаю ──
  rows_(CFG.SH.NUMS).forEach(r => {
    const key = String(r['Кілт'] || '').trim();
    if (!key) return;
    const val = r['Мән'];
    if (val === '' || val === null || val === undefined) return;
    setPath_(D, key, typeof val === 'number' ? val : (isNaN(Number(val)) ? val : Number(val)));
  });
  // totals: {libs:{v,p}} құрылымы дұрыс болу үшін label қосамыз
  if (D.totals) {
    Object.keys(D.totals).forEach(k => {
      if (D.totals[k].v === undefined) D.totals[k].v = 0;
      if (D.totals[k].p === undefined) D.totals[k].p = 0;
    });
  }

  // ── Өңірлер (кең кесте — бірнеше бөлімді бірден толтырады) ──
  const reg = rows_(CFG.SH.REGIONS).filter(r => String(r['Атауы'] || '').trim());
  if (reg.length) {
    D.regions = reg.map(r => ({
      name: String(r['Атауы']).trim(),
      libs: n_(r['Кітапхана']), fund: n_(r['Қор']), fundKz: n_(r['Қор_мемтіл']),
      loans: n_(r['Берілім']), loansKz: n_(r['Берілім_мемтіл']),
      users: n_(r['Оқырман']), visits: n_(r['Келім']), staff: n_(r['Кадр'])
    }));

    const reading = reg.filter(r => r['Халық'] !== '' && r['Халық'] != null)
      .map(r => ({ region: String(r['Атауы']).trim(), pop: n_(r['Халық']),
                   users: n_(r['Оқырман']), pct: n_(r['Оқитын_%']) }));
    if (reading.length) D.reading = reading;

    const renew = reg.filter(r => r['Жаңарту_2025'] !== '' && r['Жаңарту_2025'] != null)
      .map(r => ({ region: String(r['Атауы']).trim(),
                   y2024: n_(r['Жаңарту_2024']), y2025: n_(r['Жаңарту_2025']) }));
    if (renew.length) { D.renewal = D.renewal || {}; D.renewal.byRegion = renew; }

    const sup = reg.filter(r => r['Қамту_2025'] !== '' && r['Қамту_2025'] != null)
      .map(r => ({ region: String(r['Атауы']).trim(),
                   y2024: n_(r['Қамту_2024']), y2025: n_(r['Қамту_2025']) }));
    if (sup.length) { D.supply = D.supply || {}; D.supply.byRegion = sup; }

    const acq = reg.filter(r => r['Толықтыру'] !== '' && r['Толықтыру'] != null)
      .map(r => ({ region: String(r['Атауы']).trim(), total: n_(r['Толықтыру']) }));
    if (acq.length) { D.acq = D.acq || {}; D.acq.byRegion = acq; }
  }

  // ── Тізімдер ──
  const buckets = {};
  rows_(CFG.SH.LISTS).forEach(r => {
    const lid = String(r['Тізім'] || '').trim();
    const shape = LIST_SHAPE[lid];
    if (!lid || !shape || !String(r['Атауы'] || '').trim()) return;
    const o = {};
    shape.forEach((field, i) => {
      const cell = i === 0 ? r['Атауы'] : r['Мән' + i];
      o[field] = i === 0 ? String(cell).trim() : n_(cell);
    });
    (buckets[lid] = buckets[lid] || []).push(o);
  });
  Object.keys(buckets).forEach(lid => {
    const path = LIST_TARGET[lid];
    if (path) setPathArr_(D, path, buckets[lid]);
  });

  // ── Ведомстволар ──
  const ag = rows_(CFG.SH.AGENCIES).filter(r => String(r['Атауы'] || '').trim());
  if (ag.length) {
    D.agencies = ag.map(r => ({
      name: String(r['Атауы']).trim(), fund: n_(r['Қор']), users: n_(r['Оқырман']),
      loans: n_(r['Берілім']), visits: n_(r['Келім']), staff: n_(r['Кадр'])
    }));
  }

  // ── Оқиғалар ──
  const ev = rows_(CFG.SH.EVENTS)
    .filter(r => String(r['Тақырып_kk'] || '').trim() && String(r['Белсенді'] || 'иә').toLowerCase() !== 'жоқ')
    .map(r => ({
      d: String(r['Күні'] || '').trim(),
      m: String(r['Ай'] || '').trim().toUpperCase(),
      type: r['Түрі_kk'] || '',
      type_kk: r['Түрі_kk'] || '', type_ru: r['Түрі_ru'] || r['Түрі_kk'] || '',
      type_en: r['Түрі_en'] || r['Түрі_kk'] || '',
      title_kk: r['Тақырып_kk'] || '', title_ru: r['Тақырып_ru'] || r['Тақырып_kk'] || '',
      title_en: r['Тақырып_en'] || r['Тақырып_kk'] || '',
      desc_kk: r['Сипаттама_kk'] || '', desc_ru: r['Сипаттама_ru'] || r['Сипаттама_kk'] || '',
      desc_en: r['Сипаттама_en'] || r['Сипаттама_kk'] || '',
      link: String(r['Сілтеме'] || '')
    }));
  if (ev.length) D.events = ev;

  // ── Мәтіндер мен аудармалар ──
  rows_(CFG.SH.TXT).forEach(r => {
    const key = String(r['Кілт'] || '').trim();
    if (!key) return;
    const o = {};
    if (r['kk']) o.kk = String(r['kk']);
    if (r['ru']) o.ru = String(r['ru']);
    if (r['en']) o.en = String(r['en']);
    if (Object.keys(o).length) out.txt[key] = o;
  });
  rows_(CFG.SH.NAMES).forEach(r => {
    const key = String(r['Атауы_kk'] || '').trim();
    if (!key) return;
    out.names[key] = { ru: String(r['ru'] || key), en: String(r['en'] || key) };
  });

  out.data = D;
  cache.put('payload', JSON.stringify(out), CFG.CACHE_SEC);
  return out;
}

function n_(v) {
  if (v === '' || v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  const x = Number(String(v).replace(',', '.').replace(/\s/g, ''));
  return isNaN(x) ? 0 : x;
}

/** "fund.kazakhPct" → D.fund.kazakhPct */
function setPath_(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

function setPathArr_(obj, parts, arr) {
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = arr;
}

function clearCache_() { CacheService.getScriptCache().remove('payload'); }

function refreshCache() {
  clearCache_();
  SpreadsheetApp.getActive().toast('Кэш тазартылды. Сайтты жаңартыңыз (Ctrl+F5).', 'LABA', 6);
}

// ═══════════════ КІТАПХАНАЛАР ПАСПОРТЫ ═══════════════
//  «Паспорттар» парағы: әр жол — бір кітапхана, бағандар — 1.1 … 6.3.
//  1.1 (атауы) бос жол сайтқа шықпайды.
//  1.2 — суреттің сілтемесі; Google Drive сілтемесі де болады
//  (файл «Сілтемесі бар кез келген адам — Көруші» болуы керек).
//  Кэштелмейді: кестеге енгізгеніңіз сайтта бірден көрінеді.

/** «Паспорттар» парағын құру. Парақ бар болса — тек тақырып жолы жаңарады, дерек өшпейді. */
function setupPassportSheet() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(CFG.SH.PASSPORTS) || ss.insertSheet(CFG.SH.PASSPORTS);
  const headers = ['ID'].concat(PASSPORT_FIELDS.map(f => f[0] + ' ' + f[1]));
  sh.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#2563EB').setFontColor('#FFFFFF')
    .setVerticalAlignment('middle').setWrap(true);
  sh.setFrozenRows(1);
  sh.setFrozenColumns(2);
  sh.setRowHeight(1, 64);
  sh.setColumnWidth(1, 50);
  sh.setColumnWidths(2, headers.length - 1, 190);
  sh.getRange(2, 1, Math.max(sh.getMaxRows() - 1, 1), headers.length).setNumberFormat('@');
  sh.getRange(1, 1).setNote('Бос қалдыруға болады — онда жол нөмірі ID болады.');
  sh.getRange(1, 3).setNote('Суреттің сілтемесі (URL). Google Drive сілтемесі де болады — файл «Сілтемесі бар кез келген адам» үшін ашық болуы керек.');
  ss.toast('«Паспорттар» парағы дайын.', 'LABA', 5);
}

/** Парақты оқу → [{id, f:{"1.1":"…", …}}] */
function getPassports_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(CFG.SH.PASSPORTS);
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getDisplayValues();
  const head = values[0];

  // Бағанды тақырыптың басындағы кодпен анықтаймыз: «1.1 …», «3.10 …»
  const cols = [];
  let idCol = -1;
  head.forEach((h, i) => {
    const t = String(h).trim();
    if (/^id$/i.test(t)) { idCol = i; return; }
    const m = t.match(/^(\d+\.\d+)\.?(\s|$)/);
    if (m) cols.push([i, m[1]]);
  });

  const out = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const f = {};
    cols.forEach(c => {
      const v = String(row[c[0]] || '').trim();
      if (v) f[c[1]] = v;
    });
    if (!f['1.1']) continue;
    if (f['1.2']) f['1.2'] = imageUrl_(f['1.2']);
    const id = idCol > -1 && String(row[idCol]).trim() ? String(row[idCol]).trim() : String(r + 1);
    out.push({ id: id, f: f });
  }
  return out;
}

/** Google Drive сілтемесін сайтта көрінетін сурет сілтемесіне айналдыру */
function imageUrl_(url) {
  const u = String(url).trim();
  if (!/drive\.google\.com|docs\.google\.com/.test(u)) return u;
  const m = u.match(/\/d\/([\w-]{10,})/) || u.match(/[?&]id=([\w-]{10,})/);
  return m ? 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w1200' : u;
}

// ═══════════════ СТАТИСТИКА ═══════════════

function logHit_(p) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(CFG.SH.STATS);
  if (!sh) {
    sh = ss.insertSheet(CFG.SH.STATS);
    sh.getRange(1, 1, 1, 9).setValues([['Уақыт', 'Күні', 'Сағат', 'Бөлім', 'Тіл',
      'Сілтеме', 'Экран ені', 'Құрылғы', 'TZ']])
      .setFontWeight('bold').setBackground('#2563EB').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
  }
  const now = new Date();
  const w = Number(p.w) || 0;
  sh.appendRow([
    now,
    Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    Utilities.formatDate(now, Session.getScriptTimeZone(), 'HH'),
    String(p.page || '').slice(0, 40),
    String(p.lang || '').slice(0, 5),
    String(p.ref || '').slice(0, 200),
    w,
    w < 760 ? 'Мобиль' : (w < 1100 ? 'Планшет' : 'Десктоп'),
    Number(p.tz) || 0
  ]);
  const last = sh.getLastRow();
  if (last > CFG.STATS_MAX) sh.deleteRows(2, last - CFG.STATS_MAX);
}

function statsSummary_(days) {
  const sh = SpreadsheetApp.getActive().getSheetByName(CFG.SH.STATS);
  const res = { total: 0, byPage: {}, byLang: {}, byDay: {}, byDevice: {} };
  if (!sh || sh.getLastRow() < 2) return res;
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 9).getValues();
  const since = new Date();
  since.setDate(since.getDate() - days);
  vals.forEach(r => {
    const d = r[0];
    if (!(d instanceof Date) || d < since) return;
    res.total++;
    bump_(res.byDay, r[1]); bump_(res.byPage, r[3]);
    bump_(res.byLang, r[4]); bump_(res.byDevice, r[7]);
  });
  return res;
}

function bump_(o, k) { if (k || k === 0) o[k] = (o[k] || 0) + 1; }

function buildStatsReport() {
  const s = statsSummary_(30);
  const sh = sheet_(CFG.SH.REPORT);
  sh.clear();
  const sorted = o => Object.keys(o).map(k => [k, o[k]]).sort((a, b) => b[1] - a[1]);
  const rows = [];
  rows.push(['LABA — қолданушы статистикасы (соңғы 30 күн)', '']);
  rows.push(['Жаңартылды', new Date()]);
  rows.push(['Барлық қаралым', s.total]);
  rows.push(['', '']);
  rows.push(['БӨЛІМДЕР БОЙЫНША', 'Қаралым']);
  sorted(s.byPage).forEach(r => rows.push(r));
  rows.push(['', '']);
  rows.push(['ТІЛ БОЙЫНША', 'Қаралым']);
  sorted(s.byLang).forEach(r => rows.push(r));
  rows.push(['', '']);
  rows.push(['ҚҰРЫЛҒЫ БОЙЫНША', 'Қаралым']);
  sorted(s.byDevice).forEach(r => rows.push(r));
  rows.push(['', '']);
  rows.push(['КҮН БОЙЫНША', 'Қаралым']);
  Object.keys(s.byDay).sort().forEach(k => rows.push([k, s.byDay[k]]));
  sh.getRange(1, 1, rows.length, 2).setValues(rows);
  sh.getRange(1, 1, 1, 2).setFontWeight('bold').setFontSize(13);
  ['БӨЛІМДЕР БОЙЫНША', 'ТІЛ БОЙЫНША', 'ҚҰРЫЛҒЫ БОЙЫНША', 'КҮН БОЙЫНША'].forEach(title => {
    const i = rows.findIndex(r => r[0] === title);
    if (i >= 0) sh.getRange(i + 1, 1, 1, 2).setFontWeight('bold').setBackground('#EFF6FF');
  });
  sh.setColumnWidth(1, 320); sh.setColumnWidth(2, 120);
  SpreadsheetApp.getActive().toast('Есеп жаңартылды.', 'LABA', 5);
}

// ═══════════════ КӨМЕКШІЛЕР ═══════════════

function sheet_(name) {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function rows_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  const values = sh.getDataRange().getValues();
  const head = values[0].map(h => String(h).trim());
  return values.slice(1)
    .filter(r => r.some(c => c !== '' && c !== null))
    .map(r => { const o = {}; head.forEach((h, i) => { if (h) o[h] = r[i]; }); return o; });
}

function kvSheet_(name) {
  const o = {};
  rows_(name).forEach(r => {
    const k = String(r['Кілт'] || '').trim();
    if (k) o[k] = r['Мән'];
  });
  return o;
}

// ═══════════════ ОРНАТУ ЖӘНЕ ТОЛТЫРУ ═══════════════

/**
 * Бір рет іске қосыңыз: парақтарды жасайды және барлық деректі жазады.
 * Қайта іске қосылса — «Мәтіндер», «Паспорттар», «Статистика», «Есеп» сақталады,
 * қалған дерек парақтары жаңартылады.
 */
function setup() {
  const ss = SpreadsheetApp.getActive();

  const build = (name, header, rows, widths) => {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.clear();
    sh.getRange(1, 1, 1, header.length).setValues([header])
      .setFontWeight('bold').setBackground('#2563EB').setFontColor('#FFFFFF')
      .setVerticalAlignment('middle').setWrap(true);
    sh.setFrozenRows(1);
    sh.setRowHeight(1, 40);
    if (rows && rows.length) sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    if (widths) widths.forEach((w, i) => sh.setColumnWidth(i + 1, w));
    return sh;
  };

  build(CFG.SH.META, ['Кілт', 'Мән', 'Түсініктеме'], [["year", 2025, "Сайтта көрсетілетін есепті жыл"], ["years", "2025", "Сүзгідегі жылдар, үтірмен"], ["asOf", "01.01.2026", "Дерек қай күнгі жағдай бойынша"]], [150, 220, 400]);

  const nums = build(CFG.SH.NUMS, ['Бөлім', 'Кілт', 'Мән', 'Түсініктеме'],
    [["1. Негізгі көрсеткіштер", "totals.libs.p", 3890, "Кітапхана саны — 2024"], ["1. Негізгі көрсеткіштер", "totals.libs.v", 3889, "Кітапхана саны — 2025"], ["1. Негізгі көрсеткіштер", "totals.users.p", 5321372, "Пайдаланушылар — 2024"], ["1. Негізгі көрсеткіштер", "totals.users.v", 5540606, "Пайдаланушылар — 2025"], ["1. Негізгі көрсеткіштер", "totals.visits.p", 55063150, "Келім — 2024"], ["1. Негізгі көрсеткіштер", "totals.visits.v", 57010974, "Келім — 2025"], ["1. Негізгі көрсеткіштер", "totals.loans.p", 89904373, "Берілім — 2024"], ["1. Негізгі көрсеткіштер", "totals.loans.v", 88957968, "Берілім — 2025"], ["1. Негізгі көрсеткіштер", "totals.fund.p", 72629402, "Қор — 2024"], ["1. Негізгі көрсеткіштер", "totals.fund.v", 72740847, "Қор — 2025"], ["1. Негізгі көрсеткіштер", "totals.staff.p", 9616, "Кадр — 2024"], ["1. Негізгі көрсеткіштер", "totals.staff.v", 9579, "Кадр — 2025"], ["1. Негізгі көрсеткіштер", "country.allLibraries", 12141, "Елдегі барлық кітапхана (барлық ведомство)"], ["1. Негізгі көрсеткіштер", "country.population", 20495975, "Ел халқының саны"], ["1. Негізгі көрсеткіштер", "country.readingPct", 27.0, "Оқитын халық көрсеткіші, %"], ["3. Кітапхана желілері", "network.republican", 3, "Республикалық кітапхана"], ["3. Кітапхана желілері", "network.oblast", 36, "Облыстық"], ["3. Кітапхана желілері", "network.city", 334, "Қалалық"], ["3. Кітапхана желілері", "network.district", 171, "Аудандық"], ["3. Кітапхана желілері", "network.rural", 3056, "Ауылдық"], ["3. Кітапхана желілері", "network.points", 1230, "Кітапхана пункті"], ["3. Кітапхана желілері", "network.mobile", 417, "Жылжымалы кітапхана"], ["3. Кітапхана желілері", "network.model", 491, "Модельдік кітапхана"], ["3. Кітапхана желілері", "network.coworking", 459, "Коворкинг орталығы"], ["3. Кітапхана желілері", "network.opened", 11, "Жыл ішінде ашылды"], ["3. Кітапхана желілері", "network.closed", 12, "Жыл ішінде жабылды"], ["4. Пайдаланушылар және келім", "users.total", 5540606, "Пайдаланушылар — 2025"], ["4. Пайдаланушылар және келім", "users.prev", 5321372, "Пайдаланушылар — 2024"], ["4. Пайдаланушылар және келім", "users.children", 1754672, "15 жасқа дейінгі балалар"], ["4. Пайдаланушылар және келім", "users.childrenPct", 31.7, "Балалар үлесі, %"], ["4. Пайдаланушылар және келім", "users.youth", 1381409, "Жастар"], ["4. Пайдаланушылар және келім", "users.youthPct", 24.9, "Жастар үлесі, %"], ["4. Пайдаланушылар және келім", "users.adults", 2404525, "Ересектер"], ["4. Пайдаланушылар және келім", "users.adultsPct", 43.4, "Ересектер үлесі, %"], ["4. Пайдаланушылар және келім", "users.perLib", 1424, "Бір кітапханаға оқырман"], ["4. Пайдаланушылар және келім", "users.perLibDiff", 56, "Өткен жылмен айырма"], ["4. Пайдаланушылар және келім", "visits.total", 57010974, "Келім — барлығы"], ["4. Пайдаланушылар және келім", "visits.internet", 7312007, "Интернет арқылы келім"], ["4. Пайдаланушылар және келім", "visits.internetPct", 12.8, "Интернет келімінің үлесі, %"], ["6. Қор және толықтыру", "fund.total", 72740847, "Жалпы қор"], ["6. Қор және толықтыру", "fund.kazakh", 30336270, "Мемлекеттік тілдегі қор"], ["6. Қор және толықтыру", "fund.kazakhPct", 41.7, "Мемтіл үлесі, %"], ["6. Қор және толықтыру", "fund.national", 31672690, "Ұлттық қор"], ["6. Қор және толықтыру", "fund.nationalKz", 20737025, "Ұлттық қор — мемтілде"], ["6. Қор және толықтыру", "fund.nationalKzPct", 65.5, "Ұлттық қордағы мемтіл үлесі, %"], ["6. Қор және толықтыру", "fund.rare", 117829, "Сирек кітаптар мен қолжазба"], ["6. Қор және толықтыру", "acq.total", 906557, "Жаңа түсім"], ["6. Қор және толықтыру", "acq.kz", 662341, "Түсім — мемтілде"], ["6. Қор және толықтыру", "acq.kzPct", 70.1, "Түсімдегі мемтіл үлесі, %"], ["6. Қор және толықтыру", "acq.diff", -123011, "Өткен жылмен айырма (теріс болуы мүмкін)"], ["6. Қор және толықтыру", "acq.diffKz", -56757, "Мемтілдегі айырма"], ["6. Қор және толықтыру", "acq.perLib", 233, "Бір кітапханаға түсім"], ["6. Қор және толықтыру", "acq.perLibKz", 170, "Бір кітапханаға — мемтілде"], ["6. Қор және толықтыру", "renewal.fact", 1.3, "Қор жаңарту — нақты, %"], ["6. Қор және толықтыру", "renewal.prev", 1.4, "Қор жаңарту — 2024, %"], ["6. Қор және толықтыру", "renewal.norm", 5.0, "ИФЛА нормасы, %"], ["6. Қор және толықтыру", "supply.value", 13.1, "Кітаппен қамту — 2025"], ["6. Қор және толықтыру", "supply.prev", 13.7, "Кітаппен қамту — 2024"], ["7. Кітап берілімі", "loans.total", 88957968, "Берілген құжаттар"], ["7. Кітап берілімі", "loans.kz", 53472356, "Мемтілдегі берілім"], ["7. Кітап берілімі", "loans.kzPct", 60.1, "Мемтіл үлесі, %"], ["8. Цифрлы ресурстар", "digital.kazneb.views", 8000000, "Kazneb.kz қаралым"], ["8. Цифрлы ресурстар", "digital.kazneb.users", 700000, "Kazneb.kz пайдаланушы"], ["8. Цифрлы ресурстар", "digital.kazneb.visits", 1434295, "Kazneb.kz келім"], ["8. Цифрлы ресурстар", "digital.kazneb.uploads", 5110, "Жүктелген құжат"], ["8. Цифрлы ресурстар", "digital.kazneb.docs", 84000, "Электрондық құжат саны"], ["8. Цифрлы ресурстар", "digital.kazneb.countries", 122, "Ел саны"], ["8. Цифрлы ресурстар", "digital.kazneb.langs", 64, "Тіл саны"], ["8. Цифрлы ресурстар", "digital.automationPct", 26.9, "Автоматтандыру, %"], ["8. Цифрлы ресурстар", "digital.automationCount", 1050, "Автоматтандырылған кітапхана"], ["8. Цифрлы ресурстар", "digital.internetPct", 65.4, "Интернетке қолжетімділік, %"], ["8. Цифрлы ресурстар", "digital.db.total", 37971309, "Дерекқор — барлық жазба"], ["8. Цифрлы ресурстар", "digital.db.books", 24819594, "Кітаптарға жазба"], ["8. Цифрлы ресурстар", "digital.db.articles", 12488921, "Мақалаларға жазба"], ["8. Цифрлы ресурстар", "digital.db.digital", 433576, "Электрондық басылымдарға"], ["8. Цифрлы ресурстар", "digital.db.abstracts", 203923, "Рефераттарға"], ["8. Цифрлы ресурстар", "digital.db.online", 28148110, "Интернетте қолжетімді каталог"], ["8. Цифрлы ресурстар", "digital.copies", 1377175, "Көшірілген құжат атауы"], ["9. Кадрлар", "staff.total", 9579, "Мамандар — 2025"], ["9. Кадрлар", "staff.prev", 9616, "Мамандар — 2024"], ["9. Кадрлар", "staff.higherLib", 3619, "Жоғары кітапханалық білім"], ["9. Кадрлар", "staff.higherPct", 37.8, "Жоғары білім үлесі, %"], ["9. Кадрлар", "staff.secondary", 2202, "Арнаулы орта білім"], ["9. Кадрлар", "staff.secondaryPct", 23.0, "Арнаулы орта үлесі, %"], ["9. Кадрлар", "staff.noProfPct", 39.2, "Кәсіби білімі жоқ, %"], ["10. Ғылыми-әдістемелік қызмет", "method.ifla.countries", 114, "IFLA конгресіне қатысқан ел"], ["10. Ғылыми-әдістемелік қызмет", "method.ifla.specialists", 1600, "Конгресс қатысушысы"], ["10. Ғылыми-әдістемелік қызмет", "method.ifla.fromKz", 454, "Қазақстаннан қатысқан"], ["10. Ғылыми-әдістемелік қызмет", "method.ifla.sessions", 190, "Кәсіби сессия"], ["11. Баспа қызметі", "publish.total", 9548, "Барлық басылым"], ["12. Инфрақұрылым", "infra.typical", 90, "Үлгілік ғимаратта"], ["12. Инфрақұрылым", "infra.needRepair", 36, "Күрделі жөндеу қажет"], ["12. Инфрақұрылым", "infra.psd", 15, "ЖСҚ дайындалды"], ["12. Инфрақұрылым", "infra.modernized", 39, "Жаңғыртудан өтті"], ["12. Инфрақұрылым", "infra.modernRegions", 7, "Қамтылған облыс саны"]], [230, 240, 140, 380]);
  nums.getRange(2, 1, nums.getLastRow() - 1, 1).setBackground('#F8FAFC');

  const reg = build(CFG.SH.REGIONS,
    ['Атауы', 'Кітапхана', 'Қор', 'Қор_мемтіл', 'Берілім', 'Берілім_мемтіл',
     'Оқырман', 'Келім', 'Кадр', 'Халық', 'Оқитын_%',
     'Жаңарту_2024', 'Жаңарту_2025', 'Қамту_2024', 'Қамту_2025', 'Толықтыру'],
    [["Абай", 137, 2423740, 1033329, 2422398, 1382406, 174080, 3690466, 303, 595676, 29.2, 1.3, 1.6, 14.0, 13.9, 40533], ["Ақмола", 329, 4347408, 1517268, 5551023, 2288642, 315938, 3940923, 554, 789413, 40.0, 1.4, 1.3, 14.0, 13.8, 55627], ["Ақтөбе", 234, 3495735, 1696731, 4769889, 3586670, 343157, 2590152, 521, 955775, 35.9, 1.8, 1.1, 11.7, 10.2, 37781], ["Алматы", 144, 2726946, 1218430, 4877091, 3229337, 230003, 2726545, 313, 1596331, 14.4, 1.5, 0.9, 12.3, 11.9, 25494], ["Атырау", 138, 2584373, 1572372, 2638487, 2156860, 217991, 1270012, 388, 715930, 30.4, 1.1, 1.4, 11.8, 11.9, 36891], ["Батыс Қазақстан", 357, 5991787, 2686065, 5333884, 3800554, 292095, 2693336, 800, 695594, 42.0, 1.4, 1.0, 20.6, 20.5, 58730], ["Жамбыл", 275, 3865451, 2163003, 5827168, 4589062, 385574, 3220138, 628, 1215373, 31.7, 2.0, 1.9, 10.0, 10.0, 73319], ["Жетісу", 150, 2933110, 1301009, 4310833, 3268022, 214125, 2165409, 323, 687568, 31.1, 0.8, 0.8, 13.7, 13.7, 22109], ["Қарағанды", 256, 4452326, 1803158, 6059267, 2792395, 311389, 3623082, 724, 1131287, 27.5, 1.4, 1.3, 14.5, 14.3, 56602], ["Қостанай", 336, 4242692, 1457772, 6090550, 1925015, 293237, 3356288, 761, 821464, 35.7, 2.1, 2.1, 14.7, 14.5, 88029], ["Қызылорда", 209, 4560932, 2547242, 4320443, 3805304, 266103, 2369344, 456, 846135, 31.4, 0.7, 0.8, 17.8, 17.1, 34656], ["Маңғыстау", 70, 1491331, 745228, 1977699, 1555523, 284497, 1001828, 229, 819655, 34.7, 1.3, 1.4, 5.3, 5.2, 21610], ["Павлодар", 225, 2944946, 1315274, 3995729, 1815942, 349962, 2301653, 501, 745217, 47.0, 1.9, 1.5, 12.5, 8.4, 42901], ["Солтүстік Қазақстан", 318, 4040142, 1298435, 4679463, 1310982, 231754, 4646801, 527, 514156, 45.0, 1.4, 1.4, 15.1, 17.4, 56328], ["Түркістан", 388, 6059416, 3574706, 8023571, 6605609, 439702, 4149386, 818, 2148658, 20.5, 1.3, 1.1, 13.7, 13.8, 66942], ["Ұлытау", 52, 841903, 506849, 1254395, 915776, 62685, 654837, 209, 218993, 28.6, 1.7, 1.6, 13.8, 13.4, 13802], ["Шығыс Қазақстан", 170, 2967522, 984822, 5231001, 2114319, 289528, 3405265, 480, 718945, 40.3, 1.8, 1.7, 10.3, 10.2, 49831], ["Алматы қалалық ОКЖ", 30, 1372785, 435680, 1040670, 474389, 303848, 3171200, 311, 2347924, 16.7, "", "", 4.7, 4.5, 18067], ["Астана қалалық ОКЖ", 25, 761299, 242254, 2012470, 957069, 90951, 852993, 111, 1638233, 9.0, "", "", 8.9, 8.4, 12578], ["Шымкент қ., кітапх.", 43, 1846216, 636458, 4063994, 2490571, 297894, 1957904, 302, 1293648, 23.0, "", "", 6.4, 6.2, 29512], ["ҚР ЗНКААК", 1, 263069, 38357, 98822, 26172, 3006, 51624, 26, "", "", "", "", "", "", ""], ["ҚР ҰК", 1, 7212272, 1037486, 2115647, 1156395, 85569, 1811736, 183, "", "", "", "", "", "", 53843], ["ҚР ҰАК", 1, 1315446, 524342, 2263474, 1225342, 57518, 1360052, 111, "", "", "", "", "", "", 10654]],
    [200, 90, 120, 120, 120, 130, 110, 120, 80, 110, 90, 100, 100, 100, 100, 110]);
  reg.getRange(2, 2, reg.getLastRow() - 1, 15).setNumberFormat('# ##0.##');

  build(CFG.SH.LISTS, ['Тізім', 'Бөлім', 'Атауы', 'Мән1', 'Мән2', 'Мән3', 'Мән4'],
    [["agencyCount", "3. Ведомстволық бөліну", "ҚР көпшілік кітапханалары\n(ҚР Мәдениет және ақпарат министрлігі, жергілікті атқарушы орган)", 3889, "", "", ""], ["agencyCount", "3. Ведомстволық бөліну", "ҚР Оқу-ағарту министрлігінің кітапханалары", 8021, "", "", ""], ["agencyCount", "3. Ведомстволық бөліну", "ҚР Денсаулық сақтау министрлігінің кітапханалары", 17, "", "", ""], ["agencyCount", "3. Ведомстволық бөліну", "ҚР Ішкі істер министрлігінің кітапханалары", 2, "", "", ""], ["agencyCount", "3. Ведомстволық бөліну", "ҚР Қорғаныс министрлігінің кітапханалары", 44, "", "", ""], ["agencyCount", "3. Ведомстволық бөліну", "ҚР Әділет министрлігінің кітапханалары", 1, "", "", ""], ["agencyCount", "3. Ведомстволық бөліну", "«Республикалық ғылыми-техникалық кітапханалар» АҚ", 8, "", "", ""], ["agencyCount", "3. Ведомстволық бөліну", "ҚР ҒЖБМ Жоғары оқу орындарының кітапханалары", 122, "", "", ""], ["agencyCount", "3. Ведомстволық бөліну", "ҚР ҒЖБМ ҒК «Ғылым ордасы» Орталық ғылыми кітапханасы", 1, "", "", ""], ["agencyCount", "3. Ведомстволық бөліну", "«Қазақстан темір жолы» Ұлттық компаниясы АҚ кітапханалары", 36, "", "", ""], ["agencyCount", "3. Ведомстволық бөліну", "Барлығы:", 12141, "", "", ""], ["network.oblastTypes", "3. Облыстық кітапхана түрі", "Әмбебап ғылыми", 18, "", "", ""], ["network.oblastTypes", "3. Облыстық кітапхана түрі", "Балалар", 4, "", "", ""], ["network.oblastTypes", "3. Облыстық кітапхана түрі", "Жасөспірімдер", 2, "", "", ""], ["network.oblastTypes", "3. Облыстық кітапхана түрі", "Балалар мен жасөспірімдер", 5, "", "", ""], ["network.oblastTypes", "3. Облыстық кітапхана түрі", "Зағип азаматтарға арналған", 7, "", "", ""], ["fund.carriers", "6. Қор — тасымалдағыш", "Кітаптар", 64704199, 89.0, "", ""], ["fund.carriers", "6. Қор — тасымалдағыш", "Мерзімді басылымдар", 6043310, 8.3, "", ""], ["fund.carriers", "6. Қор — тасымалдағыш", "Электрондық, аудиовизуалды", 1993338, 2.7, "", ""], ["fund.topKazakhRegions", "6. Мемтіл үлесі жоғары өңір", "Атырау", 60.8, "", "", ""], ["fund.topKazakhRegions", "6. Мемтіл үлесі жоғары өңір", "Ұлытау", 60.2, "", "", ""], ["fund.topKazakhRegions", "6. Мемтіл үлесі жоғары өңір", "Түркістан", 59.0, "", "", ""], ["fund.topKazakhRegions", "6. Мемтіл үлесі жоғары өңір", "Жамбыл", 55.9, "", "", ""], ["fund.topKazakhRegions", "6. Мемтіл үлесі жоғары өңір", "Қызылорда", 55.8, "", "", ""], ["fund.topKazakhRegions", "6. Мемтіл үлесі жоғары өңір", "Маңғыстау", 50.0, "", "", ""], ["acq.byType", "6. Түсім — құжат түрі", "Кітаптар", 640833, "", "", ""], ["acq.byType", "6. Түсім — құжат түрі", "Мерзімді басылымдар", 247870, "", "", ""], ["acq.byType", "6. Түсім — құжат түрі", "Электрондық басылымдар", 9685, "", "", ""], ["acq.byType", "6. Түсім — құжат түрі", "Карта, нота, атлас", 8093, "", "", ""], ["acq.byType", "6. Түсім — құжат түрі", "Аудиовизуалды", 76, "", "", ""], ["subjects", "7. Салалық құрам", "Әлеуметтік-экономикалық ғылымдар", 16179885, 22.2, 18182641, 20.4], ["subjects", "7. Салалық құрам", "Жаратылыстану ғылымдары, медицина", 4671565, 6.4, 7350126, 8.3], ["subjects", "7. Салалық құрам", "Техникалық және ауыл шаруашылық ғылымдары", 5041091, 7.0, 5150908, 5.8], ["subjects", "7. Салалық құрам", "Өнер,  өнертану және спорт", 4099703, 5.6, 6991595, 7.9], ["subjects", "7. Салалық құрам", "Көркем әдебиет, тіл білімі, әдебиеттану", 42748603, 58.8, 51282698, 57.6], ["digital.abis", "8. АБИС жүйелері", "WEB-RABIS", 144, 13.7, "", ""], ["digital.abis", "8. АБИС жүйелері", "РАБИС", 709, 67.5, "", ""], ["digital.abis", "8. АБИС жүйелері", "АБИС", 1, 0.09, "", ""], ["digital.abis", "8. АБИС жүйелері", "Мега Рабис", 21, 2.0, "", ""], ["digital.abis", "8. АБИС жүйелері", "Кабис", 76, 7.2, "", ""], ["digital.abis", "8. АБИС жүйелері", "АИС СБ РК", 11, 1.0, "", ""], ["digital.abis", "8. АБИС жүйелері", "Ирбис", 41, 3.9, "", ""], ["digital.abis", "8. АБИС жүйелері", "RWбис-7", 17, 1.6, "", ""], ["digital.abis", "8. АБИС жүйелері", "Мега Про", 29, 2.8, "", ""], ["digital.abis", "8. АБИС жүйелері", "Қаз ҰЭК", 1, 0.1, "", ""], ["digital.hardware", "8. Техника өсімі", "Компьютер", 384, "", "", ""], ["digital.hardware", "8. Техника өсімі", "Көшірме техникасы", 448, "", "", ""], ["staff.age", "9. Жас құрылымы", "35 жасқа дейін", 2174, 22.7, "", ""], ["staff.age", "9. Жас құрылымы", "36–55 жас", 5232, 54.6, "", ""], ["staff.age", "9. Жас құрылымы", "56 жастан жоғары", 2153, 22.5, "", ""], ["staff.topSpecial", "9. Арнаулы білім — ТОП", "Шымкент қ.", 69.2, "", "", ""], ["staff.topSpecial", "9. Арнаулы білім — ТОП", "Қызылорда обл.", 66.4, "", "", ""], ["staff.topSpecial", "9. Арнаулы білім — ТОП", "ҚР ҰАК", 59.4, "", "", ""], ["staff.topSpecial", "9. Арнаулы білім — ТОП", "Батыс Қазақстан обл.", 59.0, "", "", ""], ["staff.topSpecial", "9. Арнаулы білім — ТОП", "ҚР ҰК", 55.7, "", "", ""], ["publish.items", "11. Басылым түрлері", "Әдістемелік құралдар", 1321, "", "", ""], ["publish.items", "11. Басылым түрлері", "Ағымдағы библиографиялық көрсеткіштер", 1151, "", "", ""], ["publish.items", "11. Басылым түрлері", "Ұсыныстық библиографиялық көрсеткіштер", 1090, "", "", ""], ["publish.items", "11. Басылым түрлері", "Ретроспективті көрсеткіштер", 265, "", "", ""], ["publish.items", "11. Басылым түрлері", "Электрондық басылымдар", 290, "", "", ""], ["publish.items", "11. Басылым түрлері", "Өзге басылымдар", 5431, "", "", ""], ["method.kostanay", "10. Қостанай обл. мысалы", "Көшпелі әдістемелік іс-шара", 393, "", "", ""], ["method.kostanay", "10. Қостанай обл. мысалы", "Консультация", 2494, "", "", ""], ["method.kostanay", "10. Қостанай обл. мысалы", "Әдістемелік материал", 346, "", "", ""], ["method.kostanay", "10. Қостанай обл. мысалы", "Семинар", 59, "", "", ""], ["method.kostanay", "10. Қостанай обл. мысалы", "Практикум", 84, "", "", ""], ["method.kostanay", "10. Қостанай обл. мысалы", "Тағылымдама", 54, "", "", ""], ["infra.repairByRegion", "12. Жөндеу қажет", "Қызылорда обл.", 12, "", "", ""], ["infra.repairByRegion", "12. Жөндеу қажет", "Павлодар обл.", 6, "", "", ""], ["infra.repairByRegion", "12. Жөндеу қажет", "Шығыс Қазақстан обл.", 3, "", "", ""], ["infra.repairByRegion", "12. Жөндеу қажет", "Ақмола обл.", 2, "", "", ""], ["infra.repairByRegion", "12. Жөндеу қажет", "Жетісу обл.", 2, "", "", ""], ["infra.repairByRegion", "12. Жөндеу қажет", "Қарағанды обл.", 2, "", "", ""], ["infra.repairByRegion", "12. Жөндеу қажет", "Қостанай обл.", 2, "", "", ""], ["infra.repairByRegion", "12. Жөндеу қажет", "Солтүстік Қазақстан обл.", 2, "", "", ""], ["infra.modernByRegion", "12. Жаңғыртылған", "Батыс Қазақстан обл.", 23, "", "", ""], ["infra.modernByRegion", "12. Жаңғыртылған", "Солтүстік Қазақстан обл.", 6, "", "", ""], ["infra.modernByRegion", "12. Жаңғыртылған", "Алматы обл.", 3, "", "", ""], ["infra.modernByRegion", "12. Жаңғыртылған", "Павлодар обл.", 3, "", "", ""], ["infra.modernByRegion", "12. Жаңғыртылған", "Жамбыл обл.", 2, "", "", ""], ["infra.modernByRegion", "12. Жаңғыртылған", "Маңғыстау обл.", 1, "", "", ""], ["infra.modernByRegion", "12. Жаңғыртылған", "Ұлытау обл.", 1, "", "", ""]], [190, 230, 330, 110, 110, 110, 110]);

  build(CFG.SH.AGENCIES, ['Атауы', 'Қор', 'Оқырман', 'Берілім', 'Келім', 'Кадр'],
    [["ҚР көпшілік кітапханалары", 72740847, 5540606, 88957968, 57010974, 9579], ["ҚР ОАМ", 168235437, 4165006, 53967483, 34935498, 8441], ["ҚР ДСМ", 4728422, 63929, 1817345, 1823454, 123], ["ҚР ІІМ", 9220, 89, 460, 89, 1], ["ҚР ҚМ", 531543, 19228, 514872, 402067, 52], ["ҚР ӘМ", 20000, 86, 980, 86, 1], ["«РҒТК» АҚ", 32080000, 37521, 1333122, 474636, 71], ["ҚР ҒЖБМ Жоғары оқу орындарының кітапханалары", 56950370, 2337582, 15543980, 14584361, 1382], ["ҚР ҒЖБМ ҒК «Ғылым ордасы» ОҒК", 5800000, 260, 3461, 31715, 43], ["«ҚТЖ» ҰК» АҚ", 501103, 9687, 63942, 34592, 42]], [380, 130, 120, 130, 130, 100]);

  const ev = build(CFG.SH.EVENTS,
    ['Күні', 'Ай', 'Түрі_kk', 'Түрі_ru', 'Түрі_en',
     'Тақырып_kk', 'Тақырып_ru', 'Тақырып_en',
     'Сипаттама_kk', 'Сипаттама_ru', 'Сипаттама_en', 'Сілтеме', 'Белсенді'],
    [["18–22", "ТАМ", "Халықаралық конгресс", "", "", "IFLA Дүниежүзілік кітапхана және ақпарат конгресі, Астана", "Всемирный библиотечный и информационный конгресс IFLA, Астана", "IFLA World Library and Information Congress, Astana", "114 елден 1600 маман қатысты, Қазақстаннан — 454 кітапханашы; 190-нан астам сессия өтті.", "Участвовали 1600 специалистов из 114 стран, из Казахстана — 454 библиотекаря; прошло более 190 сессий.", "1,600 specialists from 114 countries took part, including 454 from Kazakhstan; over 190 sessions were held.", "", "иә"], ["09–10", "ҚЫР", "Республикалық форум", "", "", "«Жас серпін – 2025» жастар форумы, Түркістан", "Молодёжный форум «Жас серпін – 2025», Туркестан", "«Zhas Serpin 2025» youth forum, Turkistan", "Жас кітапханашылардың кәсіби әлеуетін дамытуға арналған панельдік сессия.", "Панельная сессия по развитию профессионального потенциала молодых библиотекарей.", "A panel session on developing the professional potential of young librarians.", "", "иә"], ["17–18", "ҚЫР", "Отырыс", "", "", "Қазақстан Кітапханалар Одағының көшпелі отырысы, Шымкент", "Выездное заседание Библиотечного союза Казахстана, Шымкент", "Field session of the Library Union of Kazakhstan, Shymkent", "Оқу мәдениеті, жасанды интеллект және цифрландыру мәселелері қаралды.", "Рассмотрены вопросы культуры чтения, искусственного интеллекта и цифровизации.", "Reading culture, artificial intelligence and digitalisation were discussed.", "", "иә"], ["17", "ҚАЗ", "Байқау", "", "", "«Үздік жас кітапханашы – 2025» республикалық байқауы", "Республиканский конкурс «Лучший молодой библиотекарь – 2025»", "«Best Young Librarian 2025» national competition", "18 өңірден 18 үміткер үш кезеңде бақ сынады; бас жүлде — Жетісу облысына.", "18 кандидатов из 18 регионов соревновались в трёх турах; гран-при — Жетысуской области.", "18 candidates from 18 regions competed in three rounds; the grand prize went to Zhetysu region.", "", "иә"], ["30", "ҚАЗ", "Кәсіби шеберхана", "", "", "«Қазіргі кітапхана – жаңа буынның тұлғалық даму аймағы», Арқалық", "«Современная библиотека — пространство развития нового поколения», Аркалык", "«The modern library as a space for a new generation», Arkalyk", "Заманауи кітапхананың рөлі мен жас буынмен жұмыс тәжірибесі талқыланды.", "Обсуждались роль современной библиотеки и опыт работы с молодым поколением.", "The role of the modern library and experience of working with young people were discussed.", "", "иә"], ["05", "ҚАР", "Республикалық конференция", "", "", "«Цифрлы қоғам және кітапхана», Тараз", "«Цифровое общество и библиотека», Тараз", "«Digital society and the library», Taraz", "ҚР МАМ Архив, құжаттама және кітап ісі комитетінің ұйымдастыруымен өтті.", "Организована Комитетом архивов, документации и книжного дела МКИ РК.", "Organised by the Committee for Archives, Documentation and Book Affairs.", "", "иә"], ["19–21", "ҚАР", "Халықаралық отырыс", "", "", "ЭЫҰ мүше мемлекеттерінің Ұлттық кітапханалары отырысы, Анкара", "Заседание национальных библиотек стран-членов ОЭС, Анкара", "Meeting of ECO member states' national libraries, Ankara", "Кітапханааралық ынтымақтастық пен цифрлық ресурстар мәселесі қаралды.", "Рассмотрены вопросы межбиблиотечного сотрудничества и цифровых ресурсов.", "Interlibrary cooperation and digital resources were on the agenda.", "", "иә"], ["01–02", "ЖЕЛ", "Біліктілік арттыру", "", "", "«Кәсіби қызметтегі жасанды интеллект» курсы, Көкшетау", "Курс «Искусственный интеллект в профессиональной деятельности», Кокшетау", "«AI in professional practice» course, Kokshetau", "Мәдениет ұйымдары мамандарына арналған курсты ҚР ҰК маманы жүргізді.", "Курс для специалистов организаций культуры провёл специалист НБ РК.", "The course for culture sector specialists was led by an NLRK expert.", "", "иә"]],
    [70, 60, 150, 150, 150, 300, 300, 300, 340, 340, 340, 200, 90]);
  ev.getRange(2, 2, 300, 1).setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(['ҚАҢ','АҚП','НАУ','СӘУ','МАМ','МАУ','ШІЛ','ТАМ','ҚЫР','ҚАЗ','ҚАР','ЖЕЛ'], true).build());
  ev.getRange(2, 13, 300, 1).setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(['иә', 'жоқ'], true).build());
  ev.getRange(2, 1, 300, 13).setVerticalAlignment('top').setWrap(true);

  // Паспорттар парағы жоқ болса — құрамыз (бар болса, деректі сақтаймыз)
  if (!ss.getSheetByName(CFG.SH.PASSPORTS)) setupPassportSheet();

  // Мәтіндер парағы бар болса — сақтаймыз
  if (!ss.getSheetByName(CFG.SH.TXT)) {
    build(CFG.SH.TXT, ['Кілт', 'kk', 'ru', 'en', 'Түсініктеме'], [
      ['tagline', 'Кітапхана — сандар тілінде', 'Библиотека — на языке цифр',
       'The library in numbers', 'Басты беттегі ұран']
    ], [160, 300, 300, 300, 280]);
  }

  build(CFG.SH.NAMES, ['Атауы_kk', 'ru', 'en'], [["Абай", "Абайская", "Abai"], ["Ақмола", "Акмолинская", "Akmola"], ["Ақмола обл.", "Акмолинская обл.", "Akmola reg."], ["Ақтөбе", "Актюбинская", "Aktobe"], ["Алматы", "Алматинская", "Almaty"], ["Алматы обл.", "Алматинская обл.", "Almaty reg."], ["Атырау", "Атырауская", "Atyrau"], ["Батыс Қазақстан", "Западно-Казахстанская", "West Kazakhstan"], ["Батыс Қазақстан обл.", "Западно-Казахстанская обл.", "West Kazakhstan reg."], ["Жамбыл", "Жамбылская", "Zhambyl"], ["Жамбыл обл.", "Жамбылская обл.", "Zhambyl reg."], ["Жетісу", "Жетысуская", "Zhetysu"], ["Жетісу обл.", "Жетысуская обл.", "Zhetysu reg."], ["Қарағанды", "Карагандинская", "Karaganda"], ["Қарағанды обл.", "Карагандинская обл.", "Karaganda reg."], ["Қостанай", "Костанайская", "Kostanay"], ["Қостанай обл.", "Костанайская обл.", "Kostanay reg."], ["Қызылорда", "Кызылординская", "Kyzylorda"], ["Қызылорда обл.", "Кызылординская обл.", "Kyzylorda reg."], ["Маңғыстау", "Мангистауская", "Mangystau"], ["Маңғыстау обл.", "Мангистауская обл.", "Mangystau reg."], ["Павлодар", "Павлодарская", "Pavlodar"], ["Павлодар обл.", "Павлодарская обл.", "Pavlodar reg."], ["Солтүстік Қазақстан", "Северо-Казахстанская", "North Kazakhstan"], ["Солтүстік Қазақстан обл.", "Северо-Казахстанская обл.", "North Kazakhstan reg."], ["Түркістан", "Туркестанская", "Turkistan"], ["Ұлытау", "Улытауская", "Ulytau"], ["Ұлытау обл.", "Улытауская обл.", "Ulytau reg."], ["Шығыс Қазақстан", "Восточно-Казахстанская", "East Kazakhstan"], ["Шығыс Қазақстан обл.", "Восточно-Казахстанская обл.", "East Kazakhstan reg."], ["Алматы қ. ОКЖ", "ЦБС г. Алматы", "Almaty city LS"], ["Алматы қалалық ОКЖ", "Городская ЦБС Алматы", "Almaty city library system"], ["Астана қ. ОКЖ", "ЦБС г. Астана", "Astana city LS"], ["Астана қалалық ОКЖ", "Городская ЦБС Астаны", "Astana city library system"], ["Шымкент қ.", "г. Шымкент", "Shymkent city"], ["Шымкент қ. кітапханалары", "Библиотеки г. Шымкент", "Shymkent city libraries"], ["Шымкент қ., кітапх.", "г. Шымкент, б-ки", "Shymkent, libs."], ["ҚР ҰК", "НБ РК", "NLRK"], ["ҚР ҰАК", "НАБ РК", "NASL RK"], ["ҚР ЗНКААК", "РБНЗГ РК", "Library for the blind RK"], ["ҚР көпшілік кітапханалары", "Публичные библиотеки РК", "Public libraries of Kazakhstan"], ["ҚР көпшілік кітапханалары\n(ҚР Мәдениет және ақпарат министрлігі, жергілікті атқарушы орган)", "Публичные библиотеки РК (МКИ РК, местные исполнительные органы)", "Public libraries (Ministry of Culture and Information, local authorities)"], ["ҚР Оқу-ағарту министрлігінің кітапханалары", "Библиотеки Министерства просвещения РК", "Libraries of the Ministry of Education"], ["ҚР Денсаулық сақтау министрлігінің кітапханалары", "Библиотеки Министерства здравоохранения РК", "Libraries of the Ministry of Health"], ["ҚР Ішкі істер министрлігінің кітапханалары", "Библиотеки Министерства внутренних дел РК", "Libraries of the Ministry of Internal Affairs"], ["ҚР Қорғаныс министрлігінің кітапханалары", "Библиотеки Министерства обороны РК", "Libraries of the Ministry of Defence"], ["ҚР Әділет министрлігінің кітапханалары", "Библиотеки Министерства юстиции РК", "Libraries of the Ministry of Justice"], ["«Республикалық ғылыми-техникалық кітапханалар» АҚ", "АО «Республиканские научно-технические библиотеки»", "JSC Republican Scientific and Technical Libraries"], ["ҚР ҒЖБМ Жоғары оқу орындарының кітапханалары", "Библиотеки вузов МНВО РК", "University libraries (Ministry of Science and Higher Education)"], ["ҚР ҒЖБМ ҒК «Ғылым ордасы» Орталық ғылыми кітапханасы", "ЦНБ «Ғылым ордасы» КН МНВО РК", "Central Scientific Library «Gylym Ordasy»"], ["ҚР ҒЖБМ ҒК «Ғылым ордасы» ОҒК", "ЦНБ «Ғылым ордасы»", "Central Scientific Library «Gylym Ordasy»"], ["«Қазақстан темір жолы» Ұлттық компаниясы АҚ кітапханалары", "Библиотеки АО «НК «Қазақстан темір жолы»", "Libraries of JSC NC Kazakhstan Temir Zholy"], ["«ҚТЖ» ҰК» АҚ", "АО «НК «ҚТЖ»", "JSC NC KTZh"], ["ҚР ОАМ", "МП РК", "Ministry of Education"], ["ҚР ДСМ", "МЗ РК", "Ministry of Health"], ["ҚР ІІМ", "МВД РК", "Ministry of Internal Affairs"], ["ҚР ҚМ", "МО РК", "Ministry of Defence"], ["ҚР ӘМ", "МЮ РК", "Ministry of Justice"], ["«РҒТК» АҚ", "АО «РНТБ»", "JSC RSTL"], ["Кітаптар", "Книги", "Books"], ["Мерзімді басылымдар", "Периодические издания", "Periodicals"], ["Электрондық, аудиовизуалды", "Электронные, аудиовизуальные", "Electronic and audiovisual"], ["Электрондық басылымдар", "Электронные издания", "Electronic publications"], ["Карта, нота, атлас", "Карты, ноты, атласы", "Maps, sheet music, atlases"], ["Аудиовизуалды", "Аудиовизуальные", "Audiovisual"], ["Әлеуметтік-экономикалық ғылымдар", "Социально-экономические науки", "Social and economic sciences"], ["Жаратылыстану ғылымдары, медицина", "Естественные науки, медицина", "Natural sciences and medicine"], ["Техникалық және ауыл шаруашылық ғылымдары", "Технические и сельскохозяйственные науки", "Engineering and agriculture"], ["Өнер,  өнертану және спорт", "Искусство, искусствоведение и спорт", "Arts and sport"], ["Көркем әдебиет, тіл білімі, әдебиеттану", "Художественная литература, языкознание", "Fiction, linguistics and literary studies"], ["Әмбебап ғылыми", "Универсальные научные", "Universal research"], ["Балалар", "Детские", "Children's"], ["Жасөспірімдер", "Юношеские", "Youth"], ["Балалар мен жасөспірімдер", "Детско-юношеские", "Children's and youth"], ["Зағип азаматтарға арналған", "Для незрячих граждан", "For visually impaired"], ["Ауылдық", "Сельские", "Rural"], ["Қалалық", "Городские", "City"], ["Аудандық", "Районные", "District"], ["Облыстық", "Областные", "Regional"], ["Республикалық", "Республиканские", "National"], ["Әдістемелік құралдар", "Методические пособия", "Methodological guides"], ["Ағымдағы библиографиялық көрсеткіштер", "Текущие библиографические указатели", "Current bibliographic indexes"], ["Ұсыныстық библиографиялық көрсеткіштер", "Рекомендательные библиографические указатели", "Recommended bibliographic indexes"], ["Ретроспективті көрсеткіштер", "Ретроспективные указатели", "Retrospective indexes"], ["Өзге басылымдар", "Прочие издания", "Other publications"], ["35 жасқа дейін", "До 35 лет", "Under 35"], ["36–55 жас", "36–55 лет", "36–55 years"], ["56 жастан жоғары", "Старше 56 лет", "Over 56"], ["Көшпелі әдістемелік іс-шара", "Выездные методические мероприятия", "Field methodological events"], ["Консультация", "Консультации", "Consultations"], ["Әдістемелік материал", "Методические материалы", "Methodological materials"], ["Семинар", "Семинары", "Seminars"], ["Практикум", "Практикумы", "Workshops"], ["Тағылымдама", "Стажировки", "Internships"], ["Компьютер", "Компьютеры", "Computers"], ["Көшірме техникасы", "Копировальная техника", "Copying equipment"], ["Кітаптарға библиографиялық жазба", "Библиозаписи на книги", "Bibliographic records for books"], ["Мақалаларға жазба", "Записи на статьи", "Records for articles"], ["Электрондық басылымдарға", "На электронные издания", "For electronic publications"], ["Рефераттарға", "На рефераты", "For abstracts"], ["Халықаралық конгресс", "Международный конгресс", "International congress"], ["Республикалық форум", "Республиканский форум", "National forum"], ["Отырыс", "Заседание", "Session"], ["Байқау", "Конкурс", "Competition"], ["Кәсіби шеберхана", "Профессиональная мастерская", "Professional workshop"], ["Республикалық конференция", "Республиканская конференция", "National conference"], ["Халықаралық отырыс", "Международное заседание", "International session"], ["Біліктілік арттыру", "Повышение квалификации", "Professional development"], ["ҚАҢ", "ЯНВ", "JAN"], ["АҚП", "ФЕВ", "FEB"], ["НАУ", "МАР", "MAR"], ["СӘУ", "АПР", "APR"], ["МАМ", "МАЙ", "MAY"], ["МАУ", "ИЮН", "JUN"], ["ШІЛ", "ИЮЛ", "JUL"], ["ТАМ", "АВГ", "AUG"], ["ҚЫР", "СЕН", "SEP"], ["ҚАЗ", "ОКТ", "OCT"], ["ҚАР", "НОЯ", "NOV"], ["ЖЕЛ", "ДЕК", "DEC"]], [280, 280, 280]);

  if (!ss.getSheetByName(CFG.SH.STATS)) {
    build(CFG.SH.STATS, ['Уақыт', 'Күні', 'Сағат', 'Бөлім', 'Тіл', 'Сілтеме',
      'Экран ені', 'Құрылғы', 'TZ'], [], [150, 100, 70, 130, 60, 240, 100, 100, 60]);
  }
  if (!ss.getSheetByName(CFG.SH.REPORT)) {
    build(CFG.SH.REPORT, ['Көрсеткіш', 'Мән'], [], [320, 120]);
  }

  // Артық парақтарды өшіру
  ['Лист1', 'Sheet1', 'Парақ1', 'Көрсеткіштер'].forEach(n => {
    const sh = ss.getSheetByName(n);
    if (sh && ss.getSheets().length > 1 && sh.getLastRow() < 2) ss.deleteSheet(sh);
  });

  clearCache_();
  ss.toast('Дайын! Барлық парақ құрылып, дерек жазылды.', 'LABA', 8);
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('LABA')
    .addItem('Кэшті тазарту (сайтты жаңарту)', 'refreshCache')
    .addItem('Статистика есебін жаңарту', 'buildStatsReport')
    .addSeparator()
    .addItem('Парақтарды орнату / деректі қалпына келтіру', 'setup')
    .addItem('«Паспорттар» парағын құру', 'setupPassportSheet')
    .addItem('Күнделікті есеп триггерін қосу', 'createDailyTrigger')
    .addToUi();
}

function createDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'buildStatsReport') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('buildStatsReport').timeBased().everyDays(1).atHour(6).create();
  SpreadsheetApp.getActive().toast('Күнделікті есеп триггері қосылды (06:00).', 'LABA', 5);
}
