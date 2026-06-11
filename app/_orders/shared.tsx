// @ts-nocheck
/* shared.tsx — общие хелперы раздела «Заявки»: Avatar, бейдж статуса,
   превью по типу объекта, срочность и форматирование срока. Связывает
   реальную модель Order со «словарём» нового дизайна. */
import React from 'react';
import heroPrivate from '@/public/hero-private.png';
import heroCommercial from '@/public/hero-commercial.png';
import heroIndustrial from '@/public/hero-industrial.png';
import { OBJECT_TYPE_LABELS } from '@/lib/constants';

export function Avatar({ text, size = 36, style }) {
  return <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36, ...style }}>{text}</div>;
}

/* Превью объекта по типу. Картинки импортированы через Next → путь содержит
   basePath (/projekt-market-) и хеш, поэтому работает и на GitHub Pages. */
const TYPE_IMAGE = {
  private:    { src: heroPrivate,    tag: 'Частный дом' },
  commercial: { src: heroCommercial, tag: 'Коммерческий объект' },
  industrial: { src: heroIndustrial, tag: 'Промышленный объект' },
};
export const typeImage = (objectType) => TYPE_IMAGE[objectType] || null;
export const typeLabel = (objectType) => OBJECT_TYPE_LABELS[objectType] || objectType || '—';

/* Статус заявки → класс бейджа нового дизайна (pub/work/done/wait). */
export const STATUS_BADGE = {
  published:   { cls: 'pub',  label: 'Опубликована' },
  in_progress: { cls: 'work', label: 'В работе' },
  completed:   { cls: 'done', label: 'Завершена' },
  draft:       { cls: 'wait', label: 'Черновик' },
  cancelled:   { cls: 'wait', label: 'Отменена' },
};
export function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.published;
  return <span className={'badge ' + s.cls}><i />{s.label}</span>;
}

/* Платформенная «сегодня» — 11.06.2026 (как в демо-данных проекта). */
const NOW = new Date(2026, 5, 11);

/* deadline в проекте бывает двух видов: ISO (2026-09-01) или число дней ("30").
   Возвращает остаток дней до срока (или null). */
export function daysLeft(deadline) {
  if (!deadline) return null;
  const raw = String(deadline).trim();
  if (/^\d+$/.test(raw)) return parseInt(raw, 10); // «срок в днях»
  let d;
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(raw)) {
    const [dd, mm, yy] = raw.split('.').map(Number);
    d = new Date(yy, mm - 1, dd);
  } else {
    d = new Date(raw);
  }
  if (isNaN(d.getTime())) return null;
  return Math.round((d - NOW) / 86400000);
}

export function urgencyBucket(deadline) {
  const n = daysLeft(deadline);
  if (n == null) return null;
  return n <= 30 ? 'u1' : n <= 90 ? 'u2' : 'u3';
}

export function formatDeadline(deadline) {
  if (!deadline) return 'по согласованию';
  const raw = String(deadline).trim();
  if (/^\d+$/.test(raw)) return `${raw} дн.`;
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(raw)) return raw;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? raw : d.toLocaleDateString('ru-RU');
}
