'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';

import { Menu, X } from 'lucide-react';
import { Icon } from '../_orders/icons';

type NavItem = { key: string; label: string; href: string; icon: string; c: string };

// Сгруппированное dock-меню (Cloud Design «Функция (7)»). Цвет чипа задаётся через --c.
const GROUPS: { title: string; items: NavItem[] }[] = [
  { title: 'Работа', items: [
    { key: 'orders', label: 'Заявки', href: '/orders', icon: 'grid', c: 'var(--accent-2)' },
    { key: 'expertise', label: 'Обследование', href: '/expertise', icon: 'scan', c: 'var(--blue)' },
  ] },
  { title: 'Подбор', items: [
    { key: 'designers', label: 'Проектировщики', href: '/designers', icon: 'pen', c: 'var(--green)' },
    { key: 'experts', label: 'Инженер-обследователь', href: '/experts', icon: 'shield', c: 'var(--amber)' },
    { key: 'manufacturers', label: 'Производители', href: '/manufacturers', icon: 'stamp', c: 'var(--pink)' },
  ] },
  { title: 'База знаний', items: [
    { key: 'standards', label: 'Нормативы', href: '/standards', icon: 'database', c: 'var(--accent)' },
    { key: 'chat', label: 'Коммуникации', href: '/chat', icon: 'chat', c: 'var(--green)' },
    { key: 'analytics', label: 'Аналитика', href: '/analytics', icon: 'chart', c: 'var(--blue)' },
  ] },
  { title: 'Аккаунт', items: [
    { key: 'pricing', label: 'Тарифы', href: '/pricing', icon: 'wallet', c: 'var(--amber)' },
    { key: 'settings', label: 'Настройки', href: '/settings', icon: 'sliders', c: 'var(--text-dim)' },
  ] },
];

const TOOLBAR_ITEMS = GROUPS.flatMap((g) => g.items).slice(0, 6);

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, notice, hydrated } = useApp();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (!notice) return;
    setToastVisible(true);
    const t = setTimeout(() => setToastVisible(false), 2800);
    return () => clearTimeout(t);
  }, [notice?.id]);

  // Единый auth-guard для всего кабинета. Ждём гидратацию стора из localStorage,
  // чтобы не выкидывать залогиненного при прямой загрузке/перезагрузке (BUG-008),
  // и не показывать кабинет гостю (BUG-007).
  useEffect(() => {
    if (hydrated && !user) router.replace('/auth');
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--text-muted, #888)', fontSize: 14 }}>
        Загрузка…
      </div>
    );
  }

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(!isSidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={`app-layout ${isCollapsed ? 'sidebar-collapsed' : ''} ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}


      {/* Sidebar — сгруппированное dock-меню */}
      <aside className={`sidebar tm-side ${isSidebarOpen ? 'open' : ''}`}>
        <div className="tm-brand-row">
          <Link href="/" className="tm-brand" onClick={() => setSidebarOpen(false)}>
            <span className="sidebar-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 3H3v14h18V3z" />
                <path d="M3 21l3-4" />
                <path d="M21 21l-3-4" />
                <path d="M9 7h6" />
                <path d="M9 12h6" />
              </svg>
            </span>
            <span className="tm-brand__name sidebar-text">ФУНКЦИЯ</span>
          </Link>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="tm-nav">
          {GROUPS.map((g) => (
            <div className="tm-group" key={g.title}>
              <div className="tm-head sidebar-text">{g.title}</div>
              {g.items.map((n) => {
                const active = pathname === n.href || pathname?.startsWith(n.href + '/');
                return (
                  <Link
                    key={n.key}
                    href={n.href}
                    className={'tm-item' + (active ? ' is-active' : '')}
                    style={{ '--c': n.c } as React.CSSProperties}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="tm-chip"><Icon name={n.icon} size={19} /></span>
                    <span className="tm-label sidebar-text">{n.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Футер — аккаунт, ведёт в Личный кабинет */}
        {user && (
          <Link href="/dashboard" className="tm-foot" onClick={() => setSidebarOpen(false)}>
            <div className="sidebar-user-avatar" style={{ width: 38, height: 38 }}>
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="sidebar-text" style={{ minWidth: 0 }}>
              <div className="tm-foot__name">{user.name}</div>
              <div className="tm-foot__sub">{user.email}</div>
            </div>
          </Link>
        )}
      </aside>

      {/* Header */}
      <div className="main-content">
        <header className="header">
          <button 
            className="menu-toggle-btn"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
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
        {TOOLBAR_ITEMS.map((item) => (
          <Link key={item.key} href={item.href} className="landing-toolbar-item">
            <span className="landing-toolbar-dot" style={{ background: item.c }}></span> {item.label}
          </Link>
        ))}
      </footer>

      {/* Toast-уведомление */}
      {notice && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: `translateX(-50%) translateY(${toastVisible ? '0' : '24px'})`,
            opacity: toastVisible ? 1 : 0,
            pointerEvents: 'none',
            zIndex: 1000,
            background: 'var(--bg-secondary, #1e1e2f)',
            color: 'var(--text-primary, #fff)',
            border: '1px solid var(--border, rgba(255,255,255,0.1))',
            borderRadius: 'var(--radius-md, 10px)',
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            maxWidth: 'calc(100vw - 32px)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
          }}
        >
          <span style={{ fontSize: 16 }}>🛠️</span>
          {notice.message}
        </div>
      )}
    </div>
  );
}
