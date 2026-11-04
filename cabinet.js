/* ═══════════════════════════════════════════════════════════════
   LABA — Әдіскерлер кабинеті
   Кіру, тоқсандық жаңарту, өзгерістер тарихы, есептер (Word/Excel),
   аккаунттар мен журнал (бас әкімші).
   index.html-дегі ортақ көмекшілерді қолданады: API_URL, LANG, esc, nf, pl,
   PF, PASS, render, closeSidebar.
   Барлық рұқсат серверде (Apps Script) тексеріледі — бұл файл тек интерфейс.
   ═══════════════════════════════════════════════════════════════ */
(function(){
"use strict";

/* ─────────── Мәтіндер (қазақша негізгі, орысша қосымша) ─────────── */
const CTX = {
  kk:{
    cabinet:"Әдіскер кабинеті", login:"Кіру", logout:"Шығу", loginTitle:"Әдіскерлер кабинетіне кіру",
    loginDesc:"Логин мен парольді Ұлттық кітапхананың бас әдістемелік орталығы береді.",
    loginF:"Логин", passF:"Пароль", enter:"Кіру", wait:"Күте тұрыңыз…", showPass:"Парольді көрсету",
    noAccount:"Аккаунт жоқ па? Бас әкімшіге хабарласыңыз: ҚР Ұлттық кітапханасы, Ғылыми-әдістемелік қызмет.",
    tLibs:"Кітапханалар", tHistory:"Өзгерістер тарихы", tReports:"Есептер", tUsers:"Аккаунттар", tLog:"Журнал",
    year:"Жыл", quarter:"Тоқсан", qN:"{a} тоқсан", period:"{y} жыл, {q} тоқсан",
    scope:"Жауапты аймағыңыз", libsN:"{a} кітапхана", filled:"Толтырылды", notFilled:"Толтырылмаған",
    progress:"{a} / {b} толтырылды", search:"Кітапхана атауы немесе аудан…", allUnits:"Барлық аймақтар",
    allStates:"Барлығы", onlyEmpty:"Толтырылмағандар", onlyFilled:"Толтырылғандар", update:"Жаңарту", open:"Ашу",
    updatedBy:"{d} · {n}", more:"Тағы көрсету", nothing:"Ештеңе табылмады",
    back:"← Кітапханалар тізімі", qFields:"Тоқсандық көрсеткіштер", prev:"Алдыңғы тоқсан: {v}", prevNone:"Алдыңғы тоқсан деректері жоқ",
    lastUpd:"Соңғы жаңарту: {d} · {n}, {i}", neverUpd:"Бұл тоқсанға әлі дерек енгізілмеген",
    save:"Сақтау", cancel:"Болдырмау", confirm:"Растау", confirmTitle:"Өзгерістерді растаңыз",
    confirmDesc:"Төмендегі мәндер журналға сіздің атыңызбен жазылады.", oldV:"Ескі мән", newV:"Жаңа мән",
    req:"Міндетті өріс", int:"Бүтін сан енгізіңіз (0 немесе одан көп)", tooBig:"Мән тым үлкен",
    jump:"Алдыңғы тоқсанмен салыстырғанда {a}% өзгеріс — мәнді тексеріңіз", saved:"Сақталды",
    nochange:"Өзгеріс жоқ — ештеңе сақталмады", queued:"Байланыс жоқ: өзгеріс кезекке қойылды, кейін өзі жіберіледі",
    outbox:"Жіберілмеген өзгерістер: {a}. Байланыс қалпына келгенде өзі жіберіледі.", sendNow:"Қазір жіберу",
    qHistory:"Тоқсандар тарихы", staticT:"Тұрақты деректер (тек бас әкімші)", staticSave:"Тұрақты деректерді сақтау",
    histDesc:"Өз аймағыңыздағы кітапханалардың деректерін кім, қашан, қай өрісін өзгерткені.",
    logDesc:"Барлық өзгерістің толық журналы: ескі және жаңа мәндерімен. Журналды өшіруге де, өзгертуге де болмайды.",
    from:"Күннен", to:"Күнге дейін", find:"Іздеу", when:"Уақыты", who:"Кім", inst:"Мекемесі", lib:"Кітапхана",
    field:"Өріс", action:"Әрекет", level:"Деңгейі", region:"Аймақ", excel:"Excel", word:"Word (.docx)",
    repDesc:"Есеп тек сіздің аймағыңыздағы кітапханалар бойынша жасалады. Соңында жауапты мамандар, соңғы жаңарту күні және жүктелген уақыт көрсетіледі.",
    type:"Мекеме түрі", allTypes:"Барлық түрлері", allLibs:"Барлық кітапханалар", dateRange:"Жаңарту күні аралығы (міндетті емес)",
    download:"Жүктеу", building:"Есеп дайындалуда…", repTitle:"Кітапханалар паспорты бойынша есеп",
    repPeriod:"Кезең: {p}", repScope:"Аймақ: {s}", repFilters:"Сүзгі: {f}", resp:"Жауапты маман",
    respList:"Деректерді енгізген жауапты маман(дар):", lastDate:"Деректердің соңғы жаңартылған күні: {d}",
    genDate:"Құжат жүктелген күні мен уақыты: {d}", genBy:"Құжатты жүктеген: {n}", total:"Барлығы",
    noData:"дерек енгізілмеген", noRows:"Сүзгі бойынша кітапхана табылмады",
    users:"Аккаунттар", newUser:"+ Жаңа аккаунт", bulk:"Файлдан жүктеу (Excel/CSV)", template:"Үлгі файл",
    fio:"Аты-жөні", position:"Лауазымы", role:"Деңгейі", unit:"Аймағы", library:"Мекеме (республикалық кітапхана)",
    institution:"Мекемесі", phone:"Телефон", loginName:"Логин", status:"Күйі", lastLogin:"Соңғы кіру",
    active:"Белсенді", blocked:"Бұғатталған", edit:"Өзгерту", setPass:"Пароль", block:"Бұғаттау", unblock:"Ашу",
    passMode:"Пароль", passAuto:"Жүйе жасасын (бір реттік)", passManual:"Өзім енгіземін",
    passOnce:"Парольді қазір көшіріп алып, әдіскерге беріңіз — ол қайта көрсетілмейді.", copy:"Көшіру", copied:"Көшірілді",
    newPassQ:"Жаңа парольді енгізіңіз (бос қалдырсаңыз — жүйе жасайды):", blockQ:"{n} аккаунтын бұғаттау керек пе? Журнал жазбалары сақталады.",
    bulkRes:"Нәтиже: {a} жасалды, {b} қате", bulkDl:"Парольдер тізімін жүктеу (CSV)", choose:"Таңдаңыз…",
    rAdmin:"Бас әкімші", rOblast:"Облыстық әдіскер", rDistrict:"Аудандық әдіскер", rCity:"Қалалық әдіскер", rRepublic:"Республикалық кітапхана әдіскері",
    sessionEnd:"Сессия уақыты аяқталды. Қайта кіріңіз.", netErr:"Серверге қосылу мүмкін болмады. Интернетті тексеріңіз.",
    apiMissing:"Сервердің мекенжайы (API_URL) бапталмаған.", done:"Дайын", close:"Жабу", yes:"Иә", no:"Жоқ"
  },
  ru:{
    cabinet:"Кабинет методиста", login:"Вход", logout:"Выйти", loginTitle:"Вход в кабинет методиста",
    loginDesc:"Логин и пароль выдаёт главный методический центр Национальной библиотеки.",
    loginF:"Логин", passF:"Пароль", enter:"Войти", wait:"Подождите…", showPass:"Показать пароль",
    noAccount:"Нет аккаунта? Обратитесь к главному администратору: НБ РК, научно-методическая служба.",
    tLibs:"Библиотеки", tHistory:"История изменений", tReports:"Отчёты", tUsers:"Аккаунты", tLog:"Журнал",
    year:"Год", quarter:"Квартал", qN:"{a} квартал", period:"{y} год, {q} квартал",
    scope:"Ваша зона ответственности", libsN:"Библиотек: {a}", filled:"Заполнено", notFilled:"Не заполнено",
    progress:"Заполнено {a} из {b}", search:"Название библиотеки или район…", allUnits:"Все регионы",
    allStates:"Все", onlyEmpty:"Незаполненные", onlyFilled:"Заполненные", update:"Обновить", open:"Открыть",
    updatedBy:"{d} · {n}", more:"Показать ещё", nothing:"Ничего не найдено",
    back:"← Список библиотек", qFields:"Квартальные показатели", prev:"Предыдущий квартал: {v}", prevNone:"Нет данных предыдущего квартала",
    lastUpd:"Последнее обновление: {d} · {n}, {i}", neverUpd:"Данные за этот квартал ещё не внесены",
    save:"Сохранить", cancel:"Отмена", confirm:"Подтвердить", confirmTitle:"Подтвердите изменения",
    confirmDesc:"Эти значения будут записаны в журнал от вашего имени.", oldV:"Было", newV:"Стало",
    req:"Обязательное поле", int:"Введите целое число (0 или больше)", tooBig:"Слишком большое значение",
    jump:"Изменение на {a}% к предыдущему кварталу — проверьте значение", saved:"Сохранено",
    nochange:"Изменений нет — ничего не сохранено", queued:"Нет связи: изменение поставлено в очередь и будет отправлено позже",
    outbox:"Неотправленных изменений: {a}. Будут отправлены при восстановлении связи.", sendNow:"Отправить сейчас",
    qHistory:"История по кварталам", staticT:"Постоянные данные (только главный администратор)", staticSave:"Сохранить постоянные данные",
    histDesc:"Кто, когда и какое поле изменил в библиотеках вашего региона.",
    logDesc:"Полный журнал всех изменений со старыми и новыми значениями. Журнал нельзя удалить или изменить.",
    from:"С", to:"По", find:"Поиск", when:"Время", who:"Кто", inst:"Учреждение", lib:"Библиотека",
    field:"Поле", action:"Действие", level:"Уровень", region:"Регион", excel:"Excel", word:"Word (.docx)",
    repDesc:"Отчёт формируется только по библиотекам вашего региона. В конце указываются ответственные, дата обновления и время выгрузки.",
    type:"Тип учреждения", allTypes:"Все типы", allLibs:"Все библиотеки", dateRange:"Период обновления (необязательно)",
    download:"Скачать", building:"Отчёт формируется…", repTitle:"Отчёт по паспортам библиотек",
    repPeriod:"Период: {p}", repScope:"Регион: {s}", repFilters:"Фильтр: {f}", resp:"Ответственный",
    respList:"Ответственные за ввод данных:", lastDate:"Дата последнего обновления данных: {d}",
    genDate:"Дата и время выгрузки: {d}", genBy:"Выгрузил: {n}", total:"Итого",
    noData:"данные не внесены", noRows:"По фильтру библиотеки не найдены",
    users:"Аккаунты", newUser:"+ Новый аккаунт", bulk:"Загрузить из файла (Excel/CSV)", template:"Шаблон",
    fio:"ФИО", position:"Должность", role:"Уровень", unit:"Регион", library:"Учреждение (республиканская библиотека)",
    institution:"Учреждение", phone:"Телефон", loginName:"Логин", status:"Статус", lastLogin:"Последний вход",
    active:"Активен", blocked:"Заблокирован", edit:"Изменить", setPass:"Пароль", block:"Заблокировать", unblock:"Разблокировать",
    passMode:"Пароль", passAuto:"Сгенерировать (одноразовый)", passManual:"Ввести вручную",
    passOnce:"Скопируйте пароль сейчас и передайте методисту — повторно он не показывается.", copy:"Копировать", copied:"Скопировано",
    newPassQ:"Введите новый пароль (если оставить пустым — будет сгенерирован):", blockQ:"Заблокировать аккаунт {n}? Записи журнала сохранятся.",
    bulkRes:"Итог: создано {a}, ошибок {b}", bulkDl:"Скачать список паролей (CSV)", choose:"Выберите…",
    rAdmin:"Главный администратор", rOblast:"Областной методист", rDistrict:"Районный методист", rCity:"Городской методист", rRepublic:"Методист республиканской библиотеки",
    sessionEnd:"Сессия истекла. Войдите снова.", netErr:"Не удалось подключиться к серверу. Проверьте интернет.",
    apiMissing:"Адрес сервера (API_URL) не настроен.", done:"Готово", close:"Закрыть", yes:"Да", no:"Нет"
  }
};
const L = () => (LANG === "ru" ? "ru" : "kk");
function ct(k, v){
  let s = (CTX[L()][k] != null ? CTX[L()][k] : CTX.kk[k]) || k;
  if(v) Object.keys(v).forEach(n => { s = s.split("{" + n + "}").join(v[n]); });
  return s;
}
const ROMAN = ["", "I", "II", "III", "IV"];
const ROLE_KEY = {admin:"rAdmin", oblast:"rOblast", district:"rDistrict", city:"rCity", republic:"rRepublic"};
const ROLE_UNIT = {oblast:["oblast"], district:["district","city"], city:["rcity"]};
const ST_NAME = () => ({rep:tx(LTM.rep), obl:tx(LTM.obl), rcity:tx(LTM.rcity), city:tx(LTM.city), dist:tx(LTM.dist), rural:tx(LTM.rural)});

/* ─────────── Күй ─────────── */
const S = {
  token: ss_get("laba_tok"), me: null, units: [], qfields: ["6.1","6.2","6.3"],
  year: 0, quarter: 0, libs: null, libsFor: "", q: "", unit: "", state: "", shown: 50,
  hist: null, log: null, users: null, allUnits: null, repLibs: null
};
function ss_get(k){ try{ return sessionStorage.getItem(k) || ""; }catch(e){ return ""; } }
function ss_set(k, v){ try{ if(v) sessionStorage.setItem(k, v); else sessionStorage.removeItem(k); }catch(e){} }
(function initPeriod(){
  const d = new Date();
  S.year = d.getFullYear(); S.quarter = Math.floor(d.getMonth() / 3) + 1;
})();

/* ─────────── Сервермен байланыс ─────────── */
function api(action, data){
  if(!API_URL) return Promise.reject({msg: ct("apiMissing")});
  const body = Object.assign({action: action, token: S.token}, data || {});
  return fetch(API_URL, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body: JSON.stringify(body)})
    .then(r => r.json(), () => { throw {net: true, msg: ct("netErr")}; })
    .then(res => {
      if(res && res.ok) return res;
      if(res && res.error === "auth"){ logoutLocal(); toast(ct("sessionEnd"), "bad"); go("login"); }
      throw res || {msg: "?"};
    });
}
const go = h => { location.hash = h; };
function logoutLocal(){ S.token = ""; S.me = null; S.libs = null; S.hist = null; S.log = null; S.users = null; ss_set("laba_tok", ""); ss_set("laba_me", ""); updateBtn(); }

/* Кезек: байланыс болмаса, сақтау сұраулары браузерде сақталып, кейін қайта жіберіледі */
const OUTBOX = "laba_outbox";
function outbox(){ try{ return JSON.parse(localStorage.getItem(OUTBOX) || "[]"); }catch(e){ return []; } }
function setOutbox(a){ try{ localStorage.setItem(OUTBOX, JSON.stringify(a)); }catch(e){} }
let flushing = false;
function flushOutbox(){
  const q = outbox();
  if(!q.length || flushing || !S.token) return Promise.resolve();
  flushing = true;
  const next = () => {
    const a = outbox();
    if(!a.length){ flushing = false; refreshBanner(); return Promise.resolve(); }
    const item = a[0];
    const data = Object.assign({}, item.body); delete data.action; delete data.token;
    return api(item.body.action, data)
      .then(() => { setOutbox(outbox().slice(1)); S.libs = null; return next(); },
            err => {
              if(err && err.net){ flushing = false; refreshBanner(); return; }        // байланыс жоқ — кейін қайталаймыз
              setOutbox(outbox().slice(1));                                           // сервер қабылдамады — себебін көрсетеміз
              toast((item.label || "") + ": " + (err.msg || err.error), "bad");
              return next();
            });
  };
  return next();
}
setInterval(flushOutbox, 60000);
window.addEventListener("online", flushOutbox);
function refreshBanner(){
  const el = document.getElementById("cabOutbox");
  if(!el) return;
  const n = outbox().length;
  el.style.display = n ? "" : "none";
  el.querySelector("span").textContent = ct("outbox", {a: n});
}

/* ─────────── Ұсақ интерфейс көмекшілері ─────────── */
function toast(msg, kind){
  let box = document.getElementById("cabToast");
  if(!box){ box = document.createElement("div"); box.id = "cabToast"; document.body.appendChild(box); }
  const t = document.createElement("div");
  t.className = "toast " + (kind || "ok");
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 400); }, 4200);
}
function modal(title, bodyHtml, buttons){
  return new Promise(resolve => {
    const wrap = document.createElement("div");
    wrap.className = "cab-modal";
    wrap.innerHTML = `<div class="cab-dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="cab-dlg-hd"><h3>${esc(title)}</h3><button class="cab-x" data-v="" aria-label="${esc(ct("close"))}">×</button></div>
      <div class="cab-dlg-bd">${bodyHtml}</div>
      <div class="cab-dlg-ft">${(buttons || [[ct("close"), "", "ghost"]]).map(b => `<button class="cbtn ${b[2] || ""}" data-v="${esc(b[1])}">${esc(b[0])}</button>`).join("")}</div></div>`;
    document.body.appendChild(wrap);
    const close = v => { wrap.remove(); document.removeEventListener("keydown", key); resolve(v); };
    const key = e => { if(e.key === "Escape") close(""); };
    document.addEventListener("keydown", key);
    wrap.addEventListener("click", e => {
      const b = e.target.closest("[data-v]");
      if(b && !b.closest(".cab-dlg-bd")) close(b.dataset.v === "" ? "" : b.dataset.v);
      else if(e.target === wrap) close("");
    });
    const f = wrap.querySelector(".cab-dlg-bd input, .cab-dlg-ft .primary");
    if(f) setTimeout(() => f.focus(), 30);
  });
}
function passModal(login, pass){
  const html = `<p class="cab-p">${esc(ct("loginName"))}: <b>${esc(login)}</b></p>
    <div class="pass-box"><code>${esc(pass)}</code><button class="cbtn ghost" id="pwCopy" type="button">${esc(ct("copy"))}</button></div>
    <p class="cab-note" style="margin-top:10px">${esc(ct("passOnce"))}</p>`;
  const p = modal(ct("passF"), html, [[ct("close"), "ok", "primary"]]);
  setTimeout(() => {
    const b = document.getElementById("pwCopy");
    if(b) b.addEventListener("click", e => { e.stopPropagation(); copyText(pass); b.textContent = ct("copied"); });
  }, 20);
  return p;
}
function copyText(s){ try{ navigator.clipboard.writeText(s); }catch(e){} }
const fmtTs = s => { s = String(s || ""); const m = s.match(/^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d):(\d\d))?/); return m ? m[3] + "." + m[2] + "." + m[1] + (m[4] ? " " + m[4] + ":" + m[5] : "") : s; };
const fmtD = s => fmtTs(s).slice(0, 10);
const roleName = r => ct(ROLE_KEY[r] || r);
const unitName = id => { const u = (S.units || []).concat(S.allUnits || []).find(x => x.id === id); return u ? u.full : (id === "KZ" ? "Республикалық деңгей" : String(id || "").replace(/^[OCD]:/, "").replace("|", ", ")); };
const busy = (btn, on) => { if(!btn) return; btn.disabled = on; if(on){ btn.dataset.t = btn.textContent; btn.textContent = ct("wait"); } else if(btn.dataset.t) btn.textContent = btn.dataset.t; };
function loadScript(src){
  return new Promise((res, rej) => {
    if(document.querySelector('script[data-src="' + src + '"]')) return res();
    const s = document.createElement("script"); s.src = src; s.dataset.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}
const needXLSX = () => window.XLSX ? Promise.resolve() : loadScript("vendor/xlsx-0.18.5.full.min.js");
const needDOCX = () => window.docx ? Promise.resolve() : loadScript("vendor/docx-8.5.0.umd.js");
function saveBlob(blob, name){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
const stamp = () => { const d = new Date(), p = n => String(n).padStart(2, "0"); return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes()); };
const fName = c => c + " " + pl(c);
const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);

/* ─────────── Жоғарғы панельдегі «Кіру / аты-жөні» батырмасы ─────────── */
function updateBtn(){
  const b = document.getElementById("cabBtn");
  if(!b) return;
  const me = S.me || (ss_get("laba_me") ? JSON.parse(ss_get("laba_me")) : null);
  b.href = me && S.token ? "#cabinet" : "#login";
  b.querySelector("span").textContent = me && S.token ? me.full_name.split(" ")[0] : ct("login");
  b.classList.toggle("on", !!(me && S.token));
}

/* ─────────── Беттер ─────────── */
const VIEWS = {};
function shell(active, inner){
  const me = S.me, adm = me.role === "admin";
  const tabs = [["cabinet", "tLibs"]];
  if(["admin","oblast","city"].indexOf(me.role) > -1) tabs.push(["cabinet/history", "tHistory"]);
  tabs.push(["cabinet/reports", "tReports"]);
  if(adm) tabs.push(["admin/users", "tUsers"], ["admin/log", "tLog"]);
  return `<div class="cab">
    <div class="cab-top card">
      <div class="cab-who"><span class="ps-av">${esc(me.full_name.split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase())}</span>
        <div><b>${esc(me.full_name)}</b><span>${esc(roleName(me.role))} · ${esc(me.unit_name || "")}${me.institution ? " · " + esc(me.institution) : ""}</span></div></div>
      <button class="cbtn ghost" id="cabOut">${esc(ct("logout"))}</button>
    </div>
    <div class="cab-outbox" id="cabOutbox" style="display:none"><span></span><button class="cbtn ghost sm" id="cabFlush">${esc(ct("sendNow"))}</button></div>
    <nav class="cab-tabs">${tabs.map(t => `<a href="#${t[0]}" class="${t[0] === active ? "on" : ""}">${esc(ct(t[1]))}</a>`).join("")}</nav>
    <div id="cabBody">${inner}</div></div>`;
}
function periodPicker(){
  const y0 = new Date().getFullYear(), ys = [];
  for(let y = y0; y >= 2026; y--) ys.push(y);
  return `<div class="cab-period">
    <label>${esc(ct("year"))} <select class="pick" id="cabYear">${ys.map(y => `<option ${y === S.year ? "selected" : ""}>${y}</option>`).join("")}</select></label>
    <div class="seg" role="group" aria-label="${esc(ct("quarter"))}">${[1,2,3,4].map(q => `<button data-q="${q}" class="${q === S.quarter ? "on" : ""}">${ROMAN[q]}</button>`).join("")}</div>
    <span class="cab-ptxt">${esc(ct("period", {y: S.year, q: ROMAN[S.quarter]}))}</span></div>`;
}

/* Кіру беті */
VIEWS.login = () => `<div class="cab-login">
  <form class="card cab-login-card" id="loginForm" autocomplete="on">
    <div class="cab-lg-ic">${svg(PI.book)}</div>
    <h1>${esc(ct("loginTitle"))}</h1>
    <p>${esc(ct("loginDesc"))}</p>
    <label class="fld"><span>${esc(ct("loginF"))}</span><input class="inp" name="login" autocomplete="username" required autocapitalize="none" spellcheck="false"></label>
    <label class="fld"><span>${esc(ct("passF"))}</span><input class="inp" name="password" type="password" autocomplete="current-password" required></label>
    <label class="chk"><input type="checkbox" id="showPw"> ${esc(ct("showPass"))}</label>
    <div class="fld-err" id="loginErr" role="alert"></div>
    <button class="cbtn primary wide" type="submit">${esc(ct("enter"))}</button>
    <p class="cab-note">${esc(ct("noAccount"))}</p>
  </form></div>`;
VIEWS.login.after = () => {
  const f = document.getElementById("loginForm");
  document.getElementById("showPw").addEventListener("change", e => { f.password.type = e.target.checked ? "text" : "password"; });
  f.addEventListener("submit", e => {
    e.preventDefault();
    const btn = f.querySelector("button[type=submit]"), err = document.getElementById("loginErr");
    err.textContent = ""; busy(btn, true);
    fetchLogin(f.login.value, f.password.value).then(() => go("cabinet"), x => { err.textContent = x.msg || x.error; busy(btn, false); });
  });
  setTimeout(() => f.login.focus(), 50);
};
function fetchLogin(login, password){
  return api("login", {login: login, password: password}).then(res => {
    S.token = res.token; S.me = res.user; S.units = res.units; S.qfields = res.qfields || S.qfields;
    ss_set("laba_tok", res.token); ss_set("laba_me", JSON.stringify(res.user));
    updateBtn(); flushOutbox();
  });
}

/* Кітапханалар тізімі */
VIEWS.cabinet = () => shell("cabinet", `${periodPicker()}<div id="cabLibs"><div class="card p-empty">${esc(ct("wait"))}</div></div>`);
VIEWS.cabinet.after = () => { bindPeriod(() => loadLibs(true)); loadLibs(false); };
function bindPeriod(cb){
  const y = document.getElementById("cabYear");
  if(y) y.addEventListener("change", () => { S.year = +y.value; cb(); });
  document.querySelectorAll(".cab-period [data-q]").forEach(b => b.addEventListener("click", () => {
    S.quarter = +b.dataset.q; document.querySelectorAll(".cab-period [data-q]").forEach(x => x.classList.toggle("on", x === b));
    const t = document.querySelector(".cab-ptxt"); if(t) t.textContent = ct("period", {y: S.year, q: ROMAN[S.quarter]});
    cb();
  }));
}
function loadLibs(force){
  const key = S.year + "-" + S.quarter;
  const box = document.getElementById("cabLibs");
  if(S.libs && S.libsFor === key && !force) return drawLibs();
  box.innerHTML = `<div class="card p-empty">${esc(ct("wait"))}</div>`;
  api("libs", {year: S.year, quarter: S.quarter}).then(res => { S.libs = res.libs; S.libsFor = key; drawLibs(); },
    err => { box.innerHTML = `<div class="card p-empty">${esc(err.msg || err.error)}</div>`; });
}
function drawLibs(){
  const box = document.getElementById("cabLibs");
  if(!box) return;
  const all = S.libs || [], done = all.filter(l => l.filled).length;
  const units = (S.units || []).filter(u => all.some(l => l.unit === u.id || ("O:" + l.region) === u.id || ("C:" + l.region) === u.id));
  box.innerHTML = `<div class="card cab-sum">
      <div><span class="cab-k">${esc(ct("scope"))}</span><b>${esc(S.me.unit_name || "")}</b><span class="cab-k">${esc(ct("libsN", {a: nf(all.length)}))}</span></div>
      <div class="cab-prog"><div class="cab-prog-t">${esc(ct("progress", {a: nf(done), b: nf(all.length)}))}</div>${meter(all.length ? done / all.length : 0)}</div></div>
    <div class="p-tools">
      <label class="p-search">${svg(PI.search)}<input id="cabQ" type="search" placeholder="${esc(ct("search"))}" value="${esc(S.q)}"></label>
      ${units.length > 1 ? `<select class="pick" id="cabUnit"><option value="">${esc(ct("allUnits"))}</option>${units.map(u => `<option value="${esc(u.id)}" ${S.unit === u.id ? "selected" : ""}>${esc(u.full)}</option>`).join("")}</select>` : ""}
      <select class="pick" id="cabState">${[["", "allStates"], ["0", "onlyEmpty"], ["1", "onlyFilled"]].map(o => `<option value="${o[0]}" ${S.state === o[0] ? "selected" : ""}>${esc(ct(o[1]))}</option>`).join("")}</select>
      <span class="p-count" id="cabCnt"></span></div>
    <div id="cabList"></div>`;
  const redraw = () => drawLibRows();
  document.getElementById("cabQ").addEventListener("input", e => { S.q = e.target.value; S.shown = 50; redraw(); });
  const u = document.getElementById("cabUnit"); if(u) u.addEventListener("change", e => { S.unit = e.target.value; S.shown = 50; redraw(); });
  document.getElementById("cabState").addEventListener("change", e => { S.state = e.target.value; S.shown = 50; redraw(); });
  redraw();
}
function drawLibRows(){
  const q = S.q.trim().toLowerCase();
  const rows = (S.libs || []).filter(l => (!q || (l.name + " " + l.district + " " + l.region).toLowerCase().indexOf(q) > -1)
    && (!S.unit || l.unit === S.unit || ("O:" + l.region) === S.unit || ("C:" + l.region) === S.unit)
    && (S.state === "" || (S.state === "1") === l.filled));
  const shown = rows.slice(0, S.shown), st = ST_NAME();
  document.getElementById("cabCnt").textContent = nf(rows.length);
  document.getElementById("cabList").innerHTML = rows.length ? `<div class="cab-libs">${shown.map(l => `
    <a class="cab-lib card" href="#cabinet/lib/${encodeURIComponent(l.id)}/${S.year}/${S.quarter}">
      <div class="cab-lib-m"><b>${esc(l.name)}</b><span>${esc([l.district || l.region, st[l.st] || ""].filter(Boolean).join(" · "))}</span></div>
      <div class="cab-lib-s">${l.filled
        ? `<span class="pill ok">✓ ${esc(ct("filled"))}</span><small>${esc(ct("updatedBy", {d: fmtTs(l.updated_at), n: l.user_name}))}</small>`
        : `<span class="pill warn">${esc(ct("notFilled"))}</span>`}</div>
      <span class="cbtn ${l.filled ? "ghost" : "primary"} sm">${esc(ct(l.filled ? "open" : "update"))}</span></a>`).join("")}</div>
    ${rows.length > shown.length ? `<button class="more-btn" id="cabMore">${esc(ct("more"))} (${nf(rows.length - shown.length)})</button>` : ""}`
    : `<div class="card p-empty">${esc(ct("nothing"))}</div>`;
  const m = document.getElementById("cabMore");
  if(m) m.addEventListener("click", () => { S.shown += 100; drawLibRows(); });
}

/* Жаңарту формасы */
VIEWS.lib = (p) => shell("cabinet", `<a class="p-back" href="#cabinet">${esc(ct("back"))}</a><div id="cabEdit"><div class="card p-empty">${esc(ct("wait"))}</div></div>`);
VIEWS.lib.after = (p) => {
  const id = p[2], y = +p[3] || S.year, q = +p[4] || S.quarter;
  S.year = y; S.quarter = q;
  api("lib", {id: id, year: y, quarter: q}).then(res => drawEdit(res), err => {
    document.getElementById("cabEdit").innerHTML = `<div class="card p-empty">${esc(err.msg || err.error)}</div>`;
  });
};
function drawEdit(d){
  const box = document.getElementById("cabEdit");
  const fx = d.passport ? d.passport.f || {} : {};
  const cur = d.current, prev = d.previous;
  const val = f => cur ? String(cur.v[f] == null ? "" : cur.v[f]).replace(/\s/g, "") : (prev ? String(prev.v[f] == null ? "" : prev.v[f]).replace(/\s/g, "") : "");
  const st = ST_NAME();
  box.innerHTML = `
  <div class="card cab-ed-hd">
    <div><span class="pill">${esc(st[d.lib.st] || "")}</span> <span class="pill gray">${esc(d.lib.region + (d.lib.district ? ", " + d.lib.district : ""))}</span>
      <h1>${esc(d.lib.name)}</h1>
      <p class="cab-k">${esc(ct("period", {y: d.year, q: ROMAN[d.quarter]}))}</p>
      <p class="cab-upd ${cur ? "" : "warn"}">${cur ? esc(ct("lastUpd", {d: fmtTs(cur.updated_at), n: cur.user_name, i: cur.user_institution || ""})) : esc(ct("neverUpd"))}</p></div>
  </div>
  <form class="card cab-form" id="qForm" novalidate>
    <h3>${esc(ct("qFields"))}</h3>
    ${S.qfields.map(f => `<label class="fld">
      <span>${esc(f)} ${esc(pl(f))} <i class="req">*</i></span>
      <input class="inp num" name="${esc(f)}" inputmode="numeric" autocomplete="off" value="${esc(val(f) ? nf(+val(f)) : "")}" required>
      <small class="fld-hint">${prev ? esc(ct("prev", {v: nf(+String(prev.v[f]).replace(/\s/g, "") || 0)})) + " (" + esc(prev.year + " · " + ROMAN[prev.quarter]) + ")" : esc(ct("prevNone"))}</small>
      <small class="fld-err" data-err="${esc(f)}"></small></label>`).join("")}
    <div class="cab-actions"><a class="cbtn ghost" href="#cabinet">${esc(ct("cancel"))}</a><button class="cbtn primary" type="submit">${esc(ct("save"))}</button></div>
  </form>
  ${d.canStatic ? staticEditor(fx) : ""}
  <div class="card"><h3 class="cab-h3">${esc(ct("qHistory"))}</h3>
    <div class="scroll-x"><table class="tbl"><thead><tr><th>${esc(ct("quarter"))}</th>${S.qfields.map(f => `<th style="text-align:right">${esc(f)}</th>`).join("")}<th>${esc(ct("when"))}</th><th>${esc(ct("who"))}</th></tr></thead>
    <tbody>${d.history.map(h => `<tr><td>${esc(h.year + " · " + ROMAN[h.quarter])}</td>${S.qfields.map(f => `<td class="v">${esc(h.v[f] === "" || h.v[f] == null ? "—" : nf(+String(h.v[f]).replace(/\s/g, "")))}</td>`).join("")}
      <td>${esc(fmtTs(h.updated_at))}</td><td>${esc(h.user_name)}${h.user_institution ? `<br><small class="cab-k">${esc(h.user_institution)}</small>` : ""}</td></tr>`).join("")}</tbody></table></div></div>`;
  const form = document.getElementById("qForm");
  form.querySelectorAll(".num").forEach(i => i.addEventListener("input", () => {
    const pos = i.value.length - i.selectionStart, raw = i.value.replace(/\D/g, "");
    i.value = raw ? nf(+raw) : ""; try{ i.setSelectionRange(i.value.length - pos, i.value.length - pos); }catch(e){}
    i.classList.remove("bad"); const er = form.querySelector('[data-err="' + i.name + '"]'); if(er) er.textContent = "";
  }));
  form.addEventListener("submit", e => {
    e.preventDefault();
    const vals = {}, errs = {}, warns = [];
    S.qfields.forEach(f => {
      const s = form[f].value.replace(/\s/g, "");
      if(!s) errs[f] = ct("req");
      else if(!/^\d+$/.test(s)) errs[f] = ct("int");
      else if(+s > 100000000) errs[f] = ct("tooBig");
      else {
        vals[f] = +s;
        const pv0 = prev ? +String(prev.v[f]).replace(/\s/g, "") : 0;
        if(pv0 > 0 && Math.abs(vals[f] - pv0) / pv0 > 0.5) warns.push([f, Math.round((vals[f] - pv0) / pv0 * 100)]);
      }
    });
    S.qfields.forEach(f => { form[f].classList.toggle("bad", !!errs[f]); form.querySelector('[data-err="' + f + '"]').textContent = errs[f] || ""; });
    if(Object.keys(errs).length){ const first = form.querySelector(".inp.bad"); if(first) first.focus(); return; }
    const changes = S.qfields.filter(f => !cur || String(cur.v[f]).replace(/\s/g, "") !== String(vals[f]));
    if(!changes.length){ toast(ct("nochange"), "warn"); return; }
    const rows = changes.map(f => `<tr><td>${esc(fName(f))}</td><td class="v">${cur && cur.v[f] !== "" ? esc(nf(+String(cur.v[f]).replace(/\s/g, ""))) : "—"}</td><td class="v"><b>${esc(nf(vals[f]))}</b></td></tr>`).join("");
    const warnHtml = warns.filter(w => changes.indexOf(w[0]) > -1).map(w => `<div class="cab-warn">⚠ ${esc(fName(w[0]))}: ${esc(ct("jump", {a: (w[1] > 0 ? "+" : "") + w[1]}))}</div>`).join("");
    modal(ct("confirmTitle"), `<p class="cab-p"><b>${esc(d.lib.name)}</b><br>${esc(ct("period", {y: d.year, q: ROMAN[d.quarter]}))}</p>${warnHtml}
      <table class="tbl"><thead><tr><th>${esc(ct("field"))}</th><th style="text-align:right">${esc(ct("oldV"))}</th><th style="text-align:right">${esc(ct("newV"))}</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="cab-note">${esc(ct("confirmDesc"))}</p>`, [[ct("cancel"), "", "ghost"], [ct("confirm"), "ok", "primary"]]).then(v => {
      if(v !== "ok") return;
      const btn = form.querySelector("button[type=submit]"); busy(btn, true);
      const body = {action: "save", id: d.lib.id, year: d.year, quarter: d.quarter, values: vals, op: uid()};
      api("save", body).then(res => {
        toast(res.nochange ? ct("nochange") : ct("saved"), res.nochange ? "warn" : "ok");
        S.libs = null; go("cabinet");
      }, err => {
        busy(btn, false);
        if(err && err.net){                                // байланыс жоқ — кезекке
          const a = outbox(); a.push({body: body, ts: Date.now(), label: d.lib.name + " · " + d.year + "/" + ROMAN[d.quarter]}); setOutbox(a);
          toast(ct("queued"), "warn"); refreshBanner(); return;
        }
        if(err && err.fields) Object.keys(err.fields).forEach(f => { form[f].classList.add("bad"); form.querySelector('[data-err="' + f + '"]').textContent = err.fields[f]; });
        toast(err.msg || err.error, "bad");
      });
    });
  });
  const sf = document.getElementById("stForm");
  if(sf) sf.addEventListener("submit", e => {
    e.preventDefault();
    const fields = {}, ch = [];
    sf.querySelectorAll("[data-code]").forEach(i => { const c = i.dataset.code; if(i.value.trim() !== String(fx[c] || "").trim()){ fields[c] = i.value.trim(); ch.push(c); } });
    if(!ch.length){ toast(ct("nochange"), "warn"); return; }
    modal(ct("confirmTitle"), `<table class="tbl"><tbody>${ch.map(c => `<tr><td>${esc(fName(c))}</td><td>${esc(fx[c] || "—")}</td><td><b>${esc(fields[c] || "—")}</b></td></tr>`).join("")}</tbody></table>
      <p class="cab-note">${esc(ct("confirmDesc"))}</p>`, [[ct("cancel"), "", "ghost"], [ct("confirm"), "ok", "primary"]]).then(v => {
      if(v !== "ok") return;
      api("saveStatic", {id: d.lib.id, fields: fields}).then(() => { toast(ct("saved")); render(location.hash.slice(1)); }, err => toast(err.msg || err.error, "bad"));
    });
  });
}
function staticEditor(fx){
  const codes = [];
  PF.forEach(g => g.f.forEach(f => { if(S.qfields.indexOf(f[0]) < 0) codes.push(f[0]); }));
  return `<details class="card cab-static"><summary>${esc(ct("staticT"))}</summary>
    <form id="stForm" class="cab-st-grid">${codes.map(c => `<label class="fld"><span>${esc(fName(c))}</span>
      <input class="inp" data-code="${esc(c)}" value="${esc(fx[c] || "")}"></label>`).join("")}
      <div class="cab-actions"><button class="cbtn primary" type="submit">${esc(ct("staticSave"))}</button></div></form></details>`;
}

/* Өзгерістер тарихы (облыс/қала әдіскері) және журнал (бас әкімші) */
function histView(full){
  return shell(full ? "admin/log" : "cabinet/history", `
    <div class="ph"><h2>${esc(ct(full ? "tLog" : "tHistory"))}</h2><p>${esc(ct(full ? "logDesc" : "histDesc"))}</p></div>
    <form class="p-tools" id="hForm">
      <label class="fld-in"><span>${esc(ct("from"))}</span><input class="inp sm" type="date" name="from"></label>
      <label class="fld-in"><span>${esc(ct("to"))}</span><input class="inp sm" type="date" name="to"></label>
      <label class="p-search">${svg(PI.search)}<input name="q" type="search" placeholder="${esc(ct("find"))}…"></label>
      <button class="cbtn primary" type="submit">${esc(ct("find"))}</button>
      ${full ? `<button class="cbtn ghost" type="button" id="hXls">${esc(ct("excel"))}</button>` : ""}
    </form><div id="hBox"></div>`);
}
VIEWS.history = () => histView(false);
VIEWS.history.after = () => bindHist(false);
VIEWS.log = () => histView(true);
VIEWS.log.after = () => bindHist(true);
function bindHist(full){
  const f = document.getElementById("hForm"), st = {rows: [], offset: 0, more: false, params: {}};
  const load = (reset) => {
    if(reset){ st.rows = []; st.offset = 0; st.params = {from: f.from.value, to: f.to.value, q: f.q.value.trim()}; }
    const box = document.getElementById("hBox");
    if(reset) box.innerHTML = `<div class="card p-empty">${esc(ct("wait"))}</div>`;
    api(full ? "log" : "history", Object.assign({limit: 100, offset: st.offset}, st.params)).then(res => {
      st.rows = st.rows.concat(res.rows); st.offset += res.rows.length; st.more = res.more; draw();
    }, err => { box.innerHTML = `<div class="card p-empty">${esc(err.msg || err.error)}</div>`; });
  };
  const draw = () => {
    const box = document.getElementById("hBox");
    if(!st.rows.length){ box.innerHTML = `<div class="card p-empty">${esc(ct("nothing"))}</div>`; return; }
    box.innerHTML = `<div class="card scroll-x" style="padding:8px"><table class="tbl cab-log"><thead><tr>
      <th>${esc(ct("when"))}</th><th>${esc(ct("who"))}</th><th>${esc(ct("lib"))}</th><th>${esc(ct("quarter"))}</th><th>${esc(ct("field"))}</th>
      ${full ? `<th style="text-align:right">${esc(ct("oldV"))}</th><th style="text-align:right">${esc(ct("newV"))}</th>` : ""}<th>${esc(ct("action"))}</th></tr></thead>
      <tbody>${st.rows.map(r => `<tr><td class="nw">${esc(fmtTs(r.ts))}</td>
        <td><b>${esc(r.user)}</b><br><small class="cab-k">${esc(r.role)} · ${esc(r.inst)}</small></td>
        <td>${r.lib_id ? `${esc(r.lib)}<br><small class="cab-k">${esc(r.region)}</small>` : `<small class="cab-k">${esc(r.region)}</small>`}</td>
        <td class="nw">${esc(r.year ? r.year + " · " + r.quarter : "—")}</td><td>${esc(r.field)}</td>
        ${full ? `<td class="v">${esc(r.old || "—")}</td><td class="v"><b>${esc(r.val || "—")}</b></td>` : ""}<td>${esc(r.action)}</td></tr>`).join("")}</tbody></table></div>
      ${st.more ? `<button class="more-btn" id="hMore">${esc(ct("more"))}</button>` : ""}`;
    const m = document.getElementById("hMore"); if(m) m.addEventListener("click", () => load(false));
  };
  f.addEventListener("submit", e => { e.preventDefault(); load(true); });
  const x = document.getElementById("hXls");
  if(x) x.addEventListener("click", () => {
    busy(x, true);
    Promise.all([needXLSX(), api("log", Object.assign({limit: 500, offset: 0}, st.params))]).then(arr => {
      const rows = arr[1].rows;
      const aoa = [[ct("when"), ct("who"), ct("level"), ct("region"), ct("inst"), ct("lib"), ct("year"), ct("quarter"), ct("field"), ct("oldV"), ct("newV"), ct("action")]]
        .concat(rows.map(r => [r.ts, r.user, r.role, r.region, r.inst, r.lib, r.year, r.quarter, r.field, r.old, r.val, r.action]));
      const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "Журнал");
      XLSX.writeFile(wb, "laba-zhurnal-" + stamp().slice(0, 10) + ".xlsx");
      busy(x, false);
    }, err => { busy(x, false); toast(err.msg || err.error || "Excel", "bad"); });
  });
  load(true);
}

