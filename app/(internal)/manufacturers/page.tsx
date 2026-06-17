// @ts-nocheck
'use client';

/* Каталог производителей и технических решений — полный ИИ-хаб-дизайн «Функция»
   (перенос Manufacturers + SolChart из Cloud Design). Дизайн заскоуплен под .fx.
   Реальные данные производителей берём из MOCK_* (lib), вся логика поиска /
   shortlist / маршрутов сохранена. ИИ-подбор, SolChart и скоринг — презентационные
   надстройки поверх реальных данных (мок-релевантность допустима). */

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_MANUFACTURERS, MOCK_MANUFACTURER_PRODUCTS } from '@/lib/mock-data';
import { Manufacturer } from '@/lib/types';
import { useApp } from '@/lib/store';
import { Icon } from '../../_orders/icons';
import '../../_orders/orders.css';

const SECTION_FILTERS = ['АР', 'КР', 'ЭОМ', 'ВК', 'ОВиК', 'ГС', 'ТХ', 'ПБ', 'СС'];

const SHORTLIST_KEY = 'pm_shortlist_mfr';

const grad = (a, b) => ({ background: `linear-gradient(135deg, ${a}, ${b})` });

/* Презентационные градиенты логотипов производителей (по id). */
const MFR_GRAD: Record<string, [string, string]> = {
  mfg1: ['#a06bf5', '#7d52e8'],
  mfg2: ['#4aa3ff', '#3b7ff0'],
  mfg3: ['#5b9dff', '#3b7ff0'],
  mfg4: ['#f5933d', '#ec6f2a'],
};
const fallbackGrad: [string, string] = ['#5ad0e0', '#3aa9d8'];
const mfrGrad = (id: string) => MFR_GRAD[id] || fallbackGrad;

/* ====== Презентационный ИИ-сценарий (мок поверх реальных данных) ====== */
const EXAMPLES = [
  'Мне нужен узел крепления фасада для здания 75 м в климатической зоне II с минераловатным утеплителем.',
  'Подбери систему плоской эксплуатируемой кровли для промышленного здания с уклоном 1,5%.',
  'Какое решение по огнезащите металлоконструкций обеспечит предел R120 для складского комплекса?',
];
const SUGGEST = [
  ['Узел крепления фасада', 0],
  ['Плоская эксплуатируемая кровля', 1],
  ['Огнезащита металлоконструкций', 2],
];

