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
 *    Паспорттар / Тізілім — «Кітапханалар паспорты» бөлімі (әр жол — бір кітапхана)
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

/** «Кітапханалар паспорты»: тізілімнің бағандары және олардың сайттағы кодтары.
 *  Бағандар тақырып атауы бойынша танылады, сондықтан ретін өзгертуге болады.
 *  Тізімде жоқ бағандар (мысалы, «Ескерту», «Дереккөз файл») сайтқа жіберілмейді. */
const PASSPORT_HEAD = [
  ['№', 'id'], ['Деңгей коды', 'lvl'], ['Мәртебесі', 't'], ['Санаты', 'cat'], ['Өңір', 'r'], ['Аудан / қала', 'd'],
  ['Кітапхана атауы', '1.1'], ['Сурет (сілтеме)', '1.2'], ['Мекенжайы', '1.3'], ['Телефон', '1.4'], ['E-mail', '1.5'], ['Сайт', '1.6'],
  ['Құрылған жылы', '2.1'], ['Ғимарат', '2.2'], ['Көлемі, м²', '2.3'], ['Оқу залы', '2.4'],
  ['Интернет', '3.1'], ['АКАЖ атауы', '3.2'], ['Электрондық кітапханаларға қолжетімділік', '3.3'],
  ['Пайдаланатын электрондық ресурстар', '3.4'], ['Компьютер', '3.5'], ['Сканер', '3.6'], ['Принтер', '3.7'],
  ['МФУ', '3.8'], ['Теледидар', '3.9'], ['Бейнекамера', '3.10'], ['Фотоаппарат', '3.11'],
  ['Жалпы қор', '4.1'], ['Мерзімді басылымдар', '4.2'], ['Электронды ресурстар', '4.3'], ['Электрондық каталог', '4.4'],
  ['Штат саны', '5.1'], ['Басшысы (аты-жөні, байланыс)', '5.2'],
  ['Пайдаланушылар саны', '6.1'], ['Берілген құжаттар', '6.2'], ['Келушілер саны', '6.3']
];
/** Баған атауының балама жазылуы */
const PASSPORT_ALIAS = { 'id': 'id', 'облыс': 'r', 'түрі': 't', 'сурет': '1.2', 'сурет (url)': '1.2', 'фото': '1.2' };
/** Паспорттар осы парақтардың біріне жазылады (бірінші табылғаны оқылады) */
const PASSPORT_SHEETS = ['Паспорттар', 'Тізілім'];
const PASSPORT_REGIONS = ['Республикалық деңгей', 'Абай облысы', 'Ақмола облысы', 'Ақтөбе облысы', 'Алматы облысы',
  'Атырау облысы', 'Батыс Қазақстан облысы', 'Жамбыл облысы', 'Жетісу облысы', 'Қарағанды облысы',
  'Қостанай облысы', 'Қызылорда облысы', 'Маңғыстау облысы', 'Павлодар облысы', 'Солтүстік Қазақстан облысы',
  'Түркістан облысы', 'Ұлытау облысы', 'Шығыс Қазақстан облысы', 'Астана қаласы', 'Алматы қаласы', 'Шымкент қаласы'];
const PASSPORT_TYPES = ['Республикалық', 'Облыстық', 'Республикалық маңызы бар қала', 'Қалалық', 'Аудандық', 'Ауылдық'];
/** Толтырылу есебіне кірмейтін өрістер (сурет пен сайт міндетті емес) */
const PASSPORT_OPTIONAL = ['1.2', '1.6'];
/** Сайттағы тізімге (жеңіл нұсқаға) жіберілетін бағандар */
const PASSPORT_INDEX_COLS = ['id', 'r', 'd', 't', 'cat', 'lvl', 'c', '1.1', '1.2', '1.3', '4.1', '6.1', '6.2', '6.3', 'q', 'u'];
const PASSPORT_CACHE_SEC = 21600;

// ═══════════════ ВЕБ-ҚОСЫМША ═══════════════

function doGet(e) {
  const p = (e && e.parameter) || {};
  const action = p.action || 'data';
  let out;
  try {
    if (action === 'hit') { logHit_(p); out = { ok: true }; }
    else if (action === 'stats') { out = { ok: true, stats: statsSummary_(Number(p.days) || 30) }; }
    else if (action === 'ping') { out = { ok: true, time: new Date().toISOString() }; }
    else if (action === 'passports') { out = Object.assign({ ok: true }, passportIndex_()); }
    else if (action === 'passport') { out = { ok: true, passport: passportById_(p.id) }; }
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

function clearCache_() { CacheService.getScriptCache().removeAll(['payload', 'pidx_n', 'cab_meta_n', 'cab_q_n', 'cab_users']); }

function refreshCache() {
  clearCache_();
  SpreadsheetApp.getActive().toast('Кэш тазартылды. Сайтты жаңартыңыз (Ctrl+F5).', 'LABA', 6);
}

// ═══════════════ КІТАПХАНАЛАР ПАСПОРТЫ ═══════════════
//  Дерек «Паспорттар» немесе «Тізілім» парағынан оқылады: әр жол — бір кітапхана.
//  Тақырып жолы парақтың алғашқы 10 жолының ішінен ізделеді («Кітапхана атауы» бағаны бар жол).
//  Тізім 6 сағатқа кэштеледі; парақты өзгерткенде кэш өзі тазарады (onEdit),
//  «LABA → Кэшті тазарту» мәзірі де тазартады.
//  «Сурет (сілтеме)» бағанына суреттің сілтемесі жазылады; Google Drive сілтемесі де болады
//  (файл «Сілтемесі бар кез келген адам — Көруші» болуы керек).

/** Бос «Паспорттар» парағын тізілім пішімінде құру. «Тізілім» не «Паспорттар» бар болса — ештеңе өзгермейді. */
function setupPassportSheet() {
  const ss = SpreadsheetApp.getActive();
  const has = passportSheet_();
  if (has) { ss.toast('«' + has.getName() + '» парағы бар — сайт соны оқиды.', 'LABA', 6); return; }
  const sh = ss.insertSheet(CFG.SH.PASSPORTS);
  const headers = PASSPORT_HEAD.map(h => h[0]);
  sh.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#2563EB').setFontColor('#FFFFFF')
    .setVerticalAlignment('middle').setWrap(true);
  sh.setFrozenRows(1);
  sh.setFrozenColumns(7);
  sh.setRowHeight(1, 52);
  sh.setColumnWidths(1, headers.length, 160);
  const rows = Math.max(sh.getMaxRows() - 1, 1);
  sh.getRange(2, 1, rows, headers.length).setNumberFormat('@');
  sh.getRange(2, 3, rows, 1).setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(PASSPORT_TYPES, true).build());
  sh.getRange(2, 5, rows, 1).setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(PASSPORT_REGIONS, true).build());
  ss.toast('«Паспорттар» парағы дайын.', 'LABA', 5);
}

function passportSheet_() {
  const ss = SpreadsheetApp.getActive();
  let first = null;
  for (let i = 0; i < PASSPORT_SHEETS.length; i++) {
    const sh = ss.getSheetByName(PASSPORT_SHEETS[i]);
    if (sh && sh.getLastRow() > 1) return sh;          // деректері бар парақ бірінші
    if (sh && !first) first = sh;
  }
  return first;
}

/** Баған тақырыбы → өріс коды: «Кітапхана атауы» → 1.1, «1.1 …» → 1.1 */
function passportKey_(h) {
  const t = String(h || '').replace(/\s+/g, ' ').trim();
  const m = t.match(/^(\d+\.\d+)\.?(\s|$)/);
  if (m) return m[1];
  const low = t.toLowerCase();
  const hit = PASSPORT_HEAD.find(x => x[0].toLowerCase() === low);
  return hit ? hit[1] : (PASSPORT_ALIAS[low] || '');
}

