'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Заявки', href: '/orders' },
  { icon: '📋', label: 'Заявки', href: '/orders', section: 'main' },
  { icon: '🔍', label: 'Экспертиза', href: '/expertise' },
  { icon: '👷', label: 'Проектировщики', href: '/designers' },
  { icon: '⭐', label: 'Эксперты', href: '/experts' },
  { icon: '🏭', label: 'Производители', href: '/manufacturers' },
  { icon: '📐', label: 'Нормативы', href: '/standards' },
  { icon: '💬', label: 'Коммуникации', href: '/chat' },
  { icon: '📊', label: 'Аналитика', href: '/analytics' },
  { icon: '⚙️', label: 'Настройки', href: '/settings' },
];

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useApp();

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <Link href="/" className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="4" width="4" height="12" rx="1" fill="#a78bfa"/>
              <rect x="8" y="2" width="4" height="16" rx="1" fill="#8b5cf6"/>
              <rect x="14" y="6" width="4" height="10" rx="1" fill="#6d28d9"/>
            </svg>
          </div>
          Проектирование
        </Link>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.label + item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User block at bottom */}
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">{user.email}</div>
            </div>
          </div>
        )}
      </aside>

      {/* Header */}
      <div className="main-content">
        <header className="header">
          <div className="header-search">
            <span className="header-search-icon">🔍</span>
            <input type="text" placeholder="Поиск по заявкам" />
          </div>
          <div className="header-actions">
            {user ? (
              <>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user.name}</span>
                <div className="sidebar-user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
              </>
            ) : (
              <Link href="/auth" className="btn btn-primary btn-sm">Войти</Link>
            )}
          </div>
        </header>
        <div className="page-container">
          {children}
        </div>
      </div>

      {/* Bottom toolbar */}
      <footer className="internal-toolbar">
        <span className="landing-toolbar-item">⚙️ Настройки</span>
        <span className="landing-toolbar-item"><span className="landing-toolbar-dot" style={{background:'#ef4444'}}></span> CRM</span>
        <span className="landing-toolbar-item"><span className="landing-toolbar-dot" style={{background:'#3b82f6'}}></span> EDI</span>
        <span className="landing-toolbar-item"><span className="landing-toolbar-dot" style={{background:'#10b981'}}></span> Финансы</span>
        <span className="landing-toolbar-item"><span className="landing-toolbar-dot" style={{background:'#a78bfa'}}></span> Аналитика</span>
      </footer>
    </div>
  );
}
