'use client';

import { useState, useEffect } from 'react';
import { MOCK_STANDARDS, MOCK_RECENT_CHANGES, MOCK_FAVORITES } from '@/lib/mock-data';
import { useApp } from '@/lib/store';

const PER_PAGE = 6;

const DOC_CATEGORIES = ['ГОСТ', 'СП', 'СНиП', 'ТУ', 'ISO / EN', 'Архив'] as const;
const CATEGORY_ICONS: Record<string, string> = {
  'ГОСТ': '📄',
  'СП': '📋',
  'СНиП': '📐',
  'ТУ': '🔧',
  'ISO / EN': '🌍',
  'Архив': '🗄',
};

export default function StandardsPage() {
  const { notify } = useApp();
  const [activeCategory, setActiveCategory] = useState('ГОСТ');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'type' | 'date' | ''>('');
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(MOCK_STANDARDS.filter(s => s.isFeatured).map(s => s.id))
  );

  const featured = MOCK_STANDARDS.filter(s => s.isFeatured);
  const filtered = MOCK_STANDARDS.filter(s => {
    if (search && !s.code.toLowerCase().includes(search.toLowerCase()) && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && s.type !== typeFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });

  const sorted = sortBy
    ? [...filtered].sort((a, b) =>
        sortBy === 'date' ? b.year - a.year : a.type.localeCompare(b.type)
      )
    : filtered;

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const tableData = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset to first page whenever filters/search/sort change
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, statusFilter, sortBy]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    notify('Код скопирован: ' + code);
  };

  return (
    <div className="animate-in std-layout">
      {/* Left Category Sidebar */}
      <aside className="std-sidebar">
        {DOC_CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`std-sidebar-item ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            <span className="std-sidebar-icon">{CATEGORY_ICONS[cat]}</span>
            {cat}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <main className="std-main">
        <h1 className="dsn-title" style={{ marginBottom: 8 }}>Нормативная база</h1>

        {/* Search */}
        <div className="dsn-search-wrapper" style={{ marginBottom: 16 }}>
          <span className="dsn-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Найти ГОСТ, СП, ТУ..."
            className="dsn-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="dsn-filter-bar" style={{ marginBottom: 24 }}>
          <select className="dsn-filter-chip" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">ГОСТ ∨</option>
            <option value="ГОСТ">ГОСТ</option>
            <option value="СП">СП</option>
            <option value="СНиП">СНиП</option>
            <option value="ТУ">ТУ</option>
            <option value="ISO">ISO</option>
          </select>
          <button className={`dsn-filter-chip ${sortBy === 'type' ? 'active' : ''}`} onClick={() => setSortBy(v => v === 'type' ? '' : 'type')}>📄 Тип документа</button>
          <button className={`dsn-filter-chip ${sortBy === 'date' ? 'active' : ''}`} onClick={() => setSortBy(v => v === 'date' ? '' : 'date')}>📅 Дата обновления</button>
          <select className="dsn-filter-chip" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Статус</option>
            <option value="Актуален">Актуален</option>
            <option value="Устарел">Устарел</option>
            <option value="Отменён">Отменён</option>
          </select>
        </div>

        {/* Featured Cards */}
        <h2 className="std-section-title">База документов</h2>
        <div className="std-featured-grid">
          {featured.map(doc => (
            <div key={doc.id} className="std-featured-card">
              <div className="std-featured-header">
                <span className="std-featured-code">{doc.code}</span>
                <span className="std-star">⭐</span>
              </div>
              <div className="std-featured-meta">
                <span>📅 Обновлён: {doc.updatedYear}</span>
              </div>
              <div className="std-featured-meta">
                <span>✅ Статус: <span className="std-status-active">актуальный</span></span>
              </div>
              <div className="std-featured-section">
                Раздел: {doc.section}
              </div>
              <div className="std-featured-actions">
                <button className="std-btn-download" onClick={() => notify('Скачивание документа — в разработке')}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 12l-4-4h2.5V3h3v5H12L8 12z"/><path d="M14 14H2v-2h12v2z"/></svg>
                  Скачать PDF
                </button>
                <button className="std-btn-icon" onClick={() => notify('Просмотр документа — в разработке')}>🔍</button>
                <button className="std-btn-icon" onClick={() => copyCode(doc.code)}>📋</button>
                <button className={`std-btn-icon ${favorites.has(doc.id) ? 'active' : ''}`} onClick={() => toggleFavorite(doc.id)}>📌</button>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <h2 className="std-section-title" style={{ marginTop: 32 }}>База документов</h2>
        <div className="std-table-wrapper">
          <table className="std-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Документ</th>
                <th>Раздел</th>
                <th>Дата</th>
                <th>Статус</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((doc, idx) => (
                <tr key={doc.id}>
                  <td>{(page - 1) * PER_PAGE + idx + 1}</td>
                  <td className="std-table-code">{doc.code}</td>
                  <td>{doc.section}</td>
                  <td>{doc.year}</td>
                  <td>
                    <span className={`std-status-badge ${doc.status === 'Актуален' ? 'active' : doc.status === 'Устарел' ? 'outdated' : 'cancelled'}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td>
                    <div className="std-table-actions">
                      <button className="std-btn-icon-sm" onClick={() => notify('Просмотр документа — в разработке')}>📄</button>
                      <button className="std-btn-icon-sm" onClick={() => notify('Скачивание документа — в разработке')}>⬇️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="std-pagination">
          <button className="std-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`std-page-btn ${page === p ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <span className="std-page-dots">...</span>
          <button className="std-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>→</button>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="std-right-sidebar">
        {/* Recent Changes */}
        <div className="std-right-card">
          <div className="std-right-title">
            <span>🕐</span> Свежие изменения<br /><small>(за неделю)</small>
          </div>
          {MOCK_RECENT_CHANGES.map((item, i) => (
            <div key={i} className="std-change-item">
              <div className="std-change-icon">📄</div>
              <div className="std-change-info">
                <div className="std-change-code">{item.code}</div>
                <div className="std-change-spec">{item.spec}</div>
              </div>
              <div className="std-change-right">
                <span className="std-change-count">{item.count}</span>
                <span className={`std-mini-badge ${item.status === 'Актуален' ? 'active' : 'situation'}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Favorites */}
        <div className="std-right-card">
          <div className="std-right-title">
            <span>⭐</span> Избранное проектировщика
          </div>
          {MOCK_FAVORITES.map((item, i) => (
            <div key={i} className="std-fav-item">
              <div className="std-change-icon">📄</div>
              <div className="std-change-info">
                <div className="std-change-code">{item.code}</div>
                <div className="std-change-spec">{item.spec}</div>
              </div>
              <span className="std-fav-star">⭐</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
