// @ts-nocheck
'use client';

/* Личный кабинет — новый дизайн «Функция» (перенос Dashboard из Cloud Design).
   Вся логика сохранена: useApp (user, getMyOrders, getMyResponses, orders, logout),
   ветвление по роли (customer/designer), реальные данные заявок и откликов.
   Меняется только визуальный слой — дизайн заскоуплен под .fx. */

import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ORDER_STATUS_MAP, OBJECT_TYPE_LABELS } from '@/lib/constants';
import { Icon } from '../../_orders/icons';
import '../../_orders/orders.css';

export default function DashboardPage() {
  const { user, getMyOrders, getMyResponses, orders, logout } = useApp();

  if (!user) {
    return (
      <div className="fx animate-in">
        <div className="empty">
          <div className="empty__icon" style={{ marginBottom: 12 }}><Icon name="shield" size={26} /></div>
          <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#fff' }}>Необходима авторизация</h3>
          <Link href="/auth" className="btn btn-primary" style={{ marginTop: 16 }}>Войти</Link>
        </div>
      </div>
    );
  }

  const myOrders = getMyOrders();
  const myResponses = getMyResponses();
  const publishedOrders = orders.filter((o) => o.status === 'published');

  return (
    <div className="fx animate-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">Личный кабинет</h1>
          <p className="page-sub">
            {user.name} · {user.email}
            {user.company && ` · ${user.company}`}
          </p>
        </div>
        <a className="link" onClick={() => { logout(); }} style={{ fontSize: 14, paddingTop: 6 }}>Выйти</a>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 36 }}>
        <div className="stat">
          <div className="stat__icon"><Icon name="grid" /></div>
          <div className="stat__num">{publishedOrders.length}</div>
          <div className="stat__label">Активных заявок</div>
        </div>
        <div className="stat">
          <div className="stat__icon"><Icon name="file" /></div>
          <div className="stat__num">{myOrders.length}</div>
          <div className="stat__label">Моих заявок</div>
        </div>
        <div className="stat">
          <div className="stat__icon"><Icon name="comment" /></div>
          <div className="stat__num">{myResponses.length}</div>
          <div className="stat__label">Моих откликов</div>
        </div>
      </div>

      {/* My orders */}
      {user.role === 'customer' && (
        <>
          <div className="row between" style={{ marginBottom: 22 }}>
            <h2 className="section-title">Мои заявки</h2>
            <Link href="/orders/new" className="btn btn-primary btn-sm"><Icon name="plus" size={15} /> Создать заявку</Link>
          </div>
          {myOrders.length === 0 ? (
            <div className="empty">
              <div className="empty__icon" style={{ marginBottom: 10 }}><Icon name="file" size={26} /></div>
              <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#fff' }}>У вас пока нет заявок</h3>
              <p className="muted" style={{ margin: '0 0 22px', fontSize: 14 }}>Опубликуйте первый проект — отклики проектировщиков появятся здесь.</p>
              <Link href="/orders/new" className="btn btn-primary">Создать первую заявку</Link>
            </div>
          ) : (
            <div className="col gap12" style={{ marginBottom: 32 }}>
              {myOrders.map((order) => {
                const status = ORDER_STATUS_MAP[order.status];
                return (
                  <Link key={order.id} href={`/orders/detail?id=${order.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card card-hover">
                      <div className="row between gap16" style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, minWidth: 0 }}>{order.title}</div>
                        <span className="badge" style={{ flex: 'none', color: status.color, background: `${status.color}16` }}>
                          {status.label}
                        </span>
                      </div>
                      <div className="row between gap16 wrap">
                        <span className="row gap6 dim" style={{ fontSize: 13 }}><Icon name="comment" size={14} /> {order.responsesCount} откликов</span>
                        <span className="price row gap6"><Icon name="wallet" size={16} style={{ color: 'var(--accent-2)' }} /> {order.budget}</span>
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
          <h2 className="section-title" style={{ marginBottom: 22 }}>Мои отклики</h2>
          {myResponses.length === 0 ? (
            <div className="empty">
              <div className="empty__icon" style={{ marginBottom: 10 }}><Icon name="comment" size={26} /></div>
              <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#fff' }}>У вас пока нет откликов</h3>
              <p className="muted" style={{ margin: '0 0 22px', fontSize: 14 }}>Найдите подходящую заявку и предложите своё решение.</p>
              <Link href="/orders" className="btn btn-primary">Смотреть заявки</Link>
            </div>
          ) : (
            <div className="col gap12">
              {myResponses.map((r) => (
                <Link key={r.id} href={`/orders/detail?id=${r.orderId}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-hover">
                    <div className="row between gap16" style={{ marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>Отклик на заявку</div>
                    </div>
                    <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>{r.message}</p>
                    {r.proposedBudget && (
                      <div className="row gap16" style={{ marginTop: 14 }}>
                        <span className="price row gap6"><Icon name="wallet" size={16} style={{ color: 'var(--accent-2)' }} /> {r.proposedBudget}</span>
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
