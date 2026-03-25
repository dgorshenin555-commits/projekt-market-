'use client';

import { useState } from 'react';
import { MOCK_MANUFACTURERS, MOCK_MANUFACTURER_PRODUCTS } from '@/lib/mock-data';
import { REGIONS } from '@/lib/constants';

const SECTION_FILTERS = ['АР', 'КР', 'ЭОМ', 'ВК', 'ОВиК', 'ГС', 'ТХ', 'ПБ', 'СС'];

// SVG Logos for each manufacturer
const MANUFACTURER_LOGOS: Record<string, React.ReactNode> = {
  mfg1: (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tf-grad" x1="0" y1="0" x2="56" y2="56">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="12" fill="url(#tf-grad)" />
      {/* Facade grid pattern */}
      <rect x="10" y="12" width="10" height="14" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect x="23" y="12" width="10" height="14" rx="2" fill="rgba(255,255,255,0.5)" />
      <rect x="36" y="12" width="10" height="14" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect x="10" y="30" width="10" height="14" rx="2" fill="rgba(255,255,255,0.5)" />
      <rect x="23" y="30" width="10" height="14" rx="2" fill="rgba(255,255,255,0.8)" />
      <rect x="36" y="30" width="10" height="14" rx="2" fill="rgba(255,255,255,0.5)" />
    </svg>
  ),
  mfg2: (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="jbi-grad" x1="0" y1="0" x2="56" y2="56">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="12" fill="url(#jbi-grad)" />
      {/* Concrete beam icon */}
      <rect x="8" y="22" width="40" height="12" rx="3" fill="rgba(255,255,255,0.6)" />
      <rect x="12" y="16" width="8" height="24" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="36" y="16" width="8" height="24" rx="2" fill="rgba(255,255,255,0.35)" />
      <circle cx="28" cy="28" r="3" fill="rgba(255,255,255,0.8)" />
    </svg>
  ),
  mfg3: (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="jbi2-grad" x1="0" y1="0" x2="56" y2="56">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="12" fill="url(#jbi2-grad)" />
      {/* Factory with chimney */}
      <rect x="12" y="24" width="32" height="20" rx="3" fill="rgba(255,255,255,0.5)" />
      <rect x="16" y="14" width="6" height="14" rx="2" fill="rgba(255,255,255,0.7)" />
      <rect x="26" y="18" width="6" height="10" rx="2" fill="rgba(255,255,255,0.4)" />
      <rect x="18" y="32" width="8" height="8" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="30" y="32" width="8" height="8" rx="1" fill="rgba(255,255,255,0.3)" />
    </svg>
  ),
  mfg4: (
    <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pm-grad" x1="0" y1="0" x2="56" y2="56">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="12" fill="url(#pm-grad)" />
      {/* Metal I-beam cross section */}
      <rect x="14" y="12" width="28" height="6" rx="2" fill="rgba(255,255,255,0.7)" />
      <rect x="24" y="18" width="8" height="20" rx="1" fill="rgba(255,255,255,0.5)" />
      <rect x="14" y="38" width="28" height="6" rx="2" fill="rgba(255,255,255,0.7)" />
    </svg>
  ),
};

// Product SVG icons
const PRODUCT_ICONS: Record<string, React.ReactNode> = {
  prod1: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="12" fill="#1e1b4b" />
      {/* Facade panel */}
      <rect x="12" y="12" width="56" height="56" rx="4" fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" />
      <line x1="12" y1="30" x2="68" y2="30" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
      <line x1="12" y1="48" x2="68" y2="48" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
      <line x1="30" y1="12" x2="30" y2="68" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
      <line x1="50" y1="12" x2="50" y2="68" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
      <circle cx="40" cy="40" r="6" fill="rgba(139,92,246,0.5)" />
    </svg>
  ),
  prod2: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" rx="12" fill="#1e1b4b" />
      {/* Bracket/mounting node */}
      <path d="M20 20 L40 15 L60 20 L60 45 L40 65 L20 45 Z" fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.5)" strokeWidth="1.5" />
      <circle cx="40" cy="35" r="8" fill="none" stroke="rgba(139,92,246,0.6)" strokeWidth="2" />
      <circle cx="40" cy="35" r="3" fill="rgba(139,92,246,0.5)" />
      <line x1="20" y1="32" x2="32" y2="35" stroke="rgba(139,92,246,0.4)" strokeWidth="1" />
      <line x1="48" y1="35" x2="60" y2="32" stroke="rgba(139,92,246,0.4)" strokeWidth="1" />
    </svg>
  ),
};