const ANSWERS = [
  {
    parsed: ['Фасад', 'Высота 75 м', 'Ветровой район II', 'Минвата 150 мм', 'λ ≤ 0,038'],
    sol: [
      {
        t: 'Навесной вентилируемый фасад (НВФ)', tag: 'Рекомендовано', tagC: 'var(--green)', match: 96, short: 'НВФ',
        d: 'Алюминиевая подсистема, минераловатный утеплитель 150 мм, облицовка из керамогранита. Рассчитан на ветровую нагрузку района II и высоту до 100 м.',
        chips: ['Узел КР-12', 'R₀ ≥ 3,2', 'НГ', 'Ветер II'],
        det: {
          params: [['Высота применения', 'до 100 м'], ['Ветровой район', 'II (до 0,30 кПа)'], ['Сопротивление R₀', '≥ 3,2 м²·°C/Вт'], ['Пож. опасность', 'К0 / НГ']],
          layers: [['Облицовка', 'керамогранит 8 мм, скрытый крепёж'], ['Воздушный зазор', '40 мм, вентилируемый'], ['Утеплитель', 'минвата 150 мм, λ=0,037'], ['Подсистема', 'алюминий, кронштейн КР-12, шаг 600 мм'], ['Несущая стена', 'газобетон / монолит']],
          pros: ['Вентзазор исключает накопление влаги', 'Ремонтопригодность облицовки', 'Проходит экспертизу по СП 2.13130 без доп. обоснования'],
        },
      },
      {
        t: 'Фасад с фиброцементными плитами', tag: 'Альтернатива', tagC: 'var(--accent-2)', match: 88, short: 'Фиброцемент',
        d: 'Лёгкая облицовка на оцинкованной подсистеме. Меньшая нагрузка на узел, но требует уменьшенного шага кронштейнов на высоте 75 м.',
        chips: ['Узел КР-08', 'Г1', 'Лёгкий'],
      },
      {
        t: 'Штукатурный фасад (СФТК)', tag: 'С ограничением', tagC: 'var(--amber)', match: 61, short: 'СФТК',
        d: 'Для здания 75 м применяется только с противопожарными рассечками и дополнительным механическим креплением. Требует обоснования по ветровой нагрузке.',
        chips: ['Огранич. по высоте', 'Доп. крепёж'],
      },
    ],
    makerNames: ['ООО «ТехФасад»', 'АО «ПрофМет»'],
    norms: [
      ['СП 20.13330.2016', 'Нагрузки и воздействия — ветровой район II'],
      ['СП 50.13330.2012', 'Тепловая защита зданий'],
      ['ГОСТ 31251-2008', 'Стены наружные. Метод испытания на пожарную опасность'],
      ['СП 2.13130.2020', 'Обеспечение огнестойкости объектов защиты'],
    ],
    bim: [
      ['bim', 'Узел крепления НВФ КР-12.rfa', 'Revit · 2,4 МБ'],
      ['bim', 'Кронштейн фасадный.ifc', 'IFC · 1,1 МБ'],
      ['layers', 'Спецификация подсистемы.xlsx', 'XLSX · 320 КБ'],
    ],
    objects: [
      ['БЦ «Меридиан»', 'Москва · 78 м · 2024'],
      ['ЖК «Высота»', 'Казань · 75 м · 2023'],
      ['Отель «Панорама»', 'Сочи · 72 м · 2024'],
    ],
  },
  {
    parsed: ['Кровля', 'Плоская эксплуатируемая', 'Уклон 1,5%', 'Промышленное здание', 'ПВХ-мембрана'],
    sol: [
      {
        t: 'Инверсионная кровля с ПВХ-мембраной', tag: 'Рекомендовано', tagC: 'var(--green)', match: 94, short: 'Инверсия',
        d: 'Балластная инверсионная система: ПВХ-мембрана, экструзионный пенополистирол, балласт. Подходит для эксплуатируемой кровли с уклоном 1,5% и пешеходной нагрузкой.',
        chips: ['ПВХ 1,5 мм', 'ЭППС', 'Уклон 1,5%', 'Балласт'],
        det: {
          params: [['Уклон', '1,5% (норма ≥ 1,5%)'], ['Нагрузка', 'эксплуатируемая, пешеходная'], ['Утеплитель', 'ЭППС, λ=0,032'], ['Гидроизоляция', 'ПВХ-мембрана 1,5 мм']],
          layers: [['Балласт / плитка', 'на опорах, ≥ 50 мм'], ['Геотекстиль', 'разделительный слой'], ['Утеплитель ЭППС', 'в 2 слоя вразбежку'], ['ПВХ-мембрана', '1,5 мм, свободная укладка'], ['Разуклонка', 'уклон 1,5%'], ['Несущая плита', 'монолит / профлист']],
          pros: ['Гидроизоляция защищена утеплителем от УФ и перепадов', 'Долговечность 25+ лет', 'Ремонт без вскрытия пирога — поднять балласт'],
        },
      },
      {
        t: 'Мастичная кровля (полиуретан)', tag: 'Альтернатива', tagC: 'var(--accent-2)', match: 81, short: 'Мастика',
        d: 'Бесшовное полиуретановое покрытие, ремонтопригодно и стойко к застою воды, но дороже в нанесении на больших площадях.',
        chips: ['Бесшовная', 'ПУ', 'Ремонтопригодна'],
      },
      {
        t: 'Битумно-полимерная наплавляемая', tag: 'С ограничением', tagC: 'var(--amber)', match: 69, short: 'Наплавляемая',
        d: 'Двухслойная наплавляемая система. Для эксплуатируемой кровли требует защитной стяжки и финишного покрытия плиткой.',
        chips: ['2 слоя', 'Защитная стяжка'],
      },
    ],
    makerNames: ['Завод ЖБИ «ЗапСибСтрой»', 'АО «ПрофМет»'],
    norms: [
      ['СП 17.13330.2017', 'Кровли'],
      ['СП 28.13330.2017', 'Защита строительных конструкций от коррозии'],
      ['СП 50.13330.2012', 'Тепловая защита зданий'],
      ['ГОСТ 30547-97', 'Материалы рулонные кровельные. Общие технические условия'],
    ],
    bim: [
      ['bim', 'Узел примыкания к парапету.rfa', 'Revit · 1,8 МБ'],
      ['bim', 'Воронка водосточная.ifc', 'IFC · 0,9 МБ'],
      ['layers', 'Спецификация кровельного пирога.xlsx', 'XLSX · 280 КБ'],
    ],
    objects: [
      ['Логистический центр А-12', 'Москва · 24 000 м² · 2024'],
      ['ТЦ «Галерея»', 'Самара · эксплуатируемая · 2023'],
      ['Паркинг «Центральный»', 'Уфа · кровля-стилобат · 2024'],
    ],
  },
  {
    parsed: ['Огнезащита', 'Металлоконструкции', 'Предел R120', 'Складской комплекс', 'Конструктивная'],
    sol: [
      {
        t: 'Конструктивная огнезащита плитами', tag: 'Рекомендовано', tagC: 'var(--green)', match: 95, short: 'Плиты',
        d: 'Облицовка несущих колонн и балок негорючими плитами. Гарантированный предел R120 без зависимости от приведённой толщины металла, сухой монтаж.',
        chips: ['R120', 'НГ', 'Плиты', 'Сухой монтаж'],
        det: {
          params: [['Предел огнестойкости', 'R120'], ['Тип', 'конструктивная, сухой монтаж'], ['Приведённая толщина', 'не нормируется'], ['Материал', 'негорючие плиты НГ']],
          layers: [['Несущая колонна', 'двутавр / коробка'], ['Каркас крепления', 'оцинкованный профиль'], ['Плиты огнезащиты', '2 слоя, вразбежку'], ['Крепёж', 'анкеры / саморезы'], ['Финиш', 'шпатлёвка / окраска (опц.)']],
          pros: ['R120 без зависимости от сечения металла', 'Сухой монтаж — всесезонно', 'Не требует контроля толщины, как вспучивающаяся краска'],
        },
      },
      {
        t: 'Вспучивающаяся краска', tag: 'Альтернатива', tagC: 'var(--accent-2)', match: 83, short: 'Краска',
        d: 'Тонкослойное покрытие, сохраняет геометрию конструкций. Для R120 требует значительной толщины и контроля приведённой толщины металла.',
        chips: ['Тонкослойная', 'Окраска', 'Контроль ТМ'],
      },
      {
        t: 'Напыляемый минеральный состав', tag: 'С ограничением', tagC: 'var(--amber)', match: 71, short: 'Напыление',
        d: 'Экономичное решение для скрытых конструкций, но неприменимо для открытых эстетичных элементов без облицовки.',
        chips: ['Напыление', 'Скрытые конструкции'],
      },
    ],
    makerNames: ['АО «ПрофМет»', 'Завод ЖБИ «ЗапСибСтрой»'],
    norms: [
      ['СП 2.13130.2020', 'Обеспечение огнестойкости объектов защиты'],
      ['ГОСТ Р 53295-2009', 'Средства огнезащиты для стальных конструкций'],
      ['ГОСТ 30247.1-94', 'Конструкции. Методы испытаний на огнестойкость'],
      ['СП 56.13330.2021', 'Производственные здания'],
    ],
    bim: [
      ['bim', 'Огнезащита колонны R120.rfa', 'Revit · 1,5 МБ'],
      ['layers', 'Ведомость огнезащиты МК.xlsx', 'XLSX · 210 КБ'],
      ['file', 'Сертификат ПБ на состав (R120).pdf', 'PDF · 3,2 МБ'],
    ],
    objects: [
      ['Склад класса А «ЛогоПарк»', 'Подольск · R120 · 2024'],
      ['Производство «ТехноЛайн»', 'Тула · МК · 2023'],
      ['Распредцентр «Север»', 'Тверь · R120 · 2024'],
    ],
  },
];

