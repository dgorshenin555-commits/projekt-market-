'use client';

import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ORDER_STATUS_MAP, OBJECT_TYPE_LABELS } from '@/lib/constants';

export default function DashboardPage() {
  const { user, getMyOrders, getMyResponses, orders, logout } = useApp();

  if (!user) {
    return (
      <div className="empty-state animate-in">
        <div className="empty-state-icon">🔒</div>
        <div className="empty-state-title">Необходима авторизация</div>
        <Link href="/auth" className="btn btn-primary" style={{ marginTop: 16 }}>Войти</Link>
      </div>
    );
  }

  const myOrders = getMyOrders();
  const myResponses = getMyResponses();
  const publishedOrders = orders.filter((o) => o.status === 'published');

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Личный кабинет</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            {user.name} · {user.email}
            {user.company && ` · ${user.company}`}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => { logout(); }}>Выйти</button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-value">{publishedOrders.length}</div>
          <div className="stat-card-label">Активных заявок</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{myOrders.length}</div>
          <div className="stat-card-label">Моих заявок</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{myResponses.length}</div>
          <div className="stat-card-label">Моих откликов</div>
        </div>
      </div>

      {/* My orders */}
      {user.role === 'customer' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Мои заявки</h2>
            <Link href="/orders/new" className="btn btn-primary btn-sm">+ Создать заявку</Link>
          </div>
          {myOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">У вас пока нет заявок</div>
              <Link href="/orders/new" className="btn btn-primary" style={{ marginTop: 12 }}>Создать первую заявку</Link>
            </div>
          ) : (
            <div className="orders-list" style={{ marginBottom: 32 }}>
              {myOrders.map((order) => {
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
                      <div className="order-card-footer">
                        <span>💬 {order.responsesCount} откликов</span>
                        <span>💰 {order.budget}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* My responses (for designers) */}
      {user.role === 'designer' && (
        <>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Мои отклики</h2>
          {myResponses.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <div className="empty-state-icon">💬</div>
              <div className="empty-state-title">У вас пока нет откликов</div>
              <Link href="/orders" className="btn btn-primary" style={{ marginTop: 12 }}>Смотреть заявки</Link>
            </div>
          ) : (
            <div className="orders-list">
              {myResponses.map((r) => (
                <Link key={r.id} href={`/orders/${r.orderId}`} style={{ textDecoration: 'none' }}>
                  <div className="order-card">
                    <div className="order-card-header">
                      <div className="order-card-title">Отклик на заявку</div>
                    </div>
                    <div className="response-card-body" style={{ margin: 0 }}>{r.message}</div>
                    {r.proposedBudget && (
                      <div className="order-card-footer">
                        <span>💰 {r.proposedBudget}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
