// @ts-nocheck
'use client';

import { useState, useEffect, useRef, useLayoutEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MOCK_DESIGNERS, MOCK_PROJECTS } from '@/lib/mock-data';
import { Designer } from '@/lib/types';
import { REGIONS, STAGE_P_CAPITAL, STAGE_P_LINEAR, STAGE_RD_GROUPS } from '@/lib/constants';
import { useApp } from '@/lib/store';
import { Icon } from '../../_orders/icons';
import '../../_orders/orders.css';

const SECTION_FILTERS = ['АР', 'КР', 'ЭОМ', 'ВК', 'ОВиК', 'ГС', 'ТХ', 'ПБ', 'СС'];

const SHORTLIST_KEY = 'pm_shortlist';

const AVATAR_COLORS = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#a18cd1', '#fbc2eb'],
  ['#ffecd2', '#fcb69f'],
  ['#89f7fe', '#66a6ff'],
];

// Минимальный рейтинг (RateScale).
const RATE_STEPS: [string, number, string][] = [
  ['Любой', 0, '#9ca3af'],
  ['4.0+', 4.0, '#f5b13d'],
  ['4.5+', 4.5, '#facc15'],
  ['4.8+', 4.8, '#34d399'],
];

// Быстрые подсказки-фильтры (CatHints).
const HINTS: [string, string, (d: Designer) => boolean][] = [
  ['pin', 'КР в Москве', (d) => d.sections.includes('КР') && d.city === 'Москва'],
  ['compass', 'АР в Петербурге', (d) => d.sections.includes('АР') && d.city === 'Санкт-Петербург'],
  ['building', 'Только организации', (d) => d.type === 'company'],
  ['portfolio', '50+ проектов', (d) => d.projectsCount >= 50],
];

// Уникальные разделы (защита от дублей в данных — BUG-014).
function uniqueSections(sections: string[]): string[] {
  return Array.from(new Set(sections));
}

// Сопоставляем имя специальности (из заявки, ?spec=Архитектор) с кодом раздела
// каталога (АР, КР, …). Если значение само является кодом раздела — возвращаем его.
function resolveSpecToSection(spec: string): string | null {
  const trimmed = spec.trim();
  if (!trimmed) return null;

  // Уже код раздела, который умеет фильтровать каталог.
  const directCode = SECTION_FILTERS.find((s) => s.toLowerCase() === trimmed.toLowerCase());
  if (directCode) return directCode;

  // Ищем код раздела по имени специалиста в справочнике разделов.
  const allSections = [
    ...STAGE_P_CAPITAL,
    ...STAGE_P_LINEAR,
    ...STAGE_RD_GROUPS.flatMap((g) => g.sections),
  ];
  const target = trimmed.toLowerCase();
  const match = allSections.find((sec) =>
    sec.specialists.some((sp) => sp.toLowerCase().includes(target) || target.includes(sp.toLowerCase()))
  );
  if (match && SECTION_FILTERS.includes(match.code)) return match.code;

  return null;
}

// Градиент аватара по индексу проектировщика в наборе MOCK_DESIGNERS.
function gradOf(designer: Designer): [string, string] {
  const idx = MOCK_DESIGNERS.indexOf(designer);
  return AVATAR_COLORS[(idx >= 0 ? idx : 0) % AVATAR_COLORS.length];
}

// ============ Инлайн-компоненты Cloud Design ============