/** Тақырып жолы мен бағандардың орнын табу → {sh, headRow (1-ден), map:{код: баған индексі}} */
function passportLayout_() {
  const sh = passportSheet_();
  if (!sh || sh.getLastRow() < 2) return null;
  const n = Math.min(10, sh.getLastRow());
  const top = sh.getRange(1, 1, n, sh.getLastColumn()).getDisplayValues();
  for (let r = 0; r < top.length; r++) {
    const map = {};
    top[r].forEach((h, i) => { const k = passportKey_(h); if (k && !(k in map)) map[k] = i; });
    if ('1.1' in map) return { sh: sh, headRow: r + 1, map: map };
  }
  return null;
}

const PASSPORT_REQUIRED_ = () => PASSPORT_FIELDS.map(f => f[0]).filter(c => PASSPORT_OPTIONAL.indexOf(c) < 0);

function passportRow_(row, map, rowNum, required) {
  const g = k => (k in map) ? String(row[map[k]] == null ? '' : row[map[k]]).trim() : '';
  const f = {};
  PASSPORT_FIELDS.forEach(x => { const v = g(x[0]); if (v) f[x[0]] = v; });
  if (!f['1.1']) return null;
  if (f['1.2']) f['1.2'] = imageUrl_(f['1.2']);
  if (f['5.2']) { f['5.2'] = directorClean_(f['5.2']); if (!f['5.2']) delete f['5.2']; }
  return { id: g('id') || String(rowNum), r: g('r'), d: g('d'), t: g('t'), cat: g('cat'), lvl: g('lvl'),
           c: required.filter(c => f[c]).length, f: f };
}

/** Барлық паспорт → [{id, r, d, t, cat, lvl, c, f:{"1.1":"…", …}}] */
function getPassports_() {
  const L = passportLayout_();
  if (!L) return [];
  const last = L.sh.getLastRow();
  if (last <= L.headRow) return [];
  const values = L.sh.getRange(L.headRow + 1, 1, last - L.headRow, L.sh.getLastColumn()).getDisplayValues();
  const required = PASSPORT_REQUIRED_();
  const out = [];
  values.forEach((row, i) => {
    const x = passportRow_(row, L.map, L.headRow + 1 + i, required);
    if (x) out.push(x);
  });
  return out;
}

/** Бір кітапхананың толық паспорты (ID бойынша) */
function passportById_(id) {
  id = String(id || '').trim();
  const L = passportLayout_();
  if (!L || !id) return null;
  const last = L.sh.getLastRow(), lastCol = L.sh.getLastColumn();
  let rowNum = 0;
  if ('id' in L.map && last > L.headRow) {
    const cell = L.sh.getRange(L.headRow + 1, L.map.id + 1, last - L.headRow, 1)
      .createTextFinder(id).matchEntireCell(true).findNext();
    if (cell) rowNum = cell.getRow();
  }
  if (!rowNum && /^\d+$/.test(id) && Number(id) > L.headRow && Number(id) <= last) rowNum = Number(id);
  if (!rowNum) return null;
  const row = L.sh.getRange(rowNum, 1, 1, lastCol).getDisplayValues()[0];
  const x = passportRow_(row, L.map, rowNum, PASSPORT_REQUIRED_());
  if (x) quarterOverlay_(x, quarterLatestMap_());
  return x;
}

/** Әр кітапхананың ең соңғы тоқсандық жазбасы (ашық сайт үшін — жаңартушының аты көрсетілмейді) */
function quarterLatestMap_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(CAB.SH.QDATA);
  if (!sh || sh.getLastRow() < 2) return {};
  const all = cabQAll_(), best = {};
  Object.keys(all).forEach(k => {
    const o = all[k], id = String(o.lib_id);
    if (!best[id] || Number(o.year) * 10 + Number(o.quarter) > Number(best[id].year) * 10 + Number(best[id].quarter)) best[id] = o;
  });
  return best;
}
function quarterOverlay_(x, latest) {
  const o = latest[String(x.id)];
  if (!o) return;
  CAB.Q_FIELDS.forEach(f => { if (o.v[f] !== '' && o.v[f] != null) x.f[f] = String(o.v[f]); });
  x.q = o.year + '-' + o.quarter;
  x.u = String(o.updated_at || '').slice(0, 10);
}

/** Сайттағы тізімге арналған ықшам нұсқа: {cols:[…], rows:[[…]]}. Толық паспорт ашқанда бөлек жүктеледі. */
function passportIndex_() {
  const cache = CacheService.getScriptCache();
  try {
    const n = Number(cache.get('pidx_n') || 0);
    if (n) {
      const keys = [];
      for (let i = 0; i < n; i++) keys.push('pidx_' + i);
      const got = cache.getAll(keys);
      if (keys.every(k => got[k] != null)) return JSON.parse(keys.map(k => got[k]).join(''));
    }
  } catch (err) { /* кэш бүлінсе, қайта құрамыз */ }

  const cols = PASSPORT_INDEX_COLS;
  const latest = quarterLatestMap_();
  const rows = getPassports_().map(x => { quarterOverlay_(x, latest); return x; })
    .map(x => cols.map(k => /^\d+\.\d+$/.test(k) ? (x.f[k] || '') : (x[k] == null ? '' : x[k])));
  const out = { cols: cols, rows: rows };
  try {
    const s = JSON.stringify(out), size = 40000, parts = {};
    let n = 0;
    for (let i = 0; i < s.length; i += size) parts['pidx_' + (n++)] = s.slice(i, i + size);
    cache.putAll(parts, PASSPORT_CACHE_SEC);
    cache.put('pidx_n', String(n), PASSPORT_CACHE_SEC);
  } catch (err) { /* кэшке сыймаса, кэшсіз жұмыс істейміз */ }
  return out;
}

/** Паспорт парағы өзгергенде тізімнің кэшін тазарту (қарапайым триггер — өзі іске қосылады) */
function onEdit(e) {
  try {
    const n = e && e.range ? e.range.getSheet().getName() : '';
    if (PASSPORT_SHEETS.indexOf(n) > -1 || n === 'Тоқсандық' || n === 'Пайдаланушылар') {
      CacheService.getScriptCache().removeAll(['pidx_n', 'cab_meta_n', 'cab_q_n', 'cab_users']);
    }
  } catch (err) { /* елемейміз */ }
}

