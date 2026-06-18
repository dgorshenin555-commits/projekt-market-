// @ts-nocheck
'use client';

/* Настройки — новый дизайн «Функция» (перенос Settings из Cloud Design).
   Вся логика сохранена через ProfileForm. */

import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Icon } from '../../_orders/icons';
import { ProfileForm } from '../../_cabinet/ProfileForm';
import '../../_orders/orders.css';

export default function SettingsPage() {
  const { user } = useApp();

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

  return (
    <div className="fx animate-in">
      <div className="page-head">
        <div>
          <h1 className="page-title">Настройки</h1>
          <p className="page-sub">Управление профилем и аккаунтом</p>
        </div>
      </div>

      <ProfileForm />
    </div>
  );
}
