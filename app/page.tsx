// @ts-nocheck
'use client';
/* app/page.tsx — лендинг «Функция», перенос test_landing.jsx из Cloud Design.
   window.* заменены на ES-импорты; навигация go(...) завязана на маршруты Next. */
import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Icon, FuncMark } from './_landing/icons';
import { Mascots } from './_landing/characters';
import './_landing/landing.css';

// Лёгкий тост для лендинга: ссылки-заглушки и подписка дают мягкий фидбек без перехода по «#».
// Используем простой event-bus на window, чтобы не тащить контекст через все компоненты витрины.
function landingToast(message) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('fn-landing-toast', { detail: message }));
}

function LandingToast() {
  const [msg, setMsg] = React.useState(null);
  const timer = React.useRef(null);
  React.useEffect(() => {
    const onToast = (e) => {
      setMsg(e.detail);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setMsg(null), 2600);
    };
    window.addEventListener('fn-landing-toast', onToast);
    return () => { window.removeEventListener('fn-landing-toast', onToast); if (timer.current) clearTimeout(timer.current); };
  }, []);
  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed', left: '50%', bottom: 28, transform: `translateX(-50%) translateY(${msg ? 0 : 12}px)`,
        background: 'rgba(17,20,28,.92)', color: '#fff', border: '1px solid rgba(255,255,255,.12)',
        padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 500, zIndex: 9999,
        boxShadow: '0 12px 40px rgba(0,0,0,.45)', backdropFilter: 'blur(8px)',
        opacity: msg ? 1 : 0, pointerEvents: 'none', transition: 'opacity .25s ease, transform .25s ease',
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      {msg}
    </div>
  );
}

// Карта грузится только на клиенте: maplibre-gl обращается к window и несовместим с SSR/prerender.
const RegionMap = dynamic(() => import('./_landing/RegionMap').then(m => m.RegionMap), { ssr: false });

