/* ═══════════════════════════════════════════════════════════════
   LABA — «Кітапханалар паспорты» бөлімі үшін Apps Script коды

   ҚАЛАЙ ҚОСУ КЕРЕК:
   1. Google Sheets кестесін ашыңыз → Кеңейтімдер → Apps Script.
   2. Сол жақтағы «Файлдар» тізімінде «+» → «Сценарий» басып,
      жаңа файл ашыңыз (атауы: Passports) және осы кодты түгел қойыңыз.
   3. Бұрыннан бар doGet(e) функциясының ЕҢ БАСЫНА мына жолды қосыңыз:

        if (e && e.parameter && e.parameter.action === "passports") return passportsResponse_(e);

   4. Жоғарыдағы тізімнен setupPassportSheet функциясын таңдап,
      «Орындау» (▶) батырмасын бір рет басыңыз — «Паспорттар» парағы
      дайын бағандармен өзі құрылады.
   5. Орналастыру → Орналастыруларды басқару → ✏️ → Нұсқа: «Жаңа нұсқа»
      → Орналастыру. (URL өзгермейді, сайтқа ештеңе өзгертудің керегі жоқ.)

   ДЕРЕК ЕНГІЗУ:
   • «Паспорттар» парағында әр ЖОЛ — бір кітапхана.
   • Бағандар құжаттағы тармақтарға сәйкес: 1.1, 1.2 … 6.3.
   • 1.1 «Кітапхананың атауы» бос жол сайтқа шықпайды.
   • 1.2 «Кітапхананың суреті» — суреттің сілтемесі (URL).
     Google Drive-тағы сурет болса: файлды «Сілтемесі бар кез келген
     адам — Көруші» деп ашып, сілтемесін қойыңыз — код өзі түрлендіреді.
   • Сандарды кестеде қалай жазсаңыз, сайтта солай көрінеді.
   • Жолдарды жоймай, жаңасын төменге қосқан дұрыс: сайттағы кітапхана
     сілтемесі (#passport/<ID>) «ID» бағанына байланысты. ID бос болса,
     кесте жолының нөмірі қолданылады.
   ═══════════════════════════════════════════════════════════════ */

const PASSPORT_SHEET = "Паспорттар";

const PASSPORT_FIELDS = [
  ["1.1",  "Кітапхананың атауы"],
  ["1.2",  "Кітапхананың суреті (сілтеме)"],
  ["1.3",  "Кітапхананың мекен-жайы"],
  ["1.4",  "Байланыс телефоны"],
  ["1.5",  "E-mail"],
  ["1.6",  "Кітапхана сайты"],
  ["2.1",  "Кітапхананың құрылған жылы"],
  ["2.2",  "Кітапхана орналасқан ғимарат"],
  ["2.3",  "Кітапхана көлемі"],
  ["2.4",  "Оқырман залының болуы (иә, жоқ, абонемент бөлімімен біріктірілген)"],
  ["3.1",  "Интернетке қолжетімділік"],
  ["3.2",  "Кітапхананың автоматтандырылған кітапханалық ақпараттық жүйесінің атауы"],
  ["3.3",  "Электрондық кітапханаларға қолжетімділік"],
  ["3.4",  "Кітапхана пайдаланатын электронды кітапханалардың ақпараттық ресурстары"],
  ["3.5",  "Компьютер (дана)"],
  ["3.6",  "Сканер"],
  ["3.7",  "Принтер"],
  ["3.8",  "Көпфункционалды құрылғы (МФУ)"],
  ["3.9",  "Телевизор"],
  ["3.10", "Бейнекамера"],
  ["3.11", "Фотоаппарат"],
  ["4.1",  "Кітапхананың жалпы қоры"],
  ["4.2",  "Мерзімді басылымдар"],
  ["4.3",  "Электронды ресурстар"],
  ["4.4",  "Электрондық каталогтың болуы"],
  ["5.1",  "Штат саны"],
  ["5.2",  "Кітапхана директорының, кітапхана-филиалының меңгерушісінің аты-жөні, байланыс телефоны"],
  ["6.1",  "Пайдаланушылар саны"],
  ["6.2",  "Берілген құжат саны"],
  ["6.3",  "Келушілер саны"]
];

/* «Паспорттар» парағын құру (бір рет қолмен іске қосылады).
   Парақ бұрыннан бар болса, тек тақырып жолын жаңартады — деректер өшпейді. */
function setupPassportSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(PASSPORT_SHEET) || ss.insertSheet(PASSPORT_SHEET);
  const headers = ["ID"].concat(PASSPORT_FIELDS.map(f => f[0] + " " + f[1]));
  sh.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground("#EFF6FF")
    .setFontColor("#1E3A8A")
    .setWrap(true)
    .setVerticalAlignment("middle");
  sh.setFrozenRows(1);
  sh.setFrozenColumns(2);
  sh.setRowHeight(1, 64);
  sh.setColumnWidth(1, 50);
  sh.setColumnWidths(2, headers.length - 1, 190);
  sh.getRange(2, 1, Math.max(sh.getMaxRows() - 1, 1), headers.length).setNumberFormat("@");
  sh.getRange(1, 1).setNote("Бос қалдыруға болады — онда жол нөмірі ID болады.");
  sh.getRange(1, 3).setNote("Суреттің сілтемесі (URL). Google Drive сілтемесі де болады — файл «Сілтемесі бар кез келген адам» үшін ашық болуы керек.");
}

/* Парақтағы деректі оқу → [{id, f:{"1.1":"…", …}}] */
function getPassports_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PASSPORT_SHEET);
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
      const v = String(row[c[0]] || "").trim();
      if (v) f[c[1]] = v;
    });
    if (!f["1.1"]) continue;
    if (f["1.2"]) f["1.2"] = imageUrl_(f["1.2"]);
    const id = idCol > -1 && String(row[idCol]).trim() ? String(row[idCol]).trim() : String(r + 1);
    out.push({ id: id, f: f });
  }
  return out;
}

/* Google Drive сілтемесін сайтта көрінетін сурет сілтемесіне айналдыру */
function imageUrl_(url) {
  const u = String(url).trim();
  if (!/drive\.google\.com|docs\.google\.com/.test(u)) return u;
  const m = u.match(/\/d\/([\w-]{10,})/) || u.match(/[?&]id=([\w-]{10,})/);
  return m ? "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w1200" : u;
}

/* doGet ішінен шақырылады: ?action=passports&callback=… */
function passportsResponse_(e) {
  let body;
  try {
    body = { ok: true, passports: getPassports_(), updated: new Date().toISOString() };
  } catch (err) {
    body = { ok: false, error: String(err) };
  }
  const json = JSON.stringify(body);
  const cb = e && e.parameter && e.parameter.callback;
  if (cb && /^[\w.$]+$/.test(cb)) {
    return ContentService.createTextOutput(cb + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
