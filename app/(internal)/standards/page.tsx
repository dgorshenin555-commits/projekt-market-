// @ts-nocheck
'use client';

/* Нормативная база — ИИ-хаб (перенос Standards из Cloud Design «Функция»):
   nb-hero + ИИ-поиск, библиотека-сетка, разбор задачи и выезжающая панель документа.
   Реальные данные сохранены: MOCK_STANDARDS / MOCK_RECENT_CHANGES / MOCK_FAVORITES.
   Логика сохранена: useApp().notify, избранное из isFeatured, toggleFavorite, copyCode,
   фильтры по типу/статусу, поиск по коду/названию.
   ИИ-«разбор задачи», скоринг и подсветка — презентационные поверх реальных данных:
   области применения, ключевые пункты, связи и теги дополняют реальную модель,
   но НЕ меняют её (StandardDocument остаётся как есть). */

import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { MOCK_STANDARDS, MOCK_RECENT_CHANGES, MOCK_FAVORITES } from '@/lib/mock-data';
import { useApp } from '@/lib/store';
import { Icon } from '../../_orders/icons';
import '../../_orders/orders.css';

/* ---------- статусы (реальная модель ↔ дизайн-токены) ---------- */
// StandardDocument.status: 'Актуален' | 'Устарел' | 'Отменён'.
const STATUS = {
  'Актуален': { key: 'ok', label: 'Действует', color: 'var(--green)' },
  'Устарел': { key: 'old', label: 'Устарел', color: 'var(--amber)' },
  'Отменён': { key: 'replaced', label: 'Заменён', color: 'var(--red)' },
};
const statusOf = (d) => STATUS[d.status] || STATUS['Актуален'];

const TYPES = ['Все', 'ГОСТ', 'СП', 'СНиП', 'ТУ', 'ISO'];

/* ---------- дисциплины / разделы проекта (для группировки библиотеки) ----------
   Покрывают все теги, которые выдаёт SECTION_TAG для реальных документов. */
const DISC = {
  'ПЗ': 'Пояснительная записка',
  'АР': 'Архитектурные решения',
  'КР': 'Конструктивные решения',
  'ОВ': 'Отопление и вентиляция',
  'ВК': 'Водоснабжение и канализация',
  'ЭОМ': 'Электроснабжение и электрооборудование',
  'АК': 'Автоматизация и АСУ ТП',
  'ТХ': 'Технологические решения',
};
const DISC_ORDER = ['ПЗ', 'АР', 'КР', 'ОВ', 'ВК', 'ЭОМ', 'АК', 'ТХ'];
const SECTION_NAMES = DISC;

/* ---------- виды библиотеки (CHANGELOG 3.5 — настройка представления) ---------- */
const LIB_VIEWS = [
  { key: 'cards', label: 'Карточки', icon: 'grid' },
  { key: 'disc', label: 'Дисциплины', icon: 'columns' },
  { key: 'table', label: 'Таблица', icon: 'file' },
];

/* ---------- презентационное обогащение реальных документов ----------
   Тексты «области применения», «ключевые пункты», связанные документы и теги —
   справочно-демонстрационные. Они НЕ входят в модель данных, а вычисляются
   поверх реального MOCK_STANDARDS, поэтому не ломают типы и хранилище. */
