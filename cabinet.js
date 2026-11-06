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
    tLibs:"Кітапханалар", tHistory:"Өзгерістер тарихы", tReports:"Есептер", tUsers:"Аккаунттар", tLog:"Журнал", tArch:"Мұрағат",
    tBooks:"Кітаптар", bkDesc:"«Кітапханалар не оқып, не ұсынып жатыр?» рубрикасына: оқырманға ұсынатын кітаптар және ең көп оқылған кітаптар — әр оқырман санатына 10 кітапқа дейін. Облыстың тізіміне аудан, қала және ауыл кітапханаларының деректерін қосып енгізіңіз. Тізімді кез келген уақытта жаңартуға болады.",
    bkNone:"Сізге кітап тізімі бекітілмеген: оны облыстық, қалалық және республикалық кітапхананың әдіскері енгізеді.", bkRec:"Оқырманға ұсынады", bkTop:"Ең көп оқылған",
    bkAuthor:"Автор", bkTitle:"Кітаптың атауы", bkLang:"Тілі", bkGenre:"Жанры", bkCount:"Оқылу саны", bkClear:"Тазарту",
    bkSaved:"Тізім сақталды: {a} кітап", bkUpd:"Соңғы жаңарту: {d} · {n}",
    bkHintRec:"Ұсыну реті бойынша жазыңыз: 1-орында — ең басты ұсыныс.", bkHintTop:"Оқылу санын (берілім) жазыңыз — тізім сақталғанда сан бойынша өзі реттеледі.",
    stDraft:"Жоба", stSub:"Бекітуде", stOk:"Бекітілді", stRet:"Түзетуге қайтарылды", state:"Күйі",
    saveDraft:"Жоба ретінде сақтау", submit:"Бекітуге жіберу", saveApprove:"Сақтау және бекіту", returnBtn:"Түзетуге қайтару",
    returnQ:"Қайтару себебін жазыңыз (әдіскер көреді):", returned:"Есеп түзетуге қайтарылды", approvedOk:"Есеп бекітілді",
    submittedOk:"Есеп бекітуге жіберілді", draftOk:"Жоба сақталды", ruleSum:"тоқсан ішінде", ruleLast:"тоқсан соңында",
    subBy:"Жіберген: {n}, {d}", apBy:"Бекіткен: {n}, {d}", retBy:"Түзетуге қайтарылды: {c}", prevQ:"алдыңғы: {v} ({p})",
    formNote:"«Тоқсан ішінде» — осы тоқсандағы мән (жылдық есепте 4 тоқсан қосылады). «Тоқсан соңында» — тоқсанның соңғы күніндегі жағдай (жылдық есепте IV тоқсанның мәні). Мән жоқ болса — 0 жазыңыз. Толық толтырылмаған есепті жоба ретінде сақтауға болады.",
    fixErr:"Қате өрістерді түзетіңіз", reqSubmit:"Бекітуге жіберу үшін барлық сандық өрісті толтырыңыз (мән жоқ болса — 0)",
    ofErr:"«Соның ішінде» мәні {p} мәнінен аспауы керек", num:"Сан енгізіңіз (0 немесе одан көп)",
    annualT:"{y} жылдық есеп", annualFull:"4 тоқсан бекітілген — жылдық есеп дайын", annualPart:"Бекітілген тоқсандар: {q} (жылдық есеп алдын ала)",
    annualNone:"Бұл жылы бекітілген тоқсан әлі жоқ", yearCol:"Жыл",
    annualNote:"Жылдық есеп тек бекітілген тоқсандардан жиналады: «тоқсан ішінде» көрсеткіштері қосылады, «тоқсан соңында» көрсеткіштері — соңғы бекітілген тоқсаннан.",
    tQueue:"Бекіту", queueDesc:"Бекітуді күтіп тұрған есептер. Есепті ашып тексеріңіз: дұрыс болса — «Сақтау және бекіту», қате болса — себебін жазып, түзетуге қайтарыңыз.",
    queueNone:"Бекітуді күтіп тұрған есеп жоқ", sentAt:"Жіберілді", check:"Тексеру",
    tSum:"Жиынтық", sumDesc:"Аймақтар бойынша есептердің тапсырылуы және негізгі көрсеткіштердің қосындысы. Барлық кітапхананың толық деректерін Excel-ге жүктей аласыз.",
    perYear:"Жыл", cntLibs:"Кітапхана", cntOk:"Бекітілді", cntSub:"Бекітуде", cntOther:"Жоба / қайтарылған", cntNone:"Тапсырмаған",
    cntFull:"Толық жыл", xlsFull:"Excel: барлық деректер", wordSum:"Word: жиынтық", sumTitle:"Кітапханалардың тоқсандық есептерінің жиынтығы",
    sumNote:"Қосындыларға тек бекітілген есептер кіреді. «Жыл» — жыл басынан бергі бекітілген тоқсандардың жиынтығы.", unitCol:"Аудан / қала",
    apCol:"Бекіткен", onlyDraft:"Жоба / қайтарылған", onlySub:"Бекітуде", repPerY:"{y} жыл — жыл басынан (бекітілген тоқсандар)",
    periodYtd:"{y} жыл, жыл басынан (бекітілген тоқсандар)",
    annual:"жыл қорытындысы", archRow:"Мұрағат", periodArch:"{y} жыл, жылдық қорытынды (мұрағат)",
    repPer:"Кезең", repPerQ:"Тоқсан (жоғарыда таңдалған)", repPerA:"{y} жыл — жылдық қорытынды (мұрағат)",
    archDesc:"Жыл аяқталғанда «Тізілім» парағындағы барлық паспорт сол жылдың толық көшірмесі ретінде мұрағатқа сақталады. 6.1–6.3 көрсеткіштері үшін сол жылдың соңғы тоқсанының мәні алынады. Мұрағатталған деректер өзгермейді: сайтта жыл бойынша қарауға, есепке шығаруға және салыстыруға болады.",
    archYears:"Мұрағаттағы жылдар", archNone:"Мұрағат әлі бос", archCount:"Кітапхана саны", archAt:"Сақталған уақыты",
    archDo:"Жылды мұрағатқа жабу", archYear:"Қай жыл", archOver:"Бұрынғы мұрағатты ауыстыру (тек түзету қажет болса)",
    archQ:"{y} жылдың барлық паспорты мұрағатқа сақталады. Жалғастырасыз ба?", archQOver:"{y} жылдың бұрынғы мұрағаты жаңа деректермен АУЫСТЫРЫЛАДЫ. Бұл журналға жазылады. Жалғастырасыз ба?",
    archOk:"{y} жыл мұрағатқа сақталды: {n} кітапхана", archBusy:"Мұрағатқа сақталуда… (1–2 минут)",
    year:"Жыл", quarter:"Тоқсан", qN:"{a} тоқсан", period:"{y} жыл, {q} тоқсан",
    scope:"Жауапты аймағыңыз", libsN:"{a} кітапхана", filled:"Толтырылды", notFilled:"Толтырылмаған",
    progress:"{a} / {b} бекітілді", search:"Кітапхана атауы немесе аудан…", allUnits:"Барлық аймақтар",
    allStates:"Барлығы", onlyEmpty:"Толтырылмағандар", onlyFilled:"Бекітілгендер", update:"Жаңарту", open:"Ашу",
    updatedBy:"{d} · {n}", more:"Тағы көрсету", nothing:"Ештеңе табылмады",
    back:"← Кітапханалар тізімі", qFields:"Тоқсандық есеп", prev:"Алдыңғы тоқсан: {v}", prevNone:"Алдыңғы тоқсан деректері жоқ",
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
    tLibs:"Библиотеки", tHistory:"История изменений", tReports:"Отчёты", tUsers:"Аккаунты", tLog:"Журнал", tArch:"Архив",
    tBooks:"Книги", bkDesc:"Для рубрики «Что читают и рекомендуют библиотеки?»: книги, рекомендуемые читателям, и самые читаемые книги — до 10 книг на каждую категорию читателей. В список области включите данные районных, городских и сельских библиотек. Список можно обновлять в любое время.",
    bkNone:"За вами не закреплён список книг: его вносит методист областной, городской или республиканской библиотеки.", bkRec:"Рекомендуют", bkTop:"Самые читаемые",
    bkAuthor:"Автор", bkTitle:"Название книги", bkLang:"Язык", bkGenre:"Жанр", bkCount:"Выдач", bkClear:"Очистить",
    bkSaved:"Список сохранён: {a} книг", bkUpd:"Последнее обновление: {d} · {n}",
    bkHintRec:"Укажите в порядке рекомендации: на 1-м месте — главная рекомендация.", bkHintTop:"Укажите число выдач — при сохранении список упорядочится автоматически.",
    stDraft:"Черновик", stSub:"На утверждении", stOk:"Утверждён", stRet:"Возвращён на доработку", state:"Статус",
    saveDraft:"Сохранить черновик", submit:"Отправить на утверждение", saveApprove:"Сохранить и утвердить", returnBtn:"Вернуть на доработку",
    returnQ:"Укажите причину возврата (её увидит методист):", returned:"Отчёт возвращён на доработку", approvedOk:"Отчёт утверждён",
    submittedOk:"Отчёт отправлен на утверждение", draftOk:"Черновик сохранён", ruleSum:"за квартал", ruleLast:"на конец квартала",
    subBy:"Отправил: {n}, {d}", apBy:"Утвердил: {n}, {d}", retBy:"Возвращён: {c}", prevQ:"пред.: {v} ({p})",
    formNote:"«За квартал» — значение за этот квартал (в годовом отчёте 4 квартала суммируются). «На конец квартала» — состояние на последний день квартала (в годовом — значение IV квартала). Если значения нет — укажите 0. Неполный отчёт можно сохранить как черновик.",
    fixErr:"Исправьте поля с ошибками", reqSubmit:"Для отправки заполните все числовые поля (если значения нет — 0)",
    ofErr:"Значение «в том числе» не может превышать {p}", num:"Введите число (0 или больше)",
    annualT:"Годовой отчёт за {y} год", annualFull:"Утверждены 4 квартала — годовой отчёт готов", annualPart:"Утверждённые кварталы: {q} (годовой отчёт предварительный)",
    annualNone:"В этом году утверждённых кварталов пока нет", yearCol:"Год",
    annualNote:"Годовой отчёт собирается только из утверждённых кварталов: показатели «за квартал» суммируются, «на конец квартала» — из последнего утверждённого квартала.",
    tQueue:"Утверждение", queueDesc:"Отчёты, ожидающие утверждения. Откройте и проверьте: если всё верно — «Сохранить и утвердить», если нет — верните на доработку с указанием причины.",
    queueNone:"Нет отчётов на утверждении", sentAt:"Отправлен", check:"Проверить",
    tSum:"Свод", sumDesc:"Сдача отчётов и суммы основных показателей по регионам. Полные данные всех библиотек можно выгрузить в Excel.",
    perYear:"Год", cntLibs:"Библиотек", cntOk:"Утверждено", cntSub:"На утверждении", cntOther:"Черновик / возвращено", cntNone:"Не сдали",
    cntFull:"Полный год", xlsFull:"Excel: все данные", wordSum:"Word: свод", sumTitle:"Свод квартальных отчётов библиотек",
    sumNote:"В суммы входят только утверждённые отчёты. «Год» — свод утверждённых кварталов с начала года.", unitCol:"Район / город",
    apCol:"Утвердил", onlyDraft:"Черновик / возвращённые", onlySub:"На утверждении", repPerY:"{y} год — с начала года (утверждённые кварталы)",
    periodYtd:"{y} год, с начала года (утверждённые кварталы)",
    annual:"итоги года", archRow:"Архив", periodArch:"{y} год, годовые итоги (архив)",
    repPer:"Период", repPerQ:"Квартал (выбран выше)", repPerA:"{y} год — годовые итоги (архив)",
    archDesc:"По окончании года все паспорта из листа «Тізілім» сохраняются в архив как полная копия этого года. Для показателей 6.1–6.3 берётся значение последнего квартала года. Архивные данные не меняются: их можно смотреть на сайте по годам, выгружать в отчёты и сравнивать.",
    archYears:"Годы в архиве", archNone:"Архив пока пуст", archCount:"Библиотек", archAt:"Время сохранения",
    archDo:"Закрыть год в архив", archYear:"Год", archOver:"Заменить прежний архив (только если нужна корректировка)",
    archQ:"Все паспорта за {y} год будут сохранены в архив. Продолжить?", archQOver:"Прежний архив за {y} год будет ЗАМЕНЁН новыми данными. Это запишется в журнал. Продолжить?",
    archOk:"{y} год сохранён в архив: {n} библиотек", archBusy:"Сохранение в архив… (1–2 минуты)",
    year:"Год", quarter:"Квартал", qN:"{a} квартал", period:"{y} год, {q} квартал",
    scope:"Ваша зона ответственности", libsN:"Библиотек: {a}", filled:"Заполнено", notFilled:"Не заполнено",
    progress:"Утверждено {a} из {b}", search:"Название библиотеки или район…", allUnits:"Все регионы",
    allStates:"Все", onlyEmpty:"Незаполненные", onlyFilled:"Утверждённые", update:"Обновить", open:"Открыть",
    updatedBy:"{d} · {n}", more:"Показать ещё", nothing:"Ничего не найдено",
    back:"← Список библиотек", qFields:"Квартальный отчёт", prev:"Предыдущий квартал: {v}", prevNone:"Нет данных предыдущего квартала",
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
  token: ss_get("laba_tok"), me: null, units: [], form: null, main: ["6.1","6.2","6.3","4.1","4.6","5.3"],
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
    const close = v => {
      modal.vals = {};                                   // терезе жабылғанша енгізілген мәндерді сақтаймыз
      wrap.querySelectorAll(".cab-dlg-bd input[id], .cab-dlg-bd select[id]").forEach(i => { modal.vals[i.id] = i.type === "checkbox" ? i.checked : i.value; });
      wrap.remove(); document.removeEventListener("keydown", key); resolve(v); };
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
const needEXCEL = () => window.ExcelJS ? Promise.resolve() : loadScript("vendor/exceljs-4.4.0.min.js");
/* Логотип: барлық жүктелетін құжаттың жоғарғы жағында. Жүктелмесе — құжат логотипсіз жасалады */
const LOGO = {src: "img/laba-logo.png", w: 480, h: 315};
let logoBuf = null;
const needLogo = () => logoBuf ? Promise.resolve(logoBuf)
  : fetch(LOGO.src).then(r => r.ok ? r.arrayBuffer() : null).then(b => (logoBuf = b), () => null);
