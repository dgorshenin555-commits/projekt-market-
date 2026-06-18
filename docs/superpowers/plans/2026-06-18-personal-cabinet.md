# Личный кабинет — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Превратить `/dashboard` в полноценный личный кабинет с вкладками, разный по ролям (заказчик / исполнитель = проектировщик|инженер-обследователь), с профилем внутри, разделением заявок по статусу, избранными нормативами и изоляцией данных по пользователю.

**Architecture:** Кабинет живёт на существующем маршруте `/dashboard`. Контейнер = шапка + горизонтальный `TabBar` + рендер вкладок по `user.role`. Вкладки — отдельные компоненты в `app/_cabinet/`. Данные — только через стор-геттеры (единый шов под будущие права доступа). Избранное нормативов поднимается в стор с персистом в localStorage. Сторона обследователя оживляется мини-моками.

**Tech Stack:** Next.js 16 (App Router, static export), React 18, TypeScript (`@ts-nocheck` в страничных файлах — как во всём проекте), vanilla CSS (дизайн-система `.fx` в `app/_orders/orders.css`), localStorage-стор (`lib/store.tsx`). Иконки — `app/_orders/icons`.

## Global Constraints

- **Спецификация:** `docs/superpowers/specs/2026-06-18-personal-cabinet-design.md` — источник истины; при расхождении плана и спеки правится план.
- **Нет тест-фреймворка.** Verification каждой задачи = `npm run build` (TypeScript + статическая генерация всех страниц **без ошибок**) + указанная поведенческая/визуальная проверка. Не добавлять jest/vitest/playwright.
- **Дизайн только под `.fx`.** Переиспользовать существующие классы (`page-head`, `tabs`/`tab`, `stat`, `card`/`card-hover`, `badge`, `chip`/`chip-code`, `pill`, `viewtoggle`, `empty`, `secpick`, `avatar`); новый CSS — точечно, с префиксом `.fx`, в `app/_orders/orders.css`.
- **Изоляция данных:** любой список в кабинете — только данные текущего пользователя, через стор-геттеры; ветвление вкладок по `user.role`. Не раскрывать чужие приватные данные.
- **Коммиты:** русские conventional-commits в стиле проекта (`feat(cabinet): …`). Завершать commit-сообщения строкой `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. **Не пушить** — пуш в `main` триггерит прод-деплой; пушим только по явному запросу пользователя.
- **Маршрут кабинета — `/dashboard`** (не плодить роуты; пост-логин-редирект `auth → /dashboard` сохраняется).

---

## Файловая структура

**Создаём:**
- `app/_cabinet/ProfileForm.tsx` — форма профиля + блок «Аккаунт» (вынос из `settings`).
- `app/_cabinet/cabinet-data.ts` — чистые хелперы: бакеты статусов, рекомендации, маппинг подролей.
- `app/_cabinet/tabs.tsx` — все вкладки кабинета (Overview, CustomerOrders, CustomerResponses, ExecResponses, ExecInWork, ExecFavorites, Notifications) одним модулем (мелкие компоненты, одна ответственность — «вкладки кабинета»).

**Модифицируем:**
- `lib/types.ts` — `+ ExpertiseResponse`.
- `lib/mock-data.ts` — `+ MOCK_EXPERTISE_RESPONSES`.
- `lib/store.tsx` — `AppState += favoriteStandards`; персист; `+ toggleFavoriteStandard`, `getFavoriteStandards`, `getMyExpertiseResponses`, `getMyExpertiseProjects`, `getRecommendedOrders`.
- `app/(internal)/standards/page.tsx` — избранное из стора вместо локального `useState`.
- `app/(internal)/dashboard/page.tsx` — переписать в контейнер кабинета.
- `app/(internal)/settings/page.tsx` — редирект на `/dashboard?tab=profile`.
- `app/(internal)/layout.tsx` — `NAV_ITEMS`: «Личный кабинет» вместо «Настройки».
- `app/_orders/orders.css` — точечные классы кабинета (`.fx .cab-*`).

---

## Task 1: Данные обследований — тип + моки

**Files:**
- Modify: `lib/types.ts` (добавить интерфейс после `ExpertiseRequest`)
- Modify: `lib/mock-data.ts` (добавить `MOCK_EXPERTISE_RESPONSES` после `MOCK_EXPERTISE_PROJECTS`)

**Interfaces:**
- Produces: `ExpertiseResponse { id, expertiseId, expertId, expertName, message, proposedBudget?, proposedDeadline?, status, createdAt }`; `MOCK_EXPERTISE_RESPONSES: ExpertiseResponse[]`.

- [ ] **Step 1: Добавить тип `ExpertiseResponse` в `lib/types.ts`**

После интерфейса `ExpertiseRequest` (заканчивается на строке с `files?: string[][];` и `}`) вставить:

```ts
// === Отклик инженера-обследователя на обследование ===
export interface ExpertiseResponse {
  id: string;
  expertiseId: string;       // ссылка на ExpertiseRequest.id
  expertId: string;          // ссылка на пользователя-обследователя
  expertName: string;
  message: string;
  proposedBudget?: string;
  proposedDeadline?: string;
  status: 'sent' | 'accepted' | 'declined';
  createdAt: string;
}
```

- [ ] **Step 2: Добавить `MOCK_EXPERTISE_RESPONSES` в `lib/mock-data.ts`**

В конец файла (после массива `MOCK_EXPERTISE_PROJECTS`) добавить. `expertiseId` ссылается на реальные `expReq1`/`expReq2`. `expertId: 'demo-expert'` — условный «текущий обследователь» прототипа (геттер в Task 2 показывает их любому пользователю с ролью `expert`; в реальном бэкенде фильтр будет по id):

```ts
export const MOCK_EXPERTISE_RESPONSES: import('./types').ExpertiseResponse[] = [
  {
    id: 'expRes1', expertiseId: 'expReq1', expertId: 'demo-expert', expertName: 'Демо Обследователь',
    message: 'Готов выполнить обследование несущих конструкций, есть опыт по аналогичным объектам.',
    proposedBudget: '180 000 ₽', proposedDeadline: '20 дней', status: 'sent', createdAt: '2026-06-12T09:00:00.000Z',
  },
  {
    id: 'expRes2', expertiseId: 'expReq2', expertId: 'demo-expert', expertName: 'Демо Обследователь',
    message: 'Проведём инструментальное обследование с тепловизионной съёмкой. Аккредитация в наличии.',
    proposedBudget: '240 000 ₽', proposedDeadline: '25 дней', status: 'accepted', createdAt: '2026-06-13T11:30:00.000Z',
  },
];
```

> Если `expReq1`/`expReq2` в файле имеют другие id — подставить фактические (см. `grep "id: 'expReq" lib/mock-data.ts`).

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: `✓ Compiled successfully` + `✓ Generating static pages (… )` без ошибок TypeScript.

- [ ] **Step 4: Commit**

```bash
git add lib/types.ts lib/mock-data.ts
git commit -m "feat(cabinet): тип ExpertiseResponse + мок откликов на обследование

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Стор — избранное нормативов + геттеры кабинета

