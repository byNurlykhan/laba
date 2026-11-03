#!/usr/bin/env python3
"""
Кітапхана паспорттарының мәтіндерін орыс және ағылшын тілдеріне аудару.

Қолданылуы:
    python3 tools/i18n/translate.py data

data/passports/*.json (толық паспорттар) және data/passports-index.json
файлдарына аудармалар қосылады:
  • толық паспортқа:  "tr": {"ru": {"1.1": "…", "d": "…"}, "en": {…}}
  • тізімге: «1.1_ru», «1.1_en», «1.3_ru», «1.3_en», «d_ru», «d_en» бағандары

Тәсіл: дайын сөздіктер (districts.tsv, values.tsv) → ресми терминдер глоссарийі →
елді мекен / көше үлгілері → қалған меншікті атауларды транслитерациялау.
"""
import json, os, re, sys, glob

HERE = os.path.dirname(os.path.abspath(__file__))
KK_LETTERS = "ӘәҒғҚқҢңӨөҰұҮүІіҺһ"
UP = "А-ЯЁӘҒҚҢӨҰҮІҺA-Z"
W = r"[\w\-’'`ʼ.]"          # атау ішіндегі таңбалар

# ───────────── транслитерация ─────────────
KK2RU = str.maketrans({"Ә": "А", "ә": "а", "Ғ": "Г", "ғ": "г", "Қ": "К", "қ": "к", "Ң": "Н", "ң": "н",
                       "Ө": "О", "ө": "о", "Ұ": "У", "ұ": "у", "Ү": "У", "ү": "у", "І": "И", "і": "и",
                       "Һ": "Х", "һ": "х"})
CYR2LAT = {"а": "a", "ә": "a", "б": "b", "в": "v", "г": "g", "ғ": "g", "д": "d", "е": "e", "ё": "yo",
           "ж": "zh", "з": "z", "и": "i", "й": "i", "к": "k", "қ": "k", "л": "l", "м": "m", "н": "n",
           "ң": "n", "о": "o", "ө": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ұ": "u",
           "ү": "u", "ф": "f", "х": "kh", "һ": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch",
           "ъ": "", "ы": "y", "і": "i", "ь": "", "э": "e", "ю": "yu", "я": "ya"}


def tr_ru(s):
    return s.translate(KK2RU)


def tr_en(s):
    out = []
    for i, ch in enumerate(s):
        low = ch.lower()
        if low in CYR2LAT:
            lat = CYR2LAT[low]
            if ch != low and lat:
                nxt = s[i + 1] if i + 1 < len(s) else ""
                lat = lat.upper() if (nxt and nxt.isupper()) else lat[0].upper() + lat[1:]
            out.append(lat)
        else:
            out.append(ch)
    return "".join(out)


def is_russian(s):
    if re.search("[" + KK_LETTERS + "]", s):
        return False
    return bool(re.search(r"(библиотек|сельск|районн|городск|улиц|\bул\.|\bсело\b|\bпос\.|\bдом\b|"
                          r"централизован|филиал\b|ская\b|ский\b|ное\b|ный\b)", s, re.I))


# ───────────── сөздіктер ─────────────
def load_tsv(name):
    d = {}
    p = os.path.join(HERE, name)
    if not os.path.exists(p):
        return d
    for line in open(p, encoding="utf-8"):
        if not line.strip() or line.startswith("#"):
            continue
        parts = line.rstrip("\n").split("\t")
        if len(parts) >= 3:
            d[norm(parts[0])] = (parts[1], parts[2])
    return d


def norm(s):
    return re.sub(r"\s+", " ", str(s)).strip().strip(".;,").strip().lower()


DISTRICTS = load_tsv("districts.tsv")
VALUES = load_tsv("values.tsv")        # жиі кездесетін мәндер (Иә, Жоқ, …)
MANUAL = load_tsv("manual.tsv")        # қолмен аударылған бірегей мәтіндер

REGIONS = {
    "абай": ("Абайская область", "Abai Region"), "ақмола": ("Акмолинская область", "Akmola Region"),
    "ақтөбе": ("Актюбинская область", "Aktobe Region"), "алматы": ("Алматинская область", "Almaty Region"),
    "атырау": ("Атырауская область", "Atyrau Region"),
    "батыс қазақстан": ("Западно-Казахстанская область", "West Kazakhstan Region"),
    "жамбыл": ("Жамбылская область", "Zhambyl Region"), "жетісу": ("Жетысуская область", "Zhetysu Region"),
    "қарағанды": ("Карагандинская область", "Karaganda Region"),
    "қостанай": ("Костанайская область", "Kostanay Region"),
    "қызылорда": ("Кызылординская область", "Kyzylorda Region"),
    "маңғыстау": ("Мангистауская область", "Mangystau Region"),
    "павлодар": ("Павлодарская область", "Pavlodar Region"),
    "солтүстік қазақстан": ("Северо-Казахстанская область", "North Kazakhstan Region"),
    "түркістан": ("Туркестанская область", "Turkistan Region"), "ұлытау": ("Улытауская область", "Ulytau Region"),
    "шығыс қазақстан": ("Восточно-Казахстанская область", "East Kazakhstan Region"),
}