const SCOPE_BY_SECTION = {
  'Общие положения': 'Состав, оформление и правила внесения изменений в проектную и рабочую документацию: обозначения, основные надписи, общие данные.',
  'АСУ ТП': 'Требования к автоматизированным системам управления технологическими процессами: структура, виды обеспечения, стадии создания.',
  'Автоматизация': 'Условные обозначения и правила выполнения чертежей автоматизации технологических процессов.',
  'Отопление': 'Проектирование систем отопления, вентиляции и кондиционирования: параметры микроклимата, воздухообмен, противодымная защита.',
  'Водоснабжение': 'Проектирование наружных сетей и сооружений водоснабжения: расчётные расходы, напоры, материалы труб, зоны санитарной охраны.',
  'Системы менеджмента': 'Требования к системам менеджмента качества организации: процессный подход, риск-ориентированное мышление, постоянное улучшение.',
  'Нефть и газ': 'Требования к продукции и процессам нефтегазовой отрасли: показатели качества, методы контроля и испытаний.',
  'Тепловая изоляция': 'Требования к тепловой защите ограждающих конструкций: нормируемые сопротивления теплопередаче, защита от переувлажнения.',
};
const POINTS_BY_SECTION = {
  'Общие положения': [
    ['п. 4.2', 'Обозначения разделов проектной и марок рабочей документации'],
    ['п. 5.2', 'Состав общих данных по рабочим чертежам'],
    ['разд. 7', 'Правила внесения изменений в выданную документацию'],
  ],
  'АСУ ТП': [
    ['разд. 4', 'Виды обеспечения автоматизированной системы'],
    ['разд. 6', 'Стадии и этапы создания АСУ ТП'],
  ],
  'Автоматизация': [
    ['разд. 5', 'Условные графические обозначения приборов и средств автоматизации'],
    ['разд. 7', 'Правила выполнения схем автоматизации'],
  ],
  'Отопление': [
    ['п. 5.1', 'Расчётные параметры микроклимата помещений в холодный период года'],
    ['п. 7.1', 'Минимальный расход наружного воздуха на одного человека'],
    ['прил. К', 'Нормы воздухообмена по типам помещений'],
  ],
  'Водоснабжение': [
    ['п. 5.2', 'Удельное среднесуточное водопотребление на одного жителя'],
    ['п. 8.2', 'Минимальный свободный напор в сети при максимальном водоразборе'],
    ['разд. 14', 'Зоны санитарной охраны источников и водопроводных сооружений'],
  ],
  'Системы менеджмента': [
    ['разд. 4', 'Среда организации и заинтересованные стороны'],
    ['разд. 8', 'Управление процессами и выпуском продукции'],
  ],
  'Нефть и газ': [
    ['разд. 5', 'Технические требования к продукции'],
    ['разд. 8', 'Методы контроля и приёмки'],
  ],
  'Тепловая изоляция': [
    ['табл. 3', 'Нормируемые значения сопротивления теплопередаче R₀ по типу здания и ГСОП'],
    ['п. 5.7', 'Приведённое сопротивление теплопередаче с учётом теплотехнических неоднородностей'],
    ['прил. Е', 'Проверка на невыпадение конденсата и влагонакопление в конструкции'],
  ],
};
const SECTION_TAG = {
  'Общие положения': ['ПЗ'],
  'АСУ ТП': ['АК', 'ЭОМ'],
  'Автоматизация': ['АК'],
  'Отопление': ['ОВ'],
  'Водоснабжение': ['ВК'],
  'Системы менеджмента': ['ПЗ'],
  'Нефть и газ': ['ТХ'],
  'Тепловая изоляция': ['АР', 'ОВ'],
};

/* Подбор связанных документов: другие документы того же раздела (реальные коды). */
function relatedCodes(doc, all) {
  return all
    .filter((d) => d.section === doc.section && d.code !== doc.code)
    .map((d) => d.code)
    .slice(0, 3);
}

/* Адаптер: реальный StandardDocument → расширенная форма для карточки/строки/панели.
   Реальные поля (code, title, type, section, year, status, updatedYear) сохранены;
   остальное — презентационная «начинка» поверх реальных данных. */
function enrich(doc, all) {
  const sec = SECTION_TAG[doc.section] || [doc.type];
  const upd = doc.updatedYear ? `ред. ${doc.updatedYear}` : `ред. ${doc.year}`;
  return {
    ...doc,
    scope: SCOPE_BY_SECTION[doc.section] || `Документ раздела «${doc.section}». Применяется при проектировании и оформлении соответствующих частей проекта.`,
    points: POINTS_BY_SECTION[doc.section] || [['—', 'Ключевые требования смотрите в актуальной редакции документа']],
    rel: relatedCodes(doc, all),
    sections: sec,
    upd,
    intro: `01.01.${doc.year}`,
    tags: `${doc.section} ${doc.type} ${doc.title}`.toLowerCase(),
  };
}

/* ---------- ИИ-разбор: заготовленные темы (презентационные) ---------- */
const THEMES = [
  {
    re: /отоплен|вентиляц|кондицион|микроклимат|воздухообмен/i,
    parsed: ['Отопление', 'Вентиляция', 'Микроклимат'],
    verdict: 'Параметры микроклимата и воздухообмен задаёт СП 60.13330. Тепловую защиту ограждающих конструкций проверяйте по нормам теплоизоляции.',
    docs: [
      ['СП 60.13330', 'п. 5.1 — расчётные параметры микроклимата; прил. К — нормы воздухообмена'],
      ['ГОСТ-62.3341', 'требования к тепловой изоляции ограждающих конструкций'],
    ],
  },
  {
    re: /водоснабж|водопровод|наружн\S* сет/i,
    parsed: ['Водоснабжение', 'Наружные сети'],
    verdict: 'По наружным сетям водоснабжения смотрите расчётные расходы и напоры. Устаревшие редакции применяйте только при работе с архивными проектами.',
    docs: [
      ['СНиП 2.04', 'расчётные расходы воды и свободные напоры в сети'],
    ],
  },
  {
    re: /асу|автоматизац|управлен/i,
    parsed: ['АСУ ТП', 'Автоматизация'],
    verdict: 'Структуру и стадии создания автоматизированных систем задаёт ГОСТ 34.201. Условные обозначения на чертежах автоматизации — отдельным документом.',
    docs: [
      ['ГОСТ 34.201-2021', 'разд. 4 — виды обеспечения; разд. 6 — стадии создания'],
      ['ГОСТ 21.412-2022', 'условные обозначения средств автоматизации'],
    ],
  },
  {
    re: /документац|оформлен|спдс|штамп|обознач/i,
    parsed: ['Оформление', 'Документация', 'СПДС'],
    verdict: 'Состав и оформление проектной и рабочей документации, основные надписи и правила внесения изменений задаёт ГОСТ 21.602 / ГОСТ 21.1101.',
    docs: [
      ['ГОСТ 21.602-2016', 'п. 4.2 — обозначения разделов; разд. 7 — правила изменений'],
      ['ГОСТ 21.1101', 'основные требования к проектной и рабочей документации'],
    ],
  },
];