**Files:**
- Modify: `lib/store.tsx`

**Interfaces:**
- Consumes: `MOCK_STANDARDS`, `MOCK_EXPERTISE_REQUESTS`, `MOCK_EXPERTISE_PROJECTS`, `MOCK_EXPERTISE_RESPONSES` (из `mock-data`).
- Produces (на контексте `useApp()`):
  - `favoriteStandards: string[]`
  - `toggleFavoriteStandard(code: string): void`
  - `getFavoriteStandards(): StandardDocument[]`
  - `getMyExpertiseResponses(): ExpertiseResponse[]`
  - `getMyExpertiseProjects(): ExpertiseProject[]`
  - `getRecommendedOrders(): Order[]`

- [ ] **Step 1: Расширить импорты и `AppState`**

В `lib/store.tsx`:
- В импорт типов добавить: `StandardDocument, ExpertiseResponse, ExpertiseProject` →
  `import { User, Order, OrderResponse, StandardDocument, ExpertiseResponse, ExpertiseProject } from './types';`
- В импорт моков добавить:
  `import { MOCK_ORDERS, MOCK_RESPONSES, MOCK_STANDARDS, MOCK_EXPERTISE_REQUESTS, MOCK_EXPERTISE_PROJECTS, MOCK_EXPERTISE_RESPONSES } from './mock-data';`
- В `interface AppState` добавить поле: `favoriteStandards: string[];`

- [ ] **Step 2: Сидирование избранного + персист**

Заменить тело `loadState()` (сохранив существующее) так, чтобы возвращать `favoriteStandards`. Дефолт-сид — коды из `MOCK_STANDARDS.filter(isFeatured)`:

```ts
const DEFAULT_FAVORITES = MOCK_STANDARDS.filter((s) => s.isFeatured).map((s) => s.code);

function loadState(): AppState {
  if (typeof window === 'undefined') return { user: null, orders: MOCK_ORDERS, responses: MOCK_RESPONSES, favoriteStandards: DEFAULT_FAVORITES };
  try {
    const saved = localStorage.getItem('pm_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        user: parsed.user || null,
        orders: parsed.orders?.length ? parsed.orders : MOCK_ORDERS,
        responses: parsed.responses?.length ? parsed.responses : MOCK_RESPONSES,
        favoriteStandards: Array.isArray(parsed.favoriteStandards) ? parsed.favoriteStandards : DEFAULT_FAVORITES,
      };
    }
  } catch {}
  return { user: null, orders: MOCK_ORDERS, responses: MOCK_RESPONSES, favoriteStandards: DEFAULT_FAVORITES };
}
```

Также в начальном `useState<AppState>({...})` (строка ~59) добавить `favoriteStandards: DEFAULT_FAVORITES` в объект, чтобы SSR/первый рендер не падал.

- [ ] **Step 3: Действие и геттеры**

Перед `return (<AppContext.Provider …>` добавить:

```ts
const toggleFavoriteStandard = useCallback((code: string) => {
  setState((prev) => ({
    ...prev,
    favoriteStandards: prev.favoriteStandards.includes(code)
      ? prev.favoriteStandards.filter((c) => c !== code)
      : [...prev.favoriteStandards, code],
  }));
}, []);

const getFavoriteStandards = useCallback(
  () => MOCK_STANDARDS.filter((s) => state.favoriteStandards.includes(s.code)),
  [state.favoriteStandards]
);

// Сторона обследователя: мок представляет «текущего» эксперта прототипа.
// Шов изоляции данных — этот геттер; в реальном бэкенде фильтр будет по user.id.
const getMyExpertiseResponses = useCallback(
  () => (state.user?.role === 'expert' ? MOCK_EXPERTISE_RESPONSES : []),
  [state.user]
);

const getMyExpertiseProjects = useCallback(
  () => (state.user?.role === 'expert' ? MOCK_EXPERTISE_PROJECTS : []),
  [state.user]
);

// Рекомендации исполнителю: опубликованные заявки, пересекающиеся со
// специализацией пользователя; если совпадений нет — свежие опубликованные.
const getRecommendedOrders = useCallback(() => {
  const published = state.orders.filter((o) => o.status === 'published');
  const specs = state.user?.specializations || [];
  const matched = specs.length
    ? published.filter((o) => o.sections?.some((s) => specs.includes(s)))
    : [];
  return (matched.length ? matched : published).slice(0, 4);
}, [state.orders, state.user]);
```

- [ ] **Step 4: Прокинуть в value контекста и в `AppContextType`**

В `interface AppContextType` добавить сигнатуры:

```ts
  favoriteStandards: string[];
  toggleFavoriteStandard: (code: string) => void;
  getFavoriteStandards: () => StandardDocument[];
  getMyExpertiseResponses: () => ExpertiseResponse[];
  getMyExpertiseProjects: () => ExpertiseProject[];
  getRecommendedOrders: () => Order[];
```

(`favoriteStandards` уже попадёт через `...state`.) В объект `value={{ ... }}` добавить:
`toggleFavoriteStandard, getFavoriteStandards, getMyExpertiseResponses, getMyExpertiseProjects, getRecommendedOrders,`

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: успешная сборка без ошибок типов (все новые геттеры типизированы).

- [ ] **Step 6: Commit**

```bash
git add lib/store.tsx
git commit -m "feat(cabinet): избранное нормативов в сторе + геттеры кабинета

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: «Нормативы» используют избранное из стора

**Files:**
- Modify: `app/(internal)/standards/page.tsx`

**Interfaces:**
- Consumes: `useApp().favoriteStandards`, `useApp().toggleFavoriteStandard`.

- [ ] **Step 1: Заменить локальный `favorites` на стор**

В компоненте страницы:
- В деструктуризации `useApp()` добавить: `favoriteStandards, toggleFavoriteStandard` (рядом с `notify`).
- Удалить локальный стейт избранного:
  ```ts
  const [favorites, setFavorites] = useState(
    () => new Set(MOCK_STANDARDS.filter((s) => s.isFeatured).map((s) => s.code))
  );
  ```
  и локальную функцию `toggleFavorite`.
- Ввести производный `Set` и алиас, чтобы остальной код не менять:
  ```ts
  const favorites = new Set(favoriteStandards);
  const toggleFavorite = toggleFavoriteStandard;
  ```
  (Оставляем имена `favorites`/`toggleFavorite` — все обращения `favorites.has(code)` и `onFav: () => toggleFavorite(code)` продолжают работать.)

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: успех.

- [ ] **Step 3: Поведенческая проверка (через dev + CDP, см. Приложение A)**

Залогиниться демо-пользователем, открыть `/standards`, нажать ⭐ у документа, перезагрузить страницу.
Expected: пометка ⭐ **сохраняется** после перезагрузки (раньше сбрасывалась). Фильтр «Избранное» отражает изменения.

- [ ] **Step 4: Commit**

```bash
git add "app/(internal)/standards/page.tsx"
git commit -m "feat(standards): избранное из стора (persist, общий источник с кабинетом)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: `ProfileForm` — вынос профиля из «Настроек»