# Ресми терминдер: (үлгі, орысша, ағылшынша). Ұзындары алдымен тексеріледі.
G = [
    (r"ықшам аудан(ы)?", "мкр.", "microdistrict"), (r"пәтер(лер|і)?", "кв.", "apt."),
    (r"(теңгерімі|балансы)н(да|де)(ғы|гі)?", "на балансе", "on the balance of"), (r"үй-жайы?|жайы", "помещение", "premises"),
    (r"(\d+)-?(ші|шы|інші|ыншы) қабат(ында|та|ы)?", "\\1-й этаж", "floor \\1"),
    (r"(\d+) қабаттан тұрады", "\\1 этажей", "\\1 storeys"),
    (r"ауылдық округ(і)? әкімшілігі(нде|нің)?", "администрация сельского округа", "rural district administration"),
    (r"ауылдық округ(і)? әкімі аппараты(нда)?", "аппарат акима сельского округа", "rural district akim's office"),
    (r"ЖББМ", "СОШ", "secondary school"), (r"ЖОББМ", "СОШ", "secondary school"), (r"мекеме", "учреждение", "institution"),
    (r"әкімділік", "акимат", "akimat"), (r"әкімдік", "акимат", "akimat"),
    (r"(\d+)\s*-?\s*қабатты", "\\1-этажное", "\\1-storey"),
    (r"(шаршы метр|шаршы м\.?|ш\.\s?м\.?|кв\.\s?м\.?|м2|м²)", "м²", "m²"), (r"шаршы", "кв.", "sq."), (r"метр", "м", "m"),
    (r"орта мектеп(і|інде|тің)?", "средняя школа", "secondary school"),
    (r"негізгі мектеп(і|інде)?|негізгі мектебі(нің|нде)?", "основная школа", "basic school"),
    (r"мектеп(і|інде|ке|тің)?|мектебі(нде|нің)?", "школа", "school"),
    # ресурстар (3.3, 3.4)
    (r"ақпараттық[- ]құқықтық жүйе(сі)?", "информационно-правовая система", "legal information system"),
    (r"ғылыми журналдар мен мақалалардың дерекқорлары", "базы данных научных журналов и статей",
     "databases of scientific journals and articles"),
    (r"ғылыми жарияланымдар мен дәйексөздер дерекқоры", "база данных научных публикаций и цитирования",
     "database of scientific publications and citations"),
    (r"халықаралық қатынастар", "международные отношения", "international relations"),
    (r"ақпараттық ресурстар", "информационные ресурсы", "information resources"),
    (r"ақпараттық база", "информационная база", "information database"),
    (r"сандық білім беру ресурсы", "цифровой образовательный ресурс", "digital educational resource"),
    (r"(дерекқор(лары|ы)?|деректер базасы)", "база данных", "database"), (r"мақала(лар|лардың)?", "статьи", "articles"),
    (r"президенттік кітапхана(сы)?", "Президентская библиотека", "Presidential Library"),
    (r"ҚР", "РК", "RK"), (r"РФ", "РФ", "RF"), (r"сандық", "цифровой", "digital"), (r"экономика", "экономика", "economics"),
    # мекемелер
    (r"қазақстан республикасы(ның)?", "Республики Казахстан", "of the Republic of Kazakhstan"),
    (r"мәдениет және ақпарат министрлігі(нің)?", "Министерство культуры и информации", "Ministry of Culture and Information"),
    (r"архив,? құжаттама және кітап ісі комитеті(нің)?", "Комитет архивов, документации и книжного дела",
     "Committee for Archives, Documentation and Book Publishing"),
    (r"республикалық мемлекеттік мекемесі(нің)?", "республиканское государственное учреждение", "republican state institution"),
    (r"коммуналдық мемлекеттік қазыналық кәсіпорны(ның)?", "коммунальное государственное казённое предприятие",
     "municipal state-owned enterprise"),
    (r"коммуналдық мемлекеттік мекемесі(нің|не|нің)?", "коммунальное государственное учреждение", "municipal state institution"),
    (r"мемлекеттік мекемесі(нің|не)?", "государственное учреждение", "state institution"),
    (r"мәдениет,? тілдерді дамыту,? дене шынықтыру және спорт бөлімі(нің|не)?",
     "отдел культуры, развития языков, физической культуры и спорта",
     "department of culture, language development, physical culture and sports"),
    (r"мәдениет және тілдерді дамыту бөлімі(нің|не|нің)?", "отдел культуры и развития языков",
     "department of culture and language development"),
    (r"мәдениет,? тілдерді дамыту,? архивтер және құжаттама басқармасы(ның)?",
     "управление культуры, развития языков, архивов и документации",
     "department of culture, language development, archives and documentation"),
    (r"мәдениет басқармасы(ның)?", "управление культуры", "department of culture"),
    (r"мәдениет бөлімі(нің)?", "отдел культуры", "department of culture"),
    (r"әкімдігі(нің|не)?", "акимата", "akimat"),
    (r"әкімшілігі(нің)?", "администрации", "administration"),
    # кітапхана жүйелері
    (r"орталықтандырыл[ғa]?ан көпшілік кітапханалар жүйесі(нің|не)?", "централизованная система публичных библиотек",
     "centralized public library system"),
    (r"орталықтандырыл[ғ]?ан кітапхана(лар)? жүйесі(нің|не|не қарасты)?", "централизованная библиотечная система",
     "centralized library system"),
    (r"облыстық әмбебап ғылыми кітапхана(сы)?", "областная универсальная научная библиотека",
     "regional universal research library"),
    (r"облыстық балалар (және|мен) жасөспірімдер кітапхана(сы)?", "областная детско-юношеская библиотека",
     "regional children's and youth library"),
    (r"облыстық арнаулы кітапхана(сы)?", "областная специальная библиотека", "regional special library"),
    (r"зағип және нашар көретін (азаматтарға|адамдарға) арналған", "для незрячих и слабовидящих граждан",
     "for blind and visually impaired people"),
    (r"аудандық орталық кітапхана(сы)?", "центральная районная библиотека", "district central library"),
    (r"орталық аудандық кітапхана(сы)?", "центральная районная библиотека", "central district library"),
    (r"аудандық балалар кітапхана(сы)?", "районная детская библиотека", "district children's library"),
    (r"аудандық кітапхана(сы)?", "районная библиотека", "district library"),
    (r"қалалық орталық кітапхана(сы)?", "центральная городская библиотека", "city central library"),
    (r"орталық қалалық кітапхана(сы)?", "центральная городская библиотека", "central city library"),
    (r"орталық балалар кітапхана(сы)?", "центральная детская библиотека", "central children's library"),
    (r"қалалық балалар кітапхана(сы)?", "городская детская библиотека", "city children's library"),
    (r"қалалық кітапхана(сы)?", "городская библиотека", "city library"),
    (r"(ауылдық|ауыл|аулдық|селолық) (модельді|модельдік|модульдік|үлгілі) кітапха?на(сы)?",
     "сельская модельная библиотека", "rural model library"),
    (r"(модельді|модельдік|үлгілі) (ауылдық|ауыл) кітапха?на(сы)?", "сельская модельная библиотека", "rural model library"),
    (r"(ауылдық|ауыл|аулдық|селолық) балалар кітапха?на(сы)?", "сельская детская библиотека", "rural children's library"),
    (r"(ауылдық|ауыл|аулдық|селолық) (кітапха?на|кітапахана)(сы|-филиалы|филиалы| филиалы)?", "сельская библиотека",
     "rural library"),
    (r"(ауылдық|ауыл) филиалы", "сельский филиал", "rural branch"),
    (r"кенттік кітапхана(сы)?", "поселковая библиотека", "settlement library"),
    (r"балалар кітапхана-филиал(ы)?", "детская библиотека-филиал", "children's branch library"),
    (r"балалар кітапхана(сы)?", "детская библиотека", "children's library"),
    (r"(кітапхана-филиалы?|кітапхана филиалы|филиал-кітапхана(сы)?|кітапхана-филиал)", "библиотека-филиал",
     "branch library"),
    (r"кітапхана бөлімшесі", "библиотечное отделение", "library unit"),
    (r"(модельді|модельдік|үлгілі)", "модельная", "model"),
    (r"кітапха?на(сы|лары|лар|ның)?", "библиотека", "library"),
    (r"филиалы?", "филиал", "branch"),
    (r"қарасты", "в составе", "under"),
    (r"бөлімшесі", "отделение", "unit"),
    # аббревиатуралар
    (r"ОКЖ(-?(ның|нің|на|не|сы|сі|ға|ге))?", "ЦБС", "CLS"), (r"КММ(-?(ның|нің|на|не|сы|сі|ға|ге))?", "КГУ", "MSI"),
    (r"ММ(-?(ның|нің|на|не|сы|сі|ға|ге))?", "ГУ", "SI"), (r"РММ(-?(ның|нің))?", "РГУ", "RSI"),
    (r"КМҚК(-?(ның|нің))?", "КГКП", "MSOE"), (r"ОАК", "ЦРБ", "CDL"), (r"ҚазҰЭК(-сы|-і)?", "КазНЭБ", "KazNEB"),
    (r"(КазНЭБ|Казнэб|КАЗНЭБ|Казнеб|КазНЕБ)", "КазНЭБ", "KazNEB"),
    # ғимарат / мекенжай
    (r"(ауылдық )?мәдениет үйі(нде|нің)?", "дом культуры", "house of culture"),
    (r"мәдениет орталығы(нда)?", "центр культуры", "cultural centre"),
    (r"ауылдық клуб(та)?", "сельский клуб", "rural club"),
    (r"мектеп ғимараты(нда)?", "здание школы", "school building"),
    (r"мектеп(те|тің)?", "школа", "school"),
    (r"жеке тұрған ғимарат", "отдельно стоящее здание", "stand-alone building"),
    (r"жеке ғимарат", "отдельное здание", "separate building"),
    (r"(типтік|үлгілік) ғимарат", "типовое здание", "standard building"),
    (r"(лайықталған|бейімделген) ғимарат", "приспособленное здание", "adapted building"),
    (r"(лайықталған|бейімделген)", "приспособленное", "adapted"),
    (r"(типтік|үлгілік)", "типовое", "standard"),
    (r"әкімдік ғимараты(нда)?", "здание акимата", "akimat building"),
    (r"ғимарат(ы|та|ында)?", "здание", "building"),
    (r"(бірінші|1) қабат(ында|та)?", "первый этаж", "ground floor"),
    (r"(екінші|2) қабат(ында|та)?", "второй этаж", "second floor"),
    (r"қабат(ында|та|ы)?", "этаж", "floor"),
    (r"жалға алынған", "арендованное", "rented"),
    (r"шағын аудан(ы)?|ш\.?а\.", "мкр.", "microdistrict"),
    (r"тұрғын үй", "жилой дом", "residential building"),
    (r"медпункт", "медпункт", "medical post"),
    # мән сөздер
    (r"абонемент бөлімі?мен біріктірілген", "совмещён с абонементом", "combined with the lending section"),
    (r"абонементпен біріктірілген", "совмещён с абонементом", "combined with the lending section"),
    (r"біріктірілген", "совмещён", "combined"),
    (r"оқ(ырман|у) залы(ның)?", "читальный зал", "reading room"),
    (r"орын(ды)?", "мест", "seats"), (r"бөлме", "комната", "room"),
    (r"интернетке қосылған", "подключено к Интернету", "connected to the Internet"),
    (r"қосылған", "подключено", "connected"), (r"қолжетімді", "доступно", "available"),
    (r"жүйесі арқылы", "через систему", "via the system"), (r"арқылы", "через", "via"),
    (r"орнатылған", "установлен", "installed"), (r"жүйесі", "система", "system"),
    (r"республикалық автоматтандырылған кітапханалық[- ]ақпараттық жүйе(сі)?",
     "республиканская автоматизированная библиотечно-информационная система",
     "national automated library information system"),
    (r"қосымшаны қараңыз", "см. приложение", "see annex"),
    (r"ақ[- ]қара", "ч/б", "b/w"), (r"түрлі[- ]түсті", "цветной", "colour"),
    (r"оқырман(дар)?", "читателей", "readers"), (r"құжат(тар)?", "документов", "documents"),
    (r"дана", "шт.", "pcs"), (r"жоқ|жок", "нет", "no"), (r"иә|иа", "да", "yes"), (r"бар", "есть", "yes"),
    (r"және", "и", "and"), (r"мен", "и", "and"),
    (r"жыл(ы)?", "год", "year"), (r"ж\.", "г.", ""),
    # жиі кездесетін жалпы сөздер
    (r"тілдерді дамыту", "развития языков", "language development"), (r"ішкі саясат", "внутренней политики", "internal policy"),
    (r"дене шынықтыру", "физической культуры", "physical culture"), (r"нашар көретін", "слабовидящих", "visually impaired"),
    (r"еден жуушы", "уборщик", "cleaner"), (r"әкім аппараты(ның|нда)?", "аппарат акима", "akim's office"),
    (r"(оның|соның) ішінде", "в том числе", "including"), (r"ішінде", "в том числе", "including"),
    (r"елді[- ]?мекені?", "населённый пункт", "settlement"),
    (r"орналасқан", "расположена", "located"), (r"газет(тер|і|тер-)?", "газет", "newspapers"),
    (r"журнал(дар|ы|дар-)?", "журналов", "magazines"), (r"кітапханалық", "библиотечная", "library"),
    (r"орталықтандырыл[ғ]?ан", "централизованная", "centralized"), (r"мәдениет", "культуры", "culture"),
    (r"атау(ы|лары)?", "наименований", "titles"), (r"клуб(ы|ының|ында|та)?", "клуб", "club"),
    (r"ауд\.", "р-н", "dist."), (r"обл\.", "обл.", "reg."), (r"орта", "средняя", "secondary"),
    (r"дамыту", "развития", "development"), (r"ауыл", "село", "village"),
    (r"электрон(ды|дық)", "электронные", "electronic"), (r"үйдің", "дома", "of the house"),
    (r"саясат", "политики", "policy"), (r"тұрғын", "жилой", "residential"), (r"әкімшілік", "административное", "administrative"),
    (r"мың", "тыс.", "thousand"), (r"теңге", "тенге", "tenge"), (r"өңірі", "регион", "region"),
    (r"білім(і)?", "образования", "education"), (r"орталығы(нда|ның)?", "центр", "centre"),
    (r"жалпы", "общая", "total"), (r"абонемент", "абонемент", "lending"), (r"жылдың", "года", "of the year"),
    (r"жинақ", "комплект", "set"), (r"жүйе", "система", "system"), (r"саны", "количество", "number"),
    (r"аудан", "район", "district"), (r"жанындағы", "при", "attached to"), (r"бірге", "вместе", "together"),
    (r"автоматтандырылған", "автоматизированная", "automated"), (r"спорт", "спорта", "sports"),
    (r"аудыны", "площадь", "area"), (r"негізгі", "основное", "main"), (r"бөлек", "отдельное", "separate"),
    (r"жеке", "отдельное", "separate"), (r"беру", "выдачи", "issuing"), (r"кітапханашы(сы)?", "библиотекарь", "librarian"),
    (r"екі", "два", "two"), (r"залы", "зал", "hall"), (r"ақпараттық", "информационная", "information"),
    (r"ноутбук", "ноутбук", "laptop"), (r"адам", "человек", "people"), (r"әкімінің", "акима", "akim's"),
    (r"бойынша", "по", "by"), (r"орындық", "мест", "seats"), (r"жартыжылдығы(на)?", "полугодие", "half-year"),
    (r"бөлімше(сі)?", "отделение", "unit"), (r"арналған", "предназначенное", "intended for"), (r"пәтер", "квартира", "apartment"),
    (r"жалға", "в аренду", "rented"), (r"округ", "округ", "district"), (r"бөлмесі(нде)?", "в комнате", "in a room"),
    (r"құрылыс", "строительство", "construction"), (r"үйі", "дом", "house"), (r"интернет", "Интернет", "Internet"),
    (r"аппараты", "аппарат", "office"), (r"тілі?нде|тілде", "на языке", "in the language"),
    (r"қызметкер(лер)?", "сотрудники", "staff"), (r"ғимаратының", "здания", "of the building"),
    (r"орындар", "места", "seats"), (r"порталы", "портал", "portal"), (r"қазақ|қаз", "казахский", "Kazakh"),
    (r"қызмет(і)?", "служба", "service"), (r"балансында", "на балансе", "on the balance of"),
    (r"компьютер(лер)?", "компьютер", "computer"), (r"ескі", "старое", "old"), (r"ресурстары?", "ресурсы", "resources"),
    (r"басқармасы(ның)?", "управление", "department"), (r"бір", "один", "one"), (r"үйде|үйінде", "в доме", "in the house"),
    (r"ақысыз|тегін", "бесплатно", "free"), (r"бағдарламасы", "программа", "programme"), (r"ықшам", "компактный", "compact"),
    (r"басылым(дары|дар)?", "издания", "publications"), (r"жазылым", "подписка", "subscription"),
    (r"сом+асы", "сумма", "amount"), (r"(нөмір|номер)сіз", "без номера", "no number"), (r"аймағы", "зона", "area"),
    (r"обласы", "область", "region"), (r"жалдау", "аренда", "rent"), (r"бөлімімен", "с отделом", "with the department"),
    (r"рәсімделіп", "оформлена", "arranged"), (r"болды", "было", "was"), (r"көрсету", "показ", "showing"),
    (r"арнайы", "специальное", "special"), (r"коворкинг", "коворкинг", "coworking"), (r"оқу", "чтение", "reading"),
    (r"инд\.?", "инд.", "postcode"), (r"кітап(тар|тары)?", "книги", "books"), (r"еден", "пол", "floor"),
    (r"кешені", "комплекс", "complex"), (r"үй-жай(ы)?", "помещение", "premises"), (r"рабис", "РАБИС", "RABIS"),
    (r"бірлікте", "единиц", "units"), (r"моделді", "модельная", "model"), (r"облыс", "область", "region"),
    (r"сарайы", "дворец", "palace"), (r"тиесілі", "принадлежит", "belongs to"), (r"алу", "получение", "receipt"),
    (r"балаларға", "детям", "for children"), (r"дана", "шт.", "pcs"), (r"бөлмелі", "комнатное", "-room"),
    (r"(орналасқан|орналасты)", "расположена", "located"), (r"ауылдық", "сельская", "rural"),
    (r"облыстық", "областная", "regional"), (r"әмбебап", "универсальная", "universal"),
    (r"ғылыми", "научная", "research"), (r"аудандық", "районная", "district"),
    (r"қалалық", "городская", "city"), (r"орталық", "центральная", "central"),
    (r"(ауылдық|аулдық)", "сельская", "rural"), (r"республикалық", "республиканская", "national"),
    (r"балалар", "детская", "children's"), (r"жасөспірімдер", "юношеская", "youth"),
    (r"ұлттық", "национальная", "national"), (r"академиялық", "академическая", "academic"),
    (r"көпшілік", "публичная", "public"), (r"мемлекеттік", "государственное", "state"),
    (r"коммуналдық", "коммунальное", "municipal"), (r"мекемесі(нің)?", "учреждение", "institution"),
    (r"ауылы(ның|нда)?", "село", "village"), (r"көше(сі)?", "улица", "street"),
    (r"атындағы", "им.", "named after"), (r"бөлімі(нің)?", "отдел", "department"),
    (r"округі(нің)?", "округ", "district"), (r"ауданы(ның)?", "район", "district"),
    (r"облысы(ның)?", "область", "region"), (r"қаласы(ның)?", "город", "city"),
]
G = [(re.compile(r"(?<![\w-])" + p + r"(?![\w])", re.I), ru, en) for p, ru, en in G]