/** 5.2: тек аты-жөні мен байланыс телефоны (еңбек өтілі, білімі т.б. алынады) */
function directorClean_(v) {
  v = String(v || '').replace(/\s+/g, ' ').trim();
  if (!v) return '';
  const phoneRe = /\+?\d[\d\s()\-–.]{4,}\d/g;
  const isYears = m => /^(19|20)\d{2}\s*[-–.]\s*(19|20)?\d{2}$/.test(m.trim()) || /^(19|20)\d{2}$/.test(m.trim());
  const phones = [];
  v.replace(phoneRe, m => {
    const d = m.replace(/\D/g, '');
    if (d.length >= 6 && d.length <= 12 && !isYears(m)) phones.push(m.trim().replace(/[.]$/, ''));
    return m;
  });
  const first = v.split(/\s+\/\s+|\s*;\s*|\s*\n\s*/)[0];
  let name = first.replace(phoneRe, m => (isYears(m) ? m : ''))
    .replace(/\b(тел|телефон|байланыс телефоны|ұялы|сот|моб)\.?\s*:?/gi, '')
    .replace(/[\s,;:–\-/]+$/, '').trim();
  if (!/[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүІіҺһ]/.test(name)) name = '';
  const uniq = phones.filter((p, i) => phones.indexOf(p) === i);
  return [name].concat(uniq.length ? [uniq.join(', ')] : []).filter(Boolean).join(' / ');
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

  // Паспорттар парағы («Паспорттар» не «Тізілім») жоқ болса — құрамыз; бар болса, тимейміз
  if (!passportSheet_()) setupPassportSheet();

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
    .addSeparator()
    .addItem('Әдіскерлер кабинетін орнату', 'setupCabinet')
    .addItem('Журналдың тұтастығын тексеру', 'verifyLog')
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

// ═══════════════ ӘДІСКЕРЛЕР КАБИНЕТІ ═══════════════
//  Кіру жүйесі, рөлдер, тоқсандық жаңарту, журнал, есептер.
//  Барлық рұқсат осы жерде (серверде) тексеріледі: браузерден келген
//  кітапхана ID-і пайдаланушының аймағына кірмесе, сұрау орындалмайды.
//
//  Парақтар:
//    Тізілім          — кітапханалардың тұрақты деректері (атауы, мекенжайы…)
//    Тоқсандық        — тоқсан сайынғы көрсеткіштер (бір кітапхана × жыл × тоқсан = бір жол)
//    Пайдаланушылар   — әдіскерлер (пароль тек хэш түрінде)
//    Бірліктер        — аймақтар иерархиясы (көру үшін; Тізілімнен құралады)
//    Журнал           — барлық өзгеріс (тек жаңа жол қосылады, қорғалған, хэш тізбегі)
//
//  Иерархия: KZ (республика) → O:<облыс> немесе C:<республикалық маңызы бар қала>
//            → D:<облыс>|<аудан немесе облыстық қала> → кітапхана

const CAB = {
  SH: { QDATA: 'Тоқсандық', USERS: 'Пайдаланушылар', UNITS: 'Бірліктер', LOG: 'Журнал' },
  Q_FIELDS: ['6.1', '6.2', '6.3'],           // тоқсан сайын жаңартылатын негізгі көрсеткіштер
  Q_MAX: 100000000,                          // бір көрсеткіштің ең үлкен мәні
  SESSION_IDLE_SEC: 7200,                    // 2 сағат әрекетсіз болса — сессия жабылады
  SESSION_MAX_HOURS: 12,                     // бір сессияның ең ұзақ мерзімі
  LOCK_AFTER: 5, LOCK_MINUTES: 15,           // 5 рет қате пароль → 15 минутқа бұғаттау
  PBKDF2_ITER: 1500,
  DATA_URL: 'https://raw.githubusercontent.com/byNurlykhan/laba/main/data/passports/',
  DATA_CHUNKS: 20,
  IMPORT: { year: 2026, quarter: 3, label: 'Тізілім 01.10.2026 (импорт)', date: '2026-10-01 00:00' }
};
const ROLES = {
  admin: 'Бас әкімші', oblast: 'Облыстық әдіскер', district: 'Аудандық әдіскер',
  city: 'Қалалық әдіскер', republic: 'Республикалық кітапхана әдіскері'
};
const USER_COLS = ['user_id', 'login', 'full_name', 'position', 'role', 'unit_id', 'library_id', 'institution', 'phone',
  'status', 'pass_hash', 'salt', 'iter', 'failed_count', 'locked_until', 'last_login', 'created_at', 'created_by', 'updated_at'];
const QDATA_COLS = ['key', 'lib_id', 'year', 'quarter'].concat(CAB.Q_FIELDS)
  .concat(['updated_at', 'user_id', 'user_name', 'user_institution', 'user_phone', 'user_role']);
const LOG_COLS = ['Уақыт', 'Пайдаланушы', 'Деңгейі', 'Аймақ', 'Мекеме', 'Кітапхана', 'Жыл', 'Тоқсан', 'Өріс',
  'Ескі мән', 'Жаңа мән', 'Әрекет', 'user_id', 'lib_id', 'oblast_id', 'op_id', 'hash'];
const Q_ROMAN = ['', 'I', 'II', 'III', 'IV'];

// ───────── API: POST сұраулары (JSON, Content-Type: text/plain) ─────────
function doPost(e) {
  let out;
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    out = cabDispatch_(body);
  } catch (err) {
    out = { ok: false, error: err && err.code ? err.code : 'server', msg: String(err && err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function cabErr_(code, msg) { const e = new Error(msg || code); e.code = code; return e; }

function cabDispatch_(b) {
  const a = String(b.action || '');
  if (a === 'login') return cabLogin_(b.login, b.password);
  const s = cabSession_(b.token);                 // сессия мен пайдаланушыны тексеру
  const u = s.user;
  switch (a) {
    case 'logout': cabLogout_(b.token); return { ok: true };
    case 'me': return { ok: true, user: cabPublicUser_(u), units: cabUnitsFor_(u), qfields: CAB.Q_FIELDS, roles: ROLES };
    case 'libs': return cabLibs_(u, b);
    case 'lib': return cabLib_(u, b);
    case 'save': return cabSave_(u, b);
    case 'saveStatic': cabNeed_(u, 'admin'); return cabSaveStatic_(u, b);
    case 'history': return cabHistory_(u, b, false);
    case 'log': cabNeed_(u, 'admin'); return cabHistory_(u, b, true);
    case 'report': return cabReport_(u, b);
    case 'users': cabNeed_(u, 'admin'); return { ok: true, users: cabUsers_().map(cabPublicUser_) };
    case 'userSave': cabNeed_(u, 'admin'); return cabUserSave_(u, b.user || {});
    case 'userPassword': cabNeed_(u, 'admin'); return cabUserPassword_(u, b.user_id, b.password);
    case 'userStatus': cabNeed_(u, 'admin'); return cabUserStatus_(u, b.user_id, b.status);
    case 'userBulk': cabNeed_(u, 'admin'); return cabUserBulk_(u, b.rows || []);
    case 'allUnits': cabNeed_(u, 'admin'); return { ok: true, units: cabAllUnits_(), libs: cabRepLibs_() };
    default: throw cabErr_('bad_action', 'Белгісіз әрекет');
  }
}

function cabNeed_(u, role) { if (u.role !== role) throw cabErr_('forbidden', 'Рұқсат жоқ'); }

// ───────── Кріптография ─────────
function hex_(bytes) { return bytes.map(b => ('0' + (b & 255).toString(16)).slice(-2)).join(''); }
function unhex_(h) { const o = []; for (let i = 0; i < h.length; i += 2) { let v = parseInt(h.substr(i, 2), 16); o.push(v > 127 ? v - 256 : v); } return o; }
function sha256hex_(s) { return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8)); }
function randHex_(n) {
  let s = '';
  while (s.length < n) s += sha256hex_(Utilities.getUuid() + Utilities.getUuid() + Date.now() + Math.random());
  return s.slice(0, n);
}
/** PBKDF2-HMAC-SHA256: парольді тұзбен көп рет хэштеу (ашық түрде сақталмайды) */
function pbkdf2_(password, saltHex, iter) {
  const pw = Utilities.newBlob(String(password)).getBytes();
  let u = Utilities.computeHmacSha256Signature(unhex_(saltHex).concat([0, 0, 0, 1]), pw);
  const t = u.slice();
  for (let i = 1; i < iter; i++) {
    u = Utilities.computeHmacSha256Signature(u, pw);
    for (let j = 0; j < t.length; j++) t[j] ^= u[j];
  }
  return hex_(t);
}
/** Бір реттік оқылатын пароль: 10 таңба, шатасатын таңбасыз */
function genPassword_() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  for (let tries = 0; tries < 50; tries++) {
    const h = randHex_(40);
    let p = '';
    for (let i = 0; i < 10; i++) p += abc[parseInt(h.substr(i * 4, 4), 16) % abc.length];
    if (!passwordProblem_(p)) return p;                 // әріп те, сан да болуы керек
  }
  return 'Laba' + randHex_(6) + '7';
}
function passwordProblem_(p) {
  p = String(p || '');
  if (p.length < 8) return 'Пароль кемінде 8 таңба болуы керек';
  if (!/[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүІіҺһ]/.test(p) || !/\d/.test(p)) return 'Парольде әріп те, сан да болуы керек';
  return '';
}

// ───────── Сессия ─────────
function cabLogin_(login, password) {
  login = String(login || '').trim().toLowerCase();
  if (!login || !password) throw cabErr_('bad_login', 'Логин мен парольді енгізіңіз');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const users = cabUsers_();
    const u = users.find(x => String(x.login).toLowerCase() === login);
    const now = Date.now();
    if (!u) { Utilities.sleep(400); throw cabErr_('bad_login', 'Логин немесе пароль қате'); }
    if (u.status !== 'active') throw cabErr_('blocked', 'Аккаунт бұғатталған. Бас әкімшіге хабарласыңыз');
    if (u.locked_until && Number(u.locked_until) > now) {
      throw cabErr_('locked', 'Пароль бірнеше рет қате енгізілді. ' +
        Math.ceil((Number(u.locked_until) - now) / 60000) + ' минуттан кейін қайталаңыз');
    }
    if (pbkdf2_(password, u.salt, Number(u.iter) || CAB.PBKDF2_ITER) !== u.pass_hash) {
      const fails = (Number(u.failed_count) || 0) + 1;
      const patch = { failed_count: fails >= CAB.LOCK_AFTER ? 0 : fails };
      if (fails >= CAB.LOCK_AFTER) patch.locked_until = now + CAB.LOCK_MINUTES * 60000;
      cabUserPatch_(u, patch);
      throw cabErr_('bad_login', fails >= CAB.LOCK_AFTER
        ? 'Пароль ' + CAB.LOCK_AFTER + ' рет қате енгізілді. Аккаунт ' + CAB.LOCK_MINUTES + ' минутқа бұғатталды'
        : 'Логин немесе пароль қате (қалған әрекет: ' + (CAB.LOCK_AFTER - fails) + ')');
    }
    cabUserPatch_(u, { failed_count: 0, locked_until: '', last_login: cabNow_() });
    const token = randHex_(48);
    const sess = { uid: u.user_id, exp: now + CAB.SESSION_MAX_HOURS * 3600000 };
    CacheService.getScriptCache().put('sess_' + sha256hex_(token), JSON.stringify(sess), CAB.SESSION_IDLE_SEC);
    return { ok: true, token: token, user: cabPublicUser_(u), units: cabUnitsFor_(u), qfields: CAB.Q_FIELDS, roles: ROLES,
             idle: CAB.SESSION_IDLE_SEC };
  } finally { lock.releaseLock(); }
}
function cabSession_(token) {
  if (!token) throw cabErr_('auth', 'Кіру қажет');
  const cache = CacheService.getScriptCache(), key = 'sess_' + sha256hex_(token);
  const raw = cache.get(key);
  if (!raw) throw cabErr_('auth', 'Сессия уақыты аяқталды. Қайта кіріңіз');
  const s = JSON.parse(raw);
  if (Date.now() > s.exp) { cache.remove(key); throw cabErr_('auth', 'Сессия уақыты аяқталды. Қайта кіріңіз'); }
  const u = cabUsers_().find(x => x.user_id === s.uid);
  if (!u || u.status !== 'active') { cache.remove(key); throw cabErr_('auth', 'Аккаунт бұғатталған'); }
  cache.put(key, raw, CAB.SESSION_IDLE_SEC);           // әрекет болса — мерзім ұзарады
  return { user: u };
}
function cabLogout_(token) { if (token) CacheService.getScriptCache().remove('sess_' + sha256hex_(token)); }