/* Категории каталога — презентационная привязка к реальным производителям по id. */
const MFR_CATS: Record<string, string> = {
  mfg1: 'Фасады',
  mfg2: 'ЖБИ',
  mfg3: 'ЖБИ',
  mfg4: 'Металл',
};
const P_CATS = ['Все', 'Фасады', 'Кровля', 'Утеплители', 'Металл', 'ЖБИ', 'Огнезащита'];

/* Библиотека BIM-моделей — презентационная (мок поверх каталога). */
const B_CATS = ['Все', 'Узлы', 'Конструкции', 'Фасады', 'Инж. системы', 'Спецификации'];
const BIMLIB = [
  { ic: 'bim', n: 'Узел крепления НВФ КР-12.rfa', cat: 'Узлы', fmt: 'Revit', size: '2,4 МБ' },
  { ic: 'bim', n: 'Кронштейн фасадный.ifc', cat: 'Фасады', fmt: 'IFC', size: '1,1 МБ' },
  { ic: 'bim', n: 'Узел примыкания кровли к парапету.rfa', cat: 'Узлы', fmt: 'Revit', size: '1,8 МБ' },
  { ic: 'bim', n: 'Балка перекрытия Б-300.ifc', cat: 'Конструкции', fmt: 'IFC', size: '2,0 МБ' },
  { ic: 'bim', n: 'Огнезащита колонны R120.rfa', cat: 'Конструкции', fmt: 'Revit', size: '1,5 МБ' },
  { ic: 'cpu', n: 'Узел ввода инженерных сетей.rfa', cat: 'Инж. системы', fmt: 'Revit', size: '1,3 МБ' },
  { ic: 'layers', n: 'Спецификация фасадной подсистемы.xlsx', cat: 'Спецификации', fmt: 'XLSX', size: '320 КБ' },
  { ic: 'layers', n: 'Ведомость огнезащиты МК.xlsx', cat: 'Спецификации', fmt: 'XLSX', size: '210 КБ' },
];

/* Презентационный мок-скоринг решения для одного продукта производителя. */
function productSolutions(prod) {
  const base = 70 + ((prod.id.charCodeAt(prod.id.length - 1) + (prod.certCount || 0)) % 26);
  return [
    { t: prod.name, tag: 'Рекомендовано', tagC: 'var(--green)', match: Math.min(98, base + 18), short: prod.subtitle, d: `${prod.subtitle}. Соответствует ${prod.spec || 'действующим нормам'}.`, chips: prod.tags },
    { t: `${prod.name} (альтернатива)`, tag: 'Альтернатива', tagC: 'var(--accent-2)', match: Math.min(90, base + 6), short: 'Альтернатива', d: 'Аналог с другой подсистемой и облегчённым узлом.', chips: prod.tags.slice(0, 2) },
  ];
}

/* Секция ответа ИИ. */
function Section({ icon, title, count, children }) {
  return (
    <div className="ai-sec">
      <div className="ai-sec__h">
        <span className="ai-sec__ic"><Icon name={icon} size={16} /></span>
        <h3 className="section-title" style={{ fontSize: 17 }}>{title}</h3>
        {count != null && <span className="dim" style={{ fontSize: 13 }}>{count}</span>}
      </div>
      {children}
    </div>
  );
}

