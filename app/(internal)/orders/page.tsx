'use client';

import Link from 'next/link';
import { useApp } from '@/lib/store';
import { OBJECT_TYPE_LABELS, ORDER_STATUS_MAP } from '@/lib/constants';
import { useState } from 'react';
import { ObjectType, OrderStatus } from '@/lib/types';

export default function OrdersPage() {
  const { orders } = useApp();
  const [filterType, setFilterType] = useState<ObjectType | ''>('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');
  const [search, setSearch] = useState('');

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
      </div>

      {/* Orders list */}
      <div className="orders-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">Заявки не найдены</div>
            <p>Попробуйте изменить фильтры или создайте новую заявку</p>
          </div>
        ) : (
          filtered.map((order) => {
            const status = ORDER_STATUS_MAP[order.status];
            return (
              <Link key={order.id} href={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                <div className="order-card">
                  <div className="order-card-header">
                    <div className="order-card-title">{order.title}</div>
                    <span className="status-badge" style={{ color: status.color, background: `${status.color}16` }}>
                      {status.label}
                    </span>
                  </div>
                  <div className="order-card-meta">
                    <span>📍 {order.region}</span>
                    <span>🏗️ {OBJECT_TYPE_LABELS[order.objectType]}</span>
                    <span>📐 Стадия {order.stage === 'P' ? 'П' : 'РД'}</span>
                  </div>
                  <div className="order-card-tags">
                    {order.sections.slice(0, 6).map((s) => (
                      <span key={s} className="tag"><span className="tag-code">{s}</span></span>
                    ))}
                    {order.sections.length > 6 && <span className="tag">+{order.sections.length - 6}</span>}
                  </div>
                  <div className="order-card-footer">
                    <span>{order.customerName}</span>
                    <span style={{ display: 'flex', gap: 16 }}>
                      <span>💰 {order.budget}</span>
                      <span>💬 {order.responsesCount} откликов</span>
                    </span>
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
