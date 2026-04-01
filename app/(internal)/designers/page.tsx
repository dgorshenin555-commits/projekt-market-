'use client';

import { useState } from 'react';
import { MOCK_DESIGNERS, MOCK_PROJECTS } from '@/lib/mock-data';
import { Designer } from '@/lib/types';
import { REGIONS } from '@/lib/constants';
import projBg from '@/public/project-buildings.png';

const TABS = ['Лайтпр', 'Заявки', 'СРО', 'Проекты'];

const SECTION_FILTERS = ['АР', 'КР', 'ЭОМ', 'ВК', 'ОВиК', 'ГС', 'ТХ', 'ПБ', 'СС'];

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

export default function DesignersPage() {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [activeTab, setActiveTab] = useState('Лайтпр');
  const [selectedDesigner, setSelectedDesigner] = useState<Designer | null>(MOCK_DESIGNERS[1]);

  const filtered = MOCK_DESIGNERS.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (regionFilter && d.city !== regionFilter) return false;
    if (sectionFilter && !d.sections.includes(sectionFilter)) return false;
    return true;
  });

  const featured = MOCK_DESIGNERS[0]; // Top featured designer

  return (
    <div className="animate-in">
      {/* Top filter bar */}
      <div className="dsn-filter-bar">
        <div className="dsn-filter-tabs">
          <button className="dsn-filter-tab-icon">☰</button>
          <button className="dsn-filter-tab-icon">📋</button>
          <button className="dsn-filter-tab-icon active">👤</button>
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
        <button className="dsn-filter-chip">🏛️ СРО</button>
        <button className="dsn-filter-chip">⚙ Фильтры</button>
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
            <button className="dsn-tab">⋯</button>
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
                {featured.sections.map((s, i) => (
                  <span key={i} className="dsn-section-tag">{s}</span>
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
                <button className="btn btn-secondary btn-sm">Открыть профиль</button>
                <button className="btn btn-secondary btn-sm">Добавить в проект →</button>
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
                      {designer.sections.map((s, i) => (
                        <span key={i} className="dsn-section-tag">{s}</span>
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
                  {designer.achievements?.slice(0, 1).map((a, i) => (
                    <button key={i} className="dsn-action-btn ghost">{a}</button>
                  ))}
                  <button className="dsn-action-btn primary">Выбрать →</button>
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
                {selectedDesigner.sections.map((s, i) => (
                  <span key={i} className="dsn-section-tag accent">{s}</span>
                ))}
              </div>
              <div className="dsn-profile-sro">{selectedDesigner.sroNumber}</div>
              {selectedDesigner.phone && (
                <div className="dsn-profile-detail">📞 {selectedDesigner.phone}</div>
              )}
              {selectedDesigner.region && (
                <div className="dsn-profile-detail">📍 {selectedDesigner.region}</div>
              )}
              {selectedDesigner.phone && (
                <div className="dsn-profile-detail">📱 {selectedDesigner.phone}</div>
              )}
              <button className="btn btn-accent btn-block dsn-contact-btn">Связаться</button>
            </div>
          )}

          {/* Region info card */}
          <div className="dsn-region-card">
            <div className="dsn-region-header">
              <span className="dsn-region-icon">🌐</span>
              <span className="dsn-region-title">Регион</span>
            </div>
            <div className="dsn-region-detail">
              <span>📍 Санкт-Петербург, ПО, МСК</span>
            </div>
            <div className="dsn-region-stats">
              <span>⭐ 4.8</span>
              <span>Рейтинг</span>
              <span>21 проектов</span>
            </div>
            <div className="dsn-region-achievements">
              <div>📌 С 2020 года в проектировании</div>
              <div>📌 3 года стажа в проектировании</div>
              <div>📌 Первые места в конкурсах</div>
            </div>
            <button className="dsn-see-all-btn">Смотреть все →</button>
          </div>

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
            <div className="dsn-projects-stats">
              <span>⭐ 4.3</span>
              <span>67 проектов</span>
              <span>📁 17 проектов</span>
            </div>
            <button className="dsn-see-all-btn">Добавить в проект →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