/* Excel кітабы: жоғарыда логотип (1–4 жолдар), сосын кесте. rows — жолдар массиві, opts: {title, cols, head (тақырып жолының индексі)} */
function excelBook(sheetName, rows, opts){
  opts = opts || {};
  return Promise.all([needEXCEL(), needLogo()]).then(arr => {
    const wb = new ExcelJS.Workbook(); wb.creator = "LABA"; wb.created = new Date();
    const ws = wb.addWorksheet(sheetName, {views: [{state: "frozen", ySplit: (opts.head != null ? opts.head + 1 : 0) + 5}]});
    const TOP = 5;                                       // логотипке арналған жолдар
    for(let i = 1; i <= TOP; i++) ws.getRow(i).height = i < TOP ? 20 : 8;
    if(arr[1]){
      const id = wb.addImage({buffer: arr[1], extension: "png"});
      const h = 100, w = Math.round(h * LOGO.w / LOGO.h);
      ws.addImage(id, {tl: {col: 0, row: 0}, ext: {width: w, height: h}, editAs: "oneCell"});
    }
    rows.forEach((r, i) => {
      const row = ws.getRow(TOP + 1 + i);
      row.values = r.map(v => v == null ? "" : v);
      if(i === opts.head){
        row.eachCell(c => { c.font = {bold: true}; c.fill = {type: "pattern", pattern: "solid", fgColor: {argb: "FFDBEAFE"}};
          c.alignment = {vertical: "middle", wrapText: true}; c.border = {bottom: {style: "thin", color: {argb: "FF94A3B8"}}}; });
      }
    });
    if(opts.title != null) ws.getRow(TOP + 1 + opts.title).font = {bold: true, size: 14};
    if(opts.cols) ws.columns.forEach((c, i) => { if(opts.cols[i]) c.width = opts.cols[i]; });
    return wb;
  });
}
function saveBook(wb, name){
  return wb.xlsx.writeBuffer().then(buf => saveBlob(new Blob([buf], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), name));
}
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
  if(["admin","oblast"].indexOf(me.role) > -1) tabs.push(["cabinet/queue", "tQueue"]);
  tabs.push(["cabinet/summary", "tSum"]);
  if(["admin","oblast","city","republic"].indexOf(me.role) > -1) tabs.push(["cabinet/books", "tBooks"]);
  tabs.push(["cabinet/reports", "tReports"]);
  if(adm) tabs.push(["admin/users", "tUsers"], ["admin/log", "tLog"], ["admin/archive", "tArch"]);
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
    S.token = res.token; S.me = res.user; S.units = res.units; S.form = res.form || S.form; S.main = res.main || S.main;
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
  const all = S.libs || [], done = all.filter(l => l.status === "approved").length, sub = all.filter(l => l.status === "submitted").length;
  const units = (S.units || []).filter(u => all.some(l => l.unit === u.id || ("O:" + l.region) === u.id || ("C:" + l.region) === u.id));
  box.innerHTML = `<div class="card cab-sum">
      <div><span class="cab-k">${esc(ct("scope"))}</span><b>${esc(S.me.unit_name || "")}</b><span class="cab-k">${esc(ct("libsN", {a: nf(all.length)}))}</span></div>
      <div class="cab-prog"><div class="cab-prog-t">${esc(ct("progress", {a: nf(done), b: nf(all.length)}))}${sub ? ` · ${esc(ct("cntSub"))}: ${nf(sub)}` : ""}</div>${meter(all.length ? done / all.length : 0)}</div></div>
    <div class="p-tools">
      <label class="p-search">${svg(PI.search)}<input id="cabQ" type="search" placeholder="${esc(ct("search"))}" value="${esc(S.q)}"></label>
      ${units.length > 1 ? `<select class="pick" id="cabUnit"><option value="">${esc(ct("allUnits"))}</option>${units.map(u => `<option value="${esc(u.id)}" ${S.unit === u.id ? "selected" : ""}>${esc(u.full)}</option>`).join("")}</select>` : ""}
      <select class="pick" id="cabState">${[["", "allStates"], ["0", "onlyEmpty"], ["d", "onlyDraft"], ["s", "onlySub"], ["1", "onlyFilled"]].map(o => `<option value="${o[0]}" ${S.state === o[0] ? "selected" : ""}>${esc(ct(o[1]))}</option>`).join("")}</select>
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
    && (S.state === "" || {"0": !l.status, "d": l.status === "draft" || l.status === "returned", "s": l.status === "submitted", "1": l.status === "approved"}[S.state]));
  const shown = rows.slice(0, S.shown), st = ST_NAME();
  document.getElementById("cabCnt").textContent = nf(rows.length);
  document.getElementById("cabList").innerHTML = rows.length ? `<div class="cab-libs">${shown.map(l => `
    <a class="cab-lib card" href="#cabinet/lib/${encodeURIComponent(l.id)}/${S.year}/${S.quarter}">
      <div class="cab-lib-m"><b>${esc(l.name)}</b><span>${esc([l.district || l.region, st[l.st] || ""].filter(Boolean).join(" · "))}</span></div>
      <div class="cab-lib-s">${stPill(l.status)}${l.status ? `<small>${esc(ct("updatedBy", {d: fmtTs(l.updated_at), n: l.user_name}))}</small>` : ""}</div>
      <span class="cbtn ${l.status === "approved" ? "ghost" : "primary"} sm">${esc(ct(l.status === "approved" ? "open" : "update"))}</span></a>`).join("")}</div>
    ${rows.length > shown.length ? `<button class="more-btn" id="cabMore">${esc(ct("more"))} (${nf(rows.length - shown.length)})</button>` : ""}`
    : `<div class="card p-empty">${esc(ct("nothing"))}</div>`;
  const m = document.getElementById("cabMore");
  if(m) m.addEventListener("click", () => { S.shown += 100; drawLibRows(); });
}

/* Тоқсандық есеп формасы */
const FIELDS = () => [].concat.apply([], (S.form || []).map(s => s.f));
const FLD = c => FIELDS().find(x => x.c === c);
const flabel = x => (PFL && PFL[x.c] ? pl(x.c) : x.l);
const numOf = (v, frac) => { const s = String(v == null ? "" : v).replace(/[\s ]/g, "").replace(",", "."); return (frac ? /^\d+(\.\d+)?$/ : /^\d+$/).test(s) ? +s : null; };
const fmtV = (x, v) => {
  if(v === "" || v == null) return "—";
  if(x && (x.t === "int" || x.t === "num")){ const n = numOf(v, true); if(n === null) return String(v); return x.t === "num" && n % 1 ? String(n).replace(".", ",") : nf(n); }
  return String(v);
};
const ST_PILL = {draft: ["gray", "stDraft"], submitted: ["warn", "stSub"], approved: ["ok", "stOk"], returned: ["bad", "stRet"]};
const stPill = s => s && ST_PILL[s] ? `<span class="pill ${ST_PILL[s][0]}">${esc(ct(ST_PILL[s][1]))}</span>` : `<span class="pill warn">${esc(ct("notFilled"))}</span>`;
/* Паспорттағы мәнді форма өрісіне келтіру: «4 сканер (…)» → 4, «Иә» → иә */
function fromPassport(x, v){
  v = String(v == null ? "" : v).trim();
  if(!v) return "";
  if(x.t === "int"){ const m = v.match(/^(\d[\d\s]*)/); return m ? m[1].replace(/\s/g, "") : ""; }
  if(x.t === "num"){ const m = v.match(/^(\d+(?:[.,]\d+)?)/); return m ? m[1].replace(".", ",") : ""; }
  if(x.t === "sel"){ const h = x.opt.find(o => o.toLowerCase() === v.toLowerCase()); return h || ""; }
  return v;
}
/* Формадағы мәндерді тексеру (серверде де дәл осылай тексеріледі) */
function checkVals(vals, submit){
  const errs = {};
  FIELDS().forEach(x => {
    const v = String(vals[x.c] == null ? "" : vals[x.c]).trim();
    if(x.t === "text") return;
    if(!v){ if(submit) errs[x.c] = ct("req"); return; }
    if(x.t === "sel") return;
    const n = numOf(v, x.t === "num");
    if(n === null) errs[x.c] = ct(x.t === "num" ? "num" : "int");
    else if(n > 100000000) errs[x.c] = ct("tooBig");
  });
  FIELDS().forEach(x => {
    if(!x.of || errs[x.c] || errs[x.of]) return;
    const a = numOf(vals[x.c], true), b = numOf(vals[x.of], true);
    if(a !== null && b !== null && a > b) errs[x.c] = ct("ofErr", {p: x.of});
  });
  return errs;
}
VIEWS.lib = (p) => shell("cabinet", `<a class="p-back" href="#cabinet">${esc(ct("back"))}</a><div id="cabEdit"><div class="card p-empty">${esc(ct("wait"))}</div></div>`);
VIEWS.lib.after = (p) => {
  const id = p[2], y = +p[3] || S.year, q = +p[4] || S.quarter;
  S.year = y; S.quarter = q;
  api("lib", {id: id, year: y, quarter: q}).then(res => drawEdit(res), err => {
    document.getElementById("cabEdit").innerHTML = `<div class="card p-empty">${esc(err.msg || err.error)}</div>`;
  });
};
function fieldInput(x, v){
  const nm = esc(x.c);
  if(x.t === "sel") return `<select class="inp" name="${nm}"><option value="">—</option>${x.opt.map(o => `<option ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
  if(x.t === "text") return `<textarea class="inp" name="${nm}" rows="${String(v).length > 60 ? 3 : 1}">${esc(v)}</textarea>`;
  const shown = v === "" ? "" : x.t === "int" ? (numOf(v) === null ? v : nf(numOf(v))) : String(v).replace(".", ",");
  return `<input class="inp num" data-t="${x.t}" name="${nm}" inputmode="${x.t === "int" ? "numeric" : "decimal"}" autocomplete="off" value="${esc(shown)}">`;
}
function drawEdit(d){
  const box = document.getElementById("cabEdit");
  const fx = d.passport ? d.passport.f || {} : {};
  const cur = d.current, prev = d.previous, st = ST_NAME();
  const init = x => cur ? String(cur.v[x.c] == null ? "" : cur.v[x.c])
    : x.r === "last" ? (prev && String(prev.v[x.c] || "") !== "" ? String(prev.v[x.c]) : fromPassport(x, fx[x.c])) : "";
  const prevHint = x => prev && String(prev.v[x.c] || "") !== "" ? ct("prevQ", {v: fmtV(x, prev.v[x.c]), p: prev.year + " · " + ROMAN[prev.quarter]}) : "";
  const meta = [];
  if(cur && cur.submitted_at) meta.push(esc(ct("subBy", {n: cur.submitted_by || cur.user_name, d: fmtTs(cur.submitted_at)})));
  if(cur && cur.status === "approved" && cur.approved_at) meta.push(esc(ct("apBy", {n: cur.approved_by, d: fmtTs(cur.approved_at)})));
  const canReturn = d.canApprove && cur && (cur.status === "submitted" || cur.status === "approved");
  box.innerHTML = `
  <div class="card cab-ed-hd">
    <div><span class="pill">${esc(st[d.lib.st] || "")}</span> <span class="pill gray">${esc(d.lib.region + (d.lib.district ? ", " + d.lib.district : ""))}</span>
      <h1>${esc(d.lib.name)}</h1>
      <p class="cab-k">${esc(ct("period", {y: d.year, q: ROMAN[d.quarter]}))} · ${stPill(cur && cur.status)}</p>
      <p class="cab-upd ${cur ? "" : "warn"}">${cur ? esc(ct("lastUpd", {d: fmtTs(cur.updated_at), n: cur.user_name, i: cur.user_institution || ""})) : esc(ct("neverUpd"))}</p>
      ${meta.length ? `<p class="cab-k">${meta.join(" · ")}</p>` : ""}
      ${cur && cur.status === "returned" && cur.comment ? `<div class="cab-warn">↩ ${esc(ct("retBy", {c: cur.comment}))}</div>` : ""}</div>
  </div>
  <form class="card cab-form" id="qForm" novalidate>
    <h3>${esc(ct("qFields"))}</h3>
    <p class="cab-note">${esc(ct("formNote"))}</p>
    ${(S.form || []).map((sec, i) => `<details class="cab-sec" ${i < 2 ? "open" : ""}><summary><i>${esc(sec.n)}</i>${esc(PF.find(g => g.n === sec.n) ? tx(PF.find(g => g.n === sec.n).t) : sec.t)}</summary>
      <div class="cab-fgrid">${sec.f.map(x => `<label class="fld${x.of ? " sub" : ""}${x.t === "text" ? " wide" : ""}">
        <span><em>${esc(x.c)}</em> ${esc(flabel(x))}${x.t !== "text" ? ` <i class="req">*</i>` : ""}</span>
        ${fieldInput(x, init(x))}
        <small class="fld-hint"><b class="rule ${x.r}">${esc(ct(x.r === "sum" ? "ruleSum" : "ruleLast"))}</b>${prevHint(x) ? " · " + esc(prevHint(x)) : ""}</small>
        <small class="fld-err" data-err="${esc(x.c)}"></small></label>`).join("")}</div></details>`).join("")}
    <div class="cab-actions">
      <a class="cbtn ghost" href="#cabinet">${esc(ct("cancel"))}</a>
      ${canReturn ? `<button class="cbtn ghost" type="button" id="qReturn">↩ ${esc(ct("returnBtn"))}</button>` : ""}
      <button class="cbtn ghost" type="button" id="qDraft">${esc(ct("saveDraft"))}</button>
      <button class="cbtn primary" type="submit">${esc(ct(d.canApprove ? "saveApprove" : "submit"))}</button></div>
  </form>
  ${annualBlock(d)}
  ${d.canStatic ? staticEditor(fx) : ""}
  <div class="card"><h3 class="cab-h3">${esc(ct("qHistory"))}</h3>
    <div class="scroll-x"><table class="tbl"><thead><tr><th>${esc(ct("quarter"))}</th><th>${esc(ct("state"))}</th>${S.main.map(f => `<th style="text-align:right">${esc(f)}</th>`).join("")}<th>${esc(ct("when"))}</th><th>${esc(ct("who"))}</th></tr></thead>
    <tbody>${d.history.map(h => `<tr><td><a href="#cabinet/lib/${encodeURIComponent(d.lib.id)}/${h.year}/${h.quarter}">${esc(h.year + " · " + ROMAN[h.quarter])}</a></td><td>${stPill(h.status)}</td>${S.main.map(f => `<td class="v">${esc(fmtV(FLD(f), h.v[f]))}</td>`).join("")}
      <td>${esc(fmtTs(h.updated_at))}</td><td>${esc(h.user_name)}${h.user_institution ? `<br><small class="cab-k">${esc(h.user_institution)}</small>` : ""}</td></tr>`).join("")}
      ${(d.archive || []).map(a => `<tr class="cab-arch"><td>${esc(a.year + " · " + ct("annual"))}</td><td><span class="pill gray">${esc(ct("archRow"))}</span></td>${S.main.map(f => `<td class="v">${esc(fmtV(FLD(f), a.v[f]))}</td>`).join("")}
      <td>${esc(fmtTs(a.archived_at))}</td><td></td></tr>`).join("")}</tbody></table></div></div>`;
  const form = document.getElementById("qForm");
  form.querySelectorAll(".num").forEach(i => i.addEventListener("input", () => {
    if(i.dataset.t === "int"){
      const pos = i.value.length - i.selectionStart, raw = i.value.replace(/\D/g, "");
      i.value = raw ? nf(+raw) : ""; try{ i.setSelectionRange(i.value.length - pos, i.value.length - pos); }catch(e){}
    } else i.value = i.value.replace(/[^\d.,]/g, "");
  }));
  form.addEventListener("input", e => { const n = e.target.name; if(!n) return; e.target.classList.remove("bad"); const er = form.querySelector('[data-err="' + n + '"]'); if(er) er.textContent = ""; });
  const collect = () => { const v = {}; FIELDS().forEach(x => { const el = form.elements[x.c]; v[x.c] = el ? el.value.trim() : ""; }); return v; };
  const norm = (x, v) => { if(x.t === "int" || x.t === "num"){ const n = numOf(v, true); return n === null ? String(v).trim() : String(n); } return String(v == null ? "" : v).trim(); };
  const showErr = errs => {
    FIELDS().forEach(x => { const el = form.elements[x.c]; if(el) el.classList.toggle("bad", !!errs[x.c]); const er = form.querySelector('[data-err="' + x.c + '"]'); if(er) er.textContent = errs[x.c] || ""; });
    const first = form.querySelector(".inp.bad");
    if(first){ const det = first.closest("details"); if(det) det.open = true; first.focus(); }
  };
  const send = mode => {
    const vals = collect(), errs = checkVals(vals, mode !== "draft");
    showErr(errs);
    if(Object.keys(errs).length){ toast(ct(mode === "draft" ? "fixErr" : "reqSubmit"), "bad"); return; }
    const changes = FIELDS().filter(x => norm(x, vals[x.c]) !== norm(x, cur ? cur.v[x.c] : ""));
    const statusSame = cur && cur.status === (mode === "draft" ? "draft" : d.canApprove ? "approved" : "submitted");
    if(!changes.length && statusSame){ toast(ct("nochange"), "warn"); return; }
    const warns = changes.filter(x => (x.t === "int" || x.t === "num") && prev).map(x => {
      const a = numOf(vals[x.c], true), b = numOf(prev.v[x.c], true);
      return a !== null && b && Math.abs(a - b) / b > 0.5 ? [x, Math.round((a - b) / b * 100)] : null;
    }).filter(Boolean);
    const rows = changes.slice(0, 60).map(x => `<tr><td>${esc(x.c + " " + flabel(x))}</td><td class="v">${esc(fmtV(x, cur ? cur.v[x.c] : ""))}</td><td class="v"><b>${esc(fmtV(x, vals[x.c]))}</b></td></tr>`).join("");
    const what = mode === "draft" ? ct("saveDraft") : ct(d.canApprove ? "saveApprove" : "submit");
    modal(ct("confirmTitle"), `<p class="cab-p"><b>${esc(d.lib.name)}</b><br>${esc(ct("period", {y: d.year, q: ROMAN[d.quarter]}))} → <b>${esc(what)}</b></p>
      ${warns.slice(0, 8).map(w => `<div class="cab-warn">⚠ ${esc(w[0].c + " " + flabel(w[0]))}: ${esc(ct("jump", {a: (w[1] > 0 ? "+" : "") + w[1]}))}</div>`).join("")}
      ${rows ? `<div class="scroll-x"><table class="tbl"><thead><tr><th>${esc(ct("field"))}</th><th style="text-align:right">${esc(ct("oldV"))}</th><th style="text-align:right">${esc(ct("newV"))}</th></tr></thead><tbody>${rows}</tbody></table></div>` : ""}
      ${changes.length > 60 ? `<p class="cab-note">+ ${changes.length - 60}</p>` : ""}
      <p class="cab-note">${esc(ct("confirmDesc"))}</p>`, [[ct("cancel"), "", "ghost"], [ct("confirm"), "ok", "primary"]]).then(v => {
      if(v !== "ok") return;
      const btn = mode === "draft" ? document.getElementById("qDraft") : form.querySelector("button[type=submit]"); busy(btn, true);
      const body = {action: "save", id: d.lib.id, year: d.year, quarter: d.quarter, values: vals, mode: mode, op: uid()};
      api("save", body).then(res => {
        toast(res.nochange ? ct("nochange") : ct({draft: "draftOk", submitted: "submittedOk", approved: "approvedOk"}[res.status] || "saved"), res.nochange ? "warn" : "ok");
        S.libs = null; go("cabinet");
      }, err => {
        busy(btn, false);
        if(err && err.net){                                // байланыс жоқ — кезекке
          const a = outbox(); a.push({body: body, ts: Date.now(), label: d.lib.name + " · " + d.year + "/" + ROMAN[d.quarter]}); setOutbox(a);
          toast(ct("queued"), "warn"); refreshBanner(); return;
        }
        if(err && err.fields) showErr(err.fields);
        toast(err.msg || err.error, "bad");
      });
    });
  };
  form.addEventListener("submit", e => { e.preventDefault(); send("submit"); });
  document.getElementById("qDraft").addEventListener("click", () => send("draft"));
  const rb = document.getElementById("qReturn");
  if(rb) rb.addEventListener("click", () => {
    modal(ct("returnBtn"), `<p class="cab-p">${esc(ct("returnQ"))}</p><textarea class="inp" id="retC" rows="3"></textarea>`, [[ct("cancel"), "", "ghost"], [ct("returnBtn"), "ok", "primary"]]).then(v => {
      if(v !== "ok") return;
      const c = ((modal.vals || {}).retC || "").trim();
      if(!c){ toast(ct("returnQ"), "bad"); return; }
      api("approve", {id: d.lib.id, year: d.year, quarter: d.quarter, decision: "return", comment: c})
        .then(() => { toast(ct("returned")); S.libs = null; go("cabinet/queue"); }, err => toast(err.msg || err.error, "bad"));
    });
  });
  bindAnnual(d);
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
/* Жылдық есеп: тоқсандар (I–IV) және жыл бойынша жиынтық */
function annualBlock(d){
  const qs = {}; d.history.filter(h => h.year === d.year).forEach(h => { qs[h.quarter] = h; });
  const a = d.annual;
  const state = !a ? ct("annualNone") : a.qs.length === 4 ? ct("annualFull") : ct("annualPart", {q: a.qs.split("").map(n => ROMAN[n]).join(", ")});
  return `<details class="card cab-annual" id="annBox"><summary><b>${esc(ct("annualT", {y: d.year}))}</b><span class="cab-k">${esc(state)}</span></summary>
    <div class="cab-actions" style="justify-content:flex-start;margin:6px 0 10px"><button class="cbtn ghost sm" type="button" data-ann="docx">⬇ ${esc(ct("word"))}</button><button class="cbtn ghost sm" type="button" data-ann="xlsx">${esc(ct("excel"))}</button></div>
    <div class="scroll-x"><table class="tbl cab-ann"><thead><tr><th>${esc(ct("field"))}</th>${[1, 2, 3, 4].map(q => `<th style="text-align:right">${ROMAN[q]}${qs[q] ? `<br>${stPill(qs[q].status)}` : ""}</th>`).join("")}<th style="text-align:right">${esc(ct("yearCol"))}</th></tr></thead>
    <tbody>${(S.form || []).map(sec => `<tr class="cab-ann-s"><td colspan="6">${esc(sec.n + ". " + (PF.find(g => g.n === sec.n) ? tx(PF.find(g => g.n === sec.n).t) : sec.t))}</td></tr>` + sec.f.map(x => `<tr${x.of ? ' class="sub"' : ""}>
      <td>${esc(x.c + " " + flabel(x))}</td>${[1, 2, 3, 4].map(q => `<td class="v${qs[q] && qs[q].status !== "approved" ? " dim" : ""}">${esc(qs[q] ? fmtV(x, qs[q].v[x.c]) : "")}</td>`).join("")}
      <td class="v"><b>${esc(a ? fmtV(x, a.v[x.c]) : "—")}</b></td></tr>`).join("")).join("")}</tbody></table></div>
    <p class="cab-note">${esc(ct("annualNote"))}</p></details>`;
}
function bindAnnual(d){
  document.querySelectorAll("[data-ann]").forEach(b => b.addEventListener("click", e => {
    e.preventDefault(); busy(b, true);
    const job = b.dataset.ann === "docx" ? Promise.all([needDOCX(), needLogo()]).then(() => buildLibDocx(d)) : buildLibXlsx(d);
    job.then(() => busy(b, false), err => { busy(b, false); toast(String(err && err.message || err), "bad"); });
  }));
}
function annualRows(d){
  const qs = {}; d.history.filter(h => h.year === d.year).forEach(h => { qs[h.quarter] = h; });
  return {qs: qs, rows: FIELDS().map(x => ({x: x, q: [1, 2, 3, 4].map(q => qs[q] ? fmtV(x, qs[q].v[x.c]) : ""), y: d.annual ? fmtV(x, d.annual.v[x.c]) : ""}))};
}
function buildLibDocx(d){
  const D = window.docx, F = "Times New Roman", R = annualRows(d);
  const txt = (t, o) => new D.TextRun(Object.assign({text: String(t == null ? "" : t), font: F, size: 18}, o || {}));
  const par = (runs, o) => new D.Paragraph(Object.assign({children: Array.isArray(runs) ? runs : [runs], spacing: {after: 40}}, o || {}));
  const bd = {style: D.BorderStyle.SINGLE, size: 4, color: "94A3B8"}, borders = {top: bd, bottom: bd, left: bd, right: bd};
  const cell = (t, o) => new D.TableCell({borders: borders, margins: {top: 30, bottom: 30, left: 70, right: 70}, shading: o && o.fill ? {fill: o.fill} : undefined,
    columnSpan: o && o.span || 1, children: [par(txt(t, {bold: !!(o && o.bold), size: o && o.size || 17}), {alignment: o && o.right ? D.AlignmentType.RIGHT : D.AlignmentType.LEFT, spacing: {after: 0}})]});
  const head = new D.TableRow({tableHeader: true, children: [cell(ct("field"), {bold: true, fill: "DBEAFE"})].concat([1, 2, 3, 4].map(q => cell(ROMAN[q], {bold: true, fill: "DBEAFE", right: true})))
    .concat([cell(ct("yearCol"), {bold: true, fill: "DBEAFE", right: true})])});
  const body = [];
  (S.form || []).forEach(sec => {
    body.push(new D.TableRow({children: [cell(sec.n + ". " + sec.t, {bold: true, fill: "F1F5F9", span: 6})]}));
    R.rows.filter(r => sec.f.some(x => x.c === r.x.c)).forEach(r => body.push(new D.TableRow({cantSplit: true, children:
      [cell((r.x.of ? "   " : "") + r.x.c + " " + r.x.l)].concat(r.q.map(v => cell(v, {right: true}))).concat([cell(r.y, {right: true, bold: true})])})));
  });
  const st = [1, 2, 3, 4].map(q => ROMAN[q] + ": " + (R.qs[q] ? ct(ST_PILL[R.qs[q].status][1]) : ct("notFilled"))).join("; ");
  const doc = new D.Document({creator: "LABA", title: ct("annualT", {y: d.year}), styles: {default: {document: {run: {font: F, size: 20}}}},
    sections: [{properties: {page: {margin: {top: 900, bottom: 900, left: 1000, right: 900}}},
      headers: logoHeader(D),
      footers: {default: new D.Footer({children: [par([txt("LABA · " + d.lib.name.slice(0, 60) + " · " + stamp() + "   ", {size: 14}), new D.TextRun({children: [D.PageNumber.CURRENT, " / ", D.PageNumber.TOTAL_PAGES], font: F, size: 14})], {alignment: D.AlignmentType.RIGHT})]})},
      children: [
        par(txt(ct("annualT", {y: d.year}).toUpperCase(), {bold: true, size: 26, color: "1D4ED8"}), {alignment: D.AlignmentType.CENTER, spacing: {after: 80}}),
        par(txt(d.lib.name, {bold: true, size: 24}), {alignment: D.AlignmentType.CENTER}),
        par(txt(d.lib.region + (d.lib.district ? ", " + d.lib.district : ""), {size: 20, color: "475569"}), {alignment: D.AlignmentType.CENTER, spacing: {after: 120}}),
        par(txt(st, {size: 18})), par(txt(d.annual ? (d.annual.qs.length === 4 ? ct("annualFull") : ct("annualPart", {q: d.annual.qs.split("").map(n => ROMAN[n]).join(", ")})) : ct("annualNone"), {size: 18, color: "475569"}), {spacing: {after: 120}}),
        new D.Table({width: {size: 100, type: D.WidthType.PERCENTAGE}, columnWidths: [4700, 1000, 1000, 1000, 1000, 1300], rows: [head].concat(body)}),
        par(txt(ct("annualNote"), {size: 16, color: "475569"}), {spacing: {before: 120}}),
        par(txt(ct("genDate", {d: fmtTs(stamp())}), {size: 18})),
        par(txt(ct("genBy", {n: S.me.full_name + (S.me.institution ? ", " + S.me.institution : "")}), {size: 18}))]}]});
  return D.Packer.toBlob(doc).then(blob => saveBlob(blob, "laba-jyldyq-" + d.lib.id + "-" + d.year + ".docx"));
}
function buildLibXlsx(d){
  const R = annualRows(d);
  const aoa = [[ct("annualT", {y: d.year}) + ": " + d.lib.name], [d.lib.region + (d.lib.district ? ", " + d.lib.district : "")], [],
    [ct("field"), ROMAN[1], ROMAN[2], ROMAN[3], ROMAN[4], ct("yearCol")],
    ["", ...[1, 2, 3, 4].map(q => R.qs[q] ? ct(ST_PILL[R.qs[q].status][1]) : ct("notFilled")), d.annual ? d.annual.qs.split("").map(n => ROMAN[n]).join(",") : ""]]
    .concat(R.rows.map(r => [r.x.c + " " + r.x.l].concat(r.q.map(v => xnum(v))).concat([xnum(r.y)])))
    .concat([[], [ct("annualNote")], [ct("genDate", {d: fmtTs(stamp())})]]);
  return excelBook(ct("annualT", {y: d.year}).slice(0, 30), aoa, {title: 0, head: 3, cols: [58, 12, 12, 12, 12, 14]})
    .then(wb => saveBook(wb, "laba-jyldyq-" + d.lib.id + "-" + d.year + ".xlsx"));
}
/* Excel-ге сан ретінде: «1 250» → 1250 */
const xnum = v => { const n = numOf(v, true); return n === null ? (v === "—" ? "" : v) : n; };
function logoHeader(D){
  return {default: new D.Header({children: logoBuf ? [new D.Paragraph({children: [new D.ImageRun({data: logoBuf,
    transformation: {width: 110, height: Math.round(110 * LOGO.h / LOGO.w)}})], spacing: {after: 60}})] : []})};
}
function staticEditor(fx){
  const rep = FIELDS().map(x => x.c), codes = [];
  PF.forEach(g => g.f.forEach(f => { if(rep.indexOf(f[0]) < 0 && !f[2]) codes.push(f[0]); }));
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
    api("log", Object.assign({limit: 500, offset: 0}, st.params)).then(res => {
      const aoa = [[ct("when"), ct("who"), ct("level"), ct("region"), ct("inst"), ct("lib"), ct("year"), ct("quarter"), ct("field"), ct("oldV"), ct("newV"), ct("action")]]
        .concat(res.rows.map(r => [r.ts, r.user, r.role, r.region, r.inst, r.lib, r.year, r.quarter, r.field, r.old, r.val, r.action]));
      return excelBook("Журнал", aoa, {head: 0, cols: [18, 28, 16, 28, 30, 40, 7, 8, 22, 14, 14, 26]})
        .then(wb => saveBook(wb, "laba-zhurnal-" + stamp().slice(0, 10) + ".xlsx"));
    }).then(() => busy(x, false), err => { busy(x, false); toast(err.msg || err.error || err.message || "Excel", "bad"); });
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
      <label class="fld"><span>${esc(ct("repPer"))}</span><select class="pick" name="arch" id="rArch"><option value="">${esc(ct("repPerQ"))}</option></select></label>
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
  api("archiveYears").then(r => {
    const sel2 = document.getElementById("rArch"); if(!sel2) return;
    sel2.innerHTML += `<option value="ytd">${esc(ct("repPerY", {y: S.year}))}</option>` + (r.years || []).map(y => `<option value="${y.year}">${esc(ct("repPerA", {y: y.year}))}</option>`).join("");
  }, () => {});
  f.st.addEventListener("change", fill);
  f.querySelectorAll("[data-fmt]").forEach(b => b.addEventListener("click", () => {
    const p = {year: S.year, quarter: S.quarter, unit: f.unit ? f.unit.value : "", st: f.st.value, lib: f.lib.value, from: f.from.value, to: f.to.value};
    if(f.arch.value === "ytd"){ p.quarter = 0; delete p.from; delete p.to; }
    else if(f.arch.value){ p.archive = +f.arch.value; delete p.from; delete p.to; }
    const lbl = {unit: f.unit && f.unit.value ? f.unit.selectedOptions[0].textContent : "", st: f.st.value ? f.st.selectedOptions[0].textContent : "",
                 lib: f.lib.value ? f.lib.selectedOptions[0].textContent : ""};
    busy(b, true);
    Promise.all([b.dataset.fmt === "docx" ? needDOCX() : needEXCEL(), api("report", p), needLogo()]).then(arr => {
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
          period: rep.archive ? ct("periodArch", {y: rep.archive}) : rep.annual ? ct("periodYtd", {y: rep.year}) : ct("period", {y: rep.year, q: ROMAN[rep.quarter]})};
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
      .concat([cell((r.updated_at ? fmtTs(r.updated_at) : ct("noData")) + (r.qstatus ? "\n" + r.qstatus : ""), {small: true}), cell(r.user_name ? r.user_name + "\n" + [r.user_institution, r.user_phone].filter(Boolean).join(", ") : "—", {bold: true, small: true})])}));
  });
  rows.push(new D.TableRow({children: [cell(""), cell(ct("total"), {bold: true}), cell("")].concat(sums.map(s => cell(nf(s), {right: true, bold: true}))).concat([cell(""), cell("")])}));
  const doc = new D.Document({
    creator: "LABA", title: ct("repTitle"),
    styles: {default: {document: {run: {font: F, size: 22}}}},
    sections: [{
      properties: {page: {size: {orientation: D.PageOrientation.LANDSCAPE}, margin: {top: 1000, bottom: 1000, left: 1000, right: 1000}}},
      headers: {default: new D.Header({children: logoBuf ? [new D.Paragraph({children: [new D.ImageRun({data: logoBuf,
        transformation: {width: 122, height: Math.round(122 * LOGO.h / LOGO.w)}})], spacing: {after: 80}})] : []})},
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
  return D.Packer.toBlob(doc).then(blob => saveBlob(blob, "laba-esep-" + rep.year + "-" + (rep.archive || rep.annual ? "jyl" : ROMAN[rep.quarter]) + "-" + stamp().slice(0, 10) + ".docx"));
}
function buildXlsx(rep, p, lbl){
  const m = repMeta(rep, p, lbl);
  const head = ["№", ct("lib"), ct("region"), "Аудан / қала", ct("type")].concat(rep.fields.map(f => f[0] + " " + f[1])).concat([ct("when"), ct("state"), ct("resp"), ct("inst"), ct("phone")]);
  const aoa = [[ct("repTitle")], [ct("repPeriod", {p: m.period})], [ct("repScope", {s: m.scope})], [], head]
    .concat(rep.rows.map((r, i) => [i + 1, r.name, r.region, r.district, r.status]
      .concat(rep.fields.map(f => { const v = r.v ? String(r.v[f[0]] || "").replace(/\s/g, "") : ""; return v === "" ? "" : +v; }))
      .concat([r.updated_at, r.qstatus || "", r.user_name, r.user_institution, r.user_phone])))
    .concat([[], [ct("respList")]]).concat(m.people.map(x => ["", x.n, x.i, x.p]))
    .concat([[], [ct("lastDate", {d: m.last ? fmtTs(m.last) : "—"})], [ct("genDate", {d: fmtTs(stamp())})], [ct("genBy", {n: S.me.full_name})]]);
  const cols = [5, 50, 24, 24, 14].concat(rep.fields.map(() => 14)).concat([18, 16, 28, 28, 16]);
  return excelBook("Есеп", aoa, {title: 0, head: 4, cols: cols})
    .then(wb => saveBook(wb, "laba-esep-" + rep.year + "-" + (rep.archive || rep.annual ? "jyl" : ROMAN[rep.quarter]) + "-" + stamp().slice(0, 10) + ".xlsx"));
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
  document.getElementById("uTpl").addEventListener("click", () => Promise.resolve().then(() => {
    const aoa = [["Логин", "Аты-жөні", "Лауазымы", "Деңгейі", "Аймағы", "Республикалық кітапхана №", "Мекемесі", "Телефон", "Пароль"],
      ["turk.oblys", "Сәрсенова Айгүл Маратқызы", "Бас әдіскер", "облыстық", "Түркістан облысы", "", "Түркістан облыстық кітапханасы", "+7 701 000 00 00", ""],
      ["keles.audan", "Әлиев Нұрлан", "Әдіскер", "аудандық", "Түркістан облысы, Келес ауданы", "", "Келес ОКЖ", "+7 702 000 00 00", ""],
      ["astana.qala", "Иванова Анна", "Әдіскер", "қалалық", "Астана қаласы", "", "Астана ОКЖ", "", "Astana2026x"],
      ["nlrk", "Омарова Дана", "Әдіскер", "республикалық", "", "1", "ҚР Ұлттық кітапханасы", "", ""]];
    return excelBook("Аккаунттар", aoa, {head: 0, cols: [16, 32, 18, 16, 34, 14, 32, 18, 14]})
      .then(wb => saveBook(wb, "laba-akkaunttar-ulgi.xlsx"));
  }).catch(err => toast(String(err && (err.msg || err.message) || err), "bad")));
  document.getElementById("uFile").addEventListener("change", e => { const f = e.target.files[0]; e.target.value = ""; if(f) bulkImport(f).then(load); });
  document.getElementById("uBox").addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if(!b) return;
    const u = S.users.find(x => x.user_id === b.dataset.id); if(!u) return;
    if(b.dataset.act === "edit") userForm(u).then(r => { if(r) load(); });
    if(b.dataset.act === "pass"){
      modal(ct("setPass") + ": " + u.login, `<p class="cab-p">${esc(ct("newPassQ"))}</p><input class="inp" id="npw" type="text" autocomplete="new-password">`,
        [[ct("cancel"), "", "ghost"], [ct("save"), "ok", "primary"]]).then(v => {
        if(v !== "ok") return;
        const pw = (modal.vals || {}).npw || "";
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
    /* Тақырып жолы — «Логин» бағаны бар алғашқы жол (үлгінің басында логотип үшін бос жолдар бар) */
    let hi = aoa.findIndex((r, i) => i < 20 && r.some(c => /^\s*(логин|login)\s*$/i.test(String(c))));
    if(hi < 0) hi = 0;
    const hdr = (aoa[hi] || []).map(h => String(h).trim().toLowerCase());
    const col = re => hdr.findIndex(h => re.test(h));
    const ix = {login: col(/логин|login/), full_name: col(/аты|фио|name/), position: col(/лауазым|должн/), role: col(/деңгей|уров|role/),
                unit_name: col(/аймақ|аймағ|регион|облыс|unit/), library_id: col(/республикалық кітапхана|№/), institution: col(/мекеме|учрежд/),
                phone: col(/телефон|phone/), password: col(/пароль|password/)};
    const roleOf = s => { s = String(s).toLowerCase(); return /облыс|област|oblast/.test(s) ? "oblast" : /аудан|район|district/.test(s) ? "district" : /респ|republic/.test(s) ? "republic" : /қала|город|city/.test(s) ? "city" : /әкімші|админ/.test(s) ? "admin" : ""; };
    const lines = [];                                    // әр жолдың файлдағы нөмірі (нәтиже терезесі үшін)
    const rows = aoa.map((r, i) => [r, i]).slice(hi + 1).filter(x => x[0].some(c => String(c).trim())).map(x => {
      const r = x[0], o = {}; Object.keys(ix).forEach(k => { o[k] = ix[k] > -1 ? String(r[ix[k]]).trim() : ""; });
      o.role = roleOf(o.role); lines.push(x[1] + 1); return o;
    });
    if(!rows.length){ toast(ct("nothing"), "warn"); return; }
    toast(ct("wait"), "warn");
    return api("userBulk", {rows: rows}).then(res => {
      const okN = res.results.filter(r => r.ok).length, bad = res.results.length - okN;
      const html = `<p class="cab-p"><b>${esc(ct("bulkRes", {a: okN, b: bad}))}</b></p>
        <div class="scroll-x"><table class="tbl"><tbody>${res.results.map(r => `<tr><td>${lines[r.row - 1] || r.row}</td><td>${esc(r.login)}</td><td>${r.ok ? `<span class="pill ok">✓</span> ${esc(r.full_name)}` : `<span class="pill bad">✗</span> ${esc(r.error)}`}</td></tr>`).join("")}</tbody></table></div>
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

/* Бекіту кезегі (бас әкімші, облыстық әдіскер) */
VIEWS.queue = () => shell("cabinet/queue", `
  <div class="ph"><h2>${esc(ct("tQueue"))}</h2><p>${esc(ct("queueDesc"))}</p></div>
  <div id="qBox"><div class="card p-empty">${esc(ct("wait"))}</div></div>`);
VIEWS.queue.after = () => {
  api("queue").then(r => {
    const box = document.getElementById("qBox"); if(!box) return;
    if(!r.rows.length){ box.innerHTML = `<div class="card p-empty">✓ ${esc(ct("queueNone"))}</div>`; return; }
    box.innerHTML = `<div class="card scroll-x" style="padding:8px"><table class="tbl"><thead><tr><th>${esc(ct("lib"))}</th><th>${esc(ct("quarter"))}</th><th>${esc(ct("sentAt"))}</th>
      ${r.fields.map(f => `<th style="text-align:right">${esc(f[0])}</th>`).join("")}<th></th></tr></thead>
      <tbody>${r.rows.map(x => `<tr><td><b>${esc(x.name)}</b><br><small class="cab-k">${esc(x.region + (x.district ? ", " + x.district : ""))}</small></td>
        <td class="nw">${esc(x.year + " · " + ROMAN[x.quarter])}</td><td>${esc(fmtTs(x.submitted_at))}<br><small class="cab-k">${esc(x.submitted_by)}</small></td>
        ${r.fields.map(f => `<td class="v">${esc(fmtV(FLD(f[0]), x.v[f[0]]))}</td>`).join("")}
        <td><a class="cbtn primary sm" href="#cabinet/lib/${encodeURIComponent(x.id)}/${x.year}/${x.quarter}">${esc(ct("check"))}</a></td></tr>`).join("")}</tbody></table></div>`;
  }, err => { document.getElementById("qBox").innerHTML = `<div class="card p-empty">${esc(err.msg || err.error)}</div>`; });
};

/* Жиынтық: аймақтар бойынша тапсырылуы және негізгі көрсеткіштер; толық деректерді жүктеу */
VIEWS.summary = () => {
  const y0 = new Date().getFullYear(), ys = [];
  for(let y = y0; y >= 2026; y--) ys.push(y);
  if(S.sumQ == null) S.sumQ = S.quarter;
  const units = (S.units || []).filter(u => u.type !== "republic" || S.me.role === "admin");
  return shell("cabinet/summary", `
  <div class="ph"><h2>${esc(ct("tSum"))}</h2><p>${esc(ct("sumDesc"))}</p></div>
  <div class="card cab-period">
    <label>${esc(ct("year"))} <select class="pick" id="sYear">${ys.map(y => `<option ${y === S.year ? "selected" : ""}>${y}</option>`).join("")}</select></label>
    <div class="seg">${[1, 2, 3, 4, 0].map(q => `<button data-sq="${q}" class="${q === S.sumQ ? "on" : ""}">${q ? ROMAN[q] : esc(ct("perYear"))}</button>`).join("")}</div>
    ${units.length > 1 ? `<select class="pick" id="sUnit"><option value="">${esc(ct("allUnits"))}</option>${units.map(u => `<option value="${esc(u.id)}" ${S.sumUnit === u.id ? "selected" : ""}>${esc(u.full)}</option>`).join("")}</select>` : ""}
    <span class="cab-actions" style="margin-left:auto"><button class="cbtn ghost sm" id="sXls">${esc(ct("xlsFull"))}</button><button class="cbtn ghost sm" id="sDoc">⬇ ${esc(ct("wordSum"))}</button></span>
  </div>
  <div id="sBox"><div class="card p-empty">${esc(ct("wait"))}</div></div>`);
};
VIEWS.summary.after = () => {
  const params = () => ({year: S.year, quarter: S.sumQ, unit: S.sumUnit || ""});
  const load = () => {
    const box = document.getElementById("sBox"); box.innerHTML = `<div class="card p-empty">${esc(ct("wait"))}</div>`;
    api("summary", params()).then(r => { S.sum = r; drawSum(r); }, err => { box.innerHTML = `<div class="card p-empty">${esc(err.msg || err.error)}</div>`; });
  };
  document.getElementById("sYear").addEventListener("change", e => { S.year = +e.target.value; load(); });
  document.querySelectorAll("[data-sq]").forEach(b => b.addEventListener("click", () => {
    S.sumQ = +b.dataset.sq; document.querySelectorAll("[data-sq]").forEach(x => x.classList.toggle("on", x === b)); load();
  }));
  const su = document.getElementById("sUnit"); if(su) su.addEventListener("change", e => { S.sumUnit = e.target.value; load(); });
  document.getElementById("sBox").addEventListener("click", e => {
    const a = e.target.closest("[data-unit]"); if(!a) return;
    e.preventDefault(); S.sumUnit = a.dataset.unit; if(su) su.value = S.sumUnit; load();
  });
  const xb = document.getElementById("sXls");
  xb.addEventListener("click", () => {
    busy(xb, true);
    api("export", params()).then(r => buildExportXlsx(r)).then(() => busy(xb, false), err => { busy(xb, false); toast(err.msg || err.error || err.message, "bad"); });
  });
  const db = document.getElementById("sDoc");
  db.addEventListener("click", () => {
    if(!S.sum) return;
    busy(db, true);
    Promise.all([needDOCX(), needLogo()]).then(() => buildSumDocx(S.sum)).then(() => busy(db, false), err => { busy(db, false); toast(String(err && err.message || err), "bad"); });
  });
  load();
};
const sumPeriod = r => r.quarter ? ct("period", {y: r.year, q: ROMAN[r.quarter]}) : ct("periodYtd", {y: r.year});
const sumScope = () => { const u = (S.units || []).find(x => x.id === S.sumUnit); return u ? u.full : (S.me.unit_name || ""); };
function drawSum(r){
  const box = document.getElementById("sBox"); if(!box) return;
  const t = r.total, pct = x => x.libs ? x.approved / x.libs : 0;
  const line = (x, drill) => `<tr${drill ? "" : ' class="cab-tot"'}><td>${drill && r.by === "oblast" && x.id !== "KZ" ? `<a href="#" data-unit="${esc(x.id)}">${esc(x.name)}</a>` : `<b>${esc(x.name)}</b>`}</td>
    <td class="v">${nf(x.libs)}</td><td class="v ok">${nf(x.approved)}</td><td class="v">${nf(x.submitted)}</td><td class="v">${nf(x.draft)}</td><td class="v bad">${nf(x.none)}</td>
    ${r.quarter ? "" : `<td class="v">${nf(x.full)}</td>`}<td style="min-width:120px">${meter(pct(x))}<small class="cab-k">${pf(pct(x) * 100)}</small></td>
    ${r.fields.map(f => `<td class="v">${nf(x.sums[f[0]])}</td>`).join("")}</tr>`;
  box.innerHTML = `<div class="card cab-sum">
      <div><span class="cab-k">${esc(sumPeriod(r))}</span><b>${esc(sumScope())}</b><span class="cab-k">${esc(ct("libsN", {a: nf(t.libs)}))}</span></div>
      <div class="cab-prog"><div class="cab-prog-t">${esc(ct("progress", {a: nf(t.approved), b: nf(t.libs)}))}${t.submitted ? ` · ${esc(ct("cntSub"))}: ${nf(t.submitted)}` : ""}</div>${meter(pct(t))}</div></div>
    <div class="card scroll-x" style="padding:8px"><table class="tbl cab-sumt"><thead><tr><th>${esc(ct(r.by === "oblast" ? "region" : "unitCol"))}</th>
      <th style="text-align:right">${esc(ct("cntLibs"))}</th><th style="text-align:right">${esc(ct("cntOk"))}</th><th style="text-align:right">${esc(ct("cntSub"))}</th>
      <th style="text-align:right">${esc(ct("cntOther"))}</th><th style="text-align:right">${esc(ct("cntNone"))}</th>${r.quarter ? "" : `<th style="text-align:right">${esc(ct("cntFull"))}</th>`}<th></th>
      ${r.fields.map(f => `<th style="text-align:right" title="${esc(f[1])}">${esc(f[0])}</th>`).join("")}</tr></thead>
      <tbody>${r.rows.map(x => line(x, true)).join("")}${line(Object.assign({}, t, {name: ct("total")}), false)}</tbody></table></div>
    <p class="cab-note">${r.fields.map(f => esc(f[0] + " — " + (PFL[f[0]] ? pl(f[0]) : f[1]))).join(" · ")}</p>
    <p class="cab-note">${esc(ct("sumNote"))}</p>`;
}
function buildExportXlsx(r){
  const head = ["№", ct("lib"), ct("region"), "Аудан / қала", ct("type"), ct("state")].concat(r.fields.map(f => f[0] + " " + f[1] + (f[2] === "sum" ? " (" + ct("ruleSum") + ")" : "")))
    .concat([ct("when"), ct("resp"), ct("phone"), ct("apCol")]);
  const aoa = [[ct("sumTitle")], [ct("repPeriod", {p: sumPeriod(r)})], [ct("repScope", {s: sumScope()})], [], head]
    .concat(r.rows.map((x, i) => [i + 1, x.name, x.region, x.district, x.status_type, x.status].concat(r.fields.map(f => xnum(x.v[f[0]] == null ? "" : x.v[f[0]])))
      .concat([x.updated_at, x.user_name, x.user_phone, x.approved_by])))
    .concat([[], [ct("genDate", {d: fmtTs(stamp())})], [ct("genBy", {n: S.me.full_name})]]);
  const cols = [5, 46, 22, 22, 14, 16].concat(r.fields.map(() => 14)).concat([18, 26, 16, 22]);
  return excelBook(ct("tSum"), aoa, {title: 0, head: 4, cols: cols})
    .then(wb => saveBook(wb, "laba-jiyntyq-" + r.year + "-" + (r.quarter ? ROMAN[r.quarter] : "jyl") + "-" + stamp().slice(0, 10) + ".xlsx"));
}
function buildSumDocx(r){
  const D = window.docx, F = "Times New Roman";
  const txt = (t, o) => new D.TextRun(Object.assign({text: String(t == null ? "" : t), font: F, size: 18}, o || {}));
  const par = (runs, o) => new D.Paragraph(Object.assign({children: Array.isArray(runs) ? runs : [runs], spacing: {after: 40}}, o || {}));
  const bd = {style: D.BorderStyle.SINGLE, size: 4, color: "94A3B8"}, borders = {top: bd, bottom: bd, left: bd, right: bd};
  const cell = (t, o) => new D.TableCell({borders: borders, margins: {top: 30, bottom: 30, left: 60, right: 60}, shading: o && o.fill ? {fill: o.fill} : undefined,
    children: [par(txt(t, {bold: !!(o && o.bold), size: 16}), {alignment: o && o.right ? D.AlignmentType.RIGHT : D.AlignmentType.LEFT, spacing: {after: 0}})]});
  const hd = [ct(r.by === "oblast" ? "region" : "unitCol"), ct("cntLibs"), ct("cntOk"), ct("cntSub"), ct("cntOther"), ct("cntNone")].concat(r.quarter ? [] : [ct("cntFull")]).concat(r.fields.map(f => f[0] + " " + f[1]));
  const row = (x, b) => new D.TableRow({cantSplit: true, children: [cell(x.name, {bold: b})].concat([x.libs, x.approved, x.submitted, x.draft, x.none].concat(r.quarter ? [] : [x.full]).map(n => cell(nf(n), {right: true, bold: b})))
    .concat(r.fields.map(f => cell(nf(x.sums[f[0]]), {right: true, bold: b})))});
  const doc = new D.Document({creator: "LABA", title: ct("sumTitle"), styles: {default: {document: {run: {font: F, size: 20}}}},
    sections: [{properties: {page: {size: {orientation: D.PageOrientation.LANDSCAPE}, margin: {top: 900, bottom: 900, left: 900, right: 900}}},
      headers: logoHeader(D),
      footers: {default: new D.Footer({children: [par([txt("LABA · " + ct("sumTitle") + " · " + stamp() + "   ", {size: 14}), new D.TextRun({children: [D.PageNumber.CURRENT, " / ", D.PageNumber.TOTAL_PAGES], font: F, size: 14})], {alignment: D.AlignmentType.RIGHT})]})},
      children: [
        par(txt("ҚАЗАҚСТАН РЕСПУБЛИКАСЫНЫҢ ҰЛТТЫҚ КІТАПХАНАСЫ · ҒЫЛЫМИ-ӘДІСТЕМЕЛІК ҚЫЗМЕТ", {size: 16, color: "475569"}), {alignment: D.AlignmentType.CENTER}),
        par(txt(ct("sumTitle"), {bold: true, size: 28}), {alignment: D.AlignmentType.CENTER, spacing: {before: 100, after: 80}}),
        par(txt(ct("repPeriod", {p: sumPeriod(r)})), {alignment: D.AlignmentType.CENTER}),
        par(txt(ct("repScope", {s: sumScope()})), {alignment: D.AlignmentType.CENTER, spacing: {after: 160}}),
        new D.Table({width: {size: 100, type: D.WidthType.PERCENTAGE}, columnWidths: [2600].concat(hd.slice(1).map(() => Math.round(11400 / (hd.length - 1)))),
          rows: [new D.TableRow({tableHeader: true, children: hd.map((h, i) => cell(h, {bold: true, fill: "DBEAFE", right: i > 0}))})]
          .concat(r.rows.map(x => row(x, false))).concat([row(Object.assign({}, r.total, {name: ct("total")}), true)])}),
        par(txt(ct("sumNote"), {size: 16, color: "475569"}), {spacing: {before: 120}}),
        par(txt(ct("genDate", {d: fmtTs(stamp())}), {size: 18})),
        par(txt(ct("genBy", {n: S.me.full_name + (S.me.institution ? ", " + S.me.institution : "")}), {size: 18}))]}]});
  return D.Packer.toBlob(doc).then(blob => saveBlob(blob, "laba-jiyntyq-" + r.year + "-" + (r.quarter ? ROMAN[r.quarter] : "jyl") + "-" + stamp().slice(0, 10) + ".docx"));
}

/* Кітаптар: ұсыныстар және ең көп оқылғандар (облыстық, қалалық, республикалық әдіскер, бас әкімші) */
VIEWS.books = () => shell("cabinet/books", `
  <div class="ph"><h2>${esc(ct("tBooks"))}</h2><p>${esc(ct("bkDesc"))}</p></div>
  <div id="bkBox"><div class="card p-empty">${esc(ct("wait"))}</div></div>`);
VIEWS.books.after = () => {
  const load = () => api("books").then(r => { S.bkData = r; drawBooks(); },
    err => { document.getElementById("bkBox").innerHTML = `<div class="card p-empty">${esc(err.msg || err.error)}</div>`; });
  S.bk = S.bk || {owner: "", kind: "rec", cat: 1};
  S.bkReload = load;
  load();
};
function drawBooks(){
  const box = document.getElementById("bkBox"), d = S.bkData, st = S.bk;
  if(!box) return;
  if(!d.owners.length){ box.innerHTML = `<div class="card p-empty">${esc(ct("bkNone"))}</div>`; return; }
  if(!d.owners.some(o => o.id === st.owner)) st.owner = d.owners[0].id;
  const list = (o, k, c) => d.rows.filter(r => r.owner_id === o && r.kind === k && r.cat === c).sort((a, b) => a.rank - b.rank);
  const cur = list(st.owner, st.kind, st.cat);
  const last = cur.reduce((m, r) => (r.updated_at > m.updated_at ? r : m), {updated_at: ""});
  const rows = [];
  for(let i = 0; i < d.max; i++) rows.push(cur[i] || {author: "", title: "", lang: "", genre: "", count: ""});
  const sel = (n, opts, v) => `<select class="inp" name="${n}"><option value=""></option>${opts.map(o => `<option ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
  box.innerHTML = `<div class="card cab-period bk-bar">
      ${d.owners.length > 1 ? `<select class="pick" id="bkOwner">${d.owners.map(o => `<option value="${esc(o.id)}" ${o.id === st.owner ? "selected" : ""}>${esc((o.st === "rep" ? "" : o.region + " — ") + o.name.slice(0, 80))}</option>`).join("")}</select>`
        : `<b class="bk-own">${esc(d.owners[0].name)}</b>`}
      <div class="seg">${["rec", "top"].map(k => `<button data-bk="${k}" class="${st.kind === k ? "on" : ""}">${esc(ct(k === "rec" ? "bkRec" : "bkTop"))}</button>`).join("")}</div>
    </div>
    <div class="chips">${[1, 2, 3, 4, 5].map(c => `<button class="chip ${st.cat === c ? "on" : ""}" data-bkc="${c}">${esc(d.cats[c])}<small>${list(st.owner, st.kind, c).length}</small></button>`).join("")}</div>
    <form class="card cab-form" id="bkForm" novalidate>
      <p class="cab-note">${esc(ct(st.kind === "top" ? "bkHintTop" : "bkHintRec"))}</p>
      <div class="scroll-x"><table class="tbl bk-tbl"><thead><tr><th>№</th><th>${esc(ct("bkAuthor"))} *</th><th>${esc(ct("bkTitle"))} *</th><th>${esc(ct("bkLang"))}</th><th>${esc(ct("bkGenre"))}</th>
        ${st.kind === "top" ? `<th style="text-align:right">${esc(ct("bkCount"))} *</th>` : ""}</tr></thead>
      <tbody>${rows.map((r, i) => `<tr data-i="${i}"><td class="nw">${i + 1}</td>
        <td><input class="inp" name="author" value="${esc(r.author)}" placeholder="${i ? "" : "М. Әуезов"}"><small class="fld-err" data-err="${i}.author"></small></td>
        <td><input class="inp" name="title" value="${esc(r.title)}" placeholder="${i ? "" : "Абай жолы"}"><small class="fld-err" data-err="${i}.title"></small></td>
        <td>${sel("lang", d.langs, r.lang)}</td><td>${sel("genre", d.genres, r.genre)}</td>
        ${st.kind === "top" ? `<td><input class="inp num" name="count" inputmode="numeric" value="${esc(r.count ? nf(+String(r.count).replace(/\s/g, "")) : "")}"><small class="fld-err" data-err="${i}.count"></small></td>` : ""}</tr>`).join("")}</tbody></table></div>
      <div class="cab-actions">${last.updated_at ? `<span class="cab-k" style="margin-right:auto">${esc(ct("bkUpd", {d: fmtTs(last.updated_at), n: last.user_name}))}</span>` : ""}
        <button class="cbtn ghost" type="button" id="bkClear">${esc(ct("bkClear"))}</button><button class="cbtn primary" type="submit">${esc(ct("save"))}</button></div>
    </form>`;
  const o = document.getElementById("bkOwner"); if(o) o.addEventListener("change", e => { st.owner = e.target.value; drawBooks(); });
  box.querySelectorAll("[data-bk]").forEach(b => b.addEventListener("click", () => { st.kind = b.dataset.bk; drawBooks(); }));
  box.querySelectorAll("[data-bkc]").forEach(b => b.addEventListener("click", () => { st.cat = +b.dataset.bkc; drawBooks(); }));
  const f = document.getElementById("bkForm");
  f.querySelectorAll(".num").forEach(i => i.addEventListener("input", () => { const raw = i.value.replace(/\D/g, ""); i.value = raw ? nf(+raw) : ""; }));
  document.getElementById("bkClear").addEventListener("click", () => { f.querySelectorAll("input,select").forEach(i => { i.value = ""; }); });
  f.addEventListener("submit", e => {
    e.preventDefault();
    f.querySelectorAll(".fld-err").forEach(x => { x.textContent = ""; });
    const items = [...f.querySelectorAll("tbody tr")].map(tr => {
      const g = n => { const el = tr.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ""; };
      return {author: g("author"), title: g("title"), lang: g("lang"), genre: g("genre"), count: g("count").replace(/\s/g, "")};
    }).filter(x => x.author || x.title);
    const btn = f.querySelector("button[type=submit]"); busy(btn, true);
    api("booksSave", {owner: st.owner, kind: st.kind, cat: st.cat, items: items}).then(r => {
      busy(btn, false); toast(r.nochange ? ct("nochange") : ct("bkSaved", {a: r.count}), r.nochange ? "warn" : "ok");
      if(!r.nochange) S.bkReload();
    }, err => {
      busy(btn, false);
      if(err && err.fields){
        // сервер тек толтырылған жолдарды санайды — нөмірін формадағы жолға сәйкестендіреміз
        const filled = [...f.querySelectorAll("tbody tr")].filter(tr => tr.querySelector('[name="author"]').value.trim() || tr.querySelector('[name="title"]').value.trim());
        Object.keys(err.fields).forEach(k => { const p = k.split("."), tr = filled[+p[0]]; if(!tr) return;
          const el = f.querySelector('[data-err="' + tr.dataset.i + "." + p[1] + '"]'); if(el) el.textContent = err.fields[k]; });
      }
      toast(err.msg || err.error, "bad");
    });
  });
}

/* Мұрағат (бас әкімші) */
VIEWS.archive = () => {
  const cy = new Date().getFullYear(), ys = [];
  for(let y = cy; y >= 2025; y--) ys.push(y);
  return shell("admin/archive", `
  <div class="ph"><h2>${esc(ct("tArch"))}</h2><p>${esc(ct("archDesc"))}</p></div>
  <div class="card"><h3 class="cab-h3">${esc(ct("archYears"))}</h3><div id="aBox"><p class="cab-p">${esc(ct("wait"))}</p></div></div>
  <form class="card cab-form" id="aForm">
    <h3>${esc(ct("archDo"))}</h3>
    <label class="fld"><span>${esc(ct("archYear"))}</span><select class="pick" name="year">${ys.map(y => `<option value="${y}" ${y === cy - 1 ? "selected" : ""}>${y}</option>`).join("")}</select></label>
    <label class="chk"><input type="checkbox" name="over"> ${esc(ct("archOver"))}</label>
    <div class="cab-actions"><button class="cbtn primary" type="submit">${esc(ct("archDo"))}</button></div>
  </form>`);
};
VIEWS.archive.after = () => {
  const load = () => api("archiveYears").then(r => {
    const box = document.getElementById("aBox"); if(!box) return;
    box.innerHTML = (r.years || []).length ? `<div class="scroll-x"><table class="tbl"><thead><tr><th>${esc(ct("year"))}</th><th style="text-align:right">${esc(ct("archCount"))}</th><th>${esc(ct("archAt"))}</th></tr></thead>
      <tbody>${r.years.map(y => `<tr><td><b>${y.year}</b></td><td class="v">${nf(y.count)}</td><td>${esc(fmtTs(y.archived_at))}</td></tr>`).join("")}</tbody></table></div>`
      : `<p class="cab-p">${esc(ct("archNone"))}</p>`;
  }, err => toast(err.msg || err.error, "bad"));
  load();
  const f = document.getElementById("aForm");
  f.addEventListener("submit", e => {
    e.preventDefault();
    const y = +f.year.value, over = f.over.checked;
    modal(ct("archDo"), `<p class="cab-p">${esc(ct(over ? "archQOver" : "archQ", {y: y}))}</p>`, [[ct("no"), "", "ghost"], [ct("yes"), "ok", "primary"]]).then(v => {
      if(v !== "ok") return;
      const btn = f.querySelector("button[type=submit]"); busy(btn, true); toast(ct("archBusy"), "warn");
      api("archive", {year: y, overwrite: over}).then(r => { busy(btn, false); toast(ct("archOk", {y: r.year, n: nf(r.count)})); f.over.checked = false; load(); },
        err => { busy(btn, false); toast(err.msg || err.error, "bad"); });
    });
  });
};

/* ─────────── Маршрутизатор ─────────── */
function route(hash){
  const p = String(hash || "").split("/");
  if(p[0] === "login") return S.token ? ["cabinet", p] : ["login", p];
  if(!S.token) return ["login", p];
  if(p[0] === "cabinet"){
    if(p[1] === "lib") return ["lib", p];
    if(p[1] === "history") return ["history", p];
    if(p[1] === "reports") return ["reports", p];
    if(p[1] === "queue") return ["queue", p];
    if(p[1] === "summary") return ["summary", p];
    if(p[1] === "books") return ["books", p];
    return ["cabinet", p];
  }
  if(p[0] === "admin") return [p[1] === "log" ? "log" : p[1] === "archive" ? "archive" : "users", p];
  return ["cabinet", p];
}
function draw(hash){
  const r = route(hash), name = r[0], p = r[1];
  const go2 = () => {
    if(name !== "login" && (!S.me || (["users", "log", "archive"].indexOf(name) > -1 && S.me.role !== "admin"))){
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
  if(name !== "login" && (!S.me || !S.form)){
    document.getElementById("content").innerHTML = `<div class="page on"><div class="card p-empty">${esc(ct("wait"))}</div></div>`;
    api("me").then(res => { S.me = res.user; S.units = res.units; S.form = res.form || S.form; S.main = res.main || S.main; ss_set("laba_me", JSON.stringify(res.user)); updateBtn(); go2(); flushOutbox(); },
      () => { if(!S.token) go("login"); });
    return;
  }
  go2();
}

window.CAB = {render: draw, updateBtn: updateBtn};
updateBtn();
})();
