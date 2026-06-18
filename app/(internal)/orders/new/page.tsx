// @ts-nocheck
'use client';

/* Создание заявки — обновлённый дизайн «Функция» (рестайл OrderNew из Cloud Design):
   5 шагов + живой предпросмотр. Логика сохранена из рабочей версии:
   — реальные типы объектов и регионы;
   — «умные» разделы из getSections(stage, objectType) по ПП РФ №87;
   — специалисты выводятся из выбранных разделов;
   — addOrder создаёт настоящую заявку, auth-guard на вход.
   Рестайл: подтипы объекта (pillpick--amber), стадии и разделы на secpick--amber,
   нативный датапикер DateField, превью с анимированными маскотами, описание в шаге «Файлы». */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { REGIONS, getSections, STAGE_LABELS } from '@/lib/constants';
import { Icon } from '../../../_orders/icons';
import { formatDeadline, formatMoney } from '../../../_orders/shared';
import { Mascots } from '../../../_landing/characters';
import '../../../_orders/orders.css';

const STEPS = ['Тип объекта', 'Регион и стадия', 'Разделы', 'Бюджет и сроки', 'Файлы'];

// Бюджет валиден, если это положительное число (BUG-009).
const isValidBudget = (v) => { const n = parseInt(String(v).replace(/\D/g, ''), 10); return !!n && n > 0; };

// Карточки типов объектов: [value, иконка, подпись, пояснение].
const TYPE_CARDS = [
  ['commercial', 'building', 'Коммерческая недвижимость', 'Офисы, ТЦ, склады, гостиницы'],
  ['residential', 'grid', 'Жилая недвижимость', 'Многоквартирные дома, ЖК'],
  ['industrial', 'factory', 'Промышленность', 'Заводы, цехи, производства'],
  ['linear', 'globe', 'Линейные объекты', 'Дороги, сети, трубопроводы'],
  ['buildings', 'layers', 'Здания и сооружения', 'Общественные и спец. объекты'],
  ['private', 'pin', 'Частное строительство', 'Дома, коттеджи, участки'],
];
const TYPE_LABEL = Object.fromEntries(TYPE_CARDS.map(([v, , l]) => [v, l]));

// Назначение объекта (подтип) — уточнение к типу. Складывается в описание заявки.
const SUBTYPES = {
  commercial: ['Офис', 'Торговый центр', 'Склад', 'Гостиница', 'Бизнес-центр', 'Другое'],
  residential: ['Многоквартирный дом', 'ЖК', 'Апартаменты', 'Таунхаусы', 'Другое'],
  industrial: ['Завод', 'Цех', 'Логистический комплекс', 'Энергообъект', 'Другое'],
  linear: ['Автодорога', 'Инженерные сети', 'Трубопровод', 'ЛЭП', 'Другое'],
  buildings: ['Школа / детсад', 'Больница', 'Спортобъект', 'Админздание', 'Другое'],
  private: ['Жилой дом', 'Коттедж', 'Баня / хозблок', 'Участок', 'Другое'],
};

// Стадии проектирования: [value, код, полное название]. sketch/P/PD → разделы стадии «П».
const STAGES = [
  ['sketch', 'Эскиз', 'Эскизный проект'],
  ['P', 'П', 'Стадия «Проект»'],
  ['PD', 'ПД', 'Проектная документация'],
  ['RD', 'РД', 'Рабочая документация'],
];
// Тип привлечения: [value, подпись].
const SCALES = [['single', 'Один специалист'], ['team', 'Команда'], ['org', 'Организация']];
const SCALE_SHORT = { single: 'Один специалист', team: 'Команда', org: 'Организация' };

