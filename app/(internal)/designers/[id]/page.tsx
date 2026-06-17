// @ts-nocheck
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_DESIGNERS, MOCK_PROJECTS } from '@/lib/mock-data';
import { useApp } from '@/lib/store';
import { Icon } from '../../../_orders/icons';
import '../../../_orders/orders.css';

const TABS = ['Обзор', 'Портфолио', 'Отзывы', 'Документы и СРО'];

const SHORTLIST_KEY = 'pm_shortlist';

// Уникальные разделы (защита от дублей в данных — BUG-014).
function uniqueSections(sections: string[]): string[] {
  return Array.from(new Set(sections));
}

const AVATAR_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
];

// Демо-агрегат рейтинга (гистограмма) в духе эталона Cloud Design.
const REVIEW_AGG = [
  ['5★', 78],
  ['4★', 18],
  ['3★', 4],
  ['2★', 0],
  ['1★', 0],
];

// Демо-отзывы в духе эталона.
const REVIEWS = [
  {
    ini: 'ОК', g: 'linear-gradient(135deg, #a06bf5 0%, #7d52e8 100%)', name: 'Олег Климов', org: 'ООО «СтройИнвест»', r: '5.0', date: '12 февраля 2025', proj: 'ЖК «Ренессанс»',
    text: 'Раздел КР выполнен раньше срока, все замечания экспертизы сняты с первой итерации. На связи постоянно — отвечает в течение получаса. Однозначно рекомендую.',
  },
  {
    ini: 'АН', g: 'linear-gradient(135deg, #3ad6a6 0%, #22b886 100%)', name: 'Анна Новикова', org: 'ИП Новикова', r: '4.5', date: '28 января 2025', proj: 'МФК «Старый город»',
    text: 'Грамотный специалист, аккуратная документация по ГОСТ. Пара правок по планировкам заняла время, но итог отличный.',
  },
  {
    ini: 'СМ', g: 'linear-gradient(135deg, #f5933d 0%, #ec6f2a 100%)', name: 'Сергей Морозов', org: 'ООО «Девелопмент-Групп»', r: '5.0', date: '9 декабря 2024', proj: 'БЦ «Приморский»',
    text: 'Сложный объект с ограничениями по участку — решение нашли быстро. BIM-модель чистая, коллизий минимум. Будем работать снова.',
  },
];

// Демо-документы/допуски со статус-бейджами в духе эталона.
const DOCS = [
  { ic: 'building', name: 'Выписка из реестра СРО', sub: 'СРО НБПИ-04-032 · Действует до 14.08.2026', tag: ['done', 'Активно'] },
  { ic: 'cert', name: 'Специалист НРС (ГИП)', sub: '№ П-145122 · Минстрой России', tag: ['done', 'Активно'] },
  { ic: 'award', name: 'Диплом СПбГАСУ', sub: 'Архитектор · 2012 год', tag: null },
  { ic: 'shield', name: 'Страхование ответственности', sub: 'Полис № 24/0915 · до 31.12.2025', tag: ['wait', 'Истекает'] },
];

