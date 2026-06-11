// @ts-nocheck
'use client';

/* Список заявок — новый дизайн «Функция» (перенос Orders из Cloud Design),
   привязанный к реальным заявкам из store. Дизайн заскоуплен под .fx. */

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Icon } from '../../_orders/icons';
import { StatusBadge, STATUS_BADGE, typeImage, typeLabel, urgencyBucket, formatDeadline } from '../../_orders/shared';
import '../../_orders/orders.css';

const TYPE_OPTIONS = ['Все типы', 'Коммерческая недвижимость', 'Промышленность', 'Частное строительство', 'Линейные объекты', 'Здания и сооружения'];
const STATUS_OPTIONS = ['Все статусы', 'Опубликована', 'В работе', 'Завершена'];

const URGENCY = [['Любой', null, '#9ca3af'], ['Срочно', 'u1', '#f4717f'], ['1–3 мес', 'u2', '#f5b13d'], ['3 мес+', 'u3', '#34d399']];

const ORDER_HINTS = [
  ['building', 'Коммерческие', (o) => o.objectType === 'commercial'],
  ['factory', 'Промышленность', (o) => o.objectType === 'industrial'],
  ['wallet', 'Бюджет 10М+', (o) => (parseInt((o.budget || '').replace(/\D/g, ''), 10) || 0) >= 10000000],
  ['comment', 'Много откликов', (o) => o.responsesCount >= 8],
];

const isWaiting = (o) => !o.budget || /договор|предлож|ждём|ждем/i.test(o.budget);

function UrgencyScale({ value, onPick }) {
  return (
    <div className="ratescale" title="Срочность по дедлайну">
      {URGENCY.map(([label, v, c]) => (
        <button key={label} className={value === v ? 'is-on' : ''} style={{ '--dot': c }} onClick={() => onPick(v)}><i />{label}</button>
      ))}
    </div>
  );
}

function OrderHints({ active, onPick }) {
  return (
    <div className="cat-hints">
      {ORDER_HINTS.map(([ic, label], i) => (
        <button key={label} className={'cat-hint' + (active === i ? ' is-on' : '')} onClick={() => onPick(active === i ? null : i)}>
          <Icon name={ic} size={14} />{label}
        </button>
      ))}
    </div>
  );
}