NAME = r"(?:[«\"]?[" + UP + r"0-9]" + W + r"*[»\"]?)"
NAMES = NAME + r"(?:[ -]" + NAME + r"){0,2}"

PLACE = [
    # (үлгі, орысша формат, ағылшынша формат)
    (re.compile(r"(" + NAMES + r") ауылдық округі(нің|не|ндегі)?"), "{ru} сельский округ", "{en} rural district"),
    (re.compile(r"(" + NAMES + r") (ауылы(ның|нда|ндағы)?|а\.)(?=\s|,|$|/)"), "с. {ru}", "{en} village"),
    (re.compile(r"(" + NAMES + r") кенті(нің|нде|ндегі)?"), "пос. {ru}", "{en} settlement"),
    (re.compile(r"(" + NAMES + r") (қаласы(ның|нда|ндағы)?|қ\.)"), "г. {ru}", "{en} city"),
    (re.compile(r"(" + NAMES + r") (даңғылы|даң\.)"), "пр. {ru}", "{en} Ave."),
    (re.compile(r"(?:№\s*)?(\d+[\w/]*)\s?-?\s?(үй|үйі)(?![\w])"), "д. {raw}", "bldg. {raw}"),
]


STREET = re.compile(r"(" + NAMES + r") (көшесі(нің)?|көш\.|к-сі|к-ci|к\.)\s*,?\s*(?:№\s*)?(\d+[\w/]*)?(?:\s*-?\s*(?:үй|үйі)(?![\w]))?")