/* ====== Нативный датапикер (в теме приложения) ====== */
const RU_MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const RU_MON_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const RU_WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const pad2 = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => pad2(d.getDate()) + '.' + pad2(d.getMonth() + 1) + '.' + d.getFullYear();
const parseDate = (s) => {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec((s || '').trim());
  if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  return isNaN(d.getTime()) ? null : d;
};
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a, b) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function DateField({ value, onChange, placeholder }) {
  const today = startOfDay(new Date());
  const sel = parseDate(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('day');
  const [vy, setVy] = useState((sel || today).getFullYear());
  const [vm, setVm] = useState((sel || today).getMonth());
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', h);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', esc); };
  }, [open]);

  // при открытии — показываем месяц выбранной даты (или текущий)
  useEffect(() => {
    if (open) {
      const b = parseDate(value) || today;
      setVy(b.getFullYear());
      setVm(b.getMonth());
      setView('day');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pick = (d) => { onChange(fmtDate(d)); setOpen(false); };
  const stepMonth = (dir) => {
    let m = vm + dir, y = vy;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setVm(m); setVy(y);
  };
  const prev = () => (view === 'day' ? stepMonth(-1) : view === 'month' ? setVy(vy - 1) : setVy(vy - 12));
  const next = () => (view === 'day' ? stepMonth(1) : view === 'month' ? setVy(vy + 1) : setVy(vy + 12));
  const titleClick = () => setView(view === 'day' ? 'month' : view === 'month' ? 'year' : 'year');

  const yearStart = Math.floor(vy / 12) * 12;
  const first = new Date(vy, vm, 1);
  const offset = (first.getDay() + 6) % 7; // понедельник первый
  const cells = [];
  for (let i = 0; i < 42; i++) cells.push(new Date(vy, vm, 1 - offset + i));
  const title = view === 'day' ? RU_MONTHS[vm] + ' ' + vy : view === 'month' ? String(vy) : yearStart + '–' + (yearStart + 11);

  return (
    <div className="dp" ref={ref}>
      <button type="button" className={'dp-trigger' + (open ? ' is-open' : '') + (sel ? ' has-val' : '')} onClick={() => setOpen((o) => !o)}>
        <Icon name="calendar" size={17} />
        <span className="dp-trigger__t">{sel ? fmtDate(sel) : (placeholder || 'Выберите дату')}</span>
        {sel
          ? <span className="dp-clear" title="Очистить" onClick={(e) => { e.stopPropagation(); onChange(''); }}><Icon name="x" size={14} /></span>
          : <Icon name="chevD" size={15} style={{ color: 'var(--text-mute)', flex: 'none' }} />}
      </button>
      {open && (
        <div className="dp-pop">
          <div className="dp-head">
            <button type="button" className="dp-nav" onClick={prev} aria-label="Назад"><Icon name="chevR" size={16} style={{ transform: 'rotate(180deg)' }} /></button>
            <button type="button" className="dp-title" onClick={titleClick}>{title}</button>
            <button type="button" className="dp-nav" onClick={next} aria-label="Вперёд"><Icon name="chevR" size={16} /></button>
          </div>

          {view === 'day' && (
            <>
              <div className="dp-wd">{RU_WD.map((w) => <span key={w}>{w}</span>)}</div>
              <div className="dp-grid">
                {cells.map((d, i) => {
                  const other = d.getMonth() !== vm;
                  const disabled = d < today;
                  return (
                    <button key={i} type="button" disabled={disabled}
                      className={'dp-cell' + (other ? ' is-other' : '') + (sameDay(d, sel) ? ' is-sel' : '') + (sameDay(d, today) ? ' is-today' : '')}
                      onClick={() => pick(d)}>{d.getDate()}</button>
                  );
                })}
              </div>
            </>
          )}

          {view === 'month' && (
            <div className="dp-grid dp-grid--my">
              {RU_MON_SHORT.map((mn, i) => (
                <button key={mn} type="button"
                  className={'dp-my' + (sel && sel.getFullYear() === vy && sel.getMonth() === i ? ' is-sel' : '') + (today.getFullYear() === vy && today.getMonth() === i ? ' is-today' : '')}
                  onClick={() => { setVm(i); setView('day'); }}>{mn}</button>
              ))}
            </div>
          )}

          {view === 'year' && (
            <div className="dp-grid dp-grid--my">
              {Array.from({ length: 12 }, (_, i) => yearStart + i).map((y) => (
                <button key={y} type="button"
                  className={'dp-my' + (sel && sel.getFullYear() === y ? ' is-sel' : '') + (today.getFullYear() === y ? ' is-today' : '')}
                  onClick={() => { setVy(y); setView('month'); }}>{y}</button>
              ))}
            </div>
          )}

          <div className="dp-foot">
            <button type="button" className="dp-foot__btn" onClick={() => pick(today)}>Сегодня</button>
            {sel && <button type="button" className="dp-foot__btn dp-foot__btn--dim" onClick={() => { onChange(''); setOpen(false); }}>Очистить</button>}
          </div>
        </div>
      )}
    </div>
  );
}

function PrevRow({ icon, label, value, hot, accent }) {
  return (
    <div className={'prev__row' + (hot ? ' is-hot' : '')}>
      <span className="prev__ico"><Icon name={icon} size={15} /></span>
      <div className="grow" style={{ minWidth: 0 }}>
        <div className="prev__k">{label}</div>
        <div className={'prev__v' + (accent ? ' prev__v--accent' : '')}>{value}</div>
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  const router = useRouter();
  const { user, addOrder, notify } = useApp();

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(null); // созданная заявка (экран успеха)

  const [objectType, setObjectType] = useState('');
  const [subtype, setSubtype] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('Москва');
  const [stage, setStage] = useState('P');
  const [scale, setScale] = useState('team');
  const [sel, setSel] = useState([]);
  const [budget, setBudget] = useState('');
  const [due, setDue] = useState('');
  const [byOffer, setByOffer] = useState(true);
  const [files, setFiles] = useState(0);

  useEffect(() => { if (!user) router.push('/auth'); }, [user, router]);

  // Реальная таксономия разделов по стадии и типу (ПП РФ №87).
  // ВАЖНО: все хуки — до любого условного return (Rules of Hooks).
  const flatSections = useMemo(() => {
    if (!objectType) return [];
    const s = getSections(stage, objectType);
    if (Array.isArray(s) && s.length && 'sections' in s[0]) return s.flatMap((g) => g.sections);
    return s;
  }, [objectType, stage]);

  if (!user) return null;

  const toggle = (code) => setSel((p) => (p.includes(code) ? p.filter((x) => x !== code) : [...p, code]));
  const scaleLabel = SCALE_SHORT[scale] || 'Команда';

  // Счётчик готовности 0..5 (BUG-011): пустая форма = 0/5, финальный шаг = 5/5.
  const filled = [
    !!objectType && !!title.trim(),                              // 1. Тип объекта
    step >= 1 && !!region && !!stage && !!scale,                 // 2. Регион и стадия
    sel.length > 0,                                              // 3. Разделы
    step >= 3 && (byOffer || isValidBudget(budget) || !!due),    // 4. Бюджет и сроки
    step >= 4,                                                   // 5. Файлы (опциональны)
  ].filter(Boolean).length;
  const exempt = objectType === 'private';

  const canNext = () => {
    if (step === 0) return !!objectType && !!title.trim();
    if (step === 2) return sel.length > 0;
    if (step === 3) return byOffer || isValidBudget(budget); // бюджет обязателен, если не «ждём предложений» (BUG-009)
    return true;
  };

  const publish = () => {
    const specialists = [...new Set(flatSections.filter((s) => sel.includes(s.code)).flatMap((s) => s.specialists))];
    // Подтип (назначение объекта) сохраняем в описании, т.к. отдельного поля в модели нет.
    const baseDesc = description.trim();
    const fullDescription = subtype && subtype !== 'Другое'
      ? (baseDesc ? `${subtype}. ${baseDesc}` : subtype)
      : baseDesc;
    const order = addOrder({
      title: title.trim() || 'Новая заявка',
      description: fullDescription,
      objectType,
      region,
      scale,
      stage,
      sections: sel,
      specialists,
      budget: byOffer ? 'Ждём предложений' : (budget.trim() ? formatMoney(budget) : 'По договорённости'),
      deadline: due.trim() || undefined,
      status: 'published',
    });
    setDone(order);
  };

  // ====== ЭКРАН УСПЕХА ======
  if (done) {
    return (
      <div className="fx animate-in">
        <div className="card" style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center', padding: 40 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 18px', display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', color: 'var(--green)' }}>
            <Icon name="checkCircle" size={40} strokeWidth={2} />
          </div>
          <h1 className="page-title" style={{ marginBottom: 10 }}>Заявка опубликована!</h1>
          <p className="muted" style={{ margin: '0 auto 24px', maxWidth: 420, lineHeight: 1.6 }}>
            Заявка «{done.title}» создана и доступна проектировщикам. Ожидайте первые отклики.
          </p>
          <div className="prev__rows" style={{ textAlign: 'left', marginBottom: 24 }}>
            <PrevRow icon="building" label="Тип объекта" value={subtype && subtype !== 'Другое' ? TYPE_LABEL[objectType] + ' · ' + subtype : TYPE_LABEL[objectType]} />
            <PrevRow icon="pin" label="Регион" value={region} />
            <PrevRow icon="layers" label="Стадия / привлечение" value={(STAGE_LABELS[stage] || stage) + ' · ' + scaleLabel} />
            <PrevRow icon="file" label="Разделов" value={sel.length + ' шт.'} />
          </div>
          <div className="row gap10" style={{ justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => router.push('/orders')}>К списку заявок</button>
            <button className="btn btn-primary" onClick={() => router.push(`/orders/detail?id=${done.id}`)}>Открыть заявку <Icon name="arrowRight" size={14} /></button>
          </div>
        </div>
      </div>
    );
  }

  // ====== МАСТЕР ======
  return (
    <div className="fx animate-in">
      <div className="breadcrumb"><a className="link" onClick={() => router.push('/orders')}>Заявки</a><Icon name="chevR" size={13} /> <span className="dim">Новая заявка</span></div>
      <h1 className="page-title" style={{ margin: '16px 0 26px' }}>Создание заявки</h1>

      <div className="stepper">
        {STEPS.map((s, i) => (
          <div key={s} className={'stepper__item' + (i === step ? ' is-active' : '') + (i < step ? ' is-done' : '')} onClick={() => i < step && setStep(i)}>
            <div className="stepper__num">{i < step ? <Icon name="check" size={14} /> : i + 1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <div className="newgrid">
        <div className="card">
          {step === 0 && <div className="col gap20 fade-in">
            <div className="field">
              <label>Название заявки</label>
              <input className="input" placeholder="Например: ЖК «Северный парк», корпус 2" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="col gap12">
              <h3 className="section-title">Тип объекта</h3>
              <div className="grid-2">
                {TYPE_CARDS.map(([v, ic, t, d]) => (
                  <button type="button" key={v} className={'selectcard' + (v === objectType ? ' is-sel' : '')} onClick={() => { setObjectType(v); setSubtype(SUBTYPES[v][0]); setSel([]); }}>
                    <span className="selectcard__ic"><Icon name={ic} size={20} /></span>
                    <b>{t}</b>
                    <span className="sc-d">{d}</span>
                  </button>
                ))}
              </div>
            </div>

            {objectType && (
              <div className="field fade-in" key={objectType}>
                <label>Назначение объекта</label>
                <div className="row gap10 wrap pillpick--amber">
                  {SUBTYPES[objectType].map((s) => (
                    <button key={s} type="button" className={'pill' + (s === subtype ? ' is-active' : '')} onClick={() => setSubtype(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {objectType && (
              <div className="hintbar" style={{ borderLeftColor: exempt ? 'var(--green)' : 'var(--blue)' }}>
                <Icon name={exempt ? 'checkCircle' : 'shield'} size={18} style={{ color: exempt ? 'var(--green)' : 'var(--blue)' }} />
                <div>{exempt
                  ? <><b>Экспертиза не требуется.</b> Для индивидуального жилого дома проектная документация не подлежит обязательной экспертизе.</>
                  : <><b>Потребуется экспертиза.</b> Объект капитального строительства — документация проходит государственную или негосударственную экспертизу.</>}</div>
              </div>
            )}
          </div>}

          {step === 1 && <div className="col gap18 fade-in">
            <h3 className="section-title">Регион и стадия</h3>
            <div className="field"><label>Регион</label>
              <select className="input" value={region} onChange={(e) => setRegion(e.target.value)}>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="field"><label>Стадия проектирования</label>
              <div className="secpick secpick--amber">
                {STAGES.map(([v, code, name]) => (
                  <button key={v} type="button" className={'secpick__item' + (v === stage ? ' is-sel' : '')} onClick={() => { setStage(v); setSel([]); }}>
                    <span className="secpick__code">{code}</span>
                    <span className="secpick__name">{name}</span>
                    <span className="secpick__check"><Icon name="check" size={13} /></span>
                  </button>
                ))}
              </div>
            </div>
            <div className="field"><label>Тип привлечения</label>
              <div className="row gap10 wrap pillpick--amber">
                {SCALES.map(([v, l]) => <button key={v} type="button" className={'pill' + (v === scale ? ' is-active' : '')} onClick={() => setScale(v)}>{l}</button>)}
              </div>
            </div>
          </div>}

          {step === 2 && <div className="col gap16 fade-in">
            <div className="row between" style={{ alignItems: 'baseline' }}>
              <h3 className="section-title">Разделы документации</h3>
              <span className="dim" style={{ fontSize: 13 }}>Выбрано: {sel.length} из {flatSections.length}</span>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>Отметьте разделы документации под стадию «{STAGE_LABELS[stage] || stage}» и тип «{TYPE_LABEL[objectType]}».</p>
            <div className="secpick secpick--amber">
              {flatSections.map((s) => (
                <button key={s.code} type="button" className={'secpick__item' + (sel.includes(s.code) ? ' is-sel' : '')} onClick={() => toggle(s.code)}>
                  <span className="secpick__code">{s.code}</span>
                  <span className="secpick__name">{s.name}</span>
                  <span className="secpick__check"><Icon name="check" size={13} /></span>
                </button>
              ))}
            </div>
          </div>}

          {step === 3 && <div className="col gap18 fade-in">
            <h3 className="section-title">Бюджет и сроки</h3>
            <div className="field"><label>Бюджет, ₽</label>
              <input className="input" inputMode="numeric" placeholder="12 000 000" value={budget} disabled={byOffer} style={{ opacity: byOffer ? 0.5 : 1 }} onChange={(e) => setBudget(e.target.value.replace(/[^\d\s]/g, ''))} />
              {!byOffer && budget.trim() && !isValidBudget(budget) && <span style={{ fontSize: 11, color: 'var(--red)', marginTop: 4, display: 'block' }}>Введите сумму числом</span>}
            </div>
            <div className="field"><label>Срок выполнения</label><DateField value={due} onChange={setDue} placeholder="Выберите дату" /></div>
            <label className="row gap10" style={{ fontSize: 14, cursor: 'pointer' }}><input type="checkbox" checked={byOffer} onChange={(e) => setByOffer(e.target.checked)} /> Ждём предложений по цене</label>
          </div>}

          {step === 4 && <div className="col gap18 fade-in">
            <div className="field">
              <label>Описание задачи</label>
              <textarea className="input" rows={5} style={{ minHeight: 120, resize: 'vertical' }} placeholder="Опишите задачу в свободной форме: особенности объекта, пожелания к решению, требования к исполнителю, важные сроки…" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="field">
              <label>Файлы проекта</label>
              <button type="button" className="dropzone" style={{ width: '100%', cursor: 'pointer' }} onClick={() => { setFiles((f) => f + 1); notify('Загрузка файлов — в разработке'); }}><Icon name="paperclip" size={26} /><div>Перетащите файлы DWG, IFC, PDF или нажмите для выбора</div></button>
              {files > 0 && <div className="muted" style={{ fontSize: 13.5 }}>Прикреплено файлов: {files}</div>}
            </div>
          </div>}

          <div className="row between mt32">
            <button className="btn btn-ghost" disabled={step === 0} style={{ opacity: step === 0 ? 0.4 : 1 }} onClick={() => setStep((s) => Math.max(0, s - 1))}>Назад</button>
            {step < STEPS.length - 1
              ? <button className="btn btn-primary" disabled={!canNext()} style={{ opacity: canNext() ? 1 : 0.5 }} onClick={() => setStep((s) => s + 1)}>Далее</button>
              : <button className="btn btn-primary" onClick={publish}>Опубликовать заявку</button>}
          </div>
        </div>

        <div className="card newgrid__preview prev">
          <div className="row between" style={{ marginBottom: 16 }}>
            <span className="overline">Предпросмотр заявки</span>
            <span className="prev__count">{filled}<span className="dim">/5</span></span>
          </div>
          <div className="prev__cover"><Mascots scale={0.4} /></div>
          <h3 style={{ margin: '0 0 4px', fontSize: 17, color: '#fff' }}>{title.trim() || 'Новая заявка'}</h3>
          <div className="dim" style={{ fontSize: 12.5, marginBottom: 16 }}>Стадия {STAGE_LABELS[stage] || stage} · {scaleLabel}</div>

          <div className="prev__rows">
            <PrevRow icon="building" label="Тип объекта" value={objectType ? (subtype && subtype !== 'Другое' ? TYPE_LABEL[objectType] + ' · ' + subtype : TYPE_LABEL[objectType]) : '—'} hot={step === 0} />
            <PrevRow icon="pin" label="Регион" value={region || '—'} hot={step === 1} />
            <PrevRow icon="layers" label="Стадия / привлечение" value={(STAGE_LABELS[stage] || stage) + ' · ' + scaleLabel} hot={step === 1} />
            {sel.length > 0 && (
              <div className={'prev__row' + (step === 2 ? ' is-hot' : '')}>
                <span className="prev__ico"><Icon name="file" size={15} /></span>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="prev__k">Разделы · {sel.length}</div>
                  <div className="chips" style={{ marginTop: 6 }}>{sel.map((s) => <span key={s} className="chip chip-code">{s}</span>)}</div>
                </div>
              </div>
            )}
            {(budget || due || byOffer) && <PrevRow icon="calendar" label="Срок" value={formatDeadline(due)} hot={step === 3} />}
            {files > 0 && <PrevRow icon="paperclip" label="Файлы" value={files + ' шт.'} hot={step === 4} />}
            {description.trim() && <PrevRow icon="edit" label="Описание" value="в свободной форме" hot={step === 4} />}
          </div>

          <div className="prev__price">
            {byOffer || !budget
              ? <span className="row gap8" style={{ color: 'var(--amber)', fontWeight: 700, fontSize: 18 }}><Icon name="wallet" size={18} />Ждём предложений</span>
              : <span className="price" style={{ fontSize: 22 }}><Icon name="wallet" size={18} style={{ color: 'var(--accent-2)' }} /> {formatMoney(budget)}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