function Dropdown({ value, setValue, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className={'pill' + (value !== options[0] ? ' is-active' : '')} style={{ height: 42 }} onClick={() => setOpen((o) => !o)}>
        {value} <Icon name="chevD" size={14} />
      </button>
      {open && (
        <div className="menu-pop">
          {options.map((o) => (
            <button key={o} className={'menu-pop__item' + (o === value ? ' is-sel' : '')} onClick={() => { setValue(o); setOpen(false); }}>{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Поиск-промпт (перенос PromptSearch из каталога). Фильтрация — живая по вводу;
   кнопка «Найти» и вложения декоративны (прототип). */
function PromptSearch({ value, onChange, placeholder }) {
  const [files, setFiles] = useState([]);
  const taRef = useRef(null);
  useLayoutEffect(() => {
    const ta = taRef.current; if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [value]);
  const has = (value || '').trim().length > 0 || files.length > 0;
  const addFiles = (e) => {
    const list = Array.from(e.target.files || []);
    if (list.length) setFiles((p) => [...p, ...list]);
    e.target.value = '';
  };
  const removeFile = (i) => setFiles((p) => p.filter((_, idx) => idx !== i));
  return (
    <div className="psearch">
      {files.length > 0 && (
        <div className="psearch__files">
          {files.map((f, i) => (
            <span key={i} className="psearch__file">
              <Icon name="paperclip" /><b>{f.name}</b>
              <button onClick={() => removeFile(i)} aria-label="Убрать"><Icon name="x" size={13} /></button>
            </span>
          ))}
        </div>
      )}
      <textarea ref={taRef} rows={1} className="psearch__ta" value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Опишите задачу…'}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault(); }} />
      <div className="psearch__bar">
        <label className="psearch__act psearch__attach" data-tip="Прикрепить файлы">
          <input type="file" multiple hidden onChange={addFiles} />
          <Icon name="paperclip" />
        </label>
        <span className="psearch__spacer" />
        <button className={'psearch__act psearch__send' + (has ? ' is-on' : '')} disabled={!has} data-tip="Найти" aria-label="Найти">
          <Icon name="send" />
        </button>
      </div>
    </div>
  );
}

function OrderCard({ o, go }) {
  const shown = o.sections.slice(0, 6);
  const extra = o.sections.length > 6 ? o.sections.length - 6 : 0;
  const img = typeImage(o.objectType);
  const waiting = isWaiting(o);
  return (
    <div className="card card-hover ordercard" onClick={() => go('order-detail', o.id)}>
      {img
        ? <div className="ordercard__thumb--img" style={{ backgroundImage: `url('${img.src.src}')` }} />
        : <div className="thumb thumb-tower ordercard__thumb" />}
      <div className="grow" style={{ minWidth: 0 }}>
        <div className="row between gap16" style={{ alignItems: 'flex-start' }}>
          <h3 className="ordercard__title">{o.title}</h3>
          <StatusBadge status={o.status} />
        </div>
        <p className="muted ordercard__desc">{o.description}</p>
        <div className="meta-row mt12">
          <span><Icon name="pin" />{o.region}</span>
          <span><Icon name="building" />{typeLabel(o.objectType)}</span>
          <span><Icon name="clock" />Срок: {formatDeadline(o.deadline)}</span>
        </div>
        <div className="chips mt12">
          {shown.map((s) => <span key={s} className="chip chip-code">{s}</span>)}
          {extra > 0 && <span className="chip">+{extra}</span>}
        </div>
        <div className="row between mt16">
          {waiting
            ? <span className="row gap8" style={{ color: 'var(--amber)', fontWeight: 700 }}><Icon name="wallet" size={16} />{o.budget || 'Ждём предложений'}</span>
            : <span className="price row gap8"><Icon name="wallet" size={17} style={{ color: 'var(--accent-2)' }} />{o.budget}</span>}
          <span className="row gap6 dim" style={{ fontSize: 13 }}><Icon name="comment" size={15} />{o.responsesCount} откликов</span>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { orders } = useApp();
  const go = (target, id) => {
    if (target === 'order-new') router.push('/orders/new');
    else if (target === 'order-detail') router.push(`/orders/detail?id=${id}`);
  };

  const [view, setView] = useState('list');
  const [type, setType] = useState('Все типы');
  const [status, setStatus] = useState('Все статусы');
  const [urg, setUrg] = useState(null);
  const [hint, setHint] = useState(null);
  const [q, setQ] = useState('');

  const query = q.trim().toLowerCase();
  const list = orders.filter((o) =>
    (type === 'Все типы' || typeLabel(o.objectType) === type) &&
    (status === 'Все статусы' || (STATUS_BADGE[o.status] && STATUS_BADGE[o.status].label === status)) &&
    (urg == null || urgencyBucket(o.deadline) === urg) &&
    (hint == null || ORDER_HINTS[hint][2](o)) &&
    (!query || o.title.toLowerCase().includes(query) || (o.description || '').toLowerCase().includes(query) || (o.region || '').toLowerCase().includes(query))
  );
  const dirty = type !== 'Все типы' || status !== 'Все статусы' || urg != null || hint != null || query;
  const reset = () => { setType('Все типы'); setStatus('Все статусы'); setUrg(null); setHint(null); setQ(''); };

  return (
    <div className="fx animate-in">
      <div className="cat-head">
        <div>
          <p className="cat-eyebrow">Заявки</p>
          <h1 className="cat-title">Заявки на проектирование<br />и экспертизу</h1>
          <p className="cat-lead">Активные проекты заказчиков: от частных домов до промышленных объектов. Откликайтесь на подходящие или опишите свою задачу.</p>
        </div>
        <button className="btn btn-primary" onClick={() => go('order-new')}><Icon name="plus" size={16} /> Создать заявку</button>
      </div>

      <PromptSearch value={q} onChange={setQ} placeholder="Опишите задачу — найдём подходящие заявки…" />

      <div style={{ marginTop: 14 }}><OrderHints active={hint} onPick={setHint} /></div>

      <div className="row between gap16 wrap" style={{ margin: '20px 0 16px' }}>
        <div className="row gap10 wrap">
          <Dropdown value={type} setValue={setType} options={TYPE_OPTIONS} />
          <Dropdown value={status} setValue={setStatus} options={STATUS_OPTIONS} />
          <UrgencyScale value={urg} onPick={setUrg} />
        </div>
        <div className="viewtoggle">
          {['list', 'columns', 'menu'].map((v) => (
            <button key={v} className={view === v ? 'is-active' : ''} onClick={() => setView(v)}><Icon name={v === 'columns' ? 'columns' : v === 'menu' ? 'menu' : 'list'} /></button>
          ))}
        </div>
      </div>

      <div className="row between" style={{ marginBottom: 18 }}>
        <span className="dim" style={{ fontSize: 13 }}>Найдено: {list.length} из {orders.length}</span>
        {dirty && <button className="btn btn-ghost btn-sm" onClick={reset}><Icon name="x" size={13} /> Сбросить</button>}
      </div>

      {list.length ? (
        <div className={view === 'columns' ? 'orders-grid' : 'col gap16'}>
          {list.map((o) => <OrderCard key={o.id} o={o} go={go} />)}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 44 }}>
          <p className="muted" style={{ margin: '0 0 16px', fontSize: 14.5 }}>По заданным условиям заявок не нашлось.</p>
          <button className="btn btn-outline btn-sm" onClick={reset}>Сбросить фильтры</button>
        </div>
      )}
    </div>
  );
}