/* Есептер */
VIEWS.reports = () => {
  const st = ST_NAME(), units = (S.units || []).filter(u => u.type !== "republic" || S.me.role === "admin");
  return shell("cabinet/reports", `
  <div class="ph"><h2>${esc(ct("tReports"))}</h2><p>${esc(ct("repDesc"))}</p></div>
  <form class="card cab-form cab-rep" id="rForm">
    ${periodPicker()}
    <div class="cab-grid">
      ${units.length > 1 ? `<label class="fld"><span>${esc(ct("region"))}</span><select class="pick" name="unit"><option value="">${esc(ct("allUnits"))}</option>${units.map(u => `<option value="${esc(u.id)}">${esc(u.full)}</option>`).join("")}</select></label>` : ""}
      <label class="fld"><span>${esc(ct("type"))}</span><select class="pick" name="st"><option value="">${esc(ct("allTypes"))}</option>${Object.keys(st).map(k => `<option value="${k}">${esc(st[k])}</option>`).join("")}</select></label>
      <label class="fld"><span>${esc(ct("lib"))}</span><select class="pick" name="lib" id="rLib"><option value="">${esc(ct("allLibs"))}</option></select></label>
      <div class="fld"><span>${esc(ct("dateRange"))}</span><div class="cab-dates"><input class="inp sm" type="date" name="from"><input class="inp sm" type="date" name="to"></div></div>
    </div>
    <div class="cab-actions"><button class="cbtn ghost" type="button" data-fmt="xlsx">${esc(ct("excel"))}</button><button class="cbtn primary" type="button" data-fmt="docx">⬇ ${esc(ct("word"))}</button></div>
  </form>`);
};
VIEWS.reports.after = () => {
  bindPeriod(() => {});
  const f = document.getElementById("rForm"), sel = document.getElementById("rLib");
  const fill = () => {
    const libs = (S.libs || []).filter(l => (!f.unit || !f.unit.value || l.unit === f.unit.value || "O:" + l.region === f.unit.value || "C:" + l.region === f.unit.value) && (!f.st.value || l.st === f.st.value));
    sel.innerHTML = `<option value="">${esc(ct("allLibs"))}</option>` + libs.slice(0, 2000).map(l => `<option value="${esc(l.id)}">${esc(l.name.slice(0, 90))}</option>`).join("");
  };
  if(!S.libs) api("libs", {year: S.year, quarter: S.quarter}).then(r => { S.libs = r.libs; S.libsFor = S.year + "-" + S.quarter; fill(); }); else fill();
  if(f.unit) f.unit.addEventListener("change", fill);
  f.st.addEventListener("change", fill);
  f.querySelectorAll("[data-fmt]").forEach(b => b.addEventListener("click", () => {
    const p = {year: S.year, quarter: S.quarter, unit: f.unit ? f.unit.value : "", st: f.st.value, lib: f.lib.value, from: f.from.value, to: f.to.value};
    const lbl = {unit: f.unit && f.unit.value ? f.unit.selectedOptions[0].textContent : "", st: f.st.value ? f.st.selectedOptions[0].textContent : "",
                 lib: f.lib.value ? f.lib.selectedOptions[0].textContent : ""};
    busy(b, true);
    Promise.all([b.dataset.fmt === "docx" ? needDOCX() : needXLSX(), api("report", p)]).then(arr => {
      const rep = arr[1];
      if(!rep.rows.length){ toast(ct("noRows"), "warn"); busy(b, false); return; }
      (b.dataset.fmt === "docx" ? buildDocx : buildXlsx)(rep, p, lbl).then(() => busy(b, false), e => { busy(b, false); toast(String(e && e.message || e), "bad"); });
    }, err => { busy(b, false); toast(err.msg || err.error || "?", "bad"); });
  }));
};
function repMeta(rep, p, lbl){
  const scope = lbl.unit || S.me.unit_name || "";
  const filt = [lbl.st, lbl.lib, p.from || p.to ? fmtD(p.from) + " – " + fmtD(p.to) : ""].filter(Boolean).join("; ");
  const people = {}; let last = "";
  rep.rows.forEach(r => {
    if(r.user_name){ const k = r.user_name + "|" + r.user_phone; people[k] = people[k] || {n: r.user_name, i: r.user_institution, p: r.user_phone, c: 0}; people[k].c++; }
    if(r.updated_at > last) last = r.updated_at;
  });
  return {scope: scope, filt: filt, people: Object.keys(people).map(k => people[k]).sort((a, b) => b.c - a.c), last: last,
          period: ct("period", {y: rep.year, q: ROMAN[rep.quarter]})};
}
const num0 = v => (v === "" || v == null) ? "" : nf(+String(v).replace(/\s/g, ""));
function buildDocx(rep, p, lbl){
  const D = window.docx, m = repMeta(rep, p, lbl);
  const F = "Times New Roman";
  const txt = (t, o) => new D.TextRun(Object.assign({text: String(t == null ? "" : t), font: F, size: 20}, o || {}));
  const par = (runs, o) => new D.Paragraph(Object.assign({children: Array.isArray(runs) ? runs : [runs], spacing: {after: 60}}, o || {}));
  const border = {style: D.BorderStyle.SINGLE, size: 4, color: "94A3B8"};
  const borders = {top: border, bottom: border, left: border, right: border};
  const cell = (t, o) => new D.TableCell({borders: borders, margins: {top: 50, bottom: 50, left: 80, right: 80}, shading: o && o.head ? {fill: "DBEAFE"} : undefined,
    verticalAlign: D.VerticalAlign.CENTER,
    children: String(t).split("\n").map((line, i) => par(txt(line, {bold: !!(o && o.head) || (o && o.bold && i === 0), size: o && o.small && i ? 16 : 18, color: o && o.small && i ? "475569" : undefined}),
      {alignment: o && o.right ? D.AlignmentType.RIGHT : D.AlignmentType.LEFT, spacing: {after: 0}}))});
  const head = ["№", ct("lib"), ct("region")].concat(rep.fields.map(f => f[0] + " " + f[1])).concat([ct("when"), ct("resp")]);
  const widths = [4, 26, 15].concat(rep.fields.map(() => 9)).concat([10, 18]);
  const rows = [new D.TableRow({tableHeader: true, children: head.map((h, i) => cell(h, {head: true, right: i >= 3 && i < 3 + rep.fields.length}))})];
  const sums = rep.fields.map(() => 0);
  rep.rows.forEach((r, i) => {
    const vals = rep.fields.map((f, j) => { const v = r.v ? r.v[f[0]] : ""; const n = +String(v || "").replace(/\s/g, ""); if(n) sums[j] += n; return num0(v); });
    rows.push(new D.TableRow({cantSplit: true, children: [cell(i + 1), cell(r.name), cell(r.district || r.region)]
      .concat(vals.map(v => cell(v || "—", {right: true})))
      .concat([cell(r.updated_at ? fmtTs(r.updated_at) : ct("noData")), cell(r.user_name ? r.user_name + "\n" + [r.user_institution, r.user_phone].filter(Boolean).join(", ") : "—", {bold: true, small: true})])}));
  });
  rows.push(new D.TableRow({children: [cell(""), cell(ct("total"), {bold: true}), cell("")].concat(sums.map(s => cell(nf(s), {right: true, bold: true}))).concat([cell(""), cell("")])}));
  const doc = new D.Document({
    creator: "LABA", title: ct("repTitle"),
    styles: {default: {document: {run: {font: F, size: 22}}}},
    sections: [{
      properties: {page: {size: {orientation: D.PageOrientation.LANDSCAPE}, margin: {top: 1000, bottom: 1000, left: 1000, right: 1000}}},
      footers: {default: new D.Footer({children: [par([txt("LABA · " + ct("repTitle") + " · " + stamp() + "   "), new D.TextRun({children: [D.PageNumber.CURRENT, " / ", D.PageNumber.TOTAL_PAGES], font: F, size: 16})], {alignment: D.AlignmentType.RIGHT})]})},
      children: [
        par(txt("ҚАЗАҚСТАН РЕСПУБЛИКАСЫНЫҢ ҰЛТТЫҚ КІТАПХАНАСЫ · ҒЫЛЫМИ-ӘДІСТЕМЕЛІК ҚЫЗМЕТ", {size: 16, color: "475569"}), {alignment: D.AlignmentType.CENTER}),
        par(txt(ct("repTitle"), {bold: true, size: 30}), {alignment: D.AlignmentType.CENTER, spacing: {before: 120, after: 120}}),
        par(txt(ct("repPeriod", {p: m.period}), {size: 22}), {alignment: D.AlignmentType.CENTER}),
        par(txt(ct("repScope", {s: m.scope}), {size: 22}), {alignment: D.AlignmentType.CENTER}),
        m.filt ? par(txt(ct("repFilters", {f: m.filt}), {size: 20, color: "475569"}), {alignment: D.AlignmentType.CENTER}) : par(txt("")),
        par(txt("")),
        new D.Table({width: {size: 100, type: D.WidthType.PERCENTAGE}, columnWidths: widths.map(w => Math.round(w * 140)), rows: rows}),
        par(txt(""), {spacing: {after: 200}}),
        par(txt(ct("respList"), {bold: true, size: 22})),
        ...m.people.map(x => par(txt("• " + x.n + (x.i ? " — " + x.i : "") + (x.p ? ", тел.: " + x.p : "") + " (" + x.c + ")", {size: 20}), {indent: {left: 300}})),
        ...(m.people.length ? [] : [par(txt("—"))]),
        par(txt(ct("lastDate", {d: m.last ? fmtTs(m.last) : "—"}), {size: 22}), {spacing: {before: 160}}),
        par(txt(ct("genDate", {d: fmtTs(stamp())}), {size: 22})),
        par(txt(ct("genBy", {n: S.me.full_name + (S.me.institution ? ", " + S.me.institution : "") + (S.me.phone ? ", тел.: " + S.me.phone : "")}), {size: 22}))
      ]
    }]
  });
  return D.Packer.toBlob(doc).then(blob => saveBlob(blob, "laba-esep-" + rep.year + "-" + ROMAN[rep.quarter] + "-" + stamp().slice(0, 10) + ".docx"));
}
function buildXlsx(rep, p, lbl){
  const m = repMeta(rep, p, lbl);
  const head = ["№", ct("lib"), ct("region"), "Аудан / қала", ct("type")].concat(rep.fields.map(f => f[0] + " " + f[1])).concat([ct("when"), ct("resp"), ct("inst"), ct("phone")]);
  const aoa = [[ct("repTitle")], [ct("repPeriod", {p: m.period})], [ct("repScope", {s: m.scope})], [], head]
    .concat(rep.rows.map((r, i) => [i + 1, r.name, r.region, r.district, r.status]
      .concat(rep.fields.map(f => { const v = r.v ? String(r.v[f[0]] || "").replace(/\s/g, "") : ""; return v === "" ? "" : +v; }))
      .concat([r.updated_at, r.user_name, r.user_institution, r.user_phone])))
    .concat([[], [ct("respList")]]).concat(m.people.map(x => ["", x.n, x.i, x.p]))
    .concat([[], [ct("lastDate", {d: m.last ? fmtTs(m.last) : "—"})], [ct("genDate", {d: fmtTs(stamp())})], [ct("genBy", {n: S.me.full_name})]]);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{wch: 5}, {wch: 50}, {wch: 24}, {wch: 24}, {wch: 14}].concat(rep.fields.map(() => ({wch: 14}))).concat([{wch: 18}, {wch: 28}, {wch: 28}, {wch: 16}]);
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Есеп");
  XLSX.writeFile(wb, "laba-esep-" + rep.year + "-" + ROMAN[rep.quarter] + "-" + stamp().slice(0, 10) + ".xlsx");
  return Promise.resolve();
}