**Files:**
- Create: `app/_cabinet/ProfileForm.tsx`
- Modify: `app/(internal)/settings/page.tsx` (временно — пока оставить, редирект делаем в Task 8)

**Interfaces:**
- Produces: `export function ProfileForm()` — самодостаточная форма профиля + блок «Аккаунт» (использует `useApp().user/updateUser/logout`).

- [ ] **Step 1: Создать `app/_cabinet/ProfileForm.tsx`**

Перенести содержимое формы из `app/(internal)/settings/page.tsx` (ROLES, стейты, `useEffect`-синхронизация, `showSro`, `handleSave`, разметка карточек «Профиль» и «Аккаунт») в компонент. Полный код:

```tsx
// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { REGIONS } from '@/lib/constants';
import { Icon } from '../_orders/icons';

const ROLES: { value: UserRole; label: string; icon: string }[] = [
  { value: 'customer', label: 'Заказчик', icon: 'building' },
  { value: 'designer', label: 'Проектировщик', icon: 'pen' },
  { value: 'expert', label: 'Инженер-обследователь', icon: 'shield' },
  { value: 'manufacturer', label: 'Производитель', icon: 'stamp' },
];

export function ProfileForm() {
  const { user, updateUser, logout } = useApp();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [sroNumber, setSroNumber] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [saved, setSaved] = useState(false);

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

  if (!user) return null;
  const showSro = role === 'designer' || role === 'expert';
  const handleSave = (e) => { e.preventDefault(); updateUser({ name, company, phone, region, sroNumber, description, role }); setSaved(true); };

  return (
    <div className="settings-wrap">
      <form onSubmit={handleSave}>
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 18 }}>Профиль</h3>
          <div className="overline" style={{ marginBottom: 12 }}>Роль на платформе</div>
          <div className="grid-2" style={{ gap: 12, marginBottom: 22 }}>
            {ROLES.map((r) => (
              <button type="button" key={r.value} className={'rolecard' + (role === r.value ? ' is-sel' : '')} onClick={() => { setRole(r.value); setSaved(false); }}>
                <Icon name={r.icon} size={24} /><span>{r.label}</span>
              </button>
            ))}
          </div>
          <div className="col gap16">
            <div className="field"><label>ФИО / Название компании</label>
              <input className="input" placeholder="Иванов Иван Иванович" value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} required /></div>
            <div className="field"><label>Компания</label>
              <input className="input" placeholder="ООО «Проект»" value={company} onChange={(e) => { setCompany(e.target.value); setSaved(false); }} /></div>
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="field"><label>Телефон</label>
                <input className="input" type="tel" placeholder="+7 (___) ___-__-__" value={phone} onChange={(e) => { setPhone(e.target.value); setSaved(false); }} /></div>
              <div className="field"><label>Регион</label>
                <select className="input" value={region} onChange={(e) => { setRegion(e.target.value); setSaved(false); }}>
                  <option value="">Не указан</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select></div>
            </div>
            {showSro && (
              <div className="field"><label>Номер СРО</label>
                <input className="input" placeholder="СРО-П-123-4567890" value={sroNumber} onChange={(e) => { setSroNumber(e.target.value); setSaved(false); }} /></div>
            )}
            <div className="field"><label>О себе</label>
              <textarea className="input" rows={4} placeholder="Краткое описание специализации и опыта" value={description} onChange={(e) => { setDescription(e.target.value); setSaved(false); }} /></div>
          </div>
          <div className="row gap16 mt24">
            <button type="submit" className="btn btn-primary">Сохранить изменения</button>
            {saved && <span className="row gap8" style={{ color: 'var(--green)', fontSize: 14, fontWeight: 600 }}><Icon name="check" size={16} /> Сохранено</span>}
          </div>
        </div>
      </form>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 className="section-title" style={{ marginBottom: 18 }}>Аккаунт</h3>
        <div className="field" style={{ marginBottom: 8 }}><label>Email (логин)</label>
          <input className="input" value={user.email} disabled readOnly style={{ opacity: .7 }} /></div>
        <p className="dim" style={{ fontSize: 13, margin: '0 0 22px' }}>Email используется для входа и не редактируется.</p>
        <hr className="divider" style={{ marginBottom: 20 }} />
        <div className="row between">
          <div style={{ fontWeight: 600, fontSize: 14 }}>Выйти из аккаунта на этом устройстве</div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => logout()}><Icon name="logout" size={15} /> Выйти</button>
        </div>
      </div>
    </div>
  );
}
```

> Терминология: роль `expert` подписываем «Инженер-обследователь» (как в навигации), а не «Эксперт» — это видимая подпись, ключ роли не меняется.

- [ ] **Step 2: Переключить `settings/page.tsx` на `ProfileForm`**

В `app/(internal)/settings/page.tsx` заменить тело формы профиля на рендер `<ProfileForm />` (импорт `import { ProfileForm } from '../../_cabinet/ProfileForm';`), сохранив заголовок «Настройки» и auth-гейт. Это убирает дублирование кода до того, как Task 8 сделает редирект.

- [ ] **Step 3: Verify build + поведение**

Run: `npm run build` → успех.
Поведение (CDP/dev): `/settings` показывает профиль; «Сохранить» меняет имя; повторный вход — имя сохранено.

- [ ] **Step 4: Commit**