// ───────── Пайдаланушылар ─────────
function cabSheet_(name, cols) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold')
      .setBackground('#2563EB').setFontColor('#FFFFFF');
    sh.getRange(1, 1, sh.getMaxRows(), cols.length).setNumberFormat('@');
    sh.setFrozenRows(1);
  }
  return sh;
}
function cabUsers_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('cab_users');
  if (hit) return JSON.parse(hit);
  const sh = cabSheet_(CAB.SH.USERS, USER_COLS);
  const last = sh.getLastRow();
  const users = last < 2 ? [] : sh.getRange(2, 1, last - 1, USER_COLS.length).getValues().map((r, i) => {
    const o = { _row: i + 2 };
    USER_COLS.forEach((c, j) => { o[c] = r[j] instanceof Date ? cabFmt_(r[j]) : String(r[j] == null ? '' : r[j]); });
    return o;
  }).filter(o => o.user_id);
  try { cache.put('cab_users', JSON.stringify(users), 60); } catch (err) { /* үлкен болса — кэшсіз */ }
  return users;
}
function cabUserPatch_(u, patch) {
  const sh = cabSheet_(CAB.SH.USERS, USER_COLS);
  Object.keys(patch).forEach(k => {
    const j = USER_COLS.indexOf(k);
    if (j > -1) sh.getRange(u._row, j + 1).setNumberFormat('@').setValue(String(patch[k] == null ? '' : patch[k]));
    u[k] = String(patch[k]);
  });
  CacheService.getScriptCache().remove('cab_users');
}
function cabPublicUser_(u) {
  const o = {};
  ['user_id', 'login', 'full_name', 'position', 'role', 'unit_id', 'library_id', 'institution', 'phone', 'status',
   'last_login', 'created_at', 'locked_until'].forEach(k => { o[k] = u[k]; });
  o.role_name = ROLES[u.role] || u.role;
  o.unit_name = cabUnitName_(u.unit_id);
  return o;
}
function cabUserValidate_(x, isNew) {
  const units = cabAllUnits_();
  const role = String(x.role || '');
  if (!ROLES[role]) throw cabErr_('invalid', 'Деңгейі дұрыс емес');
  if (!/^[a-z0-9._-]{3,40}$/i.test(String(x.login || ''))) throw cabErr_('invalid', 'Логин: 3–40 таңба, латын әрпі, сан, . _ -');
  if (!String(x.full_name || '').trim()) throw cabErr_('invalid', 'Аты-жөнін енгізіңіз');
  const need = { oblast: ['oblast'], district: ['district', 'city'], city: ['rcity'], republic: ['republic'], admin: ['republic'] }[role];
  if (role === 'republic') {
    const libs = cabRepLibs_();
    if (!libs.some(l => String(l.id) === String(x.library_id))) throw cabErr_('invalid', 'Республикалық кітапхананы таңдаңыз');
    x.unit_id = 'KZ';
  } else if (role === 'admin') {
    x.unit_id = 'KZ'; x.library_id = '';
  } else {
    const unit = units.find(n => n.id === x.unit_id);
    if (!unit || need.indexOf(unit.type) < 0) throw cabErr_('invalid', 'Аймақты таңдаңыз');
    x.library_id = '';
  }
}
function cabUserSave_(admin, x) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    x.login = String(x.login || '').trim().toLowerCase();
    cabUserValidate_(x, !x.user_id);
    const users = cabUsers_();
    if (users.some(o => o.login.toLowerCase() === x.login && o.user_id !== x.user_id)) throw cabErr_('invalid', 'Бұл логин бос емес');
    const sh = cabSheet_(CAB.SH.USERS, USER_COLS);
    const fields = ['login', 'full_name', 'position', 'role', 'unit_id', 'library_id', 'institution', 'phone'];
    let password = '';
    if (!x.user_id) {
      password = x.password ? String(x.password) : genPassword_();
      const prob = passwordProblem_(password); if (prob) throw cabErr_('invalid', prob);
      const salt = randHex_(32);
      const row = {
        user_id: 'u' + randHex_(10), status: 'active', salt: salt, iter: CAB.PBKDF2_ITER,
        pass_hash: pbkdf2_(password, salt, CAB.PBKDF2_ITER), failed_count: 0, locked_until: '', last_login: '',
        created_at: cabNow_(), created_by: admin.full_name, updated_at: cabNow_()
      };
      fields.forEach(f => { row[f] = String(x[f] == null ? '' : x[f]).trim(); });
      writeRows_(sh, sh.getLastRow() + 1, [USER_COLS.map(c => row[c] == null ? '' : row[c])]);
      CacheService.getScriptCache().remove('cab_users');
      cabLogAppend_(admin, [{ lib: null, field: 'Аккаунт', old: '', val: row.login + ' · ' + ROLES[row.role] + ' · ' + cabUnitName_(row.unit_id), action: 'Аккаунт жасалды' }]);
      return { ok: true, user: cabPublicUser_(row), password: x.password ? '' : password };
    }
    const u = users.find(o => o.user_id === x.user_id);
    if (!u) throw cabErr_('invalid', 'Пайдаланушы табылмады');
    const patch = { updated_at: cabNow_() }, changes = [];
    fields.forEach(f => {
      const v = String(x[f] == null ? '' : x[f]).trim();
      if (v !== String(u[f])) { patch[f] = v; changes.push({ lib: null, field: 'Аккаунт: ' + f, old: u[f], val: v, action: 'Аккаунт өзгертілді (' + u.login + ')' }); }
    });
    cabUserPatch_(u, patch);
    if (changes.length) cabLogAppend_(admin, changes);
    return { ok: true, user: cabPublicUser_(u) };
  } finally { lock.releaseLock(); }
}
function cabUserPassword_(admin, userId, password) {
  const u = cabUsers_().find(o => o.user_id === userId);
  if (!u) throw cabErr_('invalid', 'Пайдаланушы табылмады');
  const generated = !password;
  password = password ? String(password) : genPassword_();
  const prob = passwordProblem_(password); if (prob) throw cabErr_('invalid', prob);
  const salt = randHex_(32);
  cabUserPatch_(u, { salt: salt, iter: CAB.PBKDF2_ITER, pass_hash: pbkdf2_(password, salt, CAB.PBKDF2_ITER),
                     failed_count: 0, locked_until: '', updated_at: cabNow_() });
  cabLogAppend_(admin, [{ lib: null, field: 'Пароль', old: '', val: '••••••', action: 'Пароль ауыстырылды (' + u.login + ')' }]);
  return { ok: true, password: generated ? password : '' };
}
function cabUserStatus_(admin, userId, status) {
  if (['active', 'blocked'].indexOf(status) < 0) throw cabErr_('invalid', 'Күй дұрыс емес');
  const u = cabUsers_().find(o => o.user_id === userId);
  if (!u) throw cabErr_('invalid', 'Пайдаланушы табылмады');
  if (u.user_id === admin.user_id) throw cabErr_('invalid', 'Өз аккаунтыңызды бұғаттай алмайсыз');
  cabUserPatch_(u, { status: status, failed_count: 0, locked_until: '', updated_at: cabNow_() });
  cabLogAppend_(admin, [{ lib: null, field: 'Күйі', old: u.status === 'active' ? 'blocked' : 'active', val: status,
                          action: (status === 'blocked' ? 'Аккаунт бұғатталды (' : 'Аккаунт ашылды (') + u.login + ')' }]);
  return { ok: true, user: cabPublicUser_(u) };
}
/** Excel/CSV-тен бірнеше аккаунт: rows = [{login, full_name, position, role, unit_id|unit_name, library_id, institution, phone, password}] */
function cabUserBulk_(admin, rows) {
  const out = [];
  const units = cabAllUnits_();
  rows.slice(0, 500).forEach((x, i) => {
    try {
      if (!x.unit_id && x.unit_name) {
        const nm = String(x.unit_name).trim().toLowerCase();
        const hit = units.find(n => n.name.toLowerCase() === nm || n.full.toLowerCase() === nm);
        if (hit) x.unit_id = hit.id;
      }
      const r = cabUserSave_(admin, Object.assign({}, x, { user_id: '' }));
      out.push({ row: i + 1, ok: true, login: r.user.login, full_name: r.user.full_name, password: r.password || '(өзі енгізген)' });
    } catch (err) {
      out.push({ row: i + 1, ok: false, login: x.login || '', error: String(err.message || err) });
    }
  });
  return { ok: true, results: out };
}

