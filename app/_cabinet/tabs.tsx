// @ts-nocheck
'use client';
import { useState } from 'react';
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

function Seg({ value, onChange, left, right }) {
  return (
    <div className="cab-seg">
      <button className={value === 'active' ? 'is-on' : ''} onClick={() => onChange('active')}>{left}</button>
      <button className={value === 'done' ? 'is-on' : ''} onClick={() => onChange('done')}>{right}</button>
    </div>
  );
}

export function CustomerOrders() {
  const { getMyOrders } = useApp();
  const [seg, setSeg] = useState('active');
  const my = getMyOrders();
  const list = my.filter((o) => ORDER_BUCKET(o.status) === seg);
  return (
    <div className="cab-tabpane">
      <div className="row between" style={{ marginBottom: 4 }}>
        <Seg value={seg} onChange={setSeg} left="В работе" right="Отработанные" />
        <Link href="/orders/new" className="btn btn-primary btn-sm"><Icon name="plus" size={15} /> Создать заявку</Link>
      </div>
      {list.length === 0
        ? <div className="empty"><div className="empty__icon"><Icon name="file" size={24} /></div>
            <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>{seg === 'active' ? 'Активных заявок нет.' : 'Завершённых заявок нет.'}</p></div>
        : <div className="col gap12">{list.map((o) => {
            const st = ORDER_STATUS_MAP[o.status];
            return (
              <Link key={o.id} href={`/orders/detail?id=${o.id}`} style={{ textDecoration: 'none' }}>
                <div className="card card-hover">
                  <div className="row between gap16" style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, minWidth: 0 }}>{o.title}</div>
                    <span className="badge" style={{ flex: 'none', color: st.color, background: `${st.color}16` }}>{st.label}</span>
                  </div>
                  <div className="row between gap16 wrap">
                    <span className="row gap6 dim" style={{ fontSize: 13 }}><Icon name="comment" size={14} /> {o.responsesCount} откликов</span>
                    <span className="price row gap6"><Icon name="wallet" size={16} style={{ color: 'var(--accent-2)' }} /> {o.budget}</span>
                  </div>
                </div>
              </Link>
            );
          })}</div>}
    </div>
  );
}

