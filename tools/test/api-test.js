// Әдіскерлер кабинетінің серверлік тесті: node tools/test/api-test.js
'use strict';
const assert = require('assert');
const { createEnv } = require('./gas-emulator');

let passed = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); passed++; console.log('  ✓ ' + msg); };
const step = t => console.log('\n■ ' + t);

const g = createEnv();

step('0. Орнату (setupCabinet)');
const msg = g.setupCabinet();
console.log('   ' + msg.replace(/\n/g, '\n   '));
const pass = (msg.match(/уақытша пароль: (\S+)/) || [])[1];
ok(g.ss.getSheetByName('Тізілім').getLastRow() === 3876, 'Тізілім: 3 875 кітапхана + тақырып');
ok(g.ss.getSheetByName('Тоқсандық').getLastRow() === 3876, 'Тоқсандық: 2026-III тоқсаны 3 875 жол');
ok(!!pass, 'Бас әкімшінің уақытша паролі берілді');
ok(/Өзгеріс жоқ/.test(g.setupCabinet()), 'Қайта іске қосу қауіпсіз (өзгеріс жоқ)');
ok(g.ss.getSheetByName('Тоқсандық').getLastRow() === 3876, 'Қайта орнатқанда деректер көбеймеді');

step('1. Кіру жүйесі');
let r = g.post({ action: 'login', login: 'admin', password: 'wrong-pass-1' });
ok(!r.ok && r.error === 'bad_login', 'Қате пароль қабылданбайды');
r = g.post({ action: 'login', login: 'ADMIN', password: pass });
ok(r.ok && r.token && r.user.role === 'admin', 'Бас әкімші кірді (логин регистрге тәуелсіз)');
const admin = r.token;
const usersSheet = g.ss.getSheetByName('Пайдаланушылар');
const hdr = usersSheet.getRange(1, 1, 1, usersSheet.getLastColumn()).getValues()[0];
const row = usersSheet.getRange(2, 1, 1, hdr.length).getValues()[0];
ok(row[hdr.indexOf('pass_hash')].length === 64 && JSON.stringify(row).indexOf(pass) < 0, 'Пароль ашық сақталмайды (тек PBKDF2 хэші)');
ok(!g.post({ action: 'me', token: 'fake' }).ok, 'Жалған токенмен кіруге болмайды');

step('2. Аккаунттар');
const units = g.post({ action: 'allUnits', token: admin });
const U = n => units.units.find(u => u.full === n || u.name === n).id;
const mk = (u) => g.post({ action: 'userSave', token: admin, user: u });
const obl = mk({ login: 'turk.obl', full_name: 'Облыс Әдіскері', position: 'әдіскер', role: 'oblast', unit_id: U('Түркістан облысы'), institution: 'Түркістан ОӘҒК', phone: '87010000001' });
ok(obl.ok && /^[A-Za-z0-9]{10}$/.test(obl.password), 'Облыстық әдіскер жасалды, жүйе пароль жасады');
const dst = mk({ login: 'sairam', full_name: 'Аудан Әдіскері', role: 'district', unit_id: U('Түркістан облысы, Келес ауданы'), institution: 'Келес ОКЖ', phone: '87010000002', password: 'Sairam2026x' });
ok(dst.ok && dst.password === '', 'Аудандық әдіскер жасалды (пароль әкімші енгізді)');
const cty = mk({ login: 'astana', full_name: 'Қала Әдіскері', role: 'city', unit_id: U('Астана қаласы'), institution: 'Астана ОКЖ', phone: '87010000003' });
ok(cty.ok, 'Қалалық әдіскер (Астана) жасалды');
const rep = mk({ login: 'nlrk', full_name: 'ҰК Әдіскері', role: 'republic', library_id: units.libs[0].id, institution: 'ҚР ҰК', phone: '87010000004' });
ok(rep.ok, 'Республикалық кітапхана әдіскері жасалды');
ok(!mk({ login: 'sairam', full_name: 'X', role: 'district', unit_id: U('Түркістан облысы, Келес ауданы') }).ok, 'Бірдей логин қабылданбайды');
ok(!mk({ login: 'bad1', full_name: 'X', role: 'district', unit_id: U('Түркістан облысы') }).ok, 'Деңгейге сай емес аймақ қабылданбайды');
ok(!mk({ login: 'weak', full_name: 'X', role: 'oblast', unit_id: U('Абай облысы'), password: '123' }).ok, 'Әлсіз пароль қабылданбайды');
const bulk = g.post({ action: 'userBulk', token: admin, rows: [
  { login: 'abai.obl', full_name: 'Абай Әдіскері', role: 'oblast', unit_name: 'Абай облысы', phone: '1' },
  { login: 'x', full_name: '', role: 'oblast', unit_name: 'Жоқ облыс' }] });