export default function ManufacturersPage() {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  const filteredMakers = MOCK_MANUFACTURERS.filter(m => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (regionFilter && m.deliveryRegion && !m.deliveryRegion.includes(regionFilter)) return false;
    return true;
  });

  return (
    <div className="animate-in">
      {/* Title */}
      <h1 className="dsn-title" style={{ marginBottom: 30 }}>Каталог производителей<br />и технических решений</h1>

      {/* Top filter bar area */}
      <div className="dsn-search-wrapper" style={{ marginBottom: 16 }}>
        <span className="dsn-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Поиск по продуктам, BIM, брендам"
          className="dsn-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="dsn-filter-bar">
        <select className="dsn-filter-chip dsn-search-icon" style={{ paddingLeft: 36, backgroundImage: 'none' }} value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
          <option value="">🔍 Тип продукции</option>
          <option value="bim">BIM модели</option>
          <option value="materials">Материалы</option>
        </select>
        <select className="dsn-filter-chip" value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
          <option value="">📐 Раздел</option>
          {SECTION_FILTERS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="dsn-filter-chip">🏗 Нормативы</button>
        <button className="dsn-filter-chip">⚙ Фильтры</button>
      </div>

      {/* Main Grid: 2 columns */}
      <div className="mfg-grid">
        {/* Manufacturer Cards */}
        {filteredMakers.map((mfg, idx) => (
          <div key={mfg.id} className={`mfg-card ${idx === 0 ? 'mfg-card-featured' : ''}`}>
            <div className="mfg-card-top">
              <div className="mfg-logo">
                {MANUFACTURER_LOGOS[mfg.id] || (
                  <div className="mfg-avatar">
                    {mfg.name.substring(mfg.name.indexOf('«') + 1, mfg.name.indexOf('«') + 3).toUpperCase() || mfg.name.substring(0,2)}
                  </div>
                )}
              </div>
              <div className="mfg-info">
                <div className="mfg-name">{mfg.name}</div>
                <div className="mfg-desc">{mfg.description}</div>
              </div>
            </div>

            {idx === 0 && mfg.website ? (
               <div className="mfg-contact-info">
                 <div className="mfg-link">🌐 {mfg.website}</div>
                 <div className="mfg-link">✉️ {mfg.email}</div>
                 <div className="mfg-link">📞 {mfg.phone}</div>
               </div>
            ) : null}

            <div className="mfg-tags">
              {mfg.tags.map((t, i) => (
                <span key={i} className="mfg-tag">{t}</span>
              ))}
            </div>

            <div className="mfg-stats">
              <span>⭐ {mfg.rating} Рейтинг</span>
              <span>📁 {mfg.projectsCount} проектов</span>
              {mfg.deliveryRegion && <span style={{ marginLeft: 'auto' }}>🚚 {mfg.deliveryRegion}</span>}
            </div>

            <div className="mfg-actions">
              {idx === 0 ? (
                <button className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)', border: 'none' }}>Связаться</button>
              ) : (
                <>
                  <button className="mfg-btn ghost">Открыть профиль</button>
                  <button className="mfg-btn ghost">Добавить в проект</button>
                  <button className="mfg-btn ghost" style={{ marginLeft: 'auto' }}>≡ Заявки</button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Product Cards */}
        {MOCK_MANUFACTURER_PRODUCTS.map((prod) => (
          <div key={prod.id} className="mfg-product-card">
            <div className="mfg-product-top">
              <div className="mfg-product-img">
                {PRODUCT_ICONS[prod.id] || '📸'}
              </div>
              <div className="mfg-product-info">
                <div className="mfg-product-name">{prod.name}</div>
                <div className="mfg-product-sub">{prod.subtitle}</div>
              </div>
            </div>
            
            <div className="mfg-tags" style={{ margin: '14px 0' }}>
              {prod.tags.map((t, i) => (
                <span key={i} className="mfg-tag">{t}</span>
              ))}
            </div>

            <div className="mfg-product-stats">
              <span className="mfg-product-spec">{prod.spec}</span>
              {prod.certCount && <span>📄 Сертификаты: {prod.certCount}</span>}
            </div>

            <div className="mfg-actions">
              <button className="mfg-btn ghost" style={{ width: '100%' }}>Скачать BIM / Открыть →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
