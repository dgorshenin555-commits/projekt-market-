// @ts-nocheck
'use client';

/* Настройки — новый дизайн «Функция» (перенос Settings из Cloud Design).
   Вся логика сохранена: useApp (user/updateUser/logout), локальная форма
   профиля, синхронизация из localStorage, условный блок СРО, индикатор
   «Сохранено». Меняется только визуальный слой, заскоуплено под .fx. */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { REGIONS } from '@/lib/constants';
import { Icon } from '../../_orders/icons';
import '../../_orders/orders.css';

const ROLES: { value: UserRole; label: string; icon: string }[] = [
  { value: 'customer', label: 'Заказчик', icon: 'building' },
  { value: 'designer', label: 'Проектировщик', icon: 'pen' },
  { value: 'expert', label: 'Эксперт', icon: 'shield' },
  { value: 'manufacturer', label: 'Производитель', icon: 'stamp' },
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
      <div className="fx animate-in">
        <div className="empty">
          <div className="empty__icon"><Icon name="shield" size={28} /></div>
          <div className="section-title" style={{ marginBottom: 8 }}>Необходима авторизация</div>
          <p className="dim" style={{ fontSize: 14, margin: 0 }}>
            Войдите, чтобы управлять настройками профиля.
          </p>
          <Link href="/auth" className="btn btn-primary mt16">Войти</Link>
        </div>
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
    <div className="fx animate-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">Настройки</h1>
          <p className="page-sub">Управление профилем и аккаунтом</p>
        </div>
      </div>

      <div className="settings-wrap">
        <form onSubmit={handleSave}>
          {/* Профиль */}
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 18 }}>Профиль</h3>

            <div className="overline" style={{ marginBottom: 12 }}>Роль на платформе</div>
            <div className="grid-2" style={{ gap: 12, marginBottom: 22 }}>
              {ROLES.map((r) => (
                <button
                  type="button"
                  key={r.value}
                  className={'rolecard' + (role === r.value ? ' is-sel' : '')}
                  onClick={() => { setRole(r.value); setSaved(false); }}
                >
                  <Icon name={r.icon} size={24} />
                  <span>{r.label}</span>
                </button>
              ))}
            </div>

            <div className="col gap16">
              <div className="field">
                <label>ФИО / Название компании</label>
                <input
                  className="input"
                  placeholder="Иванов Иван Иванович"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setSaved(false); }}
                  required
                />
              </div>

              <div className="field">
                <label>Компания</label>
                <input
                  className="input"
                  placeholder="ООО «Проект»"
                  value={company}
                  onChange={(e) => { setCompany(e.target.value); setSaved(false); }}
                />
              </div>

              <div className="grid-2" style={{ gap: 16 }}>
                <div className="field">
                  <label>Телефон</label>
                  <input
                    className="input"
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setSaved(false); }}
                  />
                </div>

                <div className="field">
                  <label>Регион</label>
                  <select
                    className="input"
                    value={region}
                    onChange={(e) => { setRegion(e.target.value); setSaved(false); }}
                  >
                    <option value="">Не указан</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {showSro && (
                <div className="field">
                  <label>Номер СРO</label>
                  <input
                    className="input"
                    placeholder="СРО-П-123-4567890"
                    value={sroNumber}
                    onChange={(e) => { setSroNumber(e.target.value); setSaved(false); }}
                  />
                </div>
              )}

              <div className="field">
                <label>О себе</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Краткое описание специализации и опыта"
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setSaved(false); }}
                />
              </div>
            </div>

            <div className="row gap16 mt24">
              <button type="submit" className="btn btn-primary">Сохранить изменения</button>
              {saved && (
                <span className="row gap8" style={{ color: 'var(--green)', fontSize: 14, fontWeight: 600 }}>
                  <Icon name="check" size={16} /> Сохранено
                </span>
              )}
            </div>
          </div>
        </form>

        {/* Аккаунт */}
        <div className="card" style={{ marginTop: 24 }}>
          <h3 className="section-title" style={{ marginBottom: 18 }}>Аккаунт</h3>

          <div className="field" style={{ marginBottom: 8 }}>
            <label>Email (логин)</label>
            <input className="input" value={user.email} disabled readOnly style={{ opacity: .7 }} />
          </div>
          <p className="dim" style={{ fontSize: 13, margin: '0 0 22px' }}>
            Email используется для входа и не редактируется.
          </p>

          <hr className="divider" style={{ marginBottom: 20 }} />

          <div className="row between">
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              Выйти из аккаунта на этом устройстве
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => logout()}>
              <Icon name="logout" size={15} /> Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
