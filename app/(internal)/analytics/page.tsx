'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Wallet, 
  Target, 
  Activity, 
  BarChart3
} from 'lucide-react';

const KPI_STATS = [
  { 
    label: 'Объем рынка (активные заявки)', 
    value: '1.24 млрд ₽', 
    trend: '+12.5%', 
    isPositive: true,
    icon: Wallet 
  },
  { 
    label: 'Заявок на стадии П', 
    value: '452', 
    trend: '+5.2%', 
    isPositive: true,
    icon: FileText 
  },
  { 
    label: 'Зарегистрировано специалистов', 
    value: '3 840', 
    trend: '+142', 
    isPositive: true,
    icon: Users 
  },
  { 
    label: 'Средний бюджет заявки', 
    value: '2.7 млн ₽', 
    trend: '-1.2%', 
    isPositive: false,
    icon: Target 
  },
];

const DEFICIT_DATA = [
  { section: 'ОВиК (Отопление и вентиляция)', orders: 86, supply: 12, ratio: 14, status: 'Критический дефицит', color: 'var(--status-error)' },
  { section: 'ВК (Водоснабжение)', orders: 74, supply: 22, ratio: 30, status: 'Высокий спрос', color: 'var(--status-warning)' },
  { section: 'СМ (Сметы)', orders: 120, supply: 48, ratio: 40, status: 'Умеренный спрос', color: '#f59e0b' },
  { section: 'КР (Конструкции)', orders: 112, supply: 85, ratio: 75, status: 'Баланс', color: 'var(--accent)' },
  { section: 'АР (Архитектура)', orders: 105, supply: 156, ratio: 100, status: 'Большая конкуренция', color: 'var(--status-success)' },
];

const PRICES_DATA = [
  { section: 'КР (Конструктивные решения)', subtitle: 'Жилые комплексы', min: 300, avg: 650, max: 1200, unit: 'тыс. ₽' },
  { section: 'АР (Архитектурные решения)', subtitle: 'Коммерческая недвижимость', min: 250, avg: 500, max: 900, unit: 'тыс. ₽' },
  { section: 'ЭОМ (Электроснабжение)', subtitle: 'Промышленные объекты', min: 150, avg: 300, max: 800, unit: 'тыс. ₽' },
  { section: 'ОВиК (Отопление, вентиляция)', subtitle: 'Промышленные объекты', min: 200, avg: 450, max: 900, unit: 'тыс. ₽' },
  { section: 'ПОС (Организация строительства)', subtitle: 'Линейные объекты', min: 100, avg: 250, max: 500, unit: 'тыс. ₽' },
];

const TRENDS_DATA = [
  { label: 'Жилая недвижимость', percent: 45, color: '#6366f1' },
  { label: 'Промышленные объекты', percent: 25, color: '#f59e0b' },
  { label: 'Коммерческая', percent: 20, color: '#10b981' },
  { label: 'Инфраструктура', percent: 10, color: '#8b5cf6' },
];