def gen_ru(name):
    """Орыс тіліндегі ілік септігі (қарапайым): Абай → Абая, Ахметов → Ахметова."""
    w = name.split(" ")
    last = w[-1]
    if re.search(r"й$", last):
        last = last[:-1] + "я"
    elif re.search(r"[бвгджзклмнпрстфхцчшщ]$", last, re.I):
        last = last + "а"
    return " ".join(w[:-1] + [last])


def gen_place_ru(ru):
    """«Сарыкольский район» → «Сарыкольского района», «г. Семей» → «города Семей»."""
    ru = ru.strip()
    m = re.fullmatch(r"(\S+)ский район", ru)
    if m:
        return m.group(1) + "ского района"
    m = re.fullmatch(r"(\S+)ий район", ru)
    if m:
        return m.group(1) + "ого района"
    if ru.startswith("район "):
        return "района " + ru[6:]
    if ru.startswith("г. "):
        return "города " + ru[3:]
    m = re.fullmatch(r"(.+)ская область", ru)
    if m:
        return m.group(1) + "ской области"
    return ru


FORMS = {"КММ": ("КГУ", "MSI"), "ММ": ("ГУ", "SI"), "КМҚК": ("КГКП", "MSOE"), "РММ": ("РГУ", "RSI")}
FORM_RX = r"(КММ|ММ|КМҚК|РММ|коммуналдық мемлекеттік мекемесі|мемлекеттік мекемесі)(?:-?(?:нің|ның|не|на|сі|сы))?"