export function CustomerResponses() {
  const { getMyOrders, getResponsesForOrder, selectExecutor, notify } = useApp();
  const my = getMyOrders();
  const groups = my.map((o) => ({ order: o, responses: getResponsesForOrder(o.id) })).filter((g) => g.responses.length > 0);
  if (groups.length === 0)
    return <div className="cab-tabpane"><div className="empty"><div className="empty__icon"><Icon name="comment" size={24} /></div>
      <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>Откликов на ваши заявки пока нет.</p></div></div>;
  return (
    <div className="cab-tabpane col gap20">
      {groups.map(({ order, responses }) => (
        <div key={order.id}>
          <div className="row between" style={{ marginBottom: 10 }}>
            <h3 className="section-title" style={{ margin: 0, fontSize: 15 }}>{order.title}</h3>
            <span className="dim" style={{ fontSize: 13 }}>{responses.length} откл.</span>
          </div>
          <div className="col gap10">
            {responses.map((r) => (
              <div key={r.id} className="card">
                <div className="row between gap16" style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.designerName}{r.designerCompany ? ` · ${r.designerCompany}` : ''}</div>
                  {r.proposedBudget && <span className="price row gap6"><Icon name="wallet" size={15} style={{ color: 'var(--accent-2)' }} /> {r.proposedBudget}</span>}
                </div>
                <p className="muted" style={{ margin: '0 0 12px', fontSize: 13.5, lineHeight: 1.5 }}>{r.message}</p>
                <div className="row gap8">
                  <button className="btn btn-primary btn-sm" onClick={() => { selectExecutor(order.id, r.designerId, r.designerName); notify('Исполнитель выбран'); }}>Выбрать</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExecResponses() {
  const { user, getMyResponses, getMyExpertiseResponses, getOrderById } = useApp();
  const isExpert = user.role === 'expert';
  if (isExpert) {
    const list = getMyExpertiseResponses();
    if (!list.length) return <div className="cab-tabpane"><div className="empty"><div className="empty__icon"><Icon name="comment" size={24} /></div>
      <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>Откликов на обследования пока нет.</p></div></div>;
    return (
      <div className="cab-tabpane col gap12">
        {list.map((r) => (
          <Link key={r.id} href="/expertise" style={{ textDecoration: 'none' }}>
            <div className="card card-hover">
              <div className="row between gap16" style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Отклик на обследование</div>
                <span className="badge done"><i />{r.status === 'accepted' ? 'Принят' : r.status === 'declined' ? 'Отклонён' : 'Отправлен'}</span>
              </div>
              <p className="muted" style={{ margin: '0 0 10px', fontSize: 13.5, lineHeight: 1.5 }}>{r.message}</p>
              {r.proposedBudget && <span className="price row gap6"><Icon name="wallet" size={15} style={{ color: 'var(--accent-2)' }} /> {r.proposedBudget}</span>}
            </div>
          </Link>
        ))}
      </div>
    );
  }
  const list = getMyResponses();
  if (!list.length) return <div className="cab-tabpane"><div className="empty"><div className="empty__icon"><Icon name="comment" size={24} /></div>
    <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>У вас пока нет откликов. Найдите заявку и предложите решение.</p>
    <Link href="/orders" className="btn btn-primary" style={{ marginTop: 16 }}>Смотреть заявки</Link></div></div>;
  return (
    <div className="cab-tabpane col gap12">
      {list.map((r) => {
        const o = getOrderById(r.orderId);
        return (
          <Link key={r.id} href={`/orders/detail?id=${r.orderId}`} style={{ textDecoration: 'none' }}>
            <div className="card card-hover">
              <div className="row between gap16" style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{o ? o.title : 'Отклик на заявку'}</div>
              </div>
              <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5 }}>{r.message}</p>
              {r.proposedBudget && <span className="price row gap6" style={{ marginTop: 12 }}><Icon name="wallet" size={15} style={{ color: 'var(--accent-2)' }} /> {r.proposedBudget}</span>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function ExecInWork() {
  const { user, getMyExpertiseProjects, orders } = useApp();
  const [seg, setSeg] = useState('active');
  const isExpert = user.role === 'expert';
  if (isExpert) {
    const all = getMyExpertiseProjects();
    const list = all.filter((p) => EXP_BUCKET(p.status) === seg);
    return (
      <div className="cab-tabpane">
        <Seg value={seg} onChange={setSeg} left="В работе" right="Завершённые" />
        {list.length === 0
          ? <div className="empty"><p className="muted" style={{ margin: 0, fontSize: 14 }}>{seg === 'active' ? 'Нет обследований в работе.' : 'Нет завершённых.'}</p></div>
          : <div className="col gap12">{list.map((p) => (
              <div key={p.id} className="card">
                <div className="row between gap16" style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, minWidth: 0 }}>{p.title}</div>
                  <span className="badge done"><i />{p.status}</span>
                </div>
                <div className="row gap16 dim" style={{ fontSize: 13 }}>
                  <span>{p.company}</span><span>Замечаний: {p.fixedRemarks}/{p.totalRemarks}</span><span>Срок: {p.dueDate}</span>
                </div>
              </div>
            ))}</div>}
      </div>
    );
  }
  // designer: заявки, где меня выбрали исполнителем
  const mine = orders.filter((o) => o.assignedDesignerId === user.id);
  const list = mine.filter((o) => ORDER_BUCKET(o.status) === seg);
  return (
    <div className="cab-tabpane">
      <Seg value={seg} onChange={setSeg} left="В работе" right="Завершённые" />
      {list.length === 0
        ? <div className="empty"><p className="muted" style={{ margin: 0, fontSize: 14 }}>{seg === 'active' ? 'Пока нет проектов в работе. Откликнитесь на заявку — выбранные проекты появятся здесь.' : 'Завершённых проектов нет.'}</p></div>
        : <div className="col gap12">{list.map((o) => {
            const st = ORDER_STATUS_MAP[o.status];
            return (
              <Link key={o.id} href={`/orders/detail?id=${o.id}`} style={{ textDecoration: 'none' }}>
                <div className="card card-hover">
                  <div className="row between gap16"><div style={{ fontWeight: 700, fontSize: 15 }}>{o.title}</div>
                    <span className="badge" style={{ flex: 'none', color: st.color, background: `${st.color}16` }}>{st.label}</span></div>
                </div>
              </Link>
            );
          })}</div>}
    </div>
  );
}

export function ExecFavorites() {
  const { getFavoriteStandards, toggleFavoriteStandard } = useApp();
  const favs = getFavoriteStandards();
  if (!favs.length)
    return <div className="cab-tabpane"><div className="empty"><div className="empty__icon"><Icon name="star" size={24} /></div>
      <h3 style={{ margin: '8px 0 4px', fontSize: 16, color: '#fff' }}>Нет избранных документов</h3>
      <p className="muted" style={{ margin: '0 0 16px', fontSize: 14 }}>Отметьте документы ⭐ в разделе «Нормативы» — они появятся здесь.</p>
      <Link href="/standards" className="btn btn-primary">Открыть Нормативы</Link></div></div>;
  return (
    <div className="cab-tabpane">
      <div className="row between" style={{ marginBottom: 14 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Избранные документы</h2>
        <Link href="/standards" className="btn btn-ghost btn-sm">Все нормативы <Icon name="arrowRight" size={14} /></Link>
      </div>
      <div className="col gap10">
        {favs.map((d) => (
          <div key={d.code} className="row gap14" style={{ padding: '13px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <span className="chip chip-code" style={{ flex: 'none' }}>{d.type}</span>
            <div className="grow" style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{d.code}</div>
              <div className="dim" style={{ fontSize: 12.5, marginTop: 2 }}>{d.title} · {d.status}</div>
            </div>
            <button className="iconbtn" title="Убрать из избранного" onClick={() => toggleFavoriteStandard(d.code)} style={{ color: 'var(--amber)' }}><Icon name="star" size={17} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