ok(bulk.results[0].ok && !bulk.results[1].ok, 'Файлдан жүктеу: дұрысы жасалды, қатесі себебімен қайтарылды');

const login = (l, p) => g.post({ action: 'login', login: l, password: p }).token;
const tO = login('turk.obl', obl.password), tD = login('sairam', 'Sairam2026x'), tC = login('astana', cty.password), tR = login('nlrk', rep.password);
ok(tO && tD && tC && tR, 'Барлық әдіскер кіре алады');

step('3. Рұқсаттар (серверде)');
const libs = t => g.post({ action: 'libs', token: t, year: 2026, quarter: 3 }).libs;
const L_all = libs(admin), L_o = libs(tO), L_d = libs(tD), L_c = libs(tC), L_r = libs(tR);
ok(L_all.length === 3875, 'Бас әкімші: барлық 3 875 кітапхана');
ok(L_o.length === 373 && L_o.every(l => l.region === 'Түркістан облысы'), 'Облыстық: тек Түркістан облысы (373)');
ok(L_d.length > 0 && L_d.every(l => l.district === 'Келес ауданы'), 'Аудандық: тек Келес ауданы (' + L_d.length + ')');
ok(L_c.length === 25 && L_c.every(l => l.region === 'Астана қаласы'), 'Қалалық: тек Астана (25)');
ok(L_r.length === 1, 'Республикалық: тек өз мекемесі');
const foreign = L_all.find(l => l.region === 'Абай облысы').id;
let x = g.post({ action: 'lib', token: tD, id: foreign, year: 2026, quarter: 3 });
ok(!x.ok && x.error === 'forbidden', 'Аудандық әдіскер басқа аймақтың кітапханасын аша алмайды (ID-ді қолмен өзгертсе де)');
x = g.post({ action: 'save', token: tO, id: foreign, year: 2026, quarter: 3, values: { '6.1': 1, '6.2': 1, '6.3': 1 } });
ok(!x.ok && x.error === 'forbidden', 'Облыстық әдіскер басқа облысқа жаза алмайды');
ok(!g.post({ action: 'users', token: tO }).ok, 'Әдіскер аккаунттар тізімін көре алмайды');
ok(!g.post({ action: 'log', token: tO }).ok, 'Әдіскер толық журналды көре алмайды');
ok(!g.post({ action: 'saveStatic', token: tO, id: L_o[0].id, fields: { '1.1': 'X' } }).ok, 'Тұрақты өрістерді тек бас әкімші өзгертеді');

step('4. Тоқсандық жаңарту');
const lib = L_d.find(l => l.st === 'rural') || L_d[0];
x = g.post({ action: 'lib', token: tD, id: lib.id, year: 2026, quarter: 4 });
ok(x.ok && !x.current && x.previous && String(x.previous.quarter) === '3', 'IV тоқсан бос, алдыңғы (III) тоқсан мәндері көрсетіледі');
x = g.post({ action: 'save', token: tD, id: lib.id, year: 2026, quarter: 4, values: { '6.1': 'abc', '6.2': -5, '6.3': '' } });
ok(!x.ok && Object.keys(x.fields).length === 3, 'Қате мәндер (мәтін, теріс сан, бос) қабылданбайды');
x = g.post({ action: 'save', token: tD, id: lib.id, year: 2027, quarter: 4, values: { '6.1': 1, '6.2': 1, '6.3': 1 } });
ok(!x.ok, 'Әлі басталмаған тоқсанға енгізуге болмайды');
x = g.post({ action: 'save', token: tD, id: lib.id, year: 2026, quarter: 4, values: { '6.1': '1 250', '6.2': 18000, '6.3': 9000 }, op: 'op-1' });
ok(x.ok && x.changed === 3, 'IV тоқсан сақталды (3 өріс)');
ok(g.post({ action: 'save', token: tD, id: lib.id, year: 2026, quarter: 4, values: { '6.1': 1250, '6.2': 18000, '6.3': 9000 }, op: 'op-1' }).duplicate,
   'Кезектен қайта жіберілген сұрау екі рет жазылмайды');
x = g.post({ action: 'save', token: tO, id: lib.id, year: 2026, quarter: 4, values: { '6.1': 1300, '6.2': 18000, '6.3': 9000 } });
ok(x.ok && x.changed === 1, 'Облыстық әдіскер аудандағы кітапхананы түзете алады (1 өріс)');
x = g.post({ action: 'lib', token: tD, id: lib.id, year: 2026, quarter: 3 });
ok(x.current && x.current.user_name.indexOf('Тізілім') > -1, 'III тоқсан тарихта сақталды (өшпеді)');
x = g.post({ action: 'lib', token: tD, id: lib.id, year: 2026, quarter: 4 });
ok(x.current.user_name === 'Облыс Әдіскері' && x.history.length === 2, 'Соңғы жаңартқан адам және тоқсандар тарихы көрінеді');