// ───────── Кітапханалар және аймақтар ─────────
const OBLAST_SUFFIX = / облысы$/;
/** Тізілімнен кітапханалардың метадеректері: {id: {id, name, region, district, status, st, cat, lvl, unit, oblast}} */
function cabLibMeta_() {
  const cache = CacheService.getScriptCache();
  const hit = cacheBigGet_(cache, 'cab_meta');
  if (hit) return hit;
  const meta = {};
  getPassports_().forEach(x => {
    const r = x.r || '';
    let oblast = '', unit = 'KZ';
    if (r && r !== 'Республикалық деңгей') {
      if (OBLAST_SUFFIX.test(r)) { oblast = 'O:' + r; unit = x.d ? 'D:' + r + '|' + x.d : oblast; }
      else { oblast = 'C:' + r; unit = oblast; }
    }
    meta[x.id] = { id: x.id, name: x.f['1.1'] || '', region: r, district: x.d || '', status: x.t || '',
                   st: cabStatusKey_(x.t), cat: x.cat || '', lvl: Number(x.lvl) || 99, unit: unit, oblast: oblast };
  });
  cacheBigPut_(cache, 'cab_meta', meta, 3600);
  return meta;
}
function cabStatusKey_(t) {
  const s = String(t || '').toLowerCase();
  if (s.indexOf('маңызы') > -1) return 'rcity';
  if (s.indexOf('республика') > -1) return 'rep';
  if (s.indexOf('облыс') > -1) return 'obl';
  if (s.indexOf('қала') > -1) return 'city';
  if (s.indexOf('аудан') > -1) return 'dist';
  return 'rural';
}
/** Барлық бірлік: [{id, type, name, full, parent}] */
function cabAllUnits_() {
  const meta = cabLibMeta_();
  const map = { KZ: { id: 'KZ', type: 'republic', name: 'Қазақстан Республикасы', full: 'Республикалық деңгей', parent: '' } };
  Object.keys(meta).forEach(k => {
    const m = meta[k];
    if (m.oblast && !map[m.oblast]) {
      map[m.oblast] = { id: m.oblast, type: m.oblast[0] === 'O' ? 'oblast' : 'rcity', name: m.region, full: m.region, parent: 'KZ' };
    }
    if (m.unit.indexOf('D:') === 0 && !map[m.unit]) {
      map[m.unit] = { id: m.unit, type: /қ\.$|қаласы$/.test(m.district) ? 'city' : 'district', name: m.district,
                      full: m.region + ', ' + m.district, parent: m.oblast };
    }
  });
  return Object.keys(map).map(k => map[k]).sort((a, b) => (a.full > b.full ? 1 : -1));
}
function cabUnitName_(id) {
  if (!id) return '';
  if (id === 'KZ') return 'Республикалық деңгей';
  if (id.indexOf('D:') === 0) return id.slice(2).replace('|', ', ');
  return id.slice(2);
}
function cabRepLibs_() {
  const meta = cabLibMeta_();
  return Object.keys(meta).map(k => meta[k]).filter(m => m.st === 'rep').map(m => ({ id: m.id, name: m.name }));
}
/** Пайдаланушы осы кітапхананы басқара ала ма? (басты рұқсат тексеруі) */
function cabCan_(u, m) {
  if (!m) return false;
  switch (u.role) {
    case 'admin': return true;
    case 'oblast': return m.oblast === u.unit_id;
    case 'city': return m.oblast === u.unit_id;
    case 'district': return m.unit === u.unit_id;
    case 'republic': return String(m.id) === String(u.library_id);
    default: return false;
  }
}
/** Сүзгілер үшін пайдаланушыға көрінетін бірліктер */
function cabUnitsFor_(u) {
  const all = cabAllUnits_();
  if (u.role === 'admin') return all;
  if (u.role === 'oblast' || u.role === 'city') return all.filter(n => n.id === u.unit_id || n.parent === u.unit_id);
  return all.filter(n => n.id === u.unit_id);
}
function cabScopeLibs_(u) {
  const meta = cabLibMeta_();
  return Object.keys(meta).map(k => meta[k]).filter(m => cabCan_(u, m));
}
function cabLibOr403_(u, id) {
  const m = cabLibMeta_()[String(id)];
  if (!m) throw cabErr_('not_found', 'Кітапхана табылмады');
  if (!cabCan_(u, m)) throw cabErr_('forbidden', 'Бұл кітапхана сіздің аймағыңызға кірмейді');
  return m;
}

