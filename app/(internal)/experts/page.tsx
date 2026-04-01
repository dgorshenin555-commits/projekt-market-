'use client';

import { useState } from 'react';
import { REGIONS } from '@/lib/constants';
import projBg from '@/public/project-buildings.png';

// --- Типы и Моковые данные ---
type Expert = {
  id: string;
  name: string;
  type: 'company' | 'person';
  services: string[];
  city: string;
  region?: string;
  accreditation: string;
  rating: number;
  reviewsLabel: string;
  reportsCount: number;
  yearsExperience: number;
  phone?: string;
  email?: string;
  achievements?: string[];
  description?: string;
};

const EXPERTISE_SERVICES = ['Негосударственная экспертиза ПД', 'Аудит смет', 'BIM/ТИМ контроль', 'Проверка узлов (КР)', 'Инженерные сети'];

const MOCK_EXPERTS: Expert[] = [
  {
    id: 'exp1',
    name: 'ООО «Эксперт-Регион»',
    type: 'company',
    services: ['Негосударственная экспертиза ПД', 'Аудит смет'],
    city: 'Москва',
    accreditation: 'Аккредитация МИНСТРОЙ №0015',
    rating: 4.9,
    reviewsLabel: 'Надёжно',
    reportsCount: 412,
    yearsExperience: 8,
    phone: '+7 495 222-33-44',
    email: 'info@expert-region.ru',
    achievements: ['400+ положительных заключений', 'Госзаказ', 'Сжатые сроки'],
    description: 'Полный комплекс услуг по негосударственной экспертизе ПД и инженерных изысканий.'
  },
  {
    id: 'exp2',
    name: 'Ковалёв Иван Иванович',
    type: 'person',
    services: ['Проверка узлов (КР)', 'Аудит смет'],
    city: 'Санкт-Петербург',
    accreditation: 'Специалист НРС №145122',
    rating: 4.8,
    reviewsLabel: 'Высокий рейтинг',
    reportsCount: 94,
    yearsExperience: 14,
    phone: '+7 911 345-67-89',
    email: 'kovalev.ii@expertaudit.ru',
    achievements: ['Аудит металлоконструкций', 'Оптимизация смет ДО 15%'],
  },
  {
    id: 'exp3',
    name: 'АО «BIM Технологии»',
    type: 'company',
    services: ['BIM/ТИМ контроль', 'Инженерные сети'],
    city: 'Казань',
    region: 'Республика Татарстан',
    accreditation: 'ISO-19650 Сертификат',
    rating: 4.7,
    reviewsLabel: 'Инновации',
    reportsCount: 156,
    yearsExperience: 5,
    phone: '+7 843 125-45-67',
    email: 'hello@bimtech.audit',
    achievements: ['Коллизии', 'Моделирование', 'Снижение рисков'],
    description: 'Осуществляем независимый BIM-аудит (Navisworks, Revit) перед выдачей ПД в производство работ.'
  },
  {
    id: 'exp4',
    name: 'Ефремова Анна',
    type: 'person',
    services: ['Инженерные сети', 'BIM/ТИМ контроль'],
    city: 'Новосибирск',
    accreditation: 'Инженер-эксперт ПБ',
    rating: 5.0,
    reviewsLabel: 'Топ-эксперт',
    reportsCount: 58,
    yearsExperience: 11,
    phone: '+7 923 111-22-33',
    achievements: ['ВК', 'ОВиК', 'Пожарная безопасность']
  },
  {
    id: 'exp5',
    name: 'Центр Сметного Аудита',
    type: 'company',
    services: ['Аудит смет', 'Негосударственная экспертиза ПД'],
    city: 'Краснодар',
    accreditation: 'Лицензия №24/11',
    rating: 4.6,
    reviewsLabel: 'Стабильно',
    reportsCount: 812,
    yearsExperience: 18,
    achievements: ['Крупные ГОС-объекты', 'Дотошная проверка']
  }
];

const EXPERTISE_PROJECTS = [
  { id: 'ep1', title: 'ЖК "Симфония"', location: 'г. Москва', count: '14 разделов' },
  { id: 'ep2', title: 'Складской комплекс', location: 'МО, Химки', count: 'КР, ОВиК' },
  { id: 'ep3', title: 'Школа на 1200 мест', location: 'Новосибирск', count: 'Полная экспертиза' },
];

const TABS = ['Сводка', 'Аудиторы', 'Заключения', 'Услуги'];

