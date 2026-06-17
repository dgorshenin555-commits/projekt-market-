// @ts-nocheck
'use client';

/* Биржа экспертизы — перенос Expertise из Cloud Design (screens_data.jsx,
   посылка «Функция»). Логика прежняя: реальные данные MOCK_EXPERTISE_REQUESTS /
   MOCK_EXPERTISE_PROJECTS, поиск, режимы list/grid/compact, таб «В работе»,
   openDetail(id) → /expertise/detail. Меняется только визуальный слой под
   дизайн-систему .fx (та же, что orders и expertise/detail). */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { MOCK_EXPERTISE_REQUESTS, MOCK_EXPERTISE_PROJECTS } from '@/lib/mock-data';
import { OBJECT_TYPE_LABELS } from '@/lib/constants';
import { Icon } from '../../_orders/icons';
import '../../_orders/orders.css';

type TabType = 'marketplace' | 'dashboard';
type ViewMode = 'list' | 'grid' | 'compact';

export default function ExpertisePage() {
  const { notify } = useApp();
  const router = useRouter();
  const openDetail = (id: string) => router.push('/expertise/detail?id=' + id);
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
    <div className="fx animate-in">
      <div className="page-head">
        <h1 className="page-title">Экспертиза проектов</h1>
        {activeTab === 'marketplace' && (
          <button className="btn btn-primary" onClick={() => notify('Создание заявки на экспертизу появится в ближайшем обновлении')}>
            <Icon name="plus" size={16} /> Заказать экспертизу
            <span className="exp-soon-badge">Скоро</span>
          </button>
        )}
      </div>

      {/* Pill-вкладки + поиск + переключатель вида */}
      <div className="row between gap16 wrap" style={{ marginBottom: 22 }}>
        <div className="row gap10">
          <button
            className={'pill' + (activeTab === 'marketplace' ? ' is-active' : '')}
            onClick={() => setActiveTab('marketplace')}
          >
            Биржа экспертизы
          </button>
          <button
            className={'pill' + (activeTab === 'dashboard' ? ' is-active' : '')}
            onClick={() => setActiveTab('dashboard')}
          >
            В работе ({MOCK_EXPERTISE_PROJECTS.length})
          </button>
        </div>
        <div className="row gap10">
          <div className="topbar__search" style={{ maxWidth: 280, height: 42 }}>
            <Icon name="search" />
            <input
              placeholder="Поиск…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {activeTab === 'marketplace' && (
            <div className="viewtoggle">
              <button className={viewMode === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')} title="Списком"><Icon name="list" /></button>
              <button className={viewMode === 'grid' ? 'is-active' : ''} onClick={() => setViewMode('grid')} title="Сеткой"><Icon name="columns" /></button>
              <button className={viewMode === 'compact' ? 'is-active' : ''} onClick={() => setViewMode('compact')} title="Компактно"><Icon name="menu" /></button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'marketplace' ? (
        <div className={viewMode === 'grid' ? 'exch-grid' : 'col gap16'}>
          {filteredRequests.map(req => {
            if (viewMode === 'compact') {
              return (
                <div key={req.id} className="card card-hover row gap16" style={{ padding: '12px 20px' }} onClick={() => openDetail(req.id)}>
                  <div className="grow" style={{ minWidth: 200 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{req.title}</div>
                    <div className="meta-row" style={{ fontSize: 12.5 }}><span><Icon name="building" />{OBJECT_TYPE_LABELS[req.objectType] || req.objectType}</span></div>
                  </div>
                  <div className="price" style={{ width: 130, fontSize: 15 }}>{req.budget || 'По договор.'}</div>
                  <div className="dim" style={{ width: 100, fontSize: 12.5 }}>{req.responsesCount} откл.</div>
                  <button className="btn btn-primary btn-sm" style={{ width: 130, justifyContent: 'center' }} onClick={(ev) => { ev.stopPropagation(); openDetail(req.id); }}>Открыть <Icon name="arrowRight" size={14} /></button>
                </div>
              );
            }

            const isGrid = viewMode === 'grid';
            return (
              <div
                key={req.id}
                className={'card card-hover ' + (isGrid ? 'col' : 'row')}
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', gap: 0 }}
                onClick={() => openDetail(req.id)}
              >
                {/* Превью: сверху (grid) или слева (list) */}
                <div
                  className="thumb thumb-tower exch__thumb"
                  style={isGrid ? undefined : { width: 220, height: 'auto', minHeight: 200, flex: 'none' }}
                >
                  {req.requiredSro && <span className="exch__sro"><Icon name="shield" size={13} /> СРО</span>}
                  <span className="exch__n">{req.sections.length} разд.</span>
                </div>

                {/* Контент */}
                <div className="col grow" style={{ padding: 20, minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: isGrid ? 17 : 18, lineHeight: 1.25, color: '#fff' }}>{req.title}</h3>
                  <p className="muted" style={{ margin: '0 0 14px', fontSize: 13.5, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {req.description}
                  </p>

                  <div className="meta-row" style={{ fontSize: 13, marginBottom: 12 }}>
                    <span><Icon name="building" />{OBJECT_TYPE_LABELS[req.objectType] || req.objectType}</span>
                    {req.deadline && <span><Icon name="clock" />Срок: {new Date(req.deadline).toLocaleDateString('ru-RU')}</span>}
                  </div>

                  <div className="chips" style={{ marginBottom: 18 }}>
                    {req.sections.map(s => <span key={s} className="chip chip-code">{s}</span>)}
                  </div>

                  <div className="row between" style={{ marginTop: 'auto' }}>
                    <div>
                      <div className="price">{req.budget || 'По договорённости'}</div>
                      <div className="dim" style={{ fontSize: 12 }}>{req.responsesCount} откликов</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={(ev) => { ev.stopPropagation(); openDetail(req.id); }}>Открыть <Icon name="arrowRight" size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="exch-grid">
          {filteredProjects.map(prj => {
            const percent = prj.totalRemarks > 0 ? Math.round((prj.fixedRemarks / prj.totalRemarks) * 100) : 100;
            const done = prj.status === 'Положительное заключение';
            return (
              <div key={prj.id} className="card col" style={{ padding: 20 }}>
                <div className="row between gap12" style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{prj.title}</span>
                  <span className={'badge ' + (done ? 'done' : 'work')} style={{ flex: 'none' }}><i />{prj.status}</span>
                </div>

                <div className="dim" style={{ fontSize: 13, marginBottom: 16 }}>Заказчик: {prj.company}</div>

                <div style={{ marginBottom: 16 }}>
                  <div className="row between" style={{ fontSize: 12.5, marginBottom: 6 }}>
                    <span className="muted">Исправлено замечаний: {prj.fixedRemarks} из {prj.totalRemarks}</span>
                    <b style={{ color: percent === 100 ? 'var(--green)' : '#fff' }}>{percent}%</b>
                  </div>
                  <div className="bar">
                    <div className="bar__fill" style={{ width: `${percent}%`, background: percent === 100 ? 'var(--green)' : 'var(--grad)' }} />
                  </div>
                </div>

                <div className="row gap12" style={{ flexWrap: 'wrap', fontSize: 12.5, marginBottom: 16 }}>
                  {prj.criticalRemarks > 0 && (
                    <span className="badge" style={{ background: 'rgba(244,109,109,.14)', color: 'var(--red, #f46d6d)' }}>
                      <i style={{ background: 'var(--red, #f46d6d)' }} />{prj.criticalRemarks} критичных
                    </span>
                  )}
                  <span className="row gap10" style={{ color: 'var(--text-dim)' }}>
                    <Icon name="calendar" size={14} /> Дедлайн: {new Date(prj.dueDate).toLocaleDateString('ru-RU')}
                  </span>
                </div>

                <button className="btn btn-outline btn-block" style={{ marginTop: 'auto' }} onClick={() => notify('Журнал замечаний — в разработке')}>
                  Журнал замечаний
                </button>
              </div>
            );
          })}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html:`
        .fx .exp-soon-badge {
          display: inline-flex;
          align-items: center;
          padding: 1px 6px;
          font-size: 9px;
          font-weight: 700;
          line-height: 1.4;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.22);
          color: #fff;
          white-space: nowrap;
        }
      `}}/>
    </div>
  );
}
