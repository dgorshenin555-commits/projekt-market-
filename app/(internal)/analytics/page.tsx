// @ts-nocheck
'use client';

/* Аналитика рынка ПИР — дизайн-система «Функция» (.fx).
   Эталонного экрана в Cloud Design нет, поэтому страница приведена к общей .fx-системе
   (как dashboard): page-head, stat/delta-карточки, .card-блоки, токены .fx, иконки _orders.
   Логика сохранена полностью: фильтр objectCategory, экспорт CSV (handleExport),
   данные KPI/дефицита/цен/трендов и расчёты баров — без изменений. */

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Icon } from '../../_orders/icons';
import '../../_orders/orders.css';

const KPI_STATS = [
  { label: 'Объем рынка (активные заявки)', value: '1.24 млрд ₽', trend: '+12.5%', isPositive: true, icon: 'wallet' },
  { label: 'Заявок на стадии П', value: '452', trend: '+5.2%', isPositive: true, icon: 'file' },
  { label: 'Зарегистрировано специалистов', value: '3 840', trend: '+142', isPositive: true, icon: 'users' },
  { label: 'Средний бюджет заявки', value: '2.7 млн ₽', trend: '-1.2%', isPositive: false, icon: 'target' },
];

const DEFICIT_DATA = [
  { section: 'ОВиК (Отопление и вентиляция)', orders: 86, supply: 12, ratio: 14, status: 'Критический дефицит', color: 'var(--red)' },
  { section: 'ВК (Водоснабжение)', orders: 74, supply: 22, ratio: 30, status: 'Высокий спрос', color: 'var(--amber)' },
  { section: 'СМ (Сметы)', orders: 120, supply: 48, ratio: 40, status: 'Умеренный спрос', color: 'var(--amber)' },
  { section: 'КР (Конструкции)', orders: 112, supply: 85, ratio: 75, status: 'Баланс', color: 'var(--accent)' },
  { section: 'АР (Архитектура)', orders: 105, supply: 156, ratio: 100, status: 'Большая конкуренция', color: 'var(--green)' },
];

const PRICES_DATA = [
  { section: 'КР (Конструктивные решения)', subtitle: 'Жилые комплексы', min: 300, avg: 650, max: 1200, unit: 'тыс. ₽' },
  { section: 'АР (Архитектурные решения)', subtitle: 'Коммерческая недвижимость', min: 250, avg: 500, max: 900, unit: 'тыс. ₽' },
  { section: 'ЭОМ (Электроснабжение)', subtitle: 'Промышленные объекты', min: 150, avg: 300, max: 800, unit: 'тыс. ₽' },
  { section: 'ОВиК (Отопление, вентиляция)', subtitle: 'Промышленные объекты', min: 200, avg: 450, max: 900, unit: 'тыс. ₽' },
  { section: 'ПОС (Организация строительства)', subtitle: 'Линейные объекты', min: 100, avg: 250, max: 500, unit: 'тыс. ₽' },
];

const TRENDS_DATA = [
  { label: 'Жилая недвижимость', percent: 45, color: '#8b6cf2' },
  { label: 'Промышленные объекты', percent: 25, color: '#f5b13d' },
  { label: 'Коммерческая', percent: 20, color: '#34d399' },
  { label: 'Инфраструктура', percent: 10, color: '#4aa3ff' },
];