/* Аккаунттар (бас әкімші) */
VIEWS.users = () => shell("admin/users", `
  <div class="ph"><h2>${esc(ct("users"))}</h2></div>
  <div class="p-tools"><button class="cbtn primary" id="uNew">${esc(ct("newUser"))}</button>
    <label class="cbtn ghost" for="uFile">${esc(ct("bulk"))}</label><input type="file" id="uFile" accept=".xlsx,.xls,.csv" hidden>
    <button class="cbtn ghost" id="uTpl">${esc(ct("template"))}</button>
    <label class="p-search">${svg(PI.search)}<input id="uQ" type="search" placeholder="${esc(ct("find"))}…"></label></div>
  <div id="uBox"><div class="card p-empty">${esc(ct("wait"))}</div></div>`);
VIEWS.users.after = () => {
  const load = () => Promise.all([api("users"), S.allUnits ? null : api("allUnits")]).then(arr => {
    S.users = arr[0].users; if(arr[1]){ S.allUnits = arr[1].units; S.repLibs = arr[1].libs; } drawUsers();
  }, err => { document.getElementById("uBox").innerHTML = `<div class="card p-empty">${esc(err.msg || err.error)}</div>`; });
  document.getElementById("uQ").addEventListener("input", drawUsers);
  document.getElementById("uNew").addEventListener("click", () => userForm(null).then(r => { if(r) load(); }));
  document.getElementById("uTpl").addEventListener("click", () => needXLSX().then(() => {
    const aoa = [["Логин", "Аты-жөні", "Лауазымы", "Деңгейі", "Аймағы", "Республикалық кітапхана №", "Мекемесі", "Телефон", "Пароль"],
      ["turk.oblys", "Сәрсенова Айгүл Маратқызы", "Бас әдіскер", "облыстық", "Түркістан облысы", "", "Түркістан облыстық кітапханасы", "+7 701 000 00 00", ""],
      ["keles.audan", "Әлиев Нұрлан", "Әдіскер", "аудандық", "Түркістан облысы, Келес ауданы", "", "Келес ОКЖ", "+7 702 000 00 00", ""],
      ["astana.qala", "Иванова Анна", "Әдіскер", "қалалық", "Астана қаласы", "", "Астана ОКЖ", "", "Astana2026x"],
      ["nlrk", "Омарова Дана", "Әдіскер", "республикалық", "", "1", "ҚР Ұлттық кітапханасы", "", ""]];
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "Аккаунттар");
    XLSX.writeFile(wb, "laba-akkaunttar-ulgi.xlsx");
  }));
  document.getElementById("uFile").addEventListener("change", e => { const f = e.target.files[0]; e.target.value = ""; if(f) bulkImport(f).then(load); });
  document.getElementById("uBox").addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if(!b) return;
    const u = S.users.find(x => x.user_id === b.dataset.id); if(!u) return;
    if(b.dataset.act === "edit") userForm(u).then(r => { if(r) load(); });
    if(b.dataset.act === "pass"){
      modal(ct("setPass") + ": " + u.login, `<p class="cab-p">${esc(ct("newPassQ"))}</p><input class="inp" id="npw" type="text" autocomplete="new-password">`,
        [[ct("cancel"), "", "ghost"], [ct("save"), "ok", "primary"]]).then(v => {
        if(v !== "ok") return;
        const pw = (document.getElementById("npw") || {}).value || "";
        api("userPassword", {user_id: u.user_id, password: pw}).then(r => { if(r.password) passModal(u.login, r.password); else toast(ct("saved")); load(); }, err => toast(err.msg || err.error, "bad"));
      });
      setTimeout(() => {}, 0);
    }
    if(b.dataset.act === "status"){
      const to = u.status === "active" ? "blocked" : "active";
      const ask = to === "blocked" ? modal(ct("block"), `<p class="cab-p">${esc(ct("blockQ", {n: u.full_name + " (" + u.login + ")"}))}</p>`, [[ct("no"), "", "ghost"], [ct("yes"), "ok", "primary"]]) : Promise.resolve("ok");
      ask.then(v => { if(v === "ok") api("userStatus", {user_id: u.user_id, status: to}).then(() => { toast(ct("saved")); load(); }, err => toast(err.msg || err.error, "bad")); });
    }
  });
  load();
};
function drawUsers(){
  const box = document.getElementById("uBox"); if(!box || !S.users) return;
  const q = (document.getElementById("uQ").value || "").toLowerCase();
  const rows = S.users.filter(u => !q || (u.full_name + " " + u.login + " " + u.unit_name + " " + u.institution).toLowerCase().indexOf(q) > -1);
  box.innerHTML = `<div class="card scroll-x" style="padding:8px"><table class="tbl cab-users"><thead><tr><th>${esc(ct("fio"))}</th><th>${esc(ct("role"))}</th><th>${esc(ct("unit"))}</th><th>${esc(ct("phone"))}</th><th>${esc(ct("status"))}</th><th>${esc(ct("lastLogin"))}</th><th></th></tr></thead>
  <tbody>${rows.map(u => `<tr class="${u.status === "blocked" ? "off" : ""}"><td><b>${esc(u.full_name)}</b><br><small class="cab-k">${esc(u.login)}${u.position ? " · " + esc(u.position) : ""}</small></td>
    <td>${esc(roleName(u.role))}</td><td>${esc(u.unit_name)}${u.institution ? `<br><small class="cab-k">${esc(u.institution)}</small>` : ""}</td><td class="nw">${esc(u.phone || "")}</td>
    <td><span class="pill ${u.status === "active" ? "ok" : "bad"}">${esc(ct(u.status === "active" ? "active" : "blocked"))}</span></td><td class="nw">${esc(fmtTs(u.last_login) || "—")}</td>
    <td class="nw"><button class="cbtn ghost sm" data-act="edit" data-id="${esc(u.user_id)}">${esc(ct("edit"))}</button>
      <button class="cbtn ghost sm" data-act="pass" data-id="${esc(u.user_id)}">${esc(ct("setPass"))}</button>
      ${u.role !== "admin" || u.user_id !== S.me.user_id ? `<button class="cbtn ghost sm" data-act="status" data-id="${esc(u.user_id)}">${esc(ct(u.status === "active" ? "block" : "unblock"))}</button>` : ""}</td></tr>`).join("")}</tbody></table></div>`;
}
function userForm(u){
  const isNew = !u; u = u || {role: "district"};
  const units = S.allUnits || [], libs = S.repLibs || [];
  const unitOpts = role => units.filter(n => (ROLE_UNIT[role] || []).indexOf(n.type) > -1)
    .map(n => `<option value="${esc(n.id)}" ${n.id === u.unit_id ? "selected" : ""}>${esc(n.full)}</option>`).join("");
  const html = `<form id="uForm" class="cab-uform">
    <label class="fld"><span>${esc(ct("fio"))} <i class="req">*</i></span><input class="inp" name="full_name" value="${esc(u.full_name || "")}" required></label>
    <label class="fld"><span>${esc(ct("position"))}</span><input class="inp" name="position" value="${esc(u.position || "")}"></label>
    <label class="fld"><span>${esc(ct("role"))} <i class="req">*</i></span><select class="pick" name="role">${Object.keys(ROLE_KEY).map(r => `<option value="${r}" ${r === u.role ? "selected" : ""}>${esc(roleName(r))}</option>`).join("")}</select></label>
    <label class="fld" id="fUnit"><span>${esc(ct("unit"))} <i class="req">*</i></span><select class="pick" name="unit_id"><option value="">${esc(ct("choose"))}</option></select></label>
    <label class="fld" id="fLib"><span>${esc(ct("library"))} <i class="req">*</i></span><select class="pick" name="library_id"><option value="">${esc(ct("choose"))}</option>${libs.map(l => `<option value="${esc(l.id)}" ${String(l.id) === String(u.library_id) ? "selected" : ""}>${esc(l.name.slice(0, 110))}</option>`).join("")}</select></label>
    <label class="fld"><span>${esc(ct("institution"))}</span><input class="inp" name="institution" value="${esc(u.institution || "")}"></label>
    <label class="fld"><span>${esc(ct("phone"))}</span><input class="inp" name="phone" type="tel" value="${esc(u.phone || "")}"></label>
    <label class="fld"><span>${esc(ct("loginName"))} <i class="req">*</i></span><input class="inp" name="login" value="${esc(u.login || "")}" autocapitalize="none" spellcheck="false" required></label>
    ${isNew ? `<div class="fld"><span>${esc(ct("passMode"))}</span>
      <label class="chk"><input type="radio" name="pm" value="auto" checked> ${esc(ct("passAuto"))}</label>
      <label class="chk"><input type="radio" name="pm" value="manual"> ${esc(ct("passManual"))}</label>
      <input class="inp" name="password" type="text" autocomplete="new-password" style="display:none" placeholder="≥ 8, әріп + сан"></div>` : ""}
    <div class="fld-err" id="uErr" role="alert"></div></form>`;
  const p = modal(isNew ? ct("newUser").replace("+ ", "") : ct("edit") + ": " + u.login, html, [[ct("cancel"), "", "ghost"], [ct("save"), "ok", "primary"]]);
  let result = null;
  setTimeout(() => {
    const f = document.getElementById("uForm"); if(!f) return;
    const sync = () => {
      const r = f.role.value;
      document.getElementById("fUnit").style.display = ROLE_UNIT[r] ? "" : "none";
      document.getElementById("fLib").style.display = r === "republic" ? "" : "none";
      const keep = f.unit_id.value || u.unit_id;
      f.unit_id.innerHTML = `<option value="">${esc(ct("choose"))}</option>` + unitOpts(r);
      if(keep) f.unit_id.value = keep;
    };
    f.role.addEventListener("change", sync); sync();
    if(isNew) f.querySelectorAll("[name=pm]").forEach(rb => rb.addEventListener("change", () => { f.password.style.display = f.pm.value === "manual" ? "" : "none"; }));
    const save = document.querySelector(".cab-dialog .primary");
    save.addEventListener("click", ev => {
      ev.stopPropagation();
      const data = {user_id: isNew ? "" : u.user_id};
      ["full_name", "position", "role", "unit_id", "library_id", "institution", "phone", "login"].forEach(k => { data[k] = f[k] ? f[k].value.trim() : ""; });
      if(isNew && f.pm.value === "manual") data.password = f.password.value;
      busy(save, true);
      api("userSave", {user: data}).then(r => {
        result = r; document.querySelector(".cab-modal").remove();
        toast(ct("saved"));
        if(r.password) passModal(r.user.login, r.password);
        doneP(r);
      }, err => { busy(save, false); document.getElementById("uErr").textContent = err.msg || err.error; });
    }, true);
  }, 30);
  let doneP;
  return new Promise(res => { doneP = res; p.then(() => res(result)); });
}
function bulkImport(file){
  return needXLSX().then(() => file.arrayBuffer()).then(buf => {
    const wb = XLSX.read(buf, {type: "array"});
    const aoa = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header: 1, raw: false, defval: ""});
    const hdr = (aoa[0] || []).map(h => String(h).trim().toLowerCase());
    const col = re => hdr.findIndex(h => re.test(h));
    const ix = {login: col(/логин|login/), full_name: col(/аты|фио|name/), position: col(/лауазым|должн/), role: col(/деңгей|уров|role/),
                unit_name: col(/аймақ|аймағ|регион|облыс|unit/), library_id: col(/республикалық кітапхана|№/), institution: col(/мекеме|учрежд/),
                phone: col(/телефон|phone/), password: col(/пароль|password/)};
    const roleOf = s => { s = String(s).toLowerCase(); return /облыс|област|oblast/.test(s) ? "oblast" : /аудан|район|district/.test(s) ? "district" : /респ|republic/.test(s) ? "republic" : /қала|город|city/.test(s) ? "city" : /әкімші|админ/.test(s) ? "admin" : ""; };
    const rows = aoa.slice(1).filter(r => r.some(c => String(c).trim())).map(r => {
      const o = {}; Object.keys(ix).forEach(k => { o[k] = ix[k] > -1 ? String(r[ix[k]]).trim() : ""; });
      o.role = roleOf(o.role); return o;
    });
    if(!rows.length){ toast(ct("nothing"), "warn"); return; }
    toast(ct("wait"), "warn");
    return api("userBulk", {rows: rows}).then(res => {
      const okN = res.results.filter(r => r.ok).length, bad = res.results.length - okN;
      const html = `<p class="cab-p"><b>${esc(ct("bulkRes", {a: okN, b: bad}))}</b></p>
        <div class="scroll-x"><table class="tbl"><tbody>${res.results.map(r => `<tr><td>${r.row}</td><td>${esc(r.login)}</td><td>${r.ok ? `<span class="pill ok">✓</span> ${esc(r.full_name)}` : `<span class="pill bad">✗</span> ${esc(r.error)}`}</td></tr>`).join("")}</tbody></table></div>
        ${okN ? `<p class="cab-note">${esc(ct("passOnce"))}</p>` : ""}`;
      const pr = modal(ct("bulk"), html, okN ? [[ct("bulkDl"), "dl", "primary"], [ct("close"), "", "ghost"]] : [[ct("close"), "", "ghost"]]);
      pr.then(v => {
        if(v !== "dl") return;
        const csv = "﻿" + [["login", "full_name", "password"]].concat(res.results.filter(r => r.ok).map(r => [r.login, r.full_name, r.password]))
          .map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(";")).join("\r\n");
        saveBlob(new Blob([csv], {type: "text/csv;charset=utf-8"}), "laba-parolder-" + stamp().slice(0, 10) + ".csv");
      });
    }, err => toast(err.msg || err.error, "bad"));
  }).catch(err => toast(String(err && (err.msg || err.message) || err), "bad"));
}