step('5. Журнал');
let lg = g.post({ action: 'log', token: admin, limit: 50 });
const changes = lg.rows.filter(r => r.lib_id === String(lib.id));
ok(changes.length === 4 && changes[0].old === '1250' && changes[0].val === '1300', 'Журнал: кім, қашан, қай өріс, ескі және жаңа мән');
ok(changes.every(r => r.region && r.inst && r.role), 'Журналда деңгейі, аймағы, мекемесі бар');
let h = g.post({ action: 'history', token: tO });
ok(h.ok && h.rows.length >= 4 && h.rows.every(r => !('old' in r)), 'Облыстық әдіскер өз облысының тарихын көреді (мәндерсіз)');
ok(g.post({ action: 'history', token: tC }).rows.length === 0, 'Басқа аймақтың әдіскері бұл өзгерістерді көрмейді');
ok(!g.post({ action: 'history', token: tD }).ok, 'Аудандық әдіскерге тарих беті жоқ');
ok(g.verifyLog().indexOf('бүтін') > -1, 'Журналдың хэш тізбегі бүтін');
const logSh = g.ss.getSheetByName('Журнал');
const cell = logSh.getRange(3, 11); const orig = cell.getValues()[0][0];
cell.setValue('999999');
ok(g.verifyLog().indexOf('өзгертілген') > -1, 'Журналды қолмен өзгертсе — анықталады');
cell.setValue(orig);

step('6. Бұғаттау және сессия');
for (let i = 0; i < 5; i++) g.post({ action: 'login', login: 'astana', password: 'Wrong12345' });
r = g.post({ action: 'login', login: 'astana', password: cty.password });
ok(!r.ok && r.error === 'locked', '5 рет қате пароль → аккаунт уақытша бұғатталды');
const cid = cty.user.user_id;
g.post({ action: 'userPassword', token: admin, user_id: cid, password: 'NewPass2026' });
ok(g.post({ action: 'login', login: 'astana', password: 'NewPass2026' }).ok, 'Әкімші парольді ауыстырды → бұғат алынды');
g.post({ action: 'userStatus', token: admin, user_id: cid, status: 'blocked' });
ok(!g.post({ action: 'libs', token: tC, year: 2026, quarter: 3 }).ok, 'Бұғатталған аккаунттың ашық сессиясы да жабылады');
ok(g.post({ action: 'login', login: 'astana', password: 'NewPass2026' }).error === 'blocked', 'Бұғатталған аккаунт кіре алмайды');
ok(g.post({ action: 'log', token: admin, q: 'бұғатталды (astana)' }).rows.length === 1 &&
   g.post({ action: 'users', token: admin }).users.some(u => u.login === 'astana' && u.status === 'blocked'),
   'Аккаунт өшірілмей бұғатталды, журналда жазба бар');
g.post({ action: 'logout', token: tR });
ok(!g.post({ action: 'me', token: tR }).ok, 'Шыққаннан кейін токен жарамсыз');

step('7. Есептер');
let rp = g.post({ action: 'report', token: tD, year: 2026, quarter: 4 });
ok(rp.ok && rp.rows.length === L_d.length && rp.rows.every(r => r.district === 'Келес ауданы'), 'Аудандық есеп: тек өз ауданы');
const rr = rp.rows.find(r => String(r.id) === String(lib.id));
ok(rr.user_name === 'Облыс Әдіскері' && rr.user_phone === '87010000001', 'Есепте әр кітапхананың жауаптысы мен телефоны');
rp = g.post({ action: 'report', token: tO, year: 2026, quarter: 3, unit: U('Түркістан облысы, Келес ауданы') });
ok(rp.rows.length === L_d.length, 'Облыстық есеп: аудан бойынша сүзгі');
rp = g.post({ action: 'report', token: tO, year: 2026, quarter: 3, unit: U('Абай облысы') });
ok(rp.rows.length === 0, 'Басқа облыстың сүзгісін қойса да — дерек берілмейді');

step('8. Ашық сайт');
const pub = JSON.parse(g.get({ action: 'passports' }));
const pr = pub.rows.find(r => String(r[0]) === String(lib.id));
ok(pr[pub.cols.indexOf('6.1')] === '1300' && pr[pub.cols.indexOf('q')] === '2026-4', 'Ашық сайтта соңғы тоқсанның мәні мен кезеңі');
ok(JSON.stringify(pub).indexOf('Облыс Әдіскері') < 0, 'Ашық сайтта жаңартқан адамның аты көрсетілмейді');

console.log('\nБарлығы өтті: ' + passed + ' тексеру');