```bash
git add app/_cabinet/ProfileForm.tsx "app/(internal)/settings/page.tsx"
git commit -m "refactor(cabinet): вынос ProfileForm из settings (переиспользуемый)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Каркас кабинета — контейнер, TabBar, вкладки «Обзор» и «Профиль»

**Files:**
- Create: `app/_cabinet/cabinet-data.ts`
- Create: `app/_cabinet/tabs.tsx` (пока с `Overview` + `Notifications`; остальные вкладки добавят Task 6–7)
- Modify: `app/(internal)/dashboard/page.tsx` (переписать в контейнер)
- Modify: `app/_orders/orders.css` (классы `.fx .cab-*`)

**Interfaces:**
- Produces (`cabinet-data.ts`):
  - `ORDER_BUCKET(status): 'active' | 'done'` — `published`/`in_progress`→`'active'`, иначе `'done'`.
  - `CABINET_TABS: Record<'customer'|'executor'|'other', {key,label,icon}[]>`.
  - `roleGroup(role): 'customer' | 'executor' | 'other'` — `customer`→customer; `designer`/`expert`→executor; иначе other.
- Produces (`tabs.tsx`): `Overview({user})`, `Notifications()`.

- [ ] **Step 1: `app/_cabinet/cabinet-data.ts`**

```ts
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
```

- [ ] **Step 2: `app/_cabinet/tabs.tsx` — Overview + Notifications**

```tsx
// @ts-nocheck
'use client';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { ORDER_STATUS_MAP } from '@/lib/constants';
import { Icon } from '../_orders/icons';
import { roleGroup, ORDER_BUCKET, EXP_BUCKET } from './cabinet-data';

function Kpi({ icon, num, label }) {
  return (
    <div className="stat">
      <div className="stat__icon"><Icon name={icon} /></div>
      <div className="stat__num">{num}</div>
      <div className="stat__label">{label}</div>
    </div>
  );
}