function Nav({ go }) {
  const [open, setOpen] = React.useState(false);
  const [pill, setPill] = React.useState({ left: 0, width: 0, opacity: 0 });
  const { user, hydrated } = useApp();
  // До гидрации показываем гостевой вариант, чтобы серверный и клиентский HTML совпадали (без SSR-mismatch).
  const authed = hydrated && !!user;
  const auth = () => go && go('auth');
  const dashboard = () => go && go('dashboard');
  const jump = (href) => (e) => {
    if (href && href.length > 1 && href[0] === '#') {
      e.preventDefault();
      const el = document.querySelector(href);
      const sc = document.querySelector('.tl');
      if (el && sc) sc.scrollTo({ top: Math.max(0, el.offsetTop - 72), behavior: 'smooth' });
    }
    setOpen(false);
  };
  const links = [['Возможности', '#features'], ['Как это работает', '#how'], ['География', '#geo'], ['Тарифы', '#pricing'], ['Вопросы', '#faq']];
  return (
    <header className="tl-nav">
      <div className="tl-nav__in">
        <div className="tl-brand" style={{ cursor: 'pointer' }} onClick={() => go && go('landing')}><FuncMark size={28} /> <span className="tl-shimmer">ФУНКЦИЯ</span></div>
        <nav className="tl-links" onMouseLeave={() => setPill(p => ({ ...p, opacity: 0 }))}>
          {links.map(([l, h]) => <a key={l} href={h} onClick={jump(h)} onMouseEnter={(e) => { const el = e.currentTarget; setPill({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 }); }}>{l}</a>)}
          <span className="tl-navpill" style={{ left: pill.left, width: pill.width, opacity: pill.opacity }} />
        </nav>
        <div className="tl-navbtns">
          {authed ? (
            <>
              <span className="tl-navuser" style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 500, alignSelf: 'center', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
              <button className="tl-btn tl-btn--solid" onClick={dashboard}>Кабинет</button>
            </>
          ) : (
            <>
              <button className="tl-btn tl-btn--ghost" onClick={auth}>Войти</button>
              <button className="tl-btn tl-btn--solid" onClick={auth}>Регистрация</button>
            </>
          )}
        </div>
        <button className="tl-burger" aria-label="Меню" onClick={() => setOpen(o => !o)}>
          <Icon name={open ? 'x' : 'menu'} size={24} />
        </button>
      </div>
      {open && (
        <div className="tl-mobile">
          {links.map(([l, h]) => <a key={l} href={h} onClick={jump(h)}>{l}</a>)}
          <div className="tl-mobile__btns">
            {authed ? (
              <>
                <span className="tl-navuser" style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 500, padding: '8px 2px' }}>{user.name}</span>
                <button className="tl-btn tl-btn--solid" onClick={() => { setOpen(false); dashboard(); }}>Кабинет</button>
              </>
            ) : (
              <>
                <button className="tl-btn tl-btn--ghost" onClick={() => { setOpen(false); auth(); }}>Войти</button>
                <button className="tl-btn tl-btn--solid" onClick={() => { setOpen(false); auth(); }}>Регистрация</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Pill({ color, children }) {
  return <span className="tl-prev__pill" style={{ color }}>{children}</span>;
}

function Avatar({ src, initials, size = 34, ring }) {
  const [err, setErr] = React.useState(false);
  return (
    <span className={'tl-avatar' + (ring ? ' tl-avatar--ring' : '')} style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {src && !err
        ? <img src={src} alt="" onError={() => setErr(true)} />
        : <span className="tl-avatar__fb">{initials}</span>}
      {ring && <span className="tl-avatar__dot" />}
    </span>
  );
}

function PanelOrders() {
  const stats = [['12', 'Активных заявок'], ['48', 'Новых откликов'], ['5', 'На экспертизе'], ['27', 'Завершено']];
  const rows = [
    ['ЖК «Северный парк»', 'Стадия П', 'Сбор откликов', 'var(--amber)', '12 млн ₽'],
    ['Логистический центр А-12', 'Стадия Р', 'На экспертизе', 'var(--blue)', '28 млн ₽'],
    ['Школа на 600 мест', 'Стадия П', 'Проектирование', 'var(--accent-2)', '41 млн ₽'],
    ['Мост через р. Каму', 'Стадия Р', 'Завершено', 'var(--green)', '64 млн ₽'],
  ];
  return (
    <React.Fragment>
      <div className="tl-prev__stats">
        {stats.map(([n, l]) => <div key={l} className="tl-prev__stat"><b>{n}</b><span>{l}</span></div>)}
      </div>
      <div className="tl-prev__panel">
        <div className="tl-prev__rowh"><span>Объект</span><span>Стадия</span><span>Статус</span><span style={{ textAlign: 'right' }}>Бюджет</span></div>
        {rows.map(([name, st, status, color, sum]) => (
          <div key={name} className="tl-prev__row">
            <b>{name}</b><span>{st}</span><span><Pill color={color}>{status}</Pill></span>
            <span style={{ textAlign: 'right', color: '#fff', fontWeight: 600 }}>{sum}</span>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}

function PanelPeople() {
  const chips = ['Все', 'СРО', 'Высокий рейтинг', 'BIM'];
  const people = [
    ['КБ', 'Бюро «Контур»', 'Архитектура · Москва', '4.9', ['СРО', 'BIM']],
    ['СА', 'ИП Соколов А.В.', 'Конструктив · Казань', '4.8', ['СРО']],
    ['МП', 'ПИ «Мостпроект»', 'Транспорт · СПб', '5.0', ['СРО', 'BIM']],
    ['ЛН', 'Студия «Линия»', 'Инженерные сети · Уфа', '4.7', ['BIM']],
  ];
  return (
    <React.Fragment>
      <div className="tl-chips">{chips.map((c, i) => <span key={c} className={'tl-chip' + (i === 0 ? ' is-on' : '')}>{c}</span>)}</div>
      <div className="tl-people">
        {people.map(([ini, name, spec, rate, badges]) => (
          <div key={name} className="tl-person">
            <div className="tl-person__ava">{ini}</div>
            <div className="tl-person__body">
              <div className="tl-person__top"><b>{name}</b><span className="tl-person__rate"><Icon name="star" size={12} /> {rate}</span></div>
              <span className="tl-person__spec">{spec}</span>
              <div className="tl-person__badges">{badges.map(b => <span key={b} className="tl-tag">{b}</span>)}</div>
            </div>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}

function PanelExpertise() {
  const stages = ['Подана', 'Замечания', 'Доработка', 'Заключение'];
  const now = 1;
  const remarks = [
    ['Раздел КР', 'Замечание №14 — расчёт нагрузок', 'Открыто', 'var(--amber)'],
    ['Раздел ОВ', 'Принято без замечаний', 'Принято', 'var(--green)'],
    ['Раздел ЭОМ', 'Ответ направлен эксперту', 'На проверке', 'var(--blue)'],
    ['Раздел АР', 'Замечание №7 — узлы примыкания', 'На доработке', 'var(--accent-2)'],
  ];
  return (
    <React.Fragment>
      <div className="tl-track">
        {stages.map((s, i) => (
          <React.Fragment key={s}>
            <div className={'tl-track__step' + (i <= now ? ' is-done' : '') + (i === now ? ' is-now' : '')}>
              <span className="tl-track__dot">{i < now ? <Icon name="check" size={12} /> : i + 1}</span>{s}
            </div>
            {i < stages.length - 1 && <div className={'tl-track__line' + (i < now ? ' is-done' : '')} />}
          </React.Fragment>
        ))}
      </div>
      <div className="tl-prev__panel">
        <div className="tl-prev__rowh" style={{ gridTemplateColumns: '0.8fr 1.9fr 1fr' }}><span>Раздел</span><span>Комментарий</span><span style={{ textAlign: 'right' }}>Статус</span></div>
        {remarks.map(([sec, txt, status, color]) => (
          <div key={txt} className="tl-prev__row" style={{ gridTemplateColumns: '0.8fr 1.9fr 1fr' }}>
            <b>{sec}</b><span>{txt}</span><span style={{ textAlign: 'right' }}><Pill color={color}>{status}</Pill></span>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}

function PanelStandards() {
  const chips = ['ГОСТ', 'СП', 'СНиП', 'ТУ'];
  const docs = [
    ['ГОСТ', 'ГОСТ 21.501-2018', 'Правила выполнения рабочей документации'],
    ['СП', 'СП 48.13330.2019', 'Организация строительства'],
    ['СП', 'СП 20.13330.2016', 'Нагрузки и воздействия'],
    ['СНиП', 'СНиП 23-02-2003', 'Тепловая защита зданий'],
  ];
  return (
    <React.Fragment>
      <div className="tl-chips">{chips.map((c, i) => <span key={c} className={'tl-chip' + (i === 0 ? ' is-on' : '')}>{c}</span>)}</div>
      <div className="tl-prev__panel">
        {docs.map(([tag, code, name]) => (
          <div key={code} className="tl-doc">
            <span className="tl-doc__tag">{tag}</span>
            <div className="tl-doc__body"><b>{code}</b><span>{name}</span></div>
            <Pill color="var(--green)">Действует</Pill>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}

function PanelAnalytics() {
  const kpis = [['38', 'Заявок за месяц', 'trendUp', 'var(--green)'], ['2.4 ч', 'Средний отклик', 'trendDown', 'var(--green)'], ['64%', 'Конверсия в подбор', 'trendUp', 'var(--accent-2)']];
  const bars = [42, 70, 55, 88, 64, 96, 73, 80];
  return (
    <React.Fragment>
      <div className="tl-prev__stats" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        {kpis.map(([n, l, ic, c]) => (
          <div key={l} className="tl-prev__stat">
            <div className="tl-kpi"><b>{n}</b><Icon name={ic} size={15} style={{ color: c }} /></div>
            <span>{l}</span>
          </div>
        ))}
      </div>
      <div className="tl-prev__panel" style={{ padding: '18px 18px 16px' }}>
        <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 14 }}>Заявки по неделям</div>
        <div className="tl-chart">{bars.map((h, i) => <span key={i} style={{ height: h + '%' }} />)}</div>
      </div>
    </React.Fragment>
  );
}

function PanelExperts() {
  const chips = ['Все', 'Аккредитованные', 'Госэкспертиза'];
  const people = [
    ['ГГ', 'Главгосэкспертиза', 'Госэкспертиза · Москва', '4.9', ['Аккред.']],
    ['ЭП', '«ЭкспертПроект»', 'Негос. экспертиза · СПб', '4.8', ['Аккред.', 'BIM']],
    ['СА', '«СтройАудит»', 'Промбезопасность · Казань', '4.7', ['Аккред.']],
    ['ТН', '«ТехНадзор»', 'Строительный контроль · Уфа', '4.6', []],
  ];
  return (
    <React.Fragment>
      <div className="tl-chips">{chips.map((c, i) => <span key={c} className={'tl-chip' + (i === 0 ? ' is-on' : '')}>{c}</span>)}</div>
      <div className="tl-people">
        {people.map(([ini, name, spec, rate, badges]) => (
          <div key={name} className="tl-person">
            <div className="tl-person__ava">{ini}</div>
            <div className="tl-person__body">
              <div className="tl-person__top"><b>{name}</b><span className="tl-person__rate"><Icon name="star" size={12} /> {rate}</span></div>
              <span className="tl-person__spec">{spec}</span>
              <div className="tl-person__badges">{badges.map(b => <span key={b} className="tl-tag">{b}</span>)}</div>
            </div>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}

function PanelManufacturers() {
  const chips = ['Все', 'Изоляция', 'Кровля', 'BIM-модели'];
  const items = [
    ['ТН', 'ТЕХНОНИКОЛЬ', 'Кровля и гидроизоляция', 'var(--blue)', 'BIM'],
    ['KN', 'Knauf', 'Сухие смеси, ГКЛ', 'var(--blue)', 'BIM'],
    ['RW', 'Rockwool', 'Минеральная изоляция', 'var(--green)', 'Каталог'],
    ['ПП', 'ПЕНОПЛЭКС', 'Теплоизоляция XPS', 'var(--green)', 'Каталог'],
  ];
  return (
    <React.Fragment>
      <div className="tl-chips">{chips.map((c, i) => <span key={c} className={'tl-chip' + (i === 0 ? ' is-on' : '')}>{c}</span>)}</div>
      <div className="tl-cz-rows">
        {items.map(([ini, name, cat, col, badge]) => (
          <div key={name} className="tl-cz-resp">
            <span className="tl-cz-ava">{ini}</span>
            <div className="tl-cz-resp__b"><b>{name}</b><span>{cat}</span></div>
            <span className="tl-prev__pill" style={{ color: col }}>{badge}</span>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}

function PanelChat() {
  const conv = [
    ['БК', 'Бюро «Контур»', 'Отправили обновлённый раздел АР', '2'],
    ['ГГ', 'Главгосэкспертиза', 'Замечание №14 закрыто', '1'],
    ['СА', 'ИП Соколов А.В.', 'Готов приступить на след. неделе', ''],
    ['RW', 'Rockwool', 'КП по изоляции во вложении', ''],
  ];
  return (
    <div className="tl-cz-rows">
      {conv.map(([ini, name, msg, unread]) => (
        <div key={name} className="tl-cz-resp">
          <span className="tl-cz-ava">{ini}</span>
          <div className="tl-cz-resp__b"><b>{name}</b><span>{msg}</span></div>
          {unread ? <span className="tl-prev__pill" style={{ color: 'var(--accent-2)' }}>{unread}</span> : <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>12:30</span>}
        </div>
      ))}
    </div>
  );
}

function PanelPricing() {
  const plans = [['Старт', '0 ₽', 'До 3 заявок', false], ['Команда', '12 900 ₽', 'Без лимитов · экспертиза', true], ['Бизнес', 'Индивид.', 'API · приоритет', false]];
  return (
    <div className="tl-prev__stats" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
      {plans.map(([n, p, f, pop]) => (
        <div key={n} className={'tl-plan' + (pop ? ' is-pop' : '')}>
          <span className="tl-plan__n">{n}</span>
          <span className="tl-plan__p">{p}</span>
          <span className="tl-plan__f">{f}</span>
        </div>
      ))}
    </div>
  );
}

function PanelSettings() {
  const rows = [['Организация', 'ООО «Демо»'], ['ИНН', '7701234567'], ['Регион', 'Москва'], ['Тариф', 'Команда'], ['Уведомления', 'Включены']];
  return (
    <div className="tl-cz-rows">
      {rows.map(([k, v]) => (
        <div key={k} className="tl-cz-row"><span>{k}</span><b>{v}</b></div>
      ))}
    </div>
  );
}

function Preview() {
  const ITEMS = [
    { ic: 'grid', label: 'Заявки', url: 'orders', title: 'Заявки', sub: 'Активные проекты на площадке', cta: 'Создать заявку', Panel: PanelOrders },
    { ic: 'scan', label: 'Экспертиза', url: 'expertise', title: 'Экспертиза', sub: 'Замечания, итерации и статусы', cta: 'Новая итерация', Panel: PanelExpertise },
    { ic: 'pen', label: 'Проектировщики', url: 'designers', title: 'Проектировщики', sub: 'Подбор исполнителей по заявке', cta: 'Найти специалиста', Panel: PanelPeople },
    { ic: 'shield', label: 'Эксперты', url: 'experts', title: 'Эксперты', sub: 'Аккредитованные организации', cta: 'Пригласить', Panel: PanelExperts },
    { ic: 'stamp', label: 'Производители', url: 'manufacturers', title: 'Производители', sub: 'Каталог решений и материалов', cta: 'В каталог', Panel: PanelManufacturers },
    { ic: 'database', label: 'Нормативы', url: 'standards', title: 'Нормативная база', sub: 'ГОСТ, СП, ТУ и стандарты', cta: 'Добавить документ', Panel: PanelStandards },
    { ic: 'chat', label: 'Коммуникации', url: 'chat', title: 'Коммуникации', sub: 'Переписка по проектам', cta: 'Написать', Panel: PanelChat },
    { ic: 'chart', label: 'Аналитика', url: 'analytics', title: 'Аналитика', sub: 'Метрики по вашим проектам', cta: 'Экспорт', Panel: PanelAnalytics },
    { ic: 'wallet', label: 'Тарифы', url: 'pricing', title: 'Тарифы', sub: 'Планы и подписка', cta: 'Сменить план', Panel: PanelPricing },
    { ic: 'sliders', label: 'Настройки', url: 'settings', title: 'Настройки', sub: 'Профиль и организация', cta: 'Сохранить', Panel: PanelSettings },
  ];
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [cur, setCur] = React.useState({ x: 30, y: 70 });
  const [clicking, setClicking] = React.useState(false);
  const sideRef = React.useRef(null);

  const moveCursorTo = React.useCallback((idx) => {
    const side = sideRef.current; if (!side) return;
    const el = side.querySelector('[data-tab="' + idx + '"]');
    if (el) setCur({ x: 30, y: el.offsetTop + el.offsetHeight / 2 });
  }, []);

  React.useEffect(() => { moveCursorTo(active); /* eslint-disable-next-line */ }, []);

  React.useEffect(() => {
    if (paused) return;
    let t2, t3;
    const t1 = setTimeout(() => {
      const next = (active + 1) % ITEMS.length;
      moveCursorTo(next);
      t2 = setTimeout(() => {
        setClicking(true);
        setActive(next);
        t3 = setTimeout(() => setClicking(false), 160);
      }, 360);
    }, 950);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active, paused, moveCursorTo]);

  const tab = ITEMS[active];
  const Panel = tab.Panel;

  return (
    <div className="tl-ipad" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <span className="tl-ipad__cam" />
      <div className="tl-ipad__screen">
        <div className="tl-ios-bar">
          <span className="tl-ios-time">9:41</span>
          <span className="tl-ios-url"><Icon name="globe" size={11} /> app.funktsiya.ru/{tab.url}</span>
          <span className="tl-ios-status">
            <span className="tl-sig"><i /><i /><i /><i /></span>
            <span style={{ fontSize: 10.5 }}>Wi-Fi</span>
            <span className="tl-batt" />
          </span>
        </div>
        <div className="tl-prev">
        <aside className="tl-prev__side" ref={sideRef}>
          <div className="tl-prev__brand"><FuncMark size={20} /> ФУНКЦИЯ</div>
          {ITEMS.map((n, i) => {
            const on = i === active;
            return (
              <div key={n.label} data-tab={i}
                className={'tl-prev__nav' + (on ? ' is-on' : '')}
                onClick={() => { setActive(i); moveCursorTo(i); }}>
                <Icon name={n.ic} size={17} /> {n.label}
              </div>
            );
          })}
          <span className="tl-cursor" style={{ transform: `translate(${cur.x}px, ${cur.y}px)` }}>
            <span className={'tl-cursor__in' + (clicking ? ' is-click' : '')}>
              <svg width="28" height="28" viewBox="0 0 24 24"><path d="M5 3l14 7-6.2 1.8L10 19z" fill="#fff" stroke="#0b0b12" strokeWidth="1.3" strokeLinejoin="round" /></svg>
            </span>
            {clicking && <span className="tl-cursor__ring" />}
          </span>
          <div className="tl-prev__side-foot">
            <div className="tl-prev__ava">ДП</div>
            <div><div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Демо Пользователь</div><div style={{ fontSize: 10.5, color: 'var(--text-mute)' }}>ООО «Демо»</div></div>
          </div>
        </aside>
        <div className="tl-prev__main">
          <div className="tl-prev__head">
            <div><h4>{tab.title}</h4><p>{tab.sub}</p></div>
            <div className="tl-prev__head-r">
              <button className="tl-prev__cta"><Icon name="plus" size={14} /> {tab.cta}</button>
              <span className="tl-prev__bell"><Icon name="bell" size={17} /></span>
              <Avatar src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=120&h=120&fit=crop&crop=faces" initials="ДП" size={34} ring />
            </div>
          </div>
          <div className="tl-prev__view" key={active}>
            <Panel />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

function TiltStage({ children }) {
  const ref = React.useRef(null);
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    const scroller = document.querySelector('.tl');
    let raf;
    const calc = () => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const start = vh * 0.96, end = vh * 0.32;
      const prog = (start - r.top) / (start - end);
      setP(Math.max(0, Math.min(1, prog)));
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(calc); };
    calc();
    if (scroller) scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { if (scroller) scroller.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);
  const rotate = (17 * (1 - p)).toFixed(2);
  const scale = (1.04 - 0.04 * p).toFixed(3);
  const lift = (48 * (1 - p)).toFixed(1);
  return (
    <div className="tl-stage" ref={ref}>
      <div className="tl-glow" aria-hidden="true" />
      <div className="tl-mascot"><Mascots scale={0.42} /></div>
      <div className="tl-tilt" style={{ transform: `perspective(1300px) rotateX(${rotate}deg) scale(${scale}) translateY(${lift}px)` }}>
        {children}
      </div>
    </div>
  );
}

function PromptBox({ go }) {
  const [val, setVal] = React.useState('');
  const [tool, setTool] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const taRef = React.useRef(null);
  React.useLayoutEffect(() => { const ta = taRef.current; if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'; } }, [val]);
  const tools = [['search', 'Найти проектировщика'], ['shield', 'Заказать экспертизу'], ['box', 'Подобрать материалы'], ['database', 'Проверить по нормативам']];
  const has = val.trim().length > 0;
  const submit = () => { go && go('auth'); };
  return (
    <div className="tl-prompt">
      {tool && (
        <div className="tl-prompt__active"><Icon name={tool[0]} size={14} /> {tool[1]}
          <button onClick={() => setTool(null)} aria-label="Убрать"><Icon name="x" size={13} /></button>
        </div>
      )}
      <textarea ref={taRef} rows={1} className="tl-prompt__ta" value={val} onChange={(e) => setVal(e.target.value)}
        placeholder="Опишите ваш проект — подберём исполнителей, экспертизу и решения…"
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }} />
      <div className="tl-prompt__bar">
        <button className="tl-prompt__icon" title="Прикрепить файлы" onClick={submit}><Icon name="paperclip" size={18} /></button>
        <div className="tl-prompt__tools">
          <button className="tl-prompt__toolbtn" onClick={() => setOpen(o => !o)}><Icon name="sliders" size={15} /> {tool ? '' : 'Инструменты'}</button>
          {open && (
            <div className="tl-prompt__menu">
              {tools.map(t => <button key={t[1]} onClick={() => { setTool(t); setOpen(false); }}><Icon name={t[0]} size={15} /> {t[1]}</button>)}
            </div>
          )}
        </div>
        <div className="tl-prompt__right">
          <button className={'tl-prompt__send' + (has ? ' is-on' : '')} onClick={submit} disabled={!has} aria-label="Отправить"><Icon name="send" size={17} /></button>
        </div>
      </div>
    </div>
  );
}

function Hero({ go }) {
  return (
    <section className="tl-hero">
      <div className="tl-herobtns">
        <button className="tl-hbtn tl-hbtn--primary" onClick={() => go && go('order-new')}><Icon name="plus" size={15} /> Разместить заявку</button>
        <button className="tl-hbtn tl-hbtn--pink" onClick={() => go && go('auth')}><Icon name="search" size={15} /> Найти заказы</button>
      </div>
      <h1 className="tl-title">Платформа для проектирования, <br />экспертизы и подбора решений</h1>
      <p className="tl-sub">Публикуйте заявки, находите проектировщиков, проходите экспертизу и работайте с нормативами — в одной системе.</p>
      <PromptBox go={go} />

      <TiltStage><Preview /></TiltStage>
    </section>
  );
}

function PerfCard({ go, icon, title, tint, cap, value, change, bench, benchLabel, compTitle, comp, action }) {
  const cardRef = React.useRef(null);
  const [n, setN] = React.useState(0);
  const [armed, setArmed] = React.useState(false);
  const maxV = Math.max(value, bench, ...comp.map(c => c[1]));
  React.useEffect(() => {
    const el = cardRef.current; if (!el) return;
    let raf, fb, late, done = false;
    const run = () => {
      if (done) return; done = true;
      setArmed(true);
      const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) { setN(value); return; }
      const t0 = performance.now(), dur = 1300;
      const tick = (t) => { const p = Math.min(1, (t - t0) / dur); setN(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
      fb = setTimeout(() => setN(value), dur + 400);
    };
    let io;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { run(); io.disconnect(); } }, { threshold: 0.3 });
      io.observe(el);
    }
    late = setTimeout(() => { if (!done) run(); }, 2600);
    return () => { if (io) io.disconnect(); cancelAnimationFrame(raf); clearTimeout(fb); clearTimeout(late); };
  }, []);
  return (
    <div className="tl-perf" ref={cardRef}>
      <div className="tl-perf__head" style={{ background: `color-mix(in srgb, ${tint} 13%, transparent)` }}>
        <span className="tl-perf__ic" style={{ background: `color-mix(in srgb, ${tint} 22%, transparent)`, color: tint }}><Icon name={icon} size={24} /></span>
        <div className="tl-perf__htext">
          <h3 className="tl-perf__title">{title}</h3>
          <span className="tl-perf__cap">{cap}</span>
        </div>
      </div>
      <div className="tl-perf__metric">
        <div>
          <div className="tl-perf__num">{n.toLocaleString('ru-RU')}</div>
          <div className="tl-perf__chg">▲ {change}% к прошлому периоду</div>
        </div>
        <div className="tl-perf__barwrap">
          <div className="tl-perf__bar">
            <div className="tl-perf__fill" style={{ width: armed ? (value / maxV * 100) + '%' : 0 }} />
            <div className="tl-perf__mark" style={{ left: (bench / maxV * 100) + '%', transform: `translateY(-50%) scaleY(${armed ? 1 : 0})` }} />
          </div>
          <div className="tl-perf__barlbl"><span>{benchLabel}</span><span>{bench.toLocaleString('ru-RU')}</span></div>
        </div>
      </div>
      <h4 className="tl-perf__h">{compTitle}</h4>
      <div className="tl-perf__list">
        {comp.map(([name, v, ic]) => (
          <div key={name} className="tl-perf__row"><Icon name={ic} size={15} /><span>{name}</span><b>{v.toLocaleString('ru-RU')}</b></div>
        ))}
      </div>
      <div className="tl-perf__btns">
        <button className="tl-perf__btn" onClick={() => go && go(action.screen)}><Icon name={action.icon} size={14} /> {action.label}</button>
        <button className="tl-perf__btn"><Icon name="send" size={14} /> Поделиться</button>
      </div>
    </div>
  );
}

function Features({ go }) {
  const cards = [
    {
      icon: 'pen', title: 'Проектировщики', tint: 'var(--accent-2)', cap: 'активных специалистов на платформе', value: 1256, change: 8.6, bench: 960, benchLabel: 'Среднее по рынку',
      compTitle: 'Ведущие бюро', comp: [['Бюро «Контур»', 2292, 'compass'], ['ПИ «Мостпроект»', 1694, 'pen'], ['Студия «Линия»', 998, 'building']],
      action: { label: 'Каталог', icon: 'layers', screen: 'designers' },
    },
    {
      icon: 'scan', title: 'Экспертиза', tint: 'var(--blue)', cap: 'заключений за месяц', value: 342, change: 5.2, bench: 280, benchLabel: 'Среднее по рынку',
      compTitle: 'Ведущие эксперты', comp: [['Главгосэкспертиза', 560, 'shield'], ['«ЭкспертПроект»', 410, 'cert'], ['«СтройАудит»', 295, 'award']],
      action: { label: 'Эксперты', icon: 'shield', screen: 'experts' },
    },
    {
      icon: 'box', title: 'Решения и материалы', tint: 'var(--green)', cap: 'позиций в каталоге', value: 18420, change: 12.4, bench: 14000, benchLabel: 'Среднее по отрасли',
      compTitle: 'Топ-производители', comp: [['ТЕХНОНИКОЛЬ', 4200, 'box'], ['Knauf', 3650, 'layers'], ['Rockwool', 2980, 'cpu']],
      action: { label: 'Каталог', icon: 'box', screen: 'manufacturers' },
    },
  ];
  return (
    <section className="tl-section" id="features">
      <p className="tl-eyebrow">Возможности</p>
      <h2 className="tl-h2">Весь цикл ПИР в одной системе</h2>
      <p className="tl-lead">От публикации заявки до подбора материалов — без переписок в почте и десятка разрозненных сервисов.</p>
      <div className="tl-feat">
        {cards.map((c) => <PerfCard key={c.title} go={go} {...c} />)}
      </div>
    </section>
  );
}

function VPublish() {
  const fields = [['Тип объекта', 'Коммерческая'], ['Регион', 'Москва'], ['Стадия', 'Проектная (П)'], ['Разделы', '12 выбрано'], ['Бюджет', '12 000 000 ₽'], ['Срок сдачи', '01.09.2026']];
  return (
    <div className="tl-screen">
      <div className="tl-screen__top">
        <div className="tl-screen__title"><b>Новая заявка</b><span>Публикация проекта · шаг 2 из 4</span></div>
        <button className="tl-screen__act"><Icon name="plus" size={14} /> Опубликовать</button>
      </div>
      <div className="tl-screen__body">
        <div className="tl-chips">{['Тип', 'Параметры', 'Бюджет', 'Файлы'].map((c, i) => <span key={c} className={'tl-chip' + (i === 1 ? ' is-on' : '')}>{c}</span>)}</div>
        <div className="tl-form2">
          {fields.map(([l, v], i) => <div key={l} className="tl-f" data-cursor={i === 4 ? '1' : undefined}><span>{l}</span><b>{v}</b></div>)}
        </div>
        <div className="tl-upload"><Icon name="paperclip" size={16} /> Перетащите файлы проекта · 3 файла загружено</div>
      </div>
    </div>
  );
}
function VResponses() {
  const stats = [['8', 'Откликов'], ['11.4 млн ₽', 'Средняя цена'], ['95 дн', 'Средний срок']];
  const ppl = [['КБ', 'Бюро «Контур»', 'Архитектура · ★ 4.9', '11.8 млн ₽'], ['СА', 'ИП Соколов А.В.', 'Конструктив · ★ 4.8', '10.2 млн ₽'], ['МП', 'ПИ «Мостпроект»', 'Транспорт · ★ 5.0', '12.6 млн ₽']];
  return (
    <div className="tl-screen">
      <div className="tl-screen__top">
        <div className="tl-screen__title"><b>Отклики на заявку</b><span>ЖК «Северный парк» · 8 откликов</span></div>
        <button className="tl-screen__act tl-screen__act--ghost"><Icon name="layers" size={14} /> Сравнить</button>
      </div>
      <div className="tl-screen__body">
        <div className="tl-prev__stats" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>{stats.map(([n, l]) => <div key={l} className="tl-prev__stat"><b>{n}</b><span>{l}</span></div>)}</div>
        <div className="tl-cz-rows">
          {ppl.map(([ini, name, spec, price], i) => (
            <div key={name} className="tl-resp2">
              <span className="tl-cz-ava">{ini}</span>
              <div className="tl-resp2__b"><b>{name}</b><span>{spec}</span></div>
              <span className="tl-resp2__price">{price}</span>
              <span className="tl-resp2__btn" data-cursor={i === 0 ? '1' : undefined}>Выбрать</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function VWorkspace() {
  const stages = ['Подана', 'Замечания', 'Доработка', 'Заключение']; const now = 1;
  const remarks = [['Раздел КР', 'Замечание №14 — расчёт нагрузок', 'Открыто', 'var(--amber)'], ['Раздел ОВ', 'Принято без замечаний', 'Принято', 'var(--green)'], ['Раздел ЭОМ', 'Ответ направлен эксперту', 'На проверке', 'var(--blue)']];
  return (
    <div className="tl-screen">
      <div className="tl-screen__top">
        <div className="tl-screen__title"><b>ЖК «Северный парк»</b><span>Исполнитель: Бюро «Контур» · ★ 4.9</span></div>
        <button className="tl-screen__act"><Icon name="plus" size={14} /> Итерация</button>
      </div>
      <div className="tl-screen__body">
        <div className="tl-cz-tabs">{['Экспертиза', 'Нормативы', 'Чат', 'Файлы'].map((t, i) => <span key={t} className={'tl-chip' + (i === 0 ? ' is-on' : '')} data-cursor={i === 1 ? '1' : undefined}>{t}</span>)}</div>
        <div className="tl-track">
          {stages.map((s, i) => (
            <React.Fragment key={s}>
              <div className={'tl-track__step' + (i <= now ? ' is-done' : '') + (i === now ? ' is-now' : '')}><span className="tl-track__dot">{i < now ? <Icon name="check" size={12} /> : i + 1}</span>{s}</div>
              {i < stages.length - 1 && <div className={'tl-track__line' + (i < now ? ' is-done' : '')} />}
            </React.Fragment>
          ))}
        </div>
        <div className="tl-prev__panel">
          <div className="tl-prev__rowh" style={{ gridTemplateColumns: '0.8fr 1.9fr 1fr' }}><span>Раздел</span><span>Комментарий</span><span style={{ textAlign: 'right' }}>Статус</span></div>
          {remarks.map(([sec, txt, status, color]) => (
            <div key={txt} className="tl-prev__row" style={{ gridTemplateColumns: '0.8fr 1.9fr 1fr' }}><b>{sec}</b><span>{txt}</span><span style={{ textAlign: 'right' }}><Pill color={color}>{status}</Pill></span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Steps() {
  const steps = [
    { n: 1, title: 'Опубликуйте заявку', desc: 'Опишите объект, стадию, разделы и бюджет. Загрузите исходные данные за пару минут.', V: VPublish },
    { n: 2, title: 'Получите отклики', desc: 'Проектировщики и эксперты откликаются на заявку. Сравнивайте по рейтингу и опыту.', V: VResponses },
    { n: 3, title: 'Выберите исполнителя', desc: 'Сравните отклики, выберите подрядчика и ведите проект в одном окне — экспертиза, замечания и нормативы вместе.', V: VWorkspace },
  ];
  const [active, setActive] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [cur, setCur] = React.useState({ x: 90, y: 90 });
  const [hit, setHit] = React.useState(false);
  const stageRef = React.useRef(null);
  const dur = 3600;
  React.useEffect(() => {
    if (paused) return;
    let raf; const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(100, ((t - t0) / dur) * 100);
      setProgress(p);
      if (p < 100) raf = requestAnimationFrame(tick);
      else { setProgress(0); setActive(a => (a + 1) % steps.length); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, paused]);
  React.useEffect(() => {
    let t1, t2, t3, el;
    t1 = setTimeout(() => {
      const stage = stageRef.current; if (!stage) return;
      el = stage.querySelector('[data-cursor]'); if (!el) return;
      const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
      setCur({ x: r.left - s.left + r.width / 2 - 9, y: r.top - s.top + r.height / 2 - 6 });
      t2 = setTimeout(() => { setHit(true); el.classList.add('tl-cz-hit'); t3 = setTimeout(() => setHit(false), 300); }, 620);
    }, 680);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); if (el) el.classList.remove('tl-cz-hit'); };
  }, [active]);
  const Active = steps[active].V;
  return (
    <section className="tl-section" id="how">
      <p className="tl-eyebrow">Как это работает</p>
      <h2 className="tl-h2">Три шага для запуска в работу</h2>
      <div className="tl-cz" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="tl-cz__stage" ref={stageRef}>
          <div className="tl-cz__slide" key={active}><Active /></div>
          <span className="tl-cursor tl-cz-cursor" style={{ transform: `translate(${cur.x}px, ${cur.y}px)` }}>
            <span className={'tl-cursor__in' + (hit ? ' is-click' : '')}>
              <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l14 7-6.2 1.8L10 19z" fill="var(--accent-2)" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" /></svg>
            </span>
          </span>
        </div>
        <div className="tl-cz__btns">
          {steps.map((s, i) => (
            <button key={s.n} className={'tl-cz__btn' + (i === active ? ' is-active' : '')} onClick={() => { setActive(i); setProgress(0); }}>
              <span className="tl-cz__prog" style={{ width: (i === active ? progress : 0) + '%' }} />
              <div className="tl-cz__bn">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Band({ go }) {
  return (
    <div className="tl-band">
      <div className="tl-band__in">
        <h2 className="tl-h2" style={{ marginBottom: 12 }}>Готовы начать проект?</h2>
        <p className="tl-lead" style={{ marginBottom: 28 }}>Создайте первую заявку — это бесплатно. Отклики появятся уже сегодня.</p>
        <button className="tl-btn tl-btn--grad" onClick={() => go && go('auth')}>Начать бесплатно</button>
      </div>
    </div>
  );
}

function ObjectTypes({ go }) {
  const cards = [
    { ic: 'building', t: 'Коммерческая недвижимость', d: 'Офисы, ТЦ, склады и гостиницы.' },
    { ic: 'pin', t: 'Частное строительство', d: 'Дома, коттеджи и участки.' },
    { ic: 'factory', t: 'Промышленность', d: 'Заводы, цеха и производственные комплексы.' },
    { ic: 'grid', t: 'Жилая недвижимость', d: 'Многоквартирные дома и жилые комплексы.' },
    { ic: 'layers', t: 'Здание', d: 'Общественные и специальные объекты.' },
    { ic: 'box', t: 'Сооружение', d: 'Инженерные и технические сооружения.' },
    { ic: 'globe', t: 'Линейный объект', d: 'Дороги, инженерные сети, трубопроводы.' },
    { ic: 'spark', t: 'Другой объект', d: 'Опишите любой объект в свободной форме.' },
  ];
  return (
    <section className="tl-section" id="types">
      <p className="tl-eyebrow">Объекты</p>
      <h2 className="tl-h2">Типы объектов</h2>
      <p className="tl-lead">Размещайте заявки по любому типу объекта — от частного дома до линейных сооружений.</p>
      <div className="tl-fgrid-wrap">
        <div className="tl-fgrid-mascot"><Mascots scale={0.4} /></div>
        <div className="tl-typebtns">
          {cards.map((x) => (
            <button key={x.t} className="tl-hbtn" onClick={() => go && go('order-new')}>
              <Icon name={x.ic} size={16} /> {x.t}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = React.useState(0);
  const items = [
    ['Сколько стоит размещение заявки?', 'Для заказчиков платформа бесплатна: публикуйте заявки, получайте отклики и выбирайте исполнителей без ограничений. Подписку оплачивают только исполнители — проектировщики, эксперты и производители.'],
    ['Как проверяются исполнители?', 'Каждый проектировщик и эксперт проходит верификацию: проверяем членство в СРО, аккредитации и реквизиты организации. У верифицированных профилей есть отметка, а рейтинг формируется только из реальных завершённых проектов.'],
    ['Как проходит экспертиза на платформе?', 'Загружаете разделы проекта, эксперт выдаёт замечания в трекере — вы отвечаете на них итерациями прямо в системе. Вся переписка, версии файлов и статусы замечаний сохраняются в одном месте до выдачи заключения.'],
    ['Можно ли работать командой?', 'Да. На тарифах для организаций доступен командный доступ: распределяйте разделы между специалистами, следите за статусами и ведите несколько проектов параллельно.'],
    ['Как происходит оплата работ?', 'Договор и расчёты вы заключаете напрямую с исполнителем — платформа не берёт комиссию с суммы договора. Мы фиксируем этапы и документы, чтобы обе стороны были защищены.'],
    ['Что с нормативной базой?', 'В системе встроенный каталог ГОСТ, СП и ТУ с привязкой к разделам проекта. Замечания экспертизы ссылаются на конкретные пункты нормативов — ничего не нужно искать вручную.'],
  ];
  return (
    <section className="tl-section" id="faq">
      <p className="tl-eyebrow">FAQ</p>
      <h2 className="tl-h2">Частые вопросы</h2>
      <div className="tl-faq">
        {items.map(([q, a], i) => {
          const on = open === i;
          return (
            <div key={q} className={'tl-faq__item' + (on ? ' is-open' : '')}>
              <button className="tl-faq__q" onClick={() => setOpen(on ? -1 : i)} aria-expanded={on}>
                <span>{q}</span>
                <span className="tl-faq__chev"><Icon name="chevD" size={18} /></span>
              </button>
              <div className="tl-faq__a" style={{ gridTemplateRows: on ? '1fr' : '0fr' }}>
                <div><p>{a}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AnimatedSocials() {
  const [hover, setHover] = React.useState(null);
  const socials = [['Telegram', 'send', 'var(--blue)'], ['Чат', 'comment', 'var(--accent-2)'], ['Почта', 'mail', 'var(--green)'], ['Сайт', 'globe', 'var(--amber)']];
  return (
    <div className="tl-soc">
      {socials.map(([name, ic, c]) => (
        <a key={name} href="#" className={'tl-soc__item' + (hover && hover !== name ? ' is-dim' : '')}
          onClick={(e) => { e.preventDefault(); landingToast('Раздел скоро появится'); }}
          onMouseEnter={() => setHover(name)} onMouseLeave={() => setHover(null)}>
          <span className="tl-soc__name">{name}</span>
          <span className={'tl-soc__pop' + (hover === name ? ' is-on' : '')} style={{ color: c }}><Icon name={ic} size={26} /></span>
        </a>
      ))}
    </div>
  );
}

function Footer() {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);
  const [error, setError] = React.useState(false);
  const subscribe = (e) => {
    e.preventDefault();
    // Базовая фронтовая валидация email.
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) { setError(true); return; }
    setError(false);
    setSubscribed(true);
    setEmail('');
  };
  // Ссылка-заглушка: не прыгает на «#», даёт мягкий фидбек.
  const soon = (e) => { e.preventDefault(); landingToast('Раздел скоро появится'); };
  return (
    <footer className="tl-foot">
      <div className="tl-foot__grid">
        <div className="tl-foot__sub">
          <div className="tl-brand" style={{ marginBottom: 14 }}><FuncMark size={26} /> <span className="tl-shimmer">ФУНКЦИЯ</span></div>
          <p className="tl-foot__lead">Дайджест платформы: обновления, кейсы и новые возможности раз в месяц.</p>
          {subscribed ? (
            <p className="tl-foot__thanks" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green, #34d399)', fontWeight: 600, margin: '4px 0 0' }}>
              <Icon name="check" size={16} /> Спасибо за подписку!
            </p>
          ) : (
            <form className="tl-foot__form" onSubmit={subscribe} noValidate>
              <input
                type="email" placeholder="Ваш email" aria-label="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(false); }}
                aria-invalid={error || undefined}
                style={error ? { borderColor: 'var(--pink, #f472b6)' } : undefined}
              />
              <button type="submit" aria-label="Подписаться"><Icon name="send" size={16} /></button>
            </form>
          )}
          {error && !subscribed && (
            <p style={{ color: 'var(--pink, #f472b6)', fontSize: 12.5, margin: '8px 0 0' }}>Введите корректный email</p>
          )}
          <div className="tl-foot__glow" aria-hidden="true" />
        </div>
        <div className="tl-foot__col">
          <h5>Платформа</h5>
          <a href="#features">Возможности</a>
          <a href="#how">Как это работает</a>
          <a href="#pricing">Тарифы</a>
          <a href="#" onClick={soon}>Документация</a>
        </div>
        <div className="tl-foot__col">
          <h5>Контакты</h5>
          <address>
            <p>Москва, ул. Инженерная, 12</p>
            <p>Пн–Пт, 9:00–19:00</p>
            <p>+7 (495) 123-45-67</p>
            <p>hello@funktsiya.ru</p>
          </address>
        </div>
        <div className="tl-foot__col">
          <h5>Мы на связи</h5>
          <AnimatedSocials />
        </div>
      </div>
      <div className="tl-foot__bot">
        <span>© 2026 Функция · Единая платформа ПИР</span>
        <nav>
          <a href="#" onClick={soon}>Политика конфиденциальности</a>
          <a href="#" onClick={soon}>Условия использования</a>
          <a href="#" onClick={soon}>Cookie</a>
        </nav>
      </div>
    </footer>
  );
}

function Pricing({ go }) {
  const [annual, setAnnual] = React.useState(false);
  const plans = [
    { role: 'Заказчик', icon: 'building', tint: 'var(--green)', tagline: 'Публикуйте проекты и находите команду', free: true, cta: 'Начать бесплатно',
      features: ['Публикация заявок без ограничений', 'Поиск проектировщиков и экспертов', 'Базовый чат и обмен файлами', 'Сравнение откликов по заявке'] },
    { role: 'Проектировщик', icon: 'compass', tint: 'var(--accent-2)', tagline: 'Получайте заказы и растите репутацию', monthly: 1990, yearly: 1590, pop: true, cta: 'Подключить тариф',
      features: ['Отклики на заявки без лимита', 'Верифицированный профиль и СРО', 'Рейтинг и портфолио проектов', 'Доступ к биржам экспертизы', 'Приоритет в выдаче подбора'] },
    { role: 'Эксперт', icon: 'shield', tint: 'var(--blue)', tagline: 'Проверяйте проекты и выдавайте заключения', monthly: 3490, yearly: 2790, cta: 'Подключить тариф',
      features: ['Биржа экспертизы проектов', 'Трекер замечаний и итераций', 'Электронная выдача заключений', 'Аккредитация и верификация', 'Командная работа над проверкой'] },
    { role: 'Производитель', icon: 'box', tint: 'var(--pink)', tagline: 'Продвигайте решения в подборе', monthly: 4990, yearly: 3990, cta: 'Связаться с нами',
      features: ['Каталог решений с BIM-моделями', 'Нормативная привязка узлов', 'Продвижение в подборе решений', 'Аналитика спроса и заявок', 'Интеграции и доступ к API'] },
  ];
  return (
    <section className="tl-section" id="pricing">
      <p className="tl-eyebrow">Тарифы</p>
      <h2 className="tl-h2">Свой тариф для каждого участника</h2>
      <p className="tl-lead">Заказчики публикуют заявки бесплатно. Проектировщики, эксперты и производители подключают подписку под свою роль.</p>
      <div className="tl-billtoggle">
        <button className={!annual ? 'is-active' : ''} onClick={() => setAnnual(false)}>Помесячно</button>
        <button className={annual ? 'is-active' : ''} onClick={() => setAnnual(true)}>За год <span className="tl-bt-save">−20%</span></button>
      </div>
      <div className="tl-pricing tl-pricing--4">
        {plans.map(p => {
          const price = annual ? p.yearly : p.monthly;
          return (
            <div key={p.role} className={'tl-price' + (p.pop ? ' is-pop' : '')}>
              {p.pop && <span className="tl-price__badge">Популярный</span>}
              <span className="tl-price__ic" style={{ background: `color-mix(in srgb, ${p.tint} 18%, transparent)`, color: p.tint }}><Icon name={p.icon} size={22} /></span>
              <div className="tl-price__name">{p.role}</div>
              <div className="tl-price__desc">{p.tagline}</div>
              <div className="tl-price__amt">
                {p.free ? <b>Бесплатно</b> : <><b>{price.toLocaleString('ru-RU')} ₽</b><span>/ мес</span></>}
              </div>
              <div className="tl-price__billed">{p.free ? 'навсегда' : annual ? 'при оплате за год' : 'при помесячной оплате'}</div>
              <button className={'tl-price__btn' + (p.pop ? ' is-pop' : '')} onClick={() => go && go('auth')}>{p.cta}</button>
              <ul className="tl-price__feat">
                {p.features.map(f => <li key={f}><Icon name="check" size={15} /> {f}</li>)}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="tl-pricing__foot"><Icon name="shield" size={15} /> Оплата по счёту или картой · НДС включён · Отмена в любой момент</div>
    </section>
  );
}

function TestLanding({ go }) {
  const rootRef = React.useRef(null);
  React.useEffect(() => {
    const root = rootRef.current; if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = [...root.querySelectorAll('.tl-section, .tl-band')];
    els.forEach(el => el.classList.add('tl-rev'));
    let pending = els.slice();
    const check = () => {
      const vh = window.innerHeight;
      pending = pending.filter(el => {
        if (el.getBoundingClientRect().top < vh * 0.88) { el.classList.add('is-in'); return false; }
        return true;
      });
      if (!pending.length) root.removeEventListener('scroll', check);
    };
    check();
    root.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => { root.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, []);
  return <main className="tl" ref={rootRef}><Nav go={go} /><Hero go={go} /><Features go={go} /><ObjectTypes go={go} /><Steps /><RegionMap go={go} /><Pricing go={go} /><FAQ /><Band go={go} /><Footer /><LandingToast /></main>;
}

const ROUTE_MAP = {
  auth: '/auth', 'order-new': '/orders/new', landing: '/', dashboard: '/dashboard',
  designers: '/designers', experts: '/experts', manufacturers: '/manufacturers',
  expertise: '/expertise', standards: '/standards', chat: '/chat',
  analytics: '/analytics', settings: '/settings', orders: '/orders', pricing: '/auth',
};

export default function Page() {
  const router = useRouter();
  const go = React.useCallback((target) => { router.push(ROUTE_MAP[target] || '/'); }, [router]);
  return <TestLanding go={go} />;
}