def form_of(x):
    x = (x or "").strip()
    if x.startswith("коммуналдық"):
        return FORMS["КММ"]
    if x.startswith("мемлекеттік"):
        return FORMS["ММ"]
    return FORMS.get(x, ("", ""))


def place_of(kk):
    """Аудан/қала атауын сөздіктен (немесе транслитерациямен) аудару."""
    k = norm(kk)
    for cand in (k, k + " ауданы", k.replace("ауданының", "ауданы"), k.replace("қаласының", "қ."),
                 k.replace(" қаласы", " қ.")):
        if cand in DISTRICTS:
            return DISTRICTS[cand]
    nm = re.sub(r"\s*(ауданының|ауданы|қаласының|қаласы|қ\.|аудандық|қалалық)$", "", kk.strip(), flags=re.I)
    if norm(nm + " ауданы") in DISTRICTS and not re.search(r"қала", kk, re.I):
        return DISTRICTS[norm(nm + " ауданы")]
    if norm(nm + " қ.") in DISTRICTS:
        return DISTRICTS[norm(nm + " қ.")]
    if re.search(r"қала", kk, re.I):
        return "г. " + tr_ru(nm), tr_en(nm) + " City"
    return "район " + tr_ru(nm), tr_en(nm) + " District"


# «Х ауданының орталықтандырылған кітапхана(лар) жүйесі» КММ
CLS_RX = re.compile(r"[«\"]?\s*(?:[" + UP + r"]\S*(?:\s[" + UP + r"]\S*)?\s+облысы(?:ның)?\s+)?"
                    r"(?P<place>[" + UP + r"][^«»\"/]*?\s(?:ауданының|қаласының|ауданы|қаласы|аудандық|қалалық))\s+"
                    r"(?:аудандық\s+|қалалық\s+)?орталықтандырыл[ғ]?ан\s+(?:көпшілік\s+)?кітапхана(?:лар)?\s+жүйесі(?:нің|не)?"
                    r"\s*(?P<f1>КММ|ММ)?\s*[»\"]?\s*(?P<f2>" + FORM_RX + r")?", re.I)