/* Бар-чарт релевантности решений (адаптация SolChart, стр. 8 эталона). */
function SolChart({ sols, themeKey, onPick }) {
  const max = Math.max(...sols.map((s) => s.match), 0);
  const ranked = [...sols].sort((a, b) => b.match - a.match);
  return (
    <div className="mcard">
      <div className="mcard__top">
        <span className="mcard__h"><Icon name="scan" size={15} /> Совпадение с задачей</span>
        <span className="mcard__sub">{sols.length} решения · по релевантности</span>
      </div>
      <div className="mcard__rows">
        {ranked.map((s, i) => (
          <button key={s.t} type="button" className={'mrow' + (s.match === max ? ' is-top' : '')} onClick={() => onPick(s)} title={s.t}>
            <span className="mrow__rank">{i + 1}</span>
            <span className="mrow__name">{s.short || s.t}<i className="mrow__tag" style={{ color: s.tagC, background: `color-mix(in srgb, ${s.tagC} 15%, transparent)` }}>{s.tag}</i></span>
            <span className="mrow__track"><span key={themeKey + '-' + i} className="mrow__fill" style={{ width: s.match + '%', background: s.tagC }} /></span>
            <span className="mrow__val">{s.match}<small>%</small></span>
            <Icon name="arrowRight" size={14} className="mrow__go" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ManufacturersPage() {
  const router = useRouter();
  const { notify } = useApp();

  // === реальная логика: поиск / фильтры / shortlist / маршруты (сохранена) ===
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [selectedMfr, setSelectedMfr] = useState<Manufacturer | null>(null);
  const [shortlist, setShortlist] = useState<string[]>([]);

  // Load persisted shortlist after mount to avoid SSR hydration mismatch
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(SHORTLIST_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setShortlist(parsed.filter((x): x is string => typeof x === 'string'));
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  const toggleShortlist = (id: string, name: string) => {
    setShortlist((prev) => {
      const isIn = prev.includes(id);
      const next = isIn ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        window.localStorage.setItem(SHORTLIST_KEY, JSON.stringify(next));
      } catch {
        // ignore storage write errors
      }
      notify(isIn ? `«${name}» убран из проекта` : `«${name}» добавлен в проект`);
      return next;
    });
  };

  // === ИИ-хаб: вкладки, ИИ-подбор (презентационный), drawer'ы ===
  const [tab, setTab] = useState<'ai' | 'prod' | 'bim'>('ai');

  // ИИ-подбор
  const [query, setQuery] = useState(EXAMPLES[0]);
  const [active, setActive] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [mode, setMode] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [openSol, setOpenSol] = useState(null);
  const taRef = useRef(null);
  const fileRef = useRef(null);

  useLayoutEffect(() => {
    const ta = taRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  }, [query]);

  const onFiles = (e) => {
    const ns = Array.from(e.target.files || []).map((f) => f.name);
    if (ns.length) setFiles((p) => [...p, ...ns]);
    e.target.value = '';
  };
  const ask = (q, idx) => {
    const text = (q != null ? q : query).trim();
    if (!text) return;
    setQuery(text);
    if (idx != null) setActive(idx);
    setThinking(true);
    setTimeout(() => setThinking(false), 750);
  };

  const A = ANSWERS[active] || ANSWERS[0];
  const parsed = A.parsed;
  const SOLUTIONS = A.sol;
  const NORMS = A.norms;
  const BIM = A.bim;
  const OBJECTS = A.objects;
  // производители ответа — из реального каталога по имени
  const ANSWER_MAKERS = A.makerNames
    .map((n) => MOCK_MANUFACTURERS.find((m) => m.name === n))
    .filter(Boolean);

  // === вкладка «Производители» — РЕАЛЬНЫЕ данные MOCK_MANUFACTURERS ===
  const [pCat, setPCat] = useState('Все');
  const producers = MOCK_MANUFACTURERS.filter((m) => {
    const cat = MFR_CATS[m.id] || '';
    if (pCat !== 'Все' && cat !== pCat) return false;
    // Поиск охватывает название, описание, теги и регион поставки — так сохраняется
    // прежняя возможность фильтровать производителей по региону (deliveryRegion).
    const hay = `${m.name} ${m.description} ${m.deliveryRegion || ''} ${(m.tags || []).join(' ')}`.toLowerCase();
    if (search.trim() && !hay.includes(search.trim().toLowerCase())) return false;
    return true;
  });

  // === вкладка «BIM-модели» (презентационная библиотека) ===
  const [bCat, setBCat] = useState('Все');
  const bims = BIMLIB.filter(
    (b) => (bCat === 'Все' || b.cat === bCat) && (!search.trim() || b.n.toLowerCase().includes(search.trim().toLowerCase())),
  );

  return (
    <div className="fx animate-in">
      <p className="cat-eyebrow">Производители и решения</p>
      <h1 className="cat-title" style={{ maxWidth: 640 }}>Каталог решений и ИИ-подбор</h1>

      <div className="tabs" style={{ marginTop: 18 }}>
        {[['ai', 'ИИ-подбор'], ['prod', 'Производители'], ['bim', 'BIM-модели']].map(([k, l]) => (
          <button key={k} className={'tab' + (tab === k ? ' is-active' : '')} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* ===================== ВКЛАДКА: ИИ-ПОДБОР ===================== */}
      {tab === 'ai' && (
        <div className="ai-tabwrap">
          <div className="ai-hero ai-hero--split">
            <div className="ai-glow" aria-hidden="true" />
            <div className="ai-hero__main">
              <span className="ai-badge"><Icon name="spark" size={13} /> ИИ-помощник проектировщика</span>
              <h2 className="ai-hero__title">Опишите задачу — соберём решение</h2>
              <p className="ai-hero__sub">Помощник подберёт решения, сверит их с нормативами и покажет производителей, BIM-модели и реализованные объекты.</p>

              <div className={'ai-pbox' + (thinking ? ' is-loading' : '')}>
                {files.length > 0 && (
                  <div className="ai-pbox__files">
                    {files.map((f, i) => (
                      <span key={i} className="ai-att">
                        <Icon name="file" size={13} />{f}
                        <button type="button" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} aria-label="Убрать"><Icon name="x" size={12} /></button>
                      </span>
                    ))}
                  </div>
                )}
                <textarea
                  ref={taRef}
                  className="ai-pbox__ta"
                  rows={1}
                  value={query}
                  placeholder={mode === 'norm' ? 'Поиск по нормативной базе…' : mode === 'analyze' ? 'Глубокий разбор задачи…' : mode === 'bim' ? 'Подбор BIM-моделей…' : 'Какую инженерную задачу решаем?'}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } }}
                />
                <input type="file" ref={fileRef} multiple onChange={onFiles} style={{ display: 'none' }} />
                <div className="ai-pbox__bar">
                  <div className="ai-pbox__tools">
                    <button type="button" className="ai-pbox__attach" title="Прикрепить файлы" onClick={() => fileRef.current && fileRef.current.click()}><Icon name="paperclip" size={18} /></button>
                    <div className="ai-pbox__toggles">
                      {[['norm', 'Нормативы', 'globe', '#3f9fe0'], ['analyze', 'Анализ', 'scan', '#8b6cf2'], ['bim', 'BIM', 'layers', '#f0913d']].map(([k, label, ic, col], i) => (
                        <span key={k} style={{ display: 'contents' }}>
                          {i > 0 && <span className="ai-pbox__div" />}
                          <button
                            type="button"
                            className={'ai-pbox__tg' + (mode === k ? ' is-on' : '')}
                            style={mode === k ? { color: col, borderColor: col, background: `color-mix(in srgb, ${col} 15%, transparent)` } : null}
                            onClick={() => setMode((m) => (m === k ? null : k))}
                          >
                            <Icon name={ic} size={16} />{mode === k && <span>{label}</span>}
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={'ai-pbox__send' + ((query.trim() || files.length) ? ' is-on' : '')}
                    onClick={() => ask()}
                    disabled={thinking}
                    aria-label="Подобрать"
                  >
                    <Icon name={thinking ? 'scan' : (query.trim() || files.length) ? 'arrowRight' : 'send'} size={18} />
                  </button>
                </div>
              </div>

              <div className="ai-pills">
                {SUGGEST.map(([title, idx]) => (
                  <button key={title} type="button" className={'ai-pill' + (idx === active ? ' is-on' : '')} onClick={() => ask(EXAMPLES[idx], idx)}>{title}</button>
                ))}
              </div>
            </div>

            <div className="ai-hero__aside">
              <div className="ai-hero__mascot">
                <div className="manuf__logo" style={{ width: 132, height: 132, borderRadius: 28, ...grad('#a06bf5', '#7d52e8') }}>
                  <Icon name="factory" size={56} />
                </div>
              </div>
            </div>
          </div>

          <div className={'ai-answer' + (thinking ? ' is-dim' : '')}>
            <div className="ai-understood">
              <span className="ai-understood__l"><Icon name="checkCircle" size={15} style={{ color: 'var(--green)' }} /> Задача распознана</span>
              <div className="chips">{parsed.map((p) => <span key={p} className="chip chip-code">{p}</span>)}</div>
            </div>

            <Section icon="bulb" title="Решения" count={SOLUTIONS.length + ' варианта'}>
              <div className="col gap16">
                <SolChart sols={SOLUTIONS} themeKey={active} onPick={setOpenSol} />
                <div className="solgrid">
                  {SOLUTIONS.map((s) => (
                    <div key={s.t} className="solv ai-sol--click" onClick={() => setOpenSol(s)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setOpenSol(s); }}>
                      <span className="solv__edge" style={{ background: s.tagC }} />
                      <div className="solv__top">
                        <span className="ai-tag" style={{ color: s.tagC, background: `color-mix(in srgb, ${s.tagC} 14%, transparent)` }}>{s.tag}</span>
                        <span className="solv__match" style={{ color: s.tagC }}><b>{s.match}</b><small>%</small></span>
                      </div>
                      <b className="solv__title">{s.t}</b>
                      <p className="solv__desc">{s.d}</p>
                      <div className="chips solv__chips">{s.chips.map((c) => <span key={c} className="chip chip-code">{c}</span>)}</div>
                      <span className="ai-sol__more solv__more">Подробнее <Icon name="arrowRight" size={14} /></span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <Section icon="factory" title="Производители" count={ANSWER_MAKERS.length}>
              <div className="ai-grid">
                {ANSWER_MAKERS.map((m) => (
                  <div key={m.id} className="card card-hover prod-card" onClick={() => { setTab('prod'); setSelectedMfr(m); }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') { setTab('prod'); setSelectedMfr(m); } }}>
                    <div className="row gap12" style={{ marginBottom: 12 }}>
                      <div className="manuf__logo" style={grad(...mfrGrad(m.id))}><Icon name="factory" size={20} /></div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14.5 }}>{m.name}</div>
                        <div className="row gap6 dim" style={{ fontSize: 12.5 }}><Icon name="star" size={12} style={{ color: 'var(--amber)' }} />{m.rating} · {m.deliveryRegion || 'РФ'}</div>
                      </div>
                    </div>
                    <p className="muted" style={{ margin: '0 0 14px', fontSize: 13, lineHeight: 1.45 }}>{m.description}</p>
                    <div className="row between" style={{ alignItems: 'center' }}>
                      <span className="chip chip-code">{MFR_CATS[m.id] || '—'}</span>
                      <span className="ai-sol__more">Открыть <Icon name="arrowRight" size={14} /></span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon="database" title="Нормативная база" count={NORMS.length}>
              <div className="secgrid">
                {NORMS.map(([code, name]) => (
                  <div key={code} className="secitem"><span className="chip chip-code">{code}</span><span className="secitem__name">{name}</span></div>
                ))}
              </div>
            </Section>

            <Section icon="building" title="Реализованные объекты" count={OBJECTS.length}>
              <div className="ai-grid">
                {OBJECTS.map(([name, meta], i) => (
                  <div key={name} className="ai-obj">
                    <div className="ai-obj__img" style={grad(...mfrGrad('mfg' + ((i % 4) + 1)))} />
                    <div className="ai-obj__b"><div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div><div className="dim" style={{ fontSize: 12.5 }}>{meta}</div></div>
                  </div>
                ))}
              </div>
            </Section>

            <button className="btn btn-ghost btn-sm" style={{ marginTop: 4 }} onClick={() => router.push('/standards')}>
              <Icon name="database" size={15} /> Открыть нормативную базу
            </button>
          </div>

          {/* Slide-over карточки решения */}
          {openSol && (() => {
            const s = openSol;
            const det = s.det || {};
            return (
              <div className="solm" onClick={() => setOpenSol(null)}>
                <div className="solm__panel" onClick={(e) => e.stopPropagation()}>
                  <button className="solm__close" onClick={() => setOpenSol(null)} aria-label="Закрыть"><Icon name="x" size={18} /></button>
                  <div className="solm__head" style={{ borderColor: `color-mix(in srgb, ${s.tagC} 30%, transparent)` }}>
                    <span className="ai-tag" style={{ color: s.tagC, background: `color-mix(in srgb, ${s.tagC} 14%, transparent)` }}>{s.tag}</span>
                    <h2 className="solm__title">{s.t}</h2>
                    <p className="muted" style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.55, maxWidth: 560 }}>{s.d}</p>
                    <div className="solm__match">
                      <div className="solm__ring" style={{ background: `conic-gradient(${s.tagC} ${s.match * 3.6}deg, var(--surface-3) 0)` }}><span>{s.match}<small>%</small></span></div>
                      <span className="dim" style={{ fontSize: 12 }}>совпадение<br />с задачей</span>
                    </div>
                  </div>

                  <div className="solm__body">
                    {det.params && (
                      <div className="solm__sec">
                        <h4 className="solm__h">Параметры</h4>
                        <div className="solm__params">{det.params.map(([k, v]) => <div key={k} className="solm__param"><span className="dim">{k}</span><b>{v}</b></div>)}</div>
                      </div>
                    )}

                    {det.layers && (
                      <div className="solm__sec">
                        <h4 className="solm__h">Состав узла</h4>
                        <div className="solm__layers">{det.layers.map(([n, d], i) => <div key={n} className="solm__layer"><span className="solm__layer-n">{i + 1}</span><div><b>{n}</b><span className="dim">{d}</span></div></div>)}</div>
                      </div>
                    )}

                    {det.pros && (
                      <div className="solm__sec">
                        <h4 className="solm__h">Преимущества</h4>
                        <ul className="solm__pros">{det.pros.map((p) => <li key={p}><Icon name="check" size={15} />{p}</li>)}</ul>
                      </div>
                    )}

                    <div className="solm__sec">
                      <h4 className="solm__h">Применимые нормативы</h4>
                      <div className="secgrid">{NORMS.slice(0, 3).map(([code, name]) => <div key={code} className="secitem"><span className="chip chip-code">{code}</span><span className="secitem__name">{name}</span></div>)}</div>
                    </div>

                    <div className="solm__sec">
                      <h4 className="solm__h">Производители</h4>
                      <div className="solm__makers">{ANSWER_MAKERS.map((m) => (
                        <button key={m.id} type="button" className="solm__maker solm__maker--btn" onClick={() => { setOpenSol(null); setTab('prod'); setSelectedMfr(m); }} title={'Открыть «' + m.name + '»'}>
                          <div className="manuf__logo" style={{ width: 34, height: 34, ...grad(...mfrGrad(m.id)) }}><Icon name="factory" size={16} /></div>
                          <div style={{ minWidth: 0 }}><b>{m.name}</b><span className="dim">★ {m.rating}</span></div>
                          <Icon name="arrowRight" size={14} className="solm__maker-go" />
                        </button>
                      ))}</div>
                    </div>

                    <div className="solm__sec">
                      <h4 className="solm__h">BIM-модели и спецификации</h4>
                      <div className="col gap8">{BIM.map(([ic, name, meta]) => (
                        <div key={name} className="ai-file">
                          <div className="ai-file__ic"><Icon name={ic} size={16} /></div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                            <div className="dim" style={{ fontSize: 11.5 }}>{meta}</div>
                          </div>
                          <button className="iconbtn" style={{ width: 32, height: 32, flex: 'none' }} onClick={() => notify('Скачивание BIM — в разработке')}><Icon name="download" size={15} /></button>
                        </div>
                      ))}</div>
                    </div>
                  </div>

                  <div className="solm__foot">
                    <button className="btn btn-ghost" onClick={() => setOpenSol(null)}>Закрыть</button>
                    <div className="row gap8">
                      <button className="btn btn-ghost" onClick={() => notify('Скачивание BIM — в разработке')}><Icon name="download" size={15} /> Скачать BIM</button>
                      <button className="btn btn-primary" onClick={() => router.push('/orders')}><Icon name="plus" size={15} /> В проект</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ===================== ВКЛАДКА: ПРОИЗВОДИТЕЛИ ===================== */}
      {tab === 'prod' && (
        <div className="ai-tabwrap">
          <div className="row between gap16 wrap" style={{ margin: '18px 0 16px', alignItems: 'center' }}>
            <div className="topbar__search" style={{ maxWidth: 360, height: 44 }}>
              <Icon name="search" />
              <input placeholder="Поиск производителя или решения…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <span className="dim" style={{ fontSize: 13 }}>Найдено: {producers.length}</span>
          </div>
          <div className="chips" style={{ marginBottom: 20 }}>
            {P_CATS.map((c) => <button key={c} className={'pill' + (c === pCat ? ' is-active' : '')} onClick={() => setPCat(c)}>{c}</button>)}
          </div>
          {producers.length ? (
            <div className="ai-grid">
              {producers.map((m) => (
                <div key={m.id} className="card card-hover prod-card" onClick={() => setSelectedMfr(m)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setSelectedMfr(m); }}>
                  <div className="row gap12" style={{ marginBottom: 12 }}>
                    <div className="manuf__logo" style={grad(...mfrGrad(m.id))}><Icon name="factory" size={20} /></div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5 }}>{m.name}</div>
                      <div className="row gap6 dim" style={{ fontSize: 12.5 }}><Icon name="star" size={12} style={{ color: 'var(--amber)' }} />{m.rating} · {m.deliveryRegion || 'РФ'}</div>
                    </div>
                  </div>
                  <p className="muted" style={{ margin: '0 0 14px', fontSize: 13, lineHeight: 1.45 }}>{m.description}</p>
                  <div className="chips" style={{ marginBottom: 12 }}>{m.tags.slice(0, 3).map((t, i) => <span key={i} className="chip">{t}</span>)}</div>
                  <div className="row between" style={{ alignItems: 'center' }}>
                    <span className="chip chip-code">{MFR_CATS[m.id] || '—'}</span>
                    <div className="row gap8">
                      <button
                        className={'nb-fav' + (shortlist.includes(m.id) ? ' is-on' : '')}
                        title={shortlist.includes(m.id) ? 'В проекте' : 'Добавить в проект'}
                        onClick={(e) => { e.stopPropagation(); toggleShortlist(m.id, m.name); }}
                      >
                        <Icon name="star" size={16} />
                      </button>
                      <span className="ai-sol__more">Открыть <Icon name="arrowRight" size={14} /></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="nb-empty">Ничего не найдено. Измените запрос или категорию.</div>
          )}
        </div>
      )}

      {/* ===================== ВКЛАДКА: BIM-МОДЕЛИ ===================== */}
      {tab === 'bim' && (
        <div className="ai-tabwrap">
          <div className="row between gap16 wrap" style={{ margin: '18px 0 16px', alignItems: 'center' }}>
            <div className="topbar__search" style={{ maxWidth: 360, height: 44 }}>
              <Icon name="search" />
              <input placeholder="Поиск модели или спецификации…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <span className="dim" style={{ fontSize: 13 }}>Найдено: {bims.length}</span>
          </div>
          <div className="chips" style={{ marginBottom: 20 }}>
            {B_CATS.map((c) => <button key={c} className={'pill' + (c === bCat ? ' is-active' : '')} onClick={() => setBCat(c)}>{c}</button>)}
          </div>
          {bims.length ? (
            <div className="ai-grid">
              {bims.map((b) => (
                <div key={b.n} className="ai-file">
                  <div className="ai-file__ic"><Icon name={b.ic} size={18} /></div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.n}</div>
                    <div className="dim" style={{ fontSize: 12 }}>{b.fmt} · {b.size} · {b.cat}</div>
                  </div>
                  <button className="iconbtn" style={{ width: 34, height: 34, flex: 'none' }} title="Скачать" onClick={() => notify('Скачивание BIM — в разработке')}><Icon name="download" size={16} /></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="nb-empty">Ничего не найдено.</div>
          )}

          <div className="nb-filters" style={{ marginTop: 22 }}>
            <button className="pill" onClick={() => setSectionFilter('')}>
              <span className="nb-pill-st"><Icon name="layers" size={14} /> Раздел: {sectionFilter || 'все'}</span>
            </button>
            {SECTION_FILTERS.map((sec) => (
              <button key={sec} className={'pill' + (sectionFilter === sec ? ' is-active' : '')} onClick={() => setSectionFilter(sectionFilter === sec ? '' : sec)}>{sec}</button>
            ))}
          </div>
        </div>
      )}

      {/* ===================== Slide-over: КАРТОЧКА ПРОИЗВОДИТЕЛЯ ===================== */}
      {selectedMfr && (() => {
        const m = selectedMfr;
        const cat = MFR_CATS[m.id] || '—';
        const sols = MOCK_MANUFACTURER_PRODUCTS.flatMap((p) => productSolutions(p)).slice(0, 3);
        return (
          <div className="solm" onClick={() => setSelectedMfr(null)}>
            <div className="solm__panel" onClick={(e) => e.stopPropagation()}>
              <button className="solm__close" onClick={() => setSelectedMfr(null)} aria-label="Закрыть"><Icon name="x" size={18} /></button>
              <div className="solm__head">
                <div className="row gap14" style={{ alignItems: 'center' }}>
                  <div className="manuf__logo" style={{ width: 52, height: 52, flex: 'none', ...grad(...mfrGrad(m.id)) }}><Icon name="factory" size={24} /></div>
                  <div style={{ minWidth: 0 }}>
                    <h2 className="solm__title" style={{ margin: 0 }}>{m.name}</h2>
                    <div className="row gap10 dim" style={{ fontSize: 13, marginTop: 5, flexWrap: 'wrap' }}>
                      <span className="row gap5"><Icon name="star" size={13} style={{ color: 'var(--amber)' }} />{m.rating}</span>
                      {m.deliveryRegion && <span className="row gap5"><Icon name="pin" size={13} />{m.deliveryRegion}</span>}
                      <span className="row gap5"><Icon name="portfolio" size={13} />{m.projectsCount} проектов</span>
                    </div>
                  </div>
                </div>
                <div className="chips" style={{ marginTop: 14 }}>
                  <span className="chip chip-code">{cat}</span>
                  {m.tags.map((t, i) => <span key={i} className="chip">{t}</span>)}
                </div>
              </div>

              <div className="solm__body">
                <div className="solm__sec">
                  <h4 className="solm__h">О производителе</h4>
                  <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>{m.description}</p>
                </div>

                {(m.website || m.email || m.phone) && (
                  <div className="solm__sec">
                    <h4 className="solm__h">Контакты</h4>
                    <div className="col gap10 muted" style={{ fontSize: 13.5 }}>
                      {m.website && <span className="row gap8"><Icon name="globe" size={15} style={{ color: 'var(--accent-2)' }} /><a className="link" href={`https://${m.website}`} target="_blank" rel="noreferrer">{m.website}</a></span>}
                      {m.email && <span className="row gap8"><Icon name="mail" size={15} style={{ color: 'var(--accent-2)' }} /><a className="link" href={`mailto:${m.email}`}>{m.email}</a></span>}
                      {m.phone && <span className="row gap8"><Icon name="phone" size={15} style={{ color: 'var(--accent-2)' }} /><a className="link" href={`tel:${m.phone}`}>{m.phone}</a></span>}
                    </div>
                  </div>
                )}

                <div className="solm__sec">
                  <h4 className="solm__h">Каталог решений ({MOCK_MANUFACTURER_PRODUCTS.length})</h4>
                  <div className="col gap8">
                    {MOCK_MANUFACTURER_PRODUCTS.map((prod) => (
                      <div key={prod.id} className="ai-file">
                        <div className="ai-file__ic"><Icon name="box" size={16} /></div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{prod.name}</div>
                          <div className="dim" style={{ fontSize: 12 }}>{prod.subtitle}{prod.spec ? ' · ' + prod.spec : ''}{prod.certCount ? ' · сертификатов: ' + prod.certCount : ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="solm__sec">
                  <h4 className="solm__h">Релевантность решений</h4>
                  <SolChart sols={sols} themeKey={m.id} onPick={() => notify('Подробная карточка решения — в разработке')} />
                </div>
              </div>

              <div className="solm__foot">
                <button className="btn btn-ghost" onClick={() => setSelectedMfr(null)}>Закрыть</button>
                <div className="row gap8">
                  <button className="btn btn-ghost" onClick={() => toggleShortlist(m.id, m.name)}>
                    <Icon name="star" size={15} /> {shortlist.includes(m.id) ? 'В проекте' : 'Добавить в проект'}
                  </button>
                  <button className="btn btn-primary" onClick={() => notify('Сообщения — в разработке')}><Icon name="chat" size={15} /> Связаться</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