export default function AnalyticsPage() {
  const [objectCategory, setObjectCategory] = useState<'all' | 'residential' | 'industrial'>('all');
  const { notify } = useApp();

  const handleExport = () => {
    const esc = (v: string | number) => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows: (string | number)[][] = [];

    rows.push(['Ключевые показатели']);
    rows.push(['Показатель', 'Значение', 'Динамика']);
    KPI_STATS.forEach((s) => rows.push([s.label, s.value, s.trend]));
    rows.push([]);

    rows.push(['Востребованность кадров (Дефицит)']);
    rows.push(['Раздел', 'Заявок', 'Свободно подрядчиков', 'Соотношение, %', 'Статус']);
    DEFICIT_DATA.forEach((d) => rows.push([d.section, d.orders, d.supply, d.ratio, d.status]));
    rows.push([]);

    rows.push(['Средняя стоимость контрактов по разделам']);
    rows.push(['Раздел', 'Тип объекта', 'Мин', 'Средняя', 'Макс', 'Ед. изм.']);
    PRICES_DATA.forEach((p) => rows.push([p.section, p.subtitle, p.min, p.avg, p.max, p.unit]));
    rows.push([]);

    rows.push(['Структура публикуемых ПИР']);
    rows.push(['Тип объекта', 'Доля, %']);
    TRENDS_DATA.forEach((t) => rows.push([t.label, t.percent]));

    const csv = '﻿' + rows.map((r) => r.map(esc).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    notify('Отчёт экспортирован');
  };

  return (
    <div className="fx animate-in">
      {/* Шапка */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Аналитика рынка ПИР</h1>
          <p className="page-sub">Мониторинг цен, кадрового дефицита и ключевых трендов проектирования</p>
        </div>
        <div className="row gap10" style={{ alignItems: 'center' }}>
          <div className="an-select">
            <Icon name="globe" size={15} />
            <select value={objectCategory} onChange={(e) => setObjectCategory(e.target.value as any)}>
              <option value="all">Все объекты</option>
              <option value="residential">Жилые здания</option>
              <option value="industrial">Промышленность</option>
            </select>
            <Icon name="chevD" size={14} />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleExport}>
            <Icon name="download" size={15} /> Экспорт отчёта
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {KPI_STATS.map((stat, i) => (
          <div key={i} className="stat">
            <div className="row between" style={{ alignItems: 'center', marginBottom: 14 }}>
              <div className="stat__icon" style={{ marginBottom: 0 }}><Icon name={stat.icon} /></div>
              <span className={'delta ' + (stat.isPositive ? 'up' : 'down')}>
                <Icon name={stat.isPositive ? 'trendUp' : 'trendDown'} /> {stat.trend}
              </span>
            </div>
            <div className="stat__num" style={{ fontSize: 25 }}>{stat.value}</div>
            <div className="stat__label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Дефицит + Тренды */}
      <div className="grid-2" style={{ marginBottom: 24, alignItems: 'stretch' }}>
        {/* Дефицит кадров */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="section-title row gap8" style={{ fontSize: 16, marginBottom: 8 }}>
            <Icon name="users" size={18} style={{ color: 'var(--accent-2)' }} /> Востребованность кадров (Дефицит)
          </h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 22, lineHeight: 1.5 }}>
            Отношение числа свободных подрядчиков к количеству активных заявок по разделам. Чем меньше шкала, тем острее дефицит специалистов.
          </p>
          <div className="col" style={{ gap: 18 }}>
            {DEFICIT_DATA.map((item, i) => (
              <div key={i}>
                <div className="row between" style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{item.section}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.status}</span>
                </div>
                <div className="an-track">
                  <div className="an-fill" style={{ width: `${item.ratio}%`, background: item.color }} />
                </div>
                <div className="row between dim" style={{ marginTop: 6, fontSize: 11 }}>
                  <span>Заявок: <b style={{ color: 'var(--text)' }}>{item.orders}</b></span>
                  <span>Свободно подрядчиков: <b style={{ color: 'var(--text)' }}>{item.supply}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Структура ПИР */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="section-title row gap8" style={{ fontSize: 16, marginBottom: 8 }}>
            <Icon name="chart" size={18} style={{ color: 'var(--accent-2)' }} /> Структура публикуемых ПИР
          </h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 22, lineHeight: 1.5 }}>
            Распределение активных заявок на платформе по типам объектов за текущий месяц.
          </p>

          <div style={{ marginBottom: 26 }}>
            <div className="an-stack">
              {TRENDS_DATA.map((t, i) => (
                <div
                  key={i}
                  style={{ width: `${t.percent}%`, height: '100%', background: t.color, borderRight: i !== TRENDS_DATA.length - 1 ? '2px solid var(--bg)' : 'none' }}
                  title={`${t.label}: ${t.percent}%`}
                />
              ))}
            </div>
          </div>

          <div className="col" style={{ gap: 14 }}>
            {TRENDS_DATA.map((t, i) => (
              <div key={i} className="row between" style={{ alignItems: 'center' }}>
                <div className="row gap10" style={{ alignItems: 'center' }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: t.color }} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{t.label}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{t.percent}%</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 22 }}>
            <div className="an-insight">
              <span className="an-insight__ic"><Icon name="bulb" size={16} /></span>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
                <b style={{ color: 'var(--text)' }}>Инсайт:</b> Наблюдается рост заявок на промышленные объекты на <b style={{ color: 'var(--text)' }}>15%</b> с начала года, что связано с развитием внутреннего производства.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Средняя стоимость */}
      <div className="card">
        <h3 className="section-title" style={{ fontSize: 16, marginBottom: 8 }}>Средняя стоимость контрактов по разделам</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
          Цены формируются на основе успешно закрытых контрактов за последние 30 дней.
        </p>

        <div className="col" style={{ gap: 22 }}>
          {PRICES_DATA.map((price, i) => {
            const MAX_SCALE = 1500;
            const leftPercent = (price.min / MAX_SCALE) * 100;
            const widthPercent = ((price.max - price.min) / MAX_SCALE) * 100;
            const avgPercent = ((price.avg - price.min) / (price.max - price.min)) * 100;

            return (
              <div key={i} className="an-pricerow">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{price.section}</div>
                  <div className="dim" style={{ fontSize: 12, marginTop: 4 }}>{price.subtitle}</div>
                </div>

                <div>
                  <div style={{ position: 'relative', width: '100%', height: 24, display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', width: '100%', height: 4, background: 'var(--surface-3)', borderRadius: 2 }} />
                    <div style={{
                      position: 'absolute', left: `${leftPercent}%`, width: `${widthPercent}%`, height: 8,
                      background: 'var(--accent-soft)', borderRadius: 4, border: '1px solid var(--accent-line)'
                    }}>
                      <div style={{
                        position: 'absolute', left: `${avgPercent}%`, top: -4, width: 4, height: 14,
                        background: 'var(--accent)', borderRadius: 2, transform: 'translateX(-50%)'
                      }} />
                    </div>
                  </div>
                  <div className="row between dim" style={{ fontSize: 12, marginTop: 8 }}>
                    <span>от {price.min} {price.unit}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>Средняя: {price.avg} {price.unit}</span>
                    <span>до {price.max} {price.unit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