def cls_name(m):
    ru_p, en_p = place_of(m.group("place"))
    f_ru, f_en = form_of(m.group("f1") or m.group("f2"))
    ru = (f_ru + " " if f_ru else "") + "«Централизованная библиотечная система " + gen_place_ru(ru_p) + "»"
    en = "«" + re.sub(r" city$", " City", en_p) + " Centralized Library System»" + (" " + f_en if f_en else "")
    return ru, en


def quoted(s0):
    """Тырнақшадағы атауды жеке аударамыз; «…» КММ → КГУ «…» (орысша)."""
    slots = []

    def put(ru, en):
        slots.append((ru, en))
        return "\x01%d\x01" % (len(slots) - 1)

    def q(m):
        inner = m.group(2)
        if CLS_RX.fullmatch(m.group(0).strip()):
            return put(*cls_name(CLS_RX.fullmatch(m.group(0).strip())))
        ru, en = translate_seg(inner)
        ru, en = ru[:1].upper() + ru[1:], en[:1].upper() + en[1:]
        f = m.group(4)
        if f:
            f_ru, f_en = form_of(f)
            return put(f_ru + " «" + ru + "»", "«" + en + "» " + f_en)
        return put("«" + ru + "»", "«" + en + "»")

    t = re.sub(r"([«\"])([^«»\"]+)([»\"])\s*(" + FORM_RX + r")?", q, s0)
    rest = re.split("(\x01\\d+\x01)", t)
    ru, en = [], []
    for part in rest:
        mm = re.fullmatch("\x01(\\d+)\x01", part)
        if mm:
            ru.append(slots[int(mm.group(1))][0]); en.append(slots[int(mm.group(1))][1])
        elif part.strip():
            r, e = translate_seg(part.strip(" ,"))
            ru.append(r); en.append(e)
    return tidy(" ".join(ru)), tidy(" ".join(en))


def place_tokens(name):
    """Атаудағы облыс/аудан сөздігін қолданамыз, қалғанын транслитерация."""
    return tr_ru(name), tr_en(name)


LEFT = []          # соңғы аудармада аударылмай қалған сөздер


def translate(s, field=""):
    """→ (ru, en). « / » арқылы бөлінген бөліктер жеке аударылады."""
    s0 = re.sub(r"\s+", " ", str(s)).strip()
    key = norm(s0)
    del LEFT[:]
    for book in (MANUAL, VALUES, DISTRICTS):
        if key in book:
            return book[key]
    s0 = re.sub(r"(?<![\w])а\s*/\s*к(?![\w])", "ауылдық кітапханасы", s0)
    s0 = re.sub(r"кітапхана\s*[-–]\s*филиал", "кітапхана-филиал", s0, flags=re.I)
    s0 = re.sub(r"№\s*(\d+)(?=[^\d\s/,.-])", r"№\1 ", s0)
    s0 = re.sub(r"(?<![\w])а\.(?=[^\s])", "а. ", s0)
    s0 = re.sub(r"^\d+(?=«)", "", s0)
    parts = re.split(r"\s+/\s+", s0)
    if len(parts) > 1:
        out = [translate_seg(p) for p in parts]
        return " / ".join(o[0] for o in out), " / ".join(o[1] for o in out)
    return translate_seg(s0)