function PhotoAva({ designer, size = 44, ring = true, dot }: any) {
  const g = gradOf(designer);
  const initials =
    designer.type === 'company'
      ? designer.name.replace(/[^А-ЯA-Z]/g, '').slice(0, 2) || 'ОО'
      : designer.name.replace(/[^А-ЯA-Z]/gi, '').slice(0, 2).toUpperCase();
  return (
    <span
      className={'tl-avatar' + (ring ? ' tl-avatar--ring' : '')}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`,
      }}
    >
      <span className="tl-avatar__fb">{initials}</span>
      {dot && <span className="tl-avatar__dot" />}
    </span>
  );
}

function Stars({ v }: any) {
  return (
    <span className="row gap6" style={{ fontSize: 13.5, color: 'var(--text-dim)' }}>
      <Icon name="star" size={14} style={{ color: 'var(--amber)' }} />
      {v}
    </span>
  );
}

function RateScale({ value, onPick }: any) {
  return (
    <div className="ratescale" title="Минимальный рейтинг">
      {RATE_STEPS.map(([label, v, c]) => (
        <button
          key={label}
          className={value === v ? 'is-on' : ''}
          style={{ '--dot': c } as any}
          onClick={() => onPick(v)}
        >
          <i />
          {label}
        </button>
      ))}
    </div>
  );
}

function CatHints({ active, onPick }: any) {
  return (
    <div className="cat-hints">
      {HINTS.map(([ic, label], i) => (
        <button
          key={label}
          className={'cat-hint' + (active === i ? ' is-on' : '')}
          onClick={() => onPick(active === i ? null : i)}
        >
          <Icon name={ic} size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}

// Стилизованная textarea-поиск, привязанная к существующему состоянию поиска.
function PromptSearch({ value, onChange, placeholder }: any) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [value]);

  const has = (value || '').trim().length > 0 || files.length > 0;
  const submit = () => {
    if (!has || loading) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 1400);
  };
  const addFiles = (e: any) => {
    const list = Array.from(e.target.files || []) as File[];
    if (list.length) setFiles((p) => [...p, ...list]);
    e.target.value = '';
  };
  const removeFile = (i: number) => setFiles((p) => p.filter((_, idx) => idx !== i));

  return (
    <div className="psearch">
      {files.length > 0 && (
        <div className="psearch__files">
          {files.map((f, i) => (
            <span key={i} className="psearch__file">
              <Icon name="paperclip" />
              <b>{f.name}</b>
              <button onClick={() => removeFile(i)} aria-label="Убрать">
                <Icon name="x" size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
      <textarea
        ref={taRef}
        rows={1}
        className="psearch__ta"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Опишите, какой специалист нужен — раздел, регион, опыт…'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <div className="psearch__bar">
        <label className="psearch__act psearch__attach" data-tip="Прикрепить файлы">
          <input ref={fileRef} type="file" multiple hidden onChange={addFiles} />
          <Icon name="paperclip" />
        </label>
        <span className="psearch__spacer" />
        <button
          className={'psearch__act psearch__send' + (has ? ' is-on' : '')}
          disabled={!has}
          data-tip={loading ? 'Остановить' : 'Найти'}
          onClick={submit}
          aria-label="Найти"
        >
          {loading ? <span className="psearch__sq" /> : <Icon name="send" />}
        </button>
      </div>
    </div>
  );
}

function FilterPills({ regionFilter, setRegionFilter, sectionFilter, setSectionFilter, sroOnly, setSroOnly, notify }: any) {
  return (
    <>
      <label className={'pill' + (regionFilter ? ' is-active' : '')} style={{ position: 'relative', cursor: 'pointer' }}>
        <Icon name="pin" />
        {regionFilter || 'Регион'}
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
        >
          <option value="">Регион</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <label className={'pill' + (sectionFilter ? ' is-active' : '')} style={{ position: 'relative', cursor: 'pointer' }}>
        <Icon name="layers" />
        {sectionFilter || 'Раздел'}
        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
        >
          <option value="">Раздел</option>
          {SECTION_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <button className={'pill' + (sroOnly ? ' is-active' : '')} onClick={() => setSroOnly((v: boolean) => !v)}>
        <Icon name="building" />
        СРО
      </button>
      <button className="pill" onClick={() => notify('Расширенные фильтры — в разработке')}>
        <Icon name="filter" />
        Фильтры
      </button>
    </>
  );
}

function PersonCard({ designer, onSelect, onProfile, onShortlist, inShortlist }: any) {
  return (
    <div
      className={'card card-hover personcard' + (designer.featured ? ' is-featured' : '')}
      onClick={onSelect}
    >
      <div className="row gap12" style={{ marginBottom: 14 }}>
        <PhotoAva designer={designer} dot={designer.type === 'person'} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{designer.name}</div>
          <div className="chips" style={{ marginTop: 6 }}>
            {uniqueSections(designer.sections).map((c) => (
              <span key={c} className="chip chip-code">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="col gap8 muted" style={{ fontSize: 13.5, marginBottom: 14 }}>
        <span className="row gap6">
          <Icon name="pin" size={14} />
          {designer.city}
        </span>
        {designer.sroNumber && (
          <span className="row gap6">
            <Icon name="building" size={14} />
            {designer.sroNumber}
          </span>
        )}
        <span className="row gap16">
          <span className="row gap6"><Stars v={designer.rating} /> <b style={{ color: '#fff' }}>{designer.rating}</b></span>
          <span className="row gap6">
            <Icon name="portfolio" size={14} />
            {designer.projectsCount} проектов
          </span>
        </span>
      </div>
      <div className="row gap8">
        <button
          className="btn btn-ghost btn-sm grow"
          onClick={(e) => {
            e.stopPropagation();
            onShortlist();
          }}
        >
          {inShortlist ? (
            <>
              В проекте <Icon name="check" size={14} />
            </>
          ) : (
            <>
              <Icon name="plus" size={14} /> В проект
            </>
          )}
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onProfile();
          }}
        >
          Профиль <Icon name="arrowRight" size={14} />
        </button>
      </div>
    </div>
  );
}

function DesignersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notify } = useApp();
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [rateFilter, setRateFilter] = useState(0);
  const [hint, setHint] = useState<number | null>(null);
  const [sroOnly, setSroOnly] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState<Designer | null>(MOCK_DESIGNERS[1]);
  const [shortlist, setShortlist] = useState<string[]>([]);

  // Предзаполнение фильтра/поиска из ?spec=… (BUG-012).
  const specParam = searchParams.get('spec');
  useEffect(() => {
    if (!specParam) return;
    const section = resolveSpecToSection(specParam);
    if (section) {
      setSectionFilter(section);
    } else {
      // Точного маппинга нет — кладём значение в строку поиска.
      setSearch(specParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specParam]);

  // Инициализация шортлиста из localStorage (BUG-016) — в useEffect, чтобы не было SSR-mismatch.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = JSON.parse(localStorage.getItem(SHORTLIST_KEY) || '[]');
      if (Array.isArray(saved)) setShortlist(saved.filter((x): x is string => typeof x === 'string'));
    } catch {}
  }, []);

  const toggleShortlist = (id: string) => {
    setShortlist((prev) => {
      const inList = prev.includes(id);
      const next = inList ? prev.filter((x) => x !== id) : [...prev, id];
      if (typeof window !== 'undefined') {
        localStorage.setItem(SHORTLIST_KEY, JSON.stringify(next));
      }
      notify(inList ? 'Убрано из проекта' : 'Добавлено в проект');
      return next;
    });
  };

  const filtered = MOCK_DESIGNERS.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (regionFilter && d.city !== regionFilter) return false;
    if (sectionFilter && !d.sections.includes(sectionFilter)) return false;
    if (sroOnly && !d.sroNumber) return false;
    if (rateFilter && d.rating < rateFilter) return false;
    if (hint != null && !HINTS[hint][2](d)) return false;
    return true;
  });

  const featured = MOCK_DESIGNERS[0]; // Top featured designer

  const resetFilters = () => {
    setSearch('');
    setRegionFilter('');
    setSectionFilter('');
    setRateFilter(0);
    setHint(null);
    setSroOnly(false);
  };

  return (
    <div className="fx animate-in">
      <div className="cat-head">
        <div>
          <p className="cat-eyebrow">Каталог</p>
          <h1 className="cat-title">
            Проектировщики
            <br />и организации
          </h1>
          <p className="cat-lead">
            Верифицированные специалисты и бюро с СРО, рейтингом и портфолио. Подберите исполнителя под раздел, регион и
            бюджет.
          </p>
        </div>
        <div className="cat-head__filters">
          <FilterPills
            regionFilter={regionFilter}
            setRegionFilter={setRegionFilter}
            sectionFilter={sectionFilter}
            setSectionFilter={setSectionFilter}
            sroOnly={sroOnly}
            setSroOnly={setSroOnly}
            notify={notify}
          />
        </div>
      </div>

      <div className="catalog">
        {/* Левая колонка — поиск, подсказки, рейтинг-фильтр, грид */}
        <div className="col gap16" style={{ minWidth: 0 }}>
          <PromptSearch value={search} onChange={setSearch} placeholder="Поиск по специалистам — имя, город…" />
          <CatHints active={hint} onPick={setHint} />
          <div className="row gap12 wrap between">
            <RateScale value={rateFilter} onPick={setRateFilter} />
            <span className="dim" style={{ fontSize: 13 }}>
              Найдено: {filtered.length} из {MOCK_DESIGNERS.length}
            </span>
          </div>

          {filtered.length ? (
            <div className="orders-grid">
              {filtered.map((designer) => (
                <PersonCard
                  key={designer.id}
                  designer={designer === featured ? { ...designer, featured: true } : designer}
                  onSelect={() => setSelectedDesigner(designer)}
                  onProfile={() => router.push(`/designers/${designer.id}`)}
                  onShortlist={() => toggleShortlist(designer.id)}
                  inShortlist={shortlist.includes(designer.id)}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <p className="muted" style={{ margin: '0 0 16px', fontSize: 14.5 }}>
                По заданным условиям никого не нашлось.
              </p>
              <button className="btn btn-outline btn-sm" onClick={resetFilters}>
                Сбросить фильтры
              </button>
            </div>
          )}
        </div>

        {/* Правый сайдбар — spotlight + показатели + последние проекты */}
        <div className="col gap20">
          {selectedDesigner && (
            <div className="card spotlight">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PhotoAva designer={selectedDesigner} size={84} dot={selectedDesigner.type === 'person'} />
              </div>
              <h3 style={{ textAlign: 'center', margin: '16px 0 8px', fontSize: 19 }}>{selectedDesigner.name}</h3>
              <div className="chips" style={{ justifyContent: 'center', marginBottom: 12 }}>
                {uniqueSections(selectedDesigner.sections).map((c) => (
                  <span key={c} className="chip chip-code">
                    {c}
                  </span>
                ))}
              </div>
              <div className="col gap8 muted" style={{ fontSize: 13.5, textAlign: 'center', marginBottom: 16 }}>
                {selectedDesigner.sroNumber && <span>{selectedDesigner.sroNumber}</span>}
                {selectedDesigner.phone && (
                  <span className="row gap6" style={{ justifyContent: 'center' }}>
                    <Icon name="phone" size={14} />
                    {selectedDesigner.phone}
                  </span>
                )}
                {selectedDesigner.email && (
                  <span className="row gap6" style={{ justifyContent: 'center' }}>
                    <Icon name="mail" size={14} />
                    {selectedDesigner.email}
                  </span>
                )}
                <span className="row gap6" style={{ justifyContent: 'center' }}>
                  <Icon name="pin" size={14} />
                  {selectedDesigner.region || selectedDesigner.city}
                </span>
              </div>
              <button className="btn btn-primary btn-block" onClick={() => notify('Сообщения — в разработке')}>
                Связаться
              </button>
            </div>
          )}

          {selectedDesigner && (
            <div className="card">
              <h3 className="row gap8 section-title" style={{ fontSize: 16, marginBottom: 14 }}>
                <Icon name="globe" size={17} style={{ color: 'var(--accent-2)' }} />
                Показатели
              </h3>
              <div className="col gap10 muted" style={{ fontSize: 13.5 }}>
                <span className="row gap6">
                  <Icon name="pin" size={14} />
                  {selectedDesigner.region || selectedDesigner.city}
                </span>
                <span className="row gap16">
                  <Stars v={selectedDesigner.rating} />
                  <span>{selectedDesigner.projectsCount} проектов</span>
                </span>
                {selectedDesigner.yearsExperience && (
                  <span className="row gap8">
                    <Icon name="check" size={14} style={{ color: 'var(--green)' }} />
                    {selectedDesigner.yearsExperience} лет стажа в проектировании
                  </span>
                )}
                {selectedDesigner.sroNumber && (
                  <span className="row gap8">
                    <Icon name="check" size={14} style={{ color: 'var(--green)' }} />
                    {selectedDesigner.sroNumber}
                  </span>
                )}
                {selectedDesigner.achievements?.[0] && (
                  <span className="row gap8">
                    <Icon name="check" size={14} style={{ color: 'var(--green)' }} />
                    {selectedDesigner.achievements[0]}
                  </span>
                )}
              </div>
              <button
                className="btn btn-outline btn-sm btn-block mt16"
                onClick={() => router.push(`/designers/${selectedDesigner.id}`)}
              >
                Открыть профиль
              </button>
            </div>
          )}

          <div className="card">
            <h3 className="section-title" style={{ fontSize: 16, marginBottom: 14 }}>
              Последние проекты
            </h3>
            <div className="grid-2" style={{ gap: 12 }}>
              {MOCK_PROJECTS.map((p) => (
                <div key={p.id}>
                  <div className="thumb thumb-tower" style={{ height: 76 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>{p.title}</div>
                  <div className="dim" style={{ fontSize: 12 }}>
                    {p.location}
                  </div>
                </div>
              ))}
            </div>
            {selectedDesigner && (
              <button
                className="btn btn-outline btn-sm btn-block mt16"
                onClick={() => toggleShortlist(selectedDesigner.id)}
              >
                {shortlist.includes(selectedDesigner.id) ? (
                  <>
                    В проекте <Icon name="check" size={14} />
                  </>
                ) : (
                  <>
                    Добавить в проект <Icon name="arrowRight" size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DesignersPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Загрузка…</div>}>
      <DesignersPageContent />
    </Suspense>
  );
}