/* ─────────── Маршрутизатор ─────────── */
function route(hash){
  const p = String(hash || "").split("/");
  if(p[0] === "login") return S.token ? ["cabinet", p] : ["login", p];
  if(!S.token) return ["login", p];
  if(p[0] === "cabinet"){
    if(p[1] === "lib") return ["lib", p];
    if(p[1] === "history") return ["history", p];
    if(p[1] === "reports") return ["reports", p];
    return ["cabinet", p];
  }
  if(p[0] === "admin") return [p[1] === "log" ? "log" : "users", p];
  return ["cabinet", p];
}
function draw(hash){
  const r = route(hash), name = r[0], p = r[1];
  const go2 = () => {
    if(name !== "login" && (!S.me || (["users", "log"].indexOf(name) > -1 && S.me.role !== "admin"))){
      if(S.me && S.me.role !== "admin"){ location.hash = "cabinet"; return; }
    }
    document.getElementById("content").innerHTML = `<div class="page on">${VIEWS[name](p)}</div>`;
    document.getElementById("crumb").textContent = name === "login" ? ct("login") : ct("cabinet");
    document.title = (name === "login" ? ct("login") : ct("cabinet")) + " · LABA";
    if(VIEWS[name].after) VIEWS[name].after(p);
    const o = document.getElementById("cabOut");
    if(o) o.addEventListener("click", () => { api("logout").catch(() => {}); logoutLocal(); go("login"); });
    const fl = document.getElementById("cabFlush");
    if(fl) fl.addEventListener("click", flushOutbox);
    refreshBanner();
    window.scrollTo(0, 0);
  };
  if(name !== "login" && !S.me){
    document.getElementById("content").innerHTML = `<div class="page on"><div class="card p-empty">${esc(ct("wait"))}</div></div>`;
    api("me").then(res => { S.me = res.user; S.units = res.units; S.qfields = res.qfields || S.qfields; ss_set("laba_me", JSON.stringify(res.user)); updateBtn(); go2(); flushOutbox(); },
      () => { if(!S.token) go("login"); });
    return;
  }
  go2();
}

window.CAB = {render: draw, updateBtn: updateBtn};
updateBtn();
})();