def translate_seg(s):
    """→ (ru, en). Өзгеріс болмаса, бастапқы мәтін қайтады."""
    s0 = re.sub(r"\s+", " ", str(s)).strip()
    if not s0:
        return s0, s0
    key = norm(s0)
    for book in (MANUAL, VALUES, DISTRICTS):
        if key in book:
            return book[key]
    if re.fullmatch(r"[\d\s.,/%+\-–()]+", s0):           # тек сан
        return s0, s0
    if is_russian(s0):
        return s0, translate_ru_to_en(s0)
    if re.search(r"[«\"][^«»\"]{3,}[»\"]", s0) and not re.fullmatch(r"[«\"][^«»\"]+[»\"]", s0):
        return quoted(s0)
    m = re.search(r"(" + NAMES + r") атындағы\s+", s0)
    if m:                                    # «Абай атындағы … кітапхана» → «… библиотека им. Абая»
        rest = (s0[:m.start()] + s0[m.end():]).strip()
        ru, en = translate_seg(rest)
        nm = m.group(1).strip("«»\"")
        ru = ru + " им. " + gen_ru(tr_ru(nm))
        return ru[:1].upper() + ru[1:], tr_en(nm) + " " + en

    slots = []

    def put(ru, en):
        slots.append((ru, en))
        return "\x00%d\x00" % (len(slots) - 1)

    def restore(x, lang):
        i = 0 if lang == "ru" else 1
        return re.sub("\x00(\\d+)\x00", lambda m: slots[int(m.group(1))][i], x)

    t = s0
    # 0) ОКЖ атауы: «Х ауданының орталықтандырылған кітапхана жүйесі» КММ
    t = CLS_RX.sub(lambda m: put(*cls_name(m)), t)
    # 1) аудандар мен облыстар (сөздік бойынша)
    for k, (ru, en) in sorted(DISTRICTS.items(), key=lambda kv: -len(kv[0])):
        base = re.escape(k).replace("ауданы", "ауданы(ның|на|нда|ндағы)?")
        t = re.sub(r"(?<![\w])" + base + r"(?![\w])", lambda m, ru=ru, en=en: put(ru, en), t, flags=re.I)
    for k, (ru, en) in sorted(REGIONS.items(), key=lambda kv: -len(kv[0])):
        t = re.sub(r"(?<![\w])" + re.escape(k) + r" облысы(ның|нда|ндағы)?(?![\w])",
                   lambda m, ru=ru, en=en: put(ru, en), t, flags=re.I)
    # 3) көше + үй нөмірі: «Абай көшесі 86 үй» → «ул. Абай, 86» / «86 Abai St.»
    def street(m):
        nm, num = m.group(1), (m.group(4) or "").strip()
        ru = "ул. " + tr_ru(nm) + (", " + num if num else "")
        en = (num + " " if num else "") + tr_en(nm) + " St."
        return put(ru, en)
    t = STREET.sub(street, t)
    t = re.sub(r"(?<![\w])(\d+)[- ]?(көше(сі)?)(?![\w])", lambda m: put("ул. " + m.group(1), "Street " + m.group(1)), t)
    # елді мекендер
    for rx, fru, fen in PLACE:
        def rep(m, fru=fru, fen=fen):
            raw = m.group(1)
            if "{raw}" in fru:
                return put(fru.format(raw=raw), fen.format(raw=raw))
            return put(fru.format(ru=restore(tr_ru(raw), "ru")), fen.format(en=restore(tr_en(raw), "en")))
        t = rx.sub(rep, t)
    # 4) ресми терминдер мен жалпы сөздер
    for rx, ru, en in G:
        t = rx.sub(lambda m, ru=ru, en=en: put(m.expand(ru) if "\\" in ru else ru,
                                                m.expand(en) if "\\" in en else en), t)

    # 5) қалған қазақша сөздер — транслитерация (кіші әріппен басталғандары — аударылмай қалған сөздер)
    LEFT.extend(w for w in re.findall(r"(?<![\w])[а-яёәғқңөұүіһ][а-яёәғқңөұүіһ\-]+", re.sub("\x00\\d+\x00", " ", t))
                if len(w) > 2)
    ru = restore(tr_ru(t), "ru")
    en = restore(tr_en(t), "en")
    ru = ", ".join(reorder_ru(p) for p in tidy(ru).split(", "))
    en = reorder_en(tidy(en))
    return cap_like(s0, ru), cap_like(s0, en)


RU_HEADS = tuple(sorted(("сельская библиотека", "сельская модельная библиотека", "сельская детская библиотека",
            "поселковая библиотека", "детская библиотека", "районная детская библиотека",
            "центральная районная библиотека", "районная библиотека", "городская библиотека",
            "центральная городская библиотека", "городская детская библиотека", "библиотека-филиал",
            "централизованная библиотечная система", "централизованная система публичных библиотек",
            "модельная библиотека", "центральная библиотека", "библиотека"), key=len, reverse=True))


def reorder_ru(ru):
    """«Карагаш сельская библиотека» → «Сельская библиотека Карагаш» (орыс тіліне тән тәртіп)."""
    for h in RU_HEADS:
        m = re.fullmatch(r"(.+?)\s+(№\s*\d+\s+)?" + re.escape(h) + r"(\s*№\s*\d+)?", ru, re.I)
        if m and not re.search(r"(библиотек|район|област|учрежд|отдел|система)", m.group(1), re.I) \
                and re.match(r"(с\.|пос\.|г\.|[А-ЯЁA-Z«\"0-9№])", m.group(1)):
            num = (m.group(2) or m.group(3) or "").strip()
            return h[0].upper() + h[1:] + (" " + num if num else "") + " " + m.group(1)
        m = re.fullmatch(r"(№\s*\d+)\s+" + re.escape(h), ru, re.I)
        if m:
            return h[0].upper() + h[1:] + " " + m.group(1)
    return ru


