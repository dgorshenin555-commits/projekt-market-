'use client';

import Link from 'next/link';
import { useApp } from '@/lib/store';
import { MOCK_ORDERS } from '@/lib/mock-data';

export default function HomePage() {
  const { user } = useApp();

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-logo">
          <div className="landing-logo-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="4" width="4" height="12" rx="1" fill="#a78bfa"/>
              <rect x="8" y="2" width="4" height="16" rx="1" fill="#8b5cf6"/>
              <rect x="14" y="6" width="4" height="10" rx="1" fill="#6d28d9"/>
            </svg>
          </div>
          Проектирование
        </div>
        <nav className="landing-nav">
          <Link href="/orders" className="landing-nav-link">🏠 Продукты и решения</Link>
          <Link href="/orders" className="landing-nav-link">Кейсы</Link>
          {user ? (
            <Link href="/dashboard" className="btn btn-secondary btn-sm">Войти в сервис</Link>
          ) : (
            <Link href="/auth" className="btn btn-secondary btn-sm">Войти в сервис</Link>
          )}
          <div className="landing-avatar">
            {user ? user.name.substring(0, 2).toUpperCase() : 'АБ'}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-left">
          <h1 className="landing-hero-title">
            Единая платформа<br/>
            для проектирования,<br/>
            экспертизы и подбора решений
          </h1>
          <p className="landing-hero-subtitle">
            Публикуйте заявки, находите проектировщиков, проходите экспертизу, 
            работайте с нормативами и техническими решениями в одной системе.
          </p>
          <div className="landing-hero-actions">
            <Link href={user ? '/orders/new' : '/auth'} className="btn btn-primary btn-lg">
              Создать заявку
            </Link>
            <Link href="/orders" className="btn btn-outline btn-lg">
              Смотреть возможности
            </Link>
          </div>
        </div>

        {/* Inline Order Creation Card */}
        <div className="landing-hero-card">
          <h2 className="landing-hero-card-title">Создание заявки</h2>
          <p className="landing-hero-card-desc">
            Пошаговая публикация проекта, от типа объекта и региона до бюджета, сроков и загрузки файлов.
          </p>
          <div className="landing-hero-card-steps">
            <span className="landing-step-tag">Тип объекта</span>
            <span className="landing-step-tag">Регион</span>
            <span className="landing-step-tag">Стадия</span>
            <span className="landing-step-tag">Разделы</span>
            <span className="landing-step-tag">Файлы</span>
          </div>
          <div className="landing-hero-card-input">
            <label className="landing-input-label">Вложить ▾</label>
          </div>
          <Link href={user ? '/orders/new' : '/auth'} className="btn btn-accent btn-block">
            Опубликовать
          </Link>
        </div>
      </section>

      {/* Feature Cards — Row 1 */}
      <section className="landing-features">
        <div className="landing-features-row landing-features-row-3">
          {/* Проектировщики */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon landing-feature-icon-blue">👷</div>
            <h3>Проектировщики</h3>
            <p>Подбор исполнителей по, заявке СРО, рейтингу, география и опыт.</p>
            <div className="landing-feature-footer">
              <Link href="/orders" className="landing-feature-link">Выбрать специалиста →</Link>
            </div>
          </div>

          {/* Экспертиза */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon landing-feature-icon-green">🪖</div>
            <h3>Экспертиза</h3>
            <p>Замечания, ответы, итерации и статусы прохождений в одном месте.</p>
            <div className="landing-feature-tags">
              <span className="landing-mini-tag">Подана</span>
              <span className="landing-mini-tag">Замечания</span>
              <span className="landing-mini-tag">Доработка</span>
              <span className="landing-mini-tag">Заключение</span>
            </div>
            <div className="landing-feature-footer">
              <Link href="/orders" className="landing-feature-link">Открыть трекер →</Link>
            </div>
          </div>

          {/* Производители */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon landing-feature-icon-purple">🏭</div>
            <h3>Производители</h3>
            <p>Каталог решений с BIM моделями, узлами, нормативной привязкой.</p>
            <div className="landing-feature-tags">
              <span className="landing-mini-tag">BIM</span>
              <span className="landing-mini-tag">Узлы</span>
              <span className="landing-mini-tag">ТП</span>
              <span className="landing-mini-tag">СР</span>
              <span className="landing-mini-tag">Нормативы</span>
              <span className="landing-mini-tag">Советы</span>
            </div>
            <div className="landing-feature-footer">
              <Link href="/orders" className="landing-feature-link">Перейти в каталог →</Link>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="landing-features-row landing-features-row-3">
          {/* Коммуникации */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon landing-feature-icon-teal">💬</div>
            <h3>Коммуникации</h3>
            <p>Чаты, обсуждение файлов DWG и прозрачная история тарифов.</p>
            <div className="landing-feature-tags">
              <span className="landing-mini-tag">DWG</span>
              <span className="landing-mini-tag">IFC</span>
              <span className="landing-mini-tag">PDF</span>
              <span className="landing-mini-tag">Комментарии</span>
              <span className="landing-mini-tag">ETP →</span>
            </div>
          </div>

          {/* Рейтинги */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon landing-feature-icon-yellow">🏆</div>
            <h3>Рейтинги</h3>
            <p>Сроки, качество. Успешные проекты. Проверка. Репутация.</p>
            <div className="landing-feature-tags">
              <span className="landing-mini-tag">Сроки</span>
              <span className="landing-mini-tag">Качество</span>
              <span className="landing-mini-tag">Успешные проекты (3) →</span>
            </div>
          </div>

          {/* Все решения */}
          <div className="landing-feature-card landing-feature-card-cta">
            <h3>Все решения</h3>
            <div className="landing-feature-arrow">↗</div>
          </div>
        </div>
      </section>

      {/* Bottom Toolbar */}
      <footer className="landing-toolbar">
        <div className="landing-toolbar-items">
          <span className="landing-toolbar-item"><span className="landing-toolbar-dot" style={{background:'#ef4444'}}></span> CRM</span>
          <span className="landing-toolbar-item"><span className="landing-toolbar-dot" style={{background:'#3b82f6'}}></span> EDI</span>
          <span className="landing-toolbar-item"><span className="landing-toolbar-dot" style={{background:'#10b981'}}></span> Финансы</span>
          <span className="landing-toolbar-item"><span className="landing-toolbar-dot" style={{background:'#6366f1'}}></span> BIM</span>
          <span className="landing-toolbar-item"><span className="landing-toolbar-dot" style={{background:'#f59e0b'}}></span> Маркет</span>
          <span className="landing-toolbar-item"><span className="landing-toolbar-dot" style={{background:'#22d3ee'}}></span> Коммуникации</span>
          <span className="landing-toolbar-item"><span className="landing-toolbar-dot" style={{background:'#a78bfa'}}></span> Производители</span>
          <span className="landing-toolbar-item">•• Ещё</span>
        </div>
      </footer>
    </div>
  );
}