const SUGGEST = [
  'Отопление и вентиляция микроклимат',
  'Наружные сети водоснабжения',
  'АСУ ТП и автоматизация',
  'Оформление проектной документации',
];

/* ---------- поиск с подсветкой (презентационный скоринг поверх реальных данных) ---------- */
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const stem = (t) => (/^[а-яё]+$/.test(t) && t.length > 5 ? t.slice(0, t.length - 2) : t);
const getTerms = (q) => q.toLowerCase().split(/[\s,;«»()]+/).filter((t) => t.length > 1).map(stem);

function searchDocs(q, docs) {
  const terms = getTerms(q);
  if (!terms.length) return [];
  const out = [];
  for (const d of docs) {
    const code = d.code.toLowerCase();
    const title = d.title.toLowerCase();
    const body = `${d.scope} ${d.tags} ${d.sections.join(' ')}`.toLowerCase();
    let s = 0;
    for (const t of terms) {
      if (code.includes(t)) s += 6;
      else if (title.includes(t)) s += 3;
      else if (body.includes(t)) s += 1;
    }
    if (s > 0) out.push([s, d]);
  }
  return out.sort((a, b) => b[0] - a[0]).map((x) => x[1]);
}

function Hl({ text, q }) {
  const terms = q ? getTerms(q).map(escRe) : [];
  if (!terms.length) return text;
  const re = new RegExp('(' + terms.join('|') + ')', 'ig');
  const parts = String(text).split(re);
  return parts.map((p, i) => (i % 2 ? <mark key={i} className="nb-hl">{p}</mark> : p));
}

/* ---------- поисковый бокс (паттерн ai-pbox) ---------- */
function NbSearch({ q, setQ, onSubmit, onReset, thinking, compact }) {
  const taRef = useRef(null);
  useLayoutEffect(() => {
    const ta = taRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [q]);
  return (
    <div className={'ai-pbox nb-pbox' + (compact ? ' nb-pbox--compact' : '') + (thinking ? ' is-loading' : '')}>
      <textarea
        ref={taRef}
        className="ai-pbox__ta"
        rows={1}
        value={q}
        placeholder="Номер документа или задача — например, «отопление и вентиляция»…"
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
      <div className="ai-pbox__bar">
        <span className="nb-pbox__hint"><Icon name="spark" size={14} /> ИИ-поиск по базе ГОСТ, СП и СНиП</span>
        <div className="row gap8">
          {q.trim().length > 0 && (
            <button type="button" className="nb-pbox__clear" onClick={onReset}>Сбросить</button>
          )}
          <button
            type="button"
            className={'ai-pbox__send' + (q.trim() ? ' is-on' : '')}
            onClick={() => onSubmit()}
            disabled={thinking}
            aria-label="Найти"
          >
            <Icon name={thinking ? 'scan' : 'search'} size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- блок ИИ-разбора ---------- */
function ThemeBlock({ theme, byCode, onOpen }) {
  return (
    <div className="nb-ai">
      <div className="nb-ai__head">
        <span className="ai-badge"><Icon name="spark" size={13} /> ИИ-разбор задачи</span>
        <div className="chips">{theme.parsed.map((p) => <span key={p} className="chip chip-code">{p}</span>)}</div>
      </div>
      <p className="nb-ai__verdict">{theme.verdict}</p>
      <div className="col gap8">
        {theme.docs.map(([code, why]) => {
          const d = byCode(code);
          const st = d && statusOf(d);
          return (
            <button key={code} type="button" className="nb-ai__doc" onClick={() => d && onOpen(d)}>
              <span className="chip chip-code">{code}</span>
              <span className="nb-ai__why">{why}</span>
              {st && <span className="nb-status" style={{ color: st.color }}><i />{st.label}</span>}
              <Icon name="chevR" size={14} className="nb-ai__go" />
            </button>
          );
        })}
      </div>
      <p className="nb-ai__note">Подбор носит справочный характер — сверяйте пункты с актуальной редакцией документа.</p>
    </div>
  );
}

/* ---------- карточка v2 (сетка) — плотная, структурированная ---------- */
function DocCard({ d, fav, onFav, onOpen }) {
  const st = statusOf(d);
  return (
    <div
      className="card card-hover nb-card2"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }}
    >
      <span className="nb-card__edge" style={{ background: st.color }}></span>
      <div className="nb-card2__top">
        <span className="nb-typetag">{d.type}</span>
        <span className="nb-status" style={{ color: st.color }}><i />{st.label}</span>
        <button className={'nb-fav' + (fav ? ' is-on' : '')} onClick={(e) => { e.stopPropagation(); onFav(); }} title="В избранное"><Icon name="star" size={16} /></button>
      </div>
      <span className="nb-card2__code">{d.code}</span>
      <b className="nb-card2__title">{d.title}</b>
      <div className="nb-card2__meta">
        <div className="chips">{d.sections.map((s) => <span key={s} className="chip chip-code">{s}</span>)}</div>
        <span className="nb-card2__upd">{d.upd}</span>
      </div>
    </div>
  );
}

/* ---------- строка группы (вид «Дисциплины») ---------- */
function GroupRow({ d, fav, onFav, onOpen }) {
  const st = statusOf(d);
  return (
    <div className="nb-grow" onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }}>
      <span className="chip chip-code nb-grow__code">{d.code}</span>
      <span className="nb-grow__title">{d.title}</span>
      <span className="nb-status nb-grow__st" style={{ color: st.color }}><i />{st.label}</span>
      <span className="nb-grow__upd">{d.upd}</span>
      <button className={'nb-fav' + (fav ? ' is-on' : '')} onClick={(e) => { e.stopPropagation(); onFav(); }} title="В избранное"><Icon name="star" size={15} /></button>
      <Icon name="chevR" size={15} className="nb-grow__go" />
    </div>
  );
}

