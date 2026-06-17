// @ts-nocheck
'use client';

import { useState, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { REGIONS } from '@/lib/constants';
import { useApp } from '@/lib/store';
import projBg from '@/public/project-buildings.png';
import { Icon } from '../../_orders/icons';
import '../../_orders/orders.css';

// --- Типы и Моковые данные ---
type Expert = {
  id: string;
  name: string;
  type: 'company' | 'person';
  services: string[];
  city: string;
  region?: string;
  accreditation: string;
  rating: number;
  reviewsLabel: string;
  reportsCount: number;
  yearsExperience: number;
  phone?: string;
  email?: string;
  achievements?: string[];
  description?: string;
};

const EXPERTISE_SERVICES = ['Негосударственная экспертиза ПД', 'Аудит смет', 'BIM/ТИМ контроль', 'Проверка узлов (КР)', 'Инженерные сети'];

const MOCK_EXPERTS: Expert[] = [
  {
    id: 'exp1',
    name: 'ООО «Эксперт-Регион»',
    type: 'company',
    services: ['Негосударственная экспертиза ПД', 'Аудит смет'],
    city: 'Москва',
    accreditation: 'Аккредитация МИНСТРОЙ №0015',
    rating: 4.9,
    reviewsLabel: 'Надёжно',
    reportsCount: 412,
    yearsExperience: 8,
    phone: '+7 495 222-33-44',
    email: 'info@expert-region.ru',
    achievements: ['400+ положительных заключений', 'Госзаказ', 'Сжатые сроки'],
    description: 'Полный комплекс услуг по негосударственной экспертизе ПД и инженерных изысканий.'
  },
  {
    id: 'exp2',
    name: 'Ковалёв Иван Иванович',
    type: 'person',
    services: ['Проверка узлов (КР)', 'Аудит смет'],
    city: 'Санкт-Петербург',
    accreditation: 'Специалист НРС №145122',
    rating: 4.8,
    reviewsLabel: 'Высокий рейтинг',
    reportsCount: 94,
    yearsExperience: 14,
    phone: '+7 911 345-67-89',
    email: 'kovalev.ii@expertaudit.ru',
    achievements: ['Аудит металлоконструкций', 'Оптимизация смет ДО 15%'],
  },
  {
    id: 'exp3',
    name: 'АО «BIM Технологии»',
    type: 'company',
    services: ['BIM/ТИМ контроль', 'Инженерные сети'],
    city: 'Казань',
    region: 'Республика Татарстан',
    accreditation: 'ISO-19650 Сертификат',
    rating: 4.7,
    reviewsLabel: 'Инновации',
    reportsCount: 156,
    yearsExperience: 5,
    phone: '+7 843 125-45-67',
    email: 'hello@bimtech.audit',
    achievements: ['Коллизии', 'Моделирование', 'Снижение рисков'],
    description: 'Осуществляем независимый BIM-аудит (Navisworks, Revit) перед выдачей ПД в производство работ.'
  },
  {
    id: 'exp4',
    name: 'Ефремова Анна',
    type: 'person',
    services: ['Инженерные сети', 'BIM/ТИМ контроль'],
    city: 'Новосибирск',
    accreditation: 'Инженер-эксперт ПБ',
    rating: 5.0,
    reviewsLabel: 'Топ-эксперт',
    reportsCount: 58,
    yearsExperience: 11,
    phone: '+7 923 111-22-33',
    achievements: ['ВК', 'ОВиК', 'Пожарная безопасность']
  },
  {
    id: 'exp5',
    name: 'Центр Сметного Аудита',
    type: 'company',
    services: ['Аудит смет', 'Негосударственная экспертиза ПД'],
    city: 'Краснодар',
    accreditation: 'Лицензия №24/11',
    rating: 4.6,
    reviewsLabel: 'Стабильно',
    reportsCount: 812,
    yearsExperience: 18,
    achievements: ['Крупные ГОС-объекты', 'Дотошная проверка']
  }
];

const EXPERTISE_PROJECTS = [
  { id: 'ep1', title: 'ЖК "Симфония"', location: 'г. Москва', count: '14 разделов' },
  { id: 'ep2', title: 'Складской комплекс', location: 'МО, Химки', count: 'КР, ОВиК' },
  { id: 'ep3', title: 'Школа на 1200 мест', location: 'Новосибирск', count: 'Полная экспертиза' },
];

const AVATAR_COLORS = [
  ['#10b981', '#047857'],   // Emerald
  ['#3b82f6', '#1d4ed8'],   // Blue
  ['#8b5cf6', '#6d28d9'],   // Purple
  ['#f59e0b', '#b45309'],   // Amber
  ['#ef4444', '#b91c1c'],   // Red
];

// Подсказки-чипсы (фильтры одним кликом), как ExpertHints в эталоне.
const EXPERT_HINTS: [string, string, (e: Expert) => boolean][] = [
  ['shield', 'Негос. экспертиза', (e) => e.services.some((t) => t.toLowerCase().includes('экспертиза'))],
  ['bim', 'BIM / ТИМ', (e) => e.services.some((t) => t.includes('BIM'))],
  ['building', 'Только организации', (e) => e.type === 'company'],
  ['checkCircle', '100+ проверок', (e) => e.reportsCount >= 100],
];

const RATE_STEPS: [string, number, string][] = [
  ['Любой', 0, '#9ca3af'],
  ['4.0+', 4.0, '#f5b13d'],
  ['4.5+', 4.5, '#facc15'],
  ['4.8+', 4.8, '#34d399'],
];

const grad = (g: string[]) => ({ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` });

// --- Инлайн-компоненты дизайна (самодостаточны, без общих файлов) ---

/* Фото-аватар в стиле главной: ободок + индикатор + fallback на градиент с инициалами. */
function PhotoAva({ e, size = 44, ring = true, dot }: { e: Expert; size?: number; ring?: boolean; dot?: boolean }) {
  const g = AVATAR_COLORS[MOCK_EXPERTS.indexOf(e) % AVATAR_COLORS.length] || AVATAR_COLORS[0];
  const initials = e.type === 'company'
    ? e.name.replace(/[^А-ЯA-Z]/g, '').slice(0, 2) || e.name.slice(0, 2).toUpperCase()
    : e.name.replace(/[^А-ЯA-Z]/g, '').slice(0, 2);
  return (
    <span className={'tl-avatar' + (ring ? ' tl-avatar--ring' : '')}
      style={{ width: size, height: size, fontSize: size * 0.36, ...grad(g) }}>
      <span className="tl-avatar__fb">{initials}</span>
      {dot && <span className="tl-avatar__dot" />}
    </span>
  );
}

function Stars({ v }: { v: number | string }) {
  return (
    <span className="row gap6" style={{ fontSize: 13.5, color: 'var(--text-dim)' }}>
      <Icon name="star" size={14} style={{ color: 'var(--amber)' }} />{v}
    </span>
  );
}

/* Стилизованная textarea-поиск, привязанная к реальному состоянию поиска страницы. */
function PromptSearch({ value, onChange, onSubmit, placeholder }) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const ta = taRef.current; if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [value]);

  const has = (value || '').trim().length > 0 || files.length > 0;
  const submit = () => {
    if (!has || loading) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 1400);
    if (onSubmit) onSubmit();
  };
  const addFiles = (e) => {
    const list = Array.from(e.target.files || []) as File[];
    if (list.length) setFiles((p) => [...p, ...list]);
    e.target.value = '';
  };
  const removeFile = (i) => setFiles((p) => p.filter((_, idx) => idx !== i));

  return (
    <div className="psearch">
      {files.length > 0 && (
        <div className="psearch__files">
          {files.map((f, i) => (
            <span key={i} className="psearch__file">
              <Icon name="paperclip" /><b>{f.name}</b>
              <button onClick={() => removeFile(i)} aria-label="Убрать"><Icon name="x" size={13} /></button>
            </span>
          ))}
        </div>
      )}
      <textarea ref={taRef} rows={1} className="psearch__ta" value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Опишите, какая экспертиза нужна…'}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }} />
      <div className="psearch__bar">
        <label className="psearch__act psearch__attach" data-tip="Прикрепить файлы">
          <input ref={fileRef} type="file" multiple hidden onChange={addFiles} />
          <Icon name="paperclip" />
        </label>
        <span className="psearch__spacer" />
        <button className={'psearch__act psearch__send' + (has ? ' is-on' : '')} disabled={!has}
          data-tip={loading ? 'Остановить' : 'Найти'} onClick={submit} aria-label="Найти">
          {loading ? <span className="psearch__sq" /> : <Icon name="send" />}
        </button>
      </div>
    </div>
  );
}

/* Шкала минимального рейтинга, привязана к фильтру rate. */
function RateScale({ value, onPick }) {
  return (
    <div className="ratescale" title="Минимальный рейтинг">
      {RATE_STEPS.map(([label, v, c]) => (
        <button key={label} className={value === v ? 'is-on' : ''} style={{ '--dot': c } as any} onClick={() => onPick(v)}><i />{label}</button>
      ))}
    </div>
  );
}

/* Подсказки-фильтры одним кликом. */
function ExpertHints({ active, onPick }) {
  return (
    <div className="cat-hints">
      {EXPERT_HINTS.map(([ic, label], i) => (
        <button key={label} className={'cat-hint' + (active === i ? ' is-on' : '')} onClick={() => onPick(active === i ? null : i)}>
          <Icon name={ic} size={14} />{label}
        </button>
      ))}
    </div>
  );
}

/* Карточка эксперта — по принципу PersonCard проектировщиков. */
function ExpertCard({ e, onOpen, onChoose }: { e: Expert; onOpen: () => void; onChoose: () => void }) {
  const featured = e.id === MOCK_EXPERTS[0].id;
  return (
    <div className={'card card-hover personcard' + (featured ? ' is-featured' : '')} onClick={onOpen}>
      <div className="row gap12" style={{ marginBottom: 14 }}>
        <PhotoAva e={e} dot={e.type === 'person'} />
        <div style={{ minWidth: 0 }}>
          <div className="row gap8 wrap" style={{ fontWeight: 700, fontSize: 15 }}>
            {e.name}
            {featured && <span className="row" style={{ gap: 4, color: 'var(--green)', fontSize: 12.5, fontWeight: 600 }}><Icon name="check" size={14} />Лидер отрасли</span>}
          </div>
          <div className="chips" style={{ marginTop: 6 }}>{e.services.map((t) => <span key={t} className="chip">{t}</span>)}</div>
        </div>
      </div>
      <div className="col gap8 muted" style={{ fontSize: 13.5, marginBottom: 14 }}>
        <span className="row gap6"><Icon name="pin" size={14} />{e.city}</span>
        {e.accreditation && <span className="row gap6"><Icon name="cert" size={14} />{e.accreditation}</span>}
        <span className="row gap16"><Stars v={e.rating} /><span className="row gap6"><Icon name="checkCircle" size={14} style={{ color: 'var(--green)' }} />{e.reportsCount} проверок</span></span>
      </div>
      <div className="row gap8">
        <button className="btn btn-ghost btn-sm grow" onClick={(ev) => { ev.stopPropagation(); onOpen(); }}>Открыть профиль</button>
        <button className="btn btn-primary btn-sm" onClick={(ev) => { ev.stopPropagation(); onChoose(); }}>Выбрать <Icon name="arrowRight" size={14} /></button>
      </div>
    </div>
  );
}

export default function ExpertsPage() {
  const router = useRouter();
  const { notify } = useApp();
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');
  const [certOnly, setCertOnly] = useState(false);
  const [rate, setRate] = useState(0);
  const [hint, setHint] = useState<number | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(MOCK_EXPERTS[0]);

  const filtered = MOCK_EXPERTS.filter((e) => {
    const q = search.trim().toLowerCase();
    if (q && !e.name.toLowerCase().includes(q) && !e.city.toLowerCase().includes(q) && !e.services.join(' ').toLowerCase().includes(q)) return false;
    if (regionFilter && e.city !== regionFilter) return false;
    if (serviceFilter && !e.services.includes(serviceFilter)) return false;
    if (certOnly && !e.accreditation) return false;
    if (e.rating < rate) return false;
    if (hint != null && !EXPERT_HINTS[hint][2](e)) return false;
    return true;
  });

  const featured = MOCK_EXPERTS[0];
  const spot = selectedExpert || featured;

  const resetFilters = () => { setSearch(''); setRegionFilter(''); setServiceFilter(''); setCertOnly(false); setRate(0); setHint(null); };

  return (
    <div className="fx animate-in">
      {/* Заголовок каталога + фильтр-контролы */}
      <div className="cat-head">
        <div>
          <p className="cat-eyebrow">Экспертиза</p>
          <h1 className="cat-title">Эксперты<br />и BIM-контроль</h1>
          <p className="cat-lead">Аккредитованные эксперты и организации для проверки разделов, аудита смет и BIM/ТИМ-контроля. Выберите исполнителя под тип экспертизы.</p>
        </div>
        <div className="cat-head__filters">
          <div className="viewtoggle">
            <button className={viewMode === 'list' ? 'is-active' : ''} onClick={() => setViewMode('list')} title="Список"><Icon name="list" /></button>
            <button className={viewMode === 'cards' ? 'is-active' : ''} onClick={() => setViewMode('cards')} title="Карточки"><Icon name="columns" /></button>
          </div>
          <select className="pill" value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} style={{ appearance: 'none' }}>
            <option value="">Регион</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="pill" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} style={{ appearance: 'none' }}>
            <option value="">Тип проверки</option>
            {EXPERTISE_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className={'pill' + (certOnly ? ' is-active' : '')} onClick={() => setCertOnly((v) => !v)}><Icon name="cert" />Сертификаты</button>
          <button className="pill" onClick={() => notify('Расширенные фильтры — в разработке')}><Icon name="filter" />Фильтры</button>
        </div>
      </div>

      <div className="catalog">
        {/* Левая колонка: поиск, подсказки, рейтинг-шкала, счётчик, сетка карточек */}
        <div className="col gap16" style={{ minWidth: 0 }}>
          <PromptSearch value={search} onChange={setSearch} placeholder="Опишите, какая экспертиза нужна…" />
          <ExpertHints active={hint} onPick={setHint} />
          <div className="row gap12 wrap between">
            <RateScale value={rate} onPick={setRate} />
            <span className="dim" style={{ fontSize: 13 }}>Найдено: {filtered.length} из {MOCK_EXPERTS.length}</span>
          </div>

          {filtered.length ? (
            <div className="orders-grid">
              {filtered.map((e) => (
                <ExpertCard
                  key={e.id}
                  e={e}
                  onOpen={() => setSelectedExpert(e)}
                  onChoose={() => router.push('/expertise')}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <p className="muted" style={{ margin: '0 0 16px', fontSize: 14.5 }}>По заданным условиям никого не нашлось.</p>
              <button className="btn btn-outline btn-sm" onClick={resetFilters}>Сбросить фильтры</button>
            </div>
          )}
        </div>

        {/* Правая колонка: spotlight выбранного эксперта + статистика + заключения */}
        <div className="col gap20">
          {spot && (
            <div className="card spotlight">
              <div style={{ display: 'flex', justifyContent: 'center' }}><PhotoAva e={spot} size={84} dot={spot.type === 'person'} /></div>
              <h3 style={{ textAlign: 'center', margin: '16px 0 8px', fontSize: 18 }}>{spot.name}</h3>
              <div className="chips" style={{ justifyContent: 'center', marginBottom: 12 }}>{spot.services.map((t) => <span key={t} className="chip">{t}</span>)}</div>
              <div className="col gap8 muted" style={{ fontSize: 13.5, textAlign: 'center', marginBottom: 16 }}>
                {spot.accreditation && <span className="row gap6" style={{ justifyContent: 'center' }}><Icon name="cert" size={14} />{spot.accreditation}</span>}
                {spot.phone && <span className="row gap6" style={{ justifyContent: 'center' }}><Icon name="phone" size={14} />{spot.phone}</span>}
                <span className="row gap6" style={{ justifyContent: 'center' }}><Icon name="pin" size={14} />{spot.city}</span>
              </div>
              {spot.description && <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 16px' }}>{spot.description}</p>}
              <button className="btn btn-primary btn-block" onClick={() => notify('Сообщения — в разработке')}>Связаться</button>
              <button className="btn btn-outline btn-block mt12" onClick={() => notify('Запрос договора — в разработке')}>Запросить договор</button>
            </div>
          )}

          <div className="card">
            <h3 className="row gap8 section-title" style={{ fontSize: 16, marginBottom: 14 }}><Icon name="chart" size={17} style={{ color: 'var(--accent-2)' }} />Статистика</h3>
            <div className="col gap10 muted" style={{ fontSize: 13.5 }}>
              <span className="row gap6"><Icon name="pin" size={14} />{spot?.city}, работа по всей РФ</span>
              <span className="row gap16"><Stars v={spot?.rating ?? 4.8} /><span>{spot?.reportsCount} заключений · {spot?.yearsExperience} лет</span></span>
              {['Допуск к объектам гос. значения', 'Проверка сметной документации', 'Полная материальная ответственность'].map((t) => (
                <span key={t} className="row gap8"><Icon name="check" size={14} style={{ color: 'var(--green)' }} />{t}</span>
              ))}
            </div>
            <button className="btn btn-outline btn-sm btn-block mt16" onClick={() => router.push('/expertise')}>Смотреть все</button>
          </div>

          <div className="card">
            <h3 className="section-title" style={{ fontSize: 16, marginBottom: 14 }}>Последние заключения</h3>
            <div className="grid-2" style={{ gap: 12 }}>
              {EXPERTISE_PROJECTS.map((p) => (
                <div key={p.id}>
                  <div style={{
                    height: 76,
                    borderRadius: 10,
                    backgroundImage: `url(${projBg.src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: p.id === 'ep1' ? 'center' : p.id === 'ep2' ? 'top right' : 'bottom left',
                    filter: 'grayscale(20%)'
                  }} />
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>{p.title}</div>
                  <div className="dim" style={{ fontSize: 12 }}>{p.count}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-outline btn-sm btn-block mt16" onClick={() => notify('Заключения эксперта — в разработке')}>Все заключения эксперта →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
