'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MOCK_DESIGNERS, MOCK_PROJECTS } from '@/lib/mock-data';
import { Designer } from '@/lib/types';
import { REGIONS, STAGE_P_CAPITAL, STAGE_P_LINEAR, STAGE_RD_GROUPS } from '@/lib/constants';
import { useApp } from '@/lib/store';
import projBg from '@/public/project-buildings.png';

const TABS = ['Лайтпр', 'Заявки', 'СРО', 'Проекты'];

const SECTION_FILTERS = ['АР', 'КР', 'ЭОМ', 'ВК', 'ОВиК', 'ГС', 'ТХ', 'ПБ', 'СС'];

const SHORTLIST_KEY = 'pm_shortlist';

const AVATAR_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
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

function DesignersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notify } = useApp();
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [activeTab, setActiveTab] = useState('Лайтпр');
  const [viewMode, setViewMode] = useState<'list' | 'compact' | 'cards'>('cards');
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
    return true;
  });

  const featured = MOCK_DESIGNERS[0]; // Top featured designer

  return (
    <div className="animate-in">
      {/* Top filter bar */}
      <div className="dsn-filter-bar">
        <div className="dsn-filter-tabs">
          <button className={`dsn-filter-tab-icon ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="Список">☰</button>
          <button className={`dsn-filter-tab-icon ${viewMode === 'compact' ? 'active' : ''}`} onClick={() => setViewMode('compact')} title="Компактно">📋</button>
          <button className={`dsn-filter-tab-icon ${viewMode === 'cards' ? 'active' : ''}`} onClick={() => setViewMode('cards')} title="Карточки">👤</button>
          <span className="dsn-filter-divider" />
        </div>
        <select className="dsn-filter-chip" value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
          <option value="">📍 Регион</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="dsn-filter-chip" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
          <option value="">📐 Раздел</option>
          {SECTION_FILTERS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className={`dsn-filter-chip ${sroOnly ? 'active' : ''}`} onClick={() => setSroOnly((v) => !v)}>🏛️ СРО</button>
        <button className="dsn-filter-chip" onClick={() => notify('Расширенные фильтры — в разработке')}>⚙ Фильтры</button>
      </div>

      {/* Main content: 3 column layout */}
      <div className="dsn-layout">
        {/* Left column: Title + search + list */}
        <div className="dsn-main">
          <h1 className="dsn-title">Каталог проектировщиков<br />и организаций</h1>

          {/* Search */}
          <div className="dsn-search-wrapper">
            <span className="dsn-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Поиск по специалистам"
              className="dsn-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="dsn-tabs">
            {TABS.map((t) => (
              <button
                key={t}
                className={`dsn-tab ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
              </button>
            ))}
            <button className="dsn-tab" onClick={() => notify('Дополнительные вкладки — в разработке')}>⋯</button>
          </div>

          {/* Featured card */}
          <div className="dsn-featured-card" onClick={() => setSelectedDesigner(featured)}>
            <div className="dsn-featured-avatar">
              <div className="dsn-avatar-circle" style={{ background: AVATAR_COLORS[0] }}>
                {featured.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="dsn-featured-info">
              <div className="dsn-featured-name">{featured.name}</div>
              <div className="dsn-featured-sections">
                {uniqueSections(featured.sections).map((s) => (
                  <span key={s} className="dsn-section-tag">{s}</span>
                ))}
              </div>
              <div className="dsn-featured-city">📍 {featured.city}</div>
              <div className="dsn-featured-sro">🏛️ {featured.sroNumber}</div>
              <div className="dsn-featured-stats">
                <span>⭐ {featured.rating}</span>
                <span>{featured.reviewsLabel}</span>
                <span>📁 {featured.projectsCount} проектов</span>
              </div>
              <div className="dsn-featured-actions">
                <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); router.push(`/designers/${featured.id}`); }}>Открыть профиль</button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => { e.stopPropagation(); toggleShortlist(featured.id); }}
                >
                  {shortlist.includes(featured.id) ? 'В проекте ✓' : 'Добавить в проект →'}
                </button>
              </div>
            </div>
          </div>

          {/* Grid of designer cards */}
          <div className="dsn-grid">
            {filtered.filter(d => d.id !== featured.id).map((designer, idx) => (
              <div
                key={designer.id}
                className={`dsn-card ${selectedDesigner?.id === designer.id ? 'selected' : ''}`}
                onClick={() => setSelectedDesigner(designer)}
              >
                <div className="dsn-card-header">
                  <div className="dsn-card-avatar" style={{ background: AVATAR_COLORS[(idx + 1) % AVATAR_COLORS.length] }}>
                    {designer.type === 'company' ? '🏢' : designer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="dsn-card-header-info">
                    <div className="dsn-card-name">{designer.name}</div>
                    <div className="dsn-card-sections">
                      {uniqueSections(designer.sections).map((s) => (
                        <span key={s} className="dsn-section-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="dsn-card-city">📍 {designer.city}</div>
                {designer.sroNumber && (
                  <div className="dsn-card-sro">
                    <span className="dsn-sro-icon">🏛️</span>
                    {designer.sections[0]} &nbsp;
                    <span className="dsn-sro-number">{designer.sroNumber}</span>
                  </div>
                )}
                <div className="dsn-card-stats">
                  <span>⭐ {designer.rating}</span>
                  <span>{designer.reviewsLabel}</span>
                  <span>📁 {designer.projectsCount} проектов</span>
                </div>
                <div className="dsn-card-actions">
                  <button
                    className="dsn-action-btn ghost"
                    onClick={(e) => { e.stopPropagation(); toggleShortlist(designer.id); }}
                    style={shortlist.includes(designer.id) ? { background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' } : undefined}
                  >
                    {shortlist.includes(designer.id) ? 'В проекте ✓' : '+ В проект'}
                  </button>
                  <button className="dsn-action-btn primary" onClick={(e) => { e.stopPropagation(); router.push(`/designers/${designer.id}`); }}>Профиль →</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="dsn-sidebar">
          {/* Selected designer profile card */}
          {selectedDesigner && (
            <div className="dsn-profile-card">
              <div className="dsn-profile-avatar" style={{ background: AVATAR_COLORS[MOCK_DESIGNERS.indexOf(selectedDesigner) % AVATAR_COLORS.length] }}>
                {selectedDesigner.type === 'company' ? '🏢' : selectedDesigner.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="dsn-profile-name">{selectedDesigner.name}</div>
              <div className="dsn-profile-sections">
                {uniqueSections(selectedDesigner.sections).map((s) => (
                  <span key={s} className="dsn-section-tag accent">{s}</span>
                ))}
              </div>
              <div className="dsn-profile-sro">{selectedDesigner.sroNumber}</div>
              {selectedDesigner.phone && (
                <div className="dsn-profile-detail">📞 {selectedDesigner.phone}</div>
              )}
              {selectedDesigner.region && (
                <div className="dsn-profile-detail">📍 {selectedDesigner.region}</div>
              )}
              {selectedDesigner.email && (
                <div className="dsn-profile-detail">✉️ {selectedDesigner.email}</div>
              )}
              <button className="btn btn-accent btn-block dsn-contact-btn" onClick={() => notify('Сообщения — в разработке')}>Связаться</button>
            </div>
          )}

          {/* Region / stats info card — данные согласованы с выбранным проектировщиком (BUG-015/018) */}
          {selectedDesigner && (
            <div className="dsn-region-card">
              <div className="dsn-region-header">
                <span className="dsn-region-icon">🌐</span>
                <span className="dsn-region-title">Показатели</span>
              </div>
              <div className="dsn-region-detail">
                <span>📍 {selectedDesigner.region || selectedDesigner.city}</span>
              </div>
              <div className="dsn-region-stats">
                <span>⭐ {selectedDesigner.rating}</span>
                <span>{selectedDesigner.reviewsLabel}</span>
                <span>{selectedDesigner.projectsCount} проектов</span>
              </div>
              <div className="dsn-region-achievements">
                {selectedDesigner.yearsExperience && (
                  <div>📌 {selectedDesigner.yearsExperience} лет стажа в проектировании</div>
                )}
                {selectedDesigner.sroNumber && (
                  <div>📌 {selectedDesigner.sroNumber}</div>
                )}
                {selectedDesigner.achievements?.[0] && (
                  <div>📌 {selectedDesigner.achievements[0]}</div>
                )}
              </div>
              <button className="dsn-see-all-btn" onClick={() => router.push(`/designers/${selectedDesigner.id}`)}>Открыть профиль →</button>
            </div>
          )}

          {/* Recent projects */}
          <div className="dsn-projects-card">
            <h3 className="dsn-projects-title">Последние проекты</h3>
            <div className="dsn-projects-grid">
              {MOCK_PROJECTS.map((p) => (
                <div key={p.id} className="dsn-project-thumb">
                  <div className="dsn-project-img" style={{
                    backgroundImage: `url(${projBg.src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: p.id === 'prj1' ? 'top left' : p.id === 'prj2' ? 'top right' : p.id === 'prj3' ? 'bottom left' : 'bottom right',
                  }} />
                  <div className="dsn-project-info">
                    <div className="dsn-project-name">{p.title}</div>
                    <div className="dsn-project-location">{p.location}</div>
                  </div>
                </div>
              ))}
            </div>
            {selectedDesigner && (
              <div className="dsn-projects-stats">
                <span>⭐ {selectedDesigner.rating}</span>
                <span>{selectedDesigner.reviewsLabel}</span>
                <span>📁 {selectedDesigner.projectsCount} проектов</span>
              </div>
            )}
            {selectedDesigner && (
              <button
                className="dsn-see-all-btn"
                onClick={() => toggleShortlist(selectedDesigner.id)}
              >
                {shortlist.includes(selectedDesigner.id) ? 'В проекте ✓' : 'Добавить в проект →'}
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
