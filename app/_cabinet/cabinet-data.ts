// @ts-nocheck
export const roleGroup = (role) =>
  role === 'customer' ? 'customer' : (role === 'designer' || role === 'expert') ? 'executor' : 'other';

export const ORDER_BUCKET = (status) =>
  (status === 'published' || status === 'in_progress') ? 'active' : 'done';

// status обследования (ExpertiseProject) → бакет
export const EXP_BUCKET = (status) =>
  status === 'Положительное заключение' ? 'done' : 'active';

export const CABINET_TABS = {
  customer: [
    { key: 'overview', label: 'Обзор', icon: 'grid' },
    { key: 'orders', label: 'Мои заявки', icon: 'file' },
    { key: 'responses', label: 'Отклики', icon: 'comment' },
    { key: 'notifications', label: 'Уведомления', icon: 'bell' },
    { key: 'profile', label: 'Профиль', icon: 'user' },
  ],
  executor: [
    { key: 'overview', label: 'Обзор', icon: 'grid' },
    { key: 'responses', label: 'Мои отклики', icon: 'comment' },
    { key: 'inwork', label: 'В работе', icon: 'layers' },
    { key: 'favorites', label: 'Избранные документы', icon: 'star' },
    { key: 'notifications', label: 'Уведомления', icon: 'bell' },
    { key: 'profile', label: 'Профиль', icon: 'user' },
  ],
  other: [
    { key: 'overview', label: 'Обзор', icon: 'grid' },
    { key: 'profile', label: 'Профиль', icon: 'user' },
  ],
};