export default function DesignerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { notify } = useApp();
  const id = params?.id as string;
  const [activeTab, setActiveTab] = useState('Обзор');
  const [inShortlist, setInShortlist] = useState(false);

  // Ищем дизайнера по ID, или берем первого как фолбек (на случай перезагрузки страницы)
  const designer = MOCK_DESIGNERS.find(d => d.id === id) || MOCK_DESIGNERS[0];

  // Инициализация состояния шортлиста из localStorage (BUG-016) —
  // в useEffect, чтобы не было SSR-mismatch.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = JSON.parse(localStorage.getItem(SHORTLIST_KEY) || '[]');
      if (Array.isArray(saved)) setInShortlist(saved.includes(designer.id));
    } catch {}
  }, [designer.id]);

  const toggleShortlist = () => {
    if (typeof window === 'undefined') return;
    let saved: string[] = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(SHORTLIST_KEY) || '[]');
      if (Array.isArray(parsed)) saved = parsed.filter((x): x is string => typeof x === 'string');
    } catch {}
    const isIn = saved.includes(designer.id);
    const next = isIn ? saved.filter((x) => x !== designer.id) : [...saved, designer.id];
    localStorage.setItem(SHORTLIST_KEY, JSON.stringify(next));
    setInShortlist(!isIn);
    notify(isIn ? 'Убрано из проекта' : 'Добавлено в проект');
  };

  if (!designer) {
    return (
      <div className="fx animate-in">
        <div className="empty">
          <div className="empty__icon"><Icon name="search" size={28} /></div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Специалист не найден</div>
          <button onClick={() => router.push('/designers')} className="btn btn-primary" style={{ marginTop: 16 }}>
            К списку каталога
          </button>
        </div>
      </div>
    );
  }

  const avatarGradient = AVATAR_COLORS[MOCK_DESIGNERS.indexOf(designer) % AVATAR_COLORS.length];
  const avatarText = designer.type === 'company' ? '' : designer.name.substring(0, 2).toUpperCase();

  return (
    <div className="fx animate-in" style={{ paddingBottom: 80 }}>
      {/* Breadcrumbs */}
      <div className="breadcrumb">
        <Link href="/designers" className="link">Каталог специалистов</Link>
        <Icon name="chevR" size={13} />
        <span className="dim">{designer.name}</span>
      </div>

      {/* Header Profile Hero */}
      <div className="profile-hero">
        <div className="profile-hero__bg" />
        <div className="profile-hero__row">
          <div className="avatar" style={{ width: 108, height: 108, fontSize: 38, background: avatarGradient, flexShrink: 0 }}>
            {designer.type === 'company' ? <Icon name="building" size={44} /> : avatarText}
          </div>

          <div className="grow" style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
              {designer.name}
              {designer.rating > 4.7 && (
                <span title="Топ специалист" style={{ display: 'inline-flex', color: 'var(--amber)' }}>
                  <Icon name="trophy" size={20} />
                </span>
              )}
            </h1>

            <div className="meta-row" style={{ fontSize: 14 }}>
              <span>
                <Icon name="pin" />
                {designer.city} {designer.region && <span className="dim">({designer.region})</span>}
              </span>
              <span>
                <Icon name="star" style={{ color: 'var(--amber)' }} />
                {designer.rating} ({designer.reviewsLabel})
              </span>
              {designer.type === 'company' && (
                <span style={{ color: 'var(--accent-2)' }}>
                  <Icon name="building" />
                  Организация
                </span>
              )}
            </div>

            <div className="chips mt12">
              {uniqueSections(designer.sections).map((s) => (
                <span key={s} className="chip chip-code">{s}</span>
              ))}
            </div>
          </div>

          <div className="row gap10">
            <button className="btn btn-ghost" onClick={() => notify('Сообщения — в разработке')}>
              <Icon name="comment" size={15} /> Написать
            </button>
            <button
              className={inShortlist ? 'btn btn-ghost' : 'btn btn-primary'}
              onClick={toggleShortlist}
            >
              {inShortlist
                ? <><Icon name="check" size={15} /> В проекте</>
                : <><Icon name="rocket" size={15} /> Пригласить в проект</>}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={'tab' + (activeTab === tab ? ' is-active' : '')}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="detail__grid">
        {/* Left main content */}
        <div style={{ minWidth: 0 }}>
          {activeTab === 'Обзор' && (
            <div className="card animate-in" style={{ minWidth: 0 }}>
              <h3 className="section-title" style={{ marginBottom: 14 }}>О специалисте</h3>
              <p className="muted" style={{ lineHeight: 1.6, fontSize: 14.5, marginTop: 0 }}>
                {designer.description ||
                  `${designer.type === 'company' ? 'Проектная организация' : 'Специалист'} с богатым опытом работы на рынке. Основная специализация: разработка проектной и рабочей документации для объектов различного назначения. Высокое качество чертежей, соблюдение сроков и норм оформления (ГОСТ, СП).`}
              </p>

              <div className="grid-2 mt24" style={{ gap: 28 }}>
                <div>
                  <div className="overline">Программное обеспечение</div>
                  <div className="chips mt12">
                    {['AutoCAD', 'Revit', 'Navisworks', 'Lira-SAPR'].map(s => (
                      <span key={s} className="chip">{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="overline">Достижения на Функции</div>
                  <div className="col gap10 mt12">
                    {(designer.achievements?.length ? designer.achievements : ['Проверенный профиль', 'Быстрый отклик', '+10 проектов за квартал']).map((ach, i) => (
                      <span key={i} className="row gap8" style={{ fontSize: 14 }}>
                        <Icon name="checkCircle" size={16} style={{ color: 'var(--green)' }} />
                        {ach}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="divider mt24" />
              <div className="overline mt24">Разделы документации</div>
              <div className="chips mt12">
                {uniqueSections(designer.sections).map((c) => (
                  <span key={c} className="chip chip-code">{c}</span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Портфолио' && (
            <div className="card animate-in" style={{ minWidth: 0 }}>
              <div className="row between" style={{ marginBottom: 16 }}>
                <h3 className="section-title" style={{ margin: 0 }}>Примеры работ ({designer.projectsCount})</h3>
                <span className="dim" style={{ fontSize: 13 }}>Показаны 4 последних</span>
              </div>

              <div className="grid-2" style={{ gap: 16 }}>
                {MOCK_PROJECTS.map((p, idx) => (
                  <div key={idx} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="thumb thumb-tower" style={{ height: 132, borderRadius: 0 }} />
                    <div style={{ padding: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{p.title}</div>
                      <div className="col gap6 muted mt12" style={{ fontSize: 13 }}>
                        <span className="row gap6"><Icon name="pin" size={13} />{p.location}</span>
                        <span className="row gap6"><Icon name="layers" size={13} />Раздел: {designer.sections[0]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Отзывы' && (
            <div className="card animate-in" style={{ minWidth: 0 }}>
              {/* Агрегат рейтинга + гистограмма */}
              <div className="row gap24 wrap" style={{ marginBottom: 22, alignItems: 'center' }}>
                <div style={{ textAlign: 'center', paddingRight: 24, borderRight: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 42, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{designer.rating}</div>
                  <div className="row gap4" style={{ justifyContent: 'center', marginTop: 8 }}>
                    {[0, 1, 2, 3, 4].map(i => (
                      <Icon key={i} name="star" size={14} style={{ color: i < Math.round(designer.rating) ? 'var(--amber)' : 'var(--text-mute)' }} />
                    ))}
                  </div>
                  <div className="dim" style={{ fontSize: 12.5, marginTop: 6 }}>{designer.reviewsLabel}</div>
                </div>
                <div className="col gap8 grow" style={{ minWidth: 220 }}>
                  {REVIEW_AGG.map(([lbl, pct]) => (
                    <div key={lbl} className="row gap10" style={{ fontSize: 12.5 }}>
                      <span className="muted" style={{ width: 26 }}>{lbl}</span>
                      <span className="grow" style={{ height: 6, borderRadius: 99, background: 'var(--surface-3)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: pct + '%', background: 'var(--amber)' }} />
                      </span>
                      <span className="dim" style={{ width: 34, textAlign: 'right' }}>{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Карточки отзывов */}
              <div className="col gap16">
                {REVIEWS.map(rv => (
                  <div key={rv.name} className="card" style={{ background: 'var(--surface-2)' }}>
                    <div className="row gap12" style={{ marginBottom: 10 }}>
                      <div className="avatar" style={{ width: 40, height: 40, fontSize: 14, background: rv.g }}>{rv.ini}</div>
                      <div className="grow">
                        <div className="row between">
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{rv.name}</div>
                          <span className="row gap6" style={{ fontSize: 13.5, color: 'var(--text-dim)' }}>
                            <Icon name="star" size={14} style={{ color: 'var(--amber)' }} />{rv.r}
                          </span>
                        </div>
                        <div className="dim" style={{ fontSize: 12.5 }}>{rv.org} · {rv.date}</div>
                      </div>
                    </div>
                    <p className="muted" style={{ margin: '0 0 10px', fontSize: 13.5, lineHeight: 1.55 }}>{rv.text}</p>
                    <span className="chip"><Icon name="portfolio" size={13} />{rv.proj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Документы и СРО' && (
            <div className="card animate-in" style={{ minWidth: 0 }}>
              <h3 className="section-title" style={{ marginBottom: 6 }}>Документы и допуски</h3>
              <p className="muted" style={{ margin: '0 0 18px', fontSize: 13.5 }}>
                Документы проверены платформой «Функция». Членство в СРО подтверждено в реестре НОПРИЗ.
              </p>

              {/* Бейдж подтверждения СРО */}
              <div className="row gap14" style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(52,211,153,.06)', border: '1px solid rgba(52,211,153,.22)', marginBottom: 18 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'rgba(52,211,153,.12)', color: 'var(--green)', flex: 'none' }}>
                  <Icon name="shield" size={20} />
                </div>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Членство в СРО подтверждено</div>
                  <div className="dim" style={{ fontSize: 12.5, marginTop: 2 }}>{designer.sroNumber || 'СРО-П-123-4567890'}</div>
                </div>
                <span className="badge done"><i />Подтверждено</span>
              </div>

              {/* Список документов со статус-бейджами */}
              <div className="col gap10">
                {DOCS.map(d => (
                  <div key={d.name} className="row gap14" style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', color: 'var(--accent-2)', flex: 'none' }}>
                      <Icon name={d.ic} size={20} />
                    </div>
                    <div className="grow" style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                      <div className="dim" style={{ fontSize: 12.5, marginTop: 2 }}>{d.sub}</div>
                    </div>
                    {d.tag && <span className={'badge ' + d.tag[0]}><i />{d.tag[1]}</span>}
                    <button className="iconbtn" title="Скачать" onClick={() => notify('Скачивание файла — в разработке')}>
                      <Icon name="download" size={17} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="col gap20">
          <div className="card">
            <div className="row between" style={{ marginBottom: 12 }}>
              <span className="dim" style={{ fontSize: 13, fontWeight: 600 }}>График загрузки</span>
              <span className="badge done"><i />Свободен</span>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>
              Готов взять проект в работу прямо сейчас. Среднее время ответа на заявку — менее 30 минут.
            </p>
          </div>

          <div className="card">
            <h3 className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>Статистика профиля</h3>
            <div className="col gap14">
              <div className="row between" style={{ fontSize: 14 }}>
                <span className="muted">Выполнено на платформе</span>
                <b style={{ color: '#fff' }}>{designer.projectsCount} проектов</b>
              </div>
              {designer.yearsExperience && (
                <div className="row between" style={{ fontSize: 14 }}>
                  <span className="muted">Стаж работы</span>
                  <b style={{ color: '#fff' }}>{designer.yearsExperience} лет</b>
                </div>
              )}
              <div className="row between" style={{ fontSize: 14 }}>
                <span className="muted">Процент успешных сделок</span>
                <b style={{ color: 'var(--accent-2)' }}>98%</b>
              </div>
              <div className="row between" style={{ fontSize: 14 }}>
                <span className="muted">Рейтинг заказчиков</span>
                <b style={{ color: 'var(--accent-2)' }}>{designer.rating} / 5.0</b>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title" style={{ fontSize: 16, marginBottom: 14 }}>Контактные данные</h3>
            <div className="col gap12 muted" style={{ fontSize: 14 }}>
              {designer.phone && (
                <span className="row gap10">
                  <Icon name="phone" size={16} style={{ color: 'var(--accent-2)' }} />
                  {designer.phone}
                </span>
              )}
              {designer.email && (
                <span className="row gap10">
                  <Icon name="mail" size={16} style={{ color: 'var(--accent-2)' }} />
                  {designer.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