const AVATAR_COLORS = [
  'linear-gradient(135deg, #10b981 0%, #047857 100%)',   // Emerald
  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',   // Blue
  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',   // Purple
  'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',   // Amber
  'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',   // Red
];

export default function ExpertsPage() {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [activeTab, setActiveTab] = useState('Сводка');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(MOCK_EXPERTS[0]);

  const filtered = MOCK_EXPERTS.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (regionFilter && e.city !== regionFilter) return false;
    if (serviceFilter && !e.services.includes(serviceFilter)) return false;
    return true;
  });

  const featured = MOCK_EXPERTS[0];

  return (
    <div className="animate-in">
      {/* Top filter bar */}
      <div className="dsn-filter-bar">
        <div className="dsn-filter-tabs">
          <button className="dsn-filter-tab-icon">☰</button>
          <button className="dsn-filter-tab-icon active">🛡️</button>
          <span className="dsn-filter-divider" />
        </div>
        <select className="dsn-filter-chip" value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
          <option value="">📍 Регион</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="dsn-filter-chip" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
          <option value="">🛡️ Тип проверки</option>
          {EXPERTISE_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="dsn-filter-chip">📜 Сертификаты</button>
        <button className="dsn-filter-chip">⚙ Фильтры</button>
      </div>

      {/* Main content: 3 column layout */}
      <div className="dsn-layout">
        {/* Left column: Title + search + list */}
        <div className="dsn-main">
          <h1 className="dsn-title">Экспертиза проектов<br />и BIM-контроль</h1>

          {/* Search */}
          <div className="dsn-search-wrapper">
            <span className="dsn-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Поиск аудиторов, экспертов, компаний..."
              className="dsn-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="dsn-tabs">
            {TABS.map((t) => (
              <button
                key={t}
                className={`dsn-tab ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
              </button>
            ))}
            <button className="dsn-tab">⋯</button>
          </div>

          {/* Featured card */}
          <div className="dsn-featured-card" onClick={() => setSelectedExpert(featured)}>
            <div className="dsn-featured-avatar">
              <div className="dsn-avatar-circle" style={{ background: AVATAR_COLORS[0] }}>
                {featured.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="dsn-featured-info">
              <div className="dsn-featured-name">{featured.name} <span style={{ fontSize: 14, color: 'var(--status-success)', marginLeft: 8 }}>✓ Лидер отрасли</span></div>
              <div className="dsn-featured-sections">
                {featured.services.map((s, i) => (
                  <span key={i} className="dsn-section-tag" style={{ background: 'var(--status-success)', color: 'white', border: 'none' }}>{s}</span>
                ))}
              </div>
              <div className="dsn-featured-city">📍 {featured.city}</div>
              <div className="dsn-featured-sro">📜 {featured.accreditation}</div>
              <div className="dsn-featured-stats">
                <span>⭐ {featured.rating}</span>
                <span>{featured.reviewsLabel}</span>
                <span>✅ {featured.reportsCount} заключений</span>
              </div>
              <div className="dsn-featured-actions">
                <button className="btn btn-secondary btn-sm">Открыть страницу</button>
                <button className="btn btn-primary btn-sm" style={{ background: 'var(--status-success)', borderColor: 'var(--status-success)' }}>Заказать экспертизу →</button>
              </div>
            </div>
          </div>

          {/* Grid of expert cards */}
          <div className="dsn-grid">
            {filtered.filter(e => e.id !== featured.id).map((expert, idx) => (
              <div
                key={expert.id}
                className={`dsn-card ${selectedExpert?.id === expert.id ? 'selected' : ''}`}
                onClick={() => setSelectedExpert(expert)}
                style={{
                  borderLeft: selectedExpert?.id === expert.id ? '3px solid var(--status-success)' : undefined
                }}
              >
                <div className="dsn-card-header">
                  <div className="dsn-card-avatar" style={{ background: AVATAR_COLORS[(idx + 1) % AVATAR_COLORS.length] }}>
                    {expert.type === 'company' ? '🏢' : expert.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="dsn-card-header-info">
                    <div className="dsn-card-name" style={{ fontSize: 15 }}>{expert.name}</div>
                    <div className="dsn-card-sections">
                      {expert.services.map((s, i) => (
                        <span key={i} className="dsn-section-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="dsn-card-city">📍 {expert.city}</div>
                {expert.accreditation && (
                  <div className="dsn-card-sro">
                    <span className="dsn-sro-icon">📜</span>
                    <span className="dsn-sro-number">{expert.accreditation}</span>
                  </div>
                )}
                <div className="dsn-card-stats">
                  <span>⭐ {expert.rating}</span>
                  <span>{expert.reviewsLabel}</span>
                  <span>✅ {expert.reportsCount} проверок</span>
                </div>
                <div className="dsn-card-actions">
                  {expert.achievements?.slice(0, 2).map((a, i) => (
                     <span key={i} style={{ fontSize: 11, background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: 4, color: 'var(--text-muted)' }}>{a}</span>
                  ))}
                  <button className="dsn-action-btn primary" style={{ background: 'transparent', color: 'var(--status-success)', border: '1px solid var(--status-success)' }}>Выбрать →</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="dsn-sidebar">
          {selectedExpert && (
            <div className="dsn-profile-card">
              <div className="dsn-profile-avatar" style={{ background: AVATAR_COLORS[MOCK_EXPERTS.indexOf(selectedExpert) % AVATAR_COLORS.length] }}>
                {selectedExpert.type === 'company' ? '🏢' : selectedExpert.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="dsn-profile-name">{selectedExpert.name}</div>
              <div className="dsn-profile-sections">
                {selectedExpert.services.map((s, i) => (
                  <span key={i} className="dsn-section-tag accent" style={{ background: 'var(--status-success)', color: 'white', border: 'none' }}>{s}</span>
                ))}
              </div>
              <div className="dsn-profile-sro">📜 {selectedExpert.accreditation}</div>
              {selectedExpert.phone && (
                <div className="dsn-profile-detail">📞 {selectedExpert.phone}</div>
              )}
              {selectedExpert.email && (
                <div className="dsn-profile-detail">📧 {selectedExpert.email}</div>
              )}
              {selectedExpert.description && (
                <div className="dsn-profile-detail" style={{ marginTop: 12, lineHeight: 1.5, fontSize: 13 }}>
                  {selectedExpert.description}
                </div>
              )}
              <button className="btn btn-primary btn-block dsn-contact-btn" style={{ background: 'var(--status-success)', borderColor: 'var(--status-success)' }}>
                Связаться
              </button>
              <button className="btn btn-secondary btn-block" style={{ marginTop: 8 }}>
                Запросить договор
              </button>
            </div>
          )}

          {/* Region info card */}
          <div className="dsn-region-card">
            <div className="dsn-region-header">
              <span className="dsn-region-icon" style={{ background: 'var(--status-success)' }}>📊</span>
              <span className="dsn-region-title">Статистика</span>
            </div>
            <div className="dsn-region-detail">
              <span>{selectedExpert?.rating || 4.8} / 5.0 Высокая оценка Заказчиков</span>
            </div>
            <div className="dsn-region-stats">
              <span>🛡️ {selectedExpert?.reportsCount}</span>
              <span>Экспертных заключений</span>
              <span>{selectedExpert?.yearsExperience} лет опыта</span>
            </div>
            <div className="dsn-region-achievements">
              <div>✔️ Допуск к объектам гос. значения</div>
              <div>✔️ Проверка сметной документации</div>
              <div>✔️ Полная материальная ответственность</div>
            </div>
          </div>

          {/* Recent projects reviewed */}
          <div className="dsn-projects-card">
            <h3 className="dsn-projects-title">Выданы заключения</h3>
            <div className="dsn-projects-grid">
              {EXPERTISE_PROJECTS.map((p) => (
                <div key={p.id} className="dsn-project-thumb">
                  <div className="dsn-project-img" style={{
                    backgroundImage: `url(${projBg.src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: p.id === 'ep1' ? 'center' : p.id === 'ep2' ? 'top right' : 'bottom left',
                    filter: 'grayscale(20%)'
                  }} />
                  <div className="dsn-project-info" style={{ background: 'rgba(0,0,0,0.85)' }}>
                    <div className="dsn-project-name">{p.title}</div>
                    <div className="dsn-project-location" style={{ color: 'var(--status-success)' }}>✓ Положительное</div>
                    <div style={{ fontSize: 10, color: '#aaa' }}>{p.count}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="dsn-see-all-btn">Все заключения эксперта →</button>
          </div>
        </div>
      </div>

      {/* Basic Mobile Adjustments wrapper, since it shares CSS with designers it requires some tweaks */}
      <style dangerouslySetInnerHTML={{__html:`
        @media (max-width: 768px) {
          .dsn-layout {
            flex-direction: column;
            gap: 16px;
          }
          .dsn-sidebar {
            width: 100%;
          }
          .dsn-featured-card {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}}/>
    </div>
  );
}