def reorder_en(en):
    """«Agrogorodok village № 5 branch library» → «Agrogorodok village branch library No. 5»."""
    en = re.sub(r"№\s*(\d+)\s+(.*?(library|branch))$", r"\2 No. \1", en)
    return re.sub(r"№\s*(\d+)", r"No. \1", en)


def tidy(x):
    x = re.sub(r"\s+", " ", x).strip()
    x = re.sub(r"((?:г\.|пос\.|с\.) [^\s,.]+|\S+ (?:city|village|settlement))\.(?=,)", r"\1", x)   # «г. Алматы.,» → «г. Алматы,»
    x = re.sub(r"\s+([,.;:)])", r"\1", x)
    return x


def cap_like(src, out):
    if re.match(r"(ул|с|г|пос|пр|д|мкр|им)\.", out):
        return out
    if out and src[:1].isupper() and out[:1].islower():
        return out[0].upper() + out[1:]
    return out


RU_EN = [
    (r"виртуальн\w+ читальн\w+ зал\w*", "virtual reading room"), (r"\bРГБ\b", "Russian State Library"),
    (r"электронн\w+ библиотек\w+", "electronic library"), (r"электронн\w+ каталог\w*", "electronic catalogue"),
    (r"централизованн\w+ библиотечн\w+ систем\w+", "centralized library system"),
    (r"сельск\w+ библиотек\w+", "rural library"), (r"детск\w+ библиотек\w+", "children's library"),
    (r"районн\w+ библиотек\w+", "district library"), (r"городск\w+ библиотек\w+", "city library"),
    (r"библиотек\w*", "library"), (r"филиал\w*", "branch"), (r"\bул\.|улица", "St."),
    (r"\bпр\.|проспект", "Ave."), (r"\bд\.", "bldg."), (r"\bс\.|село", "village"),
    (r"район\w*", "district"), (r"област\w+", "region"), (r"\bг\.|город\w*", "city"),
    (r"дом культуры", "house of culture"), (r"школ\w+", "school"), (r"здани\w+", "building"),
    (r"\bда\b", "yes"), (r"\bнет\b", "no"), (r"\bесть\b", "yes"),
]
RU_EN = [(re.compile(p, re.I), e) for p, e in RU_EN]


def translate_ru_to_en(s):
    slots = []
    t = s
    for rx, en in RU_EN:
        t = rx.sub(lambda m, en=en: (slots.append(en), "\x00%d\x00" % (len(slots) - 1))[1], t)
    t = tr_en(t)
    t = re.sub("\x00(\\d+)\x00", lambda m: slots[int(m.group(1))], t)
    return cap_like(s, tidy(t))


# Аударылатын өрістер. 5.2 — тек ағылшынша транслитерация (адам аты).
FIELDS = ["1.1", "1.3", "2.2", "2.3", "2.4", "3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9",
          "3.10", "3.11", "4.2", "4.3", "4.4", "5.1", "6.1", "6.2", "6.3"]


SMALL = {"of", "and", "the", "for", "named", "after", "under", "via", "with", "in", "on", "at", "to"}


def title_en(x):
    out = []
    for i, w in enumerate(x.split(" ")):
        if i and w.lower() in SMALL:
            out.append(w.lower())
        elif w[:1].islower():
            out.append(w[:1].upper() + w[1:])
        else:
            out.append(w)
    return " ".join(out)


def record_tr(x):
    tr = {"ru": {}, "en": {}}
    for c in FIELDS:
        v = (x.get("f") or {}).get(c)
        if not v:
            continue
        ru, en = translate(v, c)
        if c == "1.1":
            ru, en = ru[:1].upper() + ru[1:], title_en(en)
        if ru != v:
            tr["ru"][c] = ru
        if en != v:
            tr["en"][c] = en
    if x.get("d"):
        ru, en = translate(x["d"], "d")
        tr["ru"]["d"], tr["en"]["d"] = ru, en
    p = (x.get("f") or {}).get("5.2")
    if p:
        tr["en"]["5.2"] = tr_en(p)
    return tr


def main(data_dir):
    full = {}
    for fn in glob.glob(os.path.join(data_dir, "passports", "*.json")):
        chunk = json.load(open(fn, encoding="utf-8"))
        for k, x in chunk.items():
            x["tr"] = record_tr(x)
            full[k] = x
        json.dump(chunk, open(fn, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    ip = os.path.join(data_dir, "passports-index.json")
    idx = json.load(open(ip, encoding="utf-8"))
    cols = [c for c in idx["cols"] if not re.search(r"_(ru|en)$", c)]
    base = len(cols)
    extra = ["1.1_ru", "1.1_en", "1.3_ru", "1.3_en", "d_ru", "d_en"]
    rows = []
    for row in idx["rows"]:
        row = row[:base]
        x = full.get(str(row[0]), {})
        tr = x.get("tr", {"ru": {}, "en": {}})
        for e in extra:
            c, lang = e.rsplit("_", 1)
            row.append(tr[lang].get(c, ""))
        rows.append(row)
    json.dump({"cols": cols + extra, "rows": rows}, open(ip, "w", encoding="utf-8"),
              ensure_ascii=False, separators=(",", ":"))
    print("records", len(full))


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "--try":
        for s in sys.argv[2:]:
            print(s, "→", translate(s))
    else:
        main(sys.argv[1] if len(sys.argv) > 1 else "data")
