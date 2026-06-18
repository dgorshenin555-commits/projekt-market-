// @ts-nocheck
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Icon } from '../../_orders/icons';
import { Avatar } from '../../_orders/shared';
import { CABINET_TABS, roleGroup } from '../../_cabinet/cabinet-data';
import { Overview, Notifications } from '../../_cabinet/tabs';
import { ProfileForm } from '../../_cabinet/ProfileForm';
import '../../_orders/orders.css';

const ROLE_LABEL = { customer: 'Заказчик', designer: 'Проектировщик', expert: 'Эксперт', manufacturer: 'Производитель' };

export default function CabinetPage() {
  const { user, logout, getMyOrders } = useApp();
  const [tab, setTab] = useState('overview');

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

  const grp = roleGroup(user.role);
  const tabs = CABINET_TABS[grp];
  const cur = tabs.find((t) => t.key === tab) ? tab : 'overview';
  const activeOrders = getMyOrders().filter((o) => o.status === 'published').length;

  return (
    <div className="fx animate-in">
      <div className="cab-head">
        <Avatar text={(user.name || 'П').slice(0, 2).toUpperCase()} size={56} />
        <div className="cab-head__body">
          <h1 className="page-title" style={{ margin: 0 }}>Личный кабинет</h1>
          <p className="page-sub" style={{ margin: '4px 0 0' }}>{user.name} · {user.email}{user.company ? ` · ${user.company}` : ''}</p>
        </div>
        <div className="cab-head__meta">
          <span className="badge done"><i />{ROLE_LABEL[user.role] || user.role}</span>
          {grp === 'customer'
            ? <span className="dim" style={{ fontSize: 13 }}>{activeOrders} активных заявок</span>
            : <span className="row gap6" style={{ fontSize: 13, color: 'var(--amber)', fontWeight: 600 }}><Icon name="star" size={14} /> рейтинг —</span>}
        </div>
      </div>

      <div className="tabs cab-tabs">
        {tabs.map((t) => (
          <button key={t.key} className={'tab' + (t.key === cur ? ' is-active' : '')} onClick={() => setTab(t.key)}>
            <Icon name={t.icon} size={15} /> {t.label}
          </button>
        ))}
      </div>

      {cur === 'overview' && <Overview />}
      {cur === 'notifications' && <Notifications />}
      {cur === 'profile' && <ProfileForm />}
      {/* orders/responses/inwork/favorites — Task 6–7 */}
    </div>
  );
}
