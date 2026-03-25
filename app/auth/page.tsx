'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { UserRole } from '@/lib/types';
import Link from 'next/link';

const ROLES: { value: UserRole; label: string; icon: string }[] = [
  { value: 'customer', label: 'Заказчик', icon: '🏢' },
  { value: 'designer', label: 'Проектировщик', icon: '👷' },
  { value: 'expert', label: 'Эксперт', icon: '🔍' },
  { value: 'manufacturer', label: 'Производитель', icon: '🏭' },
];

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState<UserRole>('customer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const ok = login(email, password);
      if (ok) {
        router.push('/dashboard');
      } else {
        alert('Пользователь не найден. Попробуйте зарегистрироваться.');
      }
    } else {
      register({ email, name, role, company, phone: '' });
      router.push('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, textDecoration: 'none', color: 'var(--text-primary)' }}>
          <div className="sidebar-logo-icon" style={{ width: 32, height: 32, fontSize: 16 }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="4" width="4" height="12" rx="1" fill="#a78bfa"/>
              <rect x="8" y="2" width="4" height="16" rx="1" fill="#8b5cf6"/>
              <rect x="14" y="6" width="4" height="10" rx="1" fill="#6d28d9"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Проектирование</span>
        </Link>

        <h1>{isLogin ? 'Вход в систему' : 'Регистрация'}</h1>
        <p className="subtitle">{isLogin ? 'Войдите для доступа к заявкам и кабинету' : 'Создайте аккаунт для работы на платформе'}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Ваша роль</label>
                <div className="role-selector">
                  {ROLES.map((r) => (
                    <div
                      key={r.value}
                      className={`role-option ${role === r.value ? 'selected' : ''}`}
                      onClick={() => setRole(r.value)}
                    >
                      <div className="role-option-icon">{r.icon}</div>
                      <div className="role-option-label">{r.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">ФИО / Название компании</label>
                <input className="form-input" placeholder="Иванов Иван Иванович" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Компания (необязательно)</label>
                <input className="form-input" placeholder="ООО «Проект»" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
            </>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="mail@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 8 }}>
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? (
            <>Нет аккаунта? <a onClick={() => setIsLogin(false)} style={{ cursor: 'pointer' }}>Зарегистрируйтесь</a></>
          ) : (
            <>Уже есть аккаунт? <a onClick={() => setIsLogin(true)} style={{ cursor: 'pointer' }}>Войдите</a></>
          )}
        </div>
      </div>
    </div>
  );
}