// ───────── Тоқсандық деректер ─────────
function cabQKey_(lib, y, q) { return lib + '|' + y + '|' + q; }
/** Тоқсандық парақтың бәрі: {key: {lib_id, year, quarter, v:{6.1:…}, updated_at, user_*, _row}} (кэштеледі) */
function cabQAll_() {
  const cache = CacheService.getScriptCache();
  const hit = cacheBigGet_(cache, 'cab_q');
  if (hit) return hit;
  const sh = cabSheet_(CAB.SH.QDATA, QDATA_COLS);
  const last = sh.getLastRow(), out = {};
  if (last >= 2) {
    sh.getRange(2, 1, last - 1, QDATA_COLS.length).getDisplayValues().forEach((r, i) => {
      if (!r[0]) return;
      const o = { _row: i + 2, v: {} };
      QDATA_COLS.forEach((c, j) => { if (CAB.Q_FIELDS.indexOf(c) > -1) o.v[c] = r[j]; else o[c] = r[j]; });
      out[r[0]] = o;
    });
  }
  cacheBigPut_(cache, 'cab_q', out, 3600);
  return out;
}
function cabQFor_(all, lib, y, q) { return all[cabQKey_(lib, y, q)] || null; }
/** Кітапхананың ең соңғы толтырылған тоқсаны */
function cabQLatest_(all, lib) {
  let best = null;
  Object.keys(all).forEach(k => {
    const o = all[k];
    if (String(o.lib_id) !== String(lib)) return;
    if (!best || Number(o.year) * 10 + Number(o.quarter) > Number(best.year) * 10 + Number(best.quarter)) best = o;
  });
  return best;
}
function cabPrevQ_(y, q) { return q > 1 ? [y, q - 1] : [y - 1, 4]; }
function cabPeriod_(b) {
  const y = Number(b.year), q = Number(b.quarter);
  const now = new Date(), cy = now.getFullYear(), cq = Math.floor(now.getMonth() / 3) + 1;
  if (!(y >= 2020 && y <= cy + 1) || !(q >= 1 && q <= 4)) throw cabErr_('invalid', 'Жыл немесе тоқсан дұрыс емес');
  if (y * 10 + q > cy * 10 + cq) throw cabErr_('invalid', 'Әлі басталмаған тоқсанға дерек енгізуге болмайды');
  return [y, q];
}
function cabLibs_(u, b) {
  const yq = cabPeriod_(b), all = cabQAll_();
  const libs = cabScopeLibs_(u).map(m => {
    const r = cabQFor_(all, m.id, yq[0], yq[1]);
    return { id: m.id, name: m.name, region: m.region, district: m.district, st: m.st, cat: m.cat, lvl: m.lvl, unit: m.unit,
             filled: !!r, updated_at: r ? r.updated_at : '', user_name: r ? r.user_name : '', user_institution: r ? r.user_institution : '' };
  }).sort((a, b2) => a.lvl - b2.lvl || (a.district > b2.district ? 1 : a.district < b2.district ? -1 : 0) || (a.name > b2.name ? 1 : -1));
  return { ok: true, year: yq[0], quarter: yq[1], libs: libs };
}
function cabLib_(u, b) {
  const m = cabLibOr403_(u, b.id), yq = cabPeriod_(b), all = cabQAll_();
  const cur = cabQFor_(all, m.id, yq[0], yq[1]);
  const p = cabPrevQ_(yq[0], yq[1]);
  const prev = cabQFor_(all, m.id, p[0], p[1]) || (cur ? null : cabQLatest_(all, m.id));
  const history = Object.keys(all).map(k => all[k]).filter(o => String(o.lib_id) === String(m.id))
    .sort((a, c) => (Number(c.year) * 10 + Number(c.quarter)) - (Number(a.year) * 10 + Number(a.quarter)))
    .map(o => ({ year: o.year, quarter: o.quarter, v: o.v, updated_at: o.updated_at, user_name: o.user_name, user_institution: o.user_institution }));
  return { ok: true, lib: m, passport: passportById_(m.id), year: yq[0], quarter: yq[1],
           current: cur ? { v: cur.v, updated_at: cur.updated_at, user_name: cur.user_name, user_institution: cur.user_institution } : null,
           previous: prev ? { year: prev.year, quarter: prev.quarter, v: prev.v } : null,
           history: history, canStatic: u.role === 'admin' };
}
function cabNum_(v) {
  const s = String(v == null ? '' : v).replace(/[\s ]/g, '');
  if (!/^\d+$/.test(s)) return null;
  return Number(s);
}
function cabSave_(u, b) {
  const m = cabLibOr403_(u, b.id), yq = cabPeriod_(b);
  const op = String(b.op || '');
  const cache = CacheService.getScriptCache();
  if (op && cache.get('op_' + op)) return { ok: true, duplicate: true };       // кезектен қайта жіберілген сұрау
  const vals = {}, errors = {};
  CAB.Q_FIELDS.forEach(f => {
    const n = cabNum_((b.values || {})[f]);
    if (n === null) errors[f] = 'Бүтін сан енгізіңіз (0 немесе одан көп)';
    else if (n > CAB.Q_MAX) errors[f] = 'Мән тым үлкен';
    else vals[f] = n;
  });
  if (Object.keys(errors).length) return { ok: false, error: 'invalid', fields: errors, msg: 'Өрістерді тексеріңіз' };
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    cache.remove('cab_q_n');                          // соңғы күйді парақтан оқимыз
    const all = cabQAll_();
    const cur = cabQFor_(all, m.id, yq[0], yq[1]);
    const changes = [];
    CAB.Q_FIELDS.forEach(f => {
      const old = cur ? String(cur.v[f]).replace(/\s/g, '') : '';
      if (old !== String(vals[f])) changes.push({ lib: m, year: yq[0], quarter: yq[1], field: f + ' ' + cabFieldName_(f), old: old, val: String(vals[f]),
                                                  action: cur ? 'Өзгертілді' : 'Жаңа жазба' });
    });
    if (!changes.length) return { ok: true, nochange: true };
    const sh = cabSheet_(CAB.SH.QDATA, QDATA_COLS);
    const row = [cabQKey_(m.id, yq[0], yq[1]), m.id, yq[0], yq[1]].concat(CAB.Q_FIELDS.map(f => vals[f]))
      .concat([cabNow_(), u.user_id, u.full_name, u.institution, u.phone, ROLES[u.role]]);
    writeRows_(sh, cur ? cur._row : sh.getLastRow() + 1, [row]);
    cabLogAppend_(u, changes, op);
    if (op) cache.put('op_' + op, '1', 21600);
    cache.removeAll(['cab_q_n', 'pidx_n']);
    return { ok: true, changed: changes.length, updated_at: row[4 + CAB.Q_FIELDS.length] };
  } finally { lock.releaseLock(); }
}
function cabFieldName_(code) {
  const f = PASSPORT_FIELDS.find(x => x[0] === code);
  return f ? f[1] : code;
}
/** Бас әкімші: тұрақты өрістерді түзету (атауы, мекенжайы т.б.) — Тізілім парағына жазылады */
function cabSaveStatic_(u, b) {
  const m = cabLibOr403_(u, b.id);
  const L = passportLayout_();
  if (!L) throw cabErr_('server', 'Тізілім парағы табылмады');
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const last = L.sh.getLastRow();
    const cell = L.sh.getRange(L.headRow + 1, L.map.id + 1, last - L.headRow, 1).createTextFinder(String(m.id)).matchEntireCell(true).findNext();
    if (!cell) throw cabErr_('not_found', 'Кітапхана табылмады');
    const r = cell.getRow(), changes = [];
    const rowVals = L.sh.getRange(r, 1, 1, L.sh.getLastColumn()).getDisplayValues()[0];
    Object.keys(b.fields || {}).forEach(code => {
      if (CAB.Q_FIELDS.indexOf(code) > -1 || !(code in L.map) || !/^\d+\.\d+$/.test(code)) return;
      const v = String(b.fields[code] == null ? '' : b.fields[code]).trim().slice(0, 2000);
      const old = String(rowVals[L.map[code]] || '').trim();
      if (v === old) return;
      if (code === '1.1' && !v) throw cabErr_('invalid', 'Атауы бос болмауы керек');
      L.sh.getRange(r, L.map[code] + 1).setValue(v);
      changes.push({ lib: m, year: '', quarter: '', field: code + ' ' + cabFieldName_(code), old: old, val: v, action: 'Тұрақты өріс өзгертілді' });
    });
    if (changes.length) {
      cabLogAppend_(u, changes);
      CacheService.getScriptCache().removeAll(['pidx_n', 'cab_meta_n']);
    }
    return { ok: true, changed: changes.length };
  } finally { lock.releaseLock(); }
}