export function Overview() {
  const { user, orders, getMyOrders, getMyResponses, getMyExpertiseResponses, getMyExpertiseProjects, getRecommendedOrders } = useApp();
  const grp = roleGroup(user.role);

  if (grp === 'customer') {
    const my = getMyOrders();
    const active = my.filter((o) => o.status === 'published').length;
    const inwork = my.filter((o) => o.status === 'in_progress').length;
    const done = my.filter((o) => o.status === 'completed').length;
    const replies = my.reduce((s, o) => s + (o.responsesCount || 0), 0);
    return (
      <div className="cab-tabpane">
        <div className="grid-3 cab-kpis" style={{ marginBottom: 28 }}>
          <Kpi icon="file" num={active} label="Активных заявок" />
          <Kpi icon="layers" num={inwork} label="В работе" />
          <Kpi icon="checkCircle" num={done} label="Завершено" />
          <Kpi icon="comment" num={replies} label="Всего откликов" />
        </div>
        <div className="row between" style={{ marginBottom: 16 }}>
          <h2 className="section-title" style={{ margin: 0 }}>Последние отклики на мои заявки</h2>
          <Link href="/orders/new" className="btn btn-primary btn-sm"><Icon name="plus" size={15} /> Создать заявку</Link>
        </div>
        {my.filter((o) => o.responsesCount > 0).slice(0, 4).map((o) => (
          <Link key={o.id} href={`/orders/detail?id=${o.id}`} style={{ textDecoration: 'none' }}>
            <div className="card card-hover" style={{ marginBottom: 12 }}>
              <div className="row between gap16">
                <div style={{ fontWeight: 700, fontSize: 15, minWidth: 0 }}>{o.title}</div>
                <span className="row gap6 dim" style={{ fontSize: 13 }}><Icon name="comment" size={14} /> {o.responsesCount}</span>
              </div>
            </div>
          </Link>
        ))}
        {my.filter((o) => o.responsesCount > 0).length === 0 && (
          <div className="empty"><div className="empty__icon"><Icon name="comment" size={24} /></div>
            <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>Откликов пока нет — опубликуйте заявку.</p></div>
        )}
      </div>
    );
  }

  // executor (designer / expert)
  const isExpert = user.role === 'expert';
  const responses = isExpert ? getMyExpertiseResponses() : getMyResponses();
  const projects = isExpert ? getMyExpertiseProjects() : orders.filter((o) => o.assignedDesignerId === user.id);
  const inWork = projects.filter((p) => (isExpert ? EXP_BUCKET(p.status) : ORDER_BUCKET(p.status)) === 'active').length;
  const done = projects.length - inWork;
  const recommended = getRecommendedOrders();
  return (
    <div className="cab-tabpane">
      <div className="grid-3 cab-kpis" style={{ marginBottom: 28 }}>
        <Kpi icon="comment" num={responses.length} label="Мои отклики" />
        <Kpi icon="layers" num={inWork} label="В работе" />
        <Kpi icon="checkCircle" num={done} label="Завершено" />
        <Kpi icon="star" num={user.rating ?? '—'} label="Рейтинг" />
      </div>
      <div className="row between" style={{ marginBottom: 16 }}>
        <h2 className="section-title" style={{ margin: 0 }}>{isExpert ? 'Рекомендованные обследования' : 'Рекомендованные заявки'}</h2>
        <Link href={isExpert ? '/expertise' : '/orders'} className="btn btn-primary btn-sm">{isExpert ? 'Смотреть обследования' : 'Смотреть заявки'}</Link>
      </div>
      {recommended.map((o) => (
        <Link key={o.id} href={`/orders/detail?id=${o.id}`} style={{ textDecoration: 'none' }}>
          <div className="card card-hover" style={{ marginBottom: 12 }}>
            <div className="row between gap16">
              <div style={{ fontWeight: 700, fontSize: 15, minWidth: 0 }}>{o.title}</div>
              <span className="price row gap6"><Icon name="wallet" size={15} style={{ color: 'var(--accent-2)' }} /> {o.budget}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Notifications() {
  const SAMPLE = [
    ['comment', 'Новый отклик на вашу заявку «ЖК Северный парк»', '2 ч назад'],
    ['layers', 'Заявка «Реконструкция склада» перешла в работу', 'вчера'],
    ['checkCircle', 'Исполнитель выбран по заявке «Школа на 1100 мест»', '3 дня назад'],
  ];
  return (
    <div className="cab-tabpane">
      <div className="hintbar" style={{ marginBottom: 18, borderLeftColor: 'var(--amber)' }}>
        <Icon name="bell" size={18} style={{ color: 'var(--amber)' }} />
        <div><b>Раздел в разработке.</b> Здесь появятся события: новые отклики, смена статусов, выбор исполнителя.</div>
      </div>
      <div className="col gap10">
        {SAMPLE.map(([ic, txt, time], i) => (
          <div key={i} className="row gap14" style={{ padding: '13px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', opacity: .7 }}>
            <span className="prev__ico"><Icon name={ic} size={15} /></span>
            <span className="grow" style={{ fontSize: 13.5 }}>{txt}</span>
            <span className="dim" style={{ fontSize: 12, flex: 'none' }}>{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

> `user.rating` в модели `User` нет — выводим `'—'` (заглушка рейтинга, как в спеке §11). Не добавлять поле сейчас.

- [ ] **Step 3: Переписать `app/(internal)/dashboard/page.tsx` в контейнер**

```tsx
// @ts-nocheck
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Icon } from '../../_orders/icons';
import { Avatar } from '../../_orders/shared';
import { CABINET_TABS, roleGroup } from '../../_cabinet/cabinet-data';
import { Overview, Notifications } from '../../_cabinet/tabs';
import { ProfileForm } from '../../_cabinet/ProfileForm';
import '../../_orders/orders.css';

const ROLE_LABEL = { customer: 'Заказчик', designer: 'Проектировщик', expert: 'Инженер-обследователь', manufacturer: 'Производитель' };

export default function CabinetPage() {
  const { user, logout, getMyOrders } = useApp();
  const [tab, setTab] = useState('overview');

  if (!user) {
    return (
      <div className="fx animate-in">
        <div className="empty">
          <div className="empty__icon" style={{ marginBottom: 12 }}><Icon name="shield" size={26} /></div>
          <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#fff' }}>Необходима авторизация</h3>
          <Link href="/auth" className="btn btn-primary" style={{ marginTop: 16 }}>Войти</Link>
        </div>
      </div>
    );
  }

  const grp = roleGroup(user.role);
  const tabs = CABINET_TABS[grp];
  const cur = tabs.find((t) => t.key === tab) ? tab : 'overview';
  const activeOrders = getMyOrders().filter((o) => o.status === 'published').length;

  return (
    <div className="fx animate-in">
      <div className="cab-head">
        <Avatar text={(user.name || 'П').slice(0, 2).toUpperCase()} size={56} />
        <div className="cab-head__body">
          <h1 className="page-title" style={{ margin: 0 }}>Личный кабинет</h1>
          <p className="page-sub" style={{ margin: '4px 0 0' }}>{user.name} · {user.email}{user.company ? ` · ${user.company}` : ''}</p>
        </div>
        <div className="cab-head__meta">
          <span className="badge done"><i />{ROLE_LABEL[user.role] || user.role}</span>
          {grp === 'customer'
            ? <span className="dim" style={{ fontSize: 13 }}>{activeOrders} активных заявок</span>
            : <span className="row gap6" style={{ fontSize: 13, color: 'var(--amber)', fontWeight: 600 }}><Icon name="star" size={14} /> рейтинг —</span>}
        </div>
      </div>

      <div className="tabs cab-tabs">
        {tabs.map((t) => (
          <button key={t.key} className={'tab' + (t.key === cur ? ' is-active' : '')} onClick={() => setTab(t.key)}>
            <Icon name={t.icon} size={15} /> {t.label}
          </button>
        ))}
      </div>

      {cur === 'overview' && <Overview />}
      {cur === 'notifications' && <Notifications />}
      {cur === 'profile' && <ProfileForm />}
      {/* orders/responses/inwork/favorites — Task 6–7 */}
    </div>
  );
}
```

- [ ] **Step 4: CSS кабинета в `app/_orders/orders.css`** (в конец файла)

```css
/* ====== Личный кабинет ====== */
.fx .cab-head { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.fx .cab-head__body { flex: 1; min-width: 0; }
.fx .cab-head__meta { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex: none; }
.fx .cab-tabs { flex-wrap: wrap; margin-bottom: 24px; }
.fx .cab-tabs .tab { display: inline-flex; align-items: center; gap: 7px; }
.fx .cab-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
@media (max-width: 720px) { .fx .cab-kpis { grid-template-columns: repeat(2, 1fr); } .fx .cab-head { flex-wrap: wrap; } }
.fx .cab-tabpane { animation: fade .35s ease both; }
.fx .cab-seg { display: inline-flex; gap: 4px; padding: 4px; border-radius: 999px; background: var(--surface-2); border: 1px solid var(--border); margin-bottom: 16px; }
.fx .cab-seg button { height: 32px; padding: 0 16px; border-radius: 999px; border: none; background: transparent; color: var(--text-dim); font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s, color .15s; }
.fx .cab-seg button.is-on { background: var(--grad); color: #fff; }
```

> `.fx .tabs`/`.tab`/`.stat`/`.badge`/`.empty`/`.hintbar`/`.prev__ico` уже существуют — переиспользуем. Проверить наличие `.fx .tabs` (используется в `orders/detail`); если нет — добавить минимально.

- [ ] **Step 5: Verify build + поведение**

Run: `npm run build` → успех.
CDP/dev (см. Приложение A): залогиниться **заказчиком** (`role: 'customer'`) → видны вкладки Обзор/Мои заявки/Отклики/Уведомления/Профиль; «Обзор» и «Профиль» работают. Залогиниться **исполнителем** (`role: 'designer'` и `role: 'expert'`) → видны Обзор/Мои отклики/В работе/Избранные документы/Уведомления/Профиль.

- [ ] **Step 6: Commit**

```bash
git add app/_cabinet/cabinet-data.ts app/_cabinet/tabs.tsx "app/(internal)/dashboard/page.tsx" app/_orders/orders.css
git commit -m "feat(cabinet): каркас кабинета (контейнер, вкладки, Обзор, Уведомления, Профиль)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Вкладки заказчика (Мои заявки + Отклики) и исполнителя (Мои отклики + В работе)

**Files:**
- Modify: `app/_cabinet/tabs.tsx` (добавить экспортируемые компоненты)
- Modify: `app/(internal)/dashboard/page.tsx` (подключить вкладки)

**Interfaces:**
- Consumes: `ORDER_BUCKET`, `EXP_BUCKET` (`cabinet-data`); `getMyOrders`, `getResponsesForOrder`, `selectExecutor`, `getMyResponses`, `getMyExpertiseResponses`, `getMyExpertiseProjects`, `orders` (стор).
- Produces: `CustomerOrders()`, `CustomerResponses()`, `ExecResponses()`, `ExecInWork()`.

- [ ] **Step 1: Сегмент-контрол + `CustomerOrders` в `tabs.tsx`**

Добавить вверх файла общий хелпер сегмента и компоненты:

```tsx
function Seg({ value, onChange, left, right }) {
  return (
    <div className="cab-seg">
      <button className={value === 'active' ? 'is-on' : ''} onClick={() => onChange('active')}>{left}</button>
      <button className={value === 'done' ? 'is-on' : ''} onClick={() => onChange('done')}>{right}</button>
    </div>
  );
}

export function CustomerOrders() {
  const { getMyOrders } = useApp();
  const [seg, setSeg] = useState('active');
  const my = getMyOrders();
  const list = my.filter((o) => ORDER_BUCKET(o.status) === seg);
  return (
    <div className="cab-tabpane">
      <div className="row between" style={{ marginBottom: 4 }}>
        <Seg value={seg} onChange={setSeg} left="В работе" right="Отработанные" />
        <Link href="/orders/new" className="btn btn-primary btn-sm"><Icon name="plus" size={15} /> Создать заявку</Link>
      </div>
      {list.length === 0
        ? <div className="empty"><div className="empty__icon"><Icon name="file" size={24} /></div>
            <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>{seg === 'active' ? 'Активных заявок нет.' : 'Завершённых заявок нет.'}</p></div>
        : <div className="col gap12">{list.map((o) => {
            const st = ORDER_STATUS_MAP[o.status];
            return (
              <Link key={o.id} href={`/orders/detail?id=${o.id}`} style={{ textDecoration: 'none' }}>
                <div className="card card-hover">
                  <div className="row between gap16" style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, minWidth: 0 }}>{o.title}</div>
                    <span className="badge" style={{ flex: 'none', color: st.color, background: `${st.color}16` }}>{st.label}</span>
                  </div>
                  <div className="row between gap16 wrap">
                    <span className="row gap6 dim" style={{ fontSize: 13 }}><Icon name="comment" size={14} /> {o.responsesCount} откликов</span>
                    <span className="price row gap6"><Icon name="wallet" size={16} style={{ color: 'var(--accent-2)' }} /> {o.budget}</span>
                  </div>
                </div>
              </Link>
            );
          })}</div>}
    </div>
  );
}
```

(`ORDER_BUCKET, EXP_BUCKET` уже импортированы в шапке `tabs.tsx` из Task 5. Добавить только `useState` в существующий импорт react: `import { useState } from 'react';` — если ещё не добавлен.)

- [ ] **Step 2: `CustomerResponses` — все отклики по моим заявкам**

```tsx
export function CustomerResponses() {
  const { getMyOrders, getResponsesForOrder, selectExecutor, notify } = useApp();
  const my = getMyOrders();
  const groups = my.map((o) => ({ order: o, responses: getResponsesForOrder(o.id) })).filter((g) => g.responses.length > 0);
  if (groups.length === 0)
    return <div className="cab-tabpane"><div className="empty"><div className="empty__icon"><Icon name="comment" size={24} /></div>
      <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>Откликов на ваши заявки пока нет.</p></div></div>;
  return (
    <div className="cab-tabpane col gap20">
      {groups.map(({ order, responses }) => (
        <div key={order.id}>
          <div className="row between" style={{ marginBottom: 10 }}>
            <h3 className="section-title" style={{ margin: 0, fontSize: 15 }}>{order.title}</h3>
            <span className="dim" style={{ fontSize: 13 }}>{responses.length} откл.</span>
          </div>
          <div className="col gap10">
            {responses.map((r) => (
              <div key={r.id} className="card">
                <div className="row between gap16" style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.designerName}{r.designerCompany ? ` · ${r.designerCompany}` : ''}</div>
                  {r.proposedBudget && <span className="price row gap6"><Icon name="wallet" size={15} style={{ color: 'var(--accent-2)' }} /> {r.proposedBudget}</span>}
                </div>
                <p className="muted" style={{ margin: '0 0 12px', fontSize: 13.5, lineHeight: 1.5 }}>{r.message}</p>
                <div className="row gap8">
                  <button className="btn btn-primary btn-sm" onClick={() => { selectExecutor(order.id, r.designerId, r.designerName); notify('Исполнитель выбран'); }}>Выбрать</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: `ExecResponses` — мои отклики (проектировщик/обследователь)**

```tsx
export function ExecResponses() {
  const { user, getMyResponses, getMyExpertiseResponses, getOrderById } = useApp();
  const isExpert = user.role === 'expert';
  if (isExpert) {
    const list = getMyExpertiseResponses();
    if (!list.length) return <div className="cab-tabpane"><div className="empty"><div className="empty__icon"><Icon name="comment" size={24} /></div>
      <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>Откликов на обследования пока нет.</p></div></div>;
    return (
      <div className="cab-tabpane col gap12">
        {list.map((r) => (
          <Link key={r.id} href="/expertise" style={{ textDecoration: 'none' }}>
            <div className="card card-hover">
              <div className="row between gap16" style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Отклик на обследование</div>
                <span className="badge done"><i />{r.status === 'accepted' ? 'Принят' : r.status === 'declined' ? 'Отклонён' : 'Отправлен'}</span>
              </div>
              <p className="muted" style={{ margin: '0 0 10px', fontSize: 13.5, lineHeight: 1.5 }}>{r.message}</p>
              {r.proposedBudget && <span className="price row gap6"><Icon name="wallet" size={15} style={{ color: 'var(--accent-2)' }} /> {r.proposedBudget}</span>}
            </div>
          </Link>
        ))}
      </div>
    );
  }
  const list = getMyResponses();
  if (!list.length) return <div className="cab-tabpane"><div className="empty"><div className="empty__icon"><Icon name="comment" size={24} /></div>
    <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>У вас пока нет откликов. Найдите заявку и предложите решение.</p>
    <Link href="/orders" className="btn btn-primary" style={{ marginTop: 16 }}>Смотреть заявки</Link></div></div>;
  return (
    <div className="cab-tabpane col gap12">
      {list.map((r) => {
        const o = getOrderById(r.orderId);
        return (
          <Link key={r.id} href={`/orders/detail?id=${r.orderId}`} style={{ textDecoration: 'none' }}>
            <div className="card card-hover">
              <div className="row between gap16" style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{o ? o.title : 'Отклик на заявку'}</div>
              </div>
              <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5 }}>{r.message}</p>
              {r.proposedBudget && <span className="price row gap6" style={{ marginTop: 12 }}><Icon name="wallet" size={15} style={{ color: 'var(--accent-2)' }} /> {r.proposedBudget}</span>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: `ExecInWork` — проекты в работе (с сегментом)**

```tsx
export function ExecInWork() {
  const { user, getMyExpertiseProjects, orders } = useApp();
  const [seg, setSeg] = useState('active');
  const isExpert = user.role === 'expert';
  if (isExpert) {
    const all = getMyExpertiseProjects();
    const list = all.filter((p) => EXP_BUCKET(p.status) === seg);
    return (
      <div className="cab-tabpane">
        <Seg value={seg} onChange={setSeg} left="В работе" right="Завершённые" />
        {list.length === 0
          ? <div className="empty"><p className="muted" style={{ margin: 0, fontSize: 14 }}>{seg === 'active' ? 'Нет обследований в работе.' : 'Нет завершённых.'}</p></div>
          : <div className="col gap12">{list.map((p) => (
              <div key={p.id} className="card">
                <div className="row between gap16" style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, minWidth: 0 }}>{p.title}</div>
                  <span className="badge done"><i />{p.status}</span>
                </div>
                <div className="row gap16 dim" style={{ fontSize: 13 }}>
                  <span>{p.company}</span><span>Замечаний: {p.fixedRemarks}/{p.totalRemarks}</span><span>Срок: {p.dueDate}</span>
                </div>
              </div>
            ))}</div>}
      </div>
    );
  }
  // designer: заявки, где меня выбрали исполнителем
  const mine = orders.filter((o) => o.assignedDesignerId === user.id);
  const list = mine.filter((o) => ORDER_BUCKET(o.status) === seg);
  return (
    <div className="cab-tabpane">
      <Seg value={seg} onChange={setSeg} left="В работе" right="Завершённые" />
      {list.length === 0
        ? <div className="empty"><p className="muted" style={{ margin: 0, fontSize: 14 }}>{seg === 'active' ? 'Пока нет проектов в работе. Откликнитесь на заявку — выбранные проекты появятся здесь.' : 'Завершённых проектов нет.'}</p></div>
        : <div className="col gap12">{list.map((o) => {
            const st = ORDER_STATUS_MAP[o.status];
            return (
              <Link key={o.id} href={`/orders/detail?id=${o.id}`} style={{ textDecoration: 'none' }}>
                <div className="card card-hover">
                  <div className="row between gap16"><div style={{ fontWeight: 700, fontSize: 15 }}>{o.title}</div>
                    <span className="badge" style={{ flex: 'none', color: st.color, background: `${st.color}16` }}>{st.label}</span></div>
                </div>
              </Link>
            );
          })}</div>}
    </div>
  );
}
```

- [ ] **Step 5: Подключить вкладки в `dashboard/page.tsx`**

Добавить импорт: `import { Overview, Notifications, CustomerOrders, CustomerResponses, ExecResponses, ExecInWork } from '../../_cabinet/tabs';`
В рендере после `{cur === 'overview' && <Overview />}` добавить:

```tsx
      {cur === 'orders' && <CustomerOrders />}
      {cur === 'responses' && grp === 'customer' && <CustomerResponses />}
      {cur === 'responses' && grp === 'executor' && <ExecResponses />}
      {cur === 'inwork' && <ExecInWork />}
```

- [ ] **Step 6: Verify build + поведение**

Run: `npm run build` → успех.
CDP/dev: заказчик → «Мои заявки» переключаются В работе/Отработанные; «Отклики» группируются по заявке, кнопка «Выбрать» переводит заявку в работу. Исполнитель (designer/expert) → «Мои отклики» и «В работе» показывают корректные данные (у expert — мок-обследования с сегментом).

- [ ] **Step 7: Commit**

```bash
git add app/_cabinet/tabs.tsx "app/(internal)/dashboard/page.tsx"
git commit -m "feat(cabinet): вкладки заявок/откликов/в-работе (статусный сплит, обе роли)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Вкладка «Избранные документы» (исполнитель)

**Files:**
- Modify: `app/_cabinet/tabs.tsx`
- Modify: `app/(internal)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `getFavoriteStandards`, `toggleFavoriteStandard` (стор).
- Produces: `ExecFavorites()`.

- [ ] **Step 1: `ExecFavorites` в `tabs.tsx`**

```tsx
export function ExecFavorites() {
  const { getFavoriteStandards, toggleFavoriteStandard } = useApp();
  const favs = getFavoriteStandards();
  if (!favs.length)
    return <div className="cab-tabpane"><div className="empty"><div className="empty__icon"><Icon name="star" size={24} /></div>
      <h3 style={{ margin: '8px 0 4px', fontSize: 16, color: '#fff' }}>Нет избранных документов</h3>
      <p className="muted" style={{ margin: '0 0 16px', fontSize: 14 }}>Отметьте документы ⭐ в разделе «Нормативы» — они появятся здесь.</p>
      <Link href="/standards" className="btn btn-primary">Открыть Нормативы</Link></div></div>;
  return (
    <div className="cab-tabpane">
      <div className="row between" style={{ marginBottom: 14 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Избранные документы</h2>
        <Link href="/standards" className="btn btn-ghost btn-sm">Все нормативы <Icon name="arrowRight" size={14} /></Link>
      </div>
      <div className="col gap10">
        {favs.map((d) => (
          <div key={d.code} className="row gap14" style={{ padding: '13px 16px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <span className="chip chip-code" style={{ flex: 'none' }}>{d.type}</span>
            <div className="grow" style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{d.code}</div>
              <div className="dim" style={{ fontSize: 12.5, marginTop: 2 }}>{d.title} · {d.status}</div>
            </div>
            <button className="iconbtn" title="Убрать из избранного" onClick={() => toggleFavoriteStandard(d.code)} style={{ color: 'var(--amber)' }}><Icon name="star" size={17} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Подключить в `dashboard/page.tsx`**

Добавить в импорт `ExecFavorites`; в рендер: `{cur === 'favorites' && <ExecFavorites />}`.

- [ ] **Step 3: Verify build + сквозное поведение**

Run: `npm run build` → успех.
CDP/dev (ключевой сценарий): войти исполнителем → `/standards` → ⭐ на документе → открыть «Личный кабинет» → вкладка «Избранные документы» показывает этот документ. Снять ⭐ в кабинете → документ исчезает; вернуться в «Нормативы» — там тоже снят. **Переживает перезагрузку.**

- [ ] **Step 4: Commit**

```bash
git add app/_cabinet/tabs.tsx "app/(internal)/dashboard/page.tsx"
git commit -m "feat(cabinet): вкладка «Избранные документы» (общий источник с Нормативами)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: IA — пункт сайдбара «Личный кабинет», редирект «Настроек»

**Files:**
- Modify: `app/(internal)/layout.tsx` (`NAV_ITEMS` + точка входа)
- Modify: `app/(internal)/settings/page.tsx` (редирект)

**Interfaces:**
- Consumes: существующий `NAV_ITEMS`, `useRouter`.

- [ ] **Step 1: `NAV_ITEMS` — заменить «Настройки» на «Личный кабинет»**

В `app/(internal)/layout.tsx`: заменить последний элемент
`{ icon: Settings2, label: 'Настройки', href: '/settings' }`
на
`{ icon: UserRound, label: 'Личный кабинет', href: '/dashboard' }`
и импортировать `UserRound` из `lucide-react` (рядом с прочими иконками; если предпочесть существующую — допустимо `LayoutGrid`/`UserCircle`). `Settings2` убрать из импорта, если больше не используется.

- [ ] **Step 2: Топбар-аватар/имя → кабинет (если есть кликабельный блок пользователя)**

Если в `layout.tsx` есть блок пользователя в топбаре/подвале сайдбара — обернуть его в `Link href="/dashboard"` (как точку входа в кабинет). Если такого блока нет — шаг пропустить (пункт сайдбара достаточен).

- [ ] **Step 3: `settings/page.tsx` → редирект на вкладку профиля**

Заменить содержимое страницы на тонкий клиентский редирект (сохраняем обратную совместимость старых ссылок `/settings`):

```tsx
// @ts-nocheck
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard?tab=profile'); }, [router]);
  return null;
}
```

- [ ] **Step 4: Кабинет читает `?tab=` (для ссылки `/dashboard?tab=profile`)**

В `dashboard/page.tsx` инициализировать вкладку из query (внутри `Suspense`, т.к. `useSearchParams` требует границы — как в `orders/detail`). Минимально: импортировать `useSearchParams`, обернуть содержимое в `<Suspense>`, и стартовое значение `tab` брать из `searchParams.get('tab')` с откатом на `'overview'`, проверяя, что вкладка есть в наборе роли (иначе `'overview'`).

```tsx
// внутри компонента, обёрнутого в Suspense:
const sp = useSearchParams();
const initial = sp.get('tab');
const [tab, setTab] = useState(initial && CABINET_TABS[roleGroup(user.role)].some((t) => t.key === initial) ? initial : 'overview');
```

> Паттерн `Suspense` для `useSearchParams` уже применён в `app/(internal)/orders/detail/page.tsx` — повторить тот же каркас (внешний компонент со `<Suspense>`, внутренний — с хуком).

- [ ] **Step 5: Verify build + поведение**

Run: `npm run build` → успех (статическая генерация `/dashboard` и `/settings` без ошибок Suspense).
CDP/dev: в сайдбаре один пункт «Личный кабинет» (нет «Настройки»); переход на `/settings` редиректит в кабинет на вкладку «Профиль».

- [ ] **Step 6: Commit**

```bash
git add "app/(internal)/layout.tsx" "app/(internal)/settings/page.tsx" "app/(internal)/dashboard/page.tsx"
git commit -m "feat(cabinet): пункт сайдбара «Личный кабинет», /settings → вкладка Профиль, ?tab=

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Профиль-вкладка исполнителя — карточка/портфолио + финальная проверка

**Files:**
- Modify: `app/_cabinet/tabs.tsx` (доп. блок над `ProfileForm` для исполнителя — публичная карточка)
- Modify: `app/(internal)/dashboard/page.tsx` (профиль исполнителя = карточка + `ProfileForm`)

**Interfaces:**
- Produces: `ExecPublicCard()` — публичная мини-карточка (специализация/СРО/рейтинг/портфолио, мок).

- [ ] **Step 1: `ExecPublicCard` в `tabs.tsx`**

```tsx
export function ExecPublicCard() {
  const { user } = useApp();
  const isExpert = user.role === 'expert';
  const specs = user.specializations || [];
  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <h3 className="section-title" style={{ marginBottom: 14 }}>Публичная карточка</h3>
      <div className="row gap16 wrap" style={{ alignItems: 'flex-start' }}>
        <div className="col gap10" style={{ flex: 1, minWidth: 220 }}>
          <div className="dim" style={{ fontSize: 13 }}>{isExpert ? 'Виды обследования' : 'Разделы ПД'}</div>
          <div className="chips">{specs.length ? specs.map((s) => <span key={s} className="chip chip-code">{s}</span>) : <span className="dim" style={{ fontSize: 13 }}>Не указаны — добавьте в профиле ниже.</span>}</div>
        </div>
        <div className="col gap8" style={{ flex: 'none' }}>
          <span className="row gap6" style={{ fontSize: 13 }}><Icon name="cert" size={15} /> СРО: {user.sroNumber || '—'}</span>
          <span className="row gap6" style={{ fontSize: 13, color: 'var(--amber)', fontWeight: 600 }}><Icon name="star" size={15} /> рейтинг —</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: В контейнере профиль исполнителя = карточка + форма**

В `dashboard/page.tsx` заменить `{cur === 'profile' && <ProfileForm />}` на:

```tsx
      {cur === 'profile' && <>{grp === 'executor' && <ExecPublicCard />}<ProfileForm /></>}
```

(добавить `ExecPublicCard` в импорт из `tabs`).

- [ ] **Step 3: Финальная сборка + визуальная проверка обеих ролей (Приложение A)**

Run: `npm run build` → успех.
Снять CDP-скриншоты для `role: 'customer'`, `role: 'designer'`, `role: 'expert'`: пройти по всем вкладкам, убедиться, что у каждой роли свой набор и данные. Проверить пустые состояния и сегменты.

- [ ] **Step 4: Commit**

```bash
git add app/_cabinet/tabs.tsx "app/(internal)/dashboard/page.tsx"
git commit -m "feat(cabinet): публичная карточка исполнителя во вкладке Профиль

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Приложение A. Поведенческая проверка через dev + CDP (без тест-фреймворка)

Многие вкладки за auth-гейтом. Для проверки — тот же приём, что использовался при рестайле формы заявки:

1. `PORT=3000 npm run dev` (фон) + headless Chrome с `--remote-debugging-port=9222` (фон).
2. Dependency-free CDP-скрипт (Node v24, глобальный `WebSocket`): открыть `http://localhost:3000/`, засеять `localStorage.pm_state` пользователем нужной роли:
   ```js
   const user = { id:'demo-customer', email:'demo@funktsiya.ru', name:'Демо Заказчик', role:'customer', createdAt:new Date().toISOString() };
   // role: 'designer' | 'expert' | 'customer'; для expert — id:'demo-expert' (совпадает с моками откликов)
   ```
   затем перейти на `http://localhost:3000/dashboard/`, дождаться `.cab-tabs`, кликать `.tab` и снимать `Page.captureScreenshot`.
3. По завершении — остановить фоновые процессы (TaskStop). Скрипт-образец — в истории сессии (рестайл формы).

> Для роли `expert` использовать `id:'demo-expert'`, чтобы вкладки «Мои отклики/В работе» показали мок-данные (`MOCK_EXPERTISE_RESPONSES`/`MOCK_EXPERTISE_PROJECTS` через геттеры по роли).

## Приложение B. Дефолты по открытым вопросам спеки (§15)

- **`FavStrip`/`MOCK_FAVORITES`** в `/standards` — оставить декоративной (не трогать) в рамках этого плана.
- **`cancelled`-заявки** — попадают в бакет «Отработанные/Завершённые» (через `ORDER_BUCKET`).
- **Активная вкладка** — локальный стейт + чтение стартового `?tab=` (Task 8 Step 4).
- **Производитель/`other`** — минимальный набор (Обзор+Профиль) из `CABINET_TABS.other`.
