'use client';

import { useState } from 'react';
import { MOCK_EXPERTISE_REQUESTS, MOCK_EXPERTISE_PROJECTS } from '@/lib/mock-data';
import { OBJECT_TYPE_LABELS } from '@/lib/constants';
import Image from 'next/image';
import projectBuildings from '@/public/project-buildings.png';

type TabType = 'marketplace' | 'dashboard';
type ViewMode = 'list' | 'grid' | 'compact';

export default function ExpertisePage() {
  const [activeTab, setActiveTab] = useState<TabType>('marketplace');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filteredRequests = MOCK_EXPERTISE_REQUESTS.filter(r => 
    !search || r.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProjects = MOCK_EXPERTISE_PROJECTS.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in pb-20">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Экспертиза проектов</h1>
        {activeTab === 'marketplace' && (
          <button className="btn btn-primary">+ Заказать экспертизу</button>
        )}
      </div>

      {/* Tabs */}
      <div className="dsn-tabs" style={{ marginBottom: 24 }}>
        <button 
          className={`dsn-tab ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketplace')}
        >
          Биржа экспертизы
        </button>
        <button 
          className={`dsn-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          В работе ({MOCK_EXPERTISE_PROJECTS.length})
        </button>
      </div>

      {/* Search & View Toggles */}
      <div className="filters-bar" style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
        <input
          type="text"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ maxWidth: 300, flex: 1 }}
        />
        {activeTab === 'marketplace' && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, background: 'var(--bg-input)', padding: 4, borderRadius: 'var(--radius-md)' }}>
            <button onClick={() => setViewMode('list')} className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '6px 10px' }} title="Списком">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </button>
            <button onClick={() => setViewMode('grid')} className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '6px 10px' }} title="Сеткой">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </button>
            <button onClick={() => setViewMode('compact')} className={`btn ${viewMode === 'compact' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '6px 10px' }} title="Компактно">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'marketplace' ? (
        <div style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 } : { display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredRequests.map(req => {
            if (viewMode === 'compact') {
              return (
                <div key={req.id} className="order-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div className="order-card-title" style={{ fontSize: 14, marginBottom: 4 }}>{req.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>🏗️ {OBJECT_TYPE_LABELS[req.objectType] || req.objectType}</div>
                  </div>
                  <div style={{ width: 120, fontSize: 13, fontWeight: 600 }}>💰 {req.budget || 'По договор.'}</div>
                  <div style={{ width: 100, fontSize: 12, color: 'var(--text-muted)' }}>💬 {req.responsesCount} откл.</div>
                  <div style={{ width: 140 }}>
                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12, width: '100%' }}>Откликнуться</button>
                  </div>
                </div>
              );
            }

            return (
            <div key={req.id} className="order-card" style={{ display: 'flex', flexDirection: viewMode === 'grid' ? 'column' : 'row', overflow: 'hidden', padding: 0, gap: viewMode === 'list' ? 24 : 0 }}>
              
              {/* Thumbnail Top / Left */}
              <div style={{
                width: viewMode === 'grid' ? '100%' : 200,
                height: viewMode === 'grid' ? 180 : 'auto',
                minHeight: viewMode === 'list' ? 160 : 'auto',
                flexShrink: 0,
                position: 'relative',
                background: 'var(--bg-input)',
                borderBottom: viewMode === 'grid' ? '1px solid rgba(255,255,255,0.05)' : 'none',
                borderRight: viewMode === 'list' ? '1px solid rgba(255,255,255,0.05)' : 'none'
              }}>
                <Image 
                  src={projectBuildings}
                  alt="План"
                  fill
                  style={{ objectFit: 'cover', opacity: 0.5, mixBlendMode: 'screen' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.05))'
                }} />
                {req.requiredSro && (
                  <div style={{ position: 'absolute', top: 16, left: 16 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', background: '#f59e0b', color: '#fff', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
                      СРО
                    </span>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 8px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: '#fff', borderRadius: 4 }}>
                    {req.sections.length} разд.
                  </span>
                </div>
              </div>

              {/* Content Bottom / Right */}
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="order-card-header" style={{ marginBottom: 12 }}>
                  <div className="order-card-title" style={{ fontSize: viewMode === 'grid' ? 18 : 16, lineHeight: 1.3 }}>{req.title}</div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {req.description}
                </p>
                
                <div className="order-card-meta" style={{ flexWrap: 'wrap', gap: '8px 12px', marginBottom: 20, fontSize: 13 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--accent)' }}>🏗️</span> 
                    <span style={{ fontWeight: 500 }}>{OBJECT_TYPE_LABELS[req.objectType] || req.objectType}</span>
                  </span>
                  {req.deadline && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: 'var(--accent)' }}>⏳</span> 
                      <span>Срок: <strong style={{ fontWeight: 500 }}>{new Date(req.deadline).toLocaleDateString('ru-RU')}</strong></span>
                    </span>
                  )}
                </div>
                
                <div className="order-card-tags" style={{ marginBottom: viewMode === 'grid' ? 20 : 'auto', marginTop: viewMode === 'list' ? 'auto' : 0 }}>
                  {req.sections.map(s => (
                    <span key={s} className="tag" style={{ padding: '2px 6px', fontSize: 11 }}><span className="tag-code">{s}</span></span>
                  ))}
                </div>
                
                <div className="order-card-footer" style={{ marginTop: viewMode === 'grid' ? 'auto' : 20, paddingTop: 16, borderTop: viewMode === 'grid' ? '1px dashed rgba(255,255,255,0.1)' : 'none' }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>💰 {req.budget || 'По договоренности'}</span>
                  <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', fontSize: 10 }}>
                        {req.responsesCount}
                      </span>
                      откликов
                    </span>
                    <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: 13, fontWeight: 600 }}>Откликнуться</button>
                  </span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {filteredProjects.map(prj => {
            const percent = prj.totalRemarks > 0 ? Math.round((prj.fixedRemarks / prj.totalRemarks) * 100) : 100;
            return (
              <div key={prj.id} className="order-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="order-card-title" style={{ fontSize: 16 }}>{prj.title}</span>
                  <span className="status-badge" style={{ 
                    background: prj.status === 'Положительное заключение' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                    color: prj.status === 'Положительное заключение' ? '#22c55e' : '#c4b5fd'
                  }}>
                    {prj.status}
                  </span>
                </div>
                
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                  Заказчик: {prj.company}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Исправлено замечаний: {prj.fixedRemarks} из {prj.totalRemarks}</span>
                    <span style={{ fontWeight: 600, color: percent === 100 ? '#22c55e' : 'var(--text-primary)' }}>{percent}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: percent === 100 ? '#22c55e' : 'var(--accent)', width: `${percent}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                  {prj.criticalRemarks > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: 4 }}>
                      <span>🔴</span> {prj.criticalRemarks} критичных
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '4px 8px', borderRadius: 4 }}>
                    ⏳ Дедлайн: {new Date(prj.dueDate).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                
                <button className="btn btn-secondary" style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}>
                  Журнал замечаний
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
