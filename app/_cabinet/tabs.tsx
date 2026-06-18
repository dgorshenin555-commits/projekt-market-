// @ts-nocheck
'use client';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ORDER_STATUS_MAP } from '@/lib/constants';
import { Icon } from '../_orders/icons';
import { roleGroup, ORDER_BUCKET, EXP_BUCKET } from './cabinet-data';

function Kpi({ icon, num, label }) {
  return (
    <div className="stat">
      <div className="stat__icon"><Icon name={icon} /></div>
      <div className="stat__num">{num}</div>
      <div className="stat__label">{label}</div>
    </div>
  );
}

export function Overview() {
  const { user, orders, getMyOrders, getMyResponses, getMyExpertiseResponses, getMyExpertiseProjects, getRecommendedOrders } = useApp();
  const grp = roleGroup(user.role);

  if (grp === 'customer') {
    const my = getMyOrders();
    const active = my.filter((o) => o.status === 'published').length;
    const inwork = my.filter((o) => o.status === 'in_progress').length;
    const done = my.filter((o) => o.status === 'completed').length;
    const replies = my.reduce((s, o) => s + (o.responsesCount || 0), 0);
    return (
      <div className="cab-tabpane">
        <div className="grid-3 cab-kpis" style={{ marginBottom: 28 }}>
          <Kpi icon="file" num={active} label="Активных заявок" />
          <Kpi icon="layers" num={inwork} label="В работе" />
          <Kpi icon="checkCircle" num={done} label="Завершено" />
          <Kpi icon="comment" num={replies} label="Всего откликов" />
        </div>
        <div className="row between" style={{ marginBottom: 16 }}>
          <h2 className="section-title" style={{ margin: 0 }}>Последние отклики на мои заявки</h2>
          <Link href="/orders/new" className="btn btn-primary btn-sm"><Icon name="plus" size={15} /> Создать заявку</Link>
        </div>
        {my.filter((o) => o.responsesCount > 0).slice(0, 4).map((o) => (
          <Link key={o.id} href={`/orders/detail?id=${o.id}`} style={{ textDecoration: 'none' }}>
            <div className="card card-hover" style={{ marginBottom: 12 }}>
              <div className="row between gap16">
                <div style={{ fontWeight: 700, fontSize: 15, minWidth: 0 }}>{o.title}</div>
                <span className="row gap6 dim" style={{ fontSize: 13 }}><Icon name="comment" size={14} /> {o.responsesCount}</span>
              </div>
            </div>
          </Link>
        ))}
        {my.filter((o) => o.responsesCount > 0).length === 0 && (
          <div className="empty"><div className="empty__icon"><Icon name="comment" size={24} /></div>
            <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>Откликов пока нет — опубликуйте заявку.</p></div>
        )}
      </div>
    );
  }

  // executor (designer / expert)
  const isExpert = user.role === 'expert';
  const responses = isExpert ? getMyExpertiseResponses() : getMyResponses();
  const projects = isExpert ? getMyExpertiseProjects() : orders.filter((o) => o.assignedDesignerId === user.id);
  const inWork = projects.filter((p) => (isExpert ? EXP_BUCKET(p.status) : ORDER_BUCKET(p.status)) === 'active').length;
  const done = projects.length - inWork;
  const recommended = getRecommendedOrders();
  return (
    <div className="cab-tabpane">
      <div className="grid-3 cab-kpis" style={{ marginBottom: 28 }}>
        <Kpi icon="comment" num={responses.length} label="Мои отклики" />
        <Kpi icon="layers" num={inWork} label="В работе" />
        <Kpi icon="checkCircle" num={done} label="Завершено" />
        <Kpi icon="star" num={user.rating ?? '—'} label="Рейтинг" />
      </div>
      <div className="row between" style={{ marginBottom: 16 }}>
        <h2 className="section-title" style={{ margin: 0 }}>{isExpert ? 'Рекомендованные обследования' : 'Рекомендованные заявки'}</h2>
        <Link href={isExpert ? '/expertise' : '/orders'} className="btn btn-primary btn-sm">{isExpert ? 'Смотреть обследования' : 'Смотреть заявки'}</Link>
      </div>
      {recommended.map((o) => (
        <Link key={o.id} href={`/orders/detail?id=${o.id}`} style={{ textDecoration: 'none' }}>
          <div className="card card-hover" style={{ marginBottom: 12 }}>
            <div className="row between gap16">
              <div style={{ fontWeight: 700, fontSize: 15, minWidth: 0 }}>{o.title}</div>
              <span className="price row gap6"><Icon name="wallet" size={15} style={{ color: 'var(--accent-2)' }} /> {o.budget}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Notifications() {
  const SAMPLE = [
    ['comment', 'Новый отклик на вашу заявку «ЖК Северный парк»', '2 ч назад'],
    ['layers', 'Заявка «Реконструкция склада» перешла в работу', 'вчера'],
    ['checkCircle', 'Исполнитель выбран по заявке «Школа на 1100 мест»', '3 дня назад'],
  ];
  return (
    <div className="cab-tabpane">
      <div className="hintbar" style={{ marginBottom: 18, borderLeftColor: 'var(--amber)' }}>
        <Icon name="bell" size={18} style={{ color: 'var(--amber)' }} />
        <div><b>Раздел в разработке.</b> Здесь появятся события: новые отклики, смена статусов, выбор исполнителя.</div>
      </div>
      <div className="col gap10">
        {SAMPLE.map(([ic, txt, time], i) => (
          <div key={i} className="row gap14" style={{ padding: '13px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', opacity: .7 }}>
            <span className="prev__ico"><Icon name={ic} size={15} /></span>
            <span className="grow" style={{ fontSize: 13.5 }}>{txt}</span>
            <span className="dim" style={{ fontSize: 12, flex: 'none' }}>{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
