'use client';

import Link from 'next/link';
import { useApp } from '@/lib/store';
import { OBJECT_TYPE_LABELS, ORDER_STATUS_MAP } from '@/lib/constants';
import { useState } from 'react';
import { ObjectType, OrderStatus } from '@/lib/types';
import Image from 'next/image';
import heroBg from '@/public/hero-bg.png';

type ViewMode = 'list' | 'grid' | 'compact';

export default function OrdersPage() {
  const { orders } = useApp();
  const [filterType, setFilterType] = useState<ObjectType | ''>('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const filtered = orders.filter((o) => {
    if (filterType && o.objectType !== filterType) return false;
    if (filterStatus && o.status !== filterStatus) return false;
    if (search && !o.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Заявки</h1>
        <Link href="/orders/new" className="btn btn-primary">+ Создать заявку</Link>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          type="text"
          placeholder="Поиск по заявкам..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ maxWidth: 300 }}
        />
        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as ObjectType | '')}
        >
          <option value="">Все типы</option>
          {Object.entries(OBJECT_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as OrderStatus | '')}
        >
          <option value="">Все статусы</option>
          {Object.entries(ORDER_STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
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
      </div>

      {/* Orders list */}
      <div 
        className="orders-list" 
        style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 } : { display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">Заявки не найдены</div>
            <p>Попробуйте изменить фильтры или создайте новую заявку</p>
          </div>
        ) : (
          filtered.map((order) => {
            const status = ORDER_STATUS_MAP[order.status];
            
            if (viewMode === 'compact') {
              return (
                <Link key={order.id} href={`/orders/detail?id=${order.id}`} style={{ textDecoration: 'none' }}>
                  <div className="order-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div className="order-card-title" style={{ fontSize: 14, marginBottom: 4 }}>{order.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.customerName} • 🏗️ {OBJECT_TYPE_LABELS[order.objectType]}</div>
                    </div>
                    <div style={{ width: 120, fontSize: 13, fontWeight: 600 }}>💰 {order.budget}</div>
                    <div style={{ width: 100, fontSize: 12, color: 'var(--text-muted)' }}>💬 {order.responsesCount} откл.</div>
                    <div style={{ width: 120 }}>
                      <span className="status-badge" style={{ color: status.color, background: `${status.color}16`, padding: '2px 6px', fontSize: 11 }}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <Link key={order.id} href={`/orders/detail?id=${order.id}`} style={{ textDecoration: 'none' }}>
                <div className="order-card" style={{ display: 'flex', flexDirection: viewMode === 'grid' ? 'column' : 'row', gap: 20, padding: viewMode === 'grid' ? 0 : 24, overflow: 'hidden' }}>
                  <div style={{
                    width: viewMode === 'grid' ? '100%' : 160,
                    height: viewMode === 'grid' ? 160 : 120,
                    flexShrink: 0,
                    borderRadius: viewMode === 'grid' ? 0 : 'var(--radius-md)',
                    overflow: 'hidden',
                    background: 'var(--bg-input)',
                    position: 'relative',
                    borderBottom: viewMode === 'grid' ? '1px solid rgba(255,255,255,0.05)' : 'none'
                  }}>
                    <Image 
                      src={heroBg}
                      alt="Thumbnail"
                      fill
                      style={{ objectFit: 'cover', opacity: 0.8 }} 
                    />
                    <div style={{
                      position: 'absolute', inset: 0, 
                      background: order.objectType === 'private' ? 'rgba(59, 130, 246, 0.2)' : 
                                  order.objectType === 'commercial' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'
                    }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: viewMode === 'grid' ? '20px' : 0 }}>
                    <div className="order-card-header" style={{ marginBottom: 8 }}>
                      <div className="order-card-title" style={{ fontSize: viewMode === 'grid' ? 18 : 16 }}>{order.title}</div>
                      <span className="status-badge" style={{ color: status.color, background: `${status.color}16` }}>
                        {status.label}
                      </span>
                    </div>
                    <p style={{ 
                      fontSize: 13, 
                      color: 'var(--text-muted)', 
                      margin: '0 0 16px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.5
                    }}>
                      {order.description}
                    </p>
                    <div className="order-card-meta" style={{ flexWrap: 'wrap', gap: '8px 16px', marginBottom: 16 }}>
                      <span>📍 {order.region}</span>
                      <span>🏗️ {OBJECT_TYPE_LABELS[order.objectType]}</span>
                      {order.deadline && <span>⏳ Срок: {new Date(order.deadline).toLocaleDateString('ru-RU')}</span>}
                    </div>
                    <div className="order-card-tags" style={{ marginBottom: viewMode === 'grid' ? 20 : 'auto' }}>
                      {order.sections.slice(0, 6).map((s) => (
                        <span key={s} className="tag" style={{ padding: '2px 6px', fontSize: 11 }}><span className="tag-code">{s}</span></span>
                      ))}
                      {order.sections.length > 6 && <span className="tag" style={{ padding: '2px 6px', fontSize: 11 }}>+{order.sections.length - 6}</span>}
                    </div>
                    <div className="order-card-footer" style={{ marginTop: 'auto', paddingTop: 16, borderTop: viewMode === 'grid' ? '1px dashed rgba(255,255,255,0.1)' : 'none' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>💰 {order.budget}</span>
                      <span style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>💬 {order.responsesCount} откликов</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
