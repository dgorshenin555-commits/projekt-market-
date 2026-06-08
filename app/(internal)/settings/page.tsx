'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { REGIONS } from '@/lib/constants';

const ROLES: { value: UserRole; label: string; icon: string }[] = [
  { value: 'customer', label: 'Заказчик', icon: '🏢' },
  { value: 'designer', label: 'Проектировщик', icon: '👷' },
  { value: 'expert', label: 'Эксперт', icon: '🔍' },
  { value: 'manufacturer', label: 'Производитель', icon: '🏭' },
];

export default function SettingsPage() {
  const { user, updateUser, logout } = useApp();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [sroNumber, setSroNumber] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [saved, setSaved] = useState(false);

  // Синхронизируем форму, когда пользователь подгрузился из localStorage
  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setCompany(user.company ?? '');
    setPhone(user.phone ?? '');
    setRegion(user.region ?? '');
    setSroNumber(user.sroNumber ?? '');
    setDescription(user.description ?? '');
    setRole(user.role ?? 'customer');
  }, [user?.id]);

  if (!user) {
    return (
      <div className="empty-state animate-in">
        <div className="empty-state-icon">🔒</div>
        <div className="empty-state-title">Необходима авторизация</div>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
          Войдите, чтобы управлять настройками профиля.
        </p>
        <Link href="/auth" className="btn btn-primary" style={{ marginTop: 16 }}>Войти</Link>
      </div>
    );
  }

  const showSro = role === 'designer' || role === 'expert';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, company, phone, region, sroNumber, description, role });
    setSaved(true);
  };

  return (
    <div className="animate-in" style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Настройки</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
          Управление профилем и аккаунтом
        </p>
      </div>

      <form onSubmit={handleSave}>
        {/* Профиль */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Профиль</h2>

          <div className="form-group">
            <label className="form-label">Роль на платформе</label>
            <div className="role-selector">
              {ROLES.map((r) => (
                <div
                  key={r.value}
                  className={`role-option ${role === r.value ? 'selected' : ''}`}
                  onClick={() => { setRole(r.value); setSaved(false); }}
                >
                  <div className="role-option-icon">{r.icon}</div>
                  <div className="role-option-label">{r.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">ФИО / Название компании</label>
            <input
              className="form-input"
              placeholder="Иванов Иван Иванович"
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false); }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Компания</label>
            <input
              className="form-input"
              placeholder="ООО «Проект»"
              value={company}
              onChange={(e) => { setCompany(e.target.value); setSaved(false); }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Телефон</label>
            <input
              className="form-input"
              type="tel"
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setSaved(false); }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Регион</label>
            <select
              className="form-select"
              value={region}
              onChange={(e) => { setRegion(e.target.value); setSaved(false); }}
            >
              <option value="">Не указан</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {showSro && (
            <div className="form-group">
              <label className="form-label">Номер СРO</label>
              <input
                className="form-input"
                placeholder="СРО-П-123-4567890"
                value={sroNumber}
                onChange={(e) => { setSroNumber(e.target.value); setSaved(false); }}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">О себе</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Краткое описание специализации и опыта"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setSaved(false); }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary">Сохранить изменения</button>
            {saved && (
              <span style={{ color: 'var(--status-success)', fontSize: 14, fontWeight: 600 }}>
                ✓ Сохранено
              </span>
            )}
          </div>
        </div>
      </form>

      {/* Аккаунт */}
      <div className="card">
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Аккаунт</h2>

        <div className="form-group">
          <label className="form-label">Email (логин)</label>
          <input className="form-input" value={user.email} disabled readOnly />
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>
            Email используется для входа и не редактируется.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Выйти из аккаунта на этом устройстве
          </span>
          <button type="button" className="btn btn-ghost" onClick={() => logout()}>
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
