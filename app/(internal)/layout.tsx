'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';

import { 
  LayoutGrid, 
  ScanFace, 
  PenTool, 
  ShieldCheck, 
  Stamp, 
  Database, 
  MessageSquare, 
  BarChart2, 
  Settings2,
  Menu,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutGrid, label: 'Заявки', href: '/orders' },
  { icon: ScanFace, label: 'Экспертиза', href: '/expertise' },
  { icon: PenTool, label: 'Проектировщики', href: '/designers' },
  { icon: ShieldCheck, label: 'Эксперты', href: '/experts' },
  { icon: Stamp, label: 'Производители', href: '/manufacturers' },
  { icon: Database, label: 'Нормативы', href: '/standards' },
  { icon: MessageSquare, label: 'Коммуникации', href: '/chat' },
  { icon: BarChart2, label: 'Аналитика', href: '/analytics' },
  { icon: Settings2, label: 'Настройки', href: '/settings' },
];

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, notice } = useApp();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (!notice) return;
    setToastVisible(true);
    const t = setTimeout(() => setToastVisible(false), 2800);
    return () => clearTimeout(t);
  }, [notice?.id]);

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


      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Link href="/" className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 3H3v14h18V3z" />
                <path d="M3 21l3-4" />
                <path d="M21 21l-3-4" />
                <path d="M9 7h6" />
                <path d="M9 12h6" />
              </svg>
            </div>
            <span className="sidebar-text" style={{ letterSpacing: '2px', fontWeight: 800 }}>ФУНКЦИЯ</span>
          </Link>
          <button 
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.label + item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-link-icon">
                  <Icon size={20} strokeWidth={2.5} />
                </span>
                <span className="sidebar-text">{item.label}</span>
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
        {NAV_ITEMS.slice(0, 6).map((item) => (
          <Link key={item.label} href={item.href} className="landing-toolbar-item">
            <span className="landing-toolbar-dot" style={{background: 'var(--accent)'}}></span> {item.label}
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