// ───────── Журнал (тек жаңа жол қосылады + хэш тізбегі) ─────────
function cabLogSheet_() {
  const sh = cabSheet_(CAB.SH.LOG, LOG_COLS);
  return sh;
}
/** changes = [{lib, year, quarter, field, old, val, action}] */
function cabLogAppend_(u, changes, op) {
  const sh = cabLogSheet_();
  const props = PropertiesService.getScriptProperties();
  let prev = props.getProperty('log_hash') || '';
  const now = cabNow_();
  const rows = changes.map(c => {
    const m = c.lib;
    const base = [now, u.full_name, ROLES[u.role] || u.role, m ? (m.region + (m.district ? ', ' + m.district : '')) : cabUnitName_(u.unit_id),
      u.institution, m ? m.name : '', c.year == null ? '' : String(c.year), c.quarter ? Q_ROMAN[c.quarter] : '', c.field,
      String(c.old == null ? '' : c.old), String(c.val == null ? '' : c.val), c.action,
      u.user_id, m ? String(m.id) : '', m ? m.oblast : '', op || ''].map(v => String(v == null ? '' : v));
    prev = sha256hex_(prev + '\u0001' + JSON.stringify(base));
    return base.concat([prev]);
  });
  if (!rows.length) return;
  writeRows_(sh, sh.getLastRow() + 1, rows);
  props.setProperty('log_hash', prev);
}
/** Журналдың тұтастығын тексеру (мәзірден): біреу қолмен өзгертсе — сол жол көрсетіледі */
function verifyLog() {
  const sh = cabLogSheet_(), last = sh.getLastRow();
  let prev = '', bad = 0, first = 0;
  if (last >= 2) {
    sh.getRange(2, 1, last - 1, LOG_COLS.length).getDisplayValues().forEach((r, i) => {
      const base = r.slice(0, LOG_COLS.length - 1);
      const h = sha256hex_(prev + '\u0001' + JSON.stringify(base));
      if (h !== r[LOG_COLS.length - 1]) { bad++; if (!first) first = i + 2; prev = r[LOG_COLS.length - 1]; } else prev = h;
    });
  }
  const msg = bad ? 'Журналда ' + bad + ' өзгертілген жол бар. Біріншісі: ' + first + '-жол' : 'Журнал бүтін: ешбір жол өзгертілмеген.';
  try { SpreadsheetApp.getActive().toast(msg, 'LABA', 10); } catch (e) { /* UI жоқ */ }
  return msg;
}
/** Журналды оқу. full=true — бас әкімші (ескі/жаңа мәнімен), false — облыс/қала әдіскері (кім, қашан, қай өріс) */
function cabHistory_(u, b, full) {
  if (!full && ['admin', 'oblast', 'city'].indexOf(u.role) < 0) throw cabErr_('forbidden', 'Рұқсат жоқ');
  const sh = cabLogSheet_(), last = sh.getLastRow();
  const limit = Math.min(Number(b.limit) || 100, 500), offset = Math.max(Number(b.offset) || 0, 0);
  const from = b.from ? String(b.from) : '', to = b.to ? String(b.to) + ' 99' : '';
  const q = String(b.q || '').toLowerCase();
  const out = [];
  let matched = 0, done = false;
  for (let end = last; end >= 2 && !done; end -= 2000) {
    const start = Math.max(2, end - 1999);
    const block = sh.getRange(start, 1, end - start + 1, LOG_COLS.length).getDisplayValues();
    for (let i = block.length - 1; i >= 0; i--) {
      const r = block[i];
      if (to && r[0] > to) continue;
      if (from && r[0] < from) { done = true; break; }
      if (!full && u.role !== 'admin' && r[14] !== u.unit_id) continue;      // облыс/қала: тек өз аймағы
      if (full && u.role !== 'admin') continue;
      if (b.unit && !(r[14] === b.unit || String(r[3]).indexOf(cabUnitName_(b.unit)) === 0)) continue;
      if (b.lib && String(r[13]) !== String(b.lib)) continue;
      if (q && (r[1] + ' ' + r[4] + ' ' + r[5] + ' ' + r[8] + ' ' + r[11]).toLowerCase().indexOf(q) < 0) continue;
      matched++;
      if (matched <= offset) continue;
      if (out.length < limit) {
        out.push(full
          ? { ts: r[0], user: r[1], role: r[2], region: r[3], inst: r[4], lib: r[5], year: r[6], quarter: r[7], field: r[8], old: r[9], val: r[10], action: r[11], lib_id: r[13] }
          : { ts: r[0], user: r[1], role: r[2], region: r[3], inst: r[4], lib: r[5], year: r[6], quarter: r[7], field: r[8], action: r[11], lib_id: r[13] });
      } else if (!b.count) { done = true; break; }
    }
  }
  return { ok: true, rows: out, more: out.length === limit };
}

// ───────── Есептер ─────────
/** Есепке арналған деректер (тек пайдаланушының аймағы бойынша) */
function cabReport_(u, b) {
  const yq = cabPeriod_(b), all = cabQAll_();
  const from = b.from ? String(b.from) : '', to = b.to ? String(b.to) + ' 99' : '';
  let libs = cabScopeLibs_(u);
  if (b.unit) libs = libs.filter(m => m.oblast === b.unit || m.unit === b.unit || (b.unit === 'KZ' && !m.oblast));
  if (b.st) libs = libs.filter(m => m.st === b.st);
  if (b.lib) libs = libs.filter(m => String(m.id) === String(b.lib));
  const rows = [];
  libs.sort((a, c) => (a.region > c.region ? 1 : a.region < c.region ? -1 : 0) || a.lvl - c.lvl || (a.name > c.name ? 1 : -1))
    .forEach(m => {
      const r = cabQFor_(all, m.id, yq[0], yq[1]);
      if ((from || to) && (!r || (from && r.updated_at < from) || (to && r.updated_at > to))) return;
      rows.push({ id: m.id, name: m.name, region: m.region, district: m.district, status: m.status, cat: m.cat,
                  v: r ? r.v : null, updated_at: r ? r.updated_at : '', user_name: r ? r.user_name : '',
                  user_institution: r ? r.user_institution : '', user_phone: r ? r.user_phone : '' });
    });
  return { ok: true, year: yq[0], quarter: yq[1], generated_by: u.full_name, generated_inst: u.institution,
           fields: CAB.Q_FIELDS.map(f => [f, cabFieldName_(f)]), rows: rows };
}