/* ---------- библиотека, сгруппированная по дисциплинам ---------- */
function Grouped({ docs, rowProps }) {
  const groups = DISC_ORDER
    .map((code) => [code, docs.filter((d) => d.sections.includes(code))])
    .filter(([, arr]) => arr.length);
  return (
    <div className="nb-groups">
      {groups.map(([code, arr]) => (
        <details key={code} className="nb-grp" open>
          <summary className="nb-grp__head">
            <Icon name="chevR" size={15} className="nb-grp__caret" />
            <b>{DISC[code]}</b>
            <span className="chip chip-code">{code}</span>
            <span className="nb-grp__n">{arr.length}</span>
          </summary>
          <div className="nb-grp__body">
            {arr.map((d) => <GroupRow key={d.code} {...rowProps(d)} />)}
          </div>
        </details>
      ))}
    </div>
  );
}

/* ---------- библиотека в виде таблицы ---------- */
function TableView({ docs, rowProps }) {
  return (
    <div className="nb-tblwrap">
      <table className="nb-tbl">
        <thead><tr><th>Код</th><th>Документ</th><th>Разделы</th><th>Статус</th><th>Обновлён</th><th></th></tr></thead>
        <tbody>
          {docs.map((d) => {
            const st = statusOf(d);
            const p = rowProps(d);
            return (
              <tr key={d.code} onClick={p.onOpen}>
                <td><span className="chip chip-code">{d.code}</span></td>
                <td className="nb-tbl__title">{d.title}</td>
                <td><div className="chips">{d.sections.map((s) => <span key={s} className="chip chip-code">{s}</span>)}</div></td>
                <td><span className="nb-status" style={{ color: st.color }}><i />{st.label}</span></td>
                <td className="nb-tbl__upd">{d.upd}</td>
                <td><button className={'nb-fav' + (p.fav ? ' is-on' : '')} onClick={(e) => { e.stopPropagation(); p.onFav(); }} title="В избранное"><Icon name="star" size={15} /></button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- строка (результаты поиска) ---------- */
function DocRow({ d, q, fav, onFav, onOpen }) {
  const st = statusOf(d);
  return (
    <div
      className="nb-res"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(); }}
    >
      <span className="nb-res__edge" style={{ background: st.color }}></span>
      <div className="nb-res__main">
        <div className="row gap10 wrap" style={{ marginBottom: 6 }}>
          <span className="chip chip-code"><Hl text={d.code} q={q} /></span>
          <span className="nb-status" style={{ color: st.color }}><i />{st.label}</span>
          <span className="dim" style={{ fontSize: 12 }}>{d.upd}</span>
        </div>
        <b className="nb-res__title"><Hl text={d.title} q={q} /></b>
        <p className="nb-res__scope"><Hl text={d.scope} q={q} /></p>
      </div>
      <div className="nb-res__side">
        <button className={'nb-fav' + (fav ? ' is-on' : '')} onClick={(e) => { e.stopPropagation(); onFav(); }} title="В избранное"><Icon name="star" size={15} /></button>
        <div className="chips nb-res__secs">{d.sections.map((s) => <span key={s} className="chip chip-code">{s}</span>)}</div>
      </div>
    </div>
  );
}

/* ---------- свежие изменения (реальные MOCK_RECENT_CHANGES) ---------- */
function Strip({ changes }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <div className="row gap8" style={{ alignItems: 'baseline', marginBottom: 12 }}>
        <h3 className="section-title" style={{ fontSize: 16, margin: 0 }}>Свежие изменения</h3>
        <span className="dim" style={{ fontSize: 12.5 }}>за неделю</span>
      </div>
      <div className="nb-strip">
        {changes.map((c, i) => (
          <div key={i} className="nb-strip__item">
            <span className="nb-strip__ic"><Icon name="file" size={16} /></span>
            <span className="nb-strip__b">
              <b>{c.code}</b>
              <span className="nb-strip__what">{c.spec}</span>
            </span>
            <span className="nb-strip__when">{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- избранное проектировщика (реальные MOCK_FAVORITES) ---------- */
function FavStrip({ items }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <div className="row gap8" style={{ alignItems: 'baseline', marginBottom: 12 }}>
        <Icon name="star" size={15} style={{ color: 'var(--amber)' }} />
        <h3 className="section-title" style={{ fontSize: 16, margin: 0 }}>Избранное проектировщика</h3>
      </div>
      <div className="nb-strip">
        {items.map((c, i) => (
          <div key={i} className="nb-strip__item">
            <span className="nb-strip__ic"><Icon name="star" size={16} /></span>
            <span className="nb-strip__b">
              <b>{c.code}</b>
              <span className="nb-strip__what">{c.spec}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- панель разбора документа (портал в document.body) ---------- */
function Drawer({ d, q, fav, onFav, onClose, onJump, byCode, onDownload, onCopy, onRead }) {
  const st = statusOf(d);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const isStale = d.status === 'Отменён' || d.status === 'Устарел';
  // Замена — первый связанный действующий документ того же раздела.
  const repl = isStale
    ? d.rel.map(byCode).find((r) => r && r.status === 'Актуален')
    : null;
  return createPortal(
    <div className="fx">
    <div className="nb-drawer" onClick={onClose}>
      <div className="nb-drawer__panel" onClick={(e) => e.stopPropagation()}>
        <div className="nb-drawer__head">
          <div className="row between" style={{ marginBottom: 14 }}>
            <span className="nb-status nb-status--badge" style={{ color: st.color, background: `color-mix(in srgb, ${st.color} 13%, transparent)` }}><i />{st.label}</span>
            <div className="row gap8">
              <button className="iconbtn" style={{ width: 34, height: 34 }} onClick={() => onCopy(d.code)} title="Копировать код" aria-label="Копировать код"><Icon name="copy" size={15} /></button>
              <button className={'nb-fav' + (fav ? ' is-on' : '')} onClick={onFav} title="В избранное"><Icon name="star" size={17} /></button>
              <button className="iconbtn" style={{ width: 34, height: 34 }} onClick={onClose} aria-label="Закрыть"><Icon name="x" size={16} /></button>
            </div>
          </div>
          <h2 className="nb-drawer__code">{d.code}</h2>
          <p className="nb-drawer__title">{d.title}</p>
          <div className="nb-drawer__meta">
            <span><Icon name="file" size={13} /> {d.type}</span>
            <span><Icon name="calendar" size={13} /> введён {d.intro}</span>
            <span><Icon name="clock" size={13} /> {d.upd}</span>
          </div>
        </div>
        <div className="nb-drawer__body">
          {isStale && (
            <div className="nb-alert" style={{ borderColor: `color-mix(in srgb, ${st.color} 35%, transparent)`, background: `color-mix(in srgb, ${st.color} 9%, transparent)` }}>
              <Icon name="shield" size={17} style={{ color: st.color, flex: 'none', marginTop: 1 }} />
              <span className="grow">
                {d.status === 'Отменён' ? 'Документ заменён — для новых проектов не применяется.' : 'Редакция устарела — проверьте требования в актуальном документе.'}
                {repl && <> Действующая редакция — <b>{repl.code}</b>.</>}
              </span>
              {repl && <button className="btn btn-ghost btn-sm" style={{ flex: 'none' }} onClick={() => onJump(repl)}>Открыть</button>}
            </div>
          )}
          <h4 className="nb-drawer__h">Область применения</h4>
          <p className="nb-drawer__scope">{d.scope}</p>
          <h4 className="nb-drawer__h">Ключевые пункты</h4>
          <div className="col gap8">
            {d.points.map(([ref, text]) => (
              <div key={ref + text} className="nb-point">
                <span className="chip chip-code">{ref}</span>
                <span className="nb-point__t"><Hl text={text} q={q} /></span>
              </div>
            ))}
          </div>
          <h4 className="nb-drawer__h">Разделы проекта</h4>
          <div className="chips">{d.sections.map((s) => <span key={s} className="chip chip-code">{s}</span>)}</div>
          {d.rel && d.rel.length > 0 && (
            <>
              <h4 className="nb-drawer__h">Связанные документы</h4>
              <div className="col gap8">
                {d.rel.map((code) => {
                  const r = byCode(code);
                  if (!r) return null;
                  const rst = statusOf(r);
                  return (
                    <button key={code} type="button" className="nb-ai__doc" onClick={() => onJump(r)}>
                      <span className="chip chip-code">{r.code}</span>
                      <span className="nb-ai__why">{r.title}</span>
                      <span className="nb-status" style={{ color: rst.color }}><i />{rst.label}</span>
                      <Icon name="chevR" size={14} className="nb-ai__go" />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div className="nb-drawer__foot">
          <button className="btn btn-primary grow" onClick={onRead}><Icon name="eye" size={15} /> Читать онлайн</button>
          <button className="btn btn-ghost grow" onClick={() => onDownload(d)}><Icon name="download" size={15} /> Скачать PDF</button>
        </div>
      </div>
    </div>
    </div>,
    document.body
  );
}

/* ---------- область чтения документа (полноэкранная, портал в document.body) ---------- */
function Reader({ d, byCode, onClose }) {
  const st = statusOf(d);
  const docRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  // Плавный скролл к секции через контейнер прокрутки (не scrollIntoView).
  const jump = (id) => {
    const c = docRef.current;
    const el = c && c.querySelector('#' + id);
    if (el && c) c.scrollTo({ top: el.offsetTop - 18, behavior: 'smooth' });
  };
  const points = d.points.filter(([ref]) => ref !== '—');
  const isStale = d.status === 'Отменён' || d.status === 'Устарел';
  const repl = isStale
    ? d.rel.map(byCode).find((r) => r && r.status === 'Актуален')
    : null;
  const toc = [['1', 'Область применения'], ['2', 'Нормативные ссылки'], ['3', 'Основные положения'], ['4', 'Применение в проекте']];
  return createPortal(
    <div className="fx">
    <div className="nb-reader">
      <div className="nb-reader__top">
        <button className="nb-reader__back" onClick={onClose}><Icon name="chevR" size={16} style={{ transform: 'rotate(180deg)' }} /> К разбору</button>
        <span className="nb-reader__crumb"><b>{d.code}</b><span className="dim">{d.type}</span></span>
        <div className="row gap8" style={{ marginLeft: 'auto' }}>
          <button className="btn btn-ghost btn-sm"><Icon name="download" size={14} /> PDF</button>
          <button className="iconbtn" style={{ width: 34, height: 34 }} onClick={onClose} aria-label="Закрыть"><Icon name="x" size={16} /></button>
        </div>
      </div>
      <div className="nb-reader__main">
        <aside className="nb-reader__toc">
          <div className="nb-reader__toch">Содержание</div>
          {toc.map(([n, t]) => (
            <button key={n} type="button" className="nb-reader__tocitem" onClick={() => jump('sec' + n)}>
              <span className="nb-reader__tocn">{n}</span>{t}
            </button>
          ))}
          {points.length > 0 && (
            <>
              <div className="nb-reader__toch" style={{ marginTop: 18 }}>Ключевые пункты</div>
              {points.map(([ref]) => (
                <button key={ref} type="button" className="nb-reader__tocitem nb-reader__tocsub" onClick={() => jump('sec3')}>
                  <span className="nb-reader__tocn">§</span>{ref}
                </button>
              ))}
            </>
          )}
        </aside>
        <div className="nb-reader__scroll" ref={docRef}>
          <article className="nb-reader__doc">
            <div className="nb-reader__dochead">
              <span className="nb-status nb-status--badge" style={{ color: st.color, background: `color-mix(in srgb, ${st.color} 13%, transparent)` }}><i />{st.label}</span>
              <div className="nb-reader__code">{d.code}</div>
              <h1 className="nb-reader__title">{d.title}</h1>
              <div className="nb-reader__meta">{d.type} · введён в действие {d.intro} · {d.upd}</div>
            </div>
            {isStale && (
              <div className="nb-alert nb-reader__alert" style={{ borderColor: `color-mix(in srgb, ${st.color} 35%, transparent)`, background: `color-mix(in srgb, ${st.color} 9%, transparent)` }}>
                <Icon name="shield" size={17} style={{ color: st.color, flex: 'none', marginTop: 1 }} />
                <span>{d.status === 'Отменён' ? 'Документ заменён — для новых проектов не применяется.' : 'Редакция устарела — сверьтесь с актуальной редакцией.'}{repl && <> Действующая редакция — <b>{repl.code}</b>.</>}</span>
              </div>
            )}
            <section id="sec1" className="nb-reader__sec">
              <h2><span className="nb-reader__secn">1</span>Область применения</h2>
              <p>{d.scope}</p>
              <p>Требования настоящего документа применяются при проектировании новых и реконструируемых объектов капитального строительства и распространяются на разделы {d.sections.map((s) => SECTION_NAMES[s] || s).join(', ')}.</p>
            </section>
            <section id="sec2" className="nb-reader__sec">
              <h2><span className="nb-reader__secn">2</span>Нормативные ссылки</h2>
              {d.rel && d.rel.length > 0 ? (
                <>
                  <p>В настоящем документе использованы нормативные ссылки на следующие документы:</p>
                  <ul className="nb-reader__refs">
                    {d.rel.map((c) => { const r = byCode(c); return <li key={c}><b>{c}</b>{r ? ' — ' + r.title : ''}</li>; })}
                  </ul>
                </>
              ) : (
                <p className="dim">Прямые нормативные ссылки отсутствуют.</p>
              )}
            </section>
            <section id="sec3" className="nb-reader__sec">
              <h2><span className="nb-reader__secn">3</span>Основные положения</h2>
              {points.length > 0 ? (
                points.map(([ref, text]) => (
                  <div key={ref} className="nb-reader__clause">
                    <span className="nb-reader__cnum">{ref}</span>
                    <p>{text}.</p>
                  </div>
                ))
              ) : (
                <p className="dim">Документ сохранён в базе для работы с архивными проектами.</p>
              )}
            </section>
            <section id="sec4" className="nb-reader__sec">
              <h2><span className="nb-reader__secn">4</span>Применение в проекте</h2>
              <p>Документ используется при разработке разделов проектной документации:</p>
              <div className="chips" style={{ marginTop: 4 }}>{d.sections.map((s) => <span key={s} className="chip chip-code">{s}</span>)}</div>
            </section>
            <div className="nb-reader__end">Текст приведён в справочном виде. Полная редакция — в официальном издании {d.code}.</div>
          </article>
        </div>
      </div>
    </div>
    </div>,
    document.body
  );
}

/* ---------- фильтры (тип / статус / избранное) ---------- */
function FiltersRow({ type, setType, status, setStatus, onlyFav, setOnlyFav }) {
  return (
    <div className="nb-filters">
      <div className="row gap8">
        {TYPES.map((tp) => (
          <button key={tp} className={'pill' + (tp === type ? ' is-active' : '')} onClick={() => setType(tp)}>{tp}</button>
        ))}
      </div>
      <span className="nb-sep"></span>
      <div className="row gap8">
        {Object.entries(STATUS).map(([k, s]) => (
          <button key={k} className={'pill nb-pill-st' + (status === k ? ' is-active' : '')} onClick={() => setStatus(status === k ? '' : k)}>
            <i style={{ background: s.color }} />{s.label}
          </button>
        ))}
      </div>
      <div className="grow"></div>
      <button className={'pill nb-pill-st' + (onlyFav ? ' is-active' : '')} onClick={() => setOnlyFav(!onlyFav)}>
        <Icon name="star" size={13} /> Избранное
      </button>
    </div>
  );
}

export default function StandardsPage() {
  const { notify, favoriteStandards, toggleFavoriteStandard } = useApp();

  // Реальные документы + презентационное обогащение (реальные поля сохранены).
  const docs = useMemo(() => MOCK_STANDARDS.map((d) => enrich(d, MOCK_STANDARDS)), []);
  const byCode = useMemo(() => {
    const map = new Map(docs.map((d) => [d.code, d]));
    return (code) => map.get(code);
  }, [docs]);

  const [q, setQ] = useState('');
  const [asked, setAsked] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [open, setOpen] = useState(null);
  const [reading, setReading] = useState(null); // открытый Reader (полноэкранное чтение)

  const favorites = new Set(favoriteStandards);
  const toggleFavorite = toggleFavoriteStandard;

  const [type, setType] = useState('Все');
  const [status, setStatus] = useState(''); // '' = все статусы
  const [onlyFav, setOnlyFav] = useState(false);
  const [libView, setLibView] = useState('cards'); // вид библиотеки: cards | disc | table

  const searching = q.trim().length > 1;
  const results = useMemo(() => (searching ? searchDocs(q, docs) : []), [q, searching, docs]);
  const theme = asked && asked === q.trim() && !thinking ? THEMES.find((t) => t.re.test(asked)) : null;

  const submit = (text) => {
    const v = (text != null ? text : q).trim();
    if (!v) return;
    setQ(v);
    setAsked(v);
    setThinking(true);
    setTimeout(() => setThinking(false), 700);
  };
  const reset = () => {
    setQ('');
    setAsked(null);
  };

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    notify('Код скопирован: ' + code);
  };

  const downloadDoc = () => notify('Скачивание PDF появится в ближайшем обновлении');

  // Фильтрация библиотеки по реальным полям type/status + избранное.
  const filtered = docs.filter(
    (d) =>
      (type === 'Все' || d.type === type) &&
      (status === '' || d.status === status) &&
      (!onlyFav || favorites.has(d.code))
  );

  const rowProps = (d) => ({
    d,
    fav: favorites.has(d.code),
    onFav: () => toggleFavorite(d.code),
    onOpen: () => setOpen(d),
  });

  // Рендер библиотеки по выбранному виду (CHANGELOG 3.5 — настройка представления).
  const renderLib = (items) => {
    if (!items.length) {
      return <div className="nb-empty">Под выбранные фильтры ничего не попало — сбросьте часть условий.</div>;
    }
    if (libView === 'table') return <TableView docs={items} rowProps={rowProps} />;
    if (libView === 'disc') return <Grouped docs={items} rowProps={rowProps} />;
    return <div className="nb-grid">{items.map((d) => <DocCard key={d.code} {...rowProps(d)} />)}</div>;
  };

  const pills = (
    <div className="ai-pills nb-sugg nb-pills">
      {SUGGEST.map((s) => (
        <button
          key={s}
          type="button"
          className={'ai-pill' + (asked === s && q === s ? ' is-on' : '')}
          onClick={() => submit(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );

  const drawer = open && (
    <Drawer
      d={open}
      q={searching ? q : ''}
      fav={favorites.has(open.code)}
      onFav={() => toggleFavorite(open.code)}
      onClose={() => setOpen(null)}
      onJump={(r) => setOpen(r)}
      byCode={byCode}
      onDownload={downloadDoc}
      onCopy={copyCode}
      onRead={() => setReading(open)}
    />
  );
  const reader = reading && <Reader d={reading} byCode={byCode} onClose={() => setReading(null)} />;

  return (
    <div className="fx animate-in">
      <div className="nb-hero">
        <div className="ai-glow" aria-hidden="true"></div>
        <span className="ai-badge"><Icon name="spark" size={13} /> Нормативная база</span>
        <h1 className="cat-title" style={{ fontSize: 36 }}>Найдите норматив — по номеру или задаче</h1>
        <p className="cat-lead" style={{ maxWidth: 560 }}>
          ГОСТ, СП и СНиП с привязкой к разделам проекта. Опишите задачу — подберём применимые документы и нужные пункты.
        </p>
        <NbSearch q={q} setQ={setQ} onSubmit={submit} onReset={reset} thinking={thinking} />
        {pills}
      </div>

      {searching ? (
        <div className={thinking ? 'nb-dim' : ''}>
          {theme && <ThemeBlock theme={theme} byCode={byCode} onOpen={setOpen} />}
          <div className="row between" style={{ marginBottom: 12 }}>
            <h3 className="section-title" style={{ fontSize: 16, margin: 0 }}>
              {results.length ? 'Документы — ' + results.length : 'Ничего не найдено'}
            </h3>
            <a className="link" style={{ fontSize: 13 }} onClick={reset}>Сбросить поиск</a>
          </div>
          {results.length ? (
            <div className="col gap10">
              {results.map((d) => <DocRow key={d.code} q={q} {...rowProps(d)} />)}
            </div>
          ) : (
            <div className="nb-empty">По запросу ничего не нашлось. Попробуйте номер документа («ГОСТ 21.602») или другую формулировку.</div>
          )}
        </div>
      ) : (
        <>
          <Strip changes={MOCK_RECENT_CHANGES} />
          <FavStrip items={MOCK_FAVORITES} />
          <div className="row between" style={{ margin: '0 0 14px', alignItems: 'baseline' }}>
            <div className="row gap8" style={{ alignItems: 'baseline' }}>
              <h3 className="section-title" style={{ fontSize: 16, margin: 0 }}>Библиотека</h3>
              <span className="dim" style={{ fontSize: 12.5 }}>{filtered.length} из {docs.length}</span>
            </div>
            <div className="nb-viewsw">
              {LIB_VIEWS.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  className={libView === v.key ? 'is-on' : ''}
                  onClick={() => setLibView(v.key)}
                >
                  <Icon name={v.icon} size={14} /> {v.label}
                </button>
              ))}
            </div>
          </div>
          <FiltersRow
            type={type}
            setType={setType}
            status={status}
            setStatus={setStatus}
            onlyFav={onlyFav}
            setOnlyFav={setOnlyFav}
          />
          {renderLib(filtered)}
        </>
      )}

      {drawer}
      {reader}
    </div>
  );
}