export default function AnalyticsPage() {
  const [objectCategory, setObjectCategory] = useState<'all' | 'residential' | 'industrial'>('all');

  return (
    <div className="animate-in" style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 className="dsn-title" style={{ marginBottom: 8 }}>Аналитика рынка ПИР</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Мониторинг цен, кадрового дефицита и ключевых трендов проектирования
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select 
            className="dsn-filter-chip" 
            value={objectCategory}
            onChange={(e) => setObjectCategory(e.target.value as any)}
            style={{ fontWeight: 600 }}
          >
            <option value="all">🌐 Все объекты</option>
            <option value="residential">🏢 Жилые здания</option>
            <option value="industrial">🏭 Промышленность</option>
          </select>
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} /> Экспорт отчета
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 20, 
        marginBottom: 32 
      }}>
        {KPI_STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: 8, 
                  background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <Icon size={20} />
                </div>
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: 4, 
                  color: stat.isPositive ? 'var(--status-success)' : 'var(--status-error)',
                  fontSize: 13, fontWeight: 700,
                  background: stat.isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  padding: '4px 8px', borderRadius: 4
                }}>
                  {stat.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {stat.trend}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'revert', gap: 24 }}>
        {/* CSS Row 1: Deficit and Trends (2 columns on desktop) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
          
          {/* Card: Specialists Deficit */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="var(--accent)" /> Востребованность кадров (Дефицит)
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
              Отношение числа свободных подрядчиков к количеству активных заявок по разделам. Чем меньше шкала, тем острее дефицит специалистов.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {DEFICIT_DATA.map((item, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{item.section}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.status}</span>
                  </div>
                  
                  {/* CSS Progress Bar */}
                  <div style={{ width: '100%', height: 8, background: 'var(--bg-input)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${item.ratio}%`, 
                      height: '100%', 
                      background: item.color,
                      borderRadius: 4,
                      transition: 'width 1s ease-out'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>Заявок: <b>{item.orders}</b></span>
                    <span>Свободно подрядчиков: <b>{item.supply}</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Market Trends */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={18} color="var(--accent)" /> Структура публикуемых ПИР
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
              Распределение активных заявок на платформе по типам объектов за текущий месяц.
            </p>

            {/* Simulated Stacked Bar Chart */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ 
                width: '100%', height: 24, borderRadius: 12, display: 'flex', overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {TRENDS_DATA.map((t, i) => (
                  <div key={i} style={{ 
                    width: `${t.percent}%`, height: '100%', background: t.color,
                    borderRight: i !== TRENDS_DATA.length - 1 ? '2px solid var(--bg-primary)' : 'none'
                  }} title={`${t.label}: ${t.percent}%`} />
                ))}
              </div>
            </div>

            {/* Trends Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {TRENDS_DATA.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: t.color }} />
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{t.label}</span>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{t.percent}%</span>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: 24 }}>
               <div style={{ background: 'var(--bg-input)', padding: 16, borderRadius: 8 }}>
                 <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                   💡 <b>Инсайт:</b> Наблюдается рост заявок на промышленные объекты на <b>15%</b> с начала года, что связано с развитием внутреннего производства.
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* Card: Average Prices Distribution */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Средняя стоимость контрактов по разделам</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
            Цены формируются на основе успешно закрытых контрактов за последние 30 дней.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {PRICES_DATA.map((price, i) => {
              // Convert values to percentage to render the price distribution bar
              // Let's assume max scale is 1500 for visualization
              const MAX_SCALE = 1500;
              const leftPercent = (price.min / MAX_SCALE) * 100;
              const widthPercent = ((price.max - price.min) / MAX_SCALE) * 100;
              const avgPercent = ((price.avg - price.min) / (price.max - price.min)) * 100;

              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: 24, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{price.section}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{price.subtitle}</div>
                  </div>
                  
                  <div>
                    {/* Visual Bar */}
                    <div style={{ position: 'relative', width: '100%', height: 24, display: 'flex', alignItems: 'center' }}>
                      {/* Background track line */}
                      <div style={{ position: 'absolute', width: '100%', height: 4, background: 'var(--bg-input)', borderRadius: 2 }} />
                      
                      {/* Range fill */}
                      <div style={{ 
                        position: 'absolute', 
                        left: `${leftPercent}%`, 
                        width: `${widthPercent}%`, 
                        height: 8, 
                        background: 'rgba(59, 130, 246, 0.2)', 
                        borderRadius: 4,
                        border: '1px solid rgba(59, 130, 246, 0.5)'
                      }}>
                         {/* Average marker */}
                         <div style={{
                           position: 'absolute',
                           left: `${avgPercent}%`,
                           top: -4,
                           width: 4,
                           height: 14,
                           background: 'var(--accent)',
                           borderRadius: 2,
                           transform: 'translateX(-50%)'
                         }} />
                      </div>
                    </div>
                    
                    {/* Numbers below bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                      <span>от {price.min} {price.unit}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Средняя: {price.avg} {price.unit}</span>
                      <span>до {price.max} {price.unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