// ───────── Көмекшілер ─────────
/** Жолдарды мәтін пішімінде жазу (Sheets күн/телефонды өзі түрлендірмеуі үшін), парақ кішкентай болса — кеңейтеді */
function writeRows_(sh, startRow, rows) {
  if (!rows.length) return;
  const need = startRow + rows.length - 1;
  if (sh.getMaxRows() < need) sh.insertRowsAfter(sh.getMaxRows(), need - sh.getMaxRows());
  const w = rows[0].length;
  if (sh.getMaxColumns() < w) sh.insertColumnsAfter(sh.getMaxColumns(), w - sh.getMaxColumns());
  sh.getRange(startRow, 1, rows.length, w).setNumberFormat('@').setValues(rows.map(r => r.map(v => v == null ? '' : String(v))));
}
function cabNow_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Almaty', 'yyyy-MM-dd HH:mm:ss'); }
function cabFmt_(d) { return Utilities.formatDate(d, Session.getScriptTimeZone() || 'Asia/Almaty', 'yyyy-MM-dd HH:mm:ss'); }
function cacheBigPut_(cache, key, obj, ttl) {
  try {
    const s = JSON.stringify(obj), size = 40000, parts = {};
    let n = 0;
    for (let i = 0; i < s.length; i += size) parts[key + '_' + (n++)] = s.slice(i, i + size);
    cache.putAll(parts, ttl);
    cache.put(key + '_n', String(n), ttl);
  } catch (err) { /* сыймаса — кэшсіз */ }
}
function cacheBigGet_(cache, key) {
  try {
    const n = Number(cache.get(key + '_n') || 0);
    if (!n) return null;
    const keys = [];
    for (let i = 0; i < n; i++) keys.push(key + '_' + i);
    const got = cache.getAll(keys);
    if (!keys.every(k => got[k] != null)) return null;
    return JSON.parse(keys.map(k => got[k]).join(''));
  } catch (err) { return null; }
}

// ───────── Орнату (бір рет) ─────────
/**
 * Кабинетті орнату. Мәзірден немесе редактордан бір рет іске қосыңыз:
 *  1) «Тізілім» парағы жоқ болса — сайттағы дерек файлдарынан құрады (3 875 кітапхана);
 *  2) «Тоқсандық» парағына тізілімдегі 6.1–6.3 көрсеткіштерін 2026 жылдың III тоқсаны деп жазады;
 *  3) «Бірліктер», «Пайдаланушылар», «Журнал» парақтарын құрады, журналды қорғайды;
 *  4) бас әкімшінің аккаунтын жасап, логин мен уақытша парольді терезеде көрсетеді.
 * Қайта іске қосу қауіпсіз: бар деректер өшірілмейді.
 */
function setupCabinet() {
  const ss = SpreadsheetApp.getActive();
  const notes = [];
  if (!getPassports_().length) { cabImportRegistry_(); notes.push('«Тізілім» парағы сайттың дерек файлдарынан құрылды.'); }
  CacheService.getScriptCache().removeAll(['cab_meta_n', 'cab_q_n', 'pidx_n', 'cab_users']);
  // Тоқсандық: тізілімдегі көрсеткіштерді 2026-III тоқсаны деп жазу (бұрын жазылмаса)
  const qs = cabSheet_(CAB.SH.QDATA, QDATA_COLS);
  if (qs.getLastRow() < 2) {
    const I = CAB.IMPORT;
    const rows = getPassports_().map(x => [cabQKey_(x.id, I.year, I.quarter), x.id, I.year, I.quarter]
      .concat(CAB.Q_FIELDS.map(f => { const n = cabNum_(x.f[f]); return n === null ? (x.f[f] || '') : n; }))
      .concat([I.date, 'import', I.label, 'ҚР Ұлттық кітапханасы', '', 'Импорт']));
    writeRows_(qs, 2, rows);
    notes.push('«Тоқсандық» парағына ' + rows.length + ' кітапхананың 2026 жылғы III тоқсан деректері жазылды.');
  }
  // Бірліктер (көру үшін)
  const us = cabSheet_(CAB.SH.UNITS, ['unit_id', 'type', 'name', 'parent_id']);
  const units = cabAllUnits_();
  if (us.getLastRow() > 1) us.getRange(2, 1, us.getLastRow() - 1, 4).clearContent();
  writeRows_(us, 2, units.map(n => [n.id, n.type, n.name, n.parent]));
  // Журнал: қорғау (тек скрипт пен кесте иесі жаза алады)
  const log = cabLogSheet_();
  try {
    const p = log.protect().setDescription('Журнал — тек жүйе жазады');
    p.removeEditors(p.getEditors());
    if (p.canDomainEdit()) p.setDomainEdit(false);
  } catch (e) { /* қорғау мүмкін болмаса — елемейміз */ }
  cabSheet_(CAB.SH.USERS, USER_COLS);
  // Бас әкімші
  let pass = '';
  if (!cabUsers_().some(u => u.role === 'admin')) {
    const admin = { user_id: 'system', full_name: 'Жүйе', role: 'admin', institution: 'ҚР Ұлттық кітапханасы', unit_id: 'KZ' };
    const r = cabUserSave_(admin, { login: 'admin', full_name: 'Бас әкімші', position: 'Бас әкімші', role: 'admin',
                                    institution: 'ҚР Ұлттық кітапханасы, Ғылыми-әдістемелік қызмет', phone: '' });
    pass = r.password;
    notes.push('Бас әкімші: логин «admin», уақытша пароль: ' + pass + ' — кіргеннен кейін «Аккаунттар» бетінде ауыстырыңыз.');
  }
  CacheService.getScriptCache().removeAll(['cab_meta_n', 'cab_q_n', 'pidx_n', 'cab_users']);
  const msg = notes.join('\n') || 'Кабинет бұрыннан орнатылған. Өзгеріс жоқ.';
  try { SpreadsheetApp.getUi().alert('LABA — кабинет орнатылды', msg, SpreadsheetApp.getUi().ButtonSet.OK); }
  catch (e) { Logger.log(msg); }
  return msg;
}
/** Сайттағы data/passports/*.json файлдарынан «Тізілім» парағын құру */
function cabImportRegistry_() {
  const recs = [];
  for (let i = 0; i < CAB.DATA_CHUNKS; i++) {
    const res = UrlFetchApp.fetch(CAB.DATA_URL + i + '.json', { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) continue;
    const obj = JSON.parse(res.getContentText());
    Object.keys(obj).forEach(k => recs.push(obj[k]));
  }
  if (!recs.length) throw new Error('Сайттың дерек файлдары жүктелмеді: ' + CAB.DATA_URL);
  recs.sort((a, b) => Number(a.id) - Number(b.id));
  const ss = SpreadsheetApp.getActive();
  const old = ss.getSheetByName('Тізілім');
  if (old && old.getLastRow() > 1) throw new Error('«Тізілім» парағында дерек бар, бірақ оқылмады — бағандарын тексеріңіз');
  const sh = old || ss.insertSheet('Тізілім');
  sh.clear();
  const head = PASSPORT_HEAD.map(h => h[0]);
  const rows = recs.map(x => PASSPORT_HEAD.map(h => {
    const k = h[1];
    if (/^\d+\.\d+$/.test(k)) return (x.f && x.f[k]) || '';
    return x[k] == null ? '' : x[k];
  }));
  writeRows_(sh, 1, [head]);
  sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setBackground('#2563EB').setFontColor('#FFFFFF');
  writeRows_(sh, 2, rows);
  sh.setFrozenRows(1);
}
